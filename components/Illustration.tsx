"use client";

import { useEffect, useRef, useState } from "react";
import { ILLUSTRATIONS, type IllustrationName } from "@/lib/illustrations";
import { ParticleField } from "@/lib/particles";

type Props = {
  name: IllustrationName;
  className?: string;
  fit?: "contain" | "cover";
  zoom?: number;
  density?: number;
  brightness?: number;
  interactive?: boolean;
};

export function Illustration({ name, className = "", fit = "contain", zoom = 1, density = 1, brightness = 1, interactive = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const field = useRef<ParticleField | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFallback(true);
      return;
    }
    // контекст створюємо лише коли блок наближається до екрана
    let f: ParticleField | null = null;
    const start = () => {
      try {
        f = new ParticleField(canvas, name, { fit, zoom, density, brightness, interactive, onFail: () => setFallback(true) });
        field.current = f;
      } catch {
        setFallback(true);
      }
    };
    const near = new IntersectionObserver((e) => {
      if (e[e.length - 1].isIntersecting) {
        near.disconnect();
        start();
      }
    }, { rootMargin: "60% 0px" });
    near.observe(canvas);
    return () => {
      near.disconnect();
      f?.destroy();
      field.current = null;
    };
    // форма змінюється окремо, щоб частинки перетікали, а не створювалися заново
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    field.current?.setIllustration(name);
  }, [name]);

  const def = ILLUSTRATIONS[name];
  return (
    <div className={`il ${className}`} aria-hidden="true">
      {fallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={def.src} alt="" style={{ objectFit: fit, transform: `scale(${zoom})` }} />
      ) : (
        <canvas ref={ref} />
      )}
    </div>
  );
}
