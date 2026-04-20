"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, CheckCircle, Trash2, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { deleteJob } from "@/lib/actions/job";
import { updateApplicationStatus, deleteApplication } from "@/lib/actions/jobApplication";
import { useRouter } from "next/navigation";

export default function CareerDashboardClient({ jobs, applications }: { jobs: any[], applications: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
    const [loading, setLoading] = useState(false);

    const activePositions = jobs.filter(j => j.status === 'Active').length;
    const newCandidates = applications.filter(a => a.status === 'new').length;

    const handleDeleteJob = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job posting?")) return;
        setLoading(true);
        const res = await deleteJob(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        setLoading(true);
        const res = await updateApplicationStatus(id, status);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleDeleteApp = async (id: string) => {
        if (!confirm("Are you sure you want to delete this application?")) return;
        setLoading(true);
        const res = await deleteApplication(id);
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">

            {/* Header & Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Active Positions</p>
                        <h3 className="text-4xl font-black text-slate-900">{activePositions}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Total Applications</p>
                        <h3 className="text-4xl font-black text-slate-900">{applications.length}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">New Candidates</p>
                        <h3 className="text-4xl font-black text-slate-900">{newCandidates}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle size={28} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">

                {/* Tabs & Actions */}
                <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Jobs Listing
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Applications
                            {newCandidates > 0 && (
                                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{newCandidates}</span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'jobs' && (
                        <Link
                            href="/admin/careers/jobs/new"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
                        >
                            <Plus size={18} /> Post Job
                        </Link>
                    )}
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    {activeTab === 'jobs' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-border">
                                    <th className="p-6">Job Title</th>
                                    <th className="p-6">Department</th>
                                    <th className="p-6">Type</th>
                                    <th className="p-6">Posted Date</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-500 font-medium">No jobs posted yet.</td>
                                    </tr>
                                ) : jobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6">
                                            <Link href={`/admin/careers/jobs/${job._id}`} className="font-bold text-slate-900 hover:text-primary transition-colors block">
                                                {job.title}
                                            </Link>
                                            <span className="text-xs text-slate-500">{job.jobId}</span>
                                        </td>
                                        <td className="p-6 text-sm font-medium text-slate-700">{job.department}</td>
                                        <td className="p-6">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold border border-slate-200">
                                                {job.type}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm text-slate-500">{format(new Date(job.postedDate), "MMM d, yyyy")}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => handleDeleteJob(job._id)} disabled={loading} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-border">
                                    <th className="p-6">Candidate</th>
                                    <th className="p-6">Applied For</th>
                                    <th className="p-6">Contact Info</th>
                                    <th className="p-6">Applied Date</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-500 font-medium">No applications received yet.</td>
                                    </tr>
                                ) : applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-slate-900">{app.fullName}</div>
                                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                                                <FileText size={12} /> View Resume
                                            </a>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm font-bold text-slate-700">{app.job?.title || "Deleted Job"}</div>
                                            <div className="text-xs text-slate-500">{app.job?.jobId}</div>
                                        </td>
                                        <td className="p-6 text-sm space-y-1">
                                            <div className="text-slate-700">{app.email}</div>
                                            <div className="text-slate-500 text-xs">{app.phone}</div>
                                        </td>
                                        <td className="p-6 text-sm text-slate-500">{format(new Date(app.appliedDate), "MMM d, yyyy")}</td>
                                        <td className="p-6">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                disabled={loading}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-primary/20 ${app.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    app.status === 'reviewed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        app.status === 'hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}
                                            >
                                                <option value="new">New</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="hired">Hired</option>
                                            </select>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <a href={app.resumeUrl} download className="inline-flex p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Download size={18} />
                                            </a>
                                            <button onClick={() => handleDeleteApp(app._id)} disabled={loading} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
