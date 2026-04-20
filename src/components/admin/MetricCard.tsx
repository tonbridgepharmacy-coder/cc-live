import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color: "blue" | "emerald" | "amber" | "rose" | "slate";
}

const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function MetricCard({ label, value, icon: Icon, trend, color }: MetricCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                    colorStyles[color]
                )}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                        trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {trend.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                </div>
            </div>
        </div>
    );
}
