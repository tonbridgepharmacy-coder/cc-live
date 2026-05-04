import React from 'react'

interface StepSelectServiceProps {
    allOptions: any[];
    filteredOptions: any[];
    selectedService: any;
    setSelectedService: (service: any) => void;
    serviceSearch: string;
    setServiceSearch: (search: string) => void;
    onContinue: () => void;
}

const StepSelectService = ({ allOptions, filteredOptions, selectedService, setSelectedService, serviceSearch, setServiceSearch, onContinue }: StepSelectServiceProps) => {
  return (
    <div className="animate-in fade-in duration-300">
        <h2 className="text-2xl font-black text-slate-900 mb-1">Choose a Service</h2>
        <p className="text-sm text-slate-400 mb-6">Select the service or vaccine you&apos;d like to book.</p>

        {allOptions.length === 0 && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-2xl px-4 py-3 border border-red-100 mb-4">
                No services available for online booking right now. Please contact the clinic.
            </p>
        )}

        {/* Search */}
        <div className="relative mb-4">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
            <input
                type="text"
                placeholder="Search services or vaccines..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm"
            />
        </div>

        {/* Scrollable list */}
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 py-1">
            {filteredOptions.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-10">No matches found</p>
            )}
            {filteredOptions.map((option: any) => {
                const isSelected = selectedService?.id === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedService(option)}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left rounded-2xl border-2 transition-all ${
                            isSelected
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                            option.type === 'vaccine' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {option.type}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-slate-800 leading-snug">{option.title}</span>
                        {option.price > 0 && (
                            <span className={`shrink-0 text-sm font-bold ${ isSelected ? 'text-primary' : 'text-slate-400' }`}>
                                £{option.price}
                            </span>
                        )}
                        {isSelected && (
                            <svg className="shrink-0 w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                );
            })}
        </div>

        <div className="mt-6 flex justify-end">
            <button
                disabled={!selectedService}
                onClick={onContinue}
                className="px-8 py-3 rounded-full bg-primary text-white font-semibold text-sm disabled:opacity-40 hover:bg-primary-dark transition-all shadow-sm disabled:shadow-none"
            >
                Continue
            </button>
        </div>
    </div>
  )
}

export default StepSelectService