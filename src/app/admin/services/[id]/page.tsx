import { getServiceById } from "@/lib/actions/service";
import ServiceForm from "@/components/admin/ServiceForm";

export const dynamic = 'force-dynamic';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const res = await getServiceById(resolvedParams.id);

    if (!res.success || !res.service) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl font-bold max-w-2xl mx-auto mt-20 text-center border border-red-200">
                Service not found or an error occurred.
            </div>
        );
    }

    return <ServiceForm initialData={res.service} />;
}
