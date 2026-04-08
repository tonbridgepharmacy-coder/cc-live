import { getBlogBySlug } from "@/lib/actions/blog";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Clock, Share2, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const res = await getBlogBySlug(resolvedParams.slug);

    if (!res.success || !res.blog || res.blog.status !== 'published') {
        return { title: 'Not Found' };
    }

    const blog = res.blog;
    const title = blog.metaTitle || blog.title;
    const description = blog.metaDescription || blog.excerpt;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: blog.publishedAt || blog.createdAt,
            authors: [blog.author],
            images: [
                {
                    url: blog.image || '',
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [blog.image || ''],
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const res = await getBlogBySlug(resolvedParams.slug);

    if (!res.success || !res.blog || res.blog.status !== 'published') {
        notFound();
    }

    const blog = res.blog;

    // Generate JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.metaTitle || blog.title,
        "description": blog.metaDescription || blog.excerpt,
        "image": blog.image,
        "author": {
            "@type": "Person",
            "name": blog.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Clarke & Coleman Pharmacy",
            "logo": {
                "@type": "ImageObject",
                "url": "https://clarkeandcoleman.co.uk/logo.png" // Replace with actual absolute URL to site logo
            }
        },
        "datePublished": blog.publishedAt || blog.createdAt,
        "dateModified": blog.updatedAt || blog.publishedAt || blog.createdAt,
    };

    return (
        <article className="min-h-screen bg-slate-50 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header Hero */}
            <header className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] bg-[#0F172A] flex items-end">
                {blog.image && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover opacity-60"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                    </div>
                )}

                <div className="section-container relative z-10 w-full pb-16 pt-32">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm font-semibold group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to all articles
                    </Link>

                    <div className="max-w-4xl">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-white text-xs font-bold tracking-wider uppercase mb-6">
                            {blog.category}
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white/80">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <User size={14} className="text-white" />
                                </span>
                                {blog.author}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-primary-light" />
                                <span>{format(new Date(blog.publishedAt || blog.createdAt), 'MMMM do, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary-light" />
                                <span>{blog.readTime || '5 min read'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="section-container relative z-20 -mt-10 sm:-mt-16">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Share Sidebar (Desktop) */}
                    <div className="hidden lg:block w-20 shrink-0">
                        <div className="sticky top-32 flex flex-col gap-4 items-center bg-white p-4 rounded-full shadow-sm border border-slate-200">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                                Share
                            </div>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Blog Content */}
                    <article className="flex-1 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
                        {/* TipTap Output Wrapper */}
                        <div
                            className="prose prose-slate md:prose-lg max-w-none w-full
                                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
                                prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6
                                prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary-dark prose-a:transition-colors
                                prose-li:text-slate-600 prose-li:my-2
                                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-slate-50 prose-blockquote:my-8 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 prose-blockquote:italic
                                prose-img:rounded-2xl prose-img:shadow-md prose-img:w-full prose-img:object-cover prose-img:my-10"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Article Footer & Tags */}
                        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <Tag size={16} className="text-slate-400 mr-2" />
                                {blog.tags?.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Mobile Share */}
                            <div className="flex lg:hidden items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Share</span>
                                <div className="flex gap-2">
                                    <button className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600">
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                </div>
            </main>
        </article>
    );
}
