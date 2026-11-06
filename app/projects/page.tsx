import type { Metadata } from "next";
import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { CatFilter } from "@/components/interactive";
import { Banner, Lines, ProjectImage } from "@/components/sections";
import { Arrow, Label, Star } from "@/components/ui";
import { PROJECTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Проєкти",
  description: "Кейси Vektra: як стратегія, дизайн і технології вирішують реальні задачі бізнесу.",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "branding", label: "Branding" },
  { key: "uxui", label: "UX/UI" },
  { key: "development", label: "Development" },
  { key: "ecommerce", label: "E-commerce" },
];

const [clave, softh, pump] = PROJECTS;

function Year({ y }: { y: string | null }) {
  return y ? <dd>{y}</dd> : <dd className="w40">[ Year ]</dd>;
}

export default function ProjectsPage() {
  return (
    <>
      <section className="sec g4 pj-hero" data-hero>
        <Illustration name="web" fit="cover" className="fx pj-hero__il" brightness={0.7} />
        <Star className="star--a" style={{ left: "39rem", top: "60rem" }} />
        <Star className="star--b" style={{ left: "124rem", top: "64rem" }} />
        <Label className="pj-hero__label">(01) / Selected work</Label>
        <div className="pj-hero__side">
          <p className="body18" data-r>Не просто показуємо результат — <span className="dim">показуємо, як стратегія, дизайн і технології вирішують реальні задачі бізнесу.</span></p>
          <div data-r><RequestButton>Обговорити проєкт</RequestButton></div>
        </div>
        <Lines as="h1" className="d120 pj-hero__h" lines={[{ t: "Проєкти," }, { t: "де рішення", dim: true }, { t: "мають причину." }]} />
      </section>

      <section className="sec" id="work">
        <div className="wrap">
          <div className="pj-filter">
            <Label>(02) / Filter</Label>
            <CatFilter scope="#work" label="Фільтр проєктів" options={FILTERS} emptyText="У цьому напрямі поки немає опублікованих кейсів." />
          </div>

          <article className="fp fp--a" data-cats={pump.cats.join(" ")}>
            <div className="fp__top">
              <Lines className="d140" lines={[{ t: pump.name }]} />
              <span className="small dim" data-r>[ 01 / 03 ]</span>
            </div>
            <div className="fp__grid">
              <div className="fp__txt">
                <dl data-r>
                  <div><dt>Category</dt><dd>{pump.category}</dd></div>
                  <div><dt>Services</dt><dd>{pump.services}</dd></div>
                  <div><dt>Year</dt><Year y={pump.year} /></div>
                </dl>
                <p className="fp__desc" data-r>Кастомна e-commerce платформа, <em>що спрощує покупки для клієнтів і щоденне управління магазином для бізнесу.</em></p>
                <Link className="lnk" href={`/projects/${pump.slug}`} data-r>Переглянути кейс <Arrow /></Link>
              </div>
              <Link href={`/projects/${pump.slug}`} aria-label={`Кейс ${pump.name}`}>
                <ProjectImage p={pump} sizes="(max-width: 767px) 100vw, 70vw" />
              </Link>
            </div>
          </article>

          <article className="fp fp--b" data-cats={clave.cats.join(" ")}>
            <div className="fp__grid">
              <Link href={`/projects/${clave.slug}`} aria-label={`Кейс ${clave.name}`}>
                <ProjectImage p={clave} />
              </Link>
              <div className="fp__txt">
                <span className="small dim" data-r>[ 02 / 03 ]</span>
                <Lines className="d100" lines={[{ t: "Clave" }, { t: "Shop", dim: true }]} />
                <p className="fp__desc" data-r>{clave.lead} <em>{clave.rest}</em></p>
                <dl className="fp__dl" data-r>
                  <div><dt>Category</dt><dd>{clave.category}</dd></div>
                  <div><dt>Year</dt><Year y={clave.year} /></div>
                  <div className="span2"><dt>Services</dt><dd>{clave.services}</dd></div>
                </dl>
                <Link className="lnk" href={`/projects/${clave.slug}`} data-r>Переглянути кейс <Arrow /></Link>
              </div>
            </div>
          </article>

          <article className="fp fp--c" data-cats={softh.cats.join(" ")}>
            <div className="fp__panel">
              <Illustration name="vortex" fit="cover" className="fx" brightness={0.8} />
              <div className="fp__txt">
                <div>
                  <span className="small dim" data-r>[ 03 / 03 ]</span>
                  <Lines className="d100 fp__name" lines={[{ t: "Softh" }, { t: "CTO", dim: true }]} />
                </div>
                <div className="fp__col">
                  <p className="fp__desc" data-r>{softh.lead} <em>{softh.rest}</em></p>
                  <dl className="fp__dl" data-r>
                    <div><dt>Category</dt><dd>{softh.category}</dd></div>
                    <div><dt>Year</dt><Year y={softh.year} /></div>
                    <div className="span2"><dt>Services</dt><dd>{softh.services}</dd></div>
                  </dl>
                  <Link className="lnk" href={`/projects/${softh.slug}`} data-r>Переглянути кейс <Arrow /></Link>
                </div>
              </div>
              <Link href={`/projects/${softh.slug}`} aria-label={`Кейс ${softh.name}`} className="fp__mlink">
                <ProjectImage p={softh} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="sec pj-cta">
        <Banner form="infinity">
          <Lines className="d100 pj-cta__h" lines={[{ t: "Роботи говорять" }, { t: "краще за", dim: true }, { t: "обіцянки.", dim: true }]} />
          <div className="pj-cta__b" data-r>
            <p className="dim">За кожним кейсом — задача, рішення та система, створена навколо реального бізнесу.</p>
            <RequestButton variant="link">Обговорити свій проєкт</RequestButton>
          </div>
        </Banner>
      </section>
    </>
  );
}
