"use server";

import dbConnect from "@/lib/db";
import Booking, { IBooking } from "@/models/Booking";
import Appointment from "@/models/Appointment";
import { revalidatePath } from "next/cache";

// Get legacy bookings
export async function getBookings() {
    const conn = await dbConnect();
    if (!conn) return [];
    const bookings = await Booking.find({}).sort({ bookingDate: -1 }).lean();
    return JSON.parse(JSON.stringify(bookings));
}

// Get new-style appointments
export async function getAppointments(filter?: Record<string, any>) {
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
    } catch (error: any) {
        console.error("Error creating booking:", error);
        return { success: false, error: error.message };
    }
}

export async function updateBookingStatus(id: string, status: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        await Booking.findByIdAndUpdate(id, { status });
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    const conn = await dbConnect();
    if (!conn) return { success: false, error: "Database not connected" };
    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) return { success: false, error: "Appointment not found" };

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

        appointment.status = status as any;
        await appointment.save();
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
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
