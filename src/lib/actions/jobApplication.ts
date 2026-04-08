"use server";

import mongoose from "mongoose";
import JobApplication, { IJobApplication } from "@/models/JobApplication";
import { revalidatePath } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for JobApplication");
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

export async function submitApplication(data: Partial<IJobApplication>) {
    try {
        await connectToDatabase();
        const newApp = await JobApplication.create(data);
        revalidatePath('/admin/careers');
        return { success: true, application: JSON.parse(JSON.stringify(newApp)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getApplications() {
    try {
        await connectToDatabase();
        const applications = await JobApplication.find({}).populate('job', 'title jobId').sort({ appliedDate: -1 });
        return { success: true, applications: JSON.parse(JSON.stringify(applications)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateApplicationStatus(id: string, status: string) {
    try {
        await connectToDatabase();
        const updatedApp = await JobApplication.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedApp) throw new Error("Application not found");
        revalidatePath('/admin/careers');
        return { success: true, application: JSON.parse(JSON.stringify(updatedApp)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteApplication(id: string) {
    try {
        await connectToDatabase();
        await JobApplication.findByIdAndDelete(id);
        revalidatePath('/admin/careers');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
