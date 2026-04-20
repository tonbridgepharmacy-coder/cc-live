"use client";

import { useState } from "react";
import { Mail, X, Send, RotateCcw, FileText, Sparkles } from "lucide-react";
import { sendManualMail } from "@/lib/actions/mail";
import { useEffect } from "react";

interface ManualMailModalProps {
    customerEmail: string;
    customerName: string;
    triggerLabel?: string;
    customTrigger?: React.ReactNode;
}

export default function ManualMailModal({
    customerEmail,
    customerName,
    triggerLabel = "Send Email",
    customTrigger
}: ManualMailModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const templates = [
        {
            name: "General Inquiry",
            subject: "Update from Clarke & Coleman Pharmacy",
            message: `Dear ${customerName},

Thank you for reaching out to Clarke & Coleman Pharmacy. 

How can we assist you today? We have received your inquiry and our team is ready to provide you with the professional care you deserve.

If you have any specific questions regarding your prescription or our services, please feel free to reply to this email or call us directly.

Best regards,
The Team at Clarke & Coleman Pharmacy`
        },
        {
            name: "Appointment Follow-up",
            subject: "Regarding your Appointment at Clarke & Coleman Pharmacy",
            message: `Dear ${customerName},

We are writing to follow up regarding your recent appointment request at Clarke & Coleman Pharmacy.

Could you please provide us with some additional details so we can finalize your booking? Alternatively, if you need to reschedule or have any questions about your visit, we are here to help.

We look forward to seeing you soon.

Best regards,
Patient Care Team
Clarke & Coleman Pharmacy`
        }
    ];

    // Set default template when modal opens
    useEffect(() => {
        if (isOpen && !subject && !message) {
            setSubject(templates[0].subject);
            setMessage(templates[0].message);
        }
    }, [isOpen]);

    const applyTemplate = (t: typeof templates[0]) => {
        setSubject(t.subject);
        setMessage(t.message);
    };

    const handleSend = async () => {
        if (!subject || !message) {
            alert("Subject and Message are required");
            return;
        }

        setIsSending(true);
        try {
            const res = await sendManualMail({
                to: customerEmail,
                subject,
                message,
                customerName
            });

            if (res.success) {
                alert("Email sent successfully!");
                setIsOpen(false);
                setSubject("");
                setMessage("");
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            {customTrigger ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                    {customTrigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-xs font-semibold px-2 py-1 rounded bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all"
                >
                    <Mail size={14} />
                    {triggerLabel}
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !isSending && setIsOpen(false)}
                    />
                    
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Send Manual Mail</h3>
                                    <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">To: {customerName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isSending}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recipient Email</label>
                                <input
                                    type="text"
                                    value={customerEmail}
                                    readOnly
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-500 px-4 py-2.5 rounded-xl text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter email subject"
                                    className="w-full bg-white border border-slate-200 focus:border-primary px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                />
                            </div>

                            <div className="pt-1">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                                    <Sparkles size={12} />
                                    Quick Templates
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {templates.map(t => (
                                        <button
                                            key={t.name}
                                            onClick={() => applyTemplate(t)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                                subject === t.subject 
                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                                                : "bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary"
                                            }`}
                                        >
                                            <FileText size={12} />
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your email content here..."
                                    rows={8}
                                    className="w-full bg-white border border-slate-200 focus:border-primary px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isSending}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                {isSending ? (
                                    <>
                                        <RotateCcw className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
