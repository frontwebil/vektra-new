"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { loadProjectRecords } from "@/lib/projects";
import { SLUG_PATTERN, newProjectDoc, type ProjectDoc } from "@/lib/project-docs";

const BASE = "/admin/projects";

async function guard() {
  if (!(await hasAdminSession())) redirect("/admin/login");
}

/** Проєкти видно на головній, /projects, сторінках кейсів і послуг — оновлюємо все. */
function refreshSite() {
  revalidatePath("/", "layout");
}

const isObj = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v);

/** Мінімальна перевірка структури, щоб зламаний JSON не поклав сторінку кейсу. */
function validDoc(v: unknown): v is ProjectDoc {
  if (!isObj(v) || !isObj(v.card) || !isObj(v.case)) return false;
  const { card, case: c } = v;
  const strings = ["name", "home", "image", "alt", "lead", "rest", "category", "services"];
  if (strings.some((k) => typeof card[k] !== "string") || !String(card.name).trim()) return false;
  if (!Array.isArray(card.tags) || !Array.isArray(card.cats)) return false;
  if (!Array.isArray(c.statement) || typeof c.description !== "string" || !isObj(c.meta)) return false;
  if (!isObj(c.hero) || !isObj(c.hero.media)) return false;
  if (!isObj(c.overview) || !Array.isArray(c.overview.headline) || !Array.isArray(c.overview.body)) return false;
  return true;
}

export async function saveProjectAction(formData: FormData) {
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
  if (slug !== original && (await prisma.projectEntry.findUnique({ where: { slug } }))) redirect(back("error=taken"));
  await prisma.projectEntry.update({ where: { slug: original }, data: { slug, published, content: doc as never } });
  refreshSite();
  redirect(`${BASE}?p=${encodeURIComponent(slug)}&saved=1`);
}

export async function createProjectAction(formData: FormData) {
  await guard();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!name) redirect(`${BASE}?error=name`);
  if (!SLUG_PATTERN.test(slug)) redirect(`${BASE}?error=slug`);
  await loadProjectRecords(); // перше заповнення, якщо таблиця ще порожня
  const prisma = getPrisma();
  if (await prisma.projectEntry.findUnique({ where: { slug } })) redirect(`${BASE}?error=taken`);
  const last = await prisma.projectEntry.aggregate({ _max: { position: true } });
  await prisma.projectEntry.create({
    data: { slug, position: (last._max.position ?? -1) + 1, published: false, content: newProjectDoc(name) as never },
  });
  refreshSite();
  redirect(`${BASE}?p=${encodeURIComponent(slug)}&created=1`);
}

export async function deleteProjectAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  await getPrisma().projectEntry.delete({ where: { slug } }).catch(() => null);
  refreshSite();
  redirect(`${BASE}?deleted=1`);
}

export async function moveProjectAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const prisma = getPrisma();
  const rows = await prisma.projectEntry.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { slug: true } });
  const order = rows.map((r) => r.slug);
  const i = order.indexOf(slug);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < order.length) {
    [order[i], order[j]] = [order[j], order[i]];
    await prisma.$transaction(order.map((s, position) => prisma.projectEntry.update({ where: { slug: s }, data: { position } })));
    refreshSite();
  }
  redirect(`${BASE}?p=${encodeURIComponent(String(formData.get("current") ?? slug))}`);
}

export async function togglePublishedAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  const row = await getPrisma().projectEntry.findUnique({ where: { slug }, select: { published: true } });
  if (row) {
    await getPrisma().projectEntry.update({ where: { slug }, data: { published: !row.published } });
    refreshSite();
  }
  redirect(`${BASE}?p=${encodeURIComponent(String(formData.get("current") ?? slug))}`);
}

export type UploadTicket =
  | { ok: true; cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string }
  | { ok: false; error: string };

/**
 * Підпис для прямого завантаження файлу з браузера на Cloudinary.
 * Секрет лишається на сервері; файл іде одразу в Cloudinary, минаючи сервер сайту.
 */
export async function signUploadAction(): Promise<UploadTicket> {
  if (!(await hasAdminSession())) return { ok: false, error: "Сесія завершилась. Увійдіть знову." };
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !secret) return { ok: false, error: "Cloudinary не налаштовано: перевірте змінні середовища." };
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "vektra/projects";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return { ok: true, cloudName, apiKey, timestamp, folder, signature };
}
