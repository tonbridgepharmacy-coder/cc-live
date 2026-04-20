"use server";

import connectToDatabase from "@/lib/db";
import Batch, { IBatch } from "@/models/Batch";
import InventoryLog from "@/models/InventoryLog";
import "@/models/Vaccine";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

/**
 * Reserve stock using FIFO (earliest expiry first).
 * Returns the batch used, or null if no stock available.
 */
export async function reserveStock(
    vaccineId: string,
    appointmentId: string,
    quantity: number = 1
): Promise<{ success: boolean; batch?: any; error?: string }> {
    const conn = await connectToDatabase();
    if (!conn) return { success: false, error: "Database not connected" };

    try {
        // Find the earliest-expiry active batch with available stock
        const batch = await Batch.findOneAndUpdate(
            {
                vaccineId: new mongoose.Types.ObjectId(vaccineId),
                status: "active",
                quantityAvailable: { $gte: quantity },
                expiryDate: { $gt: new Date() }, // Not expired
            },
            {
                $inc: {
                    quantityAvailable: -quantity,
                    quantityReserved: quantity,
                },
            },
            {
                sort: { expiryDate: 1 }, // FIFO: earliest expiry first
                new: true, // Return updated document
            }
        );

        if (!batch) {
            return { success: false, error: "No stock available for this vaccine" };
        }

        // Log the reservation
        await InventoryLog.create({
            vaccineId: new mongoose.Types.ObjectId(vaccineId),
            batchId: batch._id,
            quantity,
            action: "RESERVE",
            appointmentId: new mongoose.Types.ObjectId(appointmentId),
            performedBy: "system",
            notes: `Reserved ${quantity} unit(s) from batch ${batch.batchNumber}`,
        });

        // Check if batch is now depleted
        if (batch.quantityAvailable === 0 && batch.quantityReserved === 0) {
            batch.status = "depleted";
            await batch.save();
        }

        revalidatePath("/admin/inventory");
        return { success: true, batch: JSON.parse(JSON.stringify(batch)) };
    } catch (error: any) {
        console.error("Reserve stock error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Release reserved stock back to available (on cancellation).
 */
export async function releaseStock(
    vaccineId: string,
    batchId: string,
    appointmentId: string,
    quantity: number = 1
): Promise<{ success: boolean; error?: string }> {
    const conn = await connectToDatabase();
    if (!conn) return { success: false, error: "Database not connected" };

    try {
        const batch = await Batch.findByIdAndUpdate(
            batchId,
            {
                $inc: {
                    quantityAvailable: quantity,
                    quantityReserved: -quantity,
                },
                $set: { status: "active" }, // Re-activate if was depleted
            },
            { new: true }
        );

        if (!batch) {
            return { success: false, error: "Batch not found" };
        }

        await InventoryLog.create({
            vaccineId: new mongoose.Types.ObjectId(vaccineId),
            batchId: new mongoose.Types.ObjectId(batchId),
            quantity,
            action: "RELEASE",
            appointmentId: new mongoose.Types.ObjectId(appointmentId),
            performedBy: "system",
            notes: `Released ${quantity} unit(s) back to batch ${batch.batchNumber}`,
        });

        revalidatePath("/admin/inventory");
        return { success: true };
    } catch (error: any) {
        console.error("Release stock error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Consume reserved stock (on appointment completion).
 */
export async function consumeStock(
    vaccineId: string,
    batchId: string,
    appointmentId: string,
    quantity: number = 1
): Promise<{ success: boolean; error?: string }> {
    const conn = await connectToDatabase();
    if (!conn) return { success: false, error: "Database not connected" };

    try {
        const batch = await Batch.findByIdAndUpdate(
            batchId,
            {
                $inc: { quantityReserved: -quantity },
            },
            { new: true }
        );

        if (!batch) {
            return { success: false, error: "Batch not found" };
        }

        // Check if batch is now fully consumed
        if (batch.quantityAvailable === 0 && batch.quantityReserved === 0) {
            batch.status = "depleted";
            await batch.save();
        }

        await InventoryLog.create({
            vaccineId: new mongoose.Types.ObjectId(vaccineId),
            batchId: new mongoose.Types.ObjectId(batchId),
            quantity,
            action: "CONSUME",
            appointmentId: new mongoose.Types.ObjectId(appointmentId),
            performedBy: "system",
            notes: `Consumed ${quantity} unit(s) from batch ${batch.batchNumber}`,
        });

        revalidatePath("/admin/inventory");
        return { success: true };
    } catch (error: any) {
        console.error("Consume stock error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check total available stock for a specific vaccine.
 */
export async function getAvailableStock(
    vaccineId: string
): Promise<number> {
    const conn = await connectToDatabase();
    if (!conn) return 0;

    const result = await Batch.aggregate([
        {
            $match: {
                vaccineId: new mongoose.Types.ObjectId(vaccineId),
                status: "active",
                expiryDate: { $gt: new Date() },
            },
        },
        {
            $group: {
                _id: null,
                totalAvailable: { $sum: "$quantityAvailable" },
            },
        },
    ]);

    return result.length > 0 ? result[0].totalAvailable : 0;
}

/**
 * Get all batches for admin view.
 */
export async function getBatches(vaccineId?: string) {
    const conn = await connectToDatabase();
    if (!conn) return [];

    const filter: any = {};
    if (vaccineId) filter.vaccineId = new mongoose.Types.ObjectId(vaccineId);

    const batches = await Batch.find(filter)
        .populate("vaccineId", "title slug")
        .sort({ expiryDate: 1 })
        .lean();

    return JSON.parse(JSON.stringify(batches));
}

/**
 * Create a new batch.
 */
export async function createBatch(data: any) {
    const conn = await connectToDatabase();
    if (!conn) return { success: false, error: "Database not connected" };

    try {
        const batch = await Batch.create({
            ...data,
            quantityAvailable: data.quantityTotal,
            quantityReserved: 0,
        });

        await InventoryLog.create({
            vaccineId: batch.vaccineId,
            batchId: batch._id,
            quantity: batch.quantityTotal,
            action: "ADJUST",
            performedBy: "admin",
            notes: `New batch ${batch.batchNumber} added with ${batch.quantityTotal} units`,
        });

        revalidatePath("/admin/inventory");
        return { success: true, batch: JSON.parse(JSON.stringify(batch)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get inventory logs.
 */
export async function getInventoryLogs(limit: number = 100) {
    const conn = await connectToDatabase();
    if (!conn) return [];

    const logs = await InventoryLog.find({})
        .populate("vaccineId", "title")
        .populate("batchId", "batchNumber")
        .populate("appointmentId", "customerName slotDate")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return JSON.parse(JSON.stringify(logs));
}

/**
 * Get low stock alerts (vaccines below reorder level).
 */
export async function getLowStockAlerts() {
    const conn = await connectToDatabase();
    if (!conn) return [];

    // Import Vaccine model here to avoid circular dependency
    const Vaccine = (await import("@/models/Vaccine")).default;
    const vaccines = await Vaccine.find({ status: "published" }).lean();

    const alerts: any[] = [];

    for (const vaccine of vaccines) {
        const totalAvailable = await getAvailableStock(vaccine._id.toString());
        const reorderLevel = (vaccine as any).reorderLevel || 10;

        if (totalAvailable <= reorderLevel) {
            alerts.push({
                vaccineId: vaccine._id,
                vaccineName: vaccine.title,
                currentStock: totalAvailable,
                reorderLevel,
                severity: totalAvailable === 0 ? "critical" : "warning",
            });
        }
    }

    return alerts;
}

/**
 * Get expiring batch alerts (batches expiring within X days).
 */
export async function getExpiringBatches(daysAhead: number = 30) {
    const conn = await connectToDatabase();
    if (!conn) return [];

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const batches = await Batch.find({
        status: "active",
        expiryDate: { $lte: futureDate, $gt: new Date() },
        quantityAvailable: { $gt: 0 },
    })
        .populate("vaccineId", "title")
        .sort({ expiryDate: 1 })
        .lean();

    return JSON.parse(JSON.stringify(batches));
}

/**
 * Get inventory status summary for all vaccines.
 */
export async function getVaccineInventoryStatus() {
    const conn = await connectToDatabase();
    if (!conn) return [];

    const Vaccine = (await import("@/models/Vaccine")).default;
    const vaccines = await Vaccine.find({})
        .select("title status reorderLevel")
        .sort({ title: 1 })
        .lean();

    const stockStats = await Batch.aggregate([
        {
            $group: {
                _id: "$vaccineId",
                totalAvailable: { $sum: "$quantityAvailable" },
                totalReserved: { $sum: "$quantityReserved" },
                totalStock: { $sum: "$quantityTotal" },
                batchCount: { $sum: 1 },
            },
        },
    ]);

    const nextExpiry = await Batch.aggregate([
        {
            $match: {
                status: "active",
                quantityAvailable: { $gt: 0 },
                expiryDate: { $gt: new Date() },
            },
        },
        {
            $group: {
                _id: "$vaccineId",
                nextExpiryDate: { $min: "$expiryDate" },
            },
        },
    ]);

    const statsMap = new Map<string, any>();
    for (const item of stockStats) {
        statsMap.set(item._id.toString(), item);
    }

    const expiryMap = new Map<string, Date>();
    for (const item of nextExpiry) {
        expiryMap.set(item._id.toString(), item.nextExpiryDate);
    }

    return vaccines.map((vaccine: any) => {
        const key = vaccine._id.toString();
        const stats = statsMap.get(key);

        const totalAvailable = stats?.totalAvailable ?? 0;
        const totalReserved = stats?.totalReserved ?? 0;
        const totalStock = stats?.totalStock ?? 0;
        const batchCount = stats?.batchCount ?? 0;
        const reorderLevel = vaccine.reorderLevel ?? 10;

        let inventoryStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "NOT_CONFIGURED" =
            "IN_STOCK";

        if (batchCount === 0) {
            inventoryStatus = "NOT_CONFIGURED";
        } else if (totalAvailable <= 0) {
            inventoryStatus = "OUT_OF_STOCK";
        } else if (totalAvailable <= reorderLevel) {
            inventoryStatus = "LOW_STOCK";
        }

        return {
            vaccineId: vaccine._id,
            vaccineName: vaccine.title,
            publishStatus: vaccine.status,
            reorderLevel,
            totalAvailable,
            totalReserved,
            totalStock,
            batchCount,
            nextExpiryDate: expiryMap.get(key) || null,
            inventoryStatus,
        };
    });
}
