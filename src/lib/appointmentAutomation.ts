import { format } from "date-fns";
import type { IAppointment } from "@/models/Appointment";
import { createAppointmentCalendarEvent, generateGoogleCalendarTemplateLink } from "@/lib/googleCalendar";
import { sendEmail } from "@/lib/email";

type NotifyInput = {
    appointment: IAppointment;
    serviceTitle: string;
};

export async function handleConfirmedAppointmentAutomation({
    appointment,
    serviceTitle,
}: NotifyInput) {
    let calendarError: string | null = null;

    if (!appointment.calendarEventId) {
        const calendarResult = await createAppointmentCalendarEvent({
            appointmentId: appointment._id.toString(),
            serviceTitle,
            customerName: appointment.customerName,
            customerEmail: appointment.customerEmail,
            customerPhone: appointment.customerPhone,
            notes: appointment.notes,
            slotDate: new Date(appointment.slotDate),
            slotTime: appointment.slotTime,
        });

        if (calendarResult.success) {
            appointment.calendarEventId = calendarResult.eventId;
            appointment.calendarEventLink = calendarResult.eventLink;
            appointment.meetingLink = calendarResult.meetLink;
        } else {
            calendarError = calendarResult.error || "Failed to create calendar event";
            console.error("Calendar event creation failed:", calendarError);
        }
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;

    if (adminEmail && !appointment.adminNotifiedAt) {
        const dateLabel = format(new Date(appointment.slotDate), "EEEE, d MMMM yyyy");
        const adminCalendarLink = generateGoogleCalendarTemplateLink({
            serviceTitle: serviceTitle,
            slotDate: new Date(appointment.slotDate),
            slotTime: appointment.slotTime,
            details: `Appointment with ${appointment.customerName}\nEmail: ${appointment.customerEmail}\nPhone: ${appointment.customerPhone || "N/A"}\nID: ${appointment._id}`,
        });

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
                <h2 style="margin-bottom: 8px;">New Appointment Request Received</h2>
                <p style="color: #334155;">A client has successfully completed payment and booked an appointment.</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 16px 0;">
                    <p><strong>Client Name:</strong> ${appointment.customerName}</p>
                    <p><strong>Client Email:</strong> ${appointment.customerEmail}</p>
                    <p><strong>Client Phone:</strong> ${appointment.customerPhone || "N/A"}</p>
                    <p><strong>Service:</strong> ${serviceTitle}</p>
                    <p><strong>Date:</strong> ${dateLabel}</p>
                    <p><strong>Time:</strong> ${appointment.slotTime}</p>
                    <p><strong>Appointment ID:</strong> ${appointment._id}</p>
                    <p><strong>Payment:</strong> ${appointment.paymentStatus}</p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                         <a href="${adminCalendarLink}" style="display: inline-block; background: #1d4ed8; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Add to Admin Calendar</a>
                         ${appointment.calendarEventLink ? `<p style="margin-top: 10px; font-size: 12px; color: #64748b;">✅ Automatically synced to clinic calendar</p>` : ""}
                    </div>
                    ${appointment.meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${appointment.meetingLink}">${appointment.meetingLink}</a></p>` : ""}
                    ${calendarError ? `<p style="color: #dc2626; font-size: 12px;"><strong>Sync Note:</strong> ${calendarError}. Use the button above to add manually.</p>` : ""}
                </div>
                <p style="color: #64748b; font-size: 13px;">This appointment is already saved in the admin appointments module.</p>
            </div>
        `;

        try {
            await sendEmail({
                to: adminEmail,
                subject: `New Appointment Request: ${appointment.customerName} - ${format(new Date(appointment.slotDate), "d MMM yyyy")} ${appointment.slotTime}`,
                html,
            });
            appointment.adminNotifiedAt = new Date();
        } catch (error) {
            console.error("Failed to send admin appointment email:", error);
        }
    }

    await appointment.save();
}
