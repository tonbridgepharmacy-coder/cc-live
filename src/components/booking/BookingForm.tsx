"use client";

import { useState, useEffect, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { format, addDays, startOfToday } from "date-fns";
import { useSearchParams } from "next/navigation";

// Initialize Stripe
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
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && (
                <div className="text-red-500 text-sm mt-2 font-bold">{errorMessage}</div>
            )}
            <button
                disabled={!stripe || isProcessing}
                className="w-full bg-secondary hover:bg-secondary-dark text-white font-black py-4 rounded-2xl disabled:opacity-50 transition-all shadow-xl active:scale-95 text-lg"
            >
                {isProcessing ? "Processing Security..." : `Confirm & Pay £${amount}`}
            </button>
        </form>
    );
};

// ─── Slot Type ───
interface Slot {
    time: string;
    available: number;
    total: number;
}

// ─── Main Booking Component Wrapper (for Suspense) ───
export default function BookingForm(props: any) {
    return (
        <Suspense fallback={<div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest">Initializing Clinic Engine...</div>}>
            <BookingFormInner {...props} />
        </Suspense>
    );
}

// ─── Inner Booking Component ───
function BookingFormInner({
    services = [],
    vaccines = []
}: {
    services?: any[],
    vaccines?: any[]
}) {
    const searchParams = useSearchParams();
    const serviceIdParam = searchParams.get("serviceId");

    // All possible services (Priority: Vaccines, then general consultations)
    const allServices = [
        ...vaccines.map((v: any) => ({
            ...v,
            id: v._id || v.id,
            type: "vaccine",
            price: v.price ?? 0,
            title: v.title
        })),
        ...services.map((s: any) => ({
            ...s,
            id: s._id || s.id,
            type: "service",
            price: s.price ?? 0,
            title: s.title
        })),
    ];

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1));
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const [isMockPayment, setIsMockPayment] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    // ─── Automated Service Selection Logic ───
    useEffect(() => {
        if (!selectedService) {
            let initialService = null;
            if (serviceIdParam && allServices.length > 0) {
                initialService = allServices.find((s: any) => s.id === serviceIdParam);
            }
            if (!initialService && allServices.length > 0) {
                initialService = allServices[0]; // Default to first available
            }
            if (!initialService) {
                // FALLBACK when database is completely empty so the form still works for testing
                initialService = {
                    id: "mock_consultation",
                    type: "service",
                    price: 25,
                    title: "General Consultation (Test)",
                };
            }
            setSelectedService(initialService);
        }
    }, [serviceIdParam, allServices.length, selectedService]);

    // Slot availability state
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [isClosed, setIsClosed] = useState(false);

    // Payment error state
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    const fetchSlots = async (date: Date) => {
        setSlotsLoading(true);
        setSlotsError(null);
        setSelectedTime(null);
        setIsClosed(false);

        try {
            const dateStr = format(date, "yyyy-MM-dd");
            const res = await fetch(`/api/slots?date=${dateStr}`);
            const data = await res.json();

            if (data.closed) {
                setIsClosed(true);
                setAvailableSlots([]);
            } else if (data.slots) {
                setAvailableSlots(data.slots);
            } else {
                setSlotsError("Failed to load available slots");
            }
        } catch (err) {
            setSlotsError("Failed to load available slots");
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleStep1Submit = () => {
        if (selectedService && selectedDate && selectedTime) {
            setStep(2);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        setIsCreatingPayment(true);
        setPaymentError(null);

        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vaccineId: selectedService.id,
                    date: format(selectedDate, "yyyy-MM-dd"),
                    time: selectedTime,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    notes: formData.notes || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPaymentError(data.error || "Failed to create payment");
                return;
            }

            setClientSecret(data.clientSecret);
            setAppointmentId(data.appointmentId);
            if (data.isMock) setIsMockPayment(true);
            setStep(3);
        } catch (err: any) {
            setPaymentError("An error occurred during secure checkout. Please try again.");
        } finally {
            setIsCreatingPayment(false);
        }
    };

    const handleBookingSuccess = async () => {
        try {
            // Confirm the booking via API
            await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointmentId,
                    service: selectedService,
                    date: selectedDate,
                    time: selectedTime,
                    customer: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        notes: formData.notes,
                    },
                    paymentIntentId: clientSecret,
                }),
            });

            // Redirect to success page
            const params = new URLSearchParams({
                date: selectedDate.toISOString(),
                time: selectedTime!,
                service: selectedService.title,
                ref: appointmentId || "",
            });
            window.location.href = `/book/success?${params.toString()}`;
        } catch (error) {
            console.error("Booking confirmation process failed:", error);
            // Even if confirmation fails, we redirect to success if we got here (Stripe handled payment)
            const params = new URLSearchParams({
                date: selectedDate.toISOString(),
                time: selectedTime!,
                service: selectedService.title,
            });
            window.location.href = `/book/success?${params.toString()}`;
        }
    };

    // Render the beautiful 3 stage form unconditionally!

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-border/60 overflow-hidden shadow-2xl">
            {/* ─── Progress HUD ─── */}
            <div className="bg-slate-50 border-b border-border/60 p-6 sm:p-8">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-0" />
                    <div 
                        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 ease-in-out -z-0" 
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />

                    {["Appointment", "Details", "Payment"].map((label, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = step > stepNumber;
                        const isActive = step === stepNumber;
                        return (
                            <div key={label} className="flex flex-col items-center gap-3 relative z-10">
                                <button
                                    onClick={() => { if (isCompleted) setStep(stepNumber); }}
                                    disabled={!isCompleted}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all shadow-sm ${
                                        isCompleted
                                            ? "bg-primary text-white cursor-pointer hover:bg-primary-dark"
                                            : isActive
                                                ? "bg-secondary text-white ring-4 ring-secondary/20 scale-110"
                                                : "bg-white text-slate-400 border-2 border-slate-200"
                                    }`}
                                >
                                    {isCompleted ? "✓" : stepNumber}
                                </button>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    isActive ? "text-secondary" : isCompleted ? "text-primary" : "text-slate-400"
                                }`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 sm:p-12 min-h-[500px]">
                {/* ─── Stage 1: Date & Time (Selection UI Removed) ─── */}
                {step === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Date Picker */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">1</div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Pick a Date</h2>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {[...Array(14)].map((_, i) => {
                                        const date = addDays(startOfToday(), i + 1);
                                        const isSelected = date.toDateString() === selectedDate.toDateString();
                                        const isSunday = date.getDay() === 0;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => !isSunday && setSelectedDate(date)}
                                                disabled={isSunday}
                                                className={`flex flex-col items-center py-3 rounded-xl transition-all ${
                                                    isSelected
                                                        ? "bg-primary text-white font-bold shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2"
                                                        : isSunday
                                                            ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                                            : "bg-white border border-slate-200 hover:border-primary/50 text-slate-600 font-bold"
                                                }`}
                                            >
                                                <span className="text-[9px] uppercase font-black opacity-70 mb-1">{format(date, "EEE")}</span>
                                                <span className="text-base">{format(date, "d")}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="mt-4 text-[10px] text-slate-400 italic font-bold tracking-wide">* Showing next 14 days. We are closed on Sundays.</p>
                            </section>

                            {/* Time Slots */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">2</div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Pick a Time</h2>
                                </div>

                                {slotsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl animate-pulse">
                                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Scanning slots...</span>
                                    </div>
                                ) : isClosed ? (
                                    <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
                                        <div className="text-3xl mb-3">🏥</div>
                                        <p className="font-black text-red-700">Clinic Closed</p>
                                        <p className="text-xs text-red-500 mt-1 font-bold">Please select another date above.</p>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-100">
                                        <div className="text-3xl mb-3">⏰</div>
                                        <p className="font-black text-amber-700">Fully Booked</p>
                                        <p className="text-xs text-amber-600 mt-1 font-bold">All slots taken for this day.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => setSelectedTime(slot.time)}
                                                className={`py-3 rounded-xl text-sm font-black transition-all relative ${
                                                    selectedTime === slot.time
                                                        ? "bg-secondary text-white shadow-lg shadow-secondary/30 ring-2 ring-secondary ring-offset-2"
                                                        : "bg-white border border-slate-200 hover:border-secondary/50 text-slate-700"
                                                }`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Stage 1 Footer */}
                        <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Appointment for</span>
                                <div className="flex items-center gap-3">
                                     <span className="font-black text-slate-900 border-b-4 border-secondary/20 pb-1 text-lg tracking-tight">{selectedService?.title || "Selecting Service..."}</span>
                                     {selectedService?.price > 0 && (
                                         <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-black">£{selectedService.price}</span>
                                     )}
                                </div>
                            </div>
                            <button
                                disabled={!selectedService || !selectedTime}
                                onClick={handleStep1Submit}
                                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-14 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                Continue to Details
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Stage 2: Patient Details ─── */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <button onClick={() => setStep(1)} className="inline-flex items-center gap-3 text-sm font-black text-slate-400 hover:text-primary mb-10 transition-colors group">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            </div>
                            Update Date & Time
                        </button>

                        <div className="grid lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-12">
                                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Patient Information</h2>
                                <p className="text-slate-400 font-bold text-sm mb-12">Ensure all medical details are accurate for your consultation records.</p>
                                
                                <form onSubmit={handleDetailsSubmit} className="grid sm:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter full name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none font-bold placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="patient@medical.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none font-bold placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Contact Number</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+44 7700 900XXX"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none font-bold placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Medical Notes (Optional)</label>
                                            <textarea
                                                rows={10}
                                                placeholder="Allergies, chronic conditions, or specific requirements..."
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none resize-none font-bold placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 pt-10 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 gap-8">
                                        <div className="flex items-center gap-5 text-slate-400 max-w-sm">
                                            <div className="w-14 h-14 min-w-[3.5rem] rounded-2xl bg-primary/5 flex items-center justify-center text-primary text-2xl shadow-sm">🛡️</div>
                                            <p className="text-[10px] leading-relaxed font-bold uppercase tracking-wide">Secure encrypted transmission. GDPR compliant medical record handling.</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isCreatingPayment}
                                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-16 py-6 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all transform hover:-translate-y-1 active:scale-95"
                                        >
                                            {isCreatingPayment ? "Securing Appointment..." : "Proceed to Payment"}
                                        </button>
                                    </div>
                                    {paymentError && <p className="sm:col-span-2 text-red-600 text-sm font-black text-center mt-6 bg-red-50 py-4 rounded-2xl border border-red-100 shadow-sm animate-bounce">{paymentError}</p>}
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Stage 3: Secure Payment ─── */}
                {step === 3 && clientSecret && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <button onClick={() => setStep(2)} className="inline-flex items-center gap-3 text-sm font-black text-slate-400 hover:text-primary mb-10 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            </div>
                            Edit Patient Info
                        </button>

                        <div className="max-w-xl mx-auto">
                            <h2 className="text-4xl font-black text-slate-900 mb-3 text-center tracking-tight">Finalise Booking</h2>
                            <p className="text-slate-400 text-center font-bold mb-12 uppercase tracking-widest text-xs">Total payable: <span className="text-secondary font-black text-2xl ml-2 tracking-normal lowercase">£{selectedService?.price}</span></p>
                            
                            <div className="bg-slate-50 rounded-[48px] p-10 mb-10 border-2 border-slate-100 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-8xl pointer-events-none">£</div>
                                <section className="space-y-6 mb-12 relative z-10">
                                    <div className="flex justify-between items-center text-sm font-black">
                                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">Service</span>
                                        <span className="text-slate-900 border-b-2 border-slate-200">{selectedService?.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-black">
                                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">Date/Time</span>
                                        <span className="text-slate-900 text-right">{format(selectedDate, "EEE, MMM d")} at {selectedTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-black">
                                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">Patient</span>
                                        <span className="text-slate-900">{formData.name}</span>
                                    </div>
                                </section>

                                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-5 shadow-sm">
                                    <span className="text-3xl animate-pulse">⏰</span>
                                    <p className="leading-relaxed">This selection is transiently locked. Complete payment within 10 minutes to secure your appointment permanently.</p>
                                </div>
                            </div>

                            {isMockPayment ? (
                                <div className="text-center p-16 bg-blue-600 rounded-[48px] shadow-3xl shadow-blue-200 transform hover:scale-[1.02] transition-all">
                                    <div className="text-6xl mb-8">🛠️</div>
                                    <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Security Gateway</h3>
                                    <p className="text-blue-100 mb-12 font-bold opacity-80 uppercase tracking-widest text-[10px]">Internal Simulation Mode Active</p>
                                    <button
                                        onClick={handleBookingSuccess}
                                        className="w-full bg-white text-blue-600 font-black py-6 px-12 rounded-3xl shadow-2xl transition-all transform hover:-translate-y-2 hover:bg-slate-50 active:scale-95 text-xl uppercase tracking-tighter"
                                    >
                                        Authorise Appointment
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
                    </div>
                )}
            </div>
        </div>
    );
}
