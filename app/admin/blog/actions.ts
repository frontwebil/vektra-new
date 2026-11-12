"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { loadBlogRecords } from "@/lib/blog";
import { SLUG_PATTERN, isCategory, newBlogDoc, type BlogDoc } from "@/lib/blog-docs";

const BASE = "/admin/blog";

async function guard() {
  if (!(await hasAdminSession())) redirect("/admin/login");
}

/** Статті видно в каталозі, на своїх сторінках, у «Схожих» і в sitemap — оновлюємо все. */
function refreshSite() {
  revalidatePath("/", "layout");
}

const isObj = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v);

/** Мінімальна перевірка структури, щоб зламаний JSON не поклав сторінку статті. */
function validDoc(v: unknown): v is BlogDoc {
  if (!isObj(v)) return false;
  if (typeof v.title !== "string" || !v.title.trim()) return false;
  if (["excerpt", "lead", "date"].some((k) => typeof v[k] !== "string")) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v.date))) return false;
  if (!isCategory(String(v.category))) return false;
  if (!Array.isArray(v.headline) || !Array.isArray(v.blocks)) return false;
  if (!v.blocks.every((b) => isObj(b) && typeof b.type === "string")) return false;
  if (!isObj(v.cover) || !isObj(v.note) || !isObj(v.cta)) return false;
  return true;
}

export async function savePostAction(formData: FormData) {
  await guard();
  const original = String(formData.get("originalSlug") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const published = formData.get("published") === "on";
  const back = (q: string) => `${BASE}?p=${encodeURIComponent(original)}&${q}`;

  if (!SLUG_PATTERN.test(slug)) redirect(back("error=slug"));
  let doc: unknown;
  try {
    doc = JSON.parse(String(formData.get("content") ?? ""));
  } catch {
    redirect(back("error=json"));
  }
  if (!validDoc(doc)) redirect(back("error=shape"));

  const prisma = getPrisma();
  // Головна стаття в каталозі лише одна: позначка знімається з інших
  if (doc.featured) {
    const others = await prisma.blogPost.findMany({ where: { slug: { not: original } } });
    for (const r of others) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { featured, ...rest } = r.content as unknown as BlogDoc;
      if (featured) await prisma.blogPost.update({ where: { slug: r.slug }, data: { content: rest as never } });
    }
  }
  if (slug !== original && (await prisma.blogPost.findUnique({ where: { slug } }))) redirect(back("error=taken"));
  await prisma.blogPost.update({ where: { slug: original }, data: { slug, published, content: doc as never } });
  refreshSite();
  redirect(`${BASE}?p=${encodeURIComponent(slug)}&saved=1`);
}

export async function createPostAction(formData: FormData) {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!title) redirect(`${BASE}?error=title`);
  if (!SLUG_PATTERN.test(slug)) redirect(`${BASE}?error=slug`);
  await loadBlogRecords(); // перше заповнення, якщо таблиця ще порожня
  const prisma = getPrisma();
  if (await prisma.blogPost.findUnique({ where: { slug } })) redirect(`${BASE}?error=taken`);
  await prisma.blogPost.create({ data: { slug, published: false, content: newBlogDoc(title) as never } });
  redirect(`${BASE}?p=${encodeURIComponent(slug)}&created=1`);
}

export async function deletePostAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  await getPrisma().blogPost.delete({ where: { slug } }).catch(() => null);
  refreshSite();
  redirect(`${BASE}?deleted=1`);
}

export async function togglePostAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  const row = await getPrisma().blogPost.findUnique({ where: { slug }, select: { published: true } });
  if (row) {
    await getPrisma().blogPost.update({ where: { slug }, data: { published: !row.published } });
    refreshSite();
  }
  redirect(`${BASE}?p=${encodeURIComponent(String(formData.get("current") ?? slug))}`);
}
