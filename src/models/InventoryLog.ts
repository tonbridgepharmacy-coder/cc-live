import mongoose, { Schema, Document, Model } from "mongoose";

export type InventoryAction =
    | "RESERVE"
    | "CONSUME"
    | "RELEASE"
    | "EXPIRE"
    | "ADJUST";

export interface IInventoryLog extends Document {
    vaccineId: mongoose.Types.ObjectId;
    batchId: mongoose.Types.ObjectId;
    quantity: number;
    action: InventoryAction;
    appointmentId?: mongoose.Types.ObjectId;
    performedBy?: string; // admin email or "system"
    notes?: string;
    createdAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
    {
        vaccineId: {
            type: Schema.Types.ObjectId,
            ref: "Vaccine",
            required: true,
        },
        batchId: {
            type: Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },
        quantity: { type: Number, required: true },
        action: {
            type: String,
            enum: ["RESERVE", "CONSUME", "RELEASE", "EXPIRE", "ADJUST"],
            required: true,
        },
        appointmentId: {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
        },
        performedBy: { type: String, default: "system" },
        notes: { type: String },
    },
    { timestamps: true }
);

InventoryLogSchema.index({ vaccineId: 1 });
InventoryLogSchema.index({ batchId: 1 });
InventoryLogSchema.index({ action: 1 });
InventoryLogSchema.index({ createdAt: -1 });

const InventoryLog: Model<IInventoryLog> =
    mongoose.models.InventoryLog ||
    mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);

export default InventoryLog;
