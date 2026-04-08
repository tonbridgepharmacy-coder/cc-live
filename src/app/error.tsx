"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-background">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500 text-4xl">
                ⚠️
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Something went wrong!
            </h2>
            <p className="text-lg text-text-secondary max-w-md mb-8">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                    Try again
                </button>
                <a
                    href="/"
                    className="bg-white hover:bg-gray-50 text-text-primary border border-border px-6 py-3 rounded-xl font-semibold transition-all"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
