"use server";

import mongoose from "mongoose";
import PageSetting, { IPageSetting } from "@/models/PageSetting";
import { revalidatePath } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for PageSetting");
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

export async function getPageSetting(pageId: string) {
    try {
        await connectToDatabase();
        let setting = await PageSetting.findOne({ pageId });

        // If no setting exists, create a default one
        if (!setting) {
            setting = await PageSetting.create({
                pageId,
                bannerImage: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80",
                bannerText: "Default Banner Text"
            });
        }

        return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePageSetting(pageId: string, data: Partial<IPageSetting>) {
    try {
        await connectToDatabase();
        const updatedSetting = await PageSetting.findOneAndUpdate(
            { pageId },
            data,
            { new: true, upsert: true } // Upsert creates if it doesn't exist
        );
        revalidatePath(`/${pageId}`); // Revalidate the public facing page
        revalidatePath(`/admin/${pageId}/settings`); // Revalidate admin side
        return { success: true, setting: JSON.parse(JSON.stringify(updatedSetting)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
