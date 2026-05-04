import { format } from 'date-fns'
import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx"
);

const CheckoutForm = ({ amount, onSuccess }: { amount: number; onSuccess: () => void }) => {
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
            confirmParams: { return_url: `${window.location.origin}/book/success` },
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
            {errorMessage && <div className="text-red-500 text-sm mt-2 font-bold">{errorMessage}</div>}
            <button
                disabled={!stripe || isProcessing}
                className="w-full bg-secondary hover:bg-secondary-dark text-white font-black py-4 rounded-2xl disabled:opacity-50 transition-all shadow-xl active:scale-95 text-lg"
            >
                {isProcessing ? "Processing Security..." : `Confirm & Pay £${amount}`}
            </button>
        </form>
    );
};

const StepPayment = ({ setStep, selectedService, selectedDate, selectedTime, formData, isMockPayment, clientSecret, handleBookingSuccess }: any) => {
  return (
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
  )
}

export default StepPayment