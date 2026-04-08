import { getGalleryImages } from "@/lib/actions/gallery";
import GalleryClient from "./GalleryClient";

export const dynamic = 'force-dynamic';

export default async function GalleryAdminPage() {
    const res = await getGalleryImages();
    const images = res.success ? res.images : [];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gallery Management</h1>
                <p className="text-slate-500 mt-1">
                    Manage the "Inside Clarke & Coleman" images displayed on the homepage.
                </p>
            </div>

            <GalleryClient initialImages={images} />
        </div>
    );
}
