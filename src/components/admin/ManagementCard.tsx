import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagementCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color: "blue" | "emerald" | "amber" | "rose" | "slate";
}

const colorStyles = {
    blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white",
    emerald: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white",
    amber: "text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white",
    rose: "text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white",
    slate: "text-slate-600 bg-slate-50 group-hover:bg-slate-600 group-hover:text-white",
};

export default function ManagementCard({ title, description, href, icon: Icon, color }: ManagementCardProps) {
    return (
        <Link
            href={href}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-premium hover:shadow-lg transition-all duration-300 relative overflow-hidden"
        >
            <div className="flex items-start gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                    colorStyles[color]
                )}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
                </div>
                <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <ChevronRight size={20} />
                </div>
            </div>

            {/* Subtle hover background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
    );
}
