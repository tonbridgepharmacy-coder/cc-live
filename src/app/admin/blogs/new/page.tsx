import BlogForm from "@/components/admin/BlogForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewBlogPage() {
    return (
        <div className="space-y-6">
            <Link
                href="/admin/blogs"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Blogs
            </Link>
            <BlogForm />
        </div>
    );
}
