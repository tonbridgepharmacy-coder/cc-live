import mongoose, { Schema, Document, Model } from "mongoose";

export type BatchStatus = "active" | "depleted" | "expired" | "recalled";

export interface IBatch extends Document {
    batchNumber: string;
    vaccineId: mongoose.Types.ObjectId;
    quantityTotal: number;
    quantityAvailable: number;
    quantityReserved: number;
    expiryDate: Date;
    supplier: string;
    purchaseDate: Date;
    costPerUnit: number;
    status: BatchStatus;
    createdAt: Date;
    updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
    {
        batchNumber: { type: String, required: true, unique: true, trim: true },
        vaccineId: {
            type: Schema.Types.ObjectId,
            ref: "Vaccine",
            required: true,
        },
        quantityTotal: { type: Number, required: true, min: 0 },
        quantityAvailable: { type: Number, required: true, min: 0 },
        quantityReserved: { type: Number, required: true, default: 0, min: 0 },
        expiryDate: { type: Date, required: true },
        supplier: { type: String, required: true, trim: true },
        purchaseDate: { type: Date, required: true },
        costPerUnit: { type: Number, required: true, default: 0 },
        status: {
            type: String,
            enum: ["active", "depleted", "expired", "recalled"],
            default: "active",
        },
    },
    { timestamps: true }
);

// Indexes for FIFO stock picking
BatchSchema.index({ vaccineId: 1, status: 1, expiryDate: 1 });
BatchSchema.index({ expiryDate: 1 });

const Batch: Model<IBatch> =
    mongoose.models.Batch || mongoose.model<IBatch>("Batch", BatchSchema);

export default Batch;
