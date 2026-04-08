import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { auth, signIn, signOut, handlers } = NextAuth({
    // secret is automatically inferred and also set in authConfig
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    // Mock Admin check - In a real app, query the database
                    if (email === "admin@clarkecoleman.co.uk" && password === "admin123") {
                        return {
                            id: "admin-1",
                            name: "Admin User",
                            email: "admin@clarkecoleman.co.uk",
                            // role: "admin", // Extend session type if needed
                        };
                    }
                }
                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
});

