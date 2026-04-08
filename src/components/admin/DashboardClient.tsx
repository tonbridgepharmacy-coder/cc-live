"use client";

import MetricCard from "@/components/admin/MetricCard";
import ManagementCard from "@/components/admin/ManagementCard";
import DataTable from "@/components/admin/DataTable";
import {
    Users,
    Clock,
    CheckCircle2,
    CreditCard,
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Briefcase,
    FileText
} from "lucide-react";

export default function DashboardClient({ user }: { user?: any }) {
    const metrics = [
        { label: "Total Bookings", value: "1,284", icon: Clock, trend: { value: 12, isUp: true }, color: "blue" as const },
        { label: "Pending Reviews", value: "14", icon: Users, trend: { value: 3, isUp: false }, color: "amber" as const },
        { label: "Active Services", value: "12", icon: CheckCircle2, color: "emerald" as const },
        { label: "Total Revenue", value: "£12,450", icon: CreditCard, trend: { value: 8, isUp: true }, color: "blue" as const },
    ];

    const managementActions = [
        { title: "Dashboard Overview", description: "View recent activity and upcoming bookings.", href: "/admin/dashboard", icon: LayoutDashboard, color: "blue" as const },
        { title: "Appointments", description: "Manage patient visits and bookings.", href: "/admin/appointments", icon: Calendar, color: "emerald" as const },
        { title: "Enquiries", description: "Respond to patient enquiries and messages.", href: "/admin/enquiries", icon: MessageSquare, color: "amber" as const },
        { title: "Blogs", description: "Publish news, health articles and travel advice.", href: "/admin/blogs", icon: FileText, color: "slate" as const },
        { title: "Career", description: "Review job applications and manage career listings.", href: "/admin/career", icon: Briefcase, color: "blue" as const },
    ];

    const appointmentColumns = [
        {
            header: "Patient", accessor: "patient", render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {row.patient.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{row.patient}</span>
                </div>
            )
        },
        { header: "Service", accessor: "service" },
        {
            header: "Date & Time", accessor: "time", render: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-slate-900">{row.date}</span>
                    <span className="text-xs text-slate-500">{row.time}</span>
                </div>
            )
        },
        {
            header: "Status", accessor: "status", render: (row: any) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                    row.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const recentAppointments = [
        { patient: "John Doe", service: "Travel Vaccination", date: "24 Feb 2026", time: "10:30 AM", status: "Confirmed" },
        { patient: "Jane Smith", service: "Flu Jab", date: "24 Feb 2026", time: "11:15 AM", status: "Pending" },
        { patient: "Robert Brown", service: "Health Checkup", date: "25 Feb 2026", time: "09:00 AM", status: "Confirmed" },
        { patient: "Alice Wilson", service: "COVID Booster", date: "25 Feb 2026", time: "02:45 PM", status: "Confirmed" },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {user?.name || 'Admin'}
                </h1>
                <p className="text-slate-500 mt-1">Here's what's happening at Clarke & Coleman today.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, idx) => (
                    <MetricCard key={idx} {...metric} />
                ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-3 items-start">
                {/* Recent Appointments Table */}
                <div className="lg:col-span-2 space-y-4">
                    <DataTable
                        title="Recent Appointments"
                        description="Monitor and manage your upcoming patient visits."
                        columns={appointmentColumns}
                        data={recentAppointments}
                        searchPlaceholder="Search patients..."
                    />
                </div>

                {/* Quick Management Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                        <p className="text-sm text-slate-500 mt-1">Direct access to your management modules.</p>
                    </div>
                    <div className="grid gap-4">
                        {managementActions.map((action, idx) => (
                            <ManagementCard key={idx} {...action} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
