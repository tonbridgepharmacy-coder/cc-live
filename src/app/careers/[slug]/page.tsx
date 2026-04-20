import Link from "next/link";
import { getJobBySlug } from "@/lib/actions/job";
import { notFound } from "next/navigation";
import { MapPin, Clock, ArrowLeft, Briefcase } from "lucide-react";
import { format } from "date-fns";
import ApplyForm from "./ApplyForm";

export const dynamic = 'force-dynamic';

export default async function JobDetailsPage({ params }: { params: { slug: string } }) {
    const resolvedParams = await params;
    const res = await getJobBySlug(resolvedParams.slug);

    if (!res.success || !res.job) {
        notFound();
    }

    const { job } = res;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Header Area */}
            <div className="bg-[#1E293B] text-white pt-24 pb-20 border-b border-border">
                <div className="section-container relative z-10">
                    <Link href="/careers" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to Careers
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                                {job.department}
                            </span>
                            <span className="text-sm text-slate-400 font-medium">
                                 Posted {format(new Date(job.postedDate), "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <section className="section-container pb-32">
                <div className="bg-white rounded-[2rem] shadow-xl border border-border overflow-hidden relative -top-10 flex flex-col lg:flex-row">

                    {/* Left Panel: Content */}
                    <div className="flex-1 p-8 lg:p-12 lg:border-r border-border">
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">{job.title}</h1>

                        <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-slate-500 mb-10 pb-10 border-b border-border/50">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><MapPin size={18} className="text-blue-500" /> {job.location}</div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><Clock size={18} className="text-emerald-500" /> {job.type}</div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100"><Briefcase size={18} className="text-purple-500" /> {job.jobId}</div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 drop-shadow-sm">About the Role</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 text-base lg:text-lg leading-relaxed
                                prose-headings:font-bold prose-headings:text-slate-800"
                                dangerouslySetInnerHTML={{ __html: job.aboutRole }}
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 drop-shadow-sm">What You'll Need</h2>
                            <div className="bg-emerald-50/50 p-6 lg:p-8 rounded-2xl border border-emerald-100">
                                <div className="prose prose-slate max-w-none
                                    prose-li:text-slate-700 prose-li:font-medium prose-li:my-3
                                    marker:text-emerald-500"
                                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Sticky Form Area */}
                    <div className="w-full lg:w-[450px] bg-slate-50 relative">
                        <div className="sticky top-28 p-8 lg:p-10">
                            {job.status === "Active" ? (
                                <ApplyForm jobId={job._id} />
                            ) : (
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/60 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Position Closed</h3>
                                    <p className="text-slate-500 text-sm">We are no longer accepting applications for this role.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
