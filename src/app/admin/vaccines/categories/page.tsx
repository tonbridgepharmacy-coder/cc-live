import CategoriesClient from "./CategoriesClient";
import { getVaccineCategories } from "@/lib/actions/vaccineCategory";

export const dynamic = 'force-dynamic';

export default async function AdminVaccineCategoriesPage() {
    const res = await getVaccineCategories();
    // Default to empty array if categories fetch fails
    const initialData = res.success ? res.categories : [];

    return <CategoriesClient initialData={initialData} />;
}
