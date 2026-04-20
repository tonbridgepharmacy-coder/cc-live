import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { recordLoginAudit } from "@/lib/loginAudit";

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

                // Fallback: Check against env credentials directly
                const envEmail = process.env.ADMIN_EMAIL;
                const envPassword = process.env.ADMIN_PASSWORD;

                if (
                    envEmail &&
                    envPassword &&
                    email.toLowerCase() === envEmail.toLowerCase() &&
                    password === envPassword
                ) {
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

                // DB-based auth
                try {
                    await connectToDatabase();
                    const user = await User.findOne({ email: email.toLowerCase() });

                    if (!user) {
                        console.log("❌ User not found:", email);
                        await recordLoginAudit({
                            email,
                            status: "FAILED",
                            reason: "User not found",
                            ipAddress: resolveClientIp(req),
                            userAgent: resolveUserAgent(req),
                        });
                        return null;
                    }

                    const isPasswordValid = await user.comparePassword(password);

                    if (!isPasswordValid) {
                        console.log("❌ Invalid password for:", email);
                        await recordLoginAudit({
                            userId: user._id.toString(),
                            email,
                            role: user.role,
                            status: "FAILED",
                            reason: "Invalid password",
                            ipAddress: resolveClientIp(req),
                            userAgent: resolveUserAgent(req),
                        });
                        return null;
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
