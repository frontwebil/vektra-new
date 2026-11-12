import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Banner, Lines } from "@/components/sections";
import { Crumbs, Label } from "@/components/ui";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { Paragraphs } from "@/components/blog/Inline";
import { categoryLabel, formatDate, isShown, readMinutes } from "@/lib/blog-docs";
import { getPost, getPosts, relatedPosts } from "@/lib/blog";
import { pageMeta, SITE_NAME, SITE_URL } from "@/lib/site";
import "@/styles/blog.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const { doc } = post;
  return pageMeta({
    title: doc.seo?.title || doc.title,
    description: doc.seo?.description || doc.excerpt || doc.lead,
    path: `/blog/${slug}`,
    type: "article",
    ...(doc.cover.image ? { image: doc.cover.image, imageAlt: doc.cover.imageAlt } : {}),
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { doc } = post;
  const related = isShown(doc, "related") ? await relatedPosts(slug) : [];
  const category = categoryLabel(doc.category);
  const minutes = readMinutes(doc);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    description: doc.seo?.description || doc.excerpt || doc.lead,
    datePublished: doc.date,
    inLanguage: "uk-UA",
    articleSection: category,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    ...(doc.cover.image ? { image: doc.cover.image } : {}),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="pr" data-progress aria-hidden="true" />
      <section className="sec ar-hero" data-hero>
        <div className="wrap">
          <div className="cs-crumbs cs-crumbs--in">
            <Crumbs items={[{ label: "Головна", href: "/" }, { label: "Блог", href: "/blog" }, { label: category }]} />
          </div>
          <div className="ar-hero__top">
            <Label>{category}</Label>
            <div className="bl-meta" data-r>
              <span><time dateTime={doc.date}>{formatDate(doc.date)}</time></span>
              <span>{minutes} min read</span>
            </div>
          </div>
          <Lines as="h1" className="d100 ar-hero__h" lines={doc.headline.length ? doc.headline : [{ t: doc.title }]} />
          {doc.lead && (
            <div className="ar-hero__g">
              <p data-r>{doc.lead}</p>
            </div>
          )}
        </div>
        <div className="ar-visual sec g4">
          {doc.cover.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ar-visual__img" src={doc.cover.image} alt={doc.cover.imageAlt ?? ""} />
          ) : (
            <Illustration name={doc.cover.illustration} className="fx ar-visual__il" density={1.5} />
          )}
        </div>
      </section>

      <section className="sec ar-article" data-article>
        <ArticleBody doc={doc} />
      </section>

      {isShown(doc, "cta") && (
        <section className="sec ar-cta">
          <Banner form="sphere">
            <div className="ar-cta__in">
              <Lines className="h1" lines={doc.cta.headline} />
              <div className="ar-cta__r" data-r>
                {doc.cta.text && <div className="dim"><Paragraphs text={doc.cta.text} /></div>}
                <RequestButton>{doc.cta.button || "Обговорити проєкт"}</RequestButton>
              </div>
            </div>
          </Banner>
        </section>
      )}

      {related.length > 0 && (
        <section className="sec ar-rel">
          <div className="wrap">
            <Label>Related</Label>
            <div className="ar-rel__g">
              {related.map((r) => (
                <Link className="ar-rel__i" href={`/blog/${r.slug}`} key={r.slug} data-r>
                  <span className="small dim">{categoryLabel(r.doc.category)}</span>
                  <span className="h3">{r.doc.title}</span>
                  <span className="bl-meta"><span>{formatDate(r.doc.date)}</span><span>{readMinutes(r.doc)} min read</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
