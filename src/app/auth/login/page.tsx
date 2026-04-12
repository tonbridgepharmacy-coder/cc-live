import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Login",
    description: "Secure login for Clarke & Coleman Pharmacy administration.",
};

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="bg-primary/5 p-8 text-center border-b border-border/40">
                    <h1 className="text-2xl font-bold text-text-primary">Admin Access</h1>
                    <p className="text-sm text-text-secondary mt-2">
                        Clarke & Coleman Pharmacy
                    </p>
                </div>
                <div className="p-8">
                    <LoginForm />
                </div>
                <div className="bg-background px-8 py-4 text-center border-t border-border/40">
                    <p className="text-xs text-text-muted">
                        Authorized personnel only. If you are not an administrator, please return to the main site.
                    </p>
                    <div className="mt-4 p-2 bg-red-50 text-red-600 text-[10px] break-all font-mono rounded">
                        DEBUG: AUTH_URL is currently '{process.env.AUTH_URL}' | ERR: {searchParams.error || 'None'}
                    </div>
                </div>
            </div>
        </div>
    );
}
