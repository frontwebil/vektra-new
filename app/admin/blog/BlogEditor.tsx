"use client";

import { useRef, useState, type ReactNode } from "react";
import { ILLUSTRATIONS, type IllustrationName } from "@/lib/illustrations";
import {
  BLOG_CATEGORIES,
  linesToText,
  readMinutes,
  textToLines,
  type BlogBlock,
  type BlogBlockType,
  type BlogDoc,
  type HeadLine,
  type OptionalPart,
} from "@/lib/blog-docs";
import { savePostAction } from "./actions";
import { SaveState, SubmitButton } from "../projects/SubmitButton";
import { Check, Field, ImageField, Row, Select, UploadButton } from "../projects/fields";

type Props = { slug: string; published: boolean; initial: BlogDoc; disabled?: boolean };

const ILLUSTRATION_OPTIONS = (Object.keys(ILLUSTRATIONS) as IllustrationName[]).map((n) => ({ value: n, label: n }));

const BLOCKS: { type: BlogBlockType; label: string; hint: string }[] = [
  { type: "section", label: "Розділ", hint: "Нумерований заголовок розділу. Потрапляє в зміст." },
  { type: "text", label: "Текст", hint: "Абзаци. Порожній рядок — новий абзац." },
  { type: "subheading", label: "Підзаголовок", hint: "Менший заголовок усередині розділу." },
  { type: "list", label: "Список", hint: "Пункти списку, кожен з нового рядка." },
  { type: "highlight", label: "Виділення", hint: "Ключова думка в рамці з білою лінією." },
  { type: "insight", label: "Insight →", hint: "Порада зі стрілкою між лініями." },
  { type: "image", label: "Фото", hint: "Зображення в колонці тексту." },
  { type: "illustration", label: "Ілюстрація", hint: "Анімована форма з бібліотеки сайту." },
  { type: "quote", label: "Велика цитата", hint: "Фраза великим шрифтом на всю ширину. Розриває колонку тексту." },
];
const blockMeta = (t: BlogBlockType) => BLOCKS.find((b) => b.type === t)!;

function createBlock(type: BlogBlockType): BlogBlock {
  switch (type) {
    case "section":
      return { type, title: "" };
    case "list":
      return { type, items: [] };
    case "image":
      return { type, src: "", alt: "" };
    case "illustration":
      return { type, name: "wave" };
    case "quote":
      return { type, lines: [{ t: "" }] };
    default:
      return { type, text: "" };
  }
}

const PART_TITLES: Record<OptionalPart, string> = {
  toc: "Зміст статті зліва",
  note: "Бокова нотатка справа",
  cta: "Банер із заявкою після статті",
  related: "Схожі статті внизу",
};

const INLINE_HINT = "**жирний**, [текст посилання](https://…)";

