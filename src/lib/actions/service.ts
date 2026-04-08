"use server";

import mongoose from "mongoose";
import Service, { IService } from "@/models/Service";
import { revalidatePath } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for Service");
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

export async function createService(data: Partial<IService>) {
    try {
        await connectToDatabase();
        const newService = await Service.create(data);
        revalidatePath('/admin/services');
        revalidatePath('/services');
        return { success: true, service: JSON.parse(JSON.stringify(newService)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateService(id: string, data: Partial<IService>) {
    try {
        await connectToDatabase();
        const updatedService = await Service.findByIdAndUpdate(id, data, { new: true });
        if (!updatedService) throw new Error("Service not found");
        revalidatePath('/admin/services');
        revalidatePath('/services');
        revalidatePath(`/services/${updatedService.slug}`);
        return { success: true, service: JSON.parse(JSON.stringify(updatedService)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteService(id: string) {
    try {
        await connectToDatabase();
        await Service.findByIdAndDelete(id);
        revalidatePath('/admin/services');
        revalidatePath('/services');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getServices() {
    try {
        await connectToDatabase();
        const services = await Service.find({}).populate('category').select('-content').sort({ createdAt: -1 });
        return { success: true, services: JSON.parse(JSON.stringify(services)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPublishedServices() {
    try {
        await connectToDatabase();
        const services = await Service.find({ status: 'published' }).populate('category').select('-content').sort({ createdAt: -1 });
        return { success: true, services: JSON.parse(JSON.stringify(services)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getServiceBySlug(slug: string) {
    try {
        await connectToDatabase();
        const service = await Service.findOne({ slug }).populate('category');
        if (!service) return { success: false, error: "Service not found" };
        return { success: true, service: JSON.parse(JSON.stringify(service)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getServiceById(id: string) {
    try {
        await connectToDatabase();
        const service = await Service.findById(id).populate('category');
        if (!service) return { success: false, error: "Service not found" };
        return { success: true, service: JSON.parse(JSON.stringify(service)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
