import { randomUUID } from "crypto";
import { google } from "googleapis";

export type CalendarCreateInput = {
    appointmentId: string;
    serviceTitle: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    notes?: string;
    slotDate: Date;
    slotTime: string;
    durationMinutes?: number;
};

export type CalendarCreateResult = {
    success: boolean;
    eventId?: string;
    eventLink?: string;
    meetLink?: string;
    error?: string;
};

function getGoogleJwtClient() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!clientEmail || !privateKeyRaw) {
        return null;
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
    const scopes = ["https://www.googleapis.com/auth/calendar"];
    const subject = process.env.GOOGLE_IMPERSONATED_USER || undefined;

    return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes,
        subject,
    });
}

function slotStartDate(slotDate: Date, slotTime: string) {
    const date = new Date(slotDate);
    const [hoursRaw, minutesRaw] = slotTime.split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return null;
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
}

export async function createAppointmentCalendarEvent(
    input: CalendarCreateInput
): Promise<CalendarCreateResult> {
    try {
        const auth = getGoogleJwtClient();
        if (!auth) {
            return {
                success: false,
                error: "Google Calendar credentials are not configured.",
            };
        }

        const start = slotStartDate(input.slotDate, input.slotTime);
        if (!start) {
            return {
                success: false,
                error: "Invalid slot time format.",
            };
        }

        const durationMinutes = input.durationMinutes ?? Number(process.env.APPOINTMENT_DURATION_MINUTES || 30);
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
        const timezone = process.env.GOOGLE_CALENDAR_TIMEZONE || "Europe/London";

        const calendar = google.calendar({ version: "v3", auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

        const event = await calendar.events.insert({
            calendarId,
            conferenceDataVersion: 1,
            sendUpdates: "all",
            requestBody: {
                summary: `Appointment Request: ${input.customerName}`,
                description: [
                    `Appointment ID: ${input.appointmentId}`,
                    `Service: ${input.serviceTitle}`,
                    `Customer: ${input.customerName}`,
                    `Email: ${input.customerEmail}`,
                    `Phone: ${input.customerPhone || "N/A"}`,
                    input.notes ? `Notes: ${input.notes}` : "",
                ]
                    .filter(Boolean)
                    .join("\n"),
                start: {
                    dateTime: start.toISOString(),
                    timeZone: timezone,
                },
                end: {
                    dateTime: end.toISOString(),
                    timeZone: timezone,
                },
                attendees: [
                    { email: input.customerEmail },
                ],
                conferenceData: {
                    createRequest: {
                        requestId: randomUUID(),
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
            },
        });

        const meetLink =
            event.data.hangoutLink ||
            event.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
            undefined;

        return {
            success: true,
            eventId: event.data.id || undefined,
            eventLink: event.data.htmlLink || undefined,
            meetLink,
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create Google Calendar event",
        };
    }
}
