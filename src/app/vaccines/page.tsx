import Image from "next/image";
import Link from "next/link";
import { getPublishedVaccines } from "@/lib/actions/vaccine";
import { getPageSetting } from "@/lib/actions/pageSettings";
import { stripHtmlTags, truncateText } from "@/lib/utils";


export default async function VaccinesPage() {
    const vaccinesRes = await getPublishedVaccines();
    const settingsRes = await getPageSetting('vaccines');

    const vaccines = vaccinesRes.success ? vaccinesRes.vaccines : [];
    const bannerSetting = settingsRes.success ? settingsRes.setting : {
        bannerImage: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80",
        bannerText: "Protect Yourself and Your Loved Ones"
    };

    // Group vaccines by category
    const groupedVaccines = vaccines.reduce((acc: any, vaccine: any) => {
        const catName = vaccine.category?.name || "Other Vaccines";
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(vaccine);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background">
            {/* Dynamic Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0F172A]">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src={bannerSetting.bannerImage}
                        alt="Vaccines Banner"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/20 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0F172A] to-transparent z-10" />

                <div className="section-container relative z-20">
                    <div className="max-w-3xl animate-fade-in-up">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            {bannerSetting.bannerText}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl font-light">
                            Explore our comprehensive range of vaccinations designed to keep our community safe and healthy. Expert care you can trust.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section (Grouped by Categories) */}
            <section className="section-padding relative z-20 bg-background -mt-10 rounded-t-[3rem] shadow-2xl">
                <div className="section-container">

                    {Object.keys(groupedVaccines).length === 0 ? (
                        <div className="text-center py-20 text-text-secondary">
                            <h2 className="text-2xl font-bold text-text-primary mb-4">Check Back Soon</h2>
                            <p>We are currently updating our vaccination schedule.</p>
                        </div>
                    ) : (
                        Object.entries(groupedVaccines).map(([category, items]: [string, any], index) => (
                            <div key={category} className={`mb-20 ${index > 0 ? "pt-12 border-t border-border/50" : ""}`}>
                                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-10 pl-4 border-l-4 border-primary">
                                    {category}
                                </h2>

                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {items.map((vaccine: any) => (
                                        <Link
                                            key={vaccine._id}
                                            href={`/vaccines/${vaccine.slug}`}
                                            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            {/* 4:3 Image Container */}
                                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                                <Image
                                                    src={vaccine.cardImage || "/placeholder-image.jpg"}
                                                    alt={vaccine.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity" />

                                                {/* Price Tag Overlay */}
                                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-primary shadow-lg flex flex-col items-end">
                                                    {vaccine.crossedPrice && (
                                                        <span className="text-[10px] text-gray-400 line-through">£{vaccine.crossedPrice}</span>
                                                    )}
                                                    <span>£{vaccine.price}</span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                                                    {vaccine.title}
                                                </h3>

                                                {vaccine.rating && (
                                                    <div className="flex items-center gap-1 mb-3 text-orange-500 text-sm font-bold">
                                                        ★ {vaccine.rating} / 5.0
                                                    </div>
                                                )}

                                                <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-grow">
                                                    {truncateText(stripHtmlTags(vaccine.shortDescription || ""), 120)}
                                                </p>

                                                <div className="flex items-center text-primary group-hover:text-accent font-bold text-sm mt-auto group-hover:translate-x-2 transition-all">
                                                    Learn More
                                                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
