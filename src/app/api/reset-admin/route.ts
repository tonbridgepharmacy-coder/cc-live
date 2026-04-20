import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env" },
                { status: 500 }
            );
        }

        const conn = await connectToDatabase();
        if (!conn) {
            return NextResponse.json(
                { error: "Database not connected" },
                { status: 500 }
            );
        }

        // Delete any existing admin user and recreate with fresh credentials
        await User.deleteMany({ role: "admin" });

        const admin = await User.create({
            name: "Admin User",
            email: adminEmail,
            password: adminPassword, // Will be hashed by the pre-save hook
            role: "admin",
        });

        return NextResponse.json({
            success: true,
            message: "Admin user reset successfully with new credentials from .env",
            email: admin.email,
        });
    } catch (error: any) {
        console.error("Reset admin error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
