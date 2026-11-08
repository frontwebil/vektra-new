"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Illustration } from "./Illustration";
import { Arrow, Stars5 } from "./ui";
import { CONTACT, REVIEWS, SERVICES } from "@/lib/content";
import { sendRequest } from "@/lib/request";

/** Акордеон послуг на головній: ілюстрація ліворуч перетікає у форму обраного напряму. */
export function ServicesPanel() {
  const [active, setActive] = useState(0);
  const s = SERVICES[active];
  return (
    <div className="hs__g">
      <div className="hs__panel">
        <div className="hs__cap">
          <p className="label" key={s.slug} data-swap>{s.name}</p>
        </div>
        <div className="hs__vis">
          <Illustration name={s.form} density={1.25} brightness={1.1} />
        </div>
        <div className="hs__foot">
          <Link className="lnk" href={`/services/${s.slug}`}>Дізнатися більше <Arrow /></Link>
        </div>
      </div>
      <ul className="acc">
        {SERVICES.map((it, i) => (
          <li key={it.slug} className={`acc__i ${i === active ? "is-on" : ""}`}>
            <button type="button" className="acc__b" aria-expanded={i === active} onClick={() => setActive(i)}>
              <span className="acc__n">[ {it.letter} ]</span>
              <span className="acc__t">{it.short}</span>
              <Arrow />
            </button>
            <div className="acc__c">
              <div className="acc__in">
                <p>{it.accordion}</p>
                <ul className="tagline">
                  {it.accordionTags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Звичайний акордеон запитань. */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="acc acc--faq">
      {items.map((f, i) => (
        <li key={f.q} className={`acc__i ${i === open ? "is-on" : ""}`} data-r>
          <button type="button" className="acc__b" aria-expanded={i === open} onClick={() => setOpen(i === open ? -1 : i)}>
            <span className="acc__n">[ {String.fromCharCode(65 + i)} ]</span>
            <span className="acc__t">{f.q}</span>
            <svg className="acc__ar" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1.5 6.500 6 11l4.500-4.500" /></svg>
          </button>
          <div className="acc__c">
            <div className="acc__in"><p>{f.a}</p></div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Карусель відгуків. Реальних відгуків у макеті два, тому каруселі стільки ж сторінок. */
export function ReviewsCarousel() {
  const [page, setPage] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const total = REVIEWS.length;
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const card = t.children[page] as HTMLElement | undefined;
    if (card) t.scrollTo({ left: card.offsetLeft - t.offsetLeft, behavior: "smooth" });
  }, [page]);
  const onScroll = () => {
    const t = track.current;
    if (!t) return;
    const w = (t.children[0] as HTMLElement).offsetWidth;
    if (t.scrollWidth - t.clientWidth < 4) return;
    const i = Math.round(t.scrollLeft / w);
    if (i !== page && i < total) setPage(i);
  };
  const go = (d: number) => setPage((page + d + total) % total);
  return (
    <>
      <div className="rc" ref={track} onScroll={onScroll}>
        {REVIEWS.map((r) => (
          <article className="rc__c" key={r.name}>
            <div className="rc__top">
              <span>{r.category}</span>
              <Stars5 />
            </div>
            <div className="rc__txt">
              {r.paragraphs.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
            <div className="rc__by">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.logo} alt="" width={48} height={48} />
              <div>
                <p className="label">{r.name}</p>
                <span># {r.company}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className={`rc__nav ${total > 2 ? "is-always" : ""}`}>
        <button type="button" className="lnk" onClick={() => go(-1)}><span className="flip"><Arrow /></span> Назад</button>
        <span className="rc__pages">
          {REVIEWS.map((_, i) => (
            <button type="button" key={i} className={i === page ? "is-on" : ""} aria-label={`Відгук ${i + 1}`} aria-current={i === page} onClick={() => setPage(i)}>
              {i === page ? `[${String(i + 1).padStart(2, "0")}]` : String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </span>
        <button type="button" className="lnk" onClick={() => go(1)}>Далі <Arrow /></button>
      </div>
    </>
  );
}

/** Матриця точок із карток підходу: хвиля проходить за власним для кожної картки малюнком. */
export function DotMatrix({ pattern }: { pattern: "ripple" | "lattice" | "sweep" | "rise" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const cols = 18, rows = 9;
    let raf = 0, visible = false, hot = 0, target = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const value = (x: number, y: number, t: number) => {
      const u = x / (cols - 1), v = y / (rows - 1);
      if (pattern === "ripple") {
        const d = Math.hypot((u - 0.5) * 2, (v - 0.5));
        return Math.max(0, Math.sin(d * 9 - t * 1.6)) ** 3;
      }
      if (pattern === "lattice") {
        const a = (x + Math.floor(t * 1.2)) % 6 === 0 ? 1 : 0;
        const b = (y + Math.floor(t * 0.8)) % 4 === 0 ? 1 : 0;
        return a || b ? 0.7 : 0;
      }
      if (pattern === "sweep") {
        const p = (t * 0.22) % 1.3 - 0.15;
        return Math.max(0, 1 - Math.abs(u - p) * 7) * (0.5 + 0.5 * Math.sin(y * 2 + t));
      }
      const h = 0.5 + 0.5 * Math.sin(u * 5 + t * 0.9);
      return 1 - v < h ? 0.25 + (1 - v) * 0.75 : 0;
    };
    const draw = (t: number) => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (c.width !== Math.round(r.width * dpr)) {
        c.width = Math.round(r.width * dpr);
        c.height = Math.round(r.height * dpr);
      }
      g.clearRect(0, 0, c.width, c.height);
      const gx = c.width / cols, gy = c.height / rows, rad = Math.max(1.2, 1.5 * dpr);
      hot += (target - hot) * 0.08;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const k = value(x, y, t);
        const l = Math.round(44 + k * (150 + hot * 61));
        g.fillStyle = `rgb(${l},${l},${l})`;
        g.beginPath();
        g.arc(gx * (x + 0.5), gy * (y + 0.5), rad * (1 + k * 0.35), 0, 6.283);
        g.fill();
      }
    };
    const loop = (ms: number) => {
      draw(ms / 1000);
      if (visible) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver((e) => {
      visible = e[e.length - 1].isIntersecting && !reduce;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
      else draw(0);
    });
    io.observe(c);
    const host = c.closest<HTMLElement>("[data-hot]");
    const on = () => { target = 1; };
    const off = () => { target = 0; };
    host?.addEventListener("pointerenter", on);
    host?.addEventListener("pointerleave", off);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      host?.removeEventListener("pointerenter", on);
      host?.removeEventListener("pointerleave", off);
    };
  }, [pattern]);
  return <canvas className="matrix" ref={ref} aria-hidden="true" />;
}

/**
 * Фільтр за категоріями: ховає елементи, чий data-cats не містить обраний ключ.
 * Видимим елементам ставить is-even через один (0, 2, 4…), щоб чергування макета
 * рахувалося лише серед показаних карток.
 */
export function CatFilter({ scope, options, label, emptyText }: { scope: string; options: { key: string; label: string }[]; label: string; emptyText: string }) {
  const [active, setActive] = useState("all");
  const [empty, setEmpty] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(`${scope} [data-cats]`));
    const c: Record<string, number> = { all: items.length };
    items.forEach((el) => (el.dataset.cats || "").split(" ").forEach((k) => (c[k] = (c[k] || 0) + 1)));
    setCounts(c);
  }, [scope]);
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(`${scope} [data-cats]`));
    let shown = 0;
    items.forEach((el) => {
      const on = active === "all" || (el.dataset.cats || "").split(" ").includes(active);
      el.classList.toggle("is-hidden", !on);
      el.classList.toggle("is-even", on && shown % 2 === 0);
      if (on) shown++;
    });
    setEmpty(shown === 0);
  }, [active, scope]);
  return (
    <>
      <div className="flt" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.key} type="button" className={`pill ${active === o.key ? "is-on" : ""}`} aria-pressed={active === o.key} onClick={() => setActive(o.key)}>
            {o.label}
            {counts[o.key] ? <sup>{counts[o.key]}</sup> : null}
          </button>
        ))}
      </div>
      {empty && <p className="pj-empty flt__empty">{emptyText}</p>}
    </>
  );
}

const SERVICE_OPTIONS = ["Strategy & Branding", "UX/UI Design", "Web Development", "Digital & Social", "QA & Launch", "Automation & Integrations", "Комплексний проєкт"];
const BUDGETS = ["до $300" , "$1 000", "$1 000–3 000", "$3 000–5 000", "$5 000+", "Ще не визначили"];

/** Форма на сторінці контактів: той самий обробник, що й у попапі, але з бюджетом. */
export function ContactForm() {
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [openSel, setOpenSel] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const sel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: MouseEvent) => {
      if (sel.current && !sel.current.contains(e.target as Node)) setOpenSel(false);
    };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const contact = String(f.get("contact") || "").trim();
    const message = String(f.get("message") || "").trim();
    const err = { name: !name, contact: !contact, service: !service, budget: !budget, message: !message };
    setErrors(err);
    if (Object.values(err).some(Boolean)) return;
    setState("busy");
    try {
      setState(await sendRequest({ name, contact, services: [service], budget, message }));
    } catch {
      setState("error");
    }
  };
  const Field = ({ id, label, children, msg, wide }: { id: string; label: string; children: ReactNode; msg: string; wide?: boolean }) => (
    <div className={`fld ${wide ? "fld--w" : ""} ${errors[id] ? "is-err" : ""}`}>
      <span className="fld__k">{label}</span>
      {children}
      <span className="fld__e">{msg}</span>
    </div>
  );
  if (state === "sent") {
    return (
      <div className="ct-form ct-form--done" role="status">
        <div className="rq__done">
          <p className="h36">Запит надіслано.</p>
          <p className="dim">Ми переглянемо запит і зв’яжемося з вами, щоб уточнити задачу та наступні кроки.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="ct-form" onSubmit={submit} noValidate>
      <div className="ct-form__g">
        <label className={`fld ${errors.name ? "is-err" : ""}`}>
          <span className="fld__k">Ваше ім’я</span>
          <input type="text" name="name" autoComplete="name" />
          <span className="fld__e">Вкажіть, як до вас звертатися</span>
        </label>
        <label className={`fld ${errors.contact ? "is-err" : ""}`}>
          <span className="fld__k">Email або Telegram</span>
          <input type="text" name="contact" autoComplete="email" />
          <span className="fld__e">Потрібен контакт для відповіді</span>
        </label>
        {Field({
          id: "service", label: "Послуга", msg: "Оберіть напрям", wide: true,
          children: (
            <div className={`sel ${openSel ? "is-open" : ""}`} ref={sel}>
              <button type="button" className={`sel__b ${service ? "has" : ""}`} aria-haspopup="listbox" aria-expanded={openSel} onClick={() => setOpenSel((v) => !v)}>
                <span>{service || "Оберіть напрям"}</span>
                <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.500 4l4.500 4.500L10.500 4" strokeWidth="1.200" /></svg>
              </button>
              <ul className="sel__l" role="listbox">
                {SERVICE_OPTIONS.map((o) => (
                  <li key={o} role="option" aria-selected={o === service} className={o === service ? "is-on" : ""} tabIndex={0}
                    onClick={() => { setService(o); setOpenSel(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setService(o); setOpenSel(false); } }}>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ),
        })}
        {Field({
          id: "budget", label: "Бюджет", msg: "Оберіть діапазон або «Ще не визначили»", wide: true,
          children: (
            <div className="ct-budget" role="group" aria-label="Бюджет">
              {BUDGETS.map((b) => (
                <button key={b} type="button" className={`pill ${budget === b ? "is-on" : ""}`} aria-pressed={budget === b} onClick={() => setBudget(b)}>{b}</button>
              ))}
            </div>
          ),
        })}
        <label className={`fld fld--w ${errors.message ? "is-err" : ""}`}>
          <span className="fld__k">Коротко про проєкт</span>
          <textarea name="message" rows={3} />
          <span className="fld__e">Опишіть задачу кількома реченнями</span>
        </label>
      </div>
      <button className="btn btn--w ct-form__cta" type="submit" disabled={state === "busy"}>
        {state === "busy" ? "Надсилаємо…" : "Надіслати запит"} <Arrow />
      </button>
      <p className="ct-note">Ми переглянемо запит і зв’яжемося з вами, щоб уточнити задачу та наступні кроки.</p>
      {state === "error" && <p className="ct-ok is-on" role="alert">Не вдалося надіслати запит. Спробуйте ще раз або напишіть на {CONTACT.email}.</p>}
    </form>
  );
}

/** Експертиза на сторінці «Про нас»: наведення змінює форму й підпис. */
export function ExpertiseList() {
  const [active, setActive] = useState(0);
  const s = SERVICES[active];
  return (
    <div className="ab-ex__g">
      <div>
        {SERVICES.map((it, i) => (
          <button type="button" key={it.slug} className={`ab-ex__i ${i === active ? "is-on" : ""}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
            <b>{it.short}</b>
          </button>
        ))}
      </div>
      <div className="ab-ex__v">
        <p className="label ab-ex__cap">{s.cap}</p>
        <Illustration name={s.form} density={1.1} zoom={0.86} />
        <p className="ab-ex__desc">{s.lead} {s.rest}</p>
      </div>
    </div>
  );
}
