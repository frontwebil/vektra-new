import type { Metadata } from "next";
import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { CatFilter } from "@/components/interactive";
import { Lines } from "@/components/sections";
import { Arrow, Label, Star } from "@/components/ui";
import { ARTICLES, ARTICLE_SLUG } from "@/lib/content";

export const metadata: Metadata = {
  title: "Блог",
  description: "Пишемо про дизайн, розробку, брендинг і digital-продукти.",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "design", label: "Design" },
  { key: "development", label: "Development" },
  { key: "branding", label: "Branding" },
  { key: "digital", label: "Digital" },
  { key: "business", label: "Business" },
];

export default function BlogPage() {
  return (
    <>
      <section className="sec g4 bl-hero" data-hero>
        <Illustration name="web" fit="cover" className="fx" brightness={0.7} />
        <Star className="star--a" style={{ left: "104rem", top: "21rem" }} />
        <Label className="bl-hero__label">(01) / Insights</Label>
        <Lines as="h1" className="d120 bl-hero__h" lines={[{ t: "Думки," }, { t: "досвід", dim: true }, { t: "і практика." }]} />
        <p className="bl-hero__p body18" data-r>Пишемо про дизайн, розробку, брендинг і digital-продукти — без теорії заради теорії.</p>
      </section>

      <section className="sec" id="articles">
        <div className="wrap">
          <Link className="bl-feat" href={`/blog/${ARTICLE_SLUG}`} data-cats="design">
            <div className="bl-feat__g">
              <div className="bl-feat__v">
                <Illustration name="lattice" className="fx bl-feat__il" density={1.3} brightness={0.8} />
                <Lines className="h1 bl-feat__t" lines={[{ t: "Як зрозуміти," }, { t: "що сайту потрібен", dim: true }, { t: "редизайн" }]} />
              </div>
              <div className="bl-feat__side">
                <div className="bl-meta" data-r><b>UX/UI</b><span>12 Oct 2026</span><span>8 min read</span></div>
                <div className="bl-feat__b" data-r>
                  <p>7 сигналів, які показують, що дизайн уже не підтримує потреби користувачів і задачі бізнесу.</p>
                  <span className="lnk">Читати статтю <Arrow /></span>
                </div>
              </div>
            </div>
          </Link>

          <div className="bl-fbar">
            <Label>(02) / Articles</Label>
            <CatFilter scope="#articles" label="Категорії статей" options={FILTERS} emptyText="У цій категорії матеріалів поки немає." />
          </div>

          <div className="bl-g">
            {ARTICLES.map((a) => (
              <Link key={a.title} className={`art art--${a.layout}`} href={`/blog/${a.slug}`} data-cats={a.key} data-r>
                {a.form && <div className="art__v"><Illustration name={a.form} className="fx" density={a.layout === "big" ? 1.2 : 1} interactive={false} zoom={0.9} /></div>}
                <div className="art__b">
                  <div className="bl-meta"><b>{a.category}</b><span>{a.date}</span><span>{a.read}</span></div>
                  <h3 className={a.layout === "c" ? "h3" : "h2"}>{a.title}</h3>
                  {a.text && <p>{a.text}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec g4 bl-cta">
        <Illustration name="vortex" fit="cover" className="fx" brightness={0.65} />
        <div className="bl-cta__b" data-r><RequestButton>Обговорити проєкт</RequestButton></div>
        <Lines className="d120 bl-cta__h" lines={[{ t: "Є тема," }, { t: "яку варто", dim: true }, { t: "обговорити?" }]} />
      </section>
    </>
  );
}
