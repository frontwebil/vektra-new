/**
 * Статті блогу з бази (таблиця BlogPost). Редагуються в /admin/blog.
 *
 * Якщо таблиця порожня, її заповнюють початкові дані з lib/blog-docs.ts.
 * Якщо база недоступна, сайт показує ті самі статичні дані, тож сторінки не падають.
 */
import { cache } from "react";
import { getPrisma } from "./prisma";
import { staticBlogRecords, type BlogDoc, type BlogRecord } from "./blog-docs";

function safeMessage(error: unknown) {
  return error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[database URL]") : "Unknown database error";
}

/** Новіші вище; за однакової дати — за назвою, щоб порядок був стабільним. */
const byDate = (a: BlogRecord, b: BlogRecord) => b.doc.date.localeCompare(a.doc.date) || a.doc.title.localeCompare(b.doc.title);

/** Усі статті (і чернетки), новіші вище. fromDb = false — показано запасні статичні дані. */
export const loadBlogRecords = cache(async (): Promise<{ rows: BlogRecord[]; fromDb: boolean }> => {
  try {
    const prisma = getPrisma();
    if ((await prisma.blogPost.count()) === 0) {
      await prisma.blogPost.createMany({
        data: staticBlogRecords().map((r) => ({ slug: r.slug, published: r.published, content: r.doc as never })),
        skipDuplicates: true,
      });
    }
    const rows = await prisma.blogPost.findMany();
    return {
      rows: rows.map((r) => ({ slug: r.slug, published: r.published, doc: r.content as unknown as BlogDoc })).sort(byDate),
      fromDb: true,
    };
  } catch (error) {
    console.error("Blog could not load from database:", safeMessage(error));
    return { rows: staticBlogRecords().sort(byDate), fromDb: false };
  }
});

/** Опубліковані статті, новіші вище. */
export async function getPosts(): Promise<BlogRecord[]> {
  return (await loadBlogRecords()).rows.filter((r) => r.published);
}

export async function getPost(slug: string): Promise<BlogRecord | null> {
  return (await getPosts()).find((r) => r.slug === slug) ?? null;
}

/** Схожі статті: спершу з тієї ж категорії, потім найсвіжіші. */
export async function relatedPosts(slug: string, limit = 3): Promise<BlogRecord[]> {
  const all = await getPosts();
  const self = all.find((r) => r.slug === slug);
  const others = all.filter((r) => r.slug !== slug);
  const same = others.filter((r) => r.doc.category === self?.doc.category);
  return [...same, ...others.filter((r) => !same.includes(r))].slice(0, limit);
}
