import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

const RETENTION_DAYS = 30;
let lastPruneAt = 0;

export function getClientIp(request: NextRequest) {
  const candidates = [
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ];

  return candidates.find((value): value is string => Boolean(value && isIP(value)));
}

export function getCountry(request: NextRequest) {
  const candidate = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  if (!candidate || candidate === "XX") return null;
  return /^[a-z]{2}$/i.test(candidate) ? candidate.toUpperCase() : null;
}

export function getDevice(userAgent: string) {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "Планшет";
  if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) return "Планшет";
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "Телефон";
  return "Комп'ютер";
}

export function getBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/chrome\//i.test(userAgent) && !/chromium/i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  return "Інший";
}

export function makeVisitorKey(ip: string, userAgent: string) {
  const secret = process.env.ANALYTICS_HASH_SECRET;
  if (!secret) throw new Error("ANALYTICS_HASH_SECRET is not configured.");
  return createHmac("sha256", secret).update(`${ip}\0${userAgent}`).digest("hex");
}

export async function pruneOldVisits() {
  const now = Date.now();
  if (now - lastPruneAt < 60 * 60 * 1000) return;

  const cutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await getPrisma().visit.deleteMany({ where: { visitedAt: { lt: cutoff } } });
  lastPruneAt = now;
}

export const visitRetentionDays = RETENTION_DAYS;
