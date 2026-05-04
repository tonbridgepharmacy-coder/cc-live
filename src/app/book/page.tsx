import BookingForm from "@/components/booking/BookingForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";
import { getPublishedVaccines } from "@/lib/actions/vaccine";
import { getPublishedServices } from "@/lib/actions/service";

export const metadata: Metadata = {
    title: "Book an Appointment",
    description:
        "Book your pharmacy appointment online at Clarke & Coleman Pharmacy, Tonbridge. Choose from health services, travel vaccinations, consultations and more.",
    keywords: [
        "book pharmacy appointment Tonbridge",
        "online appointment booking pharmacy",
        "travel vaccine appointment",
        "pharmacy booking Kent",
        "Clarke Coleman book",
    ],
    alternates: { canonical: "https://clarkeandcoleman.co.uk/book" },
    openGraph: {
        title: "Book an Appointment | Clarke & Coleman Pharmacy",
        description: "Book your pharmacy or vaccination appointment online in minutes. Serving Tonbridge and Kent.",
        url: "https://clarkeandcoleman.co.uk/book",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Book an Appointment | Clarke & Coleman Pharmacy",
        description: "Book your pharmacy or vaccination appointment online in minutes.",
    },
};

export const revalidate = 300;

export default async function BookPage() {
    const [vaccinesRes, servicesRes] = await Promise.all([
        getPublishedVaccines(),
        getPublishedServices(),
    ]);
    const vaccines = vaccinesRes.success ? vaccinesRes.vaccines ?? [] : [];
    const services = servicesRes.success ? servicesRes.services ?? [] : [];

    return (
        <>
            <section className="relative pt-32 sm:pt-36 pb-12 bg-white border-b border-border/40">
                <div className="absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-secondary/3" />
                <div className="relative section-container section-padding text-center">
                    <div className="flex justify-center mb-6">
                        <Breadcrumb items={[{ label: "Book Appointment" }]} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-4">
                        Book Your Appointment
                    </h1>
                    <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
                        Select your service or vaccine, choose a date and time, then secure your booking online in 4 easy steps.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-background">
                <div className="section-container section-padding">
                    <BookingForm vaccines={vaccines} services={services} />
                </div>
            </section>
        </>
    );
}
