import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, startOfMonth, startOfToday, startOfWeek, subMonths } from 'date-fns';
import React from 'react'

interface StepScheduleProps {
    selectedService: any;
    datesLoading: boolean;
    datesError: string | null;
    availableDates: Date[];
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date) => void;
    availableSlots: { time: string; available: number }[];
    slotsLoading: boolean;
    isClosed: boolean;
    selectedTime: string | null;
    setSelectedTime: (time: string) => void;
    onBack: () => void;
    onContinue: () => void;
};

const StepSelectSchedule = ( { selectedService, datesLoading, datesError, availableDates, currentMonth, setCurrentMonth, selectedDate, setSelectedDate, availableSlots, slotsLoading, isClosed, selectedTime, setSelectedTime, onBack, onContinue } : StepScheduleProps ) => {

  return (
     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Selected service chip + back */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <button onClick={onBack} className="inline-flex items-center gap-3 text-sm font-black text-slate-400 hover:text-primary transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </div>
                                Change Service
                            </button>
                            {selectedService && (
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/5 rounded-2xl border border-primary/20">
                                    <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                                    <span className="text-sm font-black text-slate-900">{selectedService.title}</span>
                                    {selectedService.price > 0 && <span className="text-sm font-bold text-slate-500">£{selectedService.price}</span>}
                                </div>
                            )}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Date Picker */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">1</div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Pick a Date</h2>
                                </div>
                                {datesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl animate-pulse">
                                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading dates...</span>
                                    </div>
                                ) : datesError ? (
                                    <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
                                        <p className="font-black text-red-700">Failed to load available dates</p>
                                        <p className="text-xs text-red-500 mt-1 font-bold">{datesError}</p>
                                    </div>
                                ) : availableDates.length === 0 ? (
                                    <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-100">
                                        <p className="font-black text-amber-700">No Dates Available</p>
                                        <p className="text-xs text-amber-600 mt-1 font-bold">Please try again later.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                                        {/* Calendar Navigator */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                                            <button 
                                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                                disabled={isSameMonth(currentMonth, startOfMonth(addDays(startOfToday(), 1)))}
                                                className="p-2 hover:bg-white rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{format(currentMonth, "MMMM yyyy")}</span>
                                            <button 
                                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                                className="p-2 hover:bg-white rounded-xl transition-all"
                                            >
                                                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="p-4">
                                            <div className="grid grid-cols-7 mb-2">
                                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                                    <div key={day} className="text-[10px] font-black text-slate-400 text-center uppercase tracking-wider py-1">{day}</div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-1">
                                                {(() => {
                                                    const start = startOfWeek(startOfMonth(currentMonth));
                                                    const end = endOfWeek(endOfMonth(currentMonth));
                                                    const days = eachDayOfInterval({ start, end });
                                                    
                                                    return days.map((day) => {
                                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                                        const isAvailable = availableDates.some(ad => isSameDay(ad, day));
                                                        const isPast = isBefore(day, startOfToday());
                                                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                                        const isBookable = isAvailable && !isPast;

                                                        return (
                                                            <button
                                                                key={day.toISOString()}
                                                                disabled={!isBookable}
                                                                onClick={() => setSelectedDate(day)}
                                                                className={`
                                                                    aspect-square flex items-center justify-center text-sm rounded-xl transition-all relative
                                                                    ${!isCurrentMonth ? "opacity-0 pointer-events-none" : ""}
                                                                    ${isSelected 
                                                                        ? "bg-primary text-white font-black shadow-lg shadow-primary/30 scale-105 z-10" 
                                                                        : isBookable 
                                                                            ? "hover:bg-primary/10 hover:text-primary text-slate-700 font-bold bg-white border border-slate-100" 
                                                                            : "text-slate-200 cursor-not-allowed"
                                                                    }
                                                                `}
                                                            >
                                                                {format(day, "d")}
                                                                {isBookable && !isSelected && (
                                                                    <div className="absolute bottom-1 w-1 h-1 bg-primary/40 rounded-full" />
                                                                )}
                                                            </button>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <p className="mt-4 text-[10px] text-slate-400 italic font-bold tracking-wide">* Showing only available dates.</p>
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
                                        {availableSlots.map((slot) => {
                                            const isReserved = slot.available <= 0;
                                            const isSelected = selectedTime === slot.time;

                                            return (
                                                <button
                                                    key={slot.time}
                                                    onClick={() => {
                                                        if (!isReserved) setSelectedTime(slot.time);
                                                    }}
                                                    disabled={isReserved}
                                                    className={`py-3 rounded-xl text-sm font-black transition-all relative ${
                                                        isReserved
                                                            ? "bg-red-50 border border-red-200 text-red-600 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-secondary text-white shadow-lg shadow-secondary/30 ring-2 ring-secondary ring-offset-2"
                                                                : "bg-white border border-slate-200 hover:border-secondary/50 text-slate-700"
                                                    }`}
                                                >
                                                    <span className="block leading-none">{slot.time}</span>
                                                    {isReserved && (
                                                        <span className="block mt-1 text-[10px] uppercase tracking-wider">Reserved</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="pt-10 border-t border-slate-100 flex justify-end">
                            <button
                                disabled={!selectedTime}
                                onClick={onContinue}
                                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-14 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                Continue to Details
                            </button>
                        </div>
                    </div>
  )
}

export default StepSelectSchedule