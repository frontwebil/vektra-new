import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { DotMatrix, ServicesPanel } from "@/components/interactive";
import { Banner, Lines, SectionCta, SectionFaq, SectionHead, SectionProcess, SectionReviews, SelectedWork } from "@/components/sections";
import { Chars, Dots, Mark, Star, TextLink } from "@/components/ui";
import { APPROACH, STATS } from "@/lib/content";
import { getProjects } from "@/lib/projects";

export default async function HomePage() {
  const projects = await getProjects();
  return (
    <>
      <section className="sec g4 hh" data-hero>
        <Illustration name="hero" fit="cover" className="fx hh__il" density={1} brightness={0.9} />
        <Star className="star--a" style={{ left: "37.5rem", top: "37.5rem" }} />
        <Star className="star--b" style={{ left: "117.5rem", top: "63.5rem" }} />
        <ul className="hh__list" data-r>
          {["Branding", "Web Design", "Web Development", "QA & Launch", "Automation & Integrations"].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="hh__side">
          <p className="body18" data-r>
            Поєднуємо стратегію, брендинг, UX/UI дизайн, веброзробку та автоматизацію, <span className="dim">щоб перетворювати бізнес-задачі на цифрові продукти, які залучають клієнтів і підтримують зростання.</span>
          </p>
          <div data-r><RequestButton>Обговорити проєкт</RequestButton></div>
        </div>
        <h1 className="hh__t" aria-label="Vektra Agency">
          <span className="hh__w" data-chars><Chars text="Vektra" /><Mark className="hh__m" /></span>
          <span className="hh__w" data-chars><Chars text="Agency" /></span>
        </h1>
      </section>

      <section className="sec g4 ha">
        <div className="wrap">
          <div className="ha__row">
            <p className="ha__lab" data-r><Star className="star--in" />Не просто<br />створюємо сайти.</p>
            <h2 className="h2 ha__h" data-words>
              Digital-агенція повного циклу, яка допомагає бізнесу запускати, <span className="dim">оновлювати та масштабувати цифрові продукти.</span>
            </h2>
          </div>
          <div className="ha__row ha__row--2">
            <span />
            <p className="dim ha__p" data-r>Ми дивимося на сайт, бренд або сервіс як на частину більшої системи. Досліджуємо контекст, визначаємо задачі, вибудовуємо користувацьку логіку й лише після цього переходимо до дизайну та технологій.</p>
            <div data-r className="ha__go"><TextLink href="/about">Більше про Vektra</TextLink></div>
          </div>
          <div className="stats">
            {STATS.map((s, i) => (
              <article className="stat" key={s.index} data-r>
                <div className="stat__top">
                  <span className="idx">[ {s.index} ]</span>
                  <Dots on={i + 1} />
                </div>
                <div className="stat__body">
                  <div className="stat__v">
                    <b><span data-count={s.value}>{s.value}</span>{s.suffix}</b>
                    <span>{s.title}</span>
                  </div>
                  <p className="dim">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec g2 hs">
        <div className="wrap">
          <div className="hs__head">
            <span />
            <Lines lines={[{ t: "Від першої ідеї" }, { t: "до робочого", dim: true }, { t: "цифрового продукту" }]} className="h2" />
          </div>
          <ServicesPanel />
        </div>
      </section>

      <section className="sec g4 hp">
        <div className="wrap">
          <SectionHead left="Our approach" right="Why Vektra" className="sh--c" lines={[{ t: "Дивимося" }, { t: "ширше за межі", dim: true }, { t: "окремого макета" }]} />
          <div className="ap-g">
            {APPROACH.map((a) => (
              <article className="ap-c" key={a.a} data-r data-hot>
                <DotMatrix pattern={a.pattern} />
                <h3 className="h3">{a.a}<br /><span className="dim">{a.b}</span></h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
          <div className="hp__s">
            <p className="body18" data-r>Дивимося на продукт ширше: враховуємо не лише те, як він виглядає сьогодні, <span className="dim">а й те, як працюватиме та розвиватиметься завтра.</span></p>
            <div data-r><RequestButton>Почати проєкт</RequestButton></div>
          </div>
          <Star style={{ left: "33rem", bottom: "8rem" }} />
        </div>
      </section>

      <section className="sec g2 hw">
        <div className="wrap"><SelectedWork projects={projects} /></div>
        <Banner>
          <Lines className="h2 hw__h" lines={[{ t: "Кожен проєкт" }, { t: "має свій напрямок.", dim: true, cls: "hw__i1" }, { t: "Ми допомагаємо" }, { t: "його знайти", dim: true, cls: "hw__i2" }]} />
          <div className="hw__go" data-r><TextLink href="/projects">Переглянути проєкти</TextLink></div>
        </Banner>
      </section>

      <SectionReviews />
      <SectionProcess title={[{ t: "Зрозумілий процес" }, { t: "від задачі", dim: true, cls: "sh__i1" }, { t: "до запуску", cls: "sh__i2" }]} />
      <SectionFaq />
      <SectionCta />
    </>
  );
}
