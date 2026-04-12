"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Stethoscope,
    Syringe,
    Plane,
    FileText,
    Users,
    MapPin,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    LogOut,
    ImageIcon, // Renamed to avoid collision with next/image
    Package,
    ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
    { name: "Categories", href: "/admin/categories", icon: FileText },
    { name: "Services", href: "/admin/services", icon: Stethoscope },
    { name: "Vaccine Categories", href: "/admin/vaccines/categories", icon: FileText },
    { name: "Vaccines", href: "/admin/vaccines", icon: Syringe },
    { name: "Vaccines Settings", href: "/admin/vaccines/settings", icon: FileText },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
    { name: "Inventory Logs", href: "/admin/inventory/logs", icon: ClipboardList },
    { name: "Blogs", href: "/admin/blogs", icon: FileText },
    { name: "Career", href: "/admin/careers", icon: Briefcase },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
];


export default function Sidebar({ signOutAction }: { signOutAction: () => Promise<void> }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar-bg transition-all duration-300 ease-smooth border-r border-white/5",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Brand Logo */}
            <div className="flex h-20 items-center px-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 w-8 h-8 relative">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    {!isCollapsed && (
                        <span className="text-white font-bold text-lg whitespace-nowrap tracking-tight">
                            Clarke <span className="text-primary-light">&</span> Coleman
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow overflow-y-auto py-6 px-3 space-y-1">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-sidebar-active-bg text-white shadow-sm"
                                    : "text-sidebar-text hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={20} className={cn(
                                "flex-shrink-0 transition-colors",
                                isActive ? "text-primary-light" : "group-hover:text-white"
                            )} />
                            {!isCollapsed && (
                                <span className="text-sm font-medium whitespace-nowrap">{link.name}</span>
                            )}

                            {/* Active State Indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {link.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={() => signOutAction()}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-text hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group relative"
                    )}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}

                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-2 py-1 bg-red-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            Sign Out
                        </div>
                    )}
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="mt-2 w-full flex items-center justify-center p-2 rounded-lg text-sidebar-text hover:text-white hover:bg-white/5 transition-colors hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
}
