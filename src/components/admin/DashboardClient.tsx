"use client";

import MetricCard from "@/components/admin/MetricCard";
import ManagementCard from "@/components/admin/ManagementCard";
import DataTable from "@/components/admin/DataTable";
import {
    Users,
    Clock,
    CheckCircle2,
    Eye,
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Briefcase,
    FileText,
    Syringe,
    Boxes
} from "lucide-react";

type DashboardMetrics = {
    totalAppointments: number;
    totalEnquiries: number;
    visitors: number;
    activeServices: number;
    pendingReview: number;
    totalVaccinesAvailable: number;
    totalServices: number;
};

type RecentAppointment = {
    patient: string;
    service: string;
    date: string;
    time: string;
    status: "Confirmed" | "Pending" | "Cancelled";
};

export default function DashboardClient({
    user,
    metrics,
    recentAppointments,
}: {
    user?: { name?: string | null };
    metrics: DashboardMetrics;
    recentAppointments: RecentAppointment[];
}) {
    const formatMetricValue = (value: number) => value.toLocaleString("en-GB");

    const metricCards = [
        {
            label: "No. of Appointments",
            value: formatMetricValue(metrics.totalAppointments),
            icon: Clock,
            color: "blue" as const,
        },
        {
            label: "Enquiries",
            value: formatMetricValue(metrics.totalEnquiries),
            icon: MessageSquare,
            color: "amber" as const,
        },
        {
            label: "Visitors",
            value: formatMetricValue(metrics.visitors),
            icon: Eye,
            color: "blue" as const,
        },
        {
            label: "Active Services",
            value: formatMetricValue(metrics.activeServices),
            icon: CheckCircle2,
            color: "emerald" as const,
        },
        {
            label: "Pending Review",
            value: formatMetricValue(metrics.pendingReview),
            icon: Users,
            color: "amber" as const,
        },
        {
            label: "Total Vaccines Available",
            value: formatMetricValue(metrics.totalVaccinesAvailable),
            icon: Syringe,
            color: "emerald" as const,
        },
        {
            label: "Total Services",
            value: formatMetricValue(metrics.totalServices),
            icon: Boxes,
            color: "rose" as const,
        },
    ];

    const managementActions = [
        { title: "Dashboard Overview", description: "View recent activity and upcoming bookings.", href: "/admin/dashboard", icon: LayoutDashboard, color: "blue" as const },
        { title: "Appointments", description: "Manage patient visits and bookings.", href: "/admin/appointments", icon: Calendar, color: "emerald" as const },
        { title: "Enquiries", description: "Respond to patient enquiries and messages.", href: "/admin/enquiries", icon: MessageSquare, color: "amber" as const },
        { title: "Blogs", description: "Publish news, health articles and travel advice.", href: "/admin/blogs", icon: FileText, color: "slate" as const },
        { title: "Career", description: "Review job applications and manage career listings.", href: "/admin/careers", icon: Briefcase, color: "blue" as const },
    ];

    const appointmentColumns = [
        {
            header: "Patient", accessor: "patient", render: (row: RecentAppointment) => (
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
            header: "Date & Time", accessor: "time", render: (row: RecentAppointment) => (
                <div className="flex flex-col">
                    <span className="text-slate-900">{row.date}</span>
                    <span className="text-xs text-slate-500">{row.time}</span>
                </div>
            )
        },
        {
            header: "Status", accessor: "status", render: (row: RecentAppointment) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                    row.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {user?.name || 'Admin'}
                </h1>
                <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening at Clarke &amp; Coleman today.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metricCards.map((metric, idx) => (
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
