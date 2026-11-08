import type { Metadata } from "next";
import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { CatFilter } from "@/components/interactive";
import { Banner, Lines, ProjectImage } from "@/components/sections";
import { Arrow, Label, Star } from "@/components/ui";
import { orderedProjects } from "@/lib/cases";
import type { Project } from "@/lib/content";

export const metadata: Metadata = {
  title: "Проєкти",
  description:
    "Кейси Vektra: як стратегія, дизайн і технології вирішують реальні задачі бізнесу.",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "branding", label: "Branding" },
  { key: "uxui", label: "UX/UI" },
  { key: "development", label: "Development" },
  { key: "ecommerce", label: "E-commerce" },
];

function Year({ y }: { y: string | null }) {
  return y ? <dd>{y}</dd> : <dd className="w40">[ Year ]</dd>;
}

/** Назва у два тони: перше слово світле, решта — сіра. */
function nameLines(name: string) {
  const [first, ...rest] = name.split(" ");
  return rest.length
    ? [{ t: first }, { t: rest.join(" "), dim: true }]
    : [{ t: first }];
}

/**
 * Картка проєкту. Сторони чергуються: is-even — текст ліворуч, фото праворуч, інші — навпаки.
 * Початкове чергування задається тут, а після фільтрації CatFilter перераховує is-even
 * лише серед видимих карток. Новий проєкт з'являється тут сам, щойно його додано в PROJECTS.
 */
function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <article
      className={`fp ${i % 2 === 0 ? "is-even" : ""}`}
      data-cats={p.cats.join(" ")}
    >
      <div className="fp__grid">
        <Link
          href={`/projects/${p.slug}`}
          aria-label={`Кейс ${p.name}`}
          className="fp__m"
        >
          <ProjectImage p={p} />
        </Link>
        <div className="fp__txt">
          <Lines className="d100" lines={nameLines(p.name)} />
          <p className="fp__desc" data-r>
            {p.lead} <em>{p.rest}</em>
          </p>
          <dl className="fp__dl" data-r>
            <div>
              <dt>Category</dt>
              <dd>{p.category}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <Year y={p.year} />
            </div>
            <div className="span2">
              <dt>Services</dt>
              <dd>{p.services}</dd>
            </div>
          </dl>
          <Link
            className="lnk"
            href={`/projects/${p.slug}`}
            data-r
            style={{ width: "max-content" }}
          >
            Переглянути кейс <Arrow />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const projects = orderedProjects();
  return (
    <>
      <section className="sec g4 pj-hero" data-hero>
        <Illustration
          name="web"
          fit="cover"
          className="fx pj-hero__il"
          brightness={0.7}
        />
        <Star className="star--a" style={{ left: "39rem", top: "60rem" }} />
        <Star className="star--b" style={{ left: "124rem", top: "64rem" }} />
        <Label className="pj-hero__label">(01) / Selected work</Label>
        <div className="pj-hero__side">
          <p className="body18" data-r>
            Не просто показуємо результат —{" "}
            <span className="dim">
              показуємо, як стратегія, дизайн і технології вирішують реальні
              задачі бізнесу.
            </span>
          </p>
          <div data-r>
            <RequestButton>Обговорити проєкт</RequestButton>
          </div>
        </div>
        <Lines
          as="h1"
          className="d120 pj-hero__h"
          lines={[
            { t: "Проєкти," },
            { t: "де рішення", dim: true },
            { t: "мають причину." },
          ]}
        />
      </section>

      <section className="sec" id="work">
        <div className="wrap">
          <div className="pj-filter">
            <Label>(02) / Filter</Label>
            <CatFilter
              scope="#work"
              label="Фільтр проєктів"
              options={FILTERS}
              emptyText="У цьому напрямі поки немає опублікованих кейсів."
            />
          </div>

          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      </section>

      <section className="sec pj-cta">
        <Banner form="infinity">
          <Lines
            className="d100 pj-cta__h"
            lines={[
              { t: "Роботи говорять" },
              { t: "краще за", dim: true },
              { t: "обіцянки.", dim: true },
            ]}
          />
          <div className="pj-cta__b" data-r>
            <p className="dim">
              За кожним кейсом — задача, рішення та система, створена навколо
              реального бізнесу.
            </p>
            <RequestButton variant="link">Обговорити свій проєкт</RequestButton>
          </div>
        </Banner>
      </section>
    </>
  );
}
