import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import {
  Lines,
  PricingCards,
  ProjectImage,
  SectionCta,
  SectionFaq,
  SectionHead,
  SectionProcess,
} from "@/components/sections";
import { Arrow, Crumbs, Dots, Label, Ln, Star } from "@/components/ui";
import { SERVICES, type Project, type Service } from "@/lib/content";
import { getProjects } from "@/lib/projects";
import {
  getServicePageData,
  type ServiceSectionKey,
} from "@/lib/service-pages";
import type { IllustrationName } from "@/lib/illustrations";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  return s ? pageMeta({ title: s.name, description: `${s.lead} ${s.rest}`, path: `/services/${s.slug}` }) : {};
}

function Hero({
  s,
  side,
  sideRest,
  action,
  form,
}: {
  s: Service;
  side: string;
  sideRest: string;
  action: string;
  form: IllustrationName;
}) {
  const parts = s.name.split(" & ");
  console.log(s.name);
  return (
    <section className="sec g4 bd-hero" data-hero>
      <Illustration
        name={form}
        className="fx bd-hero__il"
        density={1.4}
        brightness={0.72}
      />
      <Star className="star--a" style={{ left: "128rem", top: "12rem" }} />
      <Star className="star--b" style={{ left: "37rem", top: "24rem" }} />
      <Star className="star--c" style={{ left: "128rem", top: "78rem" }} />
      <Label className="bd-hero__cap">{`[ ${s.cap} ]`}</Label>
      <div className="bd-hero__side">
        <p className="body18" data-r>
          {side} <span className="dim">{sideRest}</span>
        </p>
        <div data-r>
          <RequestButton>{action}</RequestButton>
        </div>
      </div>
      <h1 className="d120 bd-hero__h" data-lines>
        <Ln className="bd-hero__t pre-line">{parts[0]}</Ln>
        {parts[1] && (
          <Ln className="bd-hero__t ind2">
            <small>&</small> {parts[1]}
          </Ln>
        )}
      </h1>
      <div className="bd-hero__crumbs" data-r>
        <Crumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Послуги", href: "/services" },
            { label: s.name },
          ]}
        />
      </div>
    </section>
  );
}

function FullServicePage({
  s,
  data,
  projects,
}: {
  s: Service;
  data: Awaited<ReturnType<typeof getServicePageData>>;
  projects: Project[];
}) {
  const work = data.workSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is Project =>
      Boolean(project),
    );
  const sections: Record<ServiceSectionKey, () => ReactNode> = {
    why: () => (
      <section className="sec g4 bw">
        <div className="wrap">
          <SectionHead
            left={data.whyLeft}
            right={data.whyRight}
            className="sh--c"
            lines={data.whyTitle.map((t, i) => ({
              t,
              dim: i === 1,
              cls: i === 0 ? "sh__i1" : undefined,
            }))}
          />
          <div className="bw__g">
            {data.why.map((c, i) => (
              <article className="bw__c" key={c.a} data-r>
                <div className="stat__top">
                  <span className="idx">[ {String.fromCharCode(65 + i)} ]</span>
                  <Dots on={i + 1} total={3} />
                </div>
                <div>
                  <h3 className="h3">
                    {c.a}
                    <br />
                    <span className="dim">{c.b}</span>
                  </h3>
                  <p>{c.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    when: () => (
      <section className="sec g4 bn">
        <div className="wrap bn__g">
          <Label className="bn__l">{data.whenLabel}</Label>
          <div>
            <Lines
              className="h2"
              lines={data.whenTitle.map((t, i) => ({
                t,
                dim: i === data.whenTitle.length - 1,
              }))}
            />
            <ul className="bn__list">
              {data.when.map((w, i) => (
                <li key={w.t} data-r>
                  <span className="idx">[ {String.fromCharCode(65 + i)} ]</span>
                  <b>{w.t}</b>
                  <p className="dim">{w.d}</p>
                </li>
              ))}
            </ul>
            <div className="bn__s">
              <p data-r>{data.whenText}</p>
              <div data-r>
                <RequestButton>Обговорити проєкт</RequestButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    included: () => (
      <section className="sec g4 bi">
        <Illustration
          name={data.form}
          className="fx bi__il"
          density={1.4}
          brightness={0.72}
        />
        <Label className="bi__r">{data.includedLabel}</Label>
        <p className="label bi__l" data-r>
          {data.includedLead.split("\n").map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <div className="bi__g">
          {data.included.map((c) => (
            <article className="bi__c" key={c.t} data-r>
              <h3 className="h3">{c.t}</h3>
              <p>{c.d}</p>
            </article>
          ))}
        </div>
      </section>
    ),
    process: () => (
      <SectionProcess
        left={data.processLeft}
        right={data.processRight}
        title={data.processTitle.map((t, i) => ({
          t,
          dim: i === 1,
          cls: i === 1 ? "sh__i1" : undefined,
        }))}
        steps={data.process}
      />
    ),
    work: () => (
      <section className="sec g2 bp">
        <div className="wrap">
          <div className="sv-end sv-end--t">
            <Lines
              className="h2"
              lines={data.workTitle.map((t, i) => ({
                t,
                dim: i === 1,
                cls: i === 1 ? "ind1" : undefined,
              }))}
            />
          </div>
          <div className="bp__g">
            {work.map((p) => (
              <Link href={`/projects/${p.slug}`} className="bp__c" key={p.slug}>
                <ProjectImage p={p} />
                <div className="bp__m">
                  <p className="label" data-scramble>
                    {p.name}
                  </p>
                  <span className="dim"># {p.tags[0]}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="bp__go" data-r>
            <Link className="lnk" href="/projects">
              Усі проєкти <Arrow />
            </Link>
          </div>
        </div>
      </section>
    ),
    pricing: () => (
      <PricingCards
        left={data.pricingLeft}
        right={data.pricingRight}
        cards={data.pricing}
        cta={data.pricingCta}
        form={data.form}
      />
    ),
    faq: () => (
      <SectionFaq
        items={data.faq}
        lines={data.faqTitle.map((t, i) => ({ t, dim: i === 1 }))}
        text={data.faqText}
      />
    ),
    cta: () => (
      <SectionCta
        q={data.ctaQ}
        text={data.ctaText}
        tag={data.ctaTag}
        form={data.form}
        action={data.ctaAction}
        lines={data.ctaLines.map((t, i) => ({
          t,
          dim: i === 0 || i === data.ctaLines.length - 1,
          cls: i === 1 ? "ca__ind" : i === 0 ? "ca__r1" : undefined,
        }))}
      />
    ),
  };
  return (
    <>
      <Hero
        s={s}
        side={data.hero}
        sideRest={data.heroRest}
        action={data.heroAction}
        form={data.form}
      />
      {data.sectionOrder.map((section, index) => (
        <div key={`${section}-${index}`}>{sections[section]()}</div>
      ))}
    </>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  const [data, projects] = await Promise.all([getServicePageData(s), getProjects()]);
  return <FullServicePage s={s} data={data} projects={projects} />;
}
