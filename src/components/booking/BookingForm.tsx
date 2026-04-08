"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { format, addDays, startOfToday } from "date-fns";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx"
);

// ─── Payment Form Component ───
const CheckoutForm = ({
    amount,
    onSuccess,
}: {
    amount: number;
    onSuccess: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/book/success`,
            },
            redirect: "if_required",
        });

        if (error) {
            setErrorMessage(error.message ?? "An unknown error occurred");
            setIsProcessing(false);
        } else {
            // Payment succeeded
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && (
                <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}
            <button
                disabled={!stripe || isProcessing}
                className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all"
            >
                {isProcessing ? "Processing..." : `Pay £${amount}`}
            </button>
        </form>
    );
};

// ─── Main Booking Component ───
export default function BookingForm({
    services = [],
    vaccines = []
}: {
    services?: any[],
    vaccines?: any[]
}) {
    // Combine services and vaccines for selection
    const allServices = [
        ...services.map((s: any) => ({
            ...s,
            id: s._id || s.id,
            type: "service",
            price: s.price ?? 0,
            title: s.title
        })),
        ...vaccines.map((v: any) => ({
            ...v,
            id: v._id || v.id,
            type: "vaccine",
            price: v.price ?? 0,
            title: v.title
        })),
    ];

    const [step, setStep] = useState(2);
    const [selectedService, setSelectedService] = useState<any>(allServices.length > 0 ? allServices[0] : null);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });
    const [isMockPayment, setIsMockPayment] = useState(false);

    // Mock available times
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30"
    ];

    const handleDateTimeSelect = () => {
        if (selectedDate && selectedTime) {
            setStep(3);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedService) return;

        // Create PaymentIntent
        if (selectedService.price > 0) {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: selectedService.price }),
            });
            const data = await res.json();
            setClientSecret(data.clientSecret);
            if (data.isMock) setIsMockPayment(true);
            setStep(4);
        } else {
            // Free service (mock flow)
            handleBookingSuccess();
        }
    };

    const handleBookingSuccess = async () => {
        try {
            // Create booking record
            await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service: selectedService,
                    date: selectedDate,
                    time: selectedTime,
                    customer: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        notes: formData.notes,
                    },
                    paymentIntentId: clientSecret?.startsWith('pi_') ? clientSecret.split('_secret_')[0] : clientSecret, // In reality, we'd verify this on the server
                }),
            });

            // Redirect to success page with query params
            const params = new URLSearchParams({
                date: selectedDate.toISOString(),
                time: selectedTime!,
                service: selectedService.title,
            });
            window.location.href = `/book/success?${params.toString()}`;
        } catch (error) {
            console.error("Booking creation failed:", error);
            // Still redirect to success if payment succeeded but booking creation failed (edge case)
            const params = new URLSearchParams({
                date: selectedDate.toISOString(),
                time: selectedTime!,
                service: selectedService.title,
            });
            window.location.href = `/book/success?${params.toString()}`;
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            {/* ─── Progress Bar ─── */}
            <div className="bg-background border-b border-border/60 p-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {["Time", "Details", "Payment"].map((label, index) => {
                        const stepVisualNumber = index + 1;
                        const internalStep = index + 2; // 2 layout for Time, 3 for Details, 4 for Payment
                        return (
                            <div key={label} className="flex flex-col items-center gap-2 relative z-10">
                                <button
                                    onClick={() => { if (step > internalStep) setStep(internalStep); }}
                                    disabled={step <= internalStep}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > internalStep
                                            ? "bg-primary text-white cursor-pointer hover:bg-primary-dark"
                                            : step === internalStep
                                                ? "bg-secondary text-white ring-4 ring-secondary/20 cursor-default"
                                                : "bg-border/50 text-text-muted cursor-default"
                                        }`}
                                >
                                    {step > internalStep ? "✓" : stepVisualNumber}
                                </button>
                                <span
                                    className={`text-xs font-medium ${step === internalStep ? "text-secondary" : "text-text-muted"
                                        }`}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 sm:p-10 min-h-[400px]">
                {/* ─── Step 2: Date & Time ─── */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Select Date & Time</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Mock Date Picker (simplest implementation) */}
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-3">
                                    Select Date
                                </label>
                                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                    {[...Array(14)].map((_, i) => {
                                        const date = addDays(startOfToday(), i);
                                        const isSelected = date.toDateString() === selectedDate.toDateString();
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(date)}
                                                className={`p-2 rounded-lg transition-all ${isSelected
                                                    ? "bg-secondary text-white font-bold shadow-md"
                                                    : "bg-background hover:bg-border/50 text-text-secondary"
                                                    }`}
                                            >
                                                <div className="text-[10px] uppercase opacity-70">
                                                    {format(date, "EEE")}
                                                </div>
                                                <div>{format(date, "d")}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-3">
                                    Select Time
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                                                ? "bg-secondary text-white shadow-md"
                                                : "bg-background border border-border/60 hover:border-secondary/50 text-text-secondary"
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                disabled={!selectedDate || !selectedTime}
                                onClick={handleDateTimeSelect}
                                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold shadow-sm disabled:opacity-50 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Details ─── */}
                {step === 3 && (
                    <div>
                        <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary mb-6 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Back to Date &amp; Time
                        </button>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Your Details</h2>
                        <form onSubmit={handleDetailsSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-all"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── Step 4: Payment ─── */}
                {step === 4 && clientSecret && (
                    <div>
                        <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary mb-6 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Back to Details
                        </button>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Secure Payment</h2>
                        <div className="bg-background border border-border rounded-xl p-4 mb-6 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-text-primary">{selectedService?.title}</p>
                                <p className="text-xs text-text-secondary">
                                    {format(selectedDate, "EEE, d MMM yyyy")} at {selectedTime}
                                </p>
                            </div>
                            <div className="text-xl font-bold text-secondary">
                                {selectedService?.price > 0 ? `£${selectedService.price}` : 'Free'}
                            </div>
                        </div>

                        {isMockPayment ? (
                            <div className="text-center p-8 border-2 border-dashed border-secondary/30 rounded-xl bg-secondary/5">
                                <div className="mb-4 text-4xl">🧪</div>
                                <h3 className="text-lg font-bold text-secondary mb-2">Demo Mode Active</h3>
                                <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
                                    Payment system is in demonstration mode. No credit card details are required.
                                </p>
                                <button
                                    onClick={handleBookingSuccess}
                                    className="bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all"
                                >
                                    Simulate Successful Payment
                                </button>
                            </div>
                        ) : (
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <CheckoutForm
                                    amount={selectedService?.price}
                                    onSuccess={handleBookingSuccess}
                                />
                            </Elements>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
