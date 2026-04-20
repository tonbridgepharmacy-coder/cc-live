"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/admin/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            // Check if our custom error was thrown inside authorize
            if (error.cause?.err?.message?.includes("Account locked")) {
                return error.cause.err.message;
            }
            // For custom thrown errors NextAuth might capture the original error message in `.type` or `.message` depending on beta versions,
            // so let's also check error.message
            if (error.message.includes("Account locked")) {
                 return "Account locked due to too many failed attempts. Try again in 15 mins.";
            }

            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}
