import BookingForm from "@/components/booking/BookingForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";
import { getPublishedServices } from "@/lib/actions/service";
import { getPublishedVaccines } from "@/lib/actions/vaccine";

export const metadata: Metadata = {
    title: "Book an Appointment",
    description:
        "Book your pharmacy service or vaccination appointment online with Clarke & Coleman Pharmacy.",
};

export const dynamic = 'force-dynamic';

export default async function BookPage() {
    const [servicesRes, vaccinesRes] = await Promise.all([
        getPublishedServices(),
        getPublishedVaccines(),
    ]);
    const services = servicesRes.success ? servicesRes.services ?? [] : [];
    const vaccines = vaccinesRes.success ? vaccinesRes.vaccines ?? [] : [];

    return (
        <>
            <section className="relative pt-32 sm:pt-36 pb-12 bg-white border-b border-border/40">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/3" />
                <div className="relative section-container section-padding text-center">
                    <div className="flex justify-center mb-6">
                        <Breadcrumb items={[{ label: "Book Appointment" }]} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-4">
                        Book Your Appointment
                    </h1>
                    <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
                        Select your appointment info, enter your details, and secure your booking
                        online in 3 easy steps.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-background">
                <div className="section-container section-padding">
                    <BookingForm services={services} vaccines={vaccines} />
                </div>
            </section>
        </>
    );
}
