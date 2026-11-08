import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  CaseApproach,
  CaseChallenge,
  CaseExperience,
  CaseHero,
  CaseInfo,
  CaseNext,
  CaseOverview,
  CaseResult,
  CaseSolution,
  CaseSystem,
  CaseTechnology,
  CaseTestimonial,
} from "@/components/case/CaseSections";
import { Crumbs } from "@/components/ui";
import { CASE_TEMPLATE, caseIndex, caseSlugs, getCase, nextProject, type CaseView } from "@/lib/cases";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  return {
    title: `Кейс ${c.name}`,
    description: c.description,
    ...(slug === CASE_TEMPLATE.slug ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * Порядок секцій кейсу. Порожні секції не рендеряться, а номери (01), (02)…
 * рахуються лише для тих, що лишилися, тож прибрана секція не залишає дірки в нумерації.
 */
function sections(c: CaseView): ((n: string) => ReactNode)[] {
  const list: (((n: string) => ReactNode) | false | undefined)[] = [
    (n) => <CaseOverview key="ov" n={n} data={c.overview} />,
    c.challenge && ((n) => <CaseChallenge key="ch" n={n} data={c.challenge!} />),
    c.approach && ((n) => <CaseApproach key="ap" n={n} data={c.approach!} />),
    c.solution && ((n) => <CaseSolution key="so" n={n} data={c.solution!} />),
    c.system && ((n) => <CaseSystem key="sy" n={n} data={c.system!} />),
    c.experience && ((n) => <CaseExperience key="xp" n={n} data={c.experience!} />),
    c.technology && ((n) => <CaseTechnology key="tc" n={n} data={c.technology!} />),
    c.result && ((n) => <CaseResult key="rs" n={n} data={c.result!} />),
  ];
  return list.filter((s): s is (n: string) => ReactNode => Boolean(s));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const body = sections(c);
  const num = (i: number) => String(i).padStart(2, "0");

  return (
    <>
      <div className="cs-crumbs"><Crumbs items={[{ label: "Головна", href: "/" }, { label: "Проєкти", href: "/projects" }, { label: c.name }]} /></div>
      <CaseHero c={c} index={caseIndex(c)} />
      {body.map((render, i) => render(num(i + 1)))}
      {c.testimonial && <CaseTestimonial data={c.testimonial} />}
      <CaseInfo n={num(body.length + 1)} c={c} />
      <CaseNext p={nextProject(c)} />
    </>
  );
}
