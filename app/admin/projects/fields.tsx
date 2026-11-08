"use client";

import { useRef, useState, type ReactNode } from "react";
import type { Item, Line, Media, Rich } from "@/lib/cases";
import { signUploadAction } from "./actions";

/* ---------- Прості поля -------------------------------------------------- */

export function Field({ label, value, onChange, multiline, hint, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string; placeholder?: string; rows?: number;
}) {
  return (
    <label className="admin-editor-field">
      {label}
      {hint && <small>{hint}</small>}
      {multiline
        ? <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="pe-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Select<T extends string>({ label, value, options, onChange, hint }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void; hint?: string;
}) {
  return (
    <label className="admin-editor-field">
      {label}
      {hint && <small>{hint}</small>}
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/**
 * Локальний текст поля, який сам оновлюється, коли значення змінили ззовні
 * (перестановка в списку, скидання), але не заважає набирати «a, » чи «*».
 */
function useSyncedText<T>(value: T, toText: (v: T) => string) {
  const [raw, setRaw] = useState(() => toText(value));
  const own = useRef(JSON.stringify(value));
  const incoming = JSON.stringify(value);
  if (incoming !== own.current) {
    own.current = incoming;
    setRaw(toText(value));
  }
  const mark = (v: T) => (own.current = JSON.stringify(v));
  return [raw, setRaw, mark] as const;
}

/** Список рядків через кому: теги, стек, послуги. */
export function CsvField({ label, value, onChange, hint }: { label: string; value: string[] | undefined; onChange: (v: string[]) => void; hint?: string }) {
  const [raw, setRaw, mark] = useSyncedText(value, (v) => (v ?? []).join(", "));
  return (
    <Field
      label={label}
      hint={hint ?? "Через кому"}
      value={raw}
      onChange={(v) => {
        setRaw(v);
        const next = v.split(",").map((x) => x.trim()).filter(Boolean);
        mark(next);
        onChange(next);
      }}
    />
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="pe-row">{children}</div>;
}

/* ---------- Текст із сірими фрагментами ----------------------------------- */

/** Rich ↔ текст: фрагмент у *зірочках* — другий (сірий) тон. */
export function richToText(v: Rich | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.map((p) => (p.dim ? `*${p.t}*` : p.t)).join("");
}
export function textToRich(s: string): Rich {
  if (!s.includes("*")) return s;
  return s.split(/(\*[^*]*\*)/).filter(Boolean).map((t) => (t.startsWith("*") && t.endsWith("*") && t.length > 1 ? { t: t.slice(1, -1), dim: true } : { t }));
}

export function RichField({ label, value, onChange, rows = 3 }: { label: string; value: Rich | undefined; onChange: (v: Rich) => void; rows?: number }) {
  const [raw, setRaw, mark] = useSyncedText(value, richToText);
  return (
    <Field
      label={label}
      hint="Текст у *зірочках* буде сірим"
      multiline
      rows={rows}
      value={raw}
      onChange={(v) => {
        setRaw(v);
        const next = textToRich(v);
        mark(next);
        onChange(next);
      }}
    />
  );
}

/* ---------- Рядки великого заголовка ------------------------------------- */

const INDENTS = [
  { value: "0", label: "Без зсуву" },
  { value: "1", label: "½ колонки" },
  { value: "2", label: "1 колонка" },
  { value: "3", label: "1½ колонки" },
  { value: "4", label: "2 колонки" },
] as const;

export function LinesField({ label, value, onChange }: { label: string; value: Line[] | undefined; onChange: (v: Line[]) => void }) {
  const lines = value ?? [];
  const set = (i: number, patch: Partial<Line>) => onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="admin-editor-field">
      {label}
      <small>Кожен рядок заголовка окремо. «Сірий» — другий тон, зсув — відступ рядка по сітці.</small>
      <div className="pe-lines">
        {lines.map((l, i) => (
          <div className="pe-line" key={i}>
            <input value={l.t} onChange={(e) => set(i, { t: e.target.value })} placeholder="Текст рядка" />
            <Check label="Сірий" checked={Boolean(l.dim)} onChange={(dim) => set(i, { dim: dim || undefined })} />
            <select value={String(l.indent ?? 0)} onChange={(e) => set(i, { indent: (Number(e.target.value) || undefined) as Line["indent"] })}>
              {INDENTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <MiniButtons i={i} list={lines} onChange={onChange} />
          </div>
        ))}
      </div>
      <button type="button" className="admin-add-item" onClick={() => onChange([...lines, { t: "" }])}>+ Рядок</button>
    </div>
  );
}

/* ---------- Списки -------------------------------------------------------- */

function MiniButtons<T>({ i, list, onChange }: { i: number; list: T[]; onChange: (v: T[]) => void }) {
  const move = (d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <span className="pe-mini">
      <button type="button" title="Вище" disabled={i === 0} onClick={() => move(-1)}>↑</button>
      <button type="button" title="Нижче" disabled={i === list.length - 1} onClick={() => move(1)}>↓</button>
      <button type="button" title="Видалити" onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</button>
    </span>
  );
}

let uid = 0;
const nextId = () => ++uid;

/**
 * Повторюваний блок: картки, кроки, модулі. Порядок змінюється стрілками.
 * Кожен елемент має стабільний ключ, тож після перестановки поля не плутаються.
 */
export function ListEditor<T>({ items, onChange, render, create, addLabel, title }: {
  items: T[] | undefined;
  onChange: (v: T[]) => void;
  render: (item: T, set: (v: T) => void, i: number) => ReactNode;
  create: () => T;
  addLabel: string;
  title: (item: T, i: number) => string;
}) {
  const list = items ?? [];
  const [ids, setIds] = useState<number[]>(() => list.map(nextId));
  const keys = list.map((_, i) => ids[i] ?? -i - 1);
  const apply = (next: T[], nextIds: number[]) => {
    setIds(nextIds);
    onChange(next);
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    const k = [...keys];
    [next[i], next[j]] = [next[j], next[i]];
    [k[i], k[j]] = [k[j], k[i]];
    apply(next, k);
  };
  return (
    <div className="pe-list">
      {list.map((item, i) => (
        <fieldset className="admin-process-step pe-item" key={keys[i]}>
          <legend>{title(item, i)}</legend>
          <span className="pe-item__tools pe-mini">
            <button type="button" title="Вище" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" title="Нижче" disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button type="button" title="Видалити" onClick={() => apply(list.filter((_, j) => j !== i), keys.filter((_, j) => j !== i))}>✕</button>
          </span>
          {render(item, (v) => onChange(list.map((x, j) => (j === i ? v : x))), i)}
        </fieldset>
      ))}
      <button type="button" className="admin-add-item" onClick={() => apply([...list, create()], [...keys, nextId()])}>{addLabel}</button>
    </div>
  );
}

export function ItemsField({ label, value, onChange, noun = "Пункт" }: { label: string; value: Item[] | undefined; onChange: (v: Item[]) => void; noun?: string }) {
  return (
    <div className="admin-editor-field">
      {label}
      <ListEditor
        items={value}
        onChange={onChange}
        addLabel={`+ ${noun}`}
        title={(it, i) => `${noun} ${i + 1}${it.title ? ` · ${it.title}` : ""}`}
        create={() => ({ title: "", text: "" })}
        render={(it, set) => (
          <>
            <Field label="Заголовок" value={it.title} onChange={(title) => set({ ...it, title })} />
            <Field label="Текст" multiline value={it.text} onChange={(text) => set({ ...it, text })} />
          </>
        )}
      />
    </div>
  );
}

/* ---------- Завантаження на Cloudinary ------------------------------------ */

type Uploaded = { url: string; kind: "image" | "video"; width?: number; height?: number };

function upload(file: File, onProgress: (p: number) => void): Promise<Uploaded> {
  return signUploadAction().then((t) => {
    if (!t.ok) throw new Error(t.error);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", t.apiKey);
    fd.append("timestamp", String(t.timestamp));
    fd.append("folder", t.folder);
    fd.append("signature", t.signature);
    return new Promise<Uploaded>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${t.cloudName}/auto/upload`);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve({ url: res.secure_url, kind: res.resource_type === "video" ? "video" : "image", width: res.width, height: res.height });
        } else reject(new Error(res.error?.message ?? `Помилка завантаження (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Немає зʼєднання з Cloudinary"));
      xhr.send(fd);
    });
  });
}

export function UploadButton({ accept, label = "Завантажити файл", onDone }: { accept: string; label?: string; onDone: (u: Uploaded) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  return (
    <span className="pe-upload">
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setError("");
          setProgress(0);
          upload(file, setProgress)
            .then(onDone)
            .catch((err: Error) => setError(err.message))
            .finally(() => setProgress(null));
        }}
      />
      <button type="button" className="admin-remove-item" disabled={progress !== null} onClick={() => input.current?.click()}>
        {progress !== null ? `Завантаження… ${progress}%` : label}
      </button>
      {error && <em>{error}</em>}
    </span>
  );
}

/** Просте поле картинки (картка проєкту, лого клієнта). */
export function ImageField({ label, value, onChange, hint }: { label: string; value: string | undefined; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="admin-editor-field">
      {label}
      {hint && <small>{hint}</small>}
      <div className="pe-media__body">
        <div className="pe-preview">{value ? <img src={value} alt="" /> : <span>Немає фото</span>}</div>
        <div className="pe-media__fields">
          <UploadButton accept="image/*" label="Завантажити фото" onDone={(u) => onChange(u.url)} />
          <Field label="Або посилання на фото" value={value ?? ""} onChange={onChange} placeholder="https://… або /images/…" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Медіа-слот: фото / відео / заглушка ---------------------------- */

const KINDS = [
  { value: "image", label: "Фото" },
  { value: "video", label: "Відео" },
  { value: "placeholder", label: "Заглушка" },
] as const;
type Kind = (typeof KINDS)[number]["value"];

const srcOf = (m: Media) => (m.type === "video" ? (typeof m.src === "string" ? m.src : m.src[0]?.src ?? "") : m.type === "image" ? m.src : "");

export function MediaField({ label, value, onChange, hint }: { label: string; value: Media | undefined; onChange: (v: Media) => void; hint?: string }) {
  const m: Media = value ?? { type: "placeholder", label: "Media", ratio: "16/10" };
  // Пам'ятаємо, що було в кожному режимі, щоб перемикання туди-назад нічого не губило
  const memo = useRef<Partial<Record<string, Media>>>({ [m.type]: m });
  const base = { ratio: m.ratio, caption: m.caption };

  function switchTo(kind: Kind) {
    if (kind === m.type) return;
    memo.current[m.type] = m;
    const saved = memo.current[kind];
    if (saved) return onChange({ ...saved, ...base } as Media);
    if (kind === "image") onChange({ type: "image", src: "", alt: "", ...base });
    else if (kind === "video") onChange({ type: "video", src: "", ...base });
    else onChange({ type: "placeholder", label: label, ...base });
  }

  function uploaded(u: Uploaded) {
    const ratio = m.ratio || (u.width && u.height ? `${u.width}/${u.height}` : undefined);
    if (u.kind === "video") {
      const prev = m.type === "video" ? m : memo.current.video;
      onChange({ type: "video", alt: prev && prev.type === "video" ? prev.alt : undefined, caption: m.caption, ratio, src: u.url });
    } else {
      const prev = m.type === "image" ? m : memo.current.image;
      onChange({ type: "image", alt: prev && prev.type === "image" ? prev.alt : "", position: prev && prev.type === "image" ? prev.position : undefined, caption: m.caption, ratio, src: u.url });
    }
  }

  const special = !KINDS.some((k) => k.value === m.type);
  const src = srcOf(m);

  return (
    <div className="admin-editor-field pe-media">
      <div className="pe-media__head">
        <span>{label}</span>
        <div className="pe-switch" role="group" aria-label="Тип медіа">
          {KINDS.map((k) => (
            <button type="button" key={k.value} className={m.type === k.value ? "is-on" : ""} onClick={() => switchTo(k.value)}>{k.label}</button>
          ))}
        </div>
      </div>
      {hint && <small>{hint}</small>}
      {special && <small>Особливий тип «{m.type}» із шаблону. Оберіть «Фото» або «Відео», щоб замінити.</small>}

      <div className="pe-media__body">
        <div className="pe-preview">
          {m.type === "image" && src && <img src={src} alt="" style={m.position ? { objectPosition: m.position } : undefined} />}
          {m.type === "video" && src && <video src={src} muted loop playsInline controls preload="metadata" />}
          {(m.type === "placeholder" || !src) && <span>{m.type === "placeholder" ? `[ ${m.label} ]` : "Файл не вибрано"}</span>}
        </div>

        <div className="pe-media__fields">
          {m.type === "image" && (
            <>
              <UploadButton accept="image/*" label="Завантажити фото" onDone={uploaded} />
              <Field label="Посилання на фото" value={m.src} onChange={(v) => onChange({ ...m, src: v })} placeholder="https://… або /images/…" />
              <Field label="Alt — опис фото для пошуковиків" value={m.alt} onChange={(v) => onChange({ ...m, alt: v })} />
              <Field label="Кадрування" hint="Яку частину фото тримати в кадрі: center, top, 50% 20%…" value={m.position ?? ""} onChange={(v) => onChange({ ...m, position: v || undefined })} />
            </>
          )}
          {m.type === "video" && (
            <>
              <UploadButton accept="video/*" label="Завантажити відео" onDone={uploaded} />
              <Field label="Посилання на відео (mp4 / webm)" value={src} onChange={(v) => onChange({ ...m, src: v })} placeholder="https://…" />
              <Field label="Постер — необов'язково" hint="Для відео з Cloudinary постер береться з першого кадру автоматично" value={m.poster ?? ""} onChange={(v) => onChange({ ...m, poster: v || undefined })} />
              <Field label="Опис відео для доступності" value={m.alt ?? ""} onChange={(v) => onChange({ ...m, alt: v || undefined })} />
            </>
          )}
          {m.type === "placeholder" && (
            <Field label="Підпис заглушки" value={m.label} onChange={(v) => onChange({ ...m, label: v })} />
          )}
          <Row>
            <Field label="Пропорції" hint="Напр. 16/9, 4/3, 1/1. Порожньо — як у макеті" value={m.ratio ?? ""} onChange={(v) => onChange({ ...m, ratio: v || undefined })} />
            <Field label="Підпис поверх — необов'язково" value={m.caption ?? ""} onChange={(v) => onChange({ ...m, caption: v || undefined })} />
          </Row>
        </div>
      </div>
    </div>
  );
}
