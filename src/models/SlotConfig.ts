import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISlotConfig extends Document {
    intervalMinutes: number; // e.g. 30
    capacityPerSlot: number; // e.g. 3 patients per slot
    startHour: number; // e.g. 9 (09:00)
    endHour: number; // e.g. 17 (17:00)
    lunchStartHour: number; // e.g. 13
    lunchEndHour: number; // e.g. 14
    cutoffHours: number; // e.g. 2 (cannot book within 2 hours)
    lockMinutes: number; // e.g. 10 (lock slot for 10 mins during payment)
    daysInAdvance: number; // e.g. 30 (can book up to 30 days ahead)
    closedDays: number[]; // e.g. [0] for Sunday (0=Sun, 6=Sat)
}

const SlotConfigSchema = new Schema<ISlotConfig>(
    {
        intervalMinutes: { type: Number, default: 30 },
        capacityPerSlot: { type: Number, default: 1 },
        startHour: { type: Number, default: 9 },
        endHour: { type: Number, default: 17 },
        lunchStartHour: { type: Number, default: 13 },
        lunchEndHour: { type: Number, default: 14 },
        cutoffHours: { type: Number, default: 2 },
        lockMinutes: { type: Number, default: 10 },
        daysInAdvance: { type: Number, default: 365 },
        closedDays: { type: [Number], default: [0] }, // Closed on Sundays
    },
    { timestamps: true }
);

const SlotConfig: Model<ISlotConfig> =
    mongoose.models.SlotConfig ||
    mongoose.model<ISlotConfig>("SlotConfig", SlotConfigSchema);

export default SlotConfig;
