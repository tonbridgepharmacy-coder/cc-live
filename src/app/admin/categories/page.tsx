import { getCategories } from "@/lib/actions/category";
import CategoriesClient from "./CategoriesClient";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const res = await getCategories();
    const categories = res.success ? res.categories : [];

    return <CategoriesClient categories={categories} />;
}
