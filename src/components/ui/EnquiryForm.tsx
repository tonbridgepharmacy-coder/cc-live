"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/actions/enquiry";

type FormErrors = {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
};

export default function EnquiryForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [fields, setFields] = useState({ name: "", email: "", phone: "", message: "" });

    function validate(): FormErrors {
        const e: FormErrors = {};
        const name = fields.name.trim();
        const email = fields.email.trim();
        const phone = fields.phone.replace(/\D/g, "");
        const message = fields.message.trim();

        if (!name) e.name = "Full name is required.";
        else if (name.length < 2) e.name = "Name must be at least 2 characters.";

        if (!email) e.email = "Email address is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address.";

        if (!phone) e.phone = "Phone number is required.";
        else if (phone.length !== 11) e.phone = "Enter a valid 11-digit UK phone number (e.g. 07700900123).";
        else if (!phone.startsWith("0")) e.phone = "UK phone numbers must start with 0.";

        if (!message) e.message = "Please tell us how we can help.";
        else if (message.length < 10) e.message = "Message must be at least 10 characters.";

        return e;
    }

    function handleChange(field: keyof typeof fields, value: string) {
        setFields((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            const result = await submitEnquiry({
                name: fields.name.trim(),
                email: fields.email.trim(),
                phone: fields.phone.replace(/\D/g, ""),
                message: fields.message.trim(),
            });
            if (result.success) {
                setStatus("success");
                setFields({ name: "", email: "", phone: "", message: "" });
                setErrors({});
            } else {
                setStatus("error");
                setErrorMessage(result.error || "Something went wrong.");
            }
        } catch {
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

    const inputClass = (field: keyof FormErrors) =>
        `w-full px-4 py-3 rounded-xl border ${errors[field] ? "border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400" : "border-border focus:ring-primary/20 focus:border-primary"} focus:ring-2 outline-none transition-all`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={fields.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={inputClass("name")}
                        placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={fields.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={inputClass("email")}
                        placeholder="john@example.com"
                    />
                    {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email}</p>}
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
                    value={fields.phone}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                        handleChange("phone", digits);
                    }}
                    inputMode="numeric"
                    className={inputClass("phone")}
                    placeholder="07123456789"
                />
                {errors.phone && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.phone}</p>}
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1.5">
                    How can we help?
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={fields.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={4}
                    className={`${inputClass("message")} resize-none`}
                    placeholder="Tell us about your requirements..."
                />
                {errors.message && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.message}</p>}
            </div>

            {status === "error" && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm italic">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${status === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
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
