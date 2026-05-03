"use server";

import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Enquiry from "@/models/Enquiry";

export async function getRecentNotifications() {
    const conn = await dbConnect();
    if (!conn) return [];

    try {
        const [recentAppointments, recentEnquiries] = await Promise.all([
            Appointment.find({ status: "PENDING" })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Enquiry.find({ status: "pending" })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        const notifications = [
            ...recentAppointments.map((apt: any) => ({
                id: apt._id.toString(),
                type: "APPOINTMENT",
                title: "New Appointment Request",
                description: `From ${apt.customerName}`,
                time: apt.createdAt,
                href: "/admin/appointments"
            })),
            ...recentEnquiries.map((enq: any) => ({
                id: enq._id.toString(),
                type: "ENQUIRY",
                title: "New Enquiry Received",
                description: `From ${enq.name}`,
                time: enq.createdAt,
                href: "/admin/enquiries"
            }))
        ];

        return JSON.parse(JSON.stringify(notifications.sort((a, b) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
        )));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function markAllNotificationsAsRead() {
    await dbConnect();
    try {
        await Promise.all([
            Appointment.updateMany({ status: "PENDING" }, { $set: { status: "read" } }),
            Enquiry.updateMany({ status: "pending" }, { $set: { status: "read" } })
        ]);
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false };
    }
}
