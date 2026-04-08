// import { auth } from "@/auth";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function DashboardPage() {
    // const session = await auth();
    const session = { user: { name: "Admin (Bypassed)", email: "admin@local" } };

    return <DashboardClient user={session?.user} />;
}
