import type { Metadata } from "next";

/**
 * Публічна адреса сайту для canonical, sitemap.xml, robots.txt і Open Graph.
 * Задайте NEXT_PUBLIC_SITE_URL (наприклад, https://vektra.agency) у змінних середовища.
 * На Vercel без цієї змінної береться основний production-домен проєкту.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Vektra";
export const HOME_TITLE = "Vektra - digital-агенція повного циклу";
export const SITE_DESCRIPTION =
  "Поєднуємо стратегію, брендинг, UX/UI дизайн, веброзробку та автоматизацію, щоб перетворювати бізнес-задачі на цифрові продукти.";

/** Шляхи, які пошуковики не мають сканувати чи індексувати. */
export const PRIVATE_PATHS = ["/admin", "/api"];

export const DEFAULT_OG_IMAGE = { url: "/illustrations/hero.png", width: 2200, height: 1560, alt: "Vektra" };

type PageMetaInput = {
  title: string;
  description: string;
  /** Шлях сторінки від кореня, наприклад "/services/branding". */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

/**
 * Метадані сторінки: canonical, Open Graph і Twitter.
 * Next.js не зливає openGraph батьківського layout з дочірнім, тому кожна сторінка отримує повний набір.
 */
export function pageMeta({ title, description, path, image, imageAlt, type = "website" }: PageMetaInput): Metadata {
  const fullTitle = path === "/" ? title : `${title} - ${SITE_NAME}`;
  const images = image ? [{ url: image, alt: imageAlt ?? title }] : [DEFAULT_OG_IMAGE];
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "uk_UA",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}
