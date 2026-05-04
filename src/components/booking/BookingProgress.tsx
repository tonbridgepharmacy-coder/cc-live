import React from 'react'

const BookingProgress = ({ step, setStep }: { step: number; setStep: (step: number) => void }) => {
  return (
      <div className="bg-slate-50 border-b border-border/60 p-6 sm:p-8">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-0" />
                    <div 
                        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 ease-in-out -z-0" 
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />

                    {["Service", "Schedule", "Details", "Payment"].map((label, index) => {
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
  )
}

export default BookingProgress