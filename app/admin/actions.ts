"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { SERVICES } from "@/lib/content";
import { defaultServicePage } from "@/lib/service-pages";
import { ADMIN_SESSION_COOKIE, hasAdminSession } from "@/lib/admin-auth";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function saveServicePageAction(formData: FormData) {
  if (!(await hasAdminSession())) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "");
  const rawContent = String(formData.get("content") ?? "");
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) redirect("/admin/services?error=service");

  let content: unknown;
  try {
    content = JSON.parse(rawContent);
  } catch {
    redirect(`/admin/services?service=${slug}&error=json`);
  }

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    redirect(`/admin/services?service=${slug}&error=shape`);
  }
  const value = content as Record<string, unknown>;
  const required = Object.keys(defaultServicePage(service));
  if (required.some((key) => !(key in value))) {
    redirect(`/admin/services?service=${slug}&error=fields`);
  }
  const sectionKeys = new Set(["why", "when", "included", "process", "work", "pricing", "faq", "cta"]);
  if (!Array.isArray(value.sectionOrder) || value.sectionOrder.some((key) => typeof key !== "string" || !sectionKeys.has(key))) {
    redirect(`/admin/services?service=${slug}&error=sections`);
  }

  await getPrisma().servicePageContent.upsert({
    where: { slug },
    create: { slug, content: value as never },
    update: { content: value as never },
  });
  revalidatePath(`/services/${slug}`);
  revalidatePath("/admin/services");
  redirect(`/admin/services?service=${slug}&saved=1`);
}
