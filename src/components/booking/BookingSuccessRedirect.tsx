"use client";

import { useEffect, useState } from "react";

export default function BookingSuccessRedirect({ calendarLink }: { calendarLink: string }) {
    const [countdown, setCountdown] = useState(3);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (!calendarLink) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setRedirecting(true);
                    window.location.href = calendarLink;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [calendarLink]);

    return (
        <div className="mb-8 p-6 bg-secondary/5 rounded-2xl border border-secondary/10 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                <p className="text-secondary font-bold text-sm uppercase tracking-widest">
                    {redirecting ? "Opening Google Calendar..." : `Adding to Calendar in ${countdown}s...`}
                </p>
            </div>
            <p className="text-text-muted text-[10px] font-medium italic">
                You will be automatically redirected to secure your time slot.
            </p>
        </div>
    );
}
