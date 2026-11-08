import Image from "next/image";
import type { CSSProperties } from "react";
import { Illustration } from "@/components/Illustration";
import type { Media } from "@/lib/cases";
import { CaseVideo } from "./CaseVideo";

type Props = { m: Media; className?: string; priority?: boolean; sizes?: string };

/**
 * Один слот під будь-яке медіа кейсу. Пропорції задає ratio або контейнер (змінна --r),
 * тож місце резервується до завантаження. Шторка появи та повільний зум — спільні для сайту (data-media).
 */
export function CaseMedia({ m, className = "", priority, sizes = "(max-width: 767px) 100vw, 70vw" }: Props) {
  const style = m.ratio ? ({ "--r": m.ratio } as CSSProperties) : undefined;
  const cap = m.caption ? <span className="cs-m__cap small">{m.caption}</span> : null;

  switch (m.type) {
    case "image":
      return (
        <div className={`media cs-m ${className}`} style={style} data-media>
          <Image
            src={m.src}
            alt={m.alt}
            fill
            sizes={sizes}
            quality={85}
            priority={priority}
            unoptimized={m.src.endsWith(".gif")}
            style={m.position ? { objectPosition: m.position } : undefined}
          />
          {cap}
        </div>
      );
    case "video":
      return (
        <div className={`media cs-m ${className}`} style={style} data-media>
          <CaseVideo src={m.src} poster={m.poster} label={m.alt} />
          {cap}
        </div>
      );
    case "illustration":
      return (
        <div className={`cs-m cs-m--il ${className}`} style={style}>
          <Illustration name={m.name} className="fx" zoom={m.zoom} density={m.density} />
          {cap}
        </div>
      );
    case "device":
      return (
        <div className={`cs-dev ${className}`} style={style}>
          <CaseMedia m={m.desktop} className="cs-dev__d" sizes={sizes} priority={priority} />
          <div className="cs-dev__m" data-drift="-4">
            <CaseMedia m={m.mobile} sizes="(max-width: 767px) 40vw, 20vw" />
          </div>
        </div>
      );
    case "placeholder":
      return (
        <div className={`cs-m cs-m--ph ${className}`} style={style} data-r>
          <span className="idx">[ {m.label} ]</span>
          {m.ratio && <span className="idx">{m.ratio.replace("/", " : ")}</span>}
        </div>
      );
  }
}
