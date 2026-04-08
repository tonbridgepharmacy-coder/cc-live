import { getBookings, updateBookingStatus } from "@/lib/actions/booking";
import { format } from "date-fns";

export default async function AppointmentsPage() {
    const bookings: any[] = await getBookings();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
                <div className="text-sm text-text-secondary">
                    Total: {bookings.length}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-background border-b border-border/60">
                        <tr>
                            <th className="p-4 text-xs font-bold text-text-secondary uppercase">Date & Time</th>
                            <th className="p-4 text-xs font-bold text-text-secondary uppercase">Customer</th>
                            <th className="p-4 text-xs font-bold text-text-secondary uppercase">Service</th>
                            <th className="p-4 text-xs font-bold text-text-secondary uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-text-secondary uppercase">Payment</th>
                            <th className="p-4 text-xs font-bold text-text-secondary uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-text-muted">No appointments found.</td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-background/50">
                                    <td className="p-4 text-sm text-text-primary">
                                        <div className="font-semibold">{format(new Date(booking.bookingDate), "MMM d, yyyy")}</div>
                                        <div className="text-text-muted">{format(new Date(booking.bookingDate), "h:mm a")}</div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="font-medium text-text-primary">{booking.customerName}</div>
                                        <div className="text-xs text-text-secondary">{booking.customerEmail}</div>
                                        <div className="text-xs text-text-secondary">{booking.customerPhone}</div>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">
                                        {booking.serviceName}
                                        <div className="text-xs text-text-muted">£{booking.servicePrice}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize
                            ${booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border border-green-200' :
                                                booking.paymentStatus === 'refunded' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-orange-50 text-orange-600'
                                            }`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {booking.status !== 'cancelled' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateBookingStatus(booking._id, "cancelled");
                                                }}>
                                                    <button className="text-red-500 hover:text-red-700 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                                                </form>
                                            )}
                                            {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateBookingStatus(booking._id, "confirmed");
                                                }}>
                                                    <button className="text-green-500 hover:text-green-700 text-xs font-medium border border-green-200 px-2 py-1 rounded hover:bg-green-50">Confirm</button>
                                                </form>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateBookingStatus(booking._id, "completed");
                                                }}>
                                                    <button className="text-blue-500 hover:text-blue-700 text-xs font-medium border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">Complete</button>
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
    );
}
