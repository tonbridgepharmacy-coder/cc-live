"use server";

import dbConnect from "@/lib/db";
import Booking, { IBooking } from "@/models/Booking";
import { revalidatePath } from "next/cache";

export async function getBookings() {
    const conn = await dbConnect();
    if (!conn) return [];
    // Sort by bookingDate descending
    const bookings = await Booking.find({}).sort({ bookingDate: -1 }).lean();
    return JSON.parse(JSON.stringify(bookings));
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
