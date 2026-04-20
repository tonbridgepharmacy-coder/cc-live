"use server";

import connectToDatabase from "@/lib/db";
import { Gallery } from "@/models/Gallery";
import { revalidatePath } from "next/cache";

export async function uploadGalleryImage(data: { imageUrl: string; caption?: string }) {
    try {
        await connectToDatabase();

        // Get the current max order to append the new image at the end
        const lastImage = await Gallery.findOne().sort({ order: -1 });
        const newOrder = lastImage ? lastImage.order + 1 : 0;

        const newImage = await Gallery.create({
            imageUrl: data.imageUrl,
            caption: data.caption,
            order: newOrder,
        });

        revalidatePath("/admin/gallery");
        revalidatePath("/");

        return {
            success: true,
            message: "Image uploaded to gallery successfully",
            image: JSON.parse(JSON.stringify(newImage)),
        };
    } catch (error: any) {
        console.error("Gallery upload error:", error);
        return { success: false, message: error.message || "Failed to upload image" };
    }
}

export async function getGalleryImages(options?: { activeOnly?: boolean; limit?: number }) {
    try {
        await connectToDatabase();

        const filter = options?.activeOnly ? { isActive: true } : {};
        let query = Gallery.find(filter).sort({ order: 1, createdAt: -1 });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const images = await query;
        return { success: true, images: JSON.parse(JSON.stringify(images)) };
    } catch (error) {
        console.error("Fetch gallery error:", error);
        return { success: false, images: [] };
    }
}

export async function updateImageOrder(updates: { id: string; order: number }[]) {
    try {
        await connectToDatabase();

        // Perform bulk update
        const operations = updates.map((update) => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: { order: update.order } },
            },
        }));

        await Gallery.bulkWrite(operations);

        revalidatePath("/admin/gallery");
        revalidatePath("/");

        return { success: true, message: "Gallery order updated successfully" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to update order" };
    }
}

export async function toggleGalleryImageStatus(id: string, currentStatus: boolean) {
    try {
        await connectToDatabase();

        await Gallery.findByIdAndUpdate(id, {
            isActive: !currentStatus
        });

        revalidatePath("/admin/gallery");
        revalidatePath("/");

        return { success: true, message: "Image status updated" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to toggle status" };
    }
}

export async function deleteGalleryImage(id: string) {
    try {
        await connectToDatabase();
        await Gallery.findByIdAndDelete(id);

        revalidatePath("/admin/gallery");
        revalidatePath("/");

        return { success: true, message: "Image removed from gallery" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to delete image" };
    }
}

export async function deleteGalleryImages(ids: string[]) {
    try {
        await connectToDatabase();
        await Gallery.deleteMany({ _id: { $in: ids } });

        revalidatePath("/admin/gallery");
        revalidatePath("/");

        return { success: true, message: `${ids.length} images removed from gallery` };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to delete images" };
    }
}

export async function uploadGalleryImagesBatch(images: { imageUrl: string; caption?: string }[]) {
    try {
        await connectToDatabase();

        // Get the current max order
        const lastImage = await Gallery.findOne().sort({ order: -1 });
        let nextOrder = lastImage ? lastImage.order + 1 : 0;

        const docs = images.map(img => ({
            ...img,
            order: nextOrder++
        }));

        const newImages = await Gallery.insertMany(docs);

        revalidatePath("/admin/gallery");
        revalidatePath("/");

        return {
            success: true,
            message: `${newImages.length} images added to gallery`,
            images: JSON.parse(JSON.stringify(newImages)),
        };
    } catch (error: any) {
        console.error("Gallery batch upload error:", error);
        return { success: false, message: error.message || "Failed to upload images" };
    }
}
