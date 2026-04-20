"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/lib/actions"; // We need to create this action

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all flex justify-center items-center"
            aria-disabled={pending}
        >
            {pending ? "Signing in..." : "Sign in"}
        </button>
    );
}

export default function LoginForm() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="space-y-6">
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-text-primary mb-2"
                >
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@clarkecoleman.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-text-primary mb-2"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            {errorMessage && (
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <p className="text-sm text-red-500">{errorMessage}</p>
                </div>
            )}

            <LoginButton />
        </form>
    );
}
