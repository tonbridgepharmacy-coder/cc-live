import { getJobById } from "@/lib/actions/job";
import JobForm from "@/components/admin/JobForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const res = await getJobById(resolvedParams.id);

    if (!res.success || !res.job) {
        notFound();
    }

    return <JobForm initialData={res.job} />;
}
