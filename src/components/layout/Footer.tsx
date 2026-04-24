"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { serviceCategories } from "@/lib/mock-data";

// ─── Icons ───────────────────────────────────
const FacebookIcon = () => (
    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const TwitterIcon = () => (
    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const InstagramIcon = () => (
    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const MapIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const MailIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export default function Footer() {
    const pathname = usePathname();
    const activeCategories = serviceCategories.filter((c) => c.isActive);
    const currentYear = new Date().getFullYear();

    // Don't show public footer on admin pages
    if (pathname?.startsWith("/admin")) return null;

    return (
        <footer className="bg-[#0F172A] text-white">
            {/* Main Footer */}
            <div className="section-container section-padding pt-16 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="relative h-12 w-12 bg-white rounded-lg p-1">
                                <Image
                                    src="/logo.png"
                                    alt={siteConfig.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <div className="font-bold text-white text-base leading-tight">
                                    Clarke & Coleman
                                </div>
                                <div className="text-[11px] text-white/50 font-medium tracking-wide uppercase">
                                    Pharmacy
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed mb-6">
                            Your trusted partner in health and wellness. Providing expert
                            pharmaceutical care and clinical services to communities across
                            the UK since 1998.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {[
                                { icon: <FacebookIcon />, href: siteConfig.social.facebook, label: "Facebook" },
                                { icon: <TwitterIcon />, href: siteConfig.social.twitter, label: "Twitter" },
                                { icon: <InstagramIcon />, href: siteConfig.social.instagram, label: "Instagram" },
                                { icon: <LinkedInIcon />, href: siteConfig.social.linkedin, label: "LinkedIn" },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services Column Removed */}

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white text-sm tracking-wide uppercase mb-5">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: "About Us", href: "/about" },
                                { label: "Blog", href: "/blogs" },
                                { label: "Book Appointment", href: "/book" },
                                // { label: "Careers", href: "/careers" },
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Refund Policy", href: "/refund" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/60 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="font-semibold text-white text-sm tracking-wide uppercase mb-5">
                            Get in Touch
                        </h3>
                        <div className="space-y-4">
                            <a
                                href={`tel:${siteConfig.phone}`}
                                className="flex items-start gap-3 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-primary flex items-center justify-center text-white/60 group-hover:text-white transition-all shrink-0 mt-0.5">
                                    <PhoneIcon />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-0.5">Call us</div>
                                    <div className="text-sm text-white/80 group-hover:text-white transition-colors">
                                        {siteConfig.phone}
                                    </div>
                                </div>
                            </a>

                            <a
                                href={`mailto:${siteConfig.email}`}
                                className="flex items-start gap-3 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-primary flex items-center justify-center text-white/60 group-hover:text-white transition-all shrink-0 mt-0.5">
                                    <MailIcon />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-0.5">Email</div>
                                    <div className="text-sm text-white/80 group-hover:text-white transition-colors">
                                        {siteConfig.email}
                                    </div>
                                </div>
                            </a>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 shrink-0 mt-0.5">
                                    <MapIcon />
                                </div>
                                <div>
                                    <div className="text-xs text-white/40 mb-0.5">Visit us</div>
                                    <div className="text-sm text-white/80">{siteConfig.address}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="section-container section-padding">
                    <div className="flex flex-col sm:flex-row items-center justify-between py-5 gap-3">
                        <p className="text-xs text-white/40">
                            © {currentYear} Clarke & Coleman Pharmacy. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/privacy"
                                className="text-xs text-white/40 hover:text-white/70 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-xs text-white/40 hover:text-white/70 transition-colors"
                            >
                                Terms & Conditions
                            </Link>
                            <Link
                                href="/refund"
                                className="text-xs text-white/40 hover:text-white/70 transition-colors"
                            >
                                Refund Policy
                            </Link>
                            <span className="text-xs text-white/30">
                                GPhC Registered
                            </span>
                            <a href="https://www.techservenexus.com" target="_blank" className="text-[10px] text-white/5 hover:text-white/20 transition-colors pointer-events-auto opacity-30 select-none">TSN</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
