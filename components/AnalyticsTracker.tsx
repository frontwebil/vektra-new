"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const send = () => {
      try {
        if (process.env.NODE_ENV === "development") {
          const key = `vektra-analytics-last:${pathname}`;
          const now = Date.now();
          const previous = Number(window.sessionStorage.getItem(key) ?? 0);
          if (now - previous < 2000) return;
          window.sessionStorage.setItem(key, String(now));
        }

        let referrerHost: string | null = null;
        if (document.referrer) {
          try {
            const referrer = new URL(document.referrer);
            if (referrer.origin !== window.location.origin) referrerHost = referrer.hostname;
          } catch {
            referrerHost = null;
          }
        }

        void fetch("/api/analytics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path: pathname, referrerHost }),
          keepalive: true,
        });
      } catch {
        // Analytics must never interfere with the public site.
      }
    };

    if (document.readyState === "complete") {
      send();
      return;
    }

    window.addEventListener("load", send, { once: true });
    return () => window.removeEventListener("load", send);
  }, [pathname]);

  return null;
}
