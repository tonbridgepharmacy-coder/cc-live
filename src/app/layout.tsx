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
  title: {
    default: "Clarke & Coleman Pharmacy | Trusted UK Healthcare",
    template: "%s | Clarke & Coleman Pharmacy",
  },
  description:
    "Clarke & Coleman Pharmacy provides expert pharmaceutical care, travel vaccinations, clinical consultations, and a wide range of health services across the UK.",
  keywords: [
    "pharmacy",
    "UK pharmacy",
    "travel vaccines",
    "health clinic",
    "Clarke Coleman",
    "healthcare",
    "prescriptions",
  ],
  openGraph: {
    title: "Clarke & Coleman Pharmacy | Trusted UK Healthcare",
    description:
      "Your trusted partner in health and wellness. Expert pharmaceutical care and clinical services.",
    type: "website",
    locale: "en_GB",
    siteName: "Clarke & Coleman Pharmacy",
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

