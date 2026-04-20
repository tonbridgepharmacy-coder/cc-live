"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Mail, Trash2, CheckCircle, Clock, Eye, Flame, Thermometer, Snowflake } from "lucide-react";
import ManualMailModal from "./ManualMailModal";

interface EnquiryActionsProps {
    enquiry: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        message: string;
        status: string;
        createdAt?: string | Date;
    };
    onStatusUpdate: (id: string, status: "pending" | "contacted" | "hold") => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function EnquiryActions({ enquiry, onStatusUpdate, onDelete }: EnquiryActionsProps) {
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

    const id = enquiry._id.toString();
    const currentStatus = enquiry.status;

    const statuses = [
        { id: "pending", label: "Pending", icon: <Clock size={16} />, color: "text-slate-500" },
        { id: "contacted", label: "Contacted", icon: <CheckCircle size={16} />, color: "text-emerald-600" },
        { id: "hold", label: "On Hold", icon: <Clock size={16} />, color: "text-amber-600" },
        { id: "hot", label: "Hot Lead", icon: <Flame size={16} />, color: "text-rose-600", disabled: true },
        { id: "warm", label: "Warm Lead", icon: <Thermometer size={16} />, color: "text-orange-500", disabled: true },
        { id: "cold", label: "Cold Lead", icon: <Snowflake size={16} />, color: "text-blue-500", disabled: true },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Enquiry Actions"
            >
                <MoreVertical size={18} className="text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enquiry Controls</p>
                    </div>

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

                        <div className="contents" onClick={(e) => e.stopPropagation()}>
                            <ManualMailModal 
                                customerEmail={enquiry.email} 
                                customerName={enquiry.name}
                                customTrigger={
                                    <div className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all">
                                        <Mail size={16} />
                                        Reply via Email
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    <div className="my-2 border-t border-border mx-4" />

                    <div className="px-4 py-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status</p>
                    </div>

                    <div className="px-2 space-y-0.5 max-h-48 overflow-y-auto scrollbar-hide">
                        {statuses.map(status => (
                            <button 
                                key={status.id}
                                onClick={async () => {
                                    if (status.disabled) return;
                                    await onStatusUpdate(id, status.id as "pending" | "contacted" | "hold");
                                    setIsOpen(false);
                                }}
                                disabled={Boolean(status.disabled)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all ${
                                    currentStatus === status.id 
                                    ? "bg-slate-100 font-bold " + status.color
                                    : status.disabled
                                        ? "text-slate-300 cursor-not-allowed"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {status.icon}
                                {status.label}
                            </button>
                        ))}
                    </div>

                    <div className="my-2 border-t border-border mx-4" />

                    <div className="px-2">
                        <button 
                            onClick={async () => {
                                if (window.confirm("Are you sure you want to delete this enquiry?")) {
                                    await onDelete(id);
                                    setIsOpen(false);
                                }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
                        >
                            <Trash2 size={16} />
                            Delete Entry
                        </button>
                    </div>
                </div>
            )}

            {isViewOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <button
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsViewOpen(false)}
                        aria-label="Close enquiry details"
                    />
                    <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white shadow-2xl p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enquiry Details</p>
                                <h3 className="text-lg font-black text-slate-800">{enquiry.name}</h3>
                            </div>
                            <button
                                onClick={() => setIsViewOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-700">{enquiry.email || "N/A"}</span></div>
                            <div><span className="text-slate-400">Phone:</span> <span className="font-semibold text-slate-700">{enquiry.phone || "N/A"}</span></div>
                            <div><span className="text-slate-400">Status:</span> <span className="font-semibold text-slate-700">{enquiry.status}</span></div>
                            <div><span className="text-slate-400">Received:</span> <span className="font-semibold text-slate-700">{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : "N/A"}</span></div>
                            <div>
                                <p className="text-slate-400 mb-1">Message:</p>
                                <p className="font-medium text-slate-700 whitespace-pre-wrap break-words bg-slate-50 border border-slate-100 rounded-xl p-3">
                                    {enquiry.message || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
