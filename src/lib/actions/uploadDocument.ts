"use server";

import { v2 as cloudinary } from "cloudinary";

export async function uploadDocument(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Validate file type (allow PDF, DOC, DOCX)
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Please upload a PDF or Word document." };
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "File size exceeds 5MB limit." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using a stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "resumes", resource_type: "raw" }, // using "raw" for non-image docs
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return {
            success: true,
            url: (result as any).secure_url
        };
    } catch (error: any) {
        console.error("Upload document error:", error);
        return { success: false, error: error.message };
    }
}
