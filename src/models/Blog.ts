import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    image?: string; // Cover image for hero
    cardImage?: string; // 4:3 image for external cards
    tags?: string[];
    readTime?: string;
    featured: boolean;
    status: "draft" | "published" | "archived";
    metaTitle?: string;
    metaDescription?: string;
    seoKeywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    viewCount: number;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true, index: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: String, required: true, default: "Clarke & Coleman Team" },
        category: { type: String, required: true, default: "Health Advice", index: true },
        image: { type: String },
        cardImage: { type: String },
        tags: { type: [String], index: true },
        readTime: { type: String, default: "5 min read" },
        featured: { type: Boolean, default: false, index: true },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            index: true
        },
        metaTitle: { type: String },
        metaDescription: { type: String },
        seoKeywords: { type: [String] },
        canonicalUrl: { type: String },
        noIndex: { type: Boolean, default: false },
        viewCount: { type: Number, default: 0 },
        publishedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Prevent overwrite during hot reload
const Blog: Model<IBlog> =
    mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
