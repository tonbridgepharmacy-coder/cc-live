"use client";

import { Bell, Search, User, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationCenter from "./NotificationCenter";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TopNavbar({ user }: { user?: any }) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const resultsRef = useRef<HTMLDivElement>(null);

    const adminLinks = [
        { title: "Appointments", href: "/admin/appointments" },
        { title: "Enquiries", href: "/admin/enquiries" },
        { title: "Vaccines", href: "/admin/vaccines" },
        { title: "Services", href: "/admin/services" },
        { title: "Blogs", href: "/admin/blogs" },
        { title: "Careers", href: "/admin/careers" },
        { title: "Dashboard", href: "/admin/dashboard" },
        { title: "Gallery", href: "/admin/gallery" },
        { title: "Inventory", href: "/admin/inventory" },
    ];

    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            const filtered = adminLinks.filter(link => 
                link.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setResults(filtered);
            setShowResults(true);
        } else {
            setResults([]);
            setShowResults(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        setShowResults(false);
        setSearchQuery("");
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && results.length > 0) {
            router.push(results[0].href);
            setShowResults(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-white/80 backdrop-blur-md px-6 shadow-sm">
            {/* Search Bar */}
            <div className="flex flex-1 items-center max-w-md relative" ref={resultsRef}>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={18} className={isSearchFocused ? "text-primary transition-colors" : "text-slate-400"} />
                    </div>
                    <input
                        type="text"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-full bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                        placeholder="Search pages (e.g. 'blogs', 'appointments')..."
                        onFocus={() => {
                            setIsSearchFocused(true);
                            if (searchQuery.length > 1) setShowResults(true);
                        }}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && results.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                            {results.map((result, idx) => (
                                <Link
                                    key={idx}
                                    href={result.href}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Search size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{result.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="ml-4 flex items-center gap-4">
                {/* Real-time Notifications */}
                <NotificationCenter />

                {/* Profile Dropdown Placeholder */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-text-primary leading-none">{user?.name || "Admin User"}</p>
                        <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-medium">Enterprise</p>
                    </div>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all duration-200 overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </button>
                </div>

                {/* Mobile Menu Toggle - visible on mobile only */}
                <button className="md:hidden p-2 text-text-secondary">
                    <Menu size={20} />
                </button>
            </div>
        </header>
    );
}
