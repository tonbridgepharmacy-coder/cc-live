"use server";

import dbConnect from "@/lib/db";
import Booking, { IBooking } from "@/models/Booking";
import Appointment, { type AppointmentStatus } from "@/models/Appointment";
import "@/models/Vaccine";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import Vaccine from "@/models/Vaccine";
import { handleConfirmedAppointmentAutomation } from "@/lib/appointmentAutomation";
import { sendEmail } from "@/lib/email";
import { format } from "date-fns";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

// Get legacy bookings
export async function getBookings() {
    const conn = await dbConnect();
    if (!conn) return [];
    const bookings = await Booking.find({}).sort({ bookingDate: -1 }).lean();
    return JSON.parse(JSON.stringify(bookings));
}

// Get new-style appointments
export async function getAppointments(filter?: Record<string, unknown>) {
    const conn = await dbConnect();
    if (!conn) return [];
    const appointments = await Appointment.find(filter || {})
        .populate("vaccineId", "title price")
        .sort({ slotDate: -1 })
        .lean();
    return JSON.parse(JSON.stringify(appointments));
}

export async function createBooking(data: Partial<IBooking>) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        const newBooking = await Booking.create(data);
        revalidatePath("/admin/appointments");
        return { success: true, data: JSON.parse(JSON.stringify(newBooking)) };
    } catch (error: unknown) {
        console.error("Error creating booking:", error);
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function updateBookingStatus(id: string, status: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Booking.findByIdAndUpdate(id, { status });
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) return { success: false, error: "Appointment not found" };
        const wasConfirmed = appointment.status === "CONFIRMED";

        // Handle inventory changes
        if (status === "CANCELLED" && appointment.batchId) {
            const { releaseStock } = await import("@/lib/actions/inventory");
            await releaseStock(
                appointment.vaccineId.toString(),
                appointment.batchId.toString(),
                id
            );
        }

        if (status === "COMPLETED" && appointment.batchId) {
            const { consumeStock } = await import("@/lib/actions/inventory");
            await consumeStock(
                appointment.vaccineId.toString(),
                appointment.batchId.toString(),
                id
            );
        }

        appointment.status = status as AppointmentStatus;
        await appointment.save();

        // Automatically create calendar event and admin notification on manual approval.
        if (status === "CONFIRMED" && !wasConfirmed) {
            const vaccine = await Vaccine.findById(appointment.vaccineId).select("title");
            await handleConfirmedAppointmentAutomation({
                appointment,
                serviceTitle: vaccine?.title || "Vaccination",
            });

            try {
                const dateLabel = format(new Date(appointment.slotDate), "EEEE, d MMMM yyyy");
                const meetSection = appointment.meetingLink
                    ? `<p style="margin: 0 0 10px;"><strong>Google Meet:</strong> <a href="${appointment.meetingLink}" style="color: #1d4ed8;">Join consultation</a></p>`
                    : "";
                const calendarSection = appointment.calendarEventLink
                    ? `<p style="margin: 0;"><strong>Calendar:</strong> <a href="${appointment.calendarEventLink}" style="color: #1d4ed8;">Open event</a></p>`
                    : "";

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
                        <div style="background: #1d4ed8; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                            <h1 style="margin: 0; font-size: 22px;">Appointment Confirmed</h1>
                            <p style="margin: 8px 0 0; opacity: 0.9;">Clarke &amp; Coleman Pharmacy</p>
                        </div>
                        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 22px; background: #f8fafc;">
                            <p>Dear ${appointment.customerName},</p>
                            <p>Your appointment has been approved and confirmed.</p>
                            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 16px 0;">
                                <p style="margin: 0 0 10px;"><strong>Service:</strong> ${vaccine?.title || "Vaccination"}</p>
                                <p style="margin: 0 0 10px;"><strong>Date:</strong> ${dateLabel}</p>
                                <p style="margin: 0 0 10px;"><strong>Time:</strong> ${appointment.slotTime}</p>
                                <p style="margin: 0 0 10px;"><strong>Reference:</strong> ${appointment._id}</p>
                                ${meetSection}
                                ${calendarSection}
                            </div>
                            <p style="color: #475569; font-size: 14px; margin: 0;">If you need to reschedule, please contact us as early as possible.</p>
                        </div>
                    </div>
                `;

                await sendEmail({
                    to: appointment.customerEmail,
                    subject: `Appointment Approved - ${format(new Date(appointment.slotDate), "d MMM yyyy")} at ${appointment.slotTime}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error("Failed to send approval confirmation email:", emailError);
            }
        }

        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

// Get appointment statistics for dashboard
export async function getAppointmentStats() {
    const conn = await dbConnect();
    if (!conn) return { total: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0, revenue: 0 };

    const [total, confirmed, completed, cancelled, pending] = await Promise.all([
        Appointment.countDocuments({}),
        Appointment.countDocuments({ status: "CONFIRMED" }),
        Appointment.countDocuments({ status: "COMPLETED" }),
        Appointment.countDocuments({ status: "CANCELLED" }),
        Appointment.countDocuments({ status: "PENDING" }),
    ]);

    const revenueResult = await Appointment.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return { total, confirmed, completed, cancelled, pending, revenue };
}

export async function deleteAppointment(id: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Appointment.findByIdAndDelete(id);
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function deleteBooking(id: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Booking.findByIdAndDelete(id);
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function updateAppointment(id: string, data: Record<string, unknown>) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Appointment.findByIdAndUpdate(id, data);
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function updateBooking(id: string, data: Record<string, unknown>) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Booking.findByIdAndUpdate(id, data);
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function createManualAppointment(data: {
    vaccineId: string;
    slotDate: string; // YYYY-MM-DD
    slotTime: string; // HH:mm
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
}) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };

    try {
        const { vaccineId, slotDate, slotTime } = data;

        if (!mongoose.Types.ObjectId.isValid(vaccineId)) {
            return { success: false, error: "Invalid vaccineId" };
        }

        if (!/^\d{2}:\d{2}$/.test(slotTime)) {
            return { success: false, error: "Invalid slotTime (expected HH:mm)" };
        }

        const slotDateObj = new Date(`${slotDate}T00:00:00`);
        if (Number.isNaN(slotDateObj.getTime())) {
            return { success: false, error: "Invalid slotDate (expected YYYY-MM-DD)" };
        }

        const { default: SlotConfig } = await import("@/models/SlotConfig");
        let config = await SlotConfig.findOne();
        if (!config) config = await SlotConfig.create({});

        const dayOfWeek = slotDateObj.getDay();
        if (config.closedDays?.includes(dayOfWeek)) {
            return { success: false, error: "Selected date is closed" };
        }

        const startOfDay = new Date(slotDateObj);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(slotDateObj);
        endOfDay.setHours(23, 59, 59, 999);

        const alreadyBlocked = await Appointment.countDocuments({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            slotTime,
            status: "BLOCKED",
        });
        if (alreadyBlocked > 0) {
            return { success: false, error: "This time slot is already blocked" };
        }

        // Note: we allow blocking even if already fully booked. This is useful if admin
        // wants the slot to remain unavailable even after cancellations.

        const safeName = (data.customerName || "Admin Block").trim() || "Admin Block";
        const safeEmail = (data.customerEmail || "admin-reserved@local.invalid").trim().toLowerCase();
        const safePhone = (data.customerPhone || "N/A").trim() || "N/A";

        const created = await Appointment.create({
            vaccineId,
            slotDate: slotDateObj,
            slotTime,
            customerName: safeName,
            customerEmail: safeEmail,
            customerPhone: safePhone,
            notes: data.notes,
            status: "BLOCKED" satisfies AppointmentStatus,
            paymentStatus: "UNPAID",
            amountPaid: 0,
            lockedUntil: undefined,
        });

        revalidatePath("/admin/appointments");
        return { success: true, data: JSON.parse(JSON.stringify(created)) };
    } catch (error: unknown) {
        console.error("Error creating manual appointment:", error);
        return { success: false, error: getErrorMessage(error) };
    }
}
