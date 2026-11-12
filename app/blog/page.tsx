import type { Metadata } from "next";
import Link from "next/link";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Lines } from "@/components/sections";
import { Arrow, Label, Star } from "@/components/ui";
import { BLOG_CATEGORIES, categoryLabel, formatDate, isCategory, readMinutes, type BlogRecord } from "@/lib/blog-docs";
import { getPosts } from "@/lib/blog";
import { pageMeta } from "@/lib/site";
import "@/styles/blog.css";

// Canonical завжди /blog: відфільтровані списки не конкурують з основним у пошуку
export const metadata: Metadata = pageMeta({
  title: "Блог",
  description: "Пишемо про дизайн, розробку, брендинг і digital-продукти.",
  path: "/blog",
});

type Search = { category?: string };

function articlesWord(n: number) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return "стаття";
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return "статті";
  return "статей";
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { category: raw } = await searchParams;
  const active = isCategory(raw) ? raw : null;
  const posts = await getPosts();

  const counts = new Map<string, number>();
  posts.forEach((p) => counts.set(p.doc.category, (counts.get(p.doc.category) ?? 0) + 1));
  const tabs = BLOG_CATEGORIES.filter((c) => counts.has(c.key));

  // Головна стаття — лише в загальному списку
  const featured = active ? null : posts.find((p) => p.doc.featured) ?? posts[0] ?? null;
  const list = active ? posts.filter((p) => p.doc.category === active) : posts.filter((p) => p !== featured);

  return (
    <>
      <section className="sec g4 bl-hero" data-hero>
        <Illustration name="web" fit="cover" className="fx bl-hero__il" brightness={0.7} />
        <Star className="star--a" style={{ left: "104rem", top: "21rem" }} />
        <Label className="bl-hero__label">(01) / Insights</Label>
        <Lines as="h1" className="d120 bl-hero__h" lines={[{ t: "Думки," }, { t: "досвід", dim: true }, { t: "і практика." }]} />
        <p className="bl-hero__p body18" data-r>Пишемо про дизайн, розробку, брендинг і digital-продукти — без теорії заради теорії.</p>
      </section>

      <section className="sec bl" id="articles">
        <div className="wrap">
          {featured && <Featured post={featured} />}

          <div className="bl-bar">
            <div className="bl-bar__head">
              <Label>(02) / Articles</Label>
              <span className="bl-bar__count">{(active ? list.length : posts.length)} {articlesWord(active ? list.length : posts.length)}</span>
            </div>
            {tabs.length > 1 && (
              <nav className="bl-tabs" aria-label="Категорії статей">
                <Link href="/blog" scroll={false} className={`bl-tab ${active ? "" : "is-on"}`} aria-current={active ? undefined : "page"}>
                  Усі<sup>{posts.length}</sup>
                </Link>
                {tabs.map((c) => (
                  <Link
                    key={c.key}
                    href={`/blog?category=${c.key}`}
                    scroll={false}
                    className={`bl-tab ${active === c.key ? "is-on" : ""}`}
                    aria-current={active === c.key ? "page" : undefined}
                  >
                    {c.label}<sup>{counts.get(c.key)}</sup>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {list.length > 0 ? (
            <div className="bl-list">
              {list.map((p) => <Card key={p.slug} post={p} />)}
            </div>
          ) : featured ? null : (
            <div className="bl-empty">
              <p>{posts.length ? "У цій категорії статей поки немає." : "Перші статті вже готуються."}</p>
              {active && <Link className="lnk" href="/blog" scroll={false}>Усі статті <Arrow /></Link>}
            </div>
          )}
        </div>
      </section>

      <section className="sec g4 bl-cta">
        <Illustration name="vortex" fit="cover" className="fx bl-cta__il" brightness={0.65} />
        <div className="bl-cta__b" data-r><RequestButton>Обговорити проєкт</RequestButton></div>
        <Lines className="d120 bl-cta__h" lines={[{ t: "Є тема," }, { t: "яку варто", dim: true }, { t: "обговорити?" }]} />
      </section>
    </>
  );
}

function Meta({ post }: { post: BlogRecord }) {
  return (
    <div className="bl-meta">
      <b>{categoryLabel(post.doc.category)}</b>
      <span><time dateTime={post.doc.date}>{formatDate(post.doc.date)}</time></span>
      <span>{readMinutes(post.doc)} min read</span>
    </div>
  );
}

function Visual({ post, className, density }: { post: BlogRecord; className: string; density: number }) {
  const { cover } = post.doc;
  if (cover.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="bl-img" src={cover.image} alt={cover.imageAlt ?? ""} loading="lazy" decoding="async" />;
  }
  return <Illustration name={cover.illustration} className={`fx ${className}`} density={density} brightness={0.8} interactive={false} />;
}

function Featured({ post }: { post: BlogRecord }) {
  const lines = post.doc.headline.length ? post.doc.headline : [{ t: post.doc.title }];
  return (
    <Link className="bl-feat" href={`/blog/${post.slug}`}>
      <div className="bl-feat__g">
        <div className="bl-feat__v">
          <Visual post={post} className="bl-feat__il" density={1.3} />
          <Lines className="h1 bl-feat__t" lines={lines} />
        </div>
        <div className="bl-feat__side">
          <div data-r><Meta post={post} /></div>
          <div className="bl-feat__b" data-r>
            {post.doc.excerpt && <p>{post.doc.excerpt}</p>}
            <span className="lnk">Читати статтю <Arrow /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Card({ post }: { post: BlogRecord }) {
  return (
    <Link className="bl-card" href={`/blog/${post.slug}`} data-r>
      <div className="bl-card__v">
        <Visual post={post} className="bl-card__il" density={1} />
      </div>
      <div className="bl-card__b">
        <Meta post={post} />
        <h3 className="h3 bl-card__t">{post.doc.title}</h3>
        {post.doc.excerpt && <p className="bl-card__p">{post.doc.excerpt}</p>}
        <span className="lnk bl-card__go">Читати <Arrow /></span>
      </div>
    </Link>
  );
}
