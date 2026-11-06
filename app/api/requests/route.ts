import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/analytics";

export const runtime = "nodejs";

const maxBodyBytes = 16_384;
const rateLimitWindow = 15 * 60 * 1000;
const rateLimitMax = 5;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

type RequestPayload = { name: string; contact: string; services: string[]; budget?: string; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function allowRequest(ip: string) {
  const now = Date.now();
  if (requestsByIp.size > 5000) {
    for (const [key, entry] of requestsByIp) if (entry.resetAt <= now) requestsByIp.delete(key);
  }
  const current = requestsByIp.get(ip);
  if (!current || current.resetAt <= now) {
    requestsByIp.set(ip, { count: 1, resetAt: now + rateLimitWindow });
    return true;
  }
  if (current.count >= rateLimitMax) return false;
  current.count += 1;
  return true;
}

function parsePayload(value: unknown): RequestPayload | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const contact = typeof value.contact === "string" ? value.contact.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const services = Array.isArray(value.services) ? value.services : [];
  const budget = typeof value.budget === "string" ? value.budget.trim() : "";

  if (!name || name.length > 120 || !contact || contact.length > 300 || !message || message.length > 2500) return null;
  if (value.services !== undefined && !Array.isArray(value.services)) return null;
  if (services.length > 10 || services.some((item) => typeof item !== "string" || !item.trim() || item.length > 60)) return null;
  if (budget.length > 120) return null;
  return { name, contact, message, services, ...(budget ? { budget } : {}) };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request) ?? "unknown";
  if (!allowRequest(ip)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxBodyBytes) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const payload = parsePayload(parsed);
  if (!payload) return NextResponse.json({ error: "Invalid request data." }, { status: 400 });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Telegram request delivery is not configured.");
    return NextResponse.json({ error: "Request delivery is not configured." }, { status: 503 });
  }

  const lines = [
    "Нова заявка з сайту Vektra",
    "",
    `Ім’я: ${payload.name}`,
    `Контакт: ${payload.contact}`,
    `Послуги: ${payload.services.length ? payload.services.join(", ") : "Не вказано"}`,
    ...(payload.budget ? [`Бюджет: ${payload.budget}`] : []),
    "",
    "Повідомлення:",
    payload.message,
  ];

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    const result: unknown = await telegramResponse.json();
    if (!telegramResponse.ok || !isRecord(result) || result.ok !== true) {
      console.error("Telegram rejected a request notification.");
      return NextResponse.json({ error: "Could not deliver request." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    console.error("Telegram request delivery failed.");
    return NextResponse.json({ error: "Could not deliver request." }, { status: 502 });
  }
}
