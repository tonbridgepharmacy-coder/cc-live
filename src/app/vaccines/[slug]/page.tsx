import Image from "next/image";
import Link from "next/link";
import { getVaccineBySlug } from "@/lib/actions/vaccine";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { stripHtmlTags, truncateText } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const resolvedParams = await params;
    const res = await getVaccineBySlug(resolvedParams.slug);

    if (!res.success || !res.vaccine || res.vaccine.status !== "published") {
        return { title: "Not Found" };
    }

    const vaccine = res.vaccine;
    const title = vaccine.metaTitle || vaccine.title;
    const description =
        vaccine.metaDescription || truncateText(stripHtmlTags(vaccine.shortDescription || ""), 160);

    return {
        title,
        description,
        keywords: vaccine.seoKeywords,
        alternates: vaccine.canonicalUrl ? { canonical: vaccine.canonicalUrl } : undefined,
        robots: vaccine.noIndex ? { index: false, follow: false } : undefined,
        openGraph: {
            title,
            description,
            images: vaccine.bannerImage ? [{ url: vaccine.bannerImage, alt: title }] : undefined,
            type: "website",
        },
    };
}

export default async function VaccineDetailsPage({ params }: { params: { slug: string } }) {
    const resolvedParams = await params;
    const res = await getVaccineBySlug(resolvedParams.slug);

    if (!res.success || !res.vaccine) {
        notFound();
    }

    const { vaccine } = res;

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* ─── Hero Banner ─── */}
            <section className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden">
                <Image
                    src={vaccine.bannerImage}
                    alt={vaccine.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/40 backdrop-blur-[2px]" />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-light border border-primary/30 font-semibold text-sm mb-6 tracking-wide">
                        {vaccine.category?.name || "Vaccination"}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md">
                        {vaccine.bannerText}
                    </h1>
                </div>
            </section>

            {/* ─── Content Section Unconventional Side-by-Side ─── */}
            <section className="relative -mt-20 pb-32 z-20">
                <div className="section-container section-padding">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                        {/* Column 1: Sticky Left Side (Image & Booking Actions) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">

                            {/* Unique Image Layout (Asymmetrical) */}
                            <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full max-w-sm rounded-tl-[8rem] rounded-br-[8rem] overflow-hidden border-8 border-white shadow-2xl bg-gray-100">
                                <Image
                                    src={vaccine.cardImage}
                                    alt={`${vaccine.title} Details`}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Floating Action Card */}
                            <div className="bg-white p-8 max-w-sm rounded-[2.5rem] shadow-xl border border-border/50 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{vaccine.title}</h3>

                                {/* Ratings */}
                                {vaccine.rating && (
                                    <div className="flex items-center gap-1.5 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < Math.floor(vaccine.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-200 fill-gray-100'}`} />
                                        ))}
                                        <span className="text-sm font-bold text-slate-600 ml-1">{vaccine.rating} / 5</span>
                                    </div>
                                )}

                                {/* Pricing */}
                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-8 border border-slate-100">
                                    <div className="text-slate-500 font-medium text-sm">Consultation & Dose</div>
                                    <div className="text-right">
                                        {vaccine.crossedPrice && (
                                            <div className="text-sm text-slate-400 line-through font-medium">£{vaccine.crossedPrice}</div>
                                        )}
                                        <div className="text-3xl font-black text-primary">£{vaccine.price}</div>
                                    </div>
                                </div>

                                <Link
                                    href={`/book?serviceId=${vaccine._id}`}
                                    className="flex items-center justify-center gap-2 w-full text-center px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 hover:bg-primary-dark transition-all"
                                >
                                    Book Vaccination
                                    <ArrowLeft className="w-5 h-5 rotate-135" />
                                </Link>

                                <div className="mt-6 flex flex-col gap-3 text-sm font-medium text-slate-600">
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Fast, 15-min process</div>
                                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> NHS Certified Professionals</div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Rich Text Area (Scrollable) */}
                        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-border/50 p-8 sm:p-14 shadow-md min-h-[600px] flex flex-col relative">

                            {/* Decorative Quote Mark */}
                            <div className="absolute top-10 right-10 text-9xl text-slate-100 leading-none font-serif opacity-50 select-none">"</div>

                            <div className="prose prose-slate max-w-none relative z-10
                                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 
                                prose-h2:text-3xl prose-h2:mt-2 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-100
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                                prose-ul:space-y-3 prose-li:text-slate-600 prose-li:text-lg prose-li:marker:text-primary
                                prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:my-12
                                overflow-y-auto max-h-[800px] flex-grow pr-4 custom-scrollbar"
                                dangerouslySetInnerHTML={{ __html: vaccine.content }}
                            />

                            {/* Footer / Back Navigation */}
                            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    href="/vaccines"
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-xl"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Browse All Vaccines
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
