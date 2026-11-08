/**
 * Проєкти з бази (таблиця ProjectEntry). Редагуються в /admin/projects.
 *
 * Якщо таблиця порожня, її заповнюють поточні статичні дані (PROJECTS + CASES).
 * Якщо база недоступна, сайт показує ті самі статичні дані, тож сторінки не падають.
 */
import { cache } from "react";
import { getPrisma } from "./prisma";
import { CASE_TEMPLATE, type CaseView } from "./cases";
import type { Project } from "./content";
import { caseFromDoc, projectFromDoc, staticRecords, type ProjectDoc, type ProjectRecord } from "./project-docs";

const isDev = process.env.NODE_ENV !== "production";

function safeMessage(error: unknown) {
  return error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[database URL]") : "Unknown database error";
}

/** Усі записи (і чернетки) у порядку position. fromDb = false — показано запасні статичні дані. */
export const loadProjectRecords = cache(async (): Promise<{ rows: ProjectRecord[]; fromDb: boolean }> => {
  try {
    const prisma = getPrisma();
    if ((await prisma.projectEntry.count()) === 0) {
      await prisma.projectEntry.createMany({
        data: staticRecords().map((r, i) => ({ slug: r.slug, position: i, published: r.published, content: r.doc as never })),
        skipDuplicates: true,
      });
    }
    const rows = await prisma.projectEntry.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
    return {
      rows: rows.map((r) => ({ slug: r.slug, published: r.published, doc: r.content as unknown as ProjectDoc })),
      fromDb: true,
    };
  } catch (error) {
    console.error("Projects could not load from database:", safeMessage(error));
    return { rows: staticRecords(), fromDb: false };
  }
});

const published = async () => (await loadProjectRecords()).rows.filter((r) => r.published);

/** Опубліковані проєкти в порядку з адмінки. */
export async function getProjects(): Promise<Project[]> {
  return (await published()).map((r) => projectFromDoc(r.slug, r.doc));
}

export async function projectSlugs(): Promise<string[]> {
  return [...(await published()).map((r) => r.slug), ...(isDev ? [CASE_TEMPLATE.slug] : [])];
}

/** Дані сторінки кейсу: сам кейс, номер [ PROJECT / 01 ] і наступний проєкт. */
export async function getCasePage(slug: string): Promise<{ c: CaseView; index: string; next: Project | null } | null> {
  const list = await published();
  const projects = list.map((r) => projectFromDoc(r.slug, r.doc));
  if (slug === CASE_TEMPLATE.slug) {
    return isDev ? { c: CASE_TEMPLATE, index: CASE_TEMPLATE.index ?? "00", next: projects[0] ?? null } : null;
  }
  const i = list.findIndex((r) => r.slug === slug);
  if (i < 0) return null;
  const next = list.length > 1 ? projects[(i + 1) % list.length] : null;
  return { c: caseFromDoc(slug, list[i].doc), index: String(i + 1).padStart(2, "0"), next };
}
