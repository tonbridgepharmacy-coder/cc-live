import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedVaccines } from "@/lib/actions/vaccine";
import { getPageSetting } from "@/lib/actions/pageSettings";
import VaccinesGrid from "@/components/ui/VaccinesGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Travel Vaccinations & Vaccines",
    description:
        "Get expert travel vaccinations and immunisations at Clarke & Coleman Pharmacy, Tonbridge. Yellow fever, typhoid, hepatitis A & B, meningitis, and more. Book online.",
    keywords: [
        "travel vaccinations Tonbridge",
        "travel jabs Kent",
        "yellow fever vaccine",
        "typhoid vaccine",
        "hepatitis vaccine",
        "flu jab Tonbridge",
        "NHS vaccinations",
        "Clarke Coleman vaccines",
    ],
    alternates: { canonical: "https://clarkeandcoleman.co.uk/vaccines" },
    openGraph: {
        title: "Travel Vaccinations & Vaccines | Clarke & Coleman Pharmacy",
        description: "Expert travel vaccinations and immunisations in Tonbridge, Kent. Book your appointment online.",
        url: "https://clarkeandcoleman.co.uk/vaccines",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Travel Vaccinations & Vaccines | Clarke & Coleman Pharmacy",
        description: "Expert travel vaccinations and immunisations in Tonbridge, Kent.",
    },
};

export default async function VaccinesPage() {
    const vaccinesRes = await getPublishedVaccines();
    const settingsRes = await getPageSetting('vaccines');

    const vaccines = vaccinesRes.success ? vaccinesRes.vaccines : [];
    const bannerSetting = settingsRes.success ? settingsRes.setting : {
        bannerImage: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80",
        bannerText: "Protect Yourself and Your Loved Ones"
    };

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

                <div className="section-container section-padding relative z-20">
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

            {/* Content Section */}
            <section className="py-20  relative z-20 bg-background -mt-10 rounded-t-[3rem] shadow-2xl">
                <div className="section-container section-padding">
                    {vaccines.length === 0 ? (
                        <div className="text-center py-20 text-text-secondary">
                            <h2 className="text-2xl font-bold text-text-primary mb-4">Check Back Soon</h2>
                            <p>We are currently updating our vaccination schedule.</p>
                        </div>
                    ) : (
                        <VaccinesGrid vaccines={vaccines} />
                    )}
                </div>
            </section>
        </div>
    );
}


