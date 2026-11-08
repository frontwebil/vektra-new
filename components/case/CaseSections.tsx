import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Lines, ProjectImage } from "@/components/sections";
import { Arrow, Label, Star, Tags } from "@/components/ui";
import type { CaseStudy, CaseView, Line, Media, Rich, SolutionModule } from "@/lib/cases";
import type { Project } from "@/lib/content";
import { CaseMedia } from "./CaseMedia";

const LETTERS = "ABCDEFGH";
const pad = (i: number) => String(i).padStart(2, "0");

/** Рядки заголовка з даних: indent перетворюється на зсув по сітці. */
const ln = (lines: Line[]) => lines.map((l) => ({ t: l.t, dim: l.dim, cls: l.indent ? `cs-i${l.indent}` : undefined }));

export function RichText({ v }: { v: Rich }) {
  if (typeof v === "string") return v;
  return v.map((p, i) => (p.dim ? <span className="dim" key={i}>{p.t}</span> : <span key={i}>{p.t}</span>));
}

function Head({ n, label, aside, top = true }: { n: string; label: string; aside?: string; top?: boolean }) {
  return (
    <div className={`shead ${top ? "shead--t" : ""}`}>
      <Label>{`(${n}) / ${label}`}</Label>
      {aside && <p className="small w40">{aside}</p>}
    </div>
  );
}

function Live({ href, className = "lnk" }: { href: string; className?: string }) {
  const ext = /^https?:/.test(href);
  return (
    <a className={className} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      Відкрити сайт <Arrow />
    </a>
  );
}

/* ---------- Hero --------------------------------------------------------- */

