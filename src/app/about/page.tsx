import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { siteConfig } from "@/config/site";
import EnquiryForm from "@/components/ui/EnquiryForm";
import LocationMap from "@/components/ui/LocationMap";
import aboutData from "@/data/about.json";

const { hero, story, values, commitment, enquiry, cta } = aboutData;

export const metadata: Metadata = {
    title: aboutData.metadata.title,
    description: aboutData.metadata.description,
    keywords: [
        "about Clarke Coleman Pharmacy",
        "pharmacy Tonbridge history",
        "pharmacy team Tonbridge",
        "community pharmacy Kent",
        "Ankit Tyagi pharmacy",
    ],
    alternates: { canonical: "https://clarkeandcoleman.co.uk/about" },
    openGraph: {
        title: aboutData.metadata.title,
        description: aboutData.metadata.description,
        url: "https://clarkeandcoleman.co.uk/about",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: aboutData.metadata.title,
        description: aboutData.metadata.description,
    },
};

// ─── Icons ───────────────────────────────────
const IntegrityIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.548 4.076 10.134 9.5 10.875 5.424-.74 9.5-5.327 9.5-10.875 0-1.314-.213-2.579-.602-3.759A11.959 11.959 0 0112 2.714z" />
    </svg>
);

const CareIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const AccountabilityIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RespectIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0c0-1.1 clearance-1.31-2.305-3-2.305s-3 1.11-3 2.305m0-6a3 3 0 11-6 0 3 3 0 016 0zm-3-3.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.548 4.076 10.134 9.5 10.875 5.424-.74 9.5-5.327 9.5-10.875 0-1.314-.213-2.579-.602-3.759A11.959 11.959 0 0112 2.714z" />
    </svg>
);

const ExcellenceIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

// Maps value key → icon component
const VALUE_ICONS: Record<string, React.ReactNode> = {
    integrity: <IntegrityIcon />,
    care: <CareIcon />,
    accountability: <AccountabilityIcon />,
    respect: <RespectIcon />,
    excellence: <ExcellenceIcon />,
    integrated: null, // rendered separately as text badge
};