export function BlogEditor({ slug: initialSlug, published: initialPublished, initial, disabled }: Props) {
  const [doc, setDoc] = useState<BlogDoc>(initial);
  const [slug, setSlug] = useState(initialSlug);
  const [published, setPublished] = useState(initialPublished);
  const [dirty, setDirty] = useState(false);
  const hidden = doc.hidden ?? [];

  const set = (patch: Partial<BlogDoc>) => {
    setDirty(true);
    setDoc((d) => ({ ...d, ...patch }));
  };
  const togglePart = (k: OptionalPart, on: boolean) => {
    const next = on ? hidden.filter((x) => x !== k) : [...hidden, k];
    set({ hidden: next.length ? next : undefined });
  };
  const sections = doc.blocks.filter((b) => b.type === "section").length;

  return (
    <form action={savePostAction} className="admin-service-form pe" onSubmit={() => setDirty(false)}>
      <input type="hidden" name="originalSlug" value={initialSlug} />
      <input type="hidden" name="content" value={JSON.stringify(doc)} />

      <div className="pe-bar">
        <Check label="Опубліковано на сайті" checked={published} onChange={(v) => { setPublished(v); setDirty(true); }} />
        {published && <input type="hidden" name="published" value="on" />}
        <SaveState dirty={dirty} />
        <SubmitButton disabled={disabled} pending="Зберігаю…">Зберегти статтю</SubmitButton>
      </div>

      <Group title="Основне" note="Картка в каталозі /blog і пошуковики" open>
        <Field label="Заголовок" value={doc.title} onChange={(title) => set({ title })} hint="Одним рядком: картка, вкладка браузера, Google" />
        <label className="admin-editor-field">
          Адреса сторінки
          <small>/blog/<b>{slug || "…"}</b> — малі латинські літери, цифри й дефіси</small>
          <input name="slug" value={slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" required onChange={(e) => { setSlug(e.target.value.toLowerCase()); setDirty(true); }} />
        </label>
        <Row>
          <Select label="Категорія" value={doc.category} options={BLOG_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))} onChange={(category) => set({ category })} />
          <label className="admin-editor-field">
            Дата публікації
            <input type="date" value={doc.date} required onChange={(e) => set({ date: e.target.value })} />
          </label>
          <div className="admin-editor-field">
            Час читання
            <small>Рахується сам за обсягом тексту</small>
            <b className="be-read">{readMinutes(doc)} хв</b>
          </div>
        </Row>
        <Field label="Короткий опис" multiline rows={2} value={doc.excerpt} onChange={(excerpt) => set({ excerpt })} hint="1–2 речення: картка в каталозі й опис у Google" />
        <Check label="Головна стаття в каталозі (великий блок угорі)" checked={Boolean(doc.featured)} onChange={(v) => set({ featured: v || undefined })} />
      </Group>

      <Group title="Перший екран">
        <HeadlineField label="Великий заголовок" value={doc.headline} onChange={(headline) => set({ headline })} />
        <Field label="Вступ" multiline value={doc.lead} onChange={(lead) => set({ lead })} hint="Абзац праворуч під заголовком" />
        <Select<IllustrationName>
          label="Ілюстрація обкладинки"
          hint="Показується під першим екраном і в картці, якщо немає фото"
          value={doc.cover.illustration}
          options={ILLUSTRATION_OPTIONS}
          onChange={(illustration) => set({ cover: { ...doc.cover, illustration } })}
        />
        <ImageField
          label="Фото обкладинки (необовʼязково)"
          hint="Замінює ілюстрацію. Горизонтальне, від 1600 px завширшки"
          value={doc.cover.image}
          onChange={(image) => set({ cover: { ...doc.cover, image: image || undefined } })}
        />
        {doc.cover.image && <Field label="Опис фото (alt)" value={doc.cover.imageAlt ?? ""} onChange={(v) => set({ cover: { ...doc.cover, imageAlt: v || undefined } })} />}
      </Group>

      <Group title="Текст статті" note={`${doc.blocks.length} блоків · ${sections} розділів`} open>
        <BlocksEditor blocks={doc.blocks} onChange={(blocks) => set({ blocks })} />
      </Group>

      <Group title="Додаткові блоки сторінки" note="Вмикайте лише те, що потрібно цій статті">
        <div className="pe-checks">
          {(Object.keys(PART_TITLES) as OptionalPart[]).map((k) => (
            <Check key={k} label={PART_TITLES[k]} checked={!hidden.includes(k)} onChange={(v) => togglePart(k, v)} />
          ))}
        </div>
        {!hidden.includes("note") && (
          <fieldset className="admin-process-step">
            <legend>Бокова нотатка</legend>
            <Field label="Підпис" value={doc.note.label} onChange={(label) => set({ note: { ...doc.note, label } })} />
            <Field label="Текст" multiline value={doc.note.text} onChange={(text) => set({ note: { ...doc.note, text } })} hint="Порожній рядок — новий абзац" />
          </fieldset>
        )}
        {!hidden.includes("cta") && (
          <fieldset className="admin-process-step">
            <legend>Банер із заявкою</legend>
            <HeadlineField label="Заголовок банера" value={doc.cta.headline} onChange={(headline) => set({ cta: { ...doc.cta, headline } })} />
            <Field label="Текст" multiline rows={2} value={doc.cta.text} onChange={(text) => set({ cta: { ...doc.cta, text } })} />
            <Field label="Кнопка" value={doc.cta.button} onChange={(button) => set({ cta: { ...doc.cta, button } })} />
          </fieldset>
        )}
      </Group>

      <Group title="SEO" note="Необовʼязково: за замовчуванням беруться заголовок і короткий опис">
        <Field label="Title для Google" placeholder={doc.title} value={doc.seo?.title ?? ""} onChange={(v) => set({ seo: { ...doc.seo, title: v || undefined } })} hint="До ~60 символів" />
        <Field label="Description для Google" multiline rows={2} placeholder={doc.excerpt} value={doc.seo?.description ?? ""} onChange={(v) => set({ seo: { ...doc.seo, description: v || undefined } })} hint="До ~160 символів" />
      </Group>

      <div className="pe-bar pe-bar--end">
        <SaveState dirty={dirty} />
        <SubmitButton disabled={disabled} pending="Зберігаю…">Зберегти статтю</SubmitButton>
      </div>
    </form>
  );
}

