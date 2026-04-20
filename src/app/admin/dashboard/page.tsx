import { auth } from "@/auth";
import DashboardClient from "@/components/admin/DashboardClient";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import Booking from "@/models/Booking";
import Enquiry from "@/models/Enquiry";
import Service from "@/models/Service";
import Vaccine from "@/models/Vaccine";
import Batch from "@/models/Batch";
import JobApplication from "@/models/JobApplication";
import LoginAudit from "@/models/LoginAudit";

type DashboardMetrics = {
    totalAppointments: number;
    totalEnquiries: number;
    visitors: number;
    activeServices: number;
    pendingReview: number;
    totalVaccinesAvailable: number;
    totalServices: number;
    lowStockAlerts: number;
    expiringSoonAlerts: number;
    pendingJobApps: number;
    failedSecLogins: number;
};

type RecentAppointment = {
    patient: string;
    service: string;
    date: string;
    time: string;
    status: "Confirmed" | "Pending" | "Cancelled";
};

type RecentEnquiry = {
    name: string;
    subject: string;
    date: string;
};

export default async function DashboardPage() {
    const session = await auth();

    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sixtyDaysLater = new Date(today);
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

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
        todaysAppointmentsRaw,
        lowStockAlerts,
        expiringSoonAlerts,
        pendingJobApps,
        failedSecLogins,
        recentEnquiriesRaw,
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
        Appointment.find({
            slotDate: { $gte: today.toISOString(), $lt: tomorrow.toISOString() }
        }).populate("vaccineId", "title").limit(10).lean(),
        Batch.countDocuments({ quantityAvailable: { $lt: 10 }, status: "active" }),
        Batch.countDocuments({ expiryDate: { $lt: sixtyDaysLater }, status: "active" }),
        JobApplication.countDocuments({ status: "new" }),
        LoginAudit.countDocuments({ status: "FAILED", createdAt: { $gte: today } }),
        Enquiry.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const visitorSet = new Set<string>([
        ...appointmentEmails,
        ...bookingEmails,
        ...enquiryEmails,
    ]);

    const formatAppointmentView = (rawList: any[]): RecentAppointment[] => {
        return rawList.map((apt) => {
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
    };

    const recentAppointments = formatAppointmentView(recentAppointmentsRaw);
    const todaysAppointments = formatAppointmentView(todaysAppointmentsRaw);

    const recentEnquiries: RecentEnquiry[] = recentEnquiriesRaw.map((enq) => ({
        name: enq.name || "Unknown",
        subject: enq.message || "General Enquiry",
        date: new Date(enq.createdAt).toLocaleDateString("en-GB"),
    }));

    const metrics: DashboardMetrics = {
        totalAppointments: appointmentCount + legacyBookingCount,
        totalEnquiries,
        visitors: visitorSet.size,
        activeServices,
        pendingReview: pendingEnquiries + pendingAppointments,
        totalVaccinesAvailable,
        totalServices,
        lowStockAlerts,
        expiringSoonAlerts,
        pendingJobApps,
        failedSecLogins
    };

    return (
        <DashboardClient 
            user={session?.user} 
            metrics={metrics} 
            recentAppointments={recentAppointments} 
            todaysAppointments={todaysAppointments}
            recentEnquiries={recentEnquiries}
        />
    );
}
