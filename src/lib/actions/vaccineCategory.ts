"use server";

import mongoose from "mongoose";
import VaccineCategory, { IVaccineCategory } from "@/models/VaccineCategory";
import { revalidatePath } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for VaccineCategory");
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

export async function createVaccineCategory(data: Partial<IVaccineCategory>) {
    try {
        await connectToDatabase();
        const newCategory = await VaccineCategory.create(data);
        revalidatePath('/admin/vaccines/categories');
        revalidatePath('/vaccines');
        return { success: true, category: JSON.parse(JSON.stringify(newCategory)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateVaccineCategory(id: string, data: Partial<IVaccineCategory>) {
    try {
        await connectToDatabase();
        const updatedCategory = await VaccineCategory.findByIdAndUpdate(id, data, { new: true });
        if (!updatedCategory) throw new Error("Category not found");
        revalidatePath('/admin/vaccines/categories');
        revalidatePath('/vaccines');
        return { success: true, category: JSON.parse(JSON.stringify(updatedCategory)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVaccineCategory(id: string) {
    try {
        await connectToDatabase();
        await VaccineCategory.findByIdAndDelete(id);
        revalidatePath('/admin/vaccines/categories');
        revalidatePath('/vaccines');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getVaccineCategories() {
    try {
        await connectToDatabase();
        const categories = await VaccineCategory.find({}).sort({ createdAt: -1 });
        return { success: true, categories: JSON.parse(JSON.stringify(categories)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
