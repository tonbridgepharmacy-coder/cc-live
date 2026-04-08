import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function Breadcrumb({ items, theme = "light" }: { items: BreadcrumbItem[], theme?: "light" | "dark" }) {
    const isDark = theme === "dark";
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${isDark ? "text-white/60" : "text-text-muted"}`}>
            <Link href="/" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-primary"}`}>
                Home
            </Link>
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    {item.href ? (
                        <Link href={item.href} className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-primary"}`}>
                            {item.label}
                        </Link>
                    ) : (
                        <span className={`font-medium ${isDark ? "text-white" : "text-text-secondary"}`}>{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
