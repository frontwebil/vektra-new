"use client";

import { useState, type ReactNode } from "react";
import type { CaseStudy, Media, SolutionLayout, SolutionModule, SystemCell } from "@/lib/cases";
import { ILLUSTRATIONS, type IllustrationName } from "@/lib/illustrations";
import { PROJECT_CATEGORIES, templateSection, type CaseDoc, type OptionalSection, type ProjectDoc } from "@/lib/project-docs";
import { saveProjectAction } from "./actions";
import { Check, CsvField, Field, ImageField, ItemsField, LinesField, ListEditor, MediaField, RichField, Row, Select } from "./fields";

type Props = { slug: string; published: boolean; initial: ProjectDoc; disabled?: boolean };

const LAYOUTS: { value: SolutionLayout; label: string; slots: number | "many"; names?: string[] }[] = [
  { value: "wide", label: "Широке медіа на всю ширину", slots: 1 },
  { value: "split", label: "50 / 50 — текст і медіа", slots: 1 },
  { value: "closeup", label: "Великий фрагмент, текст збоку", slots: 1 },
  { value: "cinematic", label: "Від краю до краю екрана", slots: 1 },
  { value: "pair", label: "Два екрани зі зсувом", slots: 2, names: ["Екран A", "Екран B"] },
  { value: "device", label: "Ноутбук + телефон", slots: 2, names: ["Ноутбук (desktop)", "Телефон (mobile)"] },
  { value: "gallery", label: "Галерея — будь-яка кількість фото / відео", slots: "many" },
];

const SECTION_TITLES: Record<OptionalSection, string> = {
  challenge: "Challenge — задачі",
  approach: "Approach — підхід",
  solution: "Solution — рішення (фото + заголовки)",
  system: "System — дизайн-система",
  experience: "Experience — продукт у використанні",
  technology: "Technology — технології",
  result: "Result — результат",
  testimonial: "Відгук клієнта",
};

type Metric = NonNullable<NonNullable<CaseStudy["result"]>["metrics"]>[number];

const ph = (label: string, ratio = "16/10"): Media => ({ type: "placeholder", label, ratio });