export default function AboutPage() {
    return (
        <main className="bg-white">
            {/* ─── Hero Section ─── */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-white -z-10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-10 animate-pulse" />

                <div className="section-container section-padding">
                    <div className="max-w-4xl">
                        <Breadcrumb items={[{ label: hero.breadcrumb }]} />
                        <div className="mt-8 relative h-20 w-20">
                            <Image
                                src="/logo.png"
                                alt={hero.logoAlt}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary tracking-tight leading-[1.1]">
                            {hero.headingPlain}{" "}
                            <span className="text-primary italic">{hero.headingHighlight}</span>.
                        </h1>
                        <p className="mt-8 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl">
                            {hero.subtext}
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Story Section ─── */}
            <section className="py-20 bg-white">
                <div className="section-container section-padding">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&w=1200&q=80"
                                    alt={story.founderImageAlt}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 bg-accent text-white p-8 rounded-3xl shadow-2xl shadow-accent/20 max-w-xs hidden sm:block">
                                <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-2">
                                    {story.experienceBadge.label}
                                </p>
                                <p className="text-3xl font-bold">{story.experienceBadge.years}</p>
                                <p className="mt-2 text-white/90 text-sm leading-relaxed">
                                    {story.experienceBadge.description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold border border-accent/20 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                                </span>
                                {story.founderBadge}
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                                &ldquo;{story.quote}&rdquo;
                            </h2>

                            <div className="space-y-6 text-text-secondary leading-relaxed text-lg">
                                <p>
                                    My name is{" "}
                                    <span className="font-bold text-text-primary">{story.founderName}</span>
                                    {story.paragraphs[0].replace("My name is {name}", "").trimStart()}
                                </p>
                                <p>{story.paragraphs[1]}</p>
                                <p>{story.paragraphs[2]}</p>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <p className="text-text-primary font-bold text-lg">{story.founderName}</p>
                                <p className="text-text-secondary">{story.founderRole}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Values Section ─── */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="section-container section-padding">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold text-text-primary mb-6">
                            {values.heading}
                        </h2>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            {values.subtext}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.items.map((value) => (
                            <div
                                key={value.key}
                                className="bg-white p-10 rounded-3xl border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {value.key === "integrated" ? (
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary font-bold text-xs group-hover:bg-white/20 group-hover:text-white">
                                            {value.iconLabel}
                                        </div>
                                    ) : (
                                        VALUE_ICONS[value.key]
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-text-primary mb-4">{value.title}</h3>
                                <p className="text-text-secondary leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Commitment Section ─── */}
            <section className="py-24 bg-white">
                <div className="section-container section-padding">
                    <div className="bg-text-primary rounded-[3rem] p-12 lg:p-24 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl sm:text-5xl font-bold mb-8 leading-tight">
                                    {commitment.heading}
                                </h2>
                                <p className="text-white/70 text-lg leading-relaxed mb-10">
                                    {commitment.subtext}
                                </p>
                                <div className="space-y-6">
                                    {commitment.bullets.map((item) => (
                                        <div key={item} className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-white/90 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl">
                                <h3 className="text-2xl font-bold mb-6">{commitment.quote.cardHeading}</h3>
                                <p className="text-white/70 leading-relaxed mb-8">
                                    {commitment.quote.text}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                                        <img
                                            src="https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&w=100&q=80"
                                            alt={commitment.quote.founderImageAlt}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold">{commitment.quote.founderName}</p>
                                        <p className="text-xs text-white/50 tracking-widest uppercase">
                                            {commitment.quote.founderRole}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Contact/Enquiry ─── */}
            <section id="enquiry" className="py-24 bg-background">
                <div className="section-container section-padding">
                    <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                        <div className="grid lg:grid-cols-5">
                            <div className="lg:col-span-2 bg-primary p-12 lg:p-16 text-white text-center sm:text-left">
                                <h2 className="text-3xl font-bold mb-6">{enquiry.heading}</h2>
                                <p className="text-white/70 leading-relaxed mb-12">{enquiry.subtext}</p>
                                <div className="space-y-8">
                                    <div className="group flex items-center gap-4 cursor-pointer">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                            <CareIcon />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">
                                                {enquiry.contactLabels.call}
                                            </p>
                                            <p className="font-bold text-lg">{siteConfig.phone}</p>
                                        </div>
                                    </div>
                                    <div className="group flex items-center gap-4 cursor-pointer">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                            <div className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center font-bold">@</div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/50 uppercase font-bold tracking-widest mb-1">
                                                {enquiry.contactLabels.email}
                                            </p>
                                            <p className="font-bold text-lg">{siteConfig.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-3 p-12 lg:p-16">
                                <EnquiryForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Location Map ─── */}
            <LocationMap variant="about" />

            {/* ─── CTA ─── */}
            <section className="py-32 bg-white text-center relative">
                <div className="section-container section-padding">
                    <h2 className="text-4xl sm:text-6xl font-bold text-text-primary mb-8 tracking-tighter">
                        {cta.headingPlain} <br />
                        <span className="text-primary italic">{cta.headingHighlight}</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        {cta.buttons.map((btn) => (
                            <Link
                                key={btn.href}
                                href={btn.href}
                                className={
                                    btn.href === "/book"
                                        ? "w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-primary-dark transition-all hover:-translate-y-1"
                                        : "w-full sm:w-auto px-10 py-5 bg-background text-text-primary rounded-2xl font-bold text-lg hover:bg-border/30 transition-all"
                                }
                            >
                                {btn.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <a
                    href="https://www.techservenexus.com"
                    target="_blank"
                    className="absolute bottom-2 right-4 text-[10px] text-black/5 hover:text-black/20 select-none pointer-events-auto"
                >
                    Techserve Nexus
                </a>
            </section>
        </main>
    );
}
