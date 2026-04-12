import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import TopNavbar from "@/components/admin/TopNavbar";

async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/auth/login" });
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    console.log("🛠️ AdminLayout Session:", JSON.stringify(session, null, 2));

    // If no session or not admin, redirect to login
    if (!session) {
        redirect("/auth/login?error=NoSessionFound");
    }
    if (!session.user) {
        redirect("/auth/login?error=NoUserInSession");
    }
    const role = (session.user as any).role;
    if (role !== "admin") {
        redirect(`/auth/login?error=NotAdmin_RoleIs_${role}`);
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar - Desktop & Tablet */}
            <Sidebar signOutAction={signOutAction} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
                {/* Top Navbar */}
                <TopNavbar user={session?.user} />

                {/* Content */}
                <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>

                {/* Footer - Subtle */}
                <footer className="px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Clarke & Coleman Pharmacy Enterprise Dashboard
                </footer>
            </div>
        </div>
    );
}
