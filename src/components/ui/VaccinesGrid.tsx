"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { stripHtmlTags, truncateText } from "@/lib/utils";

interface Vaccine {
    _id: string;
    title: string;
    slug: string;
    cardImage?: string;
    shortDescription?: string;
    price: number;
    crossedPrice?: number;
    rating?: number;
    category?: { _id: string; name: string; slug: string };
}

export default function VaccinesGrid({ vaccines }: { vaccines: Vaccine[] }) {
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
        { value: "price-asc", label: "Price: Low – High" },
        { value: "price-desc", label: "Price: High – Low" },
    ];
    const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? "Sort";

    // Derive unique categories with slug from data
    const categories = useMemo(() => {
        const seen = new Map<string, { name: string; slug: string }>();
        vaccines.forEach((v) => {
            if (v.category && !seen.has(v.category._id)) {
                seen.set(v.category._id, { name: v.category.name, slug: v.category.slug });
            }
        });
        return Array.from(seen.values());
    }, [vaccines]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        const result = vaccines.filter((v) =>
            !q ||
            v.title.toLowerCase().includes(q) ||
            (v.shortDescription || "").toLowerCase().includes(q)
        );
        if (sort === "az") result.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === "za") result.sort((a, b) => b.title.localeCompare(a.title));
        else if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
        else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
        return result;
    }, [vaccines, search, sort]);

    // Group filtered vaccines by category name
    const grouped: Record<string, Vaccine[]> = {};
    filtered.forEach((v) => {
        const catName = v.category?.name || "Other Vaccines";
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(v);
    });

    return (
        <div>
            {/* ─── Search + Filter Bar ─── */}
            <div className="mb-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0A7 7 0 1116.65 16.65z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search vaccines..."
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
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50">
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
                        href="/vaccines"
                        className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all bg-primary text-white shadow-sm"
                    >
                        All
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/vaccines/${cat.slug}`}
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
                    <p className="text-xl font-bold text-text-primary mb-2">No vaccines found</p>
                    <p>Try a different search term or category.</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {Object.entries(grouped).map(([catName, items], index) => (
                        <div
                            key={catName}
                            className={index > 0 ? "pt-12 border-t border-border/50" : ""}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-10 pl-4 border-l-4 border-primary">
                                {catName}
                            </h2>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {items.map((vaccine) => (
                                    <div
                                        key={vaccine._id}
                                        className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                            <Image
                                                src={vaccine.cardImage || "/placeholder-image.jpg"}
                                                alt={vaccine.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity" />

                                            {/* Price Tag */}
                                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-primary shadow-lg flex flex-col items-end">
                                                {vaccine.crossedPrice && (
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        £{vaccine.crossedPrice}
                                                    </span>
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

                                            <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-grow">
                                                {truncateText(stripHtmlTags(vaccine.shortDescription || ""), 120)}
                                            </p>

                                            <div className="mt-auto flex items-center gap-2">
                                                <Link
                                                    href={`/vaccines/${vaccine.slug}`}
                                                    className="flex-1 text-center px-3 py-2.5 border border-border rounded-xl text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors"
                                                >
                                                    Learn More
                                                </Link>
                                                <Link
                                                    href={`/book?serviceId=${vaccine._id}`}
                                                    className="flex-1 text-center px-3 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
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
