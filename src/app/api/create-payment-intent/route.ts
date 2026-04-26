import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import Vaccine from "@/models/Vaccine";
import Service from "@/models/Service";
import { reserveStock, releaseStock, getAvailableStock } from "@/lib/actions/inventory";
import SlotConfig from "@/models/SlotConfig";
import mongoose from "mongoose";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            vaccineId,
            date,
            time,
            customerName,
            customerEmail,
            customerPhone,
            notes,
        } = body;

        // Validate required fields
        if (!vaccineId || !date || !time || !customerName || !customerEmail || !customerPhone) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(vaccineId)) {
            return NextResponse.json(
                { error: "Invalid appointment service selected. Please refresh and try again." },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // 1. Verify vaccine or service exists and get price
        let item = await Vaccine.findById(vaccineId).catch(() => null);
        if (!item) {
            item = await Service.findById(vaccineId).catch(() => null);
        }
        
        const price = (item as any)?.price ?? 0;

        if (!item) {
            return NextResponse.json(
                { error: "Service or Vaccine not found" },
                { status: 404 }
            );
        }

        // 2. Check slot availability
        const [y, m, d] = date.split("-").map(Number);
        const slotDate = new Date(Date.UTC(y, m - 1, d));
        slotDate.setUTCHours(0, 0, 0, 0);

        let config = await SlotConfig.findOne();
        if (!config) {
            config = await SlotConfig.create({});
        }

        // ─── Lightweight cleanup to keep checkout fast ───
        // Fast-path: cancel expired pending appointments that do not hold reserved stock.
        await Appointment.updateMany(
            {
                status: "PENDING",
                lockedUntil: { $lte: new Date() },
                batchId: { $exists: false },
            },
            {
                $set: {
                    status: "CANCELLED",
                    paymentStatus: "FAILED",
                },
                $unset: {
                    lockedUntil: "",
                },
            }
        );

        // Slow-path: process only a small batch with inventory locks to avoid long checkout latency.
        const expiredPendingWithBatch = await Appointment.find(
            {
                status: "PENDING",
                lockedUntil: { $lte: new Date() },
                batchId: { $exists: true, $ne: null },
            },
            { _id: 1, vaccineId: 1, batchId: 1 }
        )
            .sort({ lockedUntil: 1 })
            .limit(10)
            .lean();

        for (const expired of expiredPendingWithBatch) {
            try {
                await releaseStock(
                    String(expired.vaccineId),
                    String(expired.batchId),
                    String(expired._id)
                );
            } catch (e) {
                console.error(`Failed to release stock for expired appointment ${expired._id}:`, e);
            }

            await Appointment.updateOne(
                { _id: expired._id, status: "PENDING" },
                {
                    $set: {
                        status: "CANCELLED",
                        paymentStatus: "FAILED",
                    },
                    $unset: {
                        lockedUntil: "",
                    },
                }
            );
        }

        // Count existing confirmed + actively locked bookings for this slot
        const startOfDay = new Date(slotDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(slotDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingCount = await Appointment.countDocuments({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            slotTime: time,
            status: { $in: ["CONFIRMED"] },
        });

        const blockedCount = await Appointment.countDocuments({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            slotTime: time,
            status: "BLOCKED",
        });

        const lockedCount = await Appointment.countDocuments({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            slotTime: time,
            status: "PENDING",
            lockedUntil: { $gt: new Date() },
        });

        if (blockedCount > 0) {
            return NextResponse.json(
                { error: "This time slot is no longer available" },
                { status: 409 }
            );
        }

        if (existingCount + lockedCount >= config.capacityPerSlot) {
            return NextResponse.json(
                { error: "This time slot is no longer available" },
                { status: 409 }
            );
        }

        // 3. Check inventory availability
        //    Skip if no batches exist for this vaccine (inventory not configured yet)
        let hasInventory = false;
        const Batch = (await import("@/models/Batch")).default;
        const batchCount = await Batch.countDocuments({
            vaccineId: new mongoose.Types.ObjectId(vaccineId),
        });
        hasInventory = batchCount > 0;

        if (hasInventory) {
            const availableStock = await getAvailableStock(vaccineId);
            if (availableStock <= 0) {
                return NextResponse.json(
                    { error: "This vaccine is currently out of stock" },
                    { status: 409 }
                );
            }
        }

        // 4. Create PENDING appointment with lock
        const lockMinutes = config.lockMinutes || 10;
        const lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);

        const appointment = await Appointment.create({
            vaccineId,
            slotDate,
            slotTime: time,
            customerName,
            customerEmail: customerEmail.toLowerCase(),
            customerPhone,
            notes: notes || undefined,
            status: "PENDING",
            paymentStatus: "UNPAID",
            amountPaid: price,
            lockedUntil,
        });

        // 5. Reserve inventory (FIFO) when inventory is configured
        if (hasInventory) {
            const stockResult = await reserveStock(
                vaccineId,
                appointment._id.toString()
            );

            if (!stockResult.success) {
                // Rollback appointment if stock reservation fails
                await Appointment.findByIdAndDelete(appointment._id);
                return NextResponse.json(
                    { error: stockResult.error || "Failed to reserve stock" },
                    { status: 409 }
                );
            }

            // Update appointment with batch ID
            appointment.batchId = stockResult.batch._id;
            await appointment.save();
        }

        // 6. Check if we are in Mock Mode
        const stripeKey = process.env.STRIPE_SECRET_KEY || "";
        const isMockMode =
            !stripeKey ||
            stripeKey.includes("mock_key") ||
            stripeKey.includes("HERE") ||
            stripeKey.includes("YOUR") ||
            stripeKey.includes("PLACEHOLDER") ||
            stripeKey.includes("xxx") ||
            stripeKey === "sk_test_mock_key_for_build" ||
            stripeKey.length < 20;

        if (isMockMode || price <= 0) {
            console.log(`${price <= 0 ? "Free Booking" : "Mock Payment"} Mode Active — Appointment ID:`, appointment._id);
            return NextResponse.json({
                clientSecret: "free_or_mock_secret_" + Date.now(),
                appointmentId: appointment._id.toString(),
                isMock: true,
            });
        }

        // 7. Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(price * 100), // pence
            currency: "gbp",
            automatic_payment_methods: { enabled: true },
            metadata: {
                appointmentId: appointment._id.toString(),
                vaccineId: vaccineId,
                customerEmail: customerEmail.toLowerCase(),
                customerName,
            },
        });

        // Update appointment with payment intent ID
        appointment.paymentIntentId = paymentIntent.id;
        await appointment.save();

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            appointmentId: appointment._id.toString(),
            isMock: false,
        });
    } catch (error: unknown) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
