import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await connectToDatabase();

        // List all users in the database
        const users = await User.find({}).select("name email role createdAt");

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        return NextResponse.json({
            envAdminEmail: adminEmail || "NOT SET",
            envAdminPassword: adminPassword ? "SET (" + adminPassword.length + " chars)" : "NOT SET",
            totalUsers: users.length,
            users: users.map((u) => ({
                name: u.name,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt,
            })),
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
