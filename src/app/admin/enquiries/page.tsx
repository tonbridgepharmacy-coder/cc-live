import { getEnquiries, deleteEnquiry, updateEnquiryStatus } from "@/lib/actions/enquiry";
import EnquiriesClient from "./EnquiriesClient";

export const dynamic = "force-dynamic";

export default async function EnquiriesAdminPage() {
    const enquiries: unknown[] = await getEnquiries();

    async function handleStatusUpdate(id: string, status: "pending" | "contacted" | "hold") {
        "use server";
        await updateEnquiryStatus(id, status);
    }

    async function handleDelete(id: string) {
        "use server";
        await deleteEnquiry(id);
    }

    const serializedEnquiries = JSON.parse(JSON.stringify(enquiries));

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Enquiries</h1>
                <p className="text-slate-500 font-medium">Manage and respond to customer enquiries.</p>
            </div>

            <EnquiriesClient
                enquiries={serializedEnquiries}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
            />
        </div>
    );
}
