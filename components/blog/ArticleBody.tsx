import { Fragment, type ReactNode } from "react";
import { Illustration } from "@/components/Illustration";
import { Lines } from "@/components/sections";
import type { BlogBlock, BlogDoc } from "@/lib/blog-docs";
import { isShown } from "@/lib/blog-docs";
import { Inline, Paragraphs } from "./Inline";

type Section = { id: string; n: string; title: string };

/**
 * Тіло статті з блоків.
 * «Розділ» відкриває нумерований <section> і пункт змісту.
 * «Велика цитата» закриває поточну колонку й виходить на всю ширину, після неї колонка продовжується.
 */
export function ArticleBody({ doc }: { doc: BlogDoc }) {
  const sections: Section[] = [];
  doc.blocks.forEach((b) => {
    if (b.type === "section") {
      const n = String(sections.length + 1).padStart(2, "0");
      sections.push({ id: `s${sections.length + 1}`, n, title: b.title });
    }
  });

  // Ділимо на шматки між великими цитатами
  const chunks: { blocks: BlogBlock[]; quote?: Extract<BlogBlock, { type: "quote" }> }[] = [{ blocks: [] }];
  for (const b of doc.blocks) {
    if (b.type === "quote") {
      chunks[chunks.length - 1].quote = b;
      chunks.push({ blocks: [] });
    } else {
      chunks[chunks.length - 1].blocks.push(b);
    }
  }

  const toc = isShown(doc, "toc") && sections.length > 1;
  const note = isShown(doc, "note") && doc.note.text.trim();
  let sectionNo = 0;

  return (
    <>
      {chunks.map((chunk, ci) => {
        const groups = groupSections(chunk.blocks);
        return (
          <Fragment key={ci}>
            {chunk.blocks.length > 0 && (
              <div className={`wrap ar-body ${ci > 0 ? "ar-body--cont" : ""}`}>
                {toc ? <Toc sections={sections} label={ci === 0 ? "Зміст статті" : "Зміст статті, продовження"} /> : <div />}
                <div className="ar-col prose">
                  {groups.map((g, gi) => {
                    if (!g.section) return <div key={gi} className="sect sect--intro">{g.blocks.map((b, bi) => <Block key={bi} b={b} />)}</div>;
                    const s = sections[sectionNo++];
                    return (
                      <section className="sect" id={s.id} key={gi}>
                        <span className="sect__n">{s.n}</span>
                        <h2 data-r>{s.title}</h2>
                        {g.blocks.map((b, bi) => <Block key={bi} b={b} />)}
                      </section>
                    );
                  })}
                </div>
                {ci === 0 && note ? (
                  <aside className="ar-note">
                    <p className="label">{doc.note.label}</p>
                    <Paragraphs text={doc.note.text} />
                  </aside>
                ) : <div />}
              </div>
            )}
            {chunk.quote && chunk.quote.lines.length > 0 && (
              <div className="sec g4 ar-quote">
                <span className="hr hr--full hr--top" data-hr />
                <span className="hr hr--full hr--bot" data-hr />
                <Lines as="blockquote" className="wrap d72" lines={chunk.quote.lines} />
              </div>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

function groupSections(blocks: BlogBlock[]) {
  const groups: { section: boolean; blocks: BlogBlock[] }[] = [];
  for (const b of blocks) {
    if (b.type === "section") groups.push({ section: true, blocks: [] });
    else {
      if (!groups.length) groups.push({ section: false, blocks: [] });
      groups[groups.length - 1].blocks.push(b);
    }
  }
  return groups;
}

function Toc({ sections, label }: { sections: Section[]; label: string }) {
  return (
    <nav className="ar-toc" aria-label={label}>
      <p className="label">{sections.length} {plural(sections.length)}</p>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`}><span>{s.n}</span>{s.title}</a>
      ))}
    </nav>
  );
}

function plural(n: number) {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return "розділ";
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return "розділи";
  return "розділів";
}

function Block({ b }: { b: BlogBlock }): ReactNode {
  switch (b.type) {
    case "text":
      return <Paragraphs text={b.text} />;
    case "subheading":
      return b.text ? <h3>{b.text}</h3> : null;
    case "list": {
      if (!b.items.length) return null;
      const items = b.items.map((it, i) => <li key={i}><Inline text={it} /></li>);
      return b.ordered ? <ol className="prose-ol">{items}</ol> : <ul>{items}</ul>;
    }
    case "highlight":
      return b.text ? <div className="hl" data-r><Inline text={b.text} /></div> : null;
    case "insight":
      return b.text ? <div className="insight" data-r><b>→</b><p><Inline text={b.text} /></p></div> : null;
    case "image":
      return b.src ? (
        <figure className="fig fig--photo" data-r>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} loading="lazy" decoding="async" />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      ) : null;
    case "illustration":
      return (
        <figure className="fig" data-r>
          <div className="fig__v"><Illustration name={b.name} className="fx" zoom={0.92} interactive={false} /></div>
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}
