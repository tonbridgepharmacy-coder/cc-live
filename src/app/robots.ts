import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/api/"],
        },
        sitemap: "https://clarkeandcoleman.co.uk/sitemap.xml", // Replace with actual domain in prod
    };
}
