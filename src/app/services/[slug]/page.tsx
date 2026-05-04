import Image from "next/image";
import Link from "next/link";
import { getServiceBySlug, getPublishedServicesByCategory } from "@/lib/actions/service";
import { getCategoryBySlug, getCategories } from "@/lib/actions/category";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Metadata } from "next";
import { stripHtmlTags, truncateText } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const resolvedParams = await params;
    const res = await getServiceBySlug(resolvedParams.slug);

    if (!res.success || !res.service || res.service.status !== "published") {
        // Check if it's a category
        const catRes = await getCategoryBySlug(resolvedParams.slug);
        if (catRes.success && catRes.category) {
            return {
                title: `${catRes.category.name} Services`,
                description: `Browse all ${catRes.category.name} services at Clarke & Coleman Pharmacy. Book your appointment online today.`,
            };
        }
        return { title: "Not Found" };
    }

    const service = res.service;
    const title = service.metaTitle || service.title;
    const description =
        service.metaDescription || truncateText(stripHtmlTags(service.shortDescription || ""), 160);

    return {
        title,
        description,
        keywords: service.seoKeywords,
        alternates: service.canonicalUrl ? { canonical: service.canonicalUrl } : undefined,
        robots: service.noIndex ? { index: false, follow: false } : undefined,
        openGraph: {
            title,
            description,
            images: service.bannerImage ? [{ url: service.bannerImage, alt: title }] : undefined,
            type: "website",
        },
    };
}

export default async function ServiceDetailsPage({ params }: { params: { slug: string } }) {
    // Next.js 15+ requires awaiting dynamic params
    const resolvedParams = await params;
    const res = await getServiceBySlug(resolvedParams.slug);

    // ─── Category Landing Page Fallback ───
    if (!res.success || !res.service || res.service.status !== "published") {
        const catRes = await getCategoryBySlug(resolvedParams.slug);
        if (catRes.success && catRes.category) {
            const category = catRes.category;
            const [servicesRes, allCatsRes] = await Promise.all([
                getPublishedServicesByCategory(category._id),
                getCategories(),
            ]);
            const services = servicesRes.success ? servicesRes.services : [];
            const allCategories = allCatsRes.success ? allCatsRes.categories : [];
            return <CategoryLandingPage category={category} services={services} allCategories={allCategories} />;
        }
        notFound();
    }

    const { service } = res;

    return (
        <main className="bg-background min-h-screen">
            {/* ─── Custom Unconventional Hero Frame ─── */}
            <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden bg-primary overflow-x-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={service.bannerImage}
                        alt={service.title}
                        fill
                        className="object-cover opacity-60 mix-blend-overlay"
                        priority
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
                </div>

                <div className="relative z-10 section-container section-padding">
                    <div className="max-w-4xl mx-auto text-center">
                        <Breadcrumb
                            items={[
                                { label: "Services", href: "/services" },
                                { label: service.category?.name || "Service" }
                            ]}
                            theme="dark"
                        />

                        {/* Dynamic Category Badge */}
                        <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold border border-white/20 uppercase tracking-widest shadow-xl">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                            {service.category?.name || "Premium Care"}
                        </div>

                        {/* Title & Banner Text */}
                        <h1 className="mt-10 text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            {service.title}
                        </h1>
                        <p className="mt-8 text-xl sm:text-2xl text-white/90 leading-relaxed font-light italic">
                            "{service.bannerText}"
                        </p>
                    </div>
                </div>

                {/* Unconventional masking bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 100%)" }}></div>
            </section>

            {/* ─── Content Section matching Screenshot ─── */}
            <section className="relative -mt-20 pb-32 z-20">
                <div className="section-container section-padding">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                        {/* Column 1: Sticky Image Showcase & Action Card (Left Side) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                            {/* Shape-masked image */}
                            <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full max-w-sm rounded-tr-[5rem] sm:rounded-tr-[8rem] rounded-bl-[5rem] sm:rounded-bl-[8rem] overflow-hidden border-8 border-white shadow-xl bg-gray-100">
                                <Image
                                    src={service.cardImage}
                                    alt={`${service.title} Details`}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Floating Stats/Action Card */}
                            <div className="bg-white p-8 max-w-sm rounded-3xl shadow-xl border border-border/50 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                <h3 className="text-xl font-bold text-text-primary mb-3">Expert Care Ready</h3>
                                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                                    Book an appointment today with our certified pharmacy professionals.
                                </p>
                                <Link
                                    href={`/book?serviceId=${service._id}`}
                                    className="inline-block w-full text-center px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>

                        {/* Column 2: Rich Text Content (Right Side, with Scroll) */}
                        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-border/50 p-8 sm:p-12 shadow-sm min-h-[600px] flex flex-col">
                            <div className="prose prose-sm sm:prose-base prose-slate max-w-none 
                                prose-headings:font-bold prose-headings:text-text-primary 
                                prose-h2:text-2xl prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/60
                                prose-p:text-text-secondary prose-p:leading-relaxed prose-p:mb-5
                                prose-ul:space-y-2 prose-li:text-text-secondary prose-li:marker:text-primary
                                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                                overflow-y-auto max-h-[800px] flex-grow pr-4 custom-scrollbar"
                                dangerouslySetInnerHTML={{ __html: service.content }}
                            />

                            {/* Footer Attributes */}
                            <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div></div>

                                <Link href="/services" className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Services
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
}

// ─── Category Landing Page Component ───
function CategoryLandingPage({
    category,
    services,
    allCategories,
}: {
    category: any;
    services: any[];
    allCategories: any[];
}) {
    return (
        <main className="bg-background min-h-screen">
            {/* Hero */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0F172A]">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80"
                        alt={category.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                </div>
                <div className="relative z-10 section-container section-padding">
                    <div className="max-w-3xl">
                        <Breadcrumb
                            items={[
                                { label: "Services", href: "/services" },
                                { label: category.name },
                            ]}
                            theme="dark"
                        />
                        <h1 className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            {category.name}
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">
                            Browse our full range of {category.name} services and book your appointment online.
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

            {/* Category Nav + Services Grid */}
            <section className="py-20 lg:py-32">
                <div className="section-container section-padding">

                    {/* Category Nav Pills */}
                    {allCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-12">
                            <Link
                                href="/services"
                                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
                            >
                                All
                            </Link>
                            {allCategories.map((cat: any) => (
                                <Link
                                    key={cat._id}
                                    href={`/services/${cat.slug}`}
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

                    {services.length === 0 ? (
                        <div className="text-center py-20 text-text-secondary">
                            <p className="text-xl font-bold text-text-primary mb-2">No services yet</p>
                            <p>Check back soon for updates.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service: any) => (
                                <div key={service._id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-border/50 hover:border-accent/30 shadow-sm hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-1">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                        <Image
                                            src={service.cardImage}
                                            alt={service.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-text-secondary line-clamp-3 text-sm leading-relaxed mb-6 flex-grow">
                                            {truncateText(stripHtmlTags(service.shortDescription || ""), 140)}
                                        </p>
                                        <div className="mt-auto flex items-center gap-3">
                                            <Link
                                                href={`/services/${service.slug}`}
                                                className="flex-1 text-center px-4 py-3 border border-border rounded-xl text-sm font-bold text-text-primary hover:border-primary hover:text-primary transition-colors"
                                            >
                                                Learn More
                                            </Link>
                                            <Link
                                                href={`/book?serviceId=${service._id}`}
                                                className="flex-1 text-center px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
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
        </main>
    );
}
