"use server";

import { updateEnquiryStatus } from "@/lib/actions/enquiry";
import { IEnquiry } from "@/models/Enquiry";

export default async function EnquiryStatusUpdate({ id, currentStatus }: { id: string, currentStatus: IEnquiry["status"] }) {
    const statuses: IEnquiry["status"][] = ["pending", "contacted", "hold", "hot", "warm", "cold"];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "hot": return "bg-red-100 text-red-700 border-red-200";
            case "warm": return "bg-orange-100 text-orange-700 border-orange-200";
            case "cold": return "bg-blue-100 text-blue-700 border-blue-200";
            case "contacted": return "bg-green-100 text-green-700 border-green-200";
            case "hold": return "bg-gray-100 text-gray-700 border-gray-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    return (
        <form className="flex gap-1.5 flex-wrap">
            {statuses.map((status) => (
                <button
                    key={status}
                    formAction={async () => {
                        "use server";
                        await updateEnquiryStatus(id, status);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${currentStatus === status
                            ? getStatusColor(status)
                            : "bg-white text-text-muted border-border hover:border-text-muted"
                        }`}
                >
                    {status}
                </button>
            ))}
        </form>
    );
}
