"use server";

import {
    updateAppointmentStatus,
    updateBookingStatus,
    deleteAppointment,
    deleteBooking,
    updateAppointment,
    updateBooking,
    createManualAppointment,
} from "@/lib/actions/booking";

export async function handleUpdateAppointmentStatus(formData: FormData) {
    const id = formData.get("appointmentId") as string;
    const status = formData.get("status") as string;
    await updateAppointmentStatus(id, status);
}

export async function handleUpdateBookingStatus(formData: FormData) {
    const id = formData.get("bookingId") as string;
    const status = formData.get("status") as string;
    await updateBookingStatus(id, status);
}

export async function handleDeleteAppointment(id: string) {
    await deleteAppointment(id);
}

export async function handleDeleteBooking(id: string) {
    await deleteBooking(id);
}

export async function handleEditAppointment(id: string, data: Record<string, unknown>) {
    await updateAppointment(id, data);
}

export async function handleEditBooking(id: string, data: Record<string, unknown>) {
    const customerName = typeof data["customerName"] === "string" ? data["customerName"] : "";
    const customerEmail = typeof data["customerEmail"] === "string" ? data["customerEmail"] : "";
    const customerPhone = typeof data["customerPhone"] === "string" ? data["customerPhone"] : "";

    const slotDateStr = typeof data["slotDate"] === "string" ? data["slotDate"] : "";

    const serviceNameRaw = typeof data["serviceName"] === "string" ? data["serviceName"] : undefined;
    let vaccineTitle: string | undefined;
    const vaccineObj = data["vaccineId"];
    if (vaccineObj && typeof vaccineObj === "object") {
        const title = (vaccineObj as Record<string, unknown>)["title"];
        if (typeof title === "string") vaccineTitle = title;
    }

    const updateData = {
        customerName,
        customerEmail,
        customerPhone,
        bookingDate: new Date(`${slotDateStr}T00:00:00`),
        serviceName: serviceNameRaw || vaccineTitle,
    };
    await updateBooking(id, updateData);
}

export async function handleManualReserve(formData: FormData) {
    const vaccineId = String(formData.get("vaccineId") || "");
    const slotDate = String(formData.get("slotDate") || "");
    const slotTime = String(formData.get("slotTime") || "");
    const customerName = String(formData.get("customerName") || "");
    const customerEmail = String(formData.get("customerEmail") || "");
    const customerPhone = String(formData.get("customerPhone") || "");
    const notes = String(formData.get("notes") || "");

    const result = await createManualAppointment({
        vaccineId,
        slotDate,
        slotTime,
        customerName,
        customerEmail,
        customerPhone,
        notes,
    });

    if (!result.success) {
        throw new Error(result.error || "Failed to reserve slot");
    }
}
