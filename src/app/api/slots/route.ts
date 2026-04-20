import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import SlotConfig from "@/models/SlotConfig";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get("date");

        if (!dateStr) {
            return NextResponse.json(
                { error: "Date parameter is required (YYYY-MM-DD)" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Get slot configuration (or use defaults)
        let config = await SlotConfig.findOne();
        if (!config) {
            config = await SlotConfig.create({});
        }

        const requestedDate = new Date(`${dateStr}T00:00:00`);
        const dayOfWeek = requestedDate.getDay(); // 0=Sun, 6=Sat

        // Check if it's a closed day
        if (config.closedDays.includes(dayOfWeek)) {
            return NextResponse.json({ slots: [], closed: true });
        }

        // Check cutoff (cannot book within X hours)
        const now = new Date();
        const isToday = requestedDate.toDateString() === now.toDateString();

        // Generate all time slots for the day
        const slots: { time: string; available: number; total: number }[] = [];
        const startMinutes = config.startHour * 60;
        const endMinutes = config.endHour * 60;
        const lunchStart = config.lunchStartHour * 60;
        const lunchEnd = config.lunchEndHour * 60;

        for (let m = startMinutes; m < endMinutes; m += config.intervalMinutes) {
            // Skip lunch break
            if (m >= lunchStart && m < lunchEnd) continue;

            const hour = Math.floor(m / 60);
            const min = m % 60;
            const timeStr = `${hour.toString().padStart(2, "0")}:${min
                .toString()
                .padStart(2, "0")}`;

            // If today, check cutoff
            if (isToday) {
                const slotTime = new Date(requestedDate);
                slotTime.setHours(hour, min, 0, 0);
                const cutoffTime = new Date(
                    now.getTime() + config.cutoffHours * 60 * 60 * 1000
                );
                if (slotTime <= cutoffTime) continue;
            }

            slots.push({
                time: timeStr,
                available: config.capacityPerSlot,
                total: config.capacityPerSlot,
            });
        }

        // Get existing bookings for the date (active ones = not cancelled)
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await Appointment.find({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["PENDING", "CONFIRMED", "BLOCKED"] },
        });

        // Also count locked slots (payment in progress)
        const lockedBookings = await Appointment.find({
            slotDate: { $gte: startOfDay, $lte: endOfDay },
            status: "PENDING",
            lockedUntil: { $gt: now },
        });

        // Reduce availability based on bookings
        for (const slot of slots) {
            const blockedCount = existingBookings.filter(
                (b) => b.slotTime === slot.time && b.status === "BLOCKED"
            ).length;

            if (blockedCount > 0) {
                slot.available = 0;
                continue;
            }

            const confirmedCount = existingBookings.filter(
                (b) => b.slotTime === slot.time && b.status === "CONFIRMED"
            ).length;
            const lockedCount = lockedBookings.filter(
                (b) => b.slotTime === slot.time
            ).length;

            slot.available = Math.max(
                0,
                config.capacityPerSlot - confirmedCount - lockedCount
            );
        }

        return NextResponse.json({
            slots,
            date: dateStr,
            config: {
                intervalMinutes: config.intervalMinutes,
                capacityPerSlot: config.capacityPerSlot,
            },
        });
    } catch (error: unknown) {
        console.error("Slot availability error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
