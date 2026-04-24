"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Search, Calendar as CalendarIcon, Download, Trash2, Send, CalendarPlus } from "lucide-react";
import AppointmentActions from "@/components/admin/AppointmentActions";
import { sendManualMail } from "@/lib/actions/mail";

type AppointmentItem = {
    _id: string;
    slotDate: string | Date;
    slotTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    vaccineId?: { title?: string } | null;
    amountPaid: number;
    status: string;
    paymentStatus: string;
    isLegacy?: boolean;
};

type LegacyBooking = {
    _id: string;
    bookingDate: string | Date;
    serviceName: string;
    servicePrice: number;
    status: string;
    paymentStatus: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    notes?: string;
};

type SlotApiSlot = {
    time: string; // HH:mm
    available: number;
    total: number;
};

const isReservedSlot = (slot: SlotApiSlot) => slot.available <= 0;

const getSlotOptionLabel = (slot: SlotApiSlot) =>
    isReservedSlot(slot)
        ? `${slot.time} (Reserved)`
        : `${slot.time} (${slot.available}/${slot.total})`;

interface AppointmentsClientProps {
    initialAppointments: AppointmentItem[];
    legacyBookings: LegacyBooking[];
    vaccines: Array<{ _id: string; title: string }>;
    services: Array<{ _id: string; title: string }>;
    onStatusUpdate: (formData: FormData) => Promise<void>;
    onLegacyStatusUpdate: (formData: FormData) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onDeleteLegacy: (id: string) => Promise<void>;
    onEdit: (id: string, data: Record<string, unknown>) => Promise<void>;
    onLegacyEdit: (id: string, data: Record<string, unknown>) => Promise<void>;
    onManualReserve: (formData: FormData) => Promise<void>;
}

