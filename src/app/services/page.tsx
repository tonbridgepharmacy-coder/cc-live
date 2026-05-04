import Image from "next/image";
import { getCategories } from "@/lib/actions/category";
import { getPublishedServices } from "@/lib/actions/service";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ServicesGrid from "@/components/ui/ServicesGrid";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
    const [catRes, serRes] = await Promise.all([
        getCategories(),
        getPublishedServices()
    ]);

    const categories = catRes.success ? catRes.categories : [];
    const services = serRes.success ? serRes.services : [];

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
                <div className="section-container section-padding">
                    <ServicesGrid services={services} categories={categories} />
                </div>
            </section>
        </main>
    );
}
