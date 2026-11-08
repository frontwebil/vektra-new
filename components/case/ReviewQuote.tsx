"use client";

import { useState } from "react";
import { Arrow } from "@/components/ui";
import type { Rich } from "@/lib/cases";

type Part = { t: string; dim?: boolean };

const parts = (v: Rich): Part[] => (typeof v === "string" ? [{ t: v }] : v);
const length = (p: Part[]) => p.reduce((n, x) => n + x.t.length, 0);

/** Перші limit символів зі збереженням тонів; ріже по слову й додає «…». */
function cut(p: Part[], limit: number): Part[] {
  const out: Part[] = [];
  let left = limit;
  for (const x of p) {
    if (left <= 0) break;
    if (x.t.length <= left) {
      out.push(x);
      left -= x.t.length;
      continue;
    }
    const slice = x.t.slice(0, left);
    const space = slice.lastIndexOf(" ");
    out.push({ ...x, t: (space > left * 0.6 ? slice.slice(0, space) : slice).trimEnd() });
    break;
  }
  const last = out[out.length - 1];
  if (last) last.t = last.t.replace(/[\s,.;:—–-]+$/, "") + "…";
  return out;
}

function Text({ p }: { p: Part[] }) {
  return p.map((x, i) => (x.dim ? <span className="dim" key={i}>{x.t}</span> : <span key={i}>{x.t}</span>));
}

/**
 * Відгук на сторінці кейсу. Довший за limit символів показується скорочено
 * з кнопкою «Читати повний відгук». Обидві версії вже в розмітці: кнопка лише
 * перемикає hidden, тож анімація слів (data-words) не ламається.
 */
export function ReviewQuote({ quote, limit }: { quote: Rich; limit: number }) {
  const [open, setOpen] = useState(false);
  const all = parts(quote);
  if (length(all) <= limit) {
    return <p className="cs-q__t" data-words><Text p={all} /></p>;
  }
  return (
    <>
      <p className="cs-q__t" data-words hidden={open}><Text p={cut(all, limit)} /></p>
      <p className="cs-q__t" id="review-full" hidden={!open}><Text p={all} /></p>
      <button type="button" className="lnk cs-q__more" aria-expanded={open} aria-controls="review-full" onClick={() => setOpen((v) => !v)}>
        {open ? "Згорнути відгук" : "Читати повний відгук"} <Arrow />
      </button>
    </>
  );
}