export function ProjectEditor({ slug: initialSlug, published: initialPublished, initial, disabled }: Props) {
  const [doc, setDoc] = useState<ProjectDoc>(initial);
  const [slug, setSlug] = useState(initialSlug);
  const [published, setPublished] = useState(initialPublished);
  const [dirty, setDirty] = useState(false);

  const card = doc.card;
  const c = doc.case;
  const hidden = c.hidden ?? [];

  const setCard = (patch: Partial<ProjectDoc["card"]>) => {
    setDirty(true);
    setDoc((d) => ({ ...d, card: { ...d.card, ...patch } }));
  };
  const setCase = (patch: Partial<CaseDoc>) => {
    setDirty(true);
    setDoc((d) => ({ ...d, case: { ...d.case, ...patch } }));
  };
  function section<K extends OptionalSection>(k: K) {
    return c[k] as NonNullable<CaseStudy[K]> | undefined;
  }
  function setSection<K extends OptionalSection>(k: K, patch: Partial<NonNullable<CaseStudy[K]>>) {
    setCase({ [k]: { ...(c[k] as object), ...patch } } as Partial<CaseDoc>);
  }
  function toggle(k: OptionalSection, on: boolean) {
    const nextHidden = on ? hidden.filter((x) => x !== k) : [...hidden, k];
    setCase({ hidden: nextHidden.length ? nextHidden : undefined, ...(on && !c[k] ? { [k]: templateSection(k) } : {}) });
  }

  return (
    <form action={saveProjectAction} className="admin-service-form pe" onSubmit={() => setDirty(false)}>
      <input type="hidden" name="originalSlug" value={initialSlug} />
      <input type="hidden" name="content" value={JSON.stringify(doc)} />

      <div className="pe-bar">
        <Check label="Опубліковано на сайті" checked={published} onChange={(v) => { setPublished(v); setDirty(true); }} />
        {published && <input type="hidden" name="published" value="on" />}
        <span>{dirty ? "Є незбережені зміни" : "Усе збережено"}</span>
        <button className="admin-button" type="submit" disabled={disabled}>Зберегти проєкт</button>
      </div>

      {/* ---------- Картка ---------- */}
      <Group title="Картка проєкту" note="Список /projects, головна, блок «Роботи» на послугах і Next project" open>
        <Row>
          <Field label="Назва" value={card.name} onChange={(name) => setCard({ name })} hint="Перше слово — світле, решта — сіра" />
          <Field label="Назва на головній" value={card.home} onChange={(home) => setCard({ home })} />
        </Row>
        <label className="admin-editor-field">
          Адреса сторінки
          <small>/projects/<b>{slug || "…"}</b> — малі латинські літери, цифри й дефіси</small>
          <input name="slug" value={slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" required onChange={(e) => { setSlug(e.target.value.toLowerCase()); setDirty(true); }} />
        </label>
        <ImageField label="Обкладинка" hint="Картка в списку проєктів і на головній" value={card.image} onChange={(image) => setCard({ image })} />
        <Field label="Alt обкладинки" value={card.alt} onChange={(alt) => setCard({ alt })} />
        <Field label="Опис — світла частина" value={card.lead} onChange={(lead) => setCard({ lead })} />
        <Field label="Опис — сіра частина" value={card.rest} onChange={(rest) => setCard({ rest })} multiline />
        <Row>
          <Field label="Category" value={card.category} onChange={(category) => setCard({ category })} />
          <Field label="Services" value={card.services} onChange={(services) => setCard({ services })} />
          <Field label="Year" value={card.year ?? ""} onChange={(year) => setCard({ year: year || null })} />
        </Row>
        <CsvField label="Теги" value={card.tags} onChange={(tags) => setCard({ tags })} />
        <div className="admin-editor-field">
          Фільтри на /projects
          <div className="pe-checks">
            {PROJECT_CATEGORIES.map((k) => (
              <Check key={k.key} label={k.label} checked={card.cats.includes(k.key)} onChange={(on) => setCard({ cats: on ? [...card.cats, k.key] : card.cats.filter((x) => x !== k.key) })} />
            ))}
          </div>
        </div>
      </Group>

      {/* ---------- Hero ---------- */}
      <Group title="Hero — перший екран кейсу">
        <LinesField label="Головна фраза" value={c.statement} onChange={(statement) => setCase({ statement })} />
        <Field label="Опис для пошуковиків і соцмереж" multiline value={c.description} onChange={(description) => setCase({ description })} />
        <Row>
          <Field label="Industry" value={c.meta.industry ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, industry: v || undefined } })} />
          <Field label="Year" value={c.meta.year ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, year: v || undefined } })} />
          <Field label="Market" value={c.meta.market ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, market: v || undefined } })} />
        </Row>
        <Row>
          <Field label="Platform" value={c.meta.platform ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, platform: v || undefined } })} />
          <Field label="Посилання на сайт" value={c.meta.website ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, website: v || undefined } })} />
        </Row>
        <CsvField label="Services" value={c.meta.services} onChange={(v) => setCase({ meta: { ...c.meta, services: v.length ? v : undefined } })} />
        <Row>
          <Field label="Team (Project info)" value={c.meta.team ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, team: v || undefined } })} />
          <Field label="Technology (Project info)" value={c.meta.technology ?? ""} onChange={(v) => setCase({ meta: { ...c.meta, technology: v || undefined } })} />
        </Row>
        <MediaField label="Головне медіа під hero" value={c.hero.media} onChange={(media) => setCase({ hero: { ...c.hero, media } })} />
      </Group>

      {/* ---------- Overview ---------- */}
      <Group title="Project — огляд">
        <LinesField label="Заголовок" value={c.overview.headline} onChange={(headline) => setCase({ overview: { ...c.overview, headline } })} />
        <CsvField label="Теги" value={c.overview.tags} onChange={(tags) => setCase({ overview: { ...c.overview, tags: tags.length ? tags : undefined } })} />
        <div className="admin-editor-field">
          Абзаци
          <ListEditor
            items={c.overview.body}
            onChange={(body) => setCase({ overview: { ...c.overview, body } })}
            addLabel="+ Абзац"
            title={(_, i) => `Абзац ${i + 1}`}
            create={() => ""}
            render={(p, set) => <RichField label="Текст" value={p} onChange={set} />}
          />
        </div>
      </Group>

      {/* ---------- Необов'язкові секції ---------- */}
      <Optional k="challenge" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("challenge")!;
          return (
            <>
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("challenge", { headline })} />
              <ItemsField label="Задачі" noun="Задача" value={s.items} onChange={(items) => setSection("challenge", { items })} />
            </>
          );
        }}
      </Optional>

      <Optional k="approach" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("approach")!;
          return (
            <>
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("approach", { headline })} />
              <Select
                label="Ілюстрація з частинок"
                value={(s.illustration ?? "lattice") as IllustrationName}
                options={(Object.keys(ILLUSTRATIONS) as IllustrationName[]).map((n) => ({ value: n, label: n }))}
                onChange={(illustration) => setSection("approach", { illustration })}
              />
              <ItemsField label="Етапи" noun="Етап" value={s.steps} onChange={(steps) => setSection("approach", { steps })} />
            </>
          );
        }}
      </Optional>

      <Optional k="solution" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("solution")!;
          return (
            <>
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("solution", { headline })} />
              <Field label="Примітка біля заголовка" value={s.note ?? ""} onChange={(v) => setSection("solution", { note: v || undefined })} />
              <div className="admin-editor-field">
                Модулі — скільки завгодно, кожен зі своїм макетом
                <ListEditor
                  items={s.modules}
                  onChange={(modules) => setSection("solution", { modules })}
                  addLabel="+ Модуль"
                  title={(m, i) => `[ ${String(i + 1).padStart(2, "0")} ] ${m.title || "Модуль"}`}
                  create={(): SolutionModule => ({ layout: "wide", title: "", text: "", media: [ph("Screenshot")] })}
                  render={(m, set) => <ModuleEditor m={m} set={set} />}
                />
              </div>
            </>
          );
        }}
      </Optional>

      <Optional k="system" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("system")!;
          return (
            <>
              <Field label="Підпис секції" hint="Напр. System, Brand system, Architecture" value={s.label ?? ""} onChange={(v) => setSection("system", { label: v || undefined })} />
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("system", { headline })} />
              <Field label="Текст" multiline value={s.text ?? ""} onChange={(v) => setSection("system", { text: v || undefined })} />
              <div className="admin-editor-field">
                Клітинки
                <ListEditor
                  items={s.cells}
                  onChange={(cells) => setSection("system", { cells })}
                  addLabel="+ Клітинка"
                  title={(x, i) => `Клітинка ${i + 1} · ${x.key}`}
                  create={(): SystemCell => ({ key: "Component", title: "", text: "" })}
                  render={(x, set) => <CellEditor x={x} set={set} />}
                />
              </div>
            </>
          );
        }}
      </Optional>

      <Optional k="experience" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("experience")!;
          return (
            <>
              <Field label="Підпис секції" hint="Напр. Experience або Brand in use" value={s.label ?? ""} onChange={(v) => setSection("experience", { label: v || undefined })} />
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("experience", { headline })} />
              <Field label="Текст" multiline value={s.text ?? ""} onChange={(v) => setSection("experience", { text: v || undefined })} />
              <div className="admin-editor-field">
                Медіа
                <ListEditor
                  items={s.items}
                  onChange={(items) => setSection("experience", { items })}
                  addLabel="+ Медіа"
                  title={(x, i) => `${i + 1} · ${x.label}`}
                  create={() => ({ label: "Desktop", media: ph("Screen", "16/10") })}
                  render={(x, set) => (
                    <>
                      <Field label="Підпис" value={x.label} onChange={(label) => set({ ...x, label })} />
                      <MediaField label="Медіа" value={x.media} onChange={(media) => set({ ...x, media })} />
                    </>
                  )}
                />
              </div>
            </>
          );
        }}
      </Optional>

      <Optional k="technology" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("technology")!;
          return (
            <>
              <Field label="Підпис секції" value={s.label ?? ""} onChange={(v) => setSection("technology", { label: v || undefined })} />
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("technology", { headline })} />
              <CsvField label="Стек" value={s.stack} onChange={(stack) => setSection("technology", { stack: stack.length ? stack : undefined })} />
              <ItemsField label="Пункти" value={s.items} onChange={(items) => setSection("technology", { items })} />
            </>
          );
        }}
      </Optional>

      <Optional k="result" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("result")!;
          return (
            <>
              <LinesField label="Заголовок" value={s.headline} onChange={(headline) => setSection("result", { headline })} />
              <div className="admin-editor-field">
                Цифри — лише реальні. Порожній список ховає блок
                <ListEditor
                  items={s.metrics}
                  onChange={(metrics) => setSection("result", { metrics: metrics.length ? metrics : undefined })}
                  addLabel="+ Цифра"
                  title={(x, i) => `Цифра ${i + 1} · ${x.prefix ?? ""}${x.value}${x.suffix ?? ""}`}
                  create={(): Metric => ({ value: 0, label: "" })}
                  render={(x, set) => (
                    <>
                      <Row>
                        <Field label="Префікс" value={x.prefix ?? ""} onChange={(v) => set({ ...x, prefix: v || undefined })} />
                        <Field label="Число" value={String(x.value)} onChange={(v) => set({ ...x, value: Number(v.replace(",", ".")) || 0 })} />
                        <Field label="Суфікс" value={x.suffix ?? ""} onChange={(v) => set({ ...x, suffix: v || undefined })} />
                      </Row>
                      <Field label="Підпис" value={x.label} onChange={(label) => set({ ...x, label })} />
                      <Field label="Пояснення" value={x.text ?? ""} onChange={(v) => set({ ...x, text: v || undefined })} />
                    </>
                  )}
                />
              </div>
              <ItemsField label="Результати" noun="Результат" value={s.items} onChange={(items) => setSection("result", { items })} />
            </>
          );
        }}
      </Optional>

      <Optional k="testimonial" c={c} hidden={hidden} toggle={toggle}>
        {() => {
          const s = section("testimonial")!;
          return (
            <>
              <RichField label="Текст відгуку" rows={6} value={s.quote} onChange={(quote) => setSection("testimonial", { quote })} />
              <small className="admin-editor-hint">Довший за 400 символів відгук на сайті скорочується й отримує кнопку «Читати повний відгук».</small>
              <Row>
                <Field label="Ім'я" value={s.name} onChange={(name) => setSection("testimonial", { name })} />
                <Field label="Роль / компанія" value={s.role} onChange={(role) => setSection("testimonial", { role })} />
                <Field label="Країна" value={s.country ?? ""} onChange={(v) => setSection("testimonial", { country: v || undefined })} />
              </Row>
              <ImageField label="Лого або фото клієнта" value={s.logo} onChange={(v) => setSection("testimonial", { logo: v || undefined })} />
            </>
          );
        }}
      </Optional>

      <div className="pe-bar pe-bar--end">
        <span>{dirty ? "Є незбережені зміни" : "Усе збережено"}</span>
        <button className="admin-button" type="submit" disabled={disabled}>Зберегти проєкт</button>
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

