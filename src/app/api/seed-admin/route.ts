import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        const conn = await connectToDatabase();
        if (!conn) {
            return NextResponse.json(
                { error: "Database not connected" },
                { status: 500 }
            );
        }

        // Check if an admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            return NextResponse.json({
                message: "Admin user already exists",
                email: existingAdmin.email,
            });
        }

        // Create the initial admin user
        const admin = await User.create({
            name: "Admin User",
            email: "admin@clarkecoleman.co.uk",
            password: "admin123", // Will be hashed by the pre-save hook
            role: "admin",
        });

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            email: admin.email,
            note: "Please change the default password immediately in production!",
        });
    } catch (error: any) {
        console.error("Seed admin error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
