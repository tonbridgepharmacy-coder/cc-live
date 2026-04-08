import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceName: string;
    servicePrice: number;
    bookingDate: Date; // The date of the appointment
    status: "pending" | "confirmed" | "cancelled" | "completed";
    paymentStatus: "paid" | "unpaid" | "refunded";
    paymentIntentId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        serviceName: { type: String, required: true },
        servicePrice: { type: Number, required: true },
        bookingDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "confirmed", // Default to confirmed if paid
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "unpaid", "refunded"],
            default: "unpaid",
        },
        paymentIntentId: { type: String },
        notes: { type: String },
    },
    { timestamps: true }
);

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