function Optional({ k, c, hidden, toggle, children }: { k: OptionalSection; c: CaseDoc; hidden: OptionalSection[]; toggle: (k: OptionalSection, on: boolean) => void; children: () => ReactNode }) {
  const on = Boolean(c[k]) && !hidden.includes(k);
  return (
    <details className={`admin-editor-section pe-group ${on ? "" : "is-off"}`}>
      <summary>
        <h3>{SECTION_TITLES[k]}</h3>
        <small>{on ? "Показується на сайті" : c[k] ? "Прихована — вміст збережено" : "Вимкнена"}</small>
      </summary>
      <div className="pe-group__body">
        <Check label="Показувати секцію на сайті" checked={on} onChange={(v) => toggle(k, v)} />
        {on && children()}
      </div>
    </details>
  );
}

function ModuleEditor({ m, set }: { m: SolutionModule; set: (m: SolutionModule) => void }) {
  const layout = LAYOUTS.find((l) => l.value === m.layout) ?? LAYOUTS[0];
  const slots = layout.slots === "many" ? m.media.length : layout.slots;
  const media = Array.from({ length: slots }, (_, i) => m.media[i] ?? ph(layout.names?.[i] ?? `Media ${i + 1}`));
  const setMedia = (i: number, v: Media) => {
    const next = [...m.media];
    for (let j = next.length; j < i; j++) next[j] = media[j];
    next[i] = v;
    set({ ...m, media: next });
  };
  return (
    <>
      <Select
        label="Макет"
        value={m.layout}
        options={LAYOUTS}
        onChange={(l) => {
          const need = LAYOUTS.find((x) => x.value === l)!.slots;
          const next = [...m.media];
          if (typeof need === "number") while (next.length < need) next.push(ph(LAYOUTS.find((x) => x.value === l)!.names?.[next.length] ?? "Screenshot"));
          if (need === "many" && next.length === 0) next.push(ph("Screenshot"));
          set({ ...m, layout: l, media: next });
        }}
      />
      <Field label="Заголовок" value={m.title} onChange={(title) => set({ ...m, title })} />
      <Field label="Текст" multiline value={m.text} onChange={(text) => set({ ...m, text })} />
      {(m.layout === "split" || m.layout === "closeup") && (
        <Check label="Дзеркально (медіа з іншого боку)" checked={Boolean(m.reverse)} onChange={(reverse) => set({ ...m, reverse: reverse || undefined })} />
      )}
      {layout.slots === "many" ? (
        <div className="admin-editor-field">
          Фото й відео галереї
          <ListEditor
            items={m.media}
            onChange={(next) => set({ ...m, media: next })}
            addLabel="+ Фото / відео"
            title={(_, i) => `Медіа ${i + 1}`}
            create={() => ph("Screenshot")}
            render={(x, setX) => <MediaField label="Медіа" value={x} onChange={setX} />}
          />
        </div>
      ) : (
        media.map((x, i) => <MediaField key={i} label={layout.names?.[i] ?? "Медіа"} value={x} onChange={(v) => setMedia(i, v)} />)
      )}
    </>
  );
}

