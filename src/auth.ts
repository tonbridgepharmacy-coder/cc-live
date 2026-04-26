import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { recordLoginAudit } from "@/lib/loginAudit";
import LoginAudit from "@/models/LoginAudit";

function resolveClientIp(req?: Request) {
    const xff = req?.headers.get("x-forwarded-for") || "";
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
    return req?.headers.get("x-real-ip") || undefined;
}

function resolveUserAgent(req?: Request) {
    return req?.headers.get("user-agent") || undefined;
}

// FORCING OVERRIDE for local development so you do not have to restart your terminal!
// NextAuth will crash/loop if AUTH_URL is set to production but running on localhost.
if (process.env.NODE_ENV !== "production") {
    delete process.env.AUTH_URL;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials, req) {
                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6),
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log("❌ Invalid credential format");
                    const rawEmail =
                        credentials && typeof credentials === "object" && "email" in credentials
                            ? String((credentials as Record<string, unknown>).email || "")
                            : "unknown";
                    await recordLoginAudit({
                        email: rawEmail || "unknown",
                        status: "FAILED",
                        reason: "Invalid credential format",
                        ipAddress: resolveClientIp(req),
                        userAgent: resolveUserAgent(req),
                    });
                    return null;
                }

                const { email, password } = parsedCredentials.data;

                let recentFailures = 0;

                // --- 1. Enforce Account Lockout Policy (max 5 attempts in 15 mins) ---
                try {
                    await connectToDatabase();
                    // Checking failed audits in last 15 minutes
                    const lockTimeLimit = new Date(Date.now() - 15 * 60 * 1000);
                    recentFailures = await LoginAudit.countDocuments({
                        email: email.toLowerCase(),
                        status: "FAILED",
                        createdAt: { $gt: lockTimeLimit }
                    });

                    if (recentFailures >= 5) {
                        console.log("❌ Account locked due to too many failed attempts:", email);
                        // Optional: Record this specific blocked attempt as well
                        await recordLoginAudit({
                            email,
                            status: "FAILED",
                            reason: "Account Locked (Too many attempts)",
                            ipAddress: resolveClientIp(req),
                            userAgent: resolveUserAgent(req),
                        });
                        throw new Error("ACCOUNT_LOCKED");
                    }
                } catch (e: any) {
                    // Propagate the specific account locked error
                    if (e.message === "ACCOUNT_LOCKED") {
                        throw new Error("Account locked due to too many failed attempts. Try again in 15 mins.");
                    }
                    console.error("Error checking login limits:", e);
                }
                // -------------------------------------------------------------------

                const handleFailedLogin = async (reason: string, userId?: string, role?: string) => {
                    await recordLoginAudit({
                        userId,
                        email,
                        role: role as any,
                        status: "FAILED",
                        reason,
                        ipAddress: resolveClientIp(req),
                        userAgent: resolveUserAgent(req),
                    });
                    
                    const attemptsLeft = 5 - (recentFailures + 1);
                    if (attemptsLeft <= 0) {
                        throw new Error("Account locked due to too many failed attempts. Try again in 15 mins.");
                    } else if (attemptsLeft === 1) {
                        throw new Error("Invalid credentials. This is your last attempt! If wrong, your account will be locked for 15 mins.");
                    } else {
                        throw new Error(`Invalid credentials. You have ${attemptsLeft} attempts left.`);
                    }
                };

                const envEmail = process.env.ADMIN_EMAIL;
                const envPassword = process.env.ADMIN_PASSWORD;

                // If env admin credentials are configured, enforce them strictly.
                // This guarantees that password changes in environment variables
                // immediately become the only valid admin login path.
                if (envEmail && envPassword) {
                    if (email.toLowerCase() !== envEmail.toLowerCase()) {
                        console.log("❌ Non-env admin email attempted:", email);
                        return await handleFailedLogin("Use configured admin email");
                    }

                    if (password !== envPassword) {
                        console.log("❌ Invalid ENV password for:", email);
                        return await handleFailedLogin("Invalid ENV password");
                    }

                    console.log("✅ Admin login via ENV credentials:", email);
                    await recordLoginAudit({
                        email,
                        role: "admin",
                        status: "SUCCESS",
                        reason: "ENV admin credentials",
                        ipAddress: resolveClientIp(req),
                        userAgent: resolveUserAgent(req),
                    });
                    return {
                        id: "env-admin",
                        name: "Admin",
                        email: envEmail,
                        role: "admin",
                    };
                }

                // DB-based auth (primary)
                try {
                    await connectToDatabase();
                    const user = await User.findOne({ email: email.toLowerCase() });

                    if (user) {
                        const isPasswordValid = await user.comparePassword(password);

                        if (!isPasswordValid) {
                            console.log("❌ Invalid password for DB user:", email);
                            return await handleFailedLogin("Invalid password", user._id.toString(), user.role);
                        }

                        console.log("✅ Credentials matched for:", email, "Role:", user.role);

                        await recordLoginAudit({
                            userId: user._id.toString(),
                            email,
                            role: user.role,
                            status: "SUCCESS",
                            reason: "Credentials authenticated",
                            ipAddress: resolveClientIp(req),
                            userAgent: resolveUserAgent(req),
                        });

                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    }

                    console.log("❌ User not found:", email);
                    return await handleFailedLogin("User not found");
                } catch (error) {
                    console.error("❌ Auth error:", error);
                    await recordLoginAudit({
                        email,
                        status: "FAILED",
                        reason: "Auth exception",
                        ipAddress: resolveClientIp(req),
                        userAgent: resolveUserAgent(req),
                    });
                    return null;
                }
            },
        }),
    ],
});