function Group({ title, note, open, children }: { title: string; note?: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="admin-editor-section pe-group" open={open}>
      <summary><h3>{title}</h3>{note && <small>{note}</small>}</summary>
      <div className="pe-group__body">{children}</div>
    </details>
  );
}

/** Заголовок з кількох рядків: кожен рядок окремо, *зірочки* — сірий тон. */
function HeadlineField({ label, value, onChange }: { label: string; value: HeadLine[]; onChange: (v: HeadLine[]) => void }) {
  const [raw, setRaw] = useState(() => linesToText(value));
  return (
    <Field
      label={label}
      hint="Кожен рядок з нового рядка. Рядок у *зірочках* буде сірим"
      multiline
      rows={3}
      value={raw}
      onChange={(v) => {
        setRaw(v);
        onChange(textToLines(v));
      }}
    />
  );
}

/* ---------- Конструктор блоків -------------------------------------------- */

let uid = 0;
const nextId = () => ++uid;

function BlocksEditor({ blocks, onChange }: { blocks: BlogBlock[]; onChange: (v: BlogBlock[]) => void }) {
  // Стабільні ключі, щоб після перестановки поля не плутались
  const ids = useRef<number[]>(blocks.map(nextId));
  const apply = (next: BlogBlock[], nextIds: number[]) => {
    ids.current = nextIds;
    onChange(next);
  };
  const insert = (at: number, type: BlogBlockType) => {
    const next = [...blocks];
    const k = [...ids.current];
    next.splice(at, 0, createBlock(type));
    k.splice(at, 0, nextId());
    apply(next, k);
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    const k = [...ids.current];
    [next[i], next[j]] = [next[j], next[i]];
    [k[i], k[j]] = [k[j], k[i]];
    apply(next, k);
  };
  const remove = (i: number) => apply(blocks.filter((_, j) => j !== i), ids.current.filter((_, j) => j !== i));
  const update = (i: number, b: BlogBlock) => onChange(blocks.map((x, j) => (j === i ? b : x)));

  let sectionNo = 0;
  return (
    <div className="be-blocks">
      {blocks.length === 0 && <p className="be-empty">Стаття порожня. Додайте перший блок — зазвичай це «Розділ».</p>}
      {blocks.map((b, i) => {
        const meta = blockMeta(b.type);
        const n = b.type === "section" ? String(++sectionNo).padStart(2, "0") : null;
        return (
          <fieldset className={`admin-process-step pe-item be-block be-block--${b.type}`} key={ids.current[i] ?? -i - 1}>
            <legend>{n ? `${n} · ${meta.label}` : meta.label}</legend>
            <span className="pe-item__tools pe-mini">
              <button type="button" title="Вище" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" title="Нижче" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button type="button" title="Видалити блок" onClick={() => remove(i)}>✕</button>
            </span>
            <BlockFields b={b} set={(v) => update(i, v)} />
            <AddMenu compact onAdd={(t) => insert(i + 1, t)} />
          </fieldset>
        );
      })}
      <AddMenu onAdd={(t) => insert(blocks.length, t)} />
    </div>
  );
}

