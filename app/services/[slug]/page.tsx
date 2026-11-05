import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Lines, PricingCards, ProjectImage, SectionCta, SectionFaq, SectionHead, SectionProcess } from "@/components/sections";
import { Arrow, Crumbs, Dots, Label, Ln, Star } from "@/components/ui";
import { BRANDING, BRANDING_PRICING, PRICING, PROJECTS, SERVICES, type Service } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  return s ? { title: s.name, description: `${s.lead} ${s.rest}` } : {};
}

function Hero({ s, side, sideRest, action }: { s: Service; side: string; sideRest: string; action: string }) {
  const parts = s.name.split(" & ");
  return (
    <section className="sec g4 bd-hero" data-hero>
      <Illustration name={s.form} className="fx bd-hero__il" density={1.4} brightness={0.72} />
      <Star className="star--a" style={{ left: "128rem", top: "12rem" }} />
      <Star className="star--b" style={{ left: "37rem", top: "24rem" }} />
      <Star className="star--c" style={{ left: "128rem", top: "78rem" }} />
      <Label className="bd-hero__cap">{`[ ${s.cap} ]`}</Label>
      <div className="bd-hero__side">
        <p className="body18" data-r>{side} <span className="dim">{sideRest}</span></p>
        <div data-r><RequestButton>{action}</RequestButton></div>
      </div>
      <h1 className="d120 bd-hero__h" data-lines>
        <Ln className="bd-hero__t">{parts[0]}</Ln>
        {parts[1] && <Ln className="bd-hero__t ind2"><small>&</small> {parts[1]}</Ln>}
      </h1>
      <div className="bd-hero__crumbs" data-r>
        <Crumbs items={[{ label: "Головна", href: "/" }, { label: "Послуги", href: "/services" }, { label: s.name }]} />
      </div>
    </section>
  );
}

function BrandingPage({ s }: { s: Service }) {
  const work = PROJECTS.filter((p) => p.slug !== "pumplab");
  return (
    <>
      <Hero s={s} side={BRANDING.hero} sideRest={BRANDING.heroRest} action="Розрахувати вартість" />

      <section className="sec g4 bw">
        <div className="wrap">
          <SectionHead left="Чому" right="Навіщо" className="sh--c" lines={[{ t: "Не просто", cls: "sh__i1" }, { t: "впізнавано.", dim: true }, { t: "Зрозуміло, хто ви." }]} />
          <div className="bw__g">
            {BRANDING.why.map((c, i) => (
              <article className="bw__c" key={c.a} data-r>
                <div className="stat__top">
                  <span className="idx">[ {String.fromCharCode(65 + i)} ]</span>
                  <Dots on={i + 1} total={3} />
                </div>
                <div>
                  <h3 className="h3">{c.a}<br /><span className="dim">{c.b}</span></h3>
                  <p>{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec g4 bn">
        <div className="wrap bn__g">
          <Label className="bn__l">Коли потрібен брендинг</Label>
          <div>
            <Lines className="h2" lines={[{ t: "Якщо бренд вже є," }, { t: "але напрямку" }, { t: "ще немає.", dim: true }]} />
            <ul className="bn__list">
              {BRANDING.when.map((w, i) => (
                <li key={w.t} data-r>
                  <span className="idx">[ {String.fromCharCode(65 + i)} ]</span>
                  <b>{w.t}</b>
                  <p className="dim">{w.d}</p>
                </li>
              ))}
            </ul>
            <div className="bn__s">
              <p data-r>{BRANDING.whenText}</p>
              <div data-r><RequestButton>Обговорити проєкт</RequestButton></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec g4 bi">
        <Illustration name="flower" className="fx bi__il" density={1.4} brightness={0.72} />
        <Label className="bi__r">Склад послуги</Label>
        <p className="label bi__l" data-r>Стратегія визначає напрямок,<br />айдентика робить його видимим.</p>
        <div className="bi__g">
          {BRANDING.included.map((c) => (
            <article className="bi__c" key={c.t} data-r>
              <h3 className="h3">{c.t}</h3>
              <p>{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <SectionProcess left="How we work" right="Process" title={[{ t: "Від дослідження" }, { t: "до бренду, який", dim: true, cls: "sh__i1" }, { t: "можна запускати." }]} steps={BRANDING.process} />

      <section className="sec g2 bp">
        <div className="wrap">
          <div className="sv-end sv-end--t">
            <Lines className="h2" lines={[{ t: "Стратегія, яку" }, { t: "можна побачити", dim: true, cls: "ind1" }]} />
          </div>
          <div className="bp__g">
            {work.map((p) => (
              <Link href={`/projects/${p.slug}`} className="bp__c" key={p.slug}>
                <ProjectImage p={p} />
                <div className="bp__m">
                  <p className="label" data-scramble>{p.name}</p>
                  <span className="dim"># {p.tags[0]}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="bp__go" data-r><Link className="lnk" href="/projects">Усі проєкти <Arrow /></Link></div>
        </div>
      </section>

      <PricingCards left="Price" right="Формат співпраці" cards={BRANDING_PRICING} cta="Подати запит" />
      <SectionFaq items={BRANDING.faq} text="Зібрали запитання, які найчастіше виникають перед стартом брендингу. Якщо вашого тут немає, поставте його напряму." />
      <SectionCta q="Ваш бренд" text="Розкажіть, що відбувається з брендом зараз і куди ви хочете його привести." tag="Contact us" form="flower" lines={[{ t: "Може", dim: true, cls: "ca__r1" }, { t: "говорити", cls: "ca__ind" }, { t: "чіткіше", dim: true }]} />
    </>
  );
}

function ServicePage({ s }: { s: Service }) {
  return (
    <>
      <Hero s={s} side={s.lead} sideRest={s.rest} action="Розрахувати вартість" />
      <section className="sec g4 bn">
        <div className="wrap bn__g">
          <Label className="bn__l">Склад послуги</Label>
          <div>
            <Lines className="h2" lines={[{ t: "Що входить" }, { t: "у цей напрям", dim: true }]} />
            <ul className="bn__list bn__list--2">
              {s.tags.map((t, i) => (
                <li key={t} data-r>
                  <span className="idx">[ {String.fromCharCode(65 + i)} ]</span>
                  <b>{t}</b>
                </li>
              ))}
            </ul>
            <div className="bn__s">
              <p data-r>{s.accordion}</p>
              <div data-r><RequestButton>Обговорити проєкт</RequestButton></div>
            </div>
          </div>
        </div>
      </section>
      <SectionProcess title={[{ t: "Зрозумілий процес" }, { t: "від задачі", dim: true, cls: "sh__i1" }, { t: "до запуску", cls: "sh__i2" }]} />
      <PricingCards left="Price" right="Формат співпраці" cards={PRICING} cta="Подати запит" />
      <SectionFaq />
      <SectionCta />
    </>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  return s.slug === "branding" ? <BrandingPage s={s} /> : <ServicePage s={s} />;
}