function CellEditor({ x, set }: { x: SystemCell; set: (x: SystemCell) => void }) {
  return (
    <>
      <Row>
        <Field label="Мітка" value={x.key} onChange={(key) => set({ ...x, key })} />
        <Select
          label="Розмір"
          value={x.size ?? "1"}
          options={[
            { value: "1", label: "1 × 1" },
            { value: "wide", label: "2 × 1 — широка" },
            { value: "tall", label: "1 × 2 — висока" },
            { value: "lg", label: "2 × 2 — велика" },
          ]}
          onChange={(v) => set({ ...x, size: v === "1" ? undefined : (v as SystemCell["size"]) })}
        />
        <Field label="Зразок шрифту" hint="Напр. Aa" value={x.specimen ?? ""} onChange={(v) => set({ ...x, specimen: v || undefined })} />
      </Row>
      <Field label="Заголовок" value={x.title ?? ""} onChange={(v) => set({ ...x, title: v || undefined })} />
      <Field label="Текст" value={x.text ?? ""} onChange={(v) => set({ ...x, text: v || undefined })} />
      <CsvField label="Кольори" hint="HEX через кому: #ffffff, #000000" value={x.swatches} onChange={(v) => set({ ...x, swatches: v.length ? v : undefined })} />
      <Check label="Додати медіа в клітинку" checked={Boolean(x.media)} onChange={(on) => set({ ...x, media: on ? ph("Media", "33/18") : undefined })} />
      {x.media && <MediaField label="Медіа" value={x.media} onChange={(media) => set({ ...x, media })} />}
    </>
  );
}
