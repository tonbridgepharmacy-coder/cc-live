import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import "@/models/Vaccine";
import Vaccine from "@/models/Vaccine";
import Service from "@/models/Service";
import AppointmentsClient from "./AppointmentsClient";

import { 
    updateAppointmentStatus, 
    updateBookingStatus, 
    deleteAppointment, 
    deleteBooking,
    updateAppointment,
    updateBooking,
    createManualAppointment
} from "@/lib/actions/booking";

export const dynamic = "force-dynamic";

async function handleUpdateAppointmentStatus(formData: FormData) {
    "use server";
    const id = formData.get("appointmentId") as string;
    const status = formData.get("status") as string;
    await updateAppointmentStatus(id, status);
}

async function handleUpdateBookingStatus(formData: FormData) {
    "use server";
    const id = formData.get("bookingId") as string;
    const status = formData.get("status") as string;
    await updateBookingStatus(id, status);
}

async function handleDeleteAppointment(id: string) {
    "use server";
    await deleteAppointment(id);
}

async function handleDeleteBooking(id: string) {
    "use server";
    await deleteBooking(id);
}

async function handleEditAppointment(id: string, data: Record<string, unknown>) {
    "use server";
    await updateAppointment(id, data);
}

async function handleEditBooking(id: string, data: Record<string, unknown>) {
    "use server";
    // For legacy, normalize fields back
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

async function handleManualReserve(formData: FormData) {
    "use server";

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

export default async function AppointmentsPage() {
    await connectToDatabase();

    const appointmentsRaw = await Appointment.find({})
        .sort({ slotDate: -1 })
        .lean();

    const vaccineIds = Array.from(new Set(appointmentsRaw.map(a => a.vaccineId.toString())));
    
    // Fetch both vaccines and services to resolve titles
    const [foundVaccines, foundServices] = await Promise.all([
        Vaccine.find({ _id: { $in: vaccineIds } }).select("title price").lean(),
        Service.find({ _id: { $in: vaccineIds } }).select("title price").lean()
    ]);

    const itemMap = new Map();
    foundVaccines.forEach(v => itemMap.set(v._id.toString(), v));
    foundServices.forEach(s => itemMap.set(s._id.toString(), s));

    const appointments = appointmentsRaw.map(apt => ({
        ...apt,
        vaccineId: itemMap.get(apt.vaccineId.toString()) || { title: "Unknown Service", _id: apt.vaccineId }
    }));

    const vaccines = await Vaccine.find({})
        .select("title")
        .sort({ title: 1 })
        .lean();

    const services = await Service.find({ status: "published" })
        .select("title")
        .sort({ title: 1 })
        .lean();

    let legacyBookings: unknown[] = [];
    try {
        const { default: Booking } = await import("@/models/Booking");
        legacyBookings = await Booking.find({}).sort({ bookingDate: -1 }).lean();
    } catch {}

    // Serialize MongoDB objects for Client Component
    const serializedAppointments = JSON.parse(JSON.stringify(appointments));
    const serializedLegacyBookings = JSON.parse(JSON.stringify(legacyBookings));
    const serializedVaccines = JSON.parse(JSON.stringify(vaccines));
    const serializedServices = JSON.parse(JSON.stringify(services));

    return (
        <div className="w-full">


            <AppointmentsClient 
                initialAppointments={serializedAppointments}
                legacyBookings={serializedLegacyBookings}
                vaccines={serializedVaccines}
                services={serializedServices}
                onStatusUpdate={handleUpdateAppointmentStatus}
                onLegacyStatusUpdate={handleUpdateBookingStatus}
                onDelete={handleDeleteAppointment}
                onDeleteLegacy={handleDeleteBooking}
                onEdit={handleEditAppointment}
                onLegacyEdit={handleEditBooking}
                onManualReserve={handleManualReserve}
            />
        </div>
    );
}
