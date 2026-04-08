import { getVaccineById } from "@/lib/actions/vaccine";
import VaccineForm from "@/components/admin/VaccineForm";

export const dynamic = 'force-dynamic';

export default async function EditVaccinePage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const res = await getVaccineById(resolvedParams.id);

    if (!res.success || !res.vaccine) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl font-bold max-w-2xl mx-auto mt-20 text-center border border-red-200">
                Vaccine not found or an error occurred.
            </div>
        );
    }

    return <VaccineForm initialData={res.vaccine} />;
}
