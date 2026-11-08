"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string | { src: string; type: string }[]; poster?: string; label?: string };

/**
 * Відео кейсу: без звуку, по колу, без системних контролів.
 * Файл не завантажується, доки слот не наблизився до екрана, і стає на паузу поза ним,
 * тож кілька відео на сторінці не тягнуться й не грають одночасно.
 * При reduced motion лишається постер і з'являються контроли.
 */
export function CaseVideo({ src, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "15% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const sources = typeof src === "string" ? [{ src, type: /\.webm(\?|$)/i.test(src) ? "video/webm" : "video/mp4" }] : src;
  return (
    <video ref={ref} className="cs-m__v" poster={poster} muted loop playsInline preload="none" controls={still} aria-label={label} tabIndex={still ? 0 : -1}>
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
