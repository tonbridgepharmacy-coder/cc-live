"use server";

import mongoose from "mongoose";
import Vaccine, { IVaccine } from "@/models/Vaccine";
import { revalidatePath } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for Vaccine");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!MONGO_URI) return null;
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI!, { bufferCommands: false }).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export async function createVaccine(data: Partial<IVaccine>) {
    try {
        await connectToDatabase();
        const newVaccine = await Vaccine.create(data);
        revalidatePath('/admin/vaccines');
        revalidatePath('/vaccines');
        return { success: true, vaccine: JSON.parse(JSON.stringify(newVaccine)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateVaccine(id: string, data: Partial<IVaccine>) {
    try {
        await connectToDatabase();
        const updatedVaccine = await Vaccine.findByIdAndUpdate(id, data, { new: true });
        if (!updatedVaccine) throw new Error("Vaccine not found");
        revalidatePath('/admin/vaccines');
        revalidatePath('/vaccines');
        revalidatePath(`/vaccines/${updatedVaccine.slug}`);
        return { success: true, vaccine: JSON.parse(JSON.stringify(updatedVaccine)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVaccine(id: string) {
    try {
        await connectToDatabase();
        await Vaccine.findByIdAndDelete(id);
        revalidatePath('/admin/vaccines');
        revalidatePath('/vaccines');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getVaccines() {
    try {
        await connectToDatabase();
        const vaccines = await Vaccine.find({}).populate('category').select('-content').sort({ createdAt: -1 });
        return { success: true, vaccines: JSON.parse(JSON.stringify(vaccines)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPublishedVaccines() {
    try {
        await connectToDatabase();
        const vaccines = await Vaccine.find({ status: 'published' }).populate('category').select('-content').sort({ createdAt: -1 });
        return { success: true, vaccines: JSON.parse(JSON.stringify(vaccines)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getVaccineBySlug(slug: string) {
    try {
        await connectToDatabase();
        const vaccine = await Vaccine.findOne({ slug }).populate('category');
        if (!vaccine) return { success: false, error: "Vaccine not found" };
        return { success: true, vaccine: JSON.parse(JSON.stringify(vaccine)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getVaccineById(id: string) {
    try {
        await connectToDatabase();
        const vaccine = await Vaccine.findById(id).populate('category');
        if (!vaccine) return { success: false, error: "Vaccine not found" };
        return { success: true, vaccine: JSON.parse(JSON.stringify(vaccine)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