function AddMenu({ onAdd, compact }: { onAdd: (t: BlogBlockType) => void; compact?: boolean }) {
  if (compact) {
    return (
      <select className="be-insert" value="" onChange={(e) => e.target.value && onAdd(e.target.value as BlogBlockType)} aria-label="Вставити блок нижче">
        <option value="">+ Вставити блок нижче…</option>
        {BLOCKS.map((b) => <option key={b.type} value={b.type}>{b.label}</option>)}
      </select>
    );
  }
  return (
    <div className="be-add">
      <span>Додати в кінець:</span>
      {BLOCKS.map((b) => (
        <button key={b.type} type="button" className="admin-add-item" title={b.hint} onClick={() => onAdd(b.type)}>+ {b.label}</button>
      ))}
    </div>
  );
}

function BlockFields({ b, set }: { b: BlogBlock; set: (b: BlogBlock) => void }) {
  const hint = blockMeta(b.type).hint;
  switch (b.type) {
    case "section":
      return <Field label="Назва розділу" hint={hint} value={b.title} onChange={(title) => set({ ...b, title })} />;
    case "text":
      return <Field label="Текст" hint={`${hint} ${INLINE_HINT}`} multiline rows={6} value={b.text} onChange={(text) => set({ ...b, text })} />;
    case "subheading":
      return <Field label="Підзаголовок" value={b.text} onChange={(text) => set({ ...b, text })} />;
    case "highlight":
    case "insight":
      return <Field label="Текст" hint={hint} multiline rows={3} value={b.text} onChange={(text) => set({ ...b, text })} />;
    case "list":
      return (
        <>
          <ListText value={b.items} onChange={(items) => set({ ...b, items })} />
          <Check label="Нумерований список" checked={Boolean(b.ordered)} onChange={(ordered) => set({ ...b, ordered: ordered || undefined })} />
        </>
      );
    case "image":
      return (
        <>
          <div className="admin-editor-field">
            Фото
            <div className="pe-media__body">
              <div className="pe-preview">{b.src ? <img src={b.src} alt="" /> : <span>Немає фото</span>}</div>
              <div className="pe-media__fields">
                <UploadButton accept="image/*" label="Завантажити фото" onDone={(u) => set({ ...b, src: u.url })} />
                <Field label="Або посилання" value={b.src} placeholder="https://…" onChange={(src) => set({ ...b, src })} />
              </div>
            </div>
          </div>
          <Row>
            <Field label="Опис фото (alt)" value={b.alt} onChange={(alt) => set({ ...b, alt })} />
            <Field label="Підпис під фото" value={b.caption ?? ""} onChange={(v) => set({ ...b, caption: v || undefined })} />
          </Row>
        </>
      );
    case "illustration":
      return (
        <Row>
          <Select<IllustrationName> label="Форма" value={b.name} options={ILLUSTRATION_OPTIONS} onChange={(name) => set({ ...b, name })} />
          <Field label="Підпис" value={b.caption ?? ""} onChange={(v) => set({ ...b, caption: v || undefined })} />
        </Row>
      );
    case "quote":
      return <HeadlineField label="Цитата" value={b.lines} onChange={(lines) => set({ ...b, lines })} />;
  }
}

/** Пункти списку: кожен з нового рядка. Порожні рядки під час набору не губляться. */
function ListText({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [raw, setRaw] = useState(() => value.join("\n"));
  return (
    <Field
      label="Пункти"
      hint={`Кожен пункт з нового рядка. ${INLINE_HINT}`}
      multiline
      rows={Math.max(3, value.length + 1)}
      value={raw}
      onChange={(v) => {
        setRaw(v);
        onChange(v.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}
