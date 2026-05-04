"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { stripHtmlTags, truncateText } from "@/lib/utils";

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface Service {
    _id: string;
    title: string;
    slug: string;
    cardImage: string;
    shortDescription?: string;
    category?: { _id: string; name: string; slug: string };
}

export default function ServicesGrid({
    services,
    categories,
}: {
    services: Service[];
    categories: Category[];
}) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("az");
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const sortOptions = [
        { value: "az", label: "Name: A – Z" },
        { value: "za", label: "Name: Z – A" },
    ];
    const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? "Sort";

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        const result = services.filter((s) =>
            !q ||
            s.title.toLowerCase().includes(q) ||
            (s.shortDescription || "").toLowerCase().includes(q)
        );
        if (sort === "az") result.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === "za") result.sort((a, b) => b.title.localeCompare(a.title));
        return result;
    }, [services, search, sort]);

    // Group filtered services by category
    const grouped: Record<string, { category: Category | null; items: Service[] }> = {};
    filtered.forEach((s) => {
        const catId = s.category?._id || "uncategorized";
        if (!grouped[catId]) {
            grouped[catId] = { category: s.category ?? null, items: [] };
        }
        grouped[catId].items.push(s);
    });

    return (
        <div>
            {/* ─── Search + Filter Bar ─── */}
            <div className="mb-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                    <button
                        onClick={() => setSortOpen((o) => !o)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-white text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-all"
                    >
                        <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
                        </svg>
                        {sortLabel}
                        <svg className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {sortOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50">
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${
                                        sort === opt.value
                                            ? "bg-primary text-white"
                                            : "text-text-secondary hover:bg-gray-50 hover:text-primary"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Nav Links */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/services"
                        className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all bg-primary text-white shadow-sm"
                    >
                        All
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat._id}
                            href={`/services/${cat.slug}`}
                            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ─── Results ─── */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 text-text-secondary">
                    <p className="text-xl font-bold text-text-primary mb-2">No services found</p>
                    <p>Try a different search term or category.</p>
                </div>
            ) : (
                <div className="space-y-24 lg:space-y-36">
                    {Object.values(grouped).map(({ category, items }) => (
                        <div key={category?._id || "uncategorized"} className="relative">
                            <div className="mb-12 flex items-center gap-6">
                                <h2 className="text-3xl lg:text-5xl font-bold text-text-primary">
                                    {category?.name || "Services"}
                                </h2>
                                <div className="flex-1 h-px bg-border/60 hidden sm:block" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {items.map((service) => (
                                    <div
                                        key={service._id}
                                        className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-border/50 hover:border-accent/30 shadow-sm hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                            <Image
                                                src={service.cardImage}
                                                alt={service.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                                                    className="flex-1 text-center px-4 py-3 border border-border rounded-xl text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-colors"
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
