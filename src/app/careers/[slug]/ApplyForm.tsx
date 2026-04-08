"use client";

import { useState } from "react";
import { uploadDocument } from "@/lib/actions/uploadDocument";
import { submitApplication } from "@/lib/actions/jobApplication";
import { Send, UploadCloud, CheckCircle2 } from "lucide-react";

export default function ApplyForm({ jobId }: { jobId: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // File state
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setFileName(selected.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert("A resume is required to apply.");
            return;
        }

        setLoading(true);

        try {
            // 1. Upload the resume document
            const formPayload = new FormData();
            formPayload.append("file", file);
            const uploadRes = await uploadDocument(formPayload);

            if (!uploadRes.success || !uploadRes.url) {
                alert("Failed to upload document: " + uploadRes.error);
                setLoading(false);
                return;
            }

            // 2. Submit the application payload
            const appPayload = {
                job: jobId as any,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                resumeUrl: uploadRes.url,
                coverLetter: formData.coverLetter
            };

            const submitRes = await submitApplication(appPayload);

            if (submitRes.success) {
                setSuccess(true);
            } else {
                alert("Failed to submit application: " + submitRes.error);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white rounded-[2rem] p-10 shadow-2xl border border-emerald-100 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Application Received!</h3>
                <p className="text-slate-500 font-medium">
                    Thank you, {formData.fullName.split(' ')[0]}! We have successfully received your application. Our team will review your profile and get back to you shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-xl border border-border/60 relative overflow-hidden">

            <h3 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">
                Apply for this Position
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Full Name</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
                    <input
                        required
                        type="email"
                        placeholder="e.g. alex@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Phone Number</label>
                    <input
                        required
                        type="tel"
                        placeholder="e.g. +1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Resume / CV</label>
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm text-slate-600 font-medium transition-colors">
                        <UploadCloud size={18} className="text-slate-400" />
                        {fileName ? fileName : "Upload Document (PDF/Doc, Max 5MB)"}
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Cover Letter <span className="text-slate-400 capitalize normal-case text-[10px] ml-1">(Optional)</span></label>
                    <textarea
                        rows={4}
                        placeholder="Tell us why you're a great fit..."
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 mt-4"
                >
                    {loading ? "Submitting..." : (
                        <>Submit Application <Send size={16} /></>
                    )}
                </button>

                <p className="text-[10px] text-center text-slate-400 mt-4 px-4 leading-tight">
                    By submitting, you agree to our privacy policy and terms of service.
                </p>
            </div>
        </form>
    );
}
