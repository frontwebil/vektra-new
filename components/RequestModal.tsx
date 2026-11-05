"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { CONTACT, REQUEST_TYPES } from "@/lib/content";
import { OPEN_REQUEST, sendRequest } from "@/lib/request";
import { setScrollLocked } from "@/lib/smooth";
import { Arrow, Ln } from "./ui";

type Errors = Partial<Record<"name" | "contact" | "message", string>>;

export function RequestModal() {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "busy" | "sent" | "mail" | "error">("idle");
  const root = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLFormElement>(null);
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    const el = root.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce) {
      setOpen(false);
      return;
    }
    gsap.to(win.current, { y: 24, opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(el, { opacity: 0, duration: 0.35, delay: 0.1, onComplete: () => setOpen(false) });
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const svc = (e as CustomEvent<{ service?: string }>).detail?.service;
      opener.current = document.activeElement;
      setTypes(svc ? [svc] : []);
      setErrors({});
      setState("idle");
      setOpen(true);
    };
    window.addEventListener(OPEN_REQUEST, onOpen);
    return () => window.removeEventListener(OPEN_REQUEST, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const el = root.current!;
    const form = win.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" });
      gsap.fromTo(form, { y: 56, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.05 });
      gsap.fromTo(form.querySelectorAll(".ln__i"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.15 });
      gsap.fromTo(form.querySelectorAll("[data-m]"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.06, delay: 0.25 });
    }
    // Фокус ставимо після першого кадру анімації
    const focusTimer = window.setTimeout(() => form.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }), 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const items = Array.from(form.querySelectorAll<HTMLElement>("button,input,textarea,a[href]")).filter((n) => !n.hasAttribute("disabled"));
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      setScrollLocked(false);
      (opener.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open, close]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const contact = String(f.get("contact") || "").trim();
    const message = String(f.get("message") || "").trim();
    const next: Errors = {};
    if (!name) next.name = "Вкажіть, як до вас звертатися";
    if (!contact) next.contact = "Потрібен контакт для відповіді";
    if (!message) next.message = "Опишіть задачу кількома реченнями";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState("busy");
    try {
      setState(await sendRequest({ name, contact, services: types, message }));
    } catch {
      setState("error");
    }
  };

  if (!open) return null;

  const toggle = (t: string) => setTypes((v) => (v.includes(t) ? v.filter((x) => x !== t) : [...v, t]));

  return (
    <div className="rq" ref={root} role="dialog" aria-modal="true" aria-labelledby="rq-title" onMouseDown={(e) => e.target === e.currentTarget && close()} data-lenis-prevent>
      <form className="rq__win" ref={win} onSubmit={submit} noValidate>
        <div className="rq__top">
          <h2 className="rq__h" id="rq-title">
            <Ln>Ваша задача — наш</Ln>
            <Ln>
              наступний <span className="dim">вектор</span>
            </Ln>
          </h2>
          <button type="button" className="rq__x" aria-label="Закрити" onClick={close}>
            <span />
            <span />
          </button>
        </div>

        {state === "sent" || state === "mail" ? (
          <div className="rq__done" role="status">
            <p className="h36">{state === "sent" ? "Запит надіслано." : "Лист майже готовий."}</p>
            <p className="dim">
              {state === "sent"
                ? "Ми переглянемо запит і зв’яжемося з вами, щоб уточнити задачу та наступні кроки."
                : `Ми відкрили поштову програму із заповненим листом: залишилося натиснути «Надіслати». Якщо вона не відкрилася, напишіть на ${CONTACT.email}.`}
            </p>
            <button type="button" className="btn btn--w" onClick={close}>Закрити</button>
          </div>
        ) : (
          <>
            <div className="rq__two" data-m>
              <label className={`fld ${errors.name ? "is-err" : ""}`}>
                <span className="fld__k">Ваше ім’я</span>
                <input name="name" type="text" autoComplete="name" />
                <span className="fld__e">{errors.name}</span>
              </label>
              <label className={`fld ${errors.contact ? "is-err" : ""}`}>
                <span className="fld__k">Email або Telegram</span>
                <input name="contact" type="text" autoComplete="email" />
                <span className="fld__e">{errors.contact}</span>
              </label>
            </div>
            <div className="rq__types" data-m>
              <div className="rq__row">
                <span>Тип послуги</span>
                <span className="dim">Обрано: {types.length}</span>
              </div>
              <div className="rq__chips" role="group" aria-label="Тип послуги">
                {REQUEST_TYPES.map((t) => (
                  <button type="button" key={t} className={`pill ${types.includes(t) ? "is-on" : ""}`} aria-pressed={types.includes(t)} onClick={() => toggle(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <label className={`fld ${errors.message ? "is-err" : ""}`} data-m>
              <span className="fld__k">Коротко про проєкт</span>
              <textarea name="message" rows={3} />
              <span className="fld__e">{errors.message}</span>
            </label>
            <div data-m>
              <button className="btn btn--w rq__send" type="submit" disabled={state === "busy"}>
                {state === "busy" ? "Надсилаємо…" : "Надіслати запит"} <Arrow />
              </button>
              {state === "error" && <p className="rq__err" role="alert">Не вдалося надіслати запит. Спробуйте ще раз або напишіть на {CONTACT.email}.</p>}
            </div>
          </>
        )}
      </form>
    </div>
  );
}
