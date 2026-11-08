import Image from "next/image";
import type { CSSProperties } from "react";
import { Illustration } from "@/components/Illustration";
import type { Media } from "@/lib/cases";
import { CaseVideo } from "./CaseVideo";

type Props = { m: Media; className?: string; priority?: boolean; sizes?: string };

/** Для відео з Cloudinary постер береться з першого кадру, якщо свій не задано. */
function posterOf(src: Extract<Media, { type: "video" }>["src"], poster?: string) {
  if (poster) return poster;
  const url = typeof src === "string" ? src : src[0]?.src;
  if (!url || !/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url)) return undefined;
  return url.replace("/video/upload/", "/video/upload/so_0/").replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
}

/** Відео з Cloudinary завжди віддаємо як mp4: Cloudinary перекодує .mov / .avi, які браузер не відтворить. */
function playable(src: Extract<Media, { type: "video" }>["src"]) {
  if (typeof src !== "string" || !/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(src)) return src;
  return src.replace(/\.(mov|avi|mkv|m4v|wmv|flv|3gp)(\?.*)?$/i, ".mp4");
}

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
          <CaseVideo src={playable(m.src)} poster={posterOf(m.src, m.poster)} label={m.alt} />
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
