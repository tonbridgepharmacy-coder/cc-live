import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import SlotConfig from "@/models/SlotConfig";

type SlotConfigLike = {
    intervalMinutes: number;
    capacityPerSlot: number;
    startHour: number;
    endHour: number;
    lunchStartHour: number;
    lunchEndHour: number;
    cutoffHours: number;
    daysInAdvance: number;
    closedDays: number[];
};

function pad2(n: number) {
    return n.toString().padStart(2, "0");
}

function toDateString(date: Date) {
    // Keep consistent with existing APIs using YYYY-MM-DD
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return `${y}-${m}-${d}`;
}

function generateSlotTimesForDate(dateStr: string, config: SlotConfigLike) {
    const requestedDate = new Date(`${dateStr}T00:00:00`);
    const now = new Date();
    const isToday = requestedDate.toDateString() === now.toDateString();

    const startMinutes = config.startHour * 60;
    const endMinutes = config.endHour * 60;
    const lunchStart = config.lunchStartHour * 60;
    const lunchEnd = config.lunchEndHour * 60;

    const times: string[] = [];

    for (let m = startMinutes; m < endMinutes; m += config.intervalMinutes) {
        if (m >= lunchStart && m < lunchEnd) continue;

        const hour = Math.floor(m / 60);
        const min = m % 60;
        const timeStr = `${pad2(hour)}:${pad2(min)}`;

        if (isToday) {
            const slotTime = new Date(requestedDate);
            slotTime.setHours(hour, min, 0, 0);
            const cutoffTime = new Date(
                now.getTime() + config.cutoffHours * 60 * 60 * 1000
            );
            if (slotTime <= cutoffTime) continue;
        }

        times.push(timeStr);
    }

    return times;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const daysParam = searchParams.get("days");
        const requestedDays = daysParam ? parseInt(daysParam, 10) : 365;
        const days = Number.isFinite(requestedDays) ? Math.min(Math.max(requestedDays, 1), 365) : 365;

        await connectToDatabase();

        let config = (await SlotConfig.findOne().lean()) as SlotConfigLike | null;
        if (!config) {
            const created = await SlotConfig.create({});
            config = created.toObject() as SlotConfigLike;
        }

        const now = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        // Booking UI starts from tomorrow
        start.setDate(start.getDate() + 1);

        const maxDays = days;
        const end = new Date(start);
        end.setDate(end.getDate() + (maxDays - 1));
        end.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            slotDate: { $gte: start, $lte: end },
            $or: [
                { status: "BLOCKED" },
                { status: "CONFIRMED" },
                { status: "PENDING", lockedUntil: { $gt: now } },
            ],
        })
            .select("slotDate slotTime status lockedUntil")
            .lean();

        // Key: YYYY-MM-DD|HH:mm -> count
        const slotCounts = new Map<string, number>();
        const blockedSlots = new Set<string>();
        for (const apt of appointments) {
            const d = new Date(apt.slotDate);
            const keyDate = toDateString(d);
            const key = `${keyDate}|${apt.slotTime}`;
            if (apt.status === "BLOCKED") {
                blockedSlots.add(key);
            }
            slotCounts.set(key, (slotCounts.get(key) || 0) + 1);
        }

        const availableDates: Array<{ date: string; availableSlots: number }> = [];

        for (let i = 0; i < maxDays; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            const dayStr = toDateString(day);

            const dayOfWeek = day.getDay();
            if (config.closedDays?.includes(dayOfWeek)) {
                continue;
            }

            const times = generateSlotTimesForDate(dayStr, config);
            if (times.length === 0) continue;

            let openSlots = 0;
            for (const time of times) {
                if (blockedSlots.has(`${dayStr}|${time}`)) {
                    continue;
                }
                const taken = slotCounts.get(`${dayStr}|${time}`) || 0;
                if (config.capacityPerSlot - taken > 0) {
                    openSlots++;
                }
            }

            if (openSlots > 0) {
                availableDates.push({ date: dayStr, availableSlots: openSlots });
            }
        }

        return NextResponse.json({
            dates: availableDates,
            days: maxDays,
        });
    } catch (error: unknown) {
        console.error("Available dates error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
