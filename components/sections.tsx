import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Illustration } from "./Illustration";
import { RequestButton } from "./RequestButton";
import { FaqList, ReviewsCarousel } from "./interactive";
import { Arrow, Dots, Label, Ln, Star, Tags } from "./ui";
import { FAQ, PROCESS, PROJECTS, type Project } from "@/lib/content";
import type { IllustrationName } from "@/lib/illustrations";

type Line = { t: string; dim?: boolean; cls?: string };

export function Lines({ lines, as: Tag = "h2", className = "" }: { lines: Line[]; as?: "h1" | "h2" | "h3" | "blockquote"; className?: string }) {
  return (
    <Tag className={className} data-lines>
      {lines.map((l) => (
        <Ln key={l.t} dim={l.dim} className={l.cls}>{l.t}</Ln>
      ))}
    </Tag>
  );
}

/** Заголовок секції по центру сітки з двома мітками по краях. */
export function SectionHead({ left, right, lines, className = "" }: { left: string; right?: string; lines: Line[]; className?: string }) {
  return (
    <div className={`sh ${className}`}>
      <Label className="sh__l">{left}</Label>
      <Lines lines={lines} className="h2 sh__h" />
      {right && <Label className="sh__r">{right}</Label>}
    </div>
  );
}

export function SectionProcess({ title, steps = PROCESS, left = "How we work", right = "Process" }: { title: Line[]; steps?: { letter: string; n: string; title: string; text: string; result?: string }[]; left?: string; right?: string }) {
  return (
    <section className="sec g4 pr-sec">
      <div className="wrap">
        <SectionHead left={left} right={right} lines={title} />
        <div className="steps" data-steps>
          {steps.map((s, i) => (
            <article className="step" key={s.title} data-r>
              <span className="step__wm" data-wm aria-hidden="true">{s.letter}</span>
              <div className="step__top">
                <span className="idx">[ {s.n} ]</span>
                <Dots on={0} total={5} />
                <span className="sr-only">Етап {i + 1}</span>
              </div>
              <div className="step__body">
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
              </div>
              {s.result && (
                <div className="step__res">
                  <span>Результат:</span>
                  <p>{s.result}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionReviews() {
  return (
    <section className="sec g2 rv-sec">
      <div className="wrap">
        <div className="rv-head">
          <Lines lines={[{ t: "Проєкти завершуються." }, { t: "Хороша співпраця", dim: true }, { t: "— продовжується.", cls: "ind2" }]} className="h2" />
          <Label className="rv-head__l">Client experience</Label>
        </div>
        <ReviewsCarousel />
      </div>
    </section>
  );
}

export function SectionFaq({ items = FAQ, lines, text }: { items?: { q: string; a: string }[]; lines?: Line[]; text?: string }) {
  return (
    <section className="sec g2 fq-sec">
      <Star style={{ left: "6rem", bottom: "8rem" }} className="star--edge" />
      <div className="wrap fq">
        <div className="fq__l">
          <Label>FAQ</Label>
          <Lines lines={lines ?? [{ t: "Перед стартом" }, { t: "краще мати всі", dim: true }, { t: "відповіді" }]} className="h2" />
          <p className="dim fq__p" data-r>{text ?? "Зібрали запитання, які чуємо найчастіше перед початком роботи. Якщо вашого тут немає, поставте його напряму."}</p>
          <div data-r><RequestButton variant="link">Поставити запитання</RequestButton></div>
        </div>
        <FaqList items={items} />
      </div>
    </section>
  );
}

export function SectionCta({ q = "Є задача?", text = "Розкажіть, що хочете запустити, змінити або масштабувати.", lines, action = "Обговорити задачу", tag = "FAQ", form = "vortex" }: { q?: string; text?: string; lines?: Line[]; action?: string; tag?: string; form?: IllustrationName }) {
  return (
    <section className="sec g4 ca-sec">
      <div className="ca">
        <Illustration name={form} fit="cover" className="fx" brightness={0.75} />
        <div className="ca__l">
          <Lines lines={[{ t: q }]} className="d72" />
          <p className="dim" data-r>{text}</p>
          <div className="ca__act" data-r><RequestButton variant="link">{action}</RequestButton></div>
        </div>
        <div className="ca__r">
          <span className="ca__tag" data-r>{tag}</span>
          <Lines lines={lines ?? [{ t: "Знайдемо" }, { t: "правильний", cls: "ca__ind" }, { t: "напрямок.", dim: true }]} className="d72" />
        </div>
      </div>
    </section>
  );
}

export function ProjectImage({ p, className = "", priority, sizes = "(max-width: 767px) 100vw, 50vw" }: { p: Project; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <div className={`media ${className}`} data-media>
      <Image src={p.image} alt={p.alt} fill sizes={sizes} quality={85} priority={priority} />
    </div>
  );
}

/** Картки портфоліо наїжджають одна на одну під час скролу. */
export function SelectedWork() {
  return (
    <div className="pk">
      {PROJECTS.map((p, i) => (
        <article className="pk__c" key={p.slug} style={{ zIndex: i + 1 }}>
          <div className="pk__t">
            <div className="pk__row">
              <Label>Selected work</Label>
              <span className="idx">[ {String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")} ]</span>
            </div>
            <div>
              <Lines lines={[{ t: p.home }]} as="h3" className="h2" />
              <p className="pk__d" data-r>{p.lead} <span className="dim">{p.rest}</span></p>
              <div data-r><Tags items={p.tags} dim /></div>
            </div>
            <Link className="lnk pk__go" href={`/projects/${p.slug}`} data-r>Переглянути кейс <Arrow /></Link>
          </div>
          <Link href={`/projects/${p.slug}`} className="pk__m" aria-label={`Кейс ${p.name}`}>
            <ProjectImage p={p} />
          </Link>
        </article>
      ))}
    </div>
  );
}

export function PricingCards({ left, right, cards, cta, form = "flower" }: { left: string; right: string; cards: { badge: string; title: string[]; text: string; features: string[]; foot: string; featured?: boolean }[]; cta: string; form?: IllustrationName }) {
  return (
    <section className="sec g2 pc-sec">
      <div className="wrap">
        <div className="pc-head">
          <Label>{left}</Label>
          <Label>{right}</Label>
        </div>
        <div className="pc">
          {cards.map((c) => (
            <article className={`pc__c ${c.featured ? "is-f" : ""}`} key={c.badge}>
              {c.featured && <Illustration name={form} className="fx pc__il" density={0.8} brightness={0.7} interactive={false} />}
              <span className="idx">[ {c.badge} ]</span>
              <Lines lines={c.title.map((t) => ({ t }))} as="h3" className="h2" />
              <p className={c.featured ? "" : "dim"} data-r>{c.text}</p>
              <span className="idx">[ Що входить ]</span>
              <ul className="pc__f">
                {c.features.map((f) => (
                  <li key={f} data-r><Star className="star--in" />{f}</li>
                ))}
              </ul>
              <span className="idx">[ Тривалість ]</span>
              <div className="pc__foot">
                <p>{c.foot}</p>
                <RequestButton variant={c.featured ? "white" : "btn"} className="pc__btn">{cta}</RequestButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Banner({ children, form = "web" }: { children: ReactNode; form?: IllustrationName }) {
  return (
    <div className="banner">
      <Illustration name={form} fit="cover" className="fx" brightness={0.75} />
      {children}
    </div>
  );
}
