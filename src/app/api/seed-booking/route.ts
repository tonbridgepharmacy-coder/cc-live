import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import VaccineCategory from "@/models/VaccineCategory";
import Category from "@/models/Category";
import Vaccine from "@/models/Vaccine";
import Service from "@/models/Service";

const DEV_ONLY_MESSAGE =
    "Seeding is disabled in production.";

export async function GET() {
    try {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: DEV_ONLY_MESSAGE }, { status: 403 });
        }

        const conn = await connectToDatabase();
        if (!conn) {
            return NextResponse.json(
                { error: "Database not connected" },
                { status: 500 }
            );
        }

        const uploads = [
            "/uploads/7af6e8dd-6800-456a-ae6e-0e55c1b411d9.avif",
            "/uploads/8a7095fb-a41c-4f7b-89dc-17ce285dfd86.avif",
        ];

        const vaccineCategory = await VaccineCategory.findOneAndUpdate(
            { slug: "travel-vaccines" },
            { name: "Travel Vaccines", slug: "travel-vaccines" },
            { upsert: true, new: true }
        );

        const serviceCategory = await Category.findOneAndUpdate(
            { slug: "pharmacy-services" },
            { name: "Pharmacy Services", slug: "pharmacy-services" },
            { upsert: true, new: true }
        );

        const vaccinesToSeed = [
            {
                title: "Travel Consultation",
                slug: "travel-consultation",
                price: 25,
                bannerImage: uploads[0],
                bannerText: "Pre-travel assessment and advice",
                cardImage: uploads[0],
                shortDescription: "A quick assessment before you travel.",
                content: "<p>Discuss your destination, itinerary, and health needs. We will advise on recommended vaccines and precautions.</p>",
                reorderLevel: 0,
            },
            {
                title: "Hepatitis A Vaccine",
                slug: "hepatitis-a-vaccine",
                price: 45,
                bannerImage: uploads[1],
                bannerText: "Protection against Hepatitis A",
                cardImage: uploads[1],
                shortDescription: "Common travel vaccine for many destinations.",
                content: "<p>Hepatitis A vaccination is recommended for many travel destinations. Suitability depends on your medical history.</p>",
                reorderLevel: 10,
            },
            {
                title: "Typhoid Vaccine",
                slug: "typhoid-vaccine",
                price: 40,
                bannerImage: uploads[0],
                bannerText: "Protection against typhoid fever",
                cardImage: uploads[0],
                shortDescription: "Recommended for travel to high-risk regions.",
                content: "<p>Typhoid vaccination may be advised for certain destinations. Please bring your travel details.</p>",
                reorderLevel: 10,
            },
        ];

        const servicesToSeed = [
            {
                title: "Blood Pressure Check",
                slug: "blood-pressure-check",
                bannerImage: uploads[1],
                bannerText: "Quick in-pharmacy check",
                cardImage: uploads[1],
                shortDescription: "A quick blood pressure check.",
                content: "<p>Drop in or call to book this service.</p>",
            },
            {
                title: "Medication Review",
                slug: "medication-review",
                bannerImage: uploads[0],
                bannerText: "Discuss your medicines",
                cardImage: uploads[0],
                shortDescription: "Review your current medicines with a pharmacist.",
                content: "<p>Call us to arrange a time for your medication review.</p>",
            },
        ];

        const seededVaccines: Array<{ slug: string; id: string }> = [];
        for (const v of vaccinesToSeed) {
            const doc = await Vaccine.findOneAndUpdate(
                { slug: v.slug },
                {
                    ...v,
                    category: vaccineCategory._id,
                    status: "published",
                },
                { upsert: true, new: true }
            );
            seededVaccines.push({ slug: v.slug, id: doc._id.toString() });
        }

        const seededServices: Array<{ slug: string; id: string }> = [];
        for (const s of servicesToSeed) {
            const doc = await Service.findOneAndUpdate(
                { slug: s.slug },
                {
                    ...s,
                    category: serviceCategory._id,
                    status: "published",
                },
                { upsert: true, new: true }
            );
            seededServices.push({ slug: s.slug, id: doc._id.toString() });
        }

        return NextResponse.json({
            success: true,
            vaccineCategory: {
                id: vaccineCategory._id.toString(),
                slug: vaccineCategory.slug,
            },
            serviceCategory: {
                id: serviceCategory._id.toString(),
                slug: serviceCategory.slug,
            },
            seededVaccines,
            seededServices,
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
