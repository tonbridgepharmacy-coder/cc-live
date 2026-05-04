"use server";

import mongoose from "mongoose";
import Vaccine, { IVaccine } from "@/models/Vaccine";
import "@/models/VaccineCategory";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { stripHtmlTags, truncateText } from "@/lib/utils";

type VaccineInput = Omit<Partial<IVaccine>, "category"> & { category: string };

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for Vaccine");
}

type MongooseCache = {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
};

const globalForMongoose = global as typeof globalThis & {
    mongoose?: MongooseCache;
};

const cached: MongooseCache =
    globalForMongoose.mongoose ??
    (globalForMongoose.mongoose = { conn: null, promise: null });

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown error";
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function connectToDatabase() {
    if (!MONGO_URI) return null;
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI!, { bufferCommands: false });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export async function createVaccine(data: VaccineInput) {
    try {
        await connectToDatabase();
        const payload = {
            ...data,
            metaTitle: data.metaTitle || data.title,
            metaDescription:
                data.metaDescription || truncateText(stripHtmlTags(data.shortDescription || ""), 160),
        };

        const newVaccine = await Vaccine.create(payload);
        revalidatePath('/admin/vaccines');
        revalidatePath('/vaccines');
        // @ts-ignore
        revalidateTag('vaccines');
        return { success: true, vaccine: JSON.parse(JSON.stringify(newVaccine)) };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function updateVaccine(id: string, data: VaccineInput) {
    try {
        await connectToDatabase();
        const payload = {
            ...data,
            metaTitle: data.metaTitle || data.title,
            metaDescription:
                data.metaDescription || truncateText(stripHtmlTags(data.shortDescription || ""), 160),
        };

        const updatedVaccine = await Vaccine.findByIdAndUpdate(id, payload, { new: true });
        if (!updatedVaccine) throw new Error("Vaccine not found");
        revalidatePath('/admin/vaccines');
        revalidatePath('/vaccines');
        revalidatePath(`/vaccines/${updatedVaccine.slug}`);
        // @ts-ignore
        revalidateTag('vaccines');
        return { success: true, vaccine: JSON.parse(JSON.stringify(updatedVaccine)) };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function deleteVaccine(id: string) {
    try {
        await connectToDatabase();
        await Vaccine.findByIdAndDelete(id);
        revalidatePath('/admin/vaccines');
        revalidatePath('/vaccines');
        // @ts-ignore
        revalidateTag('vaccines');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function getVaccines() {
    try {
        await connectToDatabase();
        const vaccines = await Vaccine.find({}).populate('category').select('-content').sort({ createdAt: -1 });
        return { success: true, vaccines: JSON.parse(JSON.stringify(vaccines)) };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

const _getPublishedVaccines = unstable_cache(
    async () => {
        await connectToDatabase();
        const vaccines = await Vaccine.find({ status: 'published' }).populate('category').select('-content').sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(vaccines));
    },
    ['published-vaccines'],
    { tags: ['vaccines'] }
);

export async function getPublishedVaccines() {
    try {
        const vaccines = await _getPublishedVaccines();
        return { success: true, vaccines };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function getVaccineBySlug(slug: string) {
    try {
        const db = await connectToDatabase();
        if (!db) {
            return { success: false, error: "Database connection is not available" };
        }

        const decodedSlug = decodeURIComponent(slug || "").trim();
        if (!decodedSlug) {
            return { success: false, error: "Vaccine not found" };
        }

        const slugPattern = new RegExp(`^${escapeRegex(decodedSlug)}$`, "i");
        const vaccine = await Vaccine.findOne({ slug: slugPattern }).populate('category').lean();

        if (!vaccine) return { success: false, error: "Vaccine not found" };
        return { success: true, vaccine: JSON.parse(JSON.stringify(vaccine)) };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function getVaccineById(id: string) {
    try {
        await connectToDatabase();
        const vaccine = await Vaccine.findById(id).populate('category');
        if (!vaccine) return { success: false, error: "Vaccine not found" };
        return { success: true, vaccine: JSON.parse(JSON.stringify(vaccine)) };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function getPublishedVaccinesByCategory(categoryId: string) {
    try {
        await connectToDatabase();
        const vaccines = await Vaccine.find({ status: 'published', category: categoryId })
            .populate('category')
            .select('-content')
            .sort({ createdAt: -1 });
        return { success: true, vaccines: JSON.parse(JSON.stringify(vaccines)) };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
