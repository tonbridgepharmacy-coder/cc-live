"use client";

import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { deleteService } from "@/lib/actions/service";

export default function ServicesClient({ services }: { services: any[] }) {
    const columns = [
        {
            header: "Service Name",
            accessor: "title",
            render: (row: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border border-border/50">
                        {row.cardImage && (
                            <Image
                                src={row.cardImage}
                                alt={row.title}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{row.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{row.category?.name || "Uncategorized"}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessor: "status",
            render: (row: any) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Services Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage the services offered by your pharmacy.</p>
                </div>
                <Link
                    href="/admin/services/new"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all"
                >
                    <Plus size={18} />
                    New Service
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden">
                <DataTable
                    data={services}
                    columns={columns}
                    editHrefPrefix="/admin/services"
                    deleteAction={deleteService as any}
                    searchPlaceholder="Search services..."
                    title=""
                />
            </div>
        </div>
    );
}
