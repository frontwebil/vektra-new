/**
 * Документ проєкту — те, що зберігається в базі (таблиця ProjectEntry, поле content)
 * і редагується в адмінці /admin/projects.
 *
 *   card — картка проєкту: список /projects, головна, блок «Роботи» на послугах, Next project;
 *   case — уся сторінка кейсу /projects/[slug] (структура як у CASE_TEMPLATE з lib/cases.ts).
 *
 * Модуль без серверних залежностей: його використовують і сайт, і клієнтський редактор.
 */
import { CASES, CASE_TEMPLATE, brief, orderedProjects, type CaseStudy, type CaseView, type Media } from "./cases";
import type { Project } from "./content";

/** Секції, які можна вимкнути. Вимкнена секція зберігає вміст, але не показується на сайті. */
export const OPTIONAL_SECTIONS = ["challenge", "approach", "solution", "system", "experience", "technology", "result", "testimonial"] as const;
export type OptionalSection = (typeof OPTIONAL_SECTIONS)[number];

export type CaseDoc = Omit<CaseView, "slug" | "name" | "index" | "next"> & { hidden?: OptionalSection[] };
export type ProjectCard = Omit<Project, "slug">;
export type ProjectDoc = { card: ProjectCard; case: CaseDoc };
export type ProjectRecord = { slug: string; published: boolean; doc: ProjectDoc };

/** Ключі фільтра на /projects. */
export const PROJECT_CATEGORIES = [
  { key: "branding", label: "Branding" },
  { key: "uxui", label: "UX/UI" },
  { key: "development", label: "Development" },
  { key: "ecommerce", label: "E-commerce" },
] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function split<T extends { slug: string; name: string; index?: string; next?: string }>(view: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, name, index, next, ...rest } = view;
  return rest;
}

/** Документ із поточних статичних даних (PROJECTS + CASES). */
export function docFromStatic(p: Project): ProjectDoc {
  const view = CASES.find((c) => c.slug === p.slug) ?? brief(p);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, ...card } = p;
  return { card, case: split(view) };
}

/** Початкові записи для першого заповнення бази та запасний варіант без бази. */
export function staticRecords(): ProjectRecord[] {
  return orderedProjects().map((p) => ({ slug: p.slug, published: true, doc: docFromStatic(p) }));
}

export function projectFromDoc(slug: string, doc: ProjectDoc): Project {
  return { slug, ...doc.card };
}

/** Сторінка кейсу з документа: вимкнені секції прибираються. */
export function caseFromDoc(slug: string, doc: ProjectDoc): CaseView {
  const { hidden = [], ...rest } = doc.case;
  const view: CaseView = { slug, name: doc.card.name, ...rest };
  for (const k of hidden) delete view[k];
  return view;
}

/** Вміст секції з еталонного шаблону — підставляється, коли секцію вмикають уперше. */
export function templateSection<K extends OptionalSection>(k: K): NonNullable<CaseStudy[K]> {
  return structuredClone(CASE_TEMPLATE[k]) as NonNullable<CaseStudy[K]>;
}

/** Новий проєкт: усі секції з еталонного шаблону, заповнюються в адмінці. */
export function newProjectDoc(name: string): ProjectDoc {
  const t = structuredClone(CASE_TEMPLATE);
  const placeholder: Media = { type: "placeholder", label: "Project cover / image · video", ratio: "16/10" };
  return {
    card: {
      name,
      home: name,
      image: "",
      alt: name,
      lead: "[Короткий опис проєкту,",
      rest: "друга частина опису сірим.]",
      tags: [],
      category: "[Category]",
      services: "[Services]",
      year: null,
      cats: [],
    },
    case: { ...split(t), hero: { media: placeholder } },
  };
}
