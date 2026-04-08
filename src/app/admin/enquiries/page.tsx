import { getEnquiries, deleteEnquiry } from "@/lib/actions/enquiry";
import EnquiryStatusUpdate from "@/components/admin/EnquiryStatusUpdate";

export default async function EnquiriesAdminPage() {
    const enquiries: any[] = await getEnquiries();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Enquiries Management</h1>
                <div className="text-sm text-text-secondary bg-white px-4 py-2 rounded-lg border border-border">
                    Total Enquiries: <span className="font-bold text-primary">{enquiries.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left">
                    <thead className="bg-background border-b border-border/60">
                        <tr>
                            <th className="p-4 font-bold text-text-secondary uppercase text-[11px] tracking-wider">Date</th>
                            <th className="p-4 font-bold text-text-secondary uppercase text-[11px] tracking-wider">Contact Details</th>
                            <th className="p-4 font-bold text-text-secondary uppercase text-[11px] tracking-wider">Message</th>
                            <th className="p-4 font-bold text-text-secondary uppercase text-[11px] tracking-wider">Actions / Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {enquiries.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-text-muted italic">
                                    No enquiries found yet.
                                </td>
                            </tr>
                        ) : (
                            enquiries.map((enquiry) => (
                                <tr key={enquiry._id} className="hover:bg-background/50 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-text-muted">
                                        {new Date(enquiry.createdAt).toLocaleDateString()}<br />
                                        <span className="text-[10px] opacity-70">{new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-text-primary">{enquiry.name}</div>
                                        <div className="text-xs text-text-secondary">{enquiry.email}</div>
                                        <div className="text-xs text-text-secondary">{enquiry.phone}</div>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <div className="line-clamp-3 text-text-secondary leading-relaxed">
                                            {enquiry.message}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="mb-3">
                                            <EnquiryStatusUpdate id={enquiry._id} currentStatus={enquiry.status} />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <form action={async () => {
                                                "use server";
                                                await deleteEnquiry(enquiry._id);
                                            }}>
                                                <button className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors">
                                                    Delete Entry
                                                </button>
                                            </form>
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
