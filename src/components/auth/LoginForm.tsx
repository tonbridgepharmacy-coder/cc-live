"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/app/lib/actions";

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
    
    // Manage state for login credentials
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // On mount, load stored credentials if they exist
    useEffect(() => {
        const storedEmail = localStorage.getItem("ccAdminEmail");
        const storedPass = localStorage.getItem("ccAdminPass");
        if (storedEmail && storedPass) {
            try {
                setEmail(atob(storedEmail));
                setPassword(atob(storedPass));
                setRememberMe(true);
            } catch (e) {
                console.error("Failed to parse stored credentials");
            }
        }
    }, []);

    const handleFormSubmit = () => {
        if (rememberMe) {
            localStorage.setItem("ccAdminEmail", btoa(email));
            localStorage.setItem("ccAdminPass", btoa(password));
        } else {
            localStorage.removeItem("ccAdminEmail");
            localStorage.removeItem("ccAdminPass");
        }
    };

    return (
        <form action={dispatch} onSubmit={handleFormSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tonbridgepharmacy@gmail.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            <div className="flex items-center">
                <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary select-none cursor-pointer">
                    Keep me logged in (Save ID & Password)
                </label>
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
