"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/actions/enquiry";

export default function EnquiryForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        const formData = new FormData(event.currentTarget);
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            message: formData.get("message") as string,
        };

        try {
            const result = await submitEnquiry(data);
            if (result.success) {
                setStatus("success");
                (event.target as HTMLFormElement).reset();
            } else {
                setStatus("error");
                setErrorMessage(result.error || "Something went wrong.");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("An unexpected error occurred.");
        }
    }

    if (status === "success") {
        return (
            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Enquiry Sent!</h3>
                <p className="text-text-secondary mb-6">
                    Thank you for reaching out. Our team will get back to you as soon as possible.
                </p>
                <button
                    onClick={() => setStatus("idle")}
                    className="text-primary font-semibold hover:underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="john@example.com"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1.5">
                    Phone Number
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="07123 456789"
                />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1.5">
                    How can we help?
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Tell us about your requirements..."
                ></textarea>
            </div>

            {status === "error" && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm italic">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${status === "loading" ? "opacity-70 cursor-not-allowed" : ""
                    }`}
            >
                {status === "loading" ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </>
                ) : (
                    "Submit Enquiry"
                )}
            </button>
        </form>
    );
}
