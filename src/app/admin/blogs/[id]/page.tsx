import { getBlogById } from "@/lib/actions/blog";
import BlogForm from "@/components/admin/BlogForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const res = await getBlogById(resolvedParams.id);

    if (!res.success || !res.blog) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900">Blog not found</h2>
                <Link href="/admin/blogs" className="text-primary mt-4 inline-block hover:underline">
                    Return to blogs
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                href="/admin/blogs"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Blogs
            </Link>
            <BlogForm initialData={res.blog} />
        </div>
    );
}
