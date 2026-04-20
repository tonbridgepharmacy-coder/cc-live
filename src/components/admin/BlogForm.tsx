"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlog, updateBlog } from "@/lib/actions/blog";
import { uploadImage } from "@/lib/actions/upload";
import TiptapEditor from "./TiptapEditor";
import { stripHtmlTags } from "@/lib/utils";

type BlogFormInitialData = {
    _id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    coverImage?: string;
    cardImage?: string;
    author?: string;
    category?: string;
    tags?: string[];
    status?: string;
    readTime?: string;
    metaTitle?: string;
    metaDescription?: string;
    seoKeywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    publishedAt?: Date | string;
};

type BlogFormState = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    cardImage: string;
    author: string;
    category: string;
    tags: string;
    status: "draft" | "published" | "archived";
    readTime: string;
    metaTitle: string;
    metaDescription: string;
    seoKeywords: string;
    canonicalUrl: string;
    noIndex: boolean;
};

export default function BlogForm({ initialData }: { initialData?: BlogFormInitialData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingField, setUploadingField] = useState<null | "image" | "cardImage">(null);

    const initialStatus: "draft" | "published" | "archived" =
        initialData?.status === "published" || initialData?.status === "archived"
            ? initialData.status
            : "draft";

    const [formData, setFormData] = useState<BlogFormState>({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        excerpt: initialData?.excerpt || "",
        content: initialData?.content || "",
        image: initialData?.image || initialData?.coverImage || "",
        cardImage: initialData?.cardImage || "",
        author: initialData?.author || "Clarke & Coleman Team",
        category: initialData?.category || "Health Advice",
        tags: initialData?.tags?.join(", ") || "",
        status: initialStatus,
        readTime: initialData?.readTime || "5 min read",
        metaTitle: initialData?.metaTitle || "",
        metaDescription: initialData?.metaDescription || "",
        seoKeywords: initialData?.seoKeywords?.join(", ") || "",
        canonicalUrl: initialData?.canonicalUrl || "",
        noIndex: Boolean(initialData?.noIndex),
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

        if (!stripHtmlTags(formData.excerpt)) {
            alert("Please add an excerpt.");
            return;
        }

        setLoading(true);

        const cleanedData = {
            ...formData,
            tags: formData.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t !== ""),
            seoKeywords: formData.seoKeywords
                .split(",")
                .map((t: string) => t.trim())
                .filter((t: string) => t !== ""),
            publishedAt:
                formData.status === "published" && (!initialData || initialData.status !== "published")
                    ? new Date()
                    : initialData?.publishedAt
                        ? new Date(initialData.publishedAt)
                        : undefined,
        };

        const res = isEdit
            ? await updateBlog(initialData!._id as string, cleanedData)
            : await createBlog(cleanedData);

        if (res.success) {
            router.push("/admin/blogs");
            router.refresh();
        } else {
            alert("Error: " + res.error);
            setLoading(false);
        }
    };

    const uploadAndSetImage = async (
        file: File,
        field: "image" | "cardImage"
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
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Blog Post" : "Create New Post"}</h1>
                    <p className="text-slate-500 text-sm mt-1">Publish news, health advice and general articles.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                status: e.target.value as BlogFormState["status"],
                            })
                        }
                        title="Blog status"
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
                        {loading ? "Saving..." : "Save Post"}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Content Editor */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Post Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                onBlur={generateSlug}
                                placeholder="Enter an engaging title..."
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Content</label>
                            <TiptapEditor
                                content={formData.content}
                                onChange={(html) => setFormData({ ...formData, content: html })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Excerpt</label>
                            <TiptapEditor
                                content={formData.excerpt}
                                onChange={(html) => setFormData({ ...formData, excerpt: html })}
                            />
                            <p className="text-xs text-text-muted mt-2">Used on blog cards and SEO fallback.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Metadata Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-5">
                        <h3 className="text-base font-bold text-text-primary border-b border-border/40 pb-2">Publish Settings</h3>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">URL Slug</label>
                            <input
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                title="Blog URL slug"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[10px] text-text-muted mt-1">Leave empty to auto-generate from title</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Hero Cover Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    await uploadAndSetImage(file, "image");
                                    e.target.value = "";
                                }}
                                disabled={uploadingField !== null}
                                title="Upload hero cover image"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[10px] text-text-muted mt-1">
                                {uploadingField === "image" ? "Uploading..." : "Upload an image file (recommended 16:9)"}
                            </p>
                            {formData.image && (
                                <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-border relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.image}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                                    />
                                </div>
                            )}
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
                                title="Upload grid card image"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[10px] text-text-muted mt-1">
                                {uploadingField === "cardImage" ? "Uploading..." : "Upload an image file (recommended 4:3)"}
                            </p>
                            {formData.cardImage && (
                                <div className="mt-3 aspect-4/3 w-1/2 rounded-lg overflow-hidden border border-border relative">
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
                            <h3 className="text-base font-bold text-text-primary mb-5">Categorization</h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Category</label>
                            <input
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                title="Blog category"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Tags (comma separated)</label>
                            <input
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="Health, Nutrition, Travel"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Author</label>
                            <input
                                required
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                title="Blog author"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Read Time</label>
                            <input
                                value={formData.readTime}
                                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                placeholder="e.g. 4 min read"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="pt-4 border-t border-border/40">
                            <h3 className="text-base font-bold text-text-primary mb-5">SEO Metadata</h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Meta Title</label>
                            <input
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                placeholder="Optimized title for search engines..."
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Meta Description</label>
                            <textarea
                                rows={3}
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                placeholder="Brief description to appear in search results (max 160 chars)..."
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">SEO Keywords</label>
                            <input
                                value={formData.seoKeywords}
                                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                                placeholder="travel health, vaccination tips, pharmacy"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Canonical URL</label>
                            <input
                                value={formData.canonicalUrl}
                                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                placeholder="https://example.com/blogs/your-slug"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20"
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
