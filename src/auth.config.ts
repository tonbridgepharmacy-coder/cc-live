import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdminRoute = nextUrl.pathname.startsWith("/admin");

            if (isAdminRoute) {
                if (!isLoggedIn) {
                    console.log("🔒 Access Denied: User not logged in, redirecting to /auth/login");
                    return false; // Redirect to login
                }
                // Check role from the token
                const role = (auth as any)?.user?.role;
                if (role !== "admin") {
                    console.log("🔒 Access Denied: User role is", role, "(Needs 'admin'), redirecting to /");
                    // Non-admin user trying to access admin
                    return Response.redirect(new URL("/", nextUrl));
                }
                console.log("✅ Access Granted: Admin is logged in.");
                return true;
            }

            return true; // Allow all other routes
        },
        jwt({ token, user }) {
            // On sign-in, persist user data into the JWT token
            if (user) {
                token.id = user.id as string;
                token.role = (user as any).role || "user";
            }
            return token;
        },
        session({ session, token }) {
            // Map token data to session
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    providers: [], // Providers configured in auth.ts
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
