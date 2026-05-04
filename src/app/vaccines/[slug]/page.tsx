import Image from "next/image";
import Link from "next/link";
import { getVaccineBySlug, getPublishedVaccinesByCategory } from "@/lib/actions/vaccine";
import { getVaccineCategoryBySlug, getVaccineCategories } from "@/lib/actions/vaccineCategory";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Clock, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { stripHtmlTags, truncateText } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const resolvedParams = await params;
    const res = await getVaccineBySlug(resolvedParams.slug);

    if (!res.success || !res.vaccine || res.vaccine.status !== "published") {
        // Check if it's a vaccine category
        const catRes = await getVaccineCategoryBySlug(resolvedParams.slug);
        if (catRes.success && catRes.category) {
            return {
                title: `${catRes.category.name} Vaccines`,
                description: `Browse all ${catRes.category.name} vaccinations at Clarke & Coleman Pharmacy. Book your appointment online today.`,
            };
        }
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

    // ─── Vaccine Category Landing Page Fallback ───
    if (!res.success || !res.vaccine || res.vaccine.status !== "published") {
        const catRes = await getVaccineCategoryBySlug(resolvedParams.slug);
        if (catRes.success && catRes.category) {
            const category = catRes.category;
            const [vaccinesRes, allCatsRes] = await Promise.all([
                getPublishedVaccinesByCategory(category._id),
                getVaccineCategories(),
            ]);
            const vaccines = vaccinesRes.success ? vaccinesRes.vaccines : [];
            const allCategories = allCatsRes.success ? allCatsRes.categories : [];
            return <VaccineCategoryPage category={category} vaccines={vaccines} allCategories={allCategories} />;
        }
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

// ─── Vaccine Category Landing Page Component ───
function VaccineCategoryPage({ category, vaccines, allCategories }: { category: any; vaccines: any[]; allCategories: any[] }) {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0F172A]">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=2000&q=80"
                        alt={category.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                </div>
                <div className="relative z-10 section-container section-padding">
                    <div className="max-w-3xl">
                        <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/vaccines" className="hover:text-white transition-colors">Vaccines</Link>
                            <span>/</span>
                            <span className="text-white">{category.name}</span>
                        </nav>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            {category.name}
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">
                            Browse our full range of {category.name} vaccinations and book your appointment online today.
                        </p>
                        <Link
                            href="/book"
                            className="mt-10 inline-flex items-center gap-3 px-10 py-5 bg-secondary text-white font-bold rounded-2xl shadow-2xl shadow-secondary/30 hover:-translate-y-1 transition-all text-lg"
                        >
                            Book an Appointment
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Vaccines Grid */}
            <section className="section-padding bg-background -mt-10 rounded-t-[3rem] shadow-2xl relative z-20">
                <div className="section-container">

                    {/* Category Nav Pills */}
                    {allCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-12">
                            <Link
                                href="/vaccines"
                                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
                            >
                                All
                            </Link>
                            {allCategories.map((cat: any) => (
                                <Link
                                    key={cat._id}
                                    href={`/vaccines/${cat.slug}`}
                                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                                        cat._id === category._id
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
                                    }`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {vaccines.length === 0 ? (
                        <div className="text-center py-20 text-text-secondary">
                            <p className="text-xl font-bold text-text-primary mb-2">No vaccines yet</p>
                            <p>Check back soon for updates.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {vaccines.map((vaccine: any) => (
                                <div
                                    key={vaccine._id}
                                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                        <Image
                                            src={vaccine.cardImage || "/placeholder-image.jpg"}
                                            alt={vaccine.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity" />
                                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-primary shadow-lg flex flex-col items-end">
                                            {vaccine.crossedPrice && (
                                                <span className="text-[10px] text-gray-400 line-through">£{vaccine.crossedPrice}</span>
                                            )}
                                            <span>£{vaccine.price}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                                            {vaccine.title}
                                        </h3>
                                        {vaccine.rating && (
                                            <div className="flex items-center gap-1 mb-3 text-orange-500 text-sm font-bold">
                                                ★ {vaccine.rating} / 5.0
                                            </div>
                                        )}
                                        <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-grow">
                                            {truncateText(stripHtmlTags(vaccine.shortDescription || ""), 120)}
                                        </p>
                                        <div className="mt-auto flex items-center gap-2">
                                            <Link
                                                href={`/vaccines/${vaccine.slug}`}
                                                className="flex-1 text-center px-3 py-2.5 border border-border rounded-xl text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors"
                                            >
                                                Learn More
                                            </Link>
                                            <Link
                                                href={`/book?serviceId=${vaccine._id}`}
                                                className="flex-1 text-center px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
