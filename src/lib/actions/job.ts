"use server";

import mongoose from "mongoose";
import Job, { IJob } from "@/models/Job";
import { revalidatePath } from "next/cache";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for Job");
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

export async function createJob(data: Partial<IJob>) {
    try {
        await connectToDatabase();
        const newJob = await Job.create(data);
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, job: JSON.parse(JSON.stringify(newJob)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateJob(id: string, data: Partial<IJob>) {
    try {
        await connectToDatabase();
        const updatedJob = await Job.findByIdAndUpdate(id, data, { new: true });
        if (!updatedJob) throw new Error("Job not found");
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        revalidatePath(`/careers/${updatedJob.slug}`);
        return { success: true, job: JSON.parse(JSON.stringify(updatedJob)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteJob(id: string) {
    try {
        await connectToDatabase();
        await Job.findByIdAndDelete(id);
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getJobs() {
    try {
        await connectToDatabase();
        const jobs = await Job.find({}).sort({ postedDate: -1 });
        return { success: true, jobs: JSON.parse(JSON.stringify(jobs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getActiveJobs() {
    try {
        await connectToDatabase();
        const jobs = await Job.find({ status: 'Active' }).sort({ postedDate: -1 });
        return { success: true, jobs: JSON.parse(JSON.stringify(jobs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getJobBySlug(slug: string) {
    try {
        await connectToDatabase();
        const job = await Job.findOne({ slug });
        if (!job) return { success: false, error: "Job not found" };
        return { success: true, job: JSON.parse(JSON.stringify(job)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getJobById(id: string) {
    try {
        await connectToDatabase();
        const job = await Job.findById(id);
        if (!job) return { success: false, error: "Job not found" };
        return { success: true, job: JSON.parse(JSON.stringify(job)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
