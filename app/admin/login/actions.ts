"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  getAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || !verifyAdminPassword(password) || !getAdminSessionToken()) {
    redirect(`/admin/login?error=${process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET ? "invalid" : "setup"}`);
  }

  const token = getAdminSessionToken();
  if (!token) redirect("/admin/login?error=setup");

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  redirect("/admin");
}
