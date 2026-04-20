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
    Boxes,
    AlertTriangle,
    ShieldAlert,
    TimerReset
} from "lucide-react";

type DashboardMetrics = {
    totalAppointments: number;
    totalEnquiries: number;
    visitors: number;
    activeServices: number;
    pendingReview: number;
    totalVaccinesAvailable: number;
    totalServices: number;
    lowStockAlerts: number;
    expiringSoonAlerts: number;
    pendingJobApps: number;
    failedSecLogins: number;
};

type RecentAppointment = {
    patient: string;
    service: string;
    date: string;
    time: string;
    status: "Confirmed" | "Pending" | "Cancelled";
};

type RecentEnquiry = {
    name: string;
    subject: string;
    date: string;
};

export default function DashboardClient({
    user,
    metrics,
    recentAppointments,
    todaysAppointments,
    recentEnquiries,
}: {
    user?: { name?: string | null };
    metrics: DashboardMetrics;
    recentAppointments: RecentAppointment[];
    todaysAppointments: RecentAppointment[];
    recentEnquiries: RecentEnquiry[];
}) {
    const formatMetricValue = (value: number) => value.toLocaleString("en-GB");

    const metricCards = [
        {
            label: "Low Stock Alerts",
            value: formatMetricValue(metrics.lowStockAlerts),
            icon: AlertTriangle,
            color: metrics.lowStockAlerts > 0 ? "rose" as const : "emerald" as const,
        },
        {
            label: "Expiring Batches",
            value: formatMetricValue(metrics.expiringSoonAlerts),
            icon: TimerReset,
            color: metrics.expiringSoonAlerts > 0 ? "amber" as const : "slate" as const,
        },
        {
            label: "Pending Job Apps",
            value: formatMetricValue(metrics.pendingJobApps),
            icon: Briefcase,
            color: "blue" as const,
        },
        {
            label: "Failed Logins (Today)",
            value: formatMetricValue(metrics.failedSecLogins),
            icon: ShieldAlert,
            color: metrics.failedSecLogins > 0 ? "rose" as const : "slate" as const,
        },
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
            label: "Pending Review",
            value: formatMetricValue(metrics.pendingReview),
            icon: Users,
            color: "amber" as const,
        },
    ];

    const managementActions = [
        { title: "Dashboard Overview", description: "View recent activity and upcoming bookings.", href: "/admin/dashboard", icon: LayoutDashboard, color: "blue" as const },
        { title: "Appointments", description: "Manage patient visits and bookings.", href: "/admin/appointments", icon: Calendar, color: "emerald" as const },
        { title: "Inventory", description: "Manage vaccines and stock alerts.", href: "/admin/inventory", icon: Boxes, color: "rose" as const },
        { title: "Enquiries", description: "Respond to patient enquiries and messages.", href: "/admin/enquiries", icon: MessageSquare, color: "amber" as const },
        { title: "Career", description: "Review job applications and manage career listings.", href: "/admin/careers", icon: Briefcase, color: "blue" as const },
    ];

    const appointmentColumns = [
        {
            header: "Patient", accessor: "patient", render: (row: RecentAppointment) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {row.patient.charAt(0).toUpperCase()}
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
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome back, {user?.name || 'Admin'}
                </h1>
                <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening at Clarke &amp; Coleman today.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metricCards.map((metric, idx) => (
                    <MetricCard key={idx} {...metric} />
                ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-3 items-start">
                
                {/* Main Tables Content */}
                <div className="lg:col-span-2 space-y-10">
                    <DataTable
                        title="Today's Schedule"
                        description="Patients visiting the clinic today."
                        columns={appointmentColumns}
                        data={todaysAppointments}
                        searchPlaceholder="Search today's patients..."
                    />

                    <DataTable
                        title="Recent Appointments"
                        description="Monitor newly created bookings across the platform."
                        columns={appointmentColumns}
                        data={recentAppointments}
                        searchPlaceholder="Search all patients..."
                    />
                </div>

                {/* Quick Management Section */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                        <p className="text-sm text-slate-500 mt-1 mb-6">Direct access to your management modules.</p>
                        <div className="grid gap-4">
                            {managementActions.map((action, idx) => (
                                <ManagementCard key={idx} {...action} />
                            ))}
                        </div>
                    </div>

                    {/* Recent Enquiries Widget */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Recent Enquiries</h2>
                            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">New</span>
                        </div>
                        
                        {recentEnquiries.length > 0 ? (
                            <div className="space-y-4">
                                {recentEnquiries.map((enq, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-slate-900 text-sm">{enq.name}</span>
                                            <span className="text-xs text-slate-500">{enq.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 truncate">{enq.subject}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 text-center py-4">No unread enquiries.</div>
                        )}
                        <a href="/admin/enquiries" className="block text-center text-sm text-blue-600 font-semibold mt-4 hover:underline">View All Enquiries</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
