import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

// FORCING OVERRIDE for local development so you do not have to restart your terminal!
// NextAuth will crash/loop if AUTH_URL is set to production but running on localhost.
if (process.env.NODE_ENV !== "production") {
    delete process.env.AUTH_URL;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6),
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log("Invalid credential format");
                    return null;
                }

                const { email, password } = parsedCredentials.data;

                try {
                    await connectToDatabase();
                    const user = await User.findOne({ email: email.toLowerCase() });

                    if (!user) {
                        console.log("User not found:", email);
                        return null;
                    }

                    const isPasswordValid = await user.comparePassword(password);

                    if (!isPasswordValid) {
                        console.log("❌ Invalid password for:", email);
                        return null;
                    }

                    console.log("✅ Credentials matched for:", email, "Role:", user.role);

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("❌ Auth error:", error);
                    return null;
                }
            },
        }),
    ],
});
