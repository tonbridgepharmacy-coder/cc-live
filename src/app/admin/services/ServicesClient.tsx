"use client";

import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteService } from "@/lib/actions/service";

type ServiceRow = {
    _id: string;
    title: string;
    cardImage?: unknown;
    category?: { name?: string } | null;
    status?: string;
};

function normalizeImageSrc(src: unknown) {
    if (typeof src !== "string") return "/placeholder-image.jpg";
    const trimmed = src.trim();
    if (!trimmed) return "/placeholder-image.jpg";

    const normalizedSlashes = trimmed.replace(/\\/g, "/");
    if (normalizedSlashes.startsWith("//")) return `https:${normalizedSlashes}`;

    if (normalizedSlashes.startsWith("http://") || normalizedSlashes.startsWith("https://")) {
        try {
            return new URL(normalizedSlashes).toString();
        } catch {
            return "/placeholder-image.jpg";
        }
    }

    if (normalizedSlashes.startsWith("/")) return normalizedSlashes;
    if (normalizedSlashes.startsWith("public/")) return `/${normalizedSlashes.slice("public/".length)}`;
    return `/${normalizedSlashes}`;
}

export default function ServicesClient({ services }: { services: ServiceRow[] }) {
    const columns = [
        {
            header: "Service Name",
            accessor: "title",
            render: (row: ServiceRow) => (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border border-border/50">
                        {typeof row.cardImage === "string" && row.cardImage.trim() && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={normalizeImageSrc(row.cardImage)}
                                alt={row.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder-image.jpg";
                                }}
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
            render: (row: ServiceRow) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {(row.status || "draft").charAt(0).toUpperCase() + (row.status || "draft").slice(1)}
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
                    deleteAction={deleteService}
                    searchPlaceholder="Search services..."
                    title=""
                />
            </div>
        </div>
    );
}
