import { siteConfig } from "@/config/site";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with Clarke & Coleman Pharmacy in Tonbridge. Call us, send a message, or visit us at 140 High St, Tonbridge TN9 1BB.",
    keywords: [
        "contact pharmacy Tonbridge",
        "Clarke Coleman contact",
        "pharmacy phone number Tonbridge",
        "pharmacy address Tonbridge",
    ],
    alternates: { canonical: "https://clarkeandcoleman.co.uk/contact" },
    openGraph: {
        title: "Contact Us | Clarke & Coleman Pharmacy",
        description: "Get in touch with our pharmacy team in Tonbridge. Call, message, or visit us at 140 High St, Tonbridge TN9 1BB.",
        url: "https://clarkeandcoleman.co.uk/contact",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Contact Us | Clarke & Coleman Pharmacy",
        description: "Get in touch with our pharmacy team in Tonbridge, Kent.",
    },
};

export default async function ContactPage() {
    const locations: any[] = [];

    return (
        <>
            <section className="relative pt-32 sm:pt-36 pb-16 bg-white border-b border-border/40">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/3" />
                <div className="relative section-container section-padding">
                    <Breadcrumb items={[{ label: "Contact Us" }]} />
                    <div className="mt-6 max-w-3xl">
                        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-4">
                            Get In Touch
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-6">
                            We're Here to Help
                        </h1>
                        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                            Have a question about your medication or need clinical advice? Visit one
                            of our branches or get in touch with our friendly team.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20 bg-background">
                <div className="section-container section-padding">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        <div className="bg-white p-8 rounded-2xl border border-border/60 shadow-sm">
                            <h2 className="text-2xl font-bold text-text-primary mb-6">Send us a Message</h2>
                            <form className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Your email" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Subject</label>
                                    <input className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="How can we help?" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Message</label>
                                    <textarea className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32" placeholder="Your message..." />
                                </div>
                                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all">Send Message</button>
                            </form>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-text-primary mb-6">Our Locations</h2>
                            <div className="space-y-6">
                                {locations.length === 0 ? (
                                    <div className="p-6 bg-white rounded-xl border border-border/60 text-center text-text-muted">
                                        No locations currently listed.
                                    </div>
                                ) : (
                                    locations.map((loc: any) => (
                                        <div key={loc._id} className="bg-white p-6 rounded-xl border border-border/60 hover:shadow-md transition-all">
                                            <h3 className="text-xl font-bold text-text-primary mb-2">{loc.name}</h3>
                                            <p className="text-text-secondary mb-4 whitespace-pre-line">{loc.address}</p>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-3 text-text-secondary">
                                                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    <a href={`tel:${loc.phone}`} className="hover:text-primary transition-colors">{loc.phone}</a>
                                                </div>
                                                <div className="flex items-center gap-3 text-text-secondary">
                                                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    <a href={`mailto:${loc.email}`} className="hover:text-primary transition-colors">{loc.email}</a>
                                                </div>
                                                <div className="flex items-start gap-3 text-text-secondary pt-2 border-t border-border/40 mt-3">
                                                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span className="whitespace-pre-line">{loc.hours}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
