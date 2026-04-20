"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, Mail, CheckCircle2, XCircle, AlertCircle, Ban, CalendarPlus } from "lucide-react";
import ManualMailModal from "./ManualMailModal";
import RejectAppointmentButton from "./RejectAppointmentButton";
import EditAppointmentModal from "./EditAppointmentModal";

interface AppointmentActionsProps {
    appointment: {
        _id: string;
        status: string;
        customerEmail?: string;
        customerName?: string;
        slotDate?: string | Date;
        slotTime?: string;
        vaccineId?: { title?: string } | null;
    };
    onStatusUpdate: (id: string, status: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    onEdit?: (id: string, data: Record<string, unknown>) => Promise<void>;
}

export default function AppointmentActions({ appointment, onStatusUpdate, onDelete, onEdit }: AppointmentActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const id = appointment._id.toString();
    const status = appointment.status;
    const eventTitle = appointment.vaccineId?.title || "Appointment";

    const openCalendar = () => {
        if (!appointment.slotDate || !appointment.slotTime) return;

        const [hours, minutes] = (appointment.slotTime || "00:00").split(":").map(Number);
        const start = new Date(appointment.slotDate);
        start.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
        const end = new Date(start.getTime() + 30 * 60 * 1000);

        const iso = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, "");
        const details = encodeURIComponent(`Customer: ${appointment.customerName || "N/A"}\nEmail: ${appointment.customerEmail || "N/A"}`);
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${iso(start)}/${iso(end)}&details=${details}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <>
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="More Actions"
            >
                <MoreVertical size={18} className="text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage Appointment</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 space-y-0.5">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsViewOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                        >
                            <Eye size={16} />
                            View Details
                        </button>

                        <button
                            onClick={() => {
                                openCalendar();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                        >
                            <CalendarPlus size={16} />
                            Add to Calendar
                        </button>

                        <div className="contents" onClick={(e) => e.stopPropagation()}>
                            <EditAppointmentModal 
                                appointment={appointment}
                                onSave={async (id, data) => {
                                    if (onEdit) await onEdit(id, data);
                                    setIsOpen(false);
                                }}
                                customTrigger={
                                    <div className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all">
                                        <Edit size={16} />
                                        Edit Details
                                    </div>
                                }
                            />
                        </div>
                        
                        <div className="contents" onClick={(e) => e.stopPropagation()}>
                            <ManualMailModal
                                customerEmail={appointment.customerEmail ?? "admin-reserved@local.invalid"}
                                customerName={appointment.customerName ?? "Admin"}
                                customTrigger={
                                    <div className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all">
                                        <Mail size={16} />
                                        Send Message
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    <div className="my-2 border-t border-border mx-4" />

                    <div className="px-4 py-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status</p>
                    </div>

                    <div className="px-2 space-y-0.5">
                        {(status === "PENDING" || status === "BLOCKED") && (
                            <button
                                onClick={() => { onStatusUpdate(id, "CONFIRMED"); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            >
                                <CheckCircle2 size={16} />
                                Approve
                            </button>
                        )}

                        {status === "CONFIRMED" && (
                            <button 
                                onClick={() => { onStatusUpdate(id, "COMPLETED"); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                                <CheckCircle2 size={16} />
                                Mark Completed
                            </button>
                        )}

                        {(status === "PENDING" || status === "CONFIRMED" || status === "BLOCKED") && (
                            <>
                                <button 
                                    onClick={() => { onStatusUpdate(id, "CANCELLED"); setIsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <XCircle size={16} />
                                    Cancel
                                </button>
                                
                                {status !== "BLOCKED" ? (
                                    <div className="contents" onClick={(e) => e.stopPropagation()}>
                                        <RejectAppointmentButton 
                                            appointmentId={id}
                                            customerName={appointment.customerName ?? "Customer"}
                                            customTrigger={
                                                <div className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl transition-all">
                                                    <Ban size={16} />
                                                    Reject & Notify
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : null}
                            </>
                        )}

                        {status === "CONFIRMED" && (
                            <button 
                                onClick={() => { onStatusUpdate(id, "NO_SHOW"); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <AlertCircle size={16} />
                                Patient No Show
                            </button>
                        )}
                    </div>

                    <div className="my-2 border-t border-border mx-4" />

                    <div className="px-2">
                        <button 
                            onClick={async () => {
                                if (onDelete && window.confirm("Are you sure you want to permanently delete this record? This cannot be undone.")) {
                                    await onDelete(id);
                                    setIsOpen(false);
                                }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
                        >
                            <Trash2 size={16} />
                            Delete Permanent
                        </button>
                    </div>
                </div>
            )}
        </div>

        {isViewOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <button
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsViewOpen(false)}
                    aria-label="Close details modal"
                />
                <div className="relative w-full max-w-md rounded-2xl border border-border bg-white shadow-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appointment Details</p>
                            <h3 className="text-lg font-black text-slate-800">{appointment.customerName || "Customer"}</h3>
                        </div>
                        <button
                            onClick={() => setIsViewOpen(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                            Close
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-700">{appointment.customerEmail || "N/A"}</span></div>
                        <div><span className="text-slate-400">Service:</span> <span className="font-semibold text-slate-700">{appointment.vaccineId?.title || "N/A"}</span></div>
                        <div><span className="text-slate-400">Date:</span> <span className="font-semibold text-slate-700">{appointment.slotDate ? new Date(appointment.slotDate).toLocaleDateString() : "N/A"}</span></div>
                        <div><span className="text-slate-400">Time:</span> <span className="font-semibold text-slate-700">{appointment.slotTime || "N/A"}</span></div>
                        <div><span className="text-slate-400">Status:</span> <span className="font-semibold text-slate-700">{appointment.status}</span></div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

// Special override for ManualMailModal style within this menu
// and the Reject button
