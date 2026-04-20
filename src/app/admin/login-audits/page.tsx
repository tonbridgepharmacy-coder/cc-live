import { getLoginAudits } from "@/lib/loginAudit";

export const dynamic = "force-dynamic";

type LoginAuditRecord = {
    _id: string;
    email: string;
    role?: "admin" | "user";
    status: "SUCCESS" | "FAILED";
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
};

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function truncate(value?: string, max = 80) {
    if (!value) return "-";
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
}

export default async function LoginAuditsPage() {
    const recordsRaw = await getLoginAudits({ limit: 200 });
    const records = JSON.parse(JSON.stringify(recordsRaw)) as LoginAuditRecord[];

    const total = records.length;
    const successCount = records.filter((item) => item.status === "SUCCESS").length;
    const failedCount = total - successCount;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Login Audits</h1>
                <p className="text-slate-500 font-medium">
                    Recent authentication attempts with status, source, and failure reasons.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Records</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{total}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Successful</p>
                    <p className="mt-2 text-3xl font-extrabold text-emerald-900">{successCount}</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Failed</p>
                    <p className="mt-2 text-3xl font-extrabold text-rose-900">{failedCount}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-sm text-center text-slate-500">
                                        No login audit records found.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => {
                                    const isSuccess = record.status === "SUCCESS";

                                    return (
                                        <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                {formatDate(record.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                {record.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 uppercase">
                                                {record.role || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={
                                                        isSuccess
                                                            ? "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800"
                                                            : "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800"
                                                    }
                                                >
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700" title={record.reason || ""}>
                                                {truncate(record.reason, 50)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                {record.ipAddress || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700" title={record.userAgent || ""}>
                                                {truncate(record.userAgent, 70)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
