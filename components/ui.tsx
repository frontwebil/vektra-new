import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function Arrow() {
  return <i className="ar" aria-hidden="true" />;
}

export function Star({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`star ${className}`} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.9 7.6 3.4 10.9 12 12-8.6 1.1-11.1 4.4-12 12-.9-7.6-3.4-10.9-12-12C8.6 10.9 11.1 7.6 12 0z" />
    </svg>
  );
}

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M16 0a16 16 0 1 1 0 32 16 16 0 0 1 0-32zm0 4c.8 7.8 3.2 11.2 12 12-8.8.8-11.2 4.2-12 12-.8-7.8-3.2-11.2-12-12 8.8-.8 11.2-4.2 12-12z" />
    </svg>
  );
}

/** Рядок заголовка: виїжджає з-під маски. dim — другий тон заголовка. */
export function Ln({ children, dim, className = "" }: { children: ReactNode; dim?: boolean; className?: string }) {
  return (
    <span className={`ln ${dim ? "dim" : ""} ${className}`} style={{whiteSpace:'pre-line'}}>
      <span className="ln__i">{children}</span>
    </span>
  );
}

/** Слово по літерах: для великих назв, де посимвольна поява виправдана масштабом. */
export function Chars({ text }: { text: string }) {
  return (
    <span className="chars" aria-label={text}>
      {Array.from(text).map((c, i) => (
        <span className="ch" aria-hidden="true" key={i}>
          <span className="ch__i">{c === " " ? " " : c}</span>
        </span>
      ))}
    </span>
  );
}

/** Технічна мітка: символи перебираються при появі. */
export function Label({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p className={`label ${className}`} data-scramble>
      {children}
    </p>
  );
}

export function Tags({ items, dim }: { items: string[]; dim?: boolean }) {
  return (
    <ul className={`tagline ${dim ? "is-dim" : ""}`}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function Dots({ on, total = 4 }: { on: number; total?: number }) {
  return (
    <span className="dots" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i < on ? "on" : ""} />
      ))}
    </span>
  );
}

export function Stars5() {
  return (
    <span className="rev__stars" aria-label="5 із 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1l3.2 7.2 7.8.8-5.9 5.2 1.7 7.8L12 18l-6.8 4 1.7-7.8L1 9l7.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link className={`lnk ${className}`} href={href}>
      {children} <Arrow />
    </Link>
  );
}

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Хлібні крихти">
      {items.map((c, i) => (
        <span key={c.label}>
          {i > 0 && <em>/</em>}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <b>{c.label}</b>}
        </span>
      ))}
    </nav>
  );
}
