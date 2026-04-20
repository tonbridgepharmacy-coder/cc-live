"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RejectAppointmentButtonProps {
    appointmentId: string;
    customerName: string;
    customTrigger?: React.ReactNode;
}

export default function RejectAppointmentButton({
    appointmentId,
    customerName,
    customTrigger
}: RejectAppointmentButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Focus textarea when modal opens
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                handleClose();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen]);

    const handleClose = () => {
        if (isLoading) return;
        setIsOpen(false);
        setReason("");
        setError("");
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason for rejection.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/appointments/${appointmentId}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rejectionReason: reason.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reject appointment");
                setIsLoading(false);
                return;
            }

            // Success — close modal and refresh
            setIsOpen(false);
            setReason("");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            {customTrigger ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                    {customTrigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                    Reject
                </button>
            )}

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleClose();
                    }}
                >
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                        style={{
                            animation: "fadeInUp 0.2s ease-out",
                        }}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-red-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Reject Appointment
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            for {customerName}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-amber-800">
                                    <strong>⚠️ This action cannot be undone.</strong> The client will
                                    receive an email with the rejection reason, and a refund will
                                    be initiated within 24 hours if payment was made.
                                </p>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                ref={textareaRef}
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    setError("");
                                }}
                                placeholder="e.g., The requested vaccine is currently unavailable due to supply chain issues. We recommend rebooking after..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-shadow"
                                rows={4}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                This message will be sent to the client via email.
                            </p>

                            {error && (
                                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isLoading || !reason.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Rejecting...
                                    </>
                                ) : (
                                    "Reject & Notify Client"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation keyframes */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </>
    );
}