export default function AppointmentsClient({ 
    initialAppointments, 
    legacyBookings,
    vaccines,
    services,
    onStatusUpdate,
    onLegacyStatusUpdate,
    onDelete,
    onDeleteLegacy,
    onEdit,
    onLegacyEdit,
    onManualReserve
}: AppointmentsClientProps) {
    const getErrorMessage = (error: unknown) =>
        error instanceof Error ? error.message : "Failed to reserve slot";

    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [bookingType, setBookingType] = useState<"VACCINE" | "SERVICES" | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkBusy, setBulkBusy] = useState(false);
    const [statusUpdatingIds, setStatusUpdatingIds] = useState<Set<string>>(new Set());
    const [bulkSubject, setBulkSubject] = useState("Appointment Update from Clarke & Coleman Pharmacy");
    const [bulkMessage, setBulkMessage] = useState("Hello,\n\nThis is an update regarding your appointment.\n\nBest regards,\nClarke & Coleman Pharmacy");
    const [bulkMailOpen, setBulkMailOpen] = useState(false);

    const [reserveForm, setReserveForm] = useState({
        vaccineId: vaccines?.[0]?._id || services?.[0]?._id || "",
        slotDate: "",
        slotTime: "",
        customerName: "Admin Reserved",
        customerEmail: "",
        customerPhone: "",
        notes: "",
    });
    const [reserveError, setReserveError] = useState<string | null>(null);
    const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
    const [reserveSubmitting, setReserveSubmitting] = useState(false);
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

    const [reserveSlots, setReserveSlots] = useState<SlotApiSlot[]>([]);
    const [reserveSlotsLoading, setReserveSlotsLoading] = useState(false);
    const [reserveSlotsError, setReserveSlotsError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadSlots() {
            if (!reserveForm.slotDate) {
                setReserveSlots([]);
                setReserveSlotsError(null);
                return;
            }

            setReserveSlotsLoading(true);
            setReserveSlotsError(null);

            try {
                const res = await fetch(`/api/slots?date=${encodeURIComponent(reserveForm.slotDate)}`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load slots");
                }

                const slots: SlotApiSlot[] = Array.isArray(data?.slots)
                    ? data.slots
                          .map((s: unknown) => {
                              if (!s || typeof s !== "object") return null;
                              const obj = s as Record<string, unknown>;
                              return {
                                  time: typeof obj.time === "string" ? obj.time : "",
                                  available:
                                      typeof obj.available === "number"
                                          ? obj.available
                                          : Number(obj.available ?? 0),
                                  total:
                                      typeof obj.total === "number"
                                          ? obj.total
                                          : Number(obj.total ?? 0),
                              } satisfies SlotApiSlot;
                          })
                          .filter((s: SlotApiSlot | null): s is SlotApiSlot => Boolean(s))
                          .filter((s: SlotApiSlot) => /^\d{2}:\d{2}$/.test(s.time))
                    : [];

                if (cancelled) return;
                setReserveSlots(slots);
            } catch (err: unknown) {
                if (cancelled) return;
                setReserveSlots([]);
                setReserveSlotsError(getErrorMessage(err));
            } finally {
                if (!cancelled) setReserveSlotsLoading(false);
            }
        }

        loadSlots();

        return () => {
            cancelled = true;
        };
    }, [reserveForm.slotDate]);

    // Normalizing legacy bookings to match Appointment interface for consistent rendering
    const normalizedLegacy: AppointmentItem[] = legacyBookings.map((lb) => ({
        ...lb,
        _id: String(lb._id),
        isLegacy: true,
        slotDate: lb.bookingDate,
        slotTime: format(new Date(lb.bookingDate), "h:mm a"),
        vaccineId: { title: lb.serviceName },
        amountPaid: lb.servicePrice,
        status: lb.status.toUpperCase(),
        paymentStatus: lb.paymentStatus.toUpperCase(),
    }));

    const allItems: AppointmentItem[] = [...initialAppointments, ...normalizedLegacy].sort(
        (a, b) => new Date(b.slotDate).getTime() - new Date(a.slotDate).getTime()
    );

    const tabs = [
        { id: "ALL", label: "All Status", count: allItems.length },
        { id: "PENDING", label: "Pending", count: allItems.filter(a => a.status === "PENDING").length },
        { id: "CONFIRMED", label: "Confirmed", count: allItems.filter(a => a.status === "CONFIRMED").length },
        { id: "COMPLETED", label: "Completed", count: allItems.filter(a => a.status === "COMPLETED").length },
        { id: "CANCELLED", label: "Failed/Cancelled", count: allItems.filter(a => ["CANCELLED", "REJECTED", "NO_SHOW"].includes(a.status)).length },
    ];

    const typeTabs = [
        { id: "ALL", label: "All Bookings", count: allItems.length },
        { id: "VACCINE", label: "Vaccinations", count: initialAppointments.length },
        { id: "SERVICES", label: "Pharmacy Services", count: normalizedLegacy.length },
    ];

    const filteredItems = allItems.filter(item => {
        const matchesStatus = activeTab === "ALL" || 
            (activeTab === "CANCELLED" ? ["CANCELLED", "REJECTED", "NO_SHOW"].includes(item.status) : item.status === activeTab);
        
        const matchesType = bookingType === "ALL" || 
            (bookingType === "VACCINE" ? !item.isLegacy : item.isLegacy);

        const matchesSearch = item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesStatus && matchesType && matchesSearch;
    });

    const selectedItems = filteredItems.filter((item) => selectedIds.has(item._id));

    const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item._id));

    const toggleSelectAllVisible = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) {
                filteredItems.forEach((item) => next.delete(item._id));
            } else {
                filteredItems.forEach((item) => next.add(item._id));
            }
            return next;
        });
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toCalendarUrl = (apt: AppointmentItem) => {
        const rawDate = new Date(apt.slotDate);
        const hhmm = /^\d{2}:\d{2}$/.test(apt.slotTime) ? apt.slotTime : format(rawDate, "HH:mm");
        const [h, m] = hhmm.split(":").map(Number);
        rawDate.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
        const endDate = new Date(rawDate.getTime() + 30 * 60 * 1000);
        const iso = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, "");
        const title = apt.vaccineId?.title || "Appointment";
        const details = encodeURIComponent(`Customer: ${apt.customerName}\nEmail: ${apt.customerEmail}`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${iso(rawDate)}/${iso(endDate)}&details=${details}`;
    };

    const handleExportCsv = () => {
        const rows = selectedItems.length > 0 ? selectedItems : filteredItems;
        if (rows.length === 0) {
            alert("No appointments available to export.");
            return;
        }

        const headers = [
            "ID",
            "Date",
            "Time",
            "Customer Name",
            "Customer Email",
            "Customer Phone",
            "Service",
            "Amount Paid",
            "Payment Status",
            "Status",
            "Booking Type",
        ];

        const escapeCsv = (value: string | number) => {
            const str = String(value ?? "");
            if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
                return `"${str.replace(/\"/g, '""')}"`;
            }
            return str;
        };

        const csvLines = [
            headers.join(","),
            ...rows.map((apt) => [
                escapeCsv(apt._id),
                escapeCsv(format(new Date(apt.slotDate), "yyyy-MM-dd")),
                escapeCsv(apt.slotTime || ""),
                escapeCsv(apt.customerName || ""),
                escapeCsv(apt.customerEmail || ""),
                escapeCsv(apt.customerPhone || ""),
                escapeCsv(apt.vaccineId?.title || ""),
                escapeCsv(apt.amountPaid || 0),
                escapeCsv(apt.paymentStatus || ""),
                escapeCsv(apt.status || ""),
                escapeCsv(apt.isLegacy ? "Pharmacy Service" : "Vaccination"),
            ].join(",")),
        ].join("\n");

        const blob = new Blob([csvLines], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `appointments-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one appointment.");
            return;
        }

        const confirmed = window.confirm(`Delete ${selectedItems.length} selected records permanently?`);
        if (!confirmed) return;

        setBulkBusy(true);
        try {
            await Promise.all(
                selectedItems.map((apt) => (apt.isLegacy ? onDeleteLegacy(apt._id) : onDelete(apt._id)))
            );
            setSelectedIds(new Set());
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Failed to delete selected records.");
        } finally {
            setBulkBusy(false);
        }
    };

    const handleBulkMail = async () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one appointment.");
            return;
        }
        if (!bulkSubject.trim() || !bulkMessage.trim()) {
            alert("Subject and message are required.");
            return;
        }

        const recipients = selectedItems
            .filter((item) => item.customerEmail)
            .map((item) => ({ email: item.customerEmail, name: item.customerName || "Customer" }));

        const uniqueRecipients = Array.from(new Map(recipients.map((r) => [r.email.toLowerCase(), r])).values());

        if (uniqueRecipients.length === 0) {
            alert("Selected items do not have valid customer email addresses.");
            return;
        }

        setBulkBusy(true);
        try {
            const results = await Promise.all(
                uniqueRecipients.map((recipient) =>
                    sendManualMail({
                        to: recipient.email,
                        subject: bulkSubject,
                        message: bulkMessage,
                        customerName: recipient.name,
                    })
                )
            );

            const failedCount = results.filter((r) => !r.success).length;
            if (failedCount > 0) {
                alert(`Bulk email sent with ${failedCount} failures. Please retry failed recipients.`);
            } else {
                alert(`Bulk email sent to ${uniqueRecipients.length} recipients.`);
                setBulkMailOpen(false);
            }
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Failed to send bulk email.");
        } finally {
            setBulkBusy(false);
        }
    };

    const handleBulkCalendar = () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one appointment.");
            return;
        }

        selectedItems.slice(0, 10).forEach((apt) => {
            window.open(toCalendarUrl(apt), "_blank", "noopener,noreferrer");
        });

        if (selectedItems.length > 10) {
            alert("Opened first 10 calendar events to avoid popup blocking. Export CSV for complete list.");
        }
    };

    const statusColors: Record<string, string> = {
        PENDING: "bg-amber-50 text-amber-600 border-amber-100",
        BLOCKED: "bg-slate-50 text-slate-700 border-slate-200",
        CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        COMPLETED: "bg-blue-50 text-blue-600 border-blue-100",
        CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
        REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
        NO_SHOW: "bg-slate-50 text-slate-600 border-slate-200",
    };

    const handleActionStatusUpdate = async (id: string, status: string) => {
        const formData = new FormData();
        formData.append("appointmentId", id);
        formData.append("status", status);
        await onStatusUpdate(formData);
    };

    const statusOptions = ["PENDING", "BLOCKED", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"];
    const legacyStatusOptions = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    const handleInlineStatusUpdate = async (apt: AppointmentItem, nextStatus: string) => {
        if (!nextStatus || apt.status === nextStatus || statusUpdatingIds.has(apt._id)) return;

        setStatusUpdatingIds((prev) => new Set(prev).add(apt._id));
        try {
            if (apt.isLegacy) {
                const fd = new FormData();
                fd.append("bookingId", apt._id);
                fd.append("status", nextStatus.toLowerCase());
                await onLegacyStatusUpdate(fd);
            } else {
                await handleActionStatusUpdate(apt._id, nextStatus);
            }
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setStatusUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(apt._id);
                return next;
            });
        }
    };

    const handleReserveSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setReserveError(null);
        setReserveSuccess(null);

        if (!reserveForm.vaccineId) {
            setReserveError("Please select a vaccine/service.");
            return;
        }
        if (!reserveForm.slotDate) {
            setReserveError("Please select a date.");
            return;
        }
        if (!reserveForm.slotTime) {
            setReserveError("Please enter a time (HH:mm)." );
            return;
        }

        setReserveSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("vaccineId", reserveForm.vaccineId);
            formData.append("slotDate", reserveForm.slotDate);
            formData.append("slotTime", reserveForm.slotTime);
            formData.append("customerName", reserveForm.customerName);
            formData.append("customerEmail", reserveForm.customerEmail);
            formData.append("customerPhone", reserveForm.customerPhone);
            formData.append("notes", reserveForm.notes);

            await onManualReserve(formData);
            setReserveSuccess("Slot reserved successfully.");

            setReserveForm((prev) => ({
                ...prev,
                slotTime: "",
                notes: "",
            }));
        } catch (err: unknown) {
            setReserveError(getErrorMessage(err));
        } finally {
            setReserveSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Main Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Appointments</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Manage patient visits, block slots, and export records.</p>
                </div>
                <button
                    onClick={() => setIsReserveModalOpen(true)}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <CalendarPlus size={18} />
                    Reserve a Slot
                </button>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 xl:grid-cols-[240px_260px_minmax(0,1fr)] gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="booking-type-filter" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Booking Type
                    </label>
                    <select
                        id="booking-type-filter"
                        value={bookingType}
                        onChange={(e) => setBookingType(e.target.value as "VACCINE" | "SERVICES" | "ALL")}
                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    >
                        {typeTabs.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.label} ({type.count})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="status-filter" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Status
                    </label>
                    <select
                        id="status-filter"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    >
                        {tabs.map((tab) => (
                            <option key={tab.id} value={tab.id}>
                                {tab.label} ({tab.count})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative self-end">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder="Search customer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Bulk Action Bar */}
            <div className="bg-white border border-border rounded-2xl px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-600">
                    {selectedItems.length > 0
                        ? `${selectedItems.length} selected`
                        : `Select rows to enable bulk actions`}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setBulkMailOpen(true)}
                        disabled={selectedItems.length === 0 || bulkBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                    >
                        <Send size={14} />
                        Bulk Email
                    </button>
                    <button
                        onClick={handleBulkCalendar}
                        disabled={selectedItems.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"
                    >
                        <CalendarPlus size={14} />
                        Add to Calendar
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedItems.length === 0 || bulkBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                        Bulk Delete
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-3xl border border-border/60 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-border">
                            <tr>
                                <th className="p-5">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleSelectAllVisible}
                                        className="h-4 w-4 rounded border-slate-300"
                                        aria-label="Select all visible appointments"
                                    />
                                </th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer Details</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type / Service</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                                <CalendarIcon size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700">No appointments found</h3>
                                            <p className="text-slate-500 text-sm mt-1">Try broading your filters or search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((apt) => (
                                    <tr key={apt._id.toString()} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-5 align-top">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(apt._id)}
                                                onChange={() => toggleSelectOne(apt._id)}
                                                className="mt-1 h-4 w-4 rounded border-slate-300"
                                                aria-label={`Select appointment ${apt.customerName}`}
                                            />
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex flex-col items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <span className="text-[10px] font-bold uppercase leading-none">{format(new Date(apt.slotDate), "MMM")}</span>
                                                    <span className="text-sm font-black leading-none">{format(new Date(apt.slotDate), "dd")}</span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{apt.slotTime}</div>
                                                    <div className="text-sm font-bold text-slate-700">{format(new Date(apt.slotDate), "yyyy")}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    {apt.customerName}
                                                </span>
                                                <span className="text-xs text-slate-400">{apt.customerEmail}</span>
                                                <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">{apt.customerPhone || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{apt.vaccineId?.title || "—"}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${apt.isLegacy ? 'text-amber-500' : 'text-primary'}`}>
                                                    {apt.isLegacy ? 'Pharmacy Service' : 'Vaccination'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-black text-slate-800">£{apt.amountPaid}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${apt.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                    {apt.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center">
                                                <select
                                                    value={apt.status}
                                                    title="Update appointment status"
                                                    aria-label={`Update status for ${apt.customerName}`}
                                                    disabled={statusUpdatingIds.has(apt._id)}
                                                    onChange={(e) => {
                                                        void handleInlineStatusUpdate(apt, e.target.value);
                                                    }}
                                                    className={`min-w-35 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm outline-none ${statusColors[apt.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}
                                                >
                                                    {(apt.isLegacy ? legacyStatusOptions : statusOptions).map((status) => (
                                                        <option key={status} value={status}>
                                                            {status.replace("_", " ")}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-end">
                                                {apt.isLegacy ? (
                                                    <AppointmentActions 
                                                        appointment={apt} 
                                                        onStatusUpdate={async (id, status) => {
                                                            const fd = new FormData();
                                                            fd.append("bookingId", id);
                                                            fd.append("status", status.toLowerCase());
                                                            await onLegacyStatusUpdate(fd);
                                                        }} 
                                                        onDelete={onDeleteLegacy}
                                                        onEdit={onLegacyEdit}
                                                    />
                                                ) : (
                                                    <AppointmentActions 
                                                        appointment={apt} 
                                                        onStatusUpdate={handleActionStatusUpdate} 
                                                        onDelete={onDelete}
                                                        onEdit={onEdit}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {bulkMailOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <button
                        className="absolute inset-0 bg-black/50"
                        onClick={() => !bulkBusy && setBulkMailOpen(false)}
                        aria-label="Close bulk email modal"
                    />
                    <div className="relative w-full max-w-xl rounded-2xl border border-border bg-white shadow-2xl">
                        <div className="px-6 py-4 border-b border-border">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bulk Email</p>
                            <h3 className="text-lg font-black text-slate-800">Send Email to {selectedItems.length} Selected Records</h3>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    value={bulkSubject}
                                    onChange={(e) => setBulkSubject(e.target.value)}
                                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    value={bulkMessage}
                                    onChange={(e) => setBulkMessage(e.target.value)}
                                    rows={8}
                                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setBulkMailOpen(false)}
                                disabled={bulkBusy}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkMail}
                                disabled={bulkBusy}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-60"
                            >
                                {bulkBusy ? "Sending..." : "Send Bulk Email"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reserve Slot Modal */}
            {isReserveModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl border border-border/60 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Reserve a Slot (Admin)</h2>
                                <p className="text-sm text-slate-500 font-medium tracking-tight">This creates a confirmed appointment to block a date/time so customers can’t book it.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsReserveModalOpen(false);
                                    setReserveSuccess(null);
                                    setReserveError(null);
                                    setReserveForm((prev) => ({ ...prev, slotTime: "", notes: "" }));
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleReserveSubmit} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="reserve-vaccine" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Vaccine or Service</label>
                                    <select
                                        id="reserve-vaccine"
                                        value={reserveForm.vaccineId}
                                        onChange={(e) => setReserveForm({ ...reserveForm, vaccineId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                        required
                                    >
                                        <option value="" disabled>Select category</option>
                                        {(vaccines && vaccines.length > 0) && (
                                            <optgroup label="Vaccines">
                                                {vaccines.map((v) => (
                                                    <option key={v._id} value={v._id}>{v.title}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                        {(services && services.length > 0) && (
                                            <optgroup label="Pharmacy Services">
                                                {services.map((s) => (
                                                    <option key={s._id} value={s._id}>{s.title}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reserve-date" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        id="reserve-date"
                                        type="date"
                                        value={reserveForm.slotDate}
                                        onChange={(e) => setReserveForm({ ...reserveForm, slotDate: e.target.value, slotTime: "" })}
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reserve-time" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                                    <select
                                        id="reserve-time"
                                        value={reserveForm.slotTime}
                                        onChange={(e) => setReserveForm({ ...reserveForm, slotTime: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                        required
                                        disabled={!reserveForm.slotDate || reserveSlotsLoading}
                                    >
                                        <option value="" disabled>
                                            {reserveSlotsLoading
                                                ? "Loading times..."
                                                : !reserveForm.slotDate
                                                    ? "Select a date first"
                                                    : reserveSlots.length === 0
                                                        ? "No times available"
                                                        : "Select time"}
                                        </option>
                                        {reserveSlots.map((s) => (
                                            <option
                                                key={s.time}
                                                value={s.time}
                                                disabled={isReservedSlot(s)}
                                            >
                                                {getSlotOptionLabel(s)}
                                            </option>
                                        ))}
                                    </select>
                                    {reserveSlotsError ? (
                                        <p className="text-xs font-bold text-red-600">{reserveSlotsError}</p>
                                    ) : reserveForm.slotDate && !reserveSlotsLoading && reserveSlots.length === 0 ? (
                                        <p className="text-xs font-bold text-amber-600">No available times for this date.</p>
                                    ) : reserveForm.slotDate && reserveSlots.some(isReservedSlot) ? (
                                        <p className="text-xs font-bold text-slate-500">Reserved slots are shown as <span className="text-rose-600">(Reserved)</span>.</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reserve-name" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name (optional)</label>
                                    <input
                                        id="reserve-name"
                                        type="text"
                                        value={reserveForm.customerName}
                                        onChange={(e) => setReserveForm({ ...reserveForm, customerName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reserve-email" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (optional)</label>
                                    <input
                                        id="reserve-email"
                                        type="email"
                                        placeholder="admin@..."
                                        value={reserveForm.customerEmail}
                                        onChange={(e) => setReserveForm({ ...reserveForm, customerEmail: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reserve-phone" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone (optional)</label>
                                    <input
                                        id="reserve-phone"
                                        type="text"
                                        placeholder="N/A"
                                        value={reserveForm.customerPhone}
                                        onChange={(e) => setReserveForm({ ...reserveForm, customerPhone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label htmlFor="reserve-notes" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optional)</label>
                                <textarea
                                    id="reserve-notes"
                                    rows={2}
                                    value={reserveForm.notes}
                                    onChange={(e) => setReserveForm({ ...reserveForm, notes: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                                    placeholder="Reason for reservation..."
                                />
                            </div>

                            {(reserveError || reserveSuccess) && (
                                <div className={`mt-6 px-4 py-3 rounded-xl border text-sm font-bold ${reserveError ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                    {reserveError || reserveSuccess}
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsReserveModalOpen(false);
                                        setReserveSuccess(null);
                                        setReserveError(null);
                                    }}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reserveSubmitting}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                                >
                                    {reserveSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span>Reserve Slot</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}