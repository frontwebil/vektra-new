"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CONTACT, NAV, SERVICES } from "@/lib/content";
import { RequestButton } from "./RequestButton";

function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-t={children}>
      <span>{children}</span>
    </span>
  );
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    if (panel.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(panel.current.querySelectorAll("[data-m]"), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.035, delay: 0.12 });
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`hd ${open ? "is-open" : ""}`} data-intro="header">
      <div className="hd__box" ref={box}>
        <div className="hd__bar">
          <Link className="hd__logo" href="/" aria-label="Vektra, на головну">
            Vektra
          </Link>
          <nav className="hd__nav" aria-label="Основна навігація">
            {NAV.map((n) => {
              const on = path === n.href || path.startsWith(n.href + "/");
              return (
                <Link key={n.href} href={n.href} className={on ? "is-on" : ""} aria-current={on ? "page" : undefined}>
                  <Roll>{n.label}</Roll>
                  {n.count ? <sup>{n.count}</sup> : null}
                </Link>
              );
            })}
          </nav>
          <button className="hd__burger" type="button" aria-label={open ? "Закрити меню" : "Відкрити меню"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
          </button>
        </div>
        <div className="hd__panel" ref={panel} aria-hidden={!open} inert={!open}>
          <div className="hd__panel-in">
            <nav className="hd__mnav" aria-label="Меню">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} data-m>
                  {n.label}
                  {n.count ? <sup>{n.count}</sup> : null}
                </Link>
              ))}
            </nav>
            <div className="hd__services">
              {SERVICES.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} data-m>
                  {s.name}
                </Link>
              ))}
            </div>
            <div className="hd__meta">
              <div data-m>
                <p>[ Ми на зв’язку ]</p>
                <ul>
                  <li><a href={CONTACT.telegram.href}>{CONTACT.telegram.label}</a></li>
                  <li><a href={CONTACT.whatsapp.href}>{CONTACT.whatsapp.label}</a></li>
                  <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                </ul>
              </div>
              <div data-m>
                <p>[ Соц.мережі ]</p>
                <ul>
                  {CONTACT.socials.map((s) => (
                    <li key={s.label}><a href={s.href}>{s.label}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="hd__cta" data-m onClick={() => setOpen(false)}>
              <RequestButton variant="white">Обговорити проєкт</RequestButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
