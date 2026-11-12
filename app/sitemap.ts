import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

// Проєкти й статті публікуються з адмінки, тож карта сайту збирається на кожен запит
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

const url = (path: string) => `${SITE_URL}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: string, priority: number, changeFrequency: Entry["changeFrequency"] = "monthly"): Entry => ({
    url: url(path),
    changeFrequency,
    priority,
  });

  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  return [
    page("/", 1, "weekly"),
    page("/services", 0.9),
    ...SERVICES.map((s) => page(`/services/${s.slug}`, 0.8)),
    page("/projects", 0.9, "weekly"),
    ...projects.map((p) => page(`/projects/${p.slug}`, 0.7)),
    page("/about", 0.6),
    page("/blog", 0.7, "weekly"),
    ...posts.map((p) => ({ ...page(`/blog/${p.slug}`, 0.6), lastModified: p.doc.date })),
    page("/contacts", 0.6),
  ];
}
