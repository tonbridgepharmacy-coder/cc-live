import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/actions/category";
import { getPublishedServices } from "@/lib/actions/service";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { stripHtmlTags, truncateText } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const [catRes, serRes] = await Promise.all([
        getCategories(),
        getPublishedServices()
    ]);

    const categories = catRes.success ? catRes.categories : [];
    const services = serRes.success ? serRes.services : [];

    // Group services by category ID
    const groupedServices: Record<string, typeof services> = {};
    services.forEach((service: any) => {
        const catId = service.category?._id || 'uncategorized';
        if (!groupedServices[catId]) {
            groupedServices[catId] = [];
        }
        groupedServices[catId].push(service);
    });

    return (
        <main className="bg-background min-h-screen">
            {/* ─── Hero Banner ─── */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0F172A]">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80"
                        alt="Medical Services Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                </div>

                <div className="relative z-10 section-container section-padding">
                    <div className="max-w-3xl">
                        <Breadcrumb items={[{ label: "Services" }]} theme="dark" />
                        <h1 className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                            Expert Care, <span className="text-accent italic drop-shadow-lg">Tailored to You</span>.
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">
                            Explore our comprehensive range of clinical and pharmaceutical services designed to support your health and well-being at every stage of life.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Categories & Services ─── */}
            <section className="py-20 lg:py-32">
                <div className="section-container section-padding space-y-24 lg:space-y-36">
                    {categories.map((category: any) => {
                        const items = groupedServices[category._id];
                        if (!items || items.length === 0) return null; // Don't show empty categories

                        return (
                            <div key={category._id} className="relative">
                                {/* Category Header */}
                                <div className="mb-12 flex items-center gap-6">
                                    <h2 className="text-3xl lg:text-5xl font-bold text-text-primary">
                                        {category.name}
                                    </h2>
                                    <div className="flex-1 h-px bg-border/60 hidden sm:block"></div>
                                </div>

                                {/* Services Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {items.map((service: any) => (
                                        <Link
                                            href={`/services/${service.slug}`}
                                            key={service._id}
                                            className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-border/50 hover:border-accent/30 shadow-sm hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-1"
                                        >
                                            {/* 4:3 Image Container */}
                                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                                <Image
                                                    src={service.cardImage}
                                                    alt={service.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-8 flex flex-col flex-grow">
                                                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-text-secondary line-clamp-3 text-sm leading-relaxed mb-6 flex-grow">
                                                    {truncateText(stripHtmlTags(service.shortDescription || ""), 140)}
                                                </p>

                                                <div className="mt-auto flex items-center text-primary group-hover:text-accent font-semibold text-sm gap-2 transition-colors">
                                                    Learn More
                                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
