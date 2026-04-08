"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useState } from "react";

export default function TopNavbar({ user }: { user?: any }) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-white/80 backdrop-blur-md px-6 shadow-sm">
            {/* Search Bar */}
            <div className="flex flex-1 items-center max-w-md">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={18} className={isSearchFocused ? "text-primary transition-colors" : "text-text-muted"} />
                    </div>
                    <input
                        type="text"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                        placeholder="Search anything..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="ml-4 flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200 group">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white group-hover:scale-110 transition-transform"></span>
                </button>

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
