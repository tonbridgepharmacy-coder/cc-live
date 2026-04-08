import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
    title: string;
    slug: string;
    category: mongoose.Types.ObjectId | any;
    bannerImage: string;
    bannerText: string;
    cardImage: string;
    shortDescription: string;
    content: string;
    status: 'draft' | 'published';
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        bannerImage: { type: String, required: true },
        bannerText: { type: String, required: true },
        cardImage: { type: String, required: true },
        shortDescription: { type: String, required: true },
        content: { type: String, required: true },
        status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    },
    { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
