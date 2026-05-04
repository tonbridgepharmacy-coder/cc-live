import React from 'react'

interface StepDetailsProps {
    setStep: (step: number) => void;
    formData: { 
        name: string;
        email: string;
        phone: string;
        notes: string;
    };
    setFormData: (data: any) => void;
    formErrors: {
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
    };
    setFormErrors: React.Dispatch<React.SetStateAction<{
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
    }>>;
    handleDetailsSubmit: (e: React.FormEvent) => void;
    isCreatingPayment: boolean;
    paymentError: string | null;
}



const StepDetails = ({ setStep, formData, setFormData, formErrors, setFormErrors, handleDetailsSubmit, isCreatingPayment, paymentError }: StepDetailsProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <button onClick={() => setStep(2)} className="inline-flex items-center gap-3 text-sm font-black text-slate-400 hover:text-primary mb-10 transition-colors group">
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
                                                onChange={(e) => {
                                                    setFormData({ ...formData, name: e.target.value });
                                                    if (formErrors.name) {
                                                        setFormErrors((prev) => ({ ...prev, name: undefined }));
                                                    }
                                                }}
                                                minLength={2}
                                                maxLength={80}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none font-bold placeholder:text-slate-300"
                                            />
                                            {formErrors.name && <p className="mt-2 text-xs font-bold text-red-600">{formErrors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="patient@medical.com"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (formErrors.email) {
                                                        setFormErrors((prev) => ({ ...prev, email: undefined }));
                                                    }
                                                }}
                                                maxLength={120}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none font-bold placeholder:text-slate-300"
                                            />
                                            {formErrors.email && <p className="mt-2 text-xs font-bold text-red-600">{formErrors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Contact Number</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="07700 900123"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
                                                    setFormData({ ...formData, phone: digitsOnly });
                                                    if (formErrors.phone) {
                                                        setFormErrors((prev) => ({ ...prev, phone: undefined }));
                                                    }
                                                }}
                                                inputMode="numeric"
                                                pattern="\d{11}"
                                                minLength={11}
                                                maxLength={11}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none font-bold placeholder:text-slate-300"
                                            />
                                            {formErrors.phone && <p className="mt-2 text-xs font-bold text-red-600">{formErrors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Medical Notes (Optional)</label>
                                            <textarea
                                                rows={10}
                                                placeholder="Allergies, chronic conditions, or specific requirements..."
                                                value={formData.notes}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, notes: e.target.value });
                                                    if (formErrors.notes) {
                                                        setFormErrors((prev) => ({ ...prev, notes: undefined }));
                                                    }
                                                }}
                                                maxLength={500}
                                                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary transition-all text-slate-900 outline-none resize-none font-bold placeholder:text-slate-300"
                                            />
                                            <div className="mt-2 flex items-center justify-between gap-4">
                                                {formErrors.notes ? (
                                                    <p className="text-xs font-bold text-red-600">{formErrors.notes}</p>
                                                ) : (
                                                    <span />
                                                )}
                                                <p className="text-[10px] font-bold text-slate-400">{formData.notes.length}/500</p>
                                            </div>
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
  )
}

export default StepDetails