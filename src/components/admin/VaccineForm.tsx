"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createVaccine, updateVaccine } from "@/lib/actions/vaccine";
import { getVaccineCategories } from "@/lib/actions/vaccineCategory";
import { uploadImage } from "@/lib/actions/upload";
import TiptapEditor from "./TiptapEditor";
import { stripHtmlTags } from "@/lib/utils";

type VaccineCategoryListItem = { _id: string; name: string };

type VaccineFormInitialData = {
    _id?: string;
    title?: string;
    slug?: string;
    category?: { _id?: string } | string;
    bannerImage?: string;
    bannerText?: string;
    cardImage?: string;
    shortDescription?: string;
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    seoKeywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    price?: number | string;
    crossedPrice?: number | string;
    rating?: number | string;
    status?: string;
};

type VaccineFormState = {
    title: string;
    slug: string;
    category: string;
    bannerImage: string;
    bannerText: string;
    cardImage: string;
    shortDescription: string;
    content: string;
    metaTitle: string;
    metaDescription: string;
    seoKeywords: string;
    canonicalUrl: string;
    noIndex: boolean;
    price: string;
    crossedPrice: string;
    rating: string;
    status: "draft" | "published";
};

export default function VaccineForm({ initialData }: { initialData?: VaccineFormInitialData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingField, setUploadingField] = useState<null | "bannerImage" | "cardImage">(null);
    const [categories, setCategories] = useState<VaccineCategoryListItem[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getVaccineCategories();
            if (res.success) setCategories(res.categories);
        };
        fetchCategories();
    }, []);

    const initialCategoryId =
        typeof initialData?.category === "string"
            ? initialData.category
            : initialData?.category?._id || "";

    const initialStatus: "draft" | "published" =
        initialData?.status === "published" ? "published" : "draft";

    const [formData, setFormData] = useState<VaccineFormState>({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        category: initialCategoryId,
        bannerImage: initialData?.bannerImage || "",
        bannerText: initialData?.bannerText || "",
        cardImage: initialData?.cardImage || "",
        shortDescription: initialData?.shortDescription || "",
        content: initialData?.content || "",
        metaTitle: initialData?.metaTitle || "",
        metaDescription: initialData?.metaDescription || "",
        seoKeywords: initialData?.seoKeywords?.join(", ") || "",
        canonicalUrl: initialData?.canonicalUrl || "",
        noIndex: Boolean(initialData?.noIndex),
        price: initialData?.price ? String(initialData.price) : "",
        crossedPrice: initialData?.crossedPrice ? String(initialData.crossedPrice) : "",
        rating: initialData?.rating ? String(initialData.rating) : "",
        status: initialStatus,
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

        if (!stripHtmlTags(formData.shortDescription)) {
            alert("Please add a short description.");
            return;
        }

        setLoading(true);

        const submissionData = {
            ...formData,
            seoKeywords: formData.seoKeywords
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            price: Number(formData.price),
            crossedPrice: formData.crossedPrice ? Number(formData.crossedPrice) : undefined,
            rating: formData.rating ? Number(formData.rating) : undefined
        };

        const res = isEdit
            ? await updateVaccine(initialData!._id as string, submissionData)
            : await createVaccine(submissionData);

        if (res.success) {
            router.push("/admin/vaccines");
            router.refresh();
        } else {
            alert("Error: " + res.error);
            setLoading(false);
        }
    };

    const uploadAndSetImage = async (
        file: File,
        field: "bannerImage" | "cardImage"
    ) => {
        setUploadingField(field);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await uploadImage(fd);
            if (!res.success || !res.url) {
                alert("Upload failed: " + (res.error || "Unknown error"));
                return;
            }
            setFormData((prev) => ({ ...prev, [field]: res.url }));
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed");
        } finally {
            setUploadingField(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Vaccine" : "Create New Vaccine"}</h1>
                    <p className="text-slate-500 text-sm mt-1">Provide comprehensive details including pricing and ratings.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                status: e.target.value as VaccineFormState["status"],
                            })
                        }
                        title="Vaccine status"
                        className="px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Vaccine"}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Main Settings - Left 2 Columns */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-border/40 pb-2">Basic Info</h3>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Vaccine Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                onBlur={generateSlug}
                                placeholder="e.g. Flu Vaccine (Quadrivalent)"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                title="Vaccine category"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="" disabled>Select a Category...</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Short Description</label>
                            <TiptapEditor
                                content={formData.shortDescription}
                                onChange={(html) => setFormData({ ...formData, shortDescription: html })}
                            />
                            <p className="text-xs text-text-muted mt-2">Used on vaccine cards and SEO fallback.</p>
                        </div>
                    </div>

                    {/* Pricing & Metrics */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-border/40 pb-2">Pricing & Metrics</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-text-primary mb-2">Price (£)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="e.g. 15.00"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Crossed Price (£) (Optional)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.crossedPrice}
                                    onChange={(e) => setFormData({ ...formData, crossedPrice: e.target.value })}
                                    placeholder="e.g. 25.00"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Rating (0 - 5.0) (Optional)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                placeholder="e.g. 4.8"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Rich Content Editor */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-border/40 pb-2">About Section (Content)</h3>
                        <TiptapEditor
                            content={formData.content}
                            onChange={(html) => setFormData({ ...formData, content: html })}
                        />
                    </div>
                </div>

                {/* Right Sidebar Assets */}
                <div className="space-y-8">
                    {/* Media Setup */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-5">
                        <h3 className="text-base font-bold text-text-primary border-b border-border/40 pb-2">Media & SEO</h3>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">URL Slug</label>
                            <input
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                title="Vaccine URL slug"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20 font-mono"
                            />
                            <p className="text-[10px] text-text-muted mt-1">Leave empty to auto-generate from title</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Banner Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await uploadAndSetImage(file, "bannerImage");
                                    e.target.value = "";
                                }}
                                disabled={uploadingField !== null}
                                title="Upload banner image"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            />
                            <p className="text-[10px] text-text-muted mt-1">
                                {uploadingField === "bannerImage" ? "Uploading..." : "Upload an image file (recommended 21:9)"}
                            </p>
                            {formData.bannerImage && (
                                <div className="mt-3 aspect-21/9 rounded-lg overflow-hidden border border-border relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.bannerImage}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Banner Layout Text</label>
                            <input
                                required
                                value={formData.bannerText}
                                onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                                placeholder="Displayed over the hero image"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Grid Card Image (4:3)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await uploadAndSetImage(file, "cardImage");
                                    e.target.value = "";
                                }}
                                disabled={uploadingField !== null}
                                title="Upload card image"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            />
                            <p className="text-[10px] text-text-muted mt-1">
                                {uploadingField === "cardImage" ? "Uploading..." : "Upload an image file (recommended 4:3)"}
                            </p>
                            {formData.cardImage && (
                                <div className="mt-3 aspect-4/3 rounded-lg overflow-hidden border border-border relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.cardImage}
                                        alt="Card Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border/40">
                            <h3 className="text-base font-bold text-text-primary mb-5">Advanced SEO</h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Meta Title</label>
                            <input
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                placeholder="SEO title for search engines"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Meta Description</label>
                            <textarea
                                rows={3}
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                placeholder="SEO description (recommended under 160 characters)"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">SEO Keywords</label>
                            <input
                                value={formData.seoKeywords}
                                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                                placeholder="flu vaccine, travel clinic, vaccination"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Canonical URL</label>
                            <input
                                value={formData.canonicalUrl}
                                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                placeholder="https://example.com/vaccines/your-slug"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
                            <input
                                type="checkbox"
                                checked={formData.noIndex}
                                onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                                className="rounded border-border"
                            />
                            No index (hide from search engines)
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}
