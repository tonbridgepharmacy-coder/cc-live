"use client";

import Link from "next/link";
import { Plus, Edit2, Trash2, CheckCircle2, Clock } from "lucide-react";
import { deleteVaccine } from "@/lib/actions/vaccine";
import { useRouter } from "next/navigation";

type VaccineListItem = {
    _id: string;
    title: string;
    slug: string;
    cardImage?: unknown;
    category?: { name?: string } | null;
    price?: number | string;
    rating?: number | null;
    status?: "published" | "draft" | string;
};

function normalizeImageSrc(src: unknown) {
    if (typeof src !== "string") return "/placeholder-image.jpg";
    const trimmed = src.trim();
    if (!trimmed) return "/placeholder-image.jpg";

    const normalizedSlashes = trimmed.replace(/\\/g, "/");
    if (normalizedSlashes.startsWith("//")) {
        return `https:${normalizedSlashes}`;
    }

    if (
        normalizedSlashes.startsWith("http://") ||
        normalizedSlashes.startsWith("https://")
    ) {
        try {
            return new URL(normalizedSlashes).toString();
        } catch {
            return "/placeholder-image.jpg";
        }
    }

    if (normalizedSlashes.startsWith("/")) {
        return normalizedSlashes;
    }

    if (normalizedSlashes.startsWith("public/")) {
        return `/${normalizedSlashes.slice("public/".length)}`;
    }

    return `/${normalizedSlashes}`;
}

export default function VaccinesClient({ initialData }: { initialData: VaccineListItem[] }) {
    const router = useRouter();

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete the vaccine "${title}"?`)) {
            const res = await deleteVaccine(id);
            if (!res.success) {
                alert("Error deleting vaccine: " + res.error);
            } else {
                router.refresh();
            }
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vaccines</h1>
                    <p className="text-slate-500 mt-1">Manage all public-facing vaccines, descriptions, prices, and ratings.</p>
                </div>
                <Link
                    href="/admin/vaccines/new"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                    <Plus size={18} />
                    Create New Vaccine
                </Link>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-border/60">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Vaccine</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Price/Rating</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {initialData.map((vaccine) => (
                                <tr key={vaccine._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={normalizeImageSrc(vaccine.cardImage)}
                                                    alt={vaccine.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/placeholder-image.jpg";
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 line-clamp-1">{vaccine.title}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">/{vaccine.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                                            {vaccine.category?.name || "Uncategorized"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-slate-900">£{vaccine.price}</div>
                                        {vaccine.rating && (
                                            <div className="text-xs text-orange-500 font-bold mt-0.5">★ {vaccine.rating}/5</div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        {vaccine.status === 'published' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                                <CheckCircle2 size={14} /> Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                                                <Clock size={14} /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => router.push(`/admin/vaccines/${vaccine._id}`)}
                                            className="p-2 inline-flex text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vaccine._id, vaccine.title)}
                                            className="p-2 inline-flex text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {initialData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="inline-flex flex-col items-center justify-center text-slate-500">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                <Plus size={32} className="text-slate-400" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-900">No vaccines found</p>
                                            <p className="mt-1 text-sm">Create your first vaccine to display it on the website.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
