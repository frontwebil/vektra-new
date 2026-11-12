import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Мінімальне форматування тексту статті з адмінки:
 *   **жирний**  і  [текст](https://посилання)
 * Решта тексту виводиться як є (React сам екранує HTML).
 */
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    if (m[1] !== undefined) {
      out.push(<strong key={i}>{m[1]}</strong>);
    } else {
      const href = m[3];
      const internal = href.startsWith("/") && !href.startsWith("//");
      const safe = internal || /^https?:\/\//i.test(href) || href.startsWith("mailto:");
      out.push(
        !safe ? m[2] : internal ? (
          <Link key={i} href={href}>{m[2]}</Link>
        ) : (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer">{m[2]}</a>
        ),
      );
    }
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** Текст із порожніми рядками → абзаци. */
export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}><Inline text={p} /></p>
        ))}
    </>
  );
}
