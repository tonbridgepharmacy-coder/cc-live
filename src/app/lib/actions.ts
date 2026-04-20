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
            if (error.cause?.err?.message) {
                const msg = error.cause.err.message;
                if (msg.includes("Account locked") || msg.includes("last attempt") || msg.includes("attempts left")) {
                    return msg;
                }
            }
            
            // For custom thrown errors NextAuth might capture the original error message directly
            if (error.message.includes("Account locked") || error.message.includes("last attempt") || error.message.includes("attempts left")) {
                 return error.message.replace("CredentialsSignin: ", "");
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
