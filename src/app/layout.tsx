import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clarkeandcoleman.co.uk"),
  title: {
    default: "Clarke & Coleman Pharmacy | Trusted UK Healthcare",
    template: "%s | Clarke & Coleman Pharmacy",
  },
  description:
    "Clarke & Coleman Pharmacy provides expert pharmaceutical care, travel vaccinations, clinical consultations, and a wide range of health services across the UK.",
  keywords: [
    "pharmacy",
    "UK pharmacy",
    "Tonbridge pharmacy",
    "travel vaccines",
    "travel vaccinations",
    "health clinic",
    "Clarke Coleman",
    "healthcare",
    "prescriptions",
    "clinical services",
    "online booking pharmacy",
  ],
  authors: [{ name: "Clarke & Coleman Pharmacy", url: "https://clarkeandcoleman.co.uk" }],
  creator: "Clarke & Coleman Pharmacy",
  publisher: "Clarke & Coleman Pharmacy",
  alternates: {
    canonical: "https://clarkeandcoleman.co.uk",
  },
  openGraph: {
    title: "Clarke & Coleman Pharmacy | Trusted UK Healthcare",
    description:
      "Your trusted partner in health and wellness. Expert pharmaceutical care and clinical services.",
    url: "https://clarkeandcoleman.co.uk",
    type: "website",
    locale: "en_GB",
    siteName: "Clarke & Coleman Pharmacy",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Clarke & Coleman Pharmacy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clarke & Coleman Pharmacy | Trusted UK Healthcare",
    description:
      "Your trusted partner in health and wellness. Expert pharmaceutical care and clinical services.",
    images: ["/og-default.jpg"],
    site: "@clarkecoleman",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-text-primary">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

