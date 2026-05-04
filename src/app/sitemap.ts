import { MetadataRoute } from "next";
import { getPublishedServices } from "@/lib/actions/service";
import { getPublishedVaccines } from "@/lib/actions/vaccine";
import { getPublishedBlogs } from "@/lib/actions/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://clarkeandcoleman.co.uk";

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/vaccines`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
        { url: `${baseUrl}/book`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
        { url: `${baseUrl}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
        { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ];

    // Dynamic service pages
    const servicesRes = await getPublishedServices().catch(() => ({ success: false, services: [] }));
    const serviceRoutes: MetadataRoute.Sitemap = servicesRes.success
        ? (servicesRes as any).services.map((s: any) => ({
              url: `${baseUrl}/services/${s.slug}`,
              lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.8,
          }))
        : [];

    // Dynamic vaccine pages
    const vaccinesRes = await getPublishedVaccines().catch(() => ({ success: false, vaccines: [] }));
    const vaccineRoutes: MetadataRoute.Sitemap = vaccinesRes.success
        ? (vaccinesRes as any).vaccines.map((v: any) => ({
              url: `${baseUrl}/vaccines/${v.slug}`,
              lastModified: v.updatedAt ? new Date(v.updatedAt) : new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.8,
          }))
        : [];

    // Dynamic blog pages
    const blogsRes = await getPublishedBlogs().catch(() => ({ success: false, blogs: [] }));
    const blogRoutes: MetadataRoute.Sitemap = blogsRes.success
        ? (blogsRes as any).blogs.map((b: any) => ({
              url: `${baseUrl}/blogs/${b.slug}`,
              lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
              changeFrequency: "monthly" as const,
              priority: 0.7,
          }))
        : [];

    return [...staticRoutes, ...serviceRoutes, ...vaccineRoutes, ...blogRoutes];
}
