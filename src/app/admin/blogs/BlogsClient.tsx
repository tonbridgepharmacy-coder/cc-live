"use client";

import DataTable from "@/components/admin/DataTable";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteBlog } from "@/lib/actions/blog";

type BlogRow = {
    _id: string;
    title: string;
    image?: unknown;
    category?: string;
    status?: string;
    viewCount?: number;
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

export default function BlogsClient({ blogs }: { blogs: BlogRow[] }) {
    const columns = [
        {
            header: "Blog Post",
            accessor: "title",
            render: (row: BlogRow) => (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border border-border/50">
                        {typeof row.image === "string" && row.image.trim() && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={normalizeImageSrc(row.image)}
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
                        <div className="text-xs text-slate-500 mt-0.5">{row.category}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessor: "status",
            render: (row: BlogRow) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {(row.status || "draft").charAt(0).toUpperCase() + (row.status || "draft").slice(1)}
                </span>
            )
        },
        {
            header: "Views",
            accessor: "viewCount",
            render: (row: BlogRow) => (
                <span className="text-slate-600 font-medium">{row.viewCount || 0}</span>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blog Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage your pharmacy&apos;s health articles.</p>
                </div>
                <Link
                    href="/admin/blogs/new"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all"
                >
                    <Plus size={18} />
                    New Post
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden">
                <DataTable
                    data={blogs}
                    columns={columns}
                    editHrefPrefix="/admin/blogs"
                    deleteAction={deleteBlog}
                    searchPlaceholder="Search blogs..."
                    title=""
                />
            </div>
        </div>
    );
}
