"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob, updateJob } from "@/lib/actions/job";
import TiptapEditor from "./TiptapEditor";

export default function JobForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        department: initialData?.department || "",
        location: initialData?.location || "Remote",
        type: initialData?.type || "Full-time",
        jobId: initialData?.jobId || "",
        aboutRole: initialData?.aboutRole || "",
        requirements: initialData?.requirements || "",
        status: initialData?.status || "Active",
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

    const generateJobId = () => {
        const randomId = "Rx-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData({ ...formData, jobId: randomId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = isEdit
            ? await updateJob(initialData._id, formData)
            : await createJob(formData);

        if (res.success) {
            router.push("/admin/careers");
            router.refresh();
        } else {
            alert("Error: " + res.error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Job Posting" : "Create New Job"}</h1>
                    <p className="text-slate-500 text-sm mt-1">Provide the specifics, requirements, and responsibilities.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Job"}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left side form fields */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Requirements */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-border/40 pb-2">Basic Setting</h3>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                onBlur={generateSlug}
                                placeholder="e.g. Senior Frontend Developer"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                                <input
                                    required
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g. Engineering"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Internal Job ID</label>
                                <div className="flex gap-2">
                                    <input
                                        required
                                        value={formData.jobId}
                                        onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20 font-mono"
                                    />
                                    <button type="button" onClick={generateJobId} className="px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200">
                                        Auto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rich text Content */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-border/40 pb-2">About the Role</h3>
                        <TiptapEditor
                            content={formData.aboutRole}
                            onChange={(html) => setFormData({ ...formData, aboutRole: html })}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-border/40 pb-2">What You'll Need (Requirements)</h3>
                        <TiptapEditor
                            content={formData.requirements}
                            onChange={(html) => setFormData({ ...formData, requirements: html })}
                        />
                    </div>
                </div>

                {/* Right side form fields */}
                <div className="space-y-8">
                    {/* Logistical Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm space-y-5">
                        <h3 className="text-base font-bold text-slate-900 border-b border-border/40 pb-2">Logistics & SEO</h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Employment Type</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Location</label>
                            <input
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Remote, UK"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL Slug</label>
                            <input
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-blue-500/20 font-mono text-slate-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Leave empty to auto-generate from title</p>
                        </div>

                    </div>
                </div>
            </div>
        </form>
    );
}
