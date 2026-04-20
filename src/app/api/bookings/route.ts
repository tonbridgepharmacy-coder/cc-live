import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import "@/models/Vaccine";
import type { AppointmentStatus } from "@/models/Appointment";
import { releaseStock } from "@/lib/actions/inventory";
import { sendEmail } from "@/lib/email";
import { format } from "date-fns";
import { handleConfirmedAppointmentAutomation } from "@/lib/appointmentAutomation";
import Vaccine from "@/models/Vaccine";

type BookingRequestBody = {
    appointmentId?: string;
    service?: { title?: string; price?: number };
    date?: string;
    time?: string;
    customer?: {
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
    };
    paymentIntentId?: string;
};

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Internal Server Error";
}

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
    "PENDING",
    "BLOCKED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
];

function isAppointmentStatus(status: string): status is AppointmentStatus {
    return APPOINTMENT_STATUSES.includes(status as AppointmentStatus);
}

// GET: Fetch appointments (admin use)
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");

        const filter: Record<string, string> = {};
        if (status) filter.status = status;

        const appointments = await Appointment.find(filter)
            .populate("vaccineId", "title slug price")
            .sort({ slotDate: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            appointments: JSON.parse(JSON.stringify(appointments)),
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

// POST: Create booking for mock/free flow (when Stripe is in mock mode)
export async function POST(request: Request) {
    try {
        const body: BookingRequestBody = await request.json();
        const { appointmentId, service, date, time, customer, paymentIntentId } = body;

        await connectToDatabase();

        // If appointment already exists (created by payment-intent flow), just confirm it
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);
            if (appointment) {
                appointment.status = "CONFIRMED";
                appointment.paymentStatus = paymentIntentId ? "PAID" : "UNPAID";
                appointment.lockedUntil = undefined;
                await appointment.save();

                const vaccine = await Vaccine.findById(appointment.vaccineId).select("title");
                await handleConfirmedAppointmentAutomation({
                    appointment,
                    serviceTitle: vaccine?.title || "Vaccination",
                });

                // Send confirmation email
                try {
                    const emailHtml = `
                        <h1>Booking Confirmation</h1>
                        <p>Dear ${appointment.customerName},</p>
                        <p>Your appointment has been confirmed.</p>
                        <p><strong>Date:</strong> ${format(new Date(appointment.slotDate), "EEEE, d MMMM yyyy")}</p>
                        <p><strong>Time:</strong> ${appointment.slotTime}</p>
                        <p><strong>Reference:</strong> ${appointment._id}</p>
                        <br/>
                        <p>Clarke & Coleman Pharmacy Team</p>
                    `;

                    await sendEmail({
                        to: appointment.customerEmail,
                        subject: `Appointment Confirmed - ${format(new Date(appointment.slotDate), "d MMM yyyy")}`,
                        html: emailHtml,
                    });
                } catch (emailError) {
                    console.error("Email send failed:", emailError);
                }

                return NextResponse.json({ success: true, message: "Booking confirmed" });
            }
        }

        // Legacy flow: create a new booking directly (for backward compatibility)
        const bookingDate = new Date(`${date}T00:00:00`);
        if (time) {
            const [hours, minutes] = time.split(":").map(Number);
            bookingDate.setHours(hours, minutes);
        }

        const { default: Booking } = await import("@/models/Booking");

        await Booking.create({
            customerName: customer?.name || "Unknown",
            customerEmail: customer?.email || "unknown@example.com",
            customerPhone: customer?.phone || "Not provided",
            serviceName: service?.title || "Unknown",
            servicePrice: service?.price || 0,
            bookingDate,
            status: "confirmed",
            paymentStatus: paymentIntentId ? "paid" : "unpaid",
            paymentIntentId,
            notes: customer?.notes || undefined,
        });

        // Send confirmation email
        try {
            const emailHtml = `
                <h1>Booking Confirmation</h1>
                <p>Dear ${customer?.name || "Customer"},</p>
                <p>Your appointment for <strong>${service?.title}</strong> has been confirmed.</p>
                <p><strong>Date:</strong> ${format(new Date(date || bookingDate), "EEEE, d MMMM yyyy")}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Location:</strong> Clarke & Coleman Pharmacy, London</p>
                <br/>
                <p>Clarke & Coleman Pharmacy Team</p>
            `;

            await sendEmail({
                to: customer?.email || "",
                subject: `Appointment Confirmed - ${customer?.name || "Customer"}`,
                html: emailHtml,
            });
        } catch (emailError) {
            console.error("Email send failed:", emailError);
        }

        return NextResponse.json({ success: true, message: "Booking created" });
    } catch (error: unknown) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

// PATCH: Update appointment status (admin action)
export async function PATCH(request: Request) {
    try {
        const body: { appointmentId?: string; status?: string } = await request.json();
        const { appointmentId, status } = body;

        if (!appointmentId || !status) {
            return NextResponse.json(
                { error: "appointmentId and status are required" },
                { status: 400 }
            );
        }

        if (!isAppointmentStatus(status)) {
            return NextResponse.json(
                { error: "Invalid appointment status" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        // Handle cancellation: release inventory
        if (status === "CANCELLED" && appointment.batchId) {
            await releaseStock(
                appointment.vaccineId.toString(),
                appointment.batchId.toString(),
                appointmentId
            );
        }

        // Handle completion: consume stock
        if (status === "COMPLETED" && appointment.batchId) {
            const { consumeStock } = await import("@/lib/actions/inventory");
            await consumeStock(
                appointment.vaccineId.toString(),
                appointment.batchId.toString(),
                appointmentId
            );
        }

        appointment.status = status;
        await appointment.save();

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
