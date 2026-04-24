import Link from "next/link";
import { type Metadata } from "next";
import { format, parseISO, addMinutes } from "date-fns";
import BookingSuccessRedirect from "@/components/booking/BookingSuccessRedirect";
import { generateGoogleCalendarTemplateLink } from "@/lib/googleCalendar";

export const metadata: Metadata = {
    title: "Booking Confirmed",
    description: "Your appointment has been successfully booked.",
};

const CheckCircleIcon = () => (
    <svg className="w-16 h-16 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default async function BookingSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const { date, time, service } = params;

    let calendarLink = "";

    if (date && time && service) {
        calendarLink = generateGoogleCalendarTemplateLink({
            serviceTitle: service,
            slotDate: parseISO(date),
            slotTime: time,
        });
    }

    return (
        <div className="min-h-screen pt-32 pb-16 bg-background flex items-center justify-center">
            <div className="section-container section-padding w-full max-w-lg">
                <div className="bg-white rounded-2xl border border-border/60 p-8 sm:p-12 text-center shadow-sm">
                    <div className="flex justify-center mb-6">
                        <CheckCircleIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-4">
                        Booking Confirmed!
                    </h1>
                    <p className="text-text-secondary mb-8">
                        Thank you for booking with Clarke & Coleman Pharmacy. We&apos;ve sent a
                        confirmation email with all the details.
                    </p>

                    {calendarLink && <BookingSuccessRedirect calendarLink={calendarLink} />}

                    <div className="bg-secondary/5 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-semibold text-text-primary mb-3">Your Appointment</h3>
                        {service && (
                            <p className="text-sm text-text-secondary mb-1">
                                <span className="font-semibold text-text-primary">Service:</span> {service}
                            </p>
                        )}
                        {date && (
                            <p className="text-sm text-text-secondary mb-1">
                                <span className="font-semibold text-text-primary">Date:</span>{" "}
                                {format(parseISO(date), "EEEE, d MMMM yyyy")}
                            </p>
                        )}
                        {time && (
                            <p className="text-sm text-text-secondary mb-3">
                                <span className="font-semibold text-text-primary">Time:</span> {time}
                            </p>
                        )}

                        <ul className="text-xs text-text-muted space-y-1 list-disc list-inside border-t border-secondary/10 pt-3 mt-3">
                            <li>Please arrive 5 minutes before your appointment time.</li>
                            <li>Bring any relevant medical history or medication lists.</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        {calendarLink && (
                            <a
                                href={calendarLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-white hover:bg-gray-50 text-text-primary border border-border font-semibold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <CalendarIcon />
                                Add to Google Calendar
                            </a>
                        )}

                        <Link
                            href="/"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl shadow-sm transition-all"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
