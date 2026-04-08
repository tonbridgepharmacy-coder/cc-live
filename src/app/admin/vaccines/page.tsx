import VaccinesClient from "./VaccinesClient";
import { getVaccines } from "@/lib/actions/vaccine";

export const dynamic = 'force-dynamic';

export default async function AdminVaccinesPage() {
    const res = await getVaccines();
    const initialData = res.success ? res.vaccines : [];

    return <VaccinesClient initialData={initialData} />;
}
