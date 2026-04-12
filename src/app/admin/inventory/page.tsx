import { getBatches, getLowStockAlerts, getExpiringBatches, createBatch } from "@/lib/actions/inventory";
import { getVaccines } from "@/lib/actions/vaccine";
import { format } from "date-fns";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/db";
import Batch from "@/models/Batch";

export const dynamic = "force-dynamic";

// Server action: Create new batch
async function handleCreateBatch(formData: FormData) {
    "use server";
    const data = {
        batchNumber: formData.get("batchNumber") as string,
        vaccineId: formData.get("vaccineId") as string,
        quantityTotal: parseInt(formData.get("quantityTotal") as string),
        expiryDate: new Date(formData.get("expiryDate") as string),
        supplier: formData.get("supplier") as string,
        purchaseDate: new Date(formData.get("purchaseDate") as string),
        costPerUnit: parseFloat(formData.get("costPerUnit") as string) || 0,
    };

    await createBatch(data);
    revalidatePath("/admin/inventory");
}

// Server action: Update batch status
async function handleUpdateBatchStatus(formData: FormData) {
    "use server";
    const batchId = formData.get("batchId") as string;
    const status = formData.get("status") as string;

    await connectToDatabase();
    await Batch.findByIdAndUpdate(batchId, { status });
    revalidatePath("/admin/inventory");
}

export default async function InventoryPage() {
    const [batches, lowStock, expiringBatches, vaccinesRes] = await Promise.all([
        getBatches(),
        getLowStockAlerts(),
        getExpiringBatches(30),
        getVaccines(),
    ]);

    const vaccines = vaccinesRes.success ? vaccinesRes.vaccines || [] : [];

    return (
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Inventory Management</h1>
                <Link
                    href="/admin/inventory/logs"
                    className="text-sm font-medium text-primary hover:text-primary-dark border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all"
                >
                    View Audit Logs →
                </Link>
            </div>

            {/* ─── Alerts ─── */}
            {(lowStock.length > 0 || expiringBatches.length > 0) && (
                <div className="grid sm:grid-cols-2 gap-4">
                    {lowStock.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                🚨 Low Stock Alert
                            </h3>
                            <ul className="space-y-1">
                                {lowStock.map((alert: any) => (
                                    <li key={alert.vaccineId} className="text-sm text-red-600 flex justify-between">
                                        <span>{alert.vaccineName}</span>
                                        <span className={`font-bold ${alert.severity === "critical" ? "text-red-800" : "text-orange-600"}`}>
                                            {alert.currentStock} units left
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {expiringBatches.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                ⚠️ Expiring Soon ({expiringBatches.length} batches)
                            </h3>
                            <ul className="space-y-1">
                                {expiringBatches.slice(0, 5).map((batch: any) => (
                                    <li key={batch._id} className="text-sm text-amber-600 flex justify-between">
                                        <span>{batch.batchNumber} — {(batch.vaccineId as any)?.title}</span>
                                        <span className="font-medium">{format(new Date(batch.expiryDate), "d MMM yyyy")}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Add New Batch Form ─── */}
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4">Add New Batch</h2>
                <form action={handleCreateBatch} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Batch Number</label>
                        <input name="batchNumber" type="text" required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="e.g. BCH-2026-001"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Vaccine</label>
                        <select name="vaccineId" required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="">Select vaccine...</option>
                            {vaccines.map((v: any) => (
                                <option key={v._id} value={v._id}>{v.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Quantity</label>
                        <input name="quantityTotal" type="number" min="1" required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Expiry Date</label>
                        <input name="expiryDate" type="date" required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Supplier</label>
                        <input name="supplier" type="text" required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Purchase Date</label>
                        <input name="purchaseDate" type="date" required
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1">Cost Per Unit (£)</label>
                        <input name="costPerUnit" type="number" step="0.01" min="0"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div className="flex items-end">
                        <button type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                        >
                            + Add Batch
                        </button>
                    </div>
                </form>
            </div>

            {/* ─── Batches Table ─── */}
            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border/60 bg-background">
                    <h2 className="font-bold text-text-primary">All Batches ({batches.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background/50 border-b border-border/60">
                            <tr>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Batch</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Vaccine</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Available</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Reserved</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Total</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Expiry</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Supplier</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {batches.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-text-muted">No batches found. Add your first batch above.</td>
                                </tr>
                            ) : (
                                batches.map((batch: any) => {
                                    const isExpired = new Date(batch.expiryDate) < new Date();
                                    const isExpiringSoon = new Date(batch.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                                    return (
                                        <tr key={batch._id} className="hover:bg-background/50">
                                            <td className="p-4 text-sm font-mono font-medium text-text-primary">{batch.batchNumber}</td>
                                            <td className="p-4 text-sm text-text-secondary">{(batch.vaccineId as any)?.title || "—"}</td>
                                            <td className="p-4 text-sm">
                                                <span className={`font-bold ${batch.quantityAvailable === 0 ? "text-red-500" : batch.quantityAvailable <= 5 ? "text-orange-500" : "text-green-600"}`}>
                                                    {batch.quantityAvailable}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-amber-600 font-medium">{batch.quantityReserved}</td>
                                            <td className="p-4 text-sm text-text-muted">{batch.quantityTotal}</td>
                                            <td className={`p-4 text-sm font-medium ${isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-500" : "text-text-secondary"}`}>
                                                {format(new Date(batch.expiryDate), "d MMM yyyy")}
                                                {isExpired && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">EXPIRED</span>}
                                            </td>
                                            <td className="p-4 text-sm text-text-secondary">{batch.supplier}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize
                                                    ${batch.status === "active" ? "bg-green-100 text-green-700" :
                                                    batch.status === "depleted" ? "bg-gray-100 text-gray-600" :
                                                    batch.status === "expired" ? "bg-red-100 text-red-600" :
                                                    "bg-purple-100 text-purple-600"}`}
                                                >
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {batch.status === "active" && isExpired && (
                                                    <form action={handleUpdateBatchStatus}>
                                                        <input type="hidden" name="batchId" value={batch._id} />
                                                        <input type="hidden" name="status" value="expired" />
                                                        <button className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                                                            Mark Expired
                                                        </button>
                                                    </form>
                                                )}
                                                {batch.status === "active" && !isExpired && (
                                                    <form action={handleUpdateBatchStatus}>
                                                        <input type="hidden" name="batchId" value={batch._id} />
                                                        <input type="hidden" name="status" value="recalled" />
                                                        <button className="text-purple-500 hover:text-purple-700 text-xs font-medium border border-purple-200 px-2 py-1 rounded hover:bg-purple-50">
                                                            Recall
                                                        </button>
                                                    </form>
                                                )}
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
