import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import "@/models/Vaccine";
import Vaccine from "@/models/Vaccine";
import Service from "@/models/Service";
import AppointmentsClient from "./AppointmentsClient";
import {
    handleDeleteAppointment,
    handleDeleteBooking,
    handleEditAppointment,
    handleEditBooking,
    handleManualReserve,
    handleUpdateAppointmentStatus,
    handleUpdateBookingStatus,
} from "./actions";

export const dynamic = "force-dynamic";

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
