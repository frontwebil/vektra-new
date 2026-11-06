import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getBrowser,
  getClientIp,
  getCountry,
  getDevice,
  makeVisitorKey,
  pruneOldVisits,
} from "@/lib/analytics";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2048) return new NextResponse(null, { status: 413 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || /bot|crawler|spider|preview/i.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { path, referrerHost: submittedReferrerHost } = payload as { path?: unknown; referrerHost?: unknown };

  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.length > 500 ||
    path.includes("?") ||
    path.includes("#") ||
    path.startsWith("/admin") ||
    path.startsWith("/api/")
  ) {
    return NextResponse.json({ error: "Invalid page path." }, { status: 400 });
  }

  const ipAddress = getClientIp(request) ?? null;
  const visitorSeed = ipAddress ?? randomUUID();
  let referrerHost: string | null = null;
  if (typeof submittedReferrerHost === "string" && submittedReferrerHost.length <= 255 && !/[\\/?#@]/.test(submittedReferrerHost)) {
    try {
      referrerHost = new URL(`https://${submittedReferrerHost}`).hostname.slice(0, 255) || null;
    } catch {
      referrerHost = null;
    }
  }

  try {
    await pruneOldVisits();
    await getPrisma().visit.create({
      data: {
        ipAddress,
        visitorKey: makeVisitorKey(visitorSeed, userAgent),
        country: getCountry(request),
        device: getDevice(userAgent),
        browser: getBrowser(userAgent),
        path,
        referrerHost,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Analytics event could not be saved.");
    return NextResponse.json({ error: "Analytics is not configured." }, { status: 503 });
  }
}
