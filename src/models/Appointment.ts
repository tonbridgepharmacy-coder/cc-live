import mongoose, { Schema, Document, Model } from "mongoose";

export type AppointmentStatus =
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export interface IAppointment extends Document {
    vaccineId: mongoose.Types.ObjectId;
    batchId?: mongoose.Types.ObjectId;
    slotDate: Date;
    slotTime: string; // e.g. "09:30"
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    paymentIntentId?: string;
    amountPaid: number;
    lockedUntil?: Date; // Temporary slot lock for payment window
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        vaccineId: {
            type: Schema.Types.ObjectId,
            ref: "Vaccine",
            required: true,
        },
        batchId: {
            type: Schema.Types.ObjectId,
            ref: "Batch",
        },
        slotDate: { type: Date, required: true },
        slotTime: { type: String, required: true },
        customerName: { type: String, required: true, trim: true },
        customerEmail: { type: String, required: true, lowercase: true, trim: true },
        customerPhone: { type: String, required: true, trim: true },
        notes: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
            default: "PENDING",
        },
        paymentStatus: {
            type: String,
            enum: ["UNPAID", "PAID", "REFUNDED", "FAILED"],
            default: "UNPAID",
        },
        paymentIntentId: { type: String },
        amountPaid: { type: Number, required: true, default: 0 },
        lockedUntil: { type: Date },
    },
    { timestamps: true }
);

// Indexes for performance
AppointmentSchema.index({ slotDate: 1, slotTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ paymentIntentId: 1 });
AppointmentSchema.index({ customerEmail: 1 });
AppointmentSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 }); // TTL cleanup helper

const Appointment: Model<IAppointment> =
    mongoose.models.Appointment ||
    mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
