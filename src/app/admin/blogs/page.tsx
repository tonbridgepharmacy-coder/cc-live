import { getBlogs } from "@/lib/actions/blog";
import BlogsClient from "./BlogsClient";

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
    const res = await getBlogs();
    const blogs = res.success ? res.blogs : [];

    return <BlogsClient blogs={blogs} />;
}
