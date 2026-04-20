import { getPublishedBlogs } from "@/lib/actions/blog";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { stripHtmlTags, truncateText } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
    const res = await getPublishedBlogs();
    const blogs = res.success ? res.blogs : [];

    return (
        <div className="bg-background min-h-screen">
            {/* Header Section */}
            <section className="bg-[#0F172A] pt-32 pb-20 mt-16 lg:mt-[72px]">
                <div className="section-container section-padding text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent text-xs font-bold tracking-wider uppercase mb-4 shadow-sm shadow-accent/10">
                        Insights & News
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Health <span className="text-accent">&</span> Wellness Blog
                    </h1>
                    <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
                        Stay informed with the latest health advice, pharmacy updates, travel clinic news, and general wellness tips from our expert team.
                    </p>
                </div>
            </section>

            {/* Blogs Grid Section */}
            <section className="py-20">
                <div className="section-container section-padding">
                    {blogs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-border/60 shadow-sm">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Articles Yet</h3>
                            <p className="text-slate-500">Check back soon for new health and wellness insights from our team.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog: any) => (
                                <Link
                                    key={blog._id}
                                    href={`/blogs/${blog.slug}`}
                                    className="group bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-accent/10 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                >
                                    {/* Glassmorphic 4:3 Image Container */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                                        {(blog.cardImage || blog.image) ? (
                                            <Image
                                                src={blog.cardImage || blog.image}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                No Image
                                            </div>
                                        )}
                                        {/* Category BadgeOverlay */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/90 backdrop-blur-md text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                {blog.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-primary" />
                                                {format(new Date(blog.publishedAt || blog.createdAt), 'MMM d, yyyy')}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-primary" />
                                                {blog.author}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-accent transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>

                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                                            {truncateText(stripHtmlTags(blog.excerpt || ""), 160)}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {blog.tags?.slice(0, 2).map((tag: string) => (
                                                    <span key={tag} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="flex items-center gap-1 text-sm font-bold text-primary group-hover:text-accent transition-colors">
                                                Read Article <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
