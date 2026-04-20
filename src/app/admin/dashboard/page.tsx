import { auth } from "@/auth";
import DashboardClient from "@/components/admin/DashboardClient";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import Booking from "@/models/Booking";
import Enquiry from "@/models/Enquiry";
import Service from "@/models/Service";
import Vaccine from "@/models/Vaccine";

type DashboardMetrics = {
    totalAppointments: number;
    totalEnquiries: number;
    visitors: number;
    activeServices: number;
    pendingReview: number;
    totalVaccinesAvailable: number;
    totalServices: number;
};

type RecentAppointment = {
    patient: string;
    service: string;
    date: string;
    time: string;
    status: "Confirmed" | "Pending" | "Cancelled";
};

export default async function DashboardPage() {
    const session = await auth();

    await connectToDatabase();

    const [
        appointmentCount,
        legacyBookingCount,
        totalEnquiries,
        pendingEnquiries,
        pendingAppointments,
        activeServices,
        totalServices,
        totalVaccinesAvailable,
        appointmentEmails,
        bookingEmails,
        enquiryEmails,
        recentAppointmentsRaw,
    ] = await Promise.all([
        Appointment.countDocuments(),
        Booking.countDocuments(),
        Enquiry.countDocuments(),
        Enquiry.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "PENDING" }),
        Service.countDocuments({ status: "published" }),
        Service.countDocuments(),
        Vaccine.countDocuments({ status: "published" }),
        Appointment.distinct("customerEmail"),
        Booking.distinct("customerEmail"),
        Enquiry.distinct("email"),
        Appointment.find({})
            .populate("vaccineId", "title")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
    ]);

    const visitorSet = new Set<string>([
        ...appointmentEmails,
        ...bookingEmails,
        ...enquiryEmails,
    ]);

    const recentAppointments: RecentAppointment[] = recentAppointmentsRaw.map((apt) => {
        const slotDate = new Date(apt.slotDate);
        const status =
            apt.status === "CONFIRMED"
                ? "Confirmed"
                : apt.status === "PENDING"
                    ? "Pending"
                    : "Cancelled";

        return {
            patient: apt.customerName || "Unknown",
            service:
                apt.vaccineId && typeof apt.vaccineId === "object" && "title" in apt.vaccineId
                    ? String(apt.vaccineId.title || "Vaccination")
                    : "Vaccination",
            date: slotDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            time: apt.slotTime,
            status,
        };
    });

    const metrics: DashboardMetrics = {
        totalAppointments: appointmentCount + legacyBookingCount,
        totalEnquiries,
        visitors: visitorSet.size,
        activeServices,
        pendingReview: pendingEnquiries + pendingAppointments,
        totalVaccinesAvailable,
        totalServices,
    };

    return <DashboardClient user={session?.user} metrics={metrics} recentAppointments={recentAppointments} />;
}
