import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "vektra_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function equalSecret(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminPassword(value: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password && equalSecret(value, password));
}

export function getAdminSessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return null;
  return createHmac("sha256", secret).update(`vektra-admin:${password}`).digest("hex");
}

export async function hasAdminSession() {
  const expected = getAdminSessionToken();
  if (!expected) return false;

  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!actual) return false;

  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/admin",
    maxAge: SESSION_MAX_AGE,
  };
}
