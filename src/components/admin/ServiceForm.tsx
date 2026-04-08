"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService } from "@/lib/actions/service";
import { getCategories } from "@/lib/actions/category";
import TiptapEditor from "./TiptapEditor";

export default function ServiceForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getCategories();
            if (res.success) setCategories(res.categories);
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        category: initialData?.category?._id || initialData?.category || "",
        bannerImage: initialData?.bannerImage || "",
        bannerText: initialData?.bannerText || "",
        cardImage: initialData?.cardImage || "",
        shortDescription: initialData?.shortDescription || "",
        content: initialData?.content || "",
        status: initialData?.status || "draft",
    });

    const isEdit = !!initialData?._id;

    const generateSlug = () => {
        if (!formData.title) return;
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        setFormData({ ...formData, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category) {
            alert("Please select a category.");
            return;
        }

        setLoading(true);

        const res = isEdit
            ? await updateService(initialData._id, formData)
            : await createService(formData);

        if (res.success) {
            router.push("/admin/services");
            router.refresh();
        } else {
            alert("Error: " + res.error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Service" : "Create New Service"}</h1>
                    <p className="text-slate-500 text-sm mt-1">Provide comprehensive details about your pharmacy services.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Service"}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Service Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                onBlur={generateSlug}
                                placeholder="e.g. Travel Vaccinations"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Service Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                            >
                                <option value="" disabled>Select a Category...</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Banner Layout Text</label>
                            <input
                                required
                                value={formData.bannerText}
                                onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                                placeholder="Large bold text displayed over the hero image"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Short Description</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                placeholder="A brief summary for the 4:3 service cards..."
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">About Section (Content)</label>
                            <TiptapEditor
                                content={formData.content}
                                onChange={(html) => setFormData({ ...formData, content: html })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Assets Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-5">
                        <h3 className="text-base font-bold text-text-primary border-b border-border/40 pb-2">Media & URLs</h3>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">URL Slug</label>
                            <input
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[10px] text-text-muted mt-1">Leave empty to auto-generate from title</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Banner Image URL</label>
                            <input
                                required
                                value={formData.bannerImage}
                                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                            {formData.bannerImage && (
                                <div className="mt-3 aspect-[21/9] rounded-lg overflow-hidden border border-border relative">
                                    <img src={formData.bannerImage} alt="Hero Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Grid Card Image URL (4:3)</label>
                            <input
                                required
                                value={formData.cardImage}
                                onChange={(e) => setFormData({ ...formData, cardImage: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                            {formData.cardImage && (
                                <div className="mt-3 aspect-[4/3] rounded-lg overflow-hidden border border-border relative">
                                    <img src={formData.cardImage} alt="Card Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
