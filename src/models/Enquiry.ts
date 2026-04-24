import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiry extends Document {
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
    status: "pending" | "contacted" | "hold" | "hot" | "warm" | "cold";
    createdAt: Date;
    updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        subject: { type: String },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "contacted", "hold", "hot", "warm", "cold"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Enquiry: Model<IEnquiry> =
    mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;
