import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Lines, PricingCards, SectionCta, SectionFaq, SectionHead, SectionProcess } from "@/components/sections";
import { Crumbs, Star, Tags, TextLink } from "@/components/ui";
import { PRICING, SERVICES } from "@/lib/content";
import { getServicePageData } from "@/lib/service-pages";

export const metadata: Metadata = pageMeta({
  title: "Послуги",
  description: "Стратегія та брендинг, UX/UI дизайн, розробка, digital, тестування й автоматизація в одній команді.",
  path: "/services",
});

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const serviceData = await Promise.all(SERVICES.map(async (service) => ({
    service,
    data: await getServicePageData(service),
  })));
  return (
    <>
      <section className="sec g4 sv-hero" data-hero>
        <Illustration name="lattice" className="fx sv-hero__il" density={1.3} zoom={0.92} brightness={0.72} />
        <Star className="star--a" style={{ left: "104rem", top: "24rem" }} />
        <Star className="star--b" style={{ left: "26rem", top: "84rem" }} />
        <Lines as="h1" className="d100 sv-hero__h" lines={[{ t: "Послуги," }, { t: "що працюють", cls: "ind1", dim: true }, { t: "разом" }]} />
        <div className="sv-hero__side">
          <p className="body18" data-r>Закриваємо шлях продукту від першої ідеї до запуску: <span className="dim">можна взяти окремий напрям або всю послідовність з однією командою.</span></p>
          <div data-r><RequestButton>Обговорити задачу</RequestButton></div>
        </div>
        <div className="sv-hero__crumbs" data-r><Crumbs items={[{ label: "Головна", href: "/" }, { label: "Послуги" }]} /></div>
      </section>

      <section className="sec g1 sv-list">
        <div className="wrap">
          <SectionHead left="Our services" right="Послуги" className="sh--c" lines={[{ t: "Від окремої" }, { t: "задачі до повного", dim: true }, { t: "запуску", cls: "sh__end" }]} />
          {serviceData.map(({ service: s, data }) => (
            <article className="sv" id={s.slug} key={s.slug}>
              <div className="sv__t">
                <span className="idx" data-r>[ {s.index} / 06 ]</span>
                <Lines as="h3" className="h2 sv__h" lines={[{ t: s.name }]} />
                <p className="body18" data-r>{s.lead} <span className="dim">{s.rest}</span></p>
                <span className="hr hr--2" data-hr />
                <div data-r><Tags items={s.tags} /></div>
              </div>
              <div className="sv__v">
                <p className="label" data-scramble>{s.cap}</p>
                <Illustration name={data.form} className="sv__il" density={1.2} brightness={1.1} />
                <TextLink href={`/services/${s.slug}`}>Дізнатися більше</TextLink>
              </div>
            </article>
          ))}
          <div className="sv-end">
            <Lines className="h2" lines={[{ t: "6 напрямів." }, { t: "Одна команда.", dim: true, cls: "ind1" }]} />
          </div>
        </div>
      </section>

      <PricingCards left="Price" right="Формат співпраці" cards={PRICING} cta="Подати запит" />
      <SectionProcess title={[{ t: "Зрозумілий процес" }, { t: "від задачі", dim: true, cls: "sh__i1" }, { t: "до запуску", cls: "sh__i2" }]} />
      <SectionFaq />
      <SectionCta />
    </>
  );
}
