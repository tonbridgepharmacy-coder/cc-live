import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import Vaccine from "@/models/Vaccine";
import { reserveStock, getAvailableStock } from "@/lib/actions/inventory";
import SlotConfig from "@/models/SlotConfig";

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

        await connectToDatabase();

        // 1. Verify vaccine exists and get price
        let vaccine;
        
        if (vaccineId === "mock_consultation") {
            vaccine = {
                _id: "mock_consultation",
                price: 25,
                title: "General Consultation (Test)"
            } as any;
        } else {
            vaccine = await Vaccine.findById(vaccineId).catch(() => null);
        }

        if (!vaccine) {
            return NextResponse.json(
                { error: "Vaccine not found" },
                { status: 404 }
            );
        }

        // 2. Check slot availability
        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0);

        let config = await SlotConfig.findOne();
        if (!config) {
            config = await SlotConfig.create({});
        }

        // Count existing confirmed + locked bookings for this slot
        const startOfDay = new Date(slotDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(slotDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingCount = await Appointment.countDocuments({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            slotTime: time,
            status: { $in: ["CONFIRMED"] },
        });

        const lockedCount = await Appointment.countDocuments({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            slotTime: time,
            status: "PENDING",
            lockedUntil: { $gt: new Date() },
        });

        if (existingCount + lockedCount >= config.capacityPerSlot) {
            return NextResponse.json(
                { error: "This time slot is no longer available" },
                { status: 409 }
            );
        }

        // 3. Check inventory availability (skip for mock)
        if (vaccineId !== "mock_consultation") {
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
            amountPaid: vaccine.price,
            lockedUntil,
        });

        // 5. Reserve inventory (FIFO) -- Skip for mock
        let stockResult: any = { success: true, batch: { _id: "mock_batch" } };
        
        if (vaccineId !== "mock_consultation") {
            stockResult = await reserveStock(
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
        }

        // Update appointment with batch ID
        appointment.batchId = stockResult.batch._id;
        await appointment.save();

        // 6. Check if we are in Mock Mode
        const isMockMode =
            !process.env.STRIPE_SECRET_KEY ||
            process.env.STRIPE_SECRET_KEY.includes("mock_key");

        if (isMockMode) {
            console.log("Mock Payment Mode Active — Appointment ID:", appointment._id);
            return NextResponse.json({
                clientSecret: "mock_secret_" + Date.now(),
                appointmentId: appointment._id.toString(),
                isMock: true,
            });
        }

        // 7. Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(vaccine.price * 100), // pence
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
    } catch (error: any) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
