"use client";

import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import EnquiryActions from "@/components/admin/EnquiryActions";

type EnquiryItem = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    createdAt: string | Date;
};

interface EnquiriesClientProps {
    enquiries: EnquiryItem[];
    onStatusUpdate: (id: string, status: "pending" | "contacted" | "hold") => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function EnquiriesClient({ enquiries, onStatusUpdate, onDelete }: EnquiriesClientProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState(false);

    const statusColors: Record<string, string> = {
        pending: "bg-amber-50 text-amber-600 border-amber-100",
        contacted: "bg-emerald-50 text-emerald-600 border-emerald-100",
        hold: "bg-orange-50 text-orange-600 border-orange-100",
        hot: "bg-rose-50 text-rose-600 border-rose-100",
        warm: "bg-orange-50 text-orange-500 border-orange-100",
        cold: "bg-blue-50 text-blue-500 border-blue-100",
    };

    const allSelected = useMemo(
        () => enquiries.length > 0 && enquiries.every((item) => selectedIds.has(item._id)),
        [enquiries, selectedIds]
    );

    const selectedRows = useMemo(
        () => enquiries.filter((item) => selectedIds.has(item._id)),
        [enquiries, selectedIds]
    );

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
            return;
        }
        setSelectedIds(new Set(enquiries.map((e) => e._id)));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleExportCsv = () => {
        const rows = selectedRows.length > 0 ? selectedRows : enquiries;
        if (rows.length === 0) {
            alert("No enquiries to export.");
            return;
        }

        const headers = ["ID", "Date", "Time", "Name", "Email", "Phone", "Message", "Status"];
        const escapeCsv = (value: string) => {
            if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
                return `"${value.replace(/\"/g, '""')}"`;
            }
            return value;
        };

        const lines = rows.map((enquiry) => {
            const date = new Date(enquiry.createdAt);
            return [
                enquiry._id,
                date.toLocaleDateString(),
                date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                enquiry.name,
                enquiry.email,
                enquiry.phone,
                enquiry.message,
                enquiry.status,
            ]
                .map((v) => escapeCsv(String(v ?? "")))
                .join(",");
        });

        const csv = [headers.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleBulkStatus = async (status: "pending" | "contacted" | "hold") => {
        if (selectedRows.length === 0) {
            alert("Please select at least one enquiry.");
            return;
        }

        setBusy(true);
        try {
            await Promise.all(selectedRows.map((row) => onStatusUpdate(row._id, status)));
            setSelectedIds(new Set());
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Failed to update selected enquiries.");
        } finally {
            setBusy(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one enquiry.");
            return;
        }

        const confirmDelete = window.confirm(`Delete ${selectedRows.length} selected enquiries?`);
        if (!confirmDelete) return;

        setBusy(true);
        try {
            await Promise.all(selectedRows.map((row) => onDelete(row._id)));
            setSelectedIds(new Set());
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "Failed to delete selected enquiries.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-border rounded-2xl px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-600">
                    {selectedRows.length > 0
                        ? `${selectedRows.length} selected`
                        : "Select rows to use bulk actions"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleBulkStatus("pending")}
                        disabled={selectedRows.length === 0 || busy}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                    >
                        Mark Pending
                    </button>
                    <button
                        onClick={() => handleBulkStatus("contacted")}
                        disabled={selectedRows.length === 0 || busy}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                    >
                        Mark Contacted
                    </button>
                    <button
                        onClick={() => handleBulkStatus("hold")}
                        disabled={selectedRows.length === 0 || busy}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 disabled:opacity-40"
                    >
                        Mark Hold
                    </button>
                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedRows.length === 0 || busy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                        Bulk Delete
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-border/60 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-border">
                            <tr>
                                <th className="p-5">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-slate-300"
                                        aria-label="Select all enquiries"
                                    />
                                </th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Received Date</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Details</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Patient Message</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H10.414a1 1 0 01-.707-.293L7.293 13.293A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700">No enquiries yet</h3>
                                            <p className="text-slate-500 text-sm mt-1">New enquiries will appear here as they come in.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                enquiries.map((enquiry) => (
                                    <tr key={enquiry._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-5 align-top">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(enquiry._id)}
                                                onChange={() => toggleSelectOne(enquiry._id)}
                                                className="mt-1 h-4 w-4 rounded border-slate-300"
                                                aria-label={`Select enquiry ${enquiry.name}`}
                                            />
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{new Date(enquiry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                                                <span className="text-xs text-slate-400 font-medium">{new Date(enquiry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{enquiry.name}</span>
                                                <span className="text-xs text-slate-400">{enquiry.email}</span>
                                                <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{enquiry.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-sm text-slate-600 line-clamp-2 max-w-xs italic leading-relaxed">
                                                &quot;{enquiry.message}&quot;
                                            </p>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${statusColors[enquiry.status] || "bg-slate-50 text-slate-400"}`}>
                                                    {enquiry.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-end">
                                                <EnquiryActions
                                                    enquiry={enquiry}
                                                    onStatusUpdate={onStatusUpdate}
                                                    onDelete={onDelete}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