export function CaseHero({ c, index }: { c: CaseView; index: string }) {
  const m = c.meta;
  const fields = ([
    ["Industry", m.industry],
    ["Year", m.year],
    ["Services", m.services?.join(" / ")],
    ["Market", m.market],
    ["Platform", m.platform],
  ] as const).filter(([, v]) => v);
  const n = fields.length + (m.website ? 1 : 0);

  return (
    <>
      <section className="sec cs-hero" data-hero>
        <div className="wrap">
          <div className="cs-hero__name">
            <Label>{`[ Project / ${index} ]`}</Label>
            <h1 className="label">{c.name}</h1>
            <p className="label dim">Case study</p>
          </div>
          <Lines as="h2" className="d100 cs-hero__h" lines={ln(c.statement)} />
          {n > 0 && (
            <dl className="cs-meta" style={{ "--n": n } as CSSProperties} data-r>
              {fields.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
              {m.website && <div><dt>Live</dt><dd><Live href={m.website} /></dd></div>}
            </dl>
          )}
        </div>
      </section>

      <section className="sec g3 cs-visual">
        <Illustration name={c.hero.illustration ?? "wave"} className="fx cs-visual__il" density={1.1} zoom={0.9} />
        <Star className="star--a" style={{ left: "38rem", top: "7.8rem" }} />
        <div className="cs-visual__m">
          <CaseMedia m={c.hero.media} priority sizes="(max-width: 767px) 100vw, 70vw" />
        </div>
        <div className="cs-visual__cta">
          {m.website ? <Live href={m.website} className="btn" /> : <RequestButton>Обговорити схожий проєкт</RequestButton>}
        </div>
      </section>
    </>
  );
}

/* ---------- Overview ----------------------------------------------------- */

export function CaseOverview({ n, data }: { n: string; data: CaseStudy["overview"] }) {
  return (
    <section className="sec g2 cs-sec">
      <div className="wrap">
        <Head n={n} label="Project" top={false} />
        <div className="cs-ov">
          <Lines className="d72 cs-ov__h" lines={ln(data.headline)} />
          {data.tags && <div className="cs-ov__tags" data-r><Tags items={data.tags} /></div>}
          <div className="cs-ov__body body18">
            {data.body.map((p, i) => (
              <p key={i} data-r><RichText v={p} /></p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Challenge ---------------------------------------------------- */

export function CaseChallenge({ n, data }: { n: string; data: CaseStudy["challenge"] }) {
  return (
    <section className="sec cs-sec">
      <div className="wrap">
        <Head n={n} label="Challenge" />
        <Lines className="d100 cs-h" lines={ln(data.headline)} />
        <div className={`cs-ch__grid ${data.items.length === 3 ? "cs-ch__grid--3" : ""}`}>
          {data.items.map((it, i) => (
            <div className="cs-ch__cell" key={i} data-r>
              <span className="cs-ch__wm" data-wm aria-hidden="true">{LETTERS[i]}</span>
              <h3 className="h3">{it.title}</h3>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Approach ----------------------------------------------------- */

export function CaseApproach({ n, data }: { n: string; data: CaseStudy["approach"] }) {
  return (
    <section className="sec cs-sec cs-sec--ap">
      <div className="wrap">
        <Head n={n} label="Approach" />
        <div className="cs-ap__g">
          <div className="cs-ap__vis">
            <Illustration name={data.illustration ?? "lattice"} className="fx" density={1.2} />
            {data.headline && <Lines className="h2 cs-ap__h" lines={ln(data.headline)} />}
            <div className="cs-ap__state">
              <span className="small w40">Зараз:</span>
              <span className="label" data-ap-state>{data.steps[0]?.title}</span>
            </div>
          </div>
          <div>
            {data.steps.map((s, i) => (
              <div className="cs-ap__item" key={s.title}>
                <span className="small">{pad(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Solution ----------------------------------------------------- */

function SolText({ n, m, className = "" }: { n: string; m: SolutionModule; className?: string }) {
  return (
    <div className={`cs-s__t ${className}`}>
      <span className="idx">[ {n} ]</span>
      <h3 className="h36" data-r>{m.title}</h3>
      <p className="dim" data-r>{m.text}</p>
    </div>
  );
}

function deviceOf(media: Media[]): Media {
  return media[1] ? { type: "device", desktop: media[0], mobile: media[1] } : media[0];
}

function SolutionBlock({ n, m }: { n: string; m: SolutionModule }) {
  const [a, b] = m.media;
  switch (m.layout) {
    case "wide":
      return (
        <article className="cs-s cs-s--wide">
          <SolText n={n} m={m} />
          <CaseMedia m={a} sizes="(max-width: 767px) 100vw, 92vw" />
        </article>
      );
    case "split":
      return (
        <article className={`cs-s cs-s--split ${m.reverse ? "is-r" : ""}`}>
          <SolText n={n} m={m} />
          <CaseMedia m={a} sizes="(max-width: 767px) 100vw, 46vw" />
        </article>
      );
    case "pair":
      return (
        <article className="cs-s cs-s--pair">
          <div className="cs-s__a"><CaseMedia m={a} sizes="(max-width: 767px) 100vw, 46vw" /></div>
          <SolText n={n} m={m} />
          {b && <div className="cs-s__b"><CaseMedia m={b} sizes="(max-width: 767px) 100vw, 46vw" /></div>}
        </article>
      );
    case "device":
      return (
        <article className="cs-s cs-s--device">
          <div className="cs-stage">
            <Illustration name="web" fit="cover" className="fx" brightness={0.6} interactive={false} />
            <SolText n={n} m={m} />
            <CaseMedia m={deviceOf(m.media)} sizes="(max-width: 767px) 100vw, 60vw" />
          </div>
        </article>
      );
    case "closeup":
      return (
        <article className={`cs-sol ${m.reverse ? "cs-sol--r" : ""}`}>
          <SolText n={n} m={m} className="cs-sol__t" />
          <CaseMedia m={a} sizes="(max-width: 767px) 100vw, 70vw" />
        </article>
      );
    case "cinematic":
      return (
        <article className="cs-s cs-s--cine">
          <CaseMedia m={a} sizes="100vw" />
          <SolText n={n} m={m} />
        </article>
      );
  }
}

export function CaseSolution({ n, data }: { n: string; data: CaseStudy["solution"] }) {
  return (
    <section className="sec cs-sec">
      <div className="wrap">
        <Head n={n} label="Solution" aside={data.note} />
        <Lines className="d100 cs-h" lines={ln(data.headline)} />
        {data.modules.map((m, i) => (
          <SolutionBlock key={i} n={pad(i + 1)} m={m} />
        ))}
      </div>
    </section>
  );
}

/* ---------- System (optional) ------------------------------------------- */

export function CaseSystem({ n, data }: { n: string; data: NonNullable<CaseStudy["system"]> }) {
  return (
    <section className="sec cs-sec">
      <div className="wrap">
        <Head n={n} label={data.label ?? "System"} />
        <Lines className="d100 cs-h" lines={ln(data.headline)} />
        {data.text && <p className="dim cs-lead" data-r>{data.text}</p>}
        <div className="cs-ds">
          {data.cells.map((c, i) => (
            <div className={`cs-ds__c ${c.size ? `cs-ds__c--${c.size}` : ""}`} key={i} data-r>
              <p className="small cs-ds__k">[ {c.key} ]</p>
              {c.specimen && <p className="cs-ds__aa">{c.specimen}</p>}
              {c.title && <h3 className="h3">{c.title}</h3>}
              {c.text && <p className="dim">{c.text}</p>}
              {c.swatches && (
                <div className="cs-ds__sw">
                  {c.swatches.map((s) => (
                    <i key={s} style={{ background: s }} title={s} />
                  ))}
                </div>
              )}
              {c.media && <CaseMedia m={c.media} sizes="(max-width: 767px) 100vw, 46vw" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Experience (optional) --------------------------------------- */

export function CaseExperience({ n, data }: { n: string; data: NonNullable<CaseStudy["experience"]> }) {
  return (
    <section className="sec cs-sec">
      <div className="wrap">
        <Head n={n} label={data.label ?? "Experience"} />
        <Lines className="d72 cs-h" lines={ln(data.headline)} />
        {data.text && <p className="dim cs-lead" data-r>{data.text}</p>}
        <div className="cs-xp">
          {data.items.map((it, i) => (
            <figure className="cs-xp__i" key={it.label} {...(i === 1 ? { "data-drift": "-5" } : {})}>
              <CaseMedia m={it.media} sizes={i === 0 ? "(max-width: 767px) 100vw, 70vw" : "(max-width: 767px) 100vw, 46vw"} />
              <figcaption className="idx">[ {it.label} ]</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Technology (optional) --------------------------------------- */

export function CaseTechnology({ n, data }: { n: string; data: NonNullable<CaseStudy["technology"]> }) {
  return (
    <section className="sec g2 cs-sec">
      <div className="wrap">
        <Head n={n} label={data.label ?? "Technology"} />
        <Lines className="d72 cs-h" lines={ln(data.headline)} />
        <div className="cs-tc">
          <div className="cs-tc__l">
            {data.stack && (
              <>
                <p className="small w40">[ Stack ]</p>
                <ul className="cs-tc__stack" data-r>
                  {data.stack.map((s) => (
                    <li className="h3" key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div>
            {data.items.map((it, i) => (
              <div className="cs-tc__i" key={i} data-r>
                <span className="idx">{pad(i + 1)}</span>
                <div>
                  <h3 className="h36">{it.title}</h3>
                  <p className="dim">{it.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Result ------------------------------------------------------- */

export function CaseResult({ n, data }: { n: string; data: CaseStudy["result"] }) {
  return (
    <section className="sec cs-sec">
      <div className="wrap">
        <Head n={n} label="Result" />
        <Lines className="d100 cs-h" lines={ln(data.headline)} />
        {data.metrics && data.metrics.length > 0 && (
          <div className="cs-mx" style={{ "--n": data.metrics.length } as CSSProperties}>
            {data.metrics.map((x, i) => (
              <div className="cs-mx__c" key={i} data-r>
                <p className="d140 cs-mx__v">
                  {x.prefix}
                  <span data-count={x.value}>{x.value}</span>
                  {x.suffix && <span className="dim">{x.suffix}</span>}
                </p>
                <h3 className="h3">{x.label}</h3>
                {x.text && <p className="dim">{x.text}</p>}
              </div>
            ))}
          </div>
        )}
        <div>
          {data.items.map((it, i) => (
            <div className="cs-res__row" key={i} data-r>
              <span className="small w40">[ {LETTERS[i]} ]</span>
              <span className="h3">{it.title}</span>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonial (optional) -------------------------------------- */

export function CaseTestimonial({ data }: { data: NonNullable<CaseStudy["testimonial"]> }) {
  return (
    <section className="sec g4 cs-q">
      <div className="wrap">
        <Label className="cs-q__l">Client feedback</Label>
        <blockquote>
          <p className="cs-q__t" data-words><RichText v={data.quote} /></p>
          <footer className="cs-q__by" data-r>
            {data.logo && <Image src={data.logo} alt="" width={48} height={48} />}
            <div>
              <p className="label">{data.name}</p>
              <p className="small w40"># {data.role}{data.country ? ` / ${data.country}` : ""}</p>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

/* ---------- Project info ------------------------------------------------- */

export function CaseInfo({ n, c }: { n: string; c: CaseView }) {
  const m = c.meta;
  const rows = ([
    ["Project", c.name],
    ["Industry", m.industry],
    ["Services", m.services?.join(" / ")],
    ["Year", m.year],
    ["Market", m.market],
    ["Team", m.team],
    ["Technology", m.technology],
  ] as const).filter(([, v]) => v);
  return (
    <section className="sec cs-sec">
      <div className="wrap">
        <Head n={n} label="Project info" />
        <div className="cs-info">
          <div className="cs-info__l" data-r>
            <p className="h36">{c.name}</p>
            <p className="small w40">Case study{m.year ? ` / ${m.year}` : ""}</p>
          </div>
          <dl>
            {rows.map(([k, v]) => (
              <div className="cs-info__r" key={k} data-r><dt>{k}</dt><dd>{v}</dd></div>
            ))}
            {m.website && <div className="cs-info__r" data-r><dt>Website</dt><dd><Live href={m.website} /></dd></div>}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- Next project ------------------------------------------------- */

export function CaseNext({ p }: { p: Project }) {
  return (
    <Link className="sec cs-next" href={`/projects/${p.slug}`} aria-label={`Наступний кейс: ${p.name}`}>
      <Label className="cs-next__t">Next project</Label>
      <p className="small w40 cs-next__k">{p.category}</p>
      <ProjectImage p={p} sizes="(max-width: 767px) 100vw, 46vw" />
      <span className="lnk cs-next__c">Дивитися кейс <Arrow /></span>
      <Lines className="d140 cs-next__n" lines={[{ t: p.name }]} />
    </Link>
  );
}
