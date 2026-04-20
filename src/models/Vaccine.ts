import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVaccine extends Document {
    title: string;
    slug: string;
    category: mongoose.Types.ObjectId;
    bannerImage: string;
    bannerText: string;
    cardImage: string;
    shortDescription: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    seoKeywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    price: number;
    crossedPrice?: number;
    rating?: number;
    reorderLevel: number;
    status: 'draft' | 'published';
    createdAt: Date;
    updatedAt: Date;
}

const vaccineSchema = new Schema<IVaccine>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        category: { type: Schema.Types.ObjectId, ref: 'VaccineCategory', required: true },
        bannerImage: { type: String, required: true },
        bannerText: { type: String, required: true },
        cardImage: { type: String, required: true },
        shortDescription: { type: String, required: true },
        content: { type: String, required: true },
        metaTitle: { type: String },
        metaDescription: { type: String },
        seoKeywords: { type: [String] },
        canonicalUrl: { type: String },
        noIndex: { type: Boolean, default: false },
        price: { type: Number, required: true },
        crossedPrice: { type: Number },
        rating: { type: Number, min: 0, max: 5 },
        reorderLevel: { type: Number, default: 10, min: 0 },
        status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    },
    { timestamps: true }
);

const Vaccine: Model<IVaccine> = mongoose.models.Vaccine || mongoose.model<IVaccine>('Vaccine', vaccineSchema);

export default Vaccine;
