import connectToDatabase from "@/lib/db";
import Appointment from "@/models/Appointment";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function updateAppointmentStatus(formData: FormData) {
    "use server";
    const appointmentId = formData.get("appointmentId") as string;
    const status = formData.get("status") as string;

    await connectToDatabase();
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return;

    // Handle inventory on status changes
    if (status === "CANCELLED" && appointment.batchId) {
        const { releaseStock } = await import("@/lib/actions/inventory");
        await releaseStock(
            appointment.vaccineId.toString(),
            appointment.batchId.toString(),
            appointmentId
        );
    }

    if (status === "COMPLETED" && appointment.batchId) {
        const { consumeStock } = await import("@/lib/actions/inventory");
        await consumeStock(
            appointment.vaccineId.toString(),
            appointment.batchId.toString(),
            appointmentId
        );
    }

    appointment.status = status as any;
    await appointment.save();

    revalidatePath("/admin/appointments");
}

export default async function AppointmentsPage() {
    await connectToDatabase();

    // Get NEW Appointment model data
    const appointments = await Appointment.find({})
        .populate("vaccineId", "title price")
        .sort({ slotDate: -1 })
        .lean();

    // Also get legacy bookings (from old Booking model) for backward compatibility
    let legacyBookings: any[] = [];
    try {
        const { default: Booking } = await import("@/models/Booking");
        legacyBookings = await Booking.find({}).sort({ bookingDate: -1 }).lean();
    } catch (e) {}

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-green-100 text-green-700",
        COMPLETED: "bg-blue-100 text-blue-700",
        CANCELLED: "bg-red-100 text-red-700",
        NO_SHOW: "bg-gray-100 text-gray-700",
        // Legacy statuses
        pending: "bg-yellow-100 text-yellow-700",
        confirmed: "bg-green-100 text-green-700",
        completed: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700",
    };

    const paymentColors: Record<string, string> = {
        PAID: "bg-green-50 text-green-600 border border-green-200",
        UNPAID: "bg-orange-50 text-orange-600 border border-orange-200",
        REFUNDED: "bg-purple-50 text-purple-600 border border-purple-200",
        FAILED: "bg-red-50 text-red-600 border border-red-200",
        paid: "bg-green-50 text-green-600 border border-green-200",
        unpaid: "bg-orange-50 text-orange-600 border border-orange-200",
        refunded: "bg-purple-50 text-purple-600 border border-purple-200",
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
                <div className="text-sm text-text-secondary">
                    Total: {appointments.length + legacyBookings.length}
                </div>
            </div>

            {/* New Appointments (from Appointment model) */}
            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-3 bg-background border-b border-border/60">
                    <h2 className="font-semibold text-sm text-text-primary">Vaccine Appointments ({appointments.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background border-b border-border/60">
                            <tr>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Date & Time</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Customer</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Vaccine</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Amount</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Payment</th>
                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-text-muted">No vaccine appointments yet.</td>
                                </tr>
                            ) : (
                                (appointments as any[]).map((apt) => (
                                    <tr key={apt._id} className="hover:bg-background/50">
                                        <td className="p-4 text-sm text-text-primary">
                                            <div className="font-semibold">{format(new Date(apt.slotDate), "MMM d, yyyy")}</div>
                                            <div className="text-text-muted">{apt.slotTime}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-medium text-text-primary">{apt.customerName}</div>
                                            <div className="text-xs text-text-secondary">{apt.customerEmail}</div>
                                            <div className="text-xs text-text-secondary">{apt.customerPhone}</div>
                                        </td>
                                        <td className="p-4 text-sm text-text-secondary">
                                            {(apt.vaccineId as any)?.title || "—"}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-text-primary">
                                            £{apt.amountPaid}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[apt.status] || "bg-gray-100 text-gray-700"}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentColors[apt.paymentStatus] || "bg-gray-50 text-gray-600"}`}>
                                                {apt.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2 flex-wrap">
                                                {apt.status === "CONFIRMED" && (
                                                    <>
                                                        <form action={updateAppointmentStatus}>
                                                            <input type="hidden" name="appointmentId" value={apt._id} />
                                                            <input type="hidden" name="status" value="COMPLETED" />
                                                            <button className="text-blue-500 hover:text-blue-700 text-xs font-medium border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">Complete</button>
                                                        </form>
                                                        <form action={updateAppointmentStatus}>
                                                            <input type="hidden" name="appointmentId" value={apt._id} />
                                                            <input type="hidden" name="status" value="NO_SHOW" />
                                                            <button className="text-gray-500 hover:text-gray-700 text-xs font-medium border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">No Show</button>
                                                        </form>
                                                        <form action={updateAppointmentStatus}>
                                                            <input type="hidden" name="appointmentId" value={apt._id} />
                                                            <input type="hidden" name="status" value="CANCELLED" />
                                                            <button className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                                                        </form>
                                                    </>
                                                )}
                                                {apt.status === "PENDING" && (
                                                    <form action={updateAppointmentStatus}>
                                                        <input type="hidden" name="appointmentId" value={apt._id} />
                                                        <input type="hidden" name="status" value="CANCELLED" />
                                                        <button className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legacy Bookings (from old Booking model) */}
            {legacyBookings.length > 0 && (
                <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 bg-background border-b border-border/60">
                        <h2 className="font-semibold text-sm text-text-secondary">Legacy Bookings ({legacyBookings.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-background border-b border-border/60">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Date & Time</th>
                                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Customer</th>
                                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Service</th>
                                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {legacyBookings.map((booking: any) => (
                                    <tr key={booking._id} className="hover:bg-background/50">
                                        <td className="p-4 text-sm text-text-primary">
                                            <div className="font-semibold">{format(new Date(booking.bookingDate), "MMM d, yyyy")}</div>
                                            <div className="text-text-muted">{format(new Date(booking.bookingDate), "h:mm a")}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-medium text-text-primary">{booking.customerName}</div>
                                            <div className="text-xs text-text-secondary">{booking.customerEmail}</div>
                                        </td>
                                        <td className="p-4 text-sm text-text-secondary">
                                            {booking.serviceName}
                                            <div className="text-xs text-text-muted">£{booking.servicePrice}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${paymentColors[booking.paymentStatus] || "bg-gray-50 text-gray-600"}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
