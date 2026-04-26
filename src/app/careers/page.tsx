import Image from "next/image";
import Link from "next/link";
import { getActiveJobs } from "@/lib/actions/job";
import { Search, MapPin, Clock, ArrowRight, FileText } from "lucide-react";
import { format } from "date-fns";

export const revalidate = 300;

export default async function CareersPage() {
    const res = await getActiveJobs();
    const jobs = res.success ? res.jobs : [];

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Hero / Banner Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0A3254]">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
                        alt="Join our team"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A3254]/95 to-[#0A3254]/60 z-10" />

                <div className="section-container relative z-20 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-white animate-fade-in-up">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-white font-bold text-sm mb-6 shadow-lg shadow-accent/30 animate-pulse">
                            We're Hiring
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6">
                            Join Our Mission
                        </h1>
                        <p className="text-lg text-slate-200 mb-8 font-light leading-relaxed">
                            Help us redefine the pharmacy & healthcare experience. We are looking for passionate, innovative, and driven individuals to join our growing team.
                        </p>
                    </div>

                    {/* Logo/Graphic Element on the right representing the business */}
                    <div className="w-full max-w-sm hidden md:block relative animate-fade-in">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 aspect-[4/5] flex items-center justify-center">
                            <Image
                                src="/logo.png"
                                alt="Clarke & Coleman"
                                width={240}
                                height={240}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Jobs Listing Section */}
            <section className="section-padding relative z-20 bg-gray-50/30 -mt-10 rounded-t-[3rem]">
                <div className="section-container max-w-6xl">

                    {/* Search & Filter Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border md:flex-row gap-4 mb-12 relative -top-20 hidden md:flex">
                        <div className="flex-grow flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by job title or keyword..."
                                className="bg-transparent border-none outline-none w-full text-sm font-medium"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select className="px-6 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 outline-none">
                                <option>All Dept</option>
                            </select>
                            <select className="px-6 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 outline-none flex items-center gap-2">
                                <option>Location: All</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid of Job Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-border border-dashed flex flex-col items-center justify-center">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-700">No open positions</h3>
                                <p className="text-slate-500 mt-2">Check back later or follow us on social media for updates.</p>
                            </div>
                        ) : jobs.map((job: any) => (
                            <Link
                                href={`/careers/${job.slug}`}
                                key={job._id}
                                className="group bg-white rounded-3xl p-8 border border-border outline outline-transparent hover:outline-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent/5 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                            {job.department}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium tracking-tight">
                                            {format(new Date(job.postedDate), "MMM d")}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-accent transition-colors">
                                        {job.title}
                                    </h3>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <Clock className="w-4 h-4 text-slate-400" /> {job.type}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-mono tracking-wider">{job.jobId}</span>
                                    <span className="text-primary group-hover:text-accent font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Apply Now <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Why Work With Us Section */}
                    <div className="mt-24 bg-white rounded-[3rem] p-12 lg:p-16 border border-border shadow-md">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6">Why Work With Us?</h2>
                            <p className="text-slate-500 text-lg leading-relaxed font-medium">
                                We offer competitive compensation, remote-friendly policies, and the opportunity to shape the future of healthcare technology and pharmacy management.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <h4 className="text-lg font-bold text-slate-900 mb-3">Global Impact</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">Work on products used by thousands of patients worldwide.</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <h4 className="text-lg font-bold text-slate-900 mb-3">Growth Focus</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">Dedicated budget for learning, conferences, and certifications.</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <h4 className="text-lg font-bold text-slate-900 mb-3">Health & Wellness</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">Comprehensive health coverage and wellness programs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
