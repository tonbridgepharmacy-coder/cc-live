import { getInventoryLogs } from "@/lib/actions/inventory";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InventoryLogsPage() {
    const logs = await getInventoryLogs(200);

    const actionColors: Record<string, string> = {
        RESERVE: "bg-blue-100 text-blue-700",
        CONSUME: "bg-green-100 text-green-700",
        RELEASE: "bg-orange-100 text-orange-700",
        EXPIRE: "bg-red-100 text-red-700",
        ADJUST: "bg-purple-100 text-purple-700",
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Inventory Audit Logs</h1>
                <Link
                    href="/admin/inventory"
                    className="text-sm font-medium text-primary hover:text-primary-dark border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all"
                >
                    ← Back to Inventory
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background border-b border-border/60">
                            <tr>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Time</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Action</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Vaccine</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Batch</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Qty</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Performed By</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-text-muted">
                                        No inventory logs yet. Logs will appear when bookings are made or stock is adjusted.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-background/50">
                                        <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                                            {format(new Date(log.createdAt), "d MMM yyyy HH:mm:ss")}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${actionColors[log.action] || "bg-gray-100 text-gray-700"}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-text-primary">
                                            {(log.vaccineId as any)?.title || "—"}
                                        </td>
                                        <td className="p-4 text-sm font-mono text-text-secondary">
                                            {(log.batchId as any)?.batchNumber || "—"}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-text-primary">{log.quantity}</td>
                                        <td className="p-4 text-xs text-text-muted">{log.performedBy}</td>
                                        <td className="p-4 text-xs text-text-secondary max-w-xs truncate">{log.notes || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
