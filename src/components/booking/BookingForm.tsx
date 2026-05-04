"use client";

import { useState, useEffect, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { format, addDays, startOfToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore } from "date-fns";
import { useSearchParams } from "next/navigation";
import BookingProgress from "./BookingProgress";
import StepSelectService from "./steps/StepSelectService";
import StepSchedule from "./steps/StepSchedule";
import StepDetails from "./steps/StepDetails";
import StepPayment from "./steps/StepPayment";


const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

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

interface PatientFormErrors {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
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
    vaccines = [],
    services = [],
}: {
    vaccines?: any[];
    services?: any[];
}) {
    const searchParams = useSearchParams();
    const serviceIdParam = searchParams.get("serviceId");

    const allOptions = [
        ...services.map((s: any) => ({
            ...s,
            id: s._id || s.id,
            type: "service",
            price: s.price ?? 0,
            title: s.title,
            category: s.category?.name || "Service",
        })),
        ...vaccines.map((v: any) => ({
            ...v,
            id: v._id || v.id,
            type: "vaccine",
            price: v.price ?? 0,
            title: v.title,
            category: v.category?.name || "Vaccine",
        })),
    ];

    const vaccineOptions = allOptions; // keep existing variable name used below

    const [serviceSearch, setServiceSearch] = useState("");
    const filteredOptions = allOptions.filter((o) => {
        const q = serviceSearch.toLowerCase();
        return (
            !q ||
            o.title.toLowerCase().includes(q) ||
            (o.category || "").toLowerCase().includes(q)
        );
    });

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [datesLoading, setDatesLoading] = useState(false);
    const [datesError, setDatesError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1));
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(addDays(startOfToday(), 1)));
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const [isMockPayment, setIsMockPayment] = useState(false);
    const [bookingFee, setBookingFee] = useState(5);
    const [servicePrice, setServicePrice] = useState(0);
    const [totalAmount, setTotalAmount] = useState(5);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });
    const [formErrors, setFormErrors] = useState<PatientFormErrors>({});

    // ─── Automated Service Selection Logic ───
    useEffect(() => {
        if (!selectedService) {
            let initialService = null;
            if (serviceIdParam && allOptions.length > 0) {
                initialService = allOptions.find((s: any) => s.id === serviceIdParam);
            }
            if (!initialService && allOptions.length > 0) {
                initialService = null; // Don't auto-select; user must choose
            }
            setSelectedService(initialService);
        }
    }, [serviceIdParam, allOptions.length, selectedService]);

    // Slot availability state
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [isClosed, setIsClosed] = useState(false);

    // Payment error state
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);

    const canBookOnline = !!selectedService;

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    // Fetch available dates for the next X days
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setDatesLoading(true);
            setDatesError(null);
            try {
                const res = await fetch("/api/available-dates?days=365");
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load available dates");
                }

                const dates = Array.isArray(data?.dates)
                    ? data.dates
                          .map((d: any) =>
                              d?.date ? new Date(`${String(d.date)}T00:00:00`) : null
                          )
                          .filter(Boolean)
                    : [];

                if (cancelled) return;
                setAvailableDates(dates as Date[]);

                // If the currently selected date isn't available, pick the first available one
                if (dates.length > 0) {
                    const selectedStr = format(selectedDate, "yyyy-MM-dd");
                    const exists = (dates as Date[]).some(
                        (dt) => format(dt, "yyyy-MM-dd") === selectedStr
                    );
                    if (!exists) {
                        setSelectedDate(new Date(dates[0]));
                    }
                }
            } catch (e: any) {
                if (cancelled) return;
                setAvailableDates([]);
                setDatesError(e?.message || "Failed to load available dates");
            } finally {
                if (!cancelled) setDatesLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        if (selectedService) setStep(2);
    };

    const handleStep2Submit = () => {
        if (selectedTime) setStep(3);
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        const trimmedName = formData.name.trim();
        const trimmedEmail = formData.email.trim();
        const phoneDigits = formData.phone.replace(/\D/g, "");
        const trimmedNotes = formData.notes.trim();
        const nextErrors: PatientFormErrors = {};

        if (trimmedName.length < 2) {
            nextErrors.name = "Please enter at least 2 characters for full name.";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) {
            nextErrors.email = "Please enter a valid email address.";
        }

        if (phoneDigits.length !== 11) {
            nextErrors.phone = "Contact number must be exactly 11 digits.";
        }

        if (trimmedNotes.length > 500) {
            nextErrors.notes = "Medical notes cannot exceed 500 characters.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        setFormErrors({});

        if (!selectedService.id || !isMongoObjectId(String(selectedService.id))) {
            setPaymentError("Please select a valid vaccine before proceeding.");
            return;
        }

        setIsCreatingPayment(true);
        setPaymentError(null);

        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vaccineId: String(selectedService.id),
                    date: format(selectedDate, "yyyy-MM-dd"),
                    time: selectedTime,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: phoneDigits,
                    notes: trimmedNotes || undefined,
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
            setBookingFee(data.bookingFee ?? 5);
            setServicePrice(data.servicePrice ?? 0);
            setTotalAmount(data.totalAmount ?? (data.servicePrice ?? 0) + (data.bookingFee ?? 5));
            setStep(4);
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
          <BookingProgress step={step} setStep={setStep} />

            <div className="p-6 sm:p-12 min-h-125">
                {/* ─── Step 1: Select Service ─── */}
                {step === 1 && (
                    <StepSelectService
                        allOptions={allOptions}
                        filteredOptions={filteredOptions}
                        selectedService={selectedService}
                        setSelectedService={setSelectedService}
                        serviceSearch={serviceSearch}
                        setServiceSearch={setServiceSearch}
                        onContinue={handleStep1Submit}
                    />
                )}

                {/* ─── Step 2: Schedule (Date & Time) ─── */}
                {step === 2 && (
                    <StepSchedule
                        selectedService={selectedService}
                        datesLoading={datesLoading}
                        datesError={datesError}
                        availableDates={availableDates}
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        availableSlots={availableSlots}
                        slotsLoading={slotsLoading}
                        isClosed={isClosed}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        onBack={() => setStep(1)}
                        onContinue={handleStep2Submit}
                    />
                )}

                {/* ─── Step 3: Patient Details ─── */}
                {step === 3 && (
                    <StepDetails
                        setStep={setStep}
                        formData={formData}
                        setFormData={setFormData}
                        formErrors={formErrors}
                        setFormErrors={setFormErrors}
                        handleDetailsSubmit={handleDetailsSubmit}
                        isCreatingPayment={isCreatingPayment}
                        paymentError={paymentError}
                    />
                )}

                {/* ─── Step 4: Secure Payment ─── */}
                {step === 4 && clientSecret && (
                    <StepPayment
                        setStep={setStep}
                        selectedService={selectedService}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        formData={formData}
                        isMockPayment={isMockPayment}
                        clientSecret={clientSecret}
                        handleBookingSuccess={handleBookingSuccess}
                        bookingFee={bookingFee}
                        servicePrice={servicePrice}
                        totalAmount={totalAmount}
                    />
                )}
            </div>
        </div>
    );
}
