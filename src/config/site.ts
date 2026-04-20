// =============================================
// Clarke & Coleman Pharmacy — Site Configuration
// =============================================

export const siteConfig = {
    name: "Clarke & Coleman Pharmacy",
    tagline: "Your Trusted Partner in Health & Wellness",
    description:
        "Clarke & Coleman Pharmacy provides expert pharmaceutical care, clinical consultations, and a wide range of health services across the UK.",
    url: "https://clarkeandcoleman.co.uk",
    phone: "01732353743",
    email: "tonbridgepharmacy@gmail.com",
    address: "Clarke & Coleman Pharmacy, 140 High St, Tonbridge TN9 1BB",
    openingHours: "Mon–Fri: 8:30am – 6:30pm | Sat: 9am – 1pm",
    careers: {
        email: "careers@clarkeandcoleman.co.uk",
    },
    social: {
        facebook: "https://facebook.com/clarkeandcoleman",
        twitter: "https://twitter.com/clarkecoleman",
        instagram: "https://instagram.com/clarkeandcoleman",
        linkedin: "https://linkedin.com/company/clarkeandcoleman",
    },
} as const;

export const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
        label: "Services",
        href: "/services",
        children: [], // Populated dynamically from DB
    },
    { label: "Vaccines", href: "/vaccines" },
    { label: "Blogs", href: "/blogs" },
    { label: "Careers", href: "/careers" },
] as const;
