import mongoose, { Schema, Document, Model } from "mongoose";

export type AppointmentStatus =
    | "PENDING"
    | "BLOCKED"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED"
    | "NO_SHOW";

export type PaymentStatus =
    | "UNPAID"
    | "PAID"
    | "REFUND_PENDING"
    | "REFUNDED"
    | "FAILED";

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
    rejectionReason?: string;
    rejectedAt?: Date;
    refundId?: string; // Stripe refund ID
    refundRequestedAt?: Date;
    refundInitiatedAt?: Date;
    refundFailureReason?: string;
    calendarEventId?: string;
    calendarEventLink?: string;
    meetingLink?: string;
    adminNotifiedAt?: Date;
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
            enum: [
                "PENDING",
                "BLOCKED",
                "CONFIRMED",
                "COMPLETED",
                "CANCELLED",
                "REJECTED",
                "NO_SHOW",
            ],
            default: "PENDING",
        },
        paymentStatus: {
            type: String,
            enum: ["UNPAID", "PAID", "REFUND_PENDING", "REFUNDED", "FAILED"],
            default: "UNPAID",
        },
        paymentIntentId: { type: String },
        amountPaid: { type: Number, required: true, default: 0 },
        lockedUntil: { type: Date },
        rejectionReason: { type: String },
        rejectedAt: { type: Date },
        refundId: { type: String },
        refundRequestedAt: { type: Date },
        refundInitiatedAt: { type: Date },
        refundFailureReason: { type: String },
        calendarEventId: { type: String },
        calendarEventLink: { type: String },
        meetingLink: { type: String },
        adminNotifiedAt: { type: Date },
    },
    { timestamps: true }
);

// Indexes for performance
AppointmentSchema.index({ slotDate: 1, slotTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ paymentIntentId: 1 });
AppointmentSchema.index({ customerEmail: 1 });
AppointmentSchema.index({ calendarEventId: 1 });
AppointmentSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 }); // TTL cleanup helper

const modelName = "Appointment";

// Next.js dev/HMR can keep an old compiled model instance in `mongoose.models`,
// which would ignore enum changes like adding "BLOCKED".
if (process.env.NODE_ENV !== "production" && mongoose.models[modelName]) {
    delete mongoose.models[modelName];
}

const Appointment: Model<IAppointment> =
    (mongoose.models[modelName] as Model<IAppointment> | undefined) ||
    mongoose.model<IAppointment>(modelName, AppointmentSchema);

export default Appointment;
