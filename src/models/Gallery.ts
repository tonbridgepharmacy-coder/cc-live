import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
    imageUrl: string;
    publicId?: string;
    caption?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
}

const GallerySchema: Schema = new Schema({
    imageUrl: {
        type: String,
        required: [true, "Image URL is required"],
    },
    publicId: {
        type: String,
    },
    caption: {
        type: String,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Gallery = mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
