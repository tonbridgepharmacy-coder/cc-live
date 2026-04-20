"use server";

import mongoose from "mongoose";
import Blog, { IBlog } from "@/models/Blog";
import { revalidatePath } from "next/cache";
import { stripHtmlTags, truncateText } from "@/lib/utils";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.warn("MONGODB_URI is missing, skipping DB connect for Blog");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!MONGO_URI) return null;

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export async function createBlog(data: Partial<IBlog>) {
    try {
        await connectToDatabase();

        // Use a default image if not provided since it's missing in some places
        const payload = {
            ...data,
            image: data.image || '/images/default-blog.jpg',
            cardImage: data.cardImage || data.image || '/images/default-blog.jpg',
            metaTitle: data.metaTitle || data.title,
            metaDescription: data.metaDescription || truncateText(stripHtmlTags(data.excerpt || ""), 160),
        };

        const newBlog = await Blog.create(payload);

        revalidatePath('/admin/blogs');
        revalidatePath('/blogs');

        return { success: true, blog: JSON.parse(JSON.stringify(newBlog)) };
    } catch (error: any) {
        console.error("Error creating blog:", error);
        return { success: false, error: error.message };
    }
}

export async function updateBlog(id: string, data: Partial<IBlog>) {
    try {
        await connectToDatabase();

        const payload = { ...data };
        if (payload.title && !payload.metaTitle) payload.metaTitle = payload.title;
        if (payload.excerpt && !payload.metaDescription) {
            payload.metaDescription = truncateText(stripHtmlTags(payload.excerpt), 160);
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, payload, { new: true });
        if (!updatedBlog) throw new Error("Blog not found");

        revalidatePath('/admin/blogs');
        revalidatePath(`/blogs/${updatedBlog.slug}`);
        revalidatePath('/blogs');

        return { success: true, blog: JSON.parse(JSON.stringify(updatedBlog)) };
    } catch (error: any) {
        console.error("Error updating blog:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteBlog(id: string) {
    try {
        await connectToDatabase();
        await Blog.findByIdAndDelete(id);

        revalidatePath('/admin/blogs');
        revalidatePath('/blogs');

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting blog:", error);
        return { success: false, error: error.message };
    }
}

export async function getBlogs() {
    try {
        await connectToDatabase();
        // Exclude `content` to avoid sending massive base64 image strings to the client list view
        const blogs = await Blog.find({}).select('-content').sort({ createdAt: -1 });
        return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
    } catch (error: any) {
        console.error("Error fetching blogs:", error);
        return { success: false, error: error.message };
    }
}

export async function getPublishedBlogs() {
    try {
        await connectToDatabase();
        // Exclude `content` to avoid sending massive base64 image strings to the client list view
        const blogs = await Blog.find({ status: 'published' }).select('-content').sort({ publishedAt: -1, createdAt: -1 });
        return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
    } catch (error: any) {
        console.error("Error fetching published blogs:", error);
        return { success: false, error: error.message };
    }
}

export async function getBlogBySlug(slug: string) {
    try {
        await connectToDatabase();
        const blog = await Blog.findOne({ slug });
        if (!blog) return { success: false, error: "Blog not found" };
        return { success: true, blog: JSON.parse(JSON.stringify(blog)) };
    } catch (error: any) {
        console.error("Error fetching blog by slug:", error);
        return { success: false, error: error.message };
    }
}

export async function getBlogById(id: string) {
    try {
        await connectToDatabase();
        const blog = await Blog.findById(id);
        if (!blog) return { success: false, error: "Blog not found" };
        return { success: true, blog: JSON.parse(JSON.stringify(blog)) };
    } catch (error: any) {
        console.error("Error fetching blog by id:", error);
        return { success: false, error: error.message };
    }
}
