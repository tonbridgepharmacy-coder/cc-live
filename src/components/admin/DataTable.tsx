"use client";

import { Search, Filter, ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Column {
    header: string;
    accessor: string;
    render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    title?: string;
    description?: string;
    searchPlaceholder?: string;
    editHrefPrefix?: string;
    deleteAction?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DataTable({ columns, data, title, description, searchPlaceholder = "Search...", editHrefPrefix, deleteAction }: DataTableProps) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
            {/* Table Header */}
            {(title || description) && (
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
                        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                                >
                                    {col.header}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors group">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-sm text-slate-700">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editHrefPrefix && (
                                                <a
                                                    href={`${editHrefPrefix}/${row._id}`}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {deleteAction && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to delete this item?")) {
                                                            const res = await deleteAction(row._id);
                                                            if (res && res.success) {
                                                                router.refresh();
                                                            } else if (res && res.error) {
                                                                alert("Error: " + res.error);
                                                            }
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                            {!editHrefPrefix && !deleteAction && (
                                                <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400 text-sm">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-900">{data.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white transition-colors disabled:opacity-50" disabled>
                        <ChevronLeft size={18} />
                    </button>
                    <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white shadow-sm transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
