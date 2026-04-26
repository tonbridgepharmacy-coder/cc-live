"use server";

import mongoose from "mongoose";
import Category, { ICategory } from "@/models/Category";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for Category");
    // We don't throw, we just warn. Operations will fail gracefully below.
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

export async function createCategory(data: Partial<ICategory>) {
    try {
        await connectToDatabase();
        const newCategory = await Category.create(data);
        revalidatePath('/admin/categories');
        revalidatePath('/services');
        // @ts-ignore - Next 16 typings mismatch
        revalidateTag('services');
        return { success: true, category: JSON.parse(JSON.stringify(newCategory)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCategory(id: string, data: Partial<ICategory>) {
    try {
        await connectToDatabase();
        const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true });
        if (!updatedCategory) throw new Error("Category not found");
        revalidatePath('/admin/categories');
        revalidatePath('/services');
        // @ts-ignore
        revalidateTag('services');
        return { success: true, category: JSON.parse(JSON.stringify(updatedCategory)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        await connectToDatabase();
        await Category.findByIdAndDelete(id);
        revalidatePath('/admin/categories');
        revalidatePath('/services');
        // @ts-ignore
        revalidateTag('services');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

const _getCategories = unstable_cache(
    async () => {
        await connectToDatabase();
        const categories = await Category.find({}).sort({ name: 1 });
        return JSON.parse(JSON.stringify(categories));
    },
    ['categories'],
    { tags: ['services'] }
);

export async function getCategories() {
    try {
        const categories = await _getCategories();
        return { success: true, categories };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
