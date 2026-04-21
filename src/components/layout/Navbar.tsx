"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { serviceCategories } from "@/lib/mock-data";

// ─── Icons (inline SVG for zero-dependency) ──
const PhoneIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const MailIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChevronDown = () => (
    <svg className="w-3.5 h-3.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ─── Navigation Links ────────────────────────
const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Vaccines", href: "/vaccines" },
    { label: "Blogs", href: "/blogs" },
    // { label: "Careers", href: "/careers" },
];


export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Don't show public navbar on admin pages
    if (pathname?.startsWith("/admin")) return null;

    const activeCategories = serviceCategories.filter((c) => c.isActive);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* ─── Utility Bar ─── */}
            <div
                className={`bg-primary text-white transition-all duration-300 ${isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100"
                    }`}
            >
                <div className="section-container section-padding">
                    <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <a
                                href={`tel:${siteConfig.phone}`}
                                className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
                            >
                                <PhoneIcon />
                                <span className="hidden sm:inline">{siteConfig.phone}</span>
                            </a>
                            <a
                                href={`mailto:${siteConfig.email}`}
                                className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
                            >
                                <MailIcon />
                                <span className="hidden sm:inline">{siteConfig.email}</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <span className="flex items-center gap-1.5">
                                <ClockIcon />
                                <span className="hidden md:inline">{siteConfig.openingHours}</span>
                                <span className="md:hidden">Mon–Sat</span>
                            </span>
                            {/* <Link
                                href="/careers"
                                className="hover:text-white/80 transition-colors font-medium"
                            >
                                Careers
                            </Link> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Primary Navbar ─── */}
            <nav
                className={`bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${isScrolled
                    ? "border-border shadow-md"
                    : "border-transparent"
                    }`}
            >
                <div className="section-container section-padding">
                    <div className="flex items-center justify-between h-16 lg:h-[72px]">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative h-14 w-14 transition-transform duration-300 hover:scale-105">
                                <Image
                                    src="/logo.png"
                                    alt={siteConfig.name}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="hidden sm:block">
                                <div className="font-bold text-text-primary text-lg leading-tight tracking-tight">
                                    Clarke & Coleman
                                </div>
                                <div className="text-[10px] text-primary font-bold tracking-widest uppercase">
                                    Pharmacy
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="px-3.5 py-2.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* CTA + Mobile Toggle */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/about#enquiry"
                                className="hidden md:inline-flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                            >
                                Enquiry
                            </Link>

                            <Link
                                href="/book"
                                className="hidden sm:inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-lg shadow-accent/20 transition-all duration-200"
                            >
                                Book Appointment
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-text-primary transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Mobile Menu ─── */}
                <div
                    className={`lg:hidden bg-white border-t border-border overflow-hidden transition-all duration-300 ${isMobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="section-padding py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="block px-3 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-3 border-t border-border space-y-3">
                            <Link
                                href="/about#enquiry"
                                className="block w-full text-center bg-secondary/10 hover:bg-secondary/20 text-secondary px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                Enquiry
                            </Link>
                            <Link
                                href="/book"
                                className="block w-full text-center bg-accent hover:bg-accent-light text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                Book Appointment
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
