"use client";

import Image from "next/image";
import { useState } from "react";
import type { ServicePageData } from "@/lib/service-pages";
import type { ServiceSectionKey } from "@/lib/service-pages";
import { saveServicePageAction } from "@/app/admin/actions";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import type { IllustrationName } from "@/lib/illustrations";

type Props = {
  slug: string;
  initialValue: ServicePageData;
  disabled?: boolean;
};

const arrayFields: {
  key: keyof ServicePageData;
  label: string;
  hint: string;
}[] = [
  {
    key: "why",
    label: "Переваги · 3 картки",
    hint: "Кожна картка: a, b, text.",
  },
  {
    key: "when",
    label: "Коли потрібна послуга",
    hint: "Елементи: t (заголовок), d (опис).",
  },
  {
    key: "included",
    label: "Склад послуги",
    hint: "Елементи: t (назва), d (опис).",
  },
  {
    key: "process",
    label: "Етапи процесу",
    hint: "Елементи: letter, n, title, text, необов’язково result.",
  },
  {
    key: "pricing",
    label: "Варіанти співпраці",
    hint: "Елементи: badge, title (масив рядків), text, features (масив), foot, featured.",
  },
  {
    key: "faq",
    label: "Питання та відповіді",
    hint: "Елементи: q (питання), a (відповідь).",
  },
];

export function ServiceContentEditor({
  slug,
  initialValue,
  disabled = false,
}: Props) {
  const [value, setValue] = useState<ServicePageData>(initialValue);
  const [arrayText, setArrayText] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      arrayFields.map(({ key }) => [
        key,
        JSON.stringify(initialValue[key], null, 2),
      ]),
    ),
  );
  const [arrayErrors, setArrayErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof ServicePageData>(
    key: K,
    fieldValue: ServicePageData[K],
  ) {
    setValue((current) => ({ ...current, [key]: fieldValue }));
  }

  function updateArray(key: keyof ServicePageData, raw: string) {
    setArrayText((current) => ({ ...current, [key]: raw }));
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Потрібен JSON-масив.");
      setValue((current) => ({ ...current, [key]: parsed }));
      setArrayErrors((current) => ({ ...current, [key]: "" }));
    } catch (error) {
      setArrayErrors((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "Перевірте JSON.",
      }));
    }
  }

  return (
    <form action={saveServicePageAction} className="admin-service-form">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="content" value={JSON.stringify(value)} />
      <section className="admin-editor-section">
        <h3>Порядок секцій сторінки</h3>
        <Field
          label="Ключі секцій · по одному на рядок"
          value={value.sectionOrder.join("\n")}
          multiline
          onChange={(v) =>
            setField(
              "sectionOrder",
              v
                .split("\n")
                .map((key) => key.trim())
                .filter(Boolean) as ServiceSectionKey[],
            )
          }
        />
        <small className="admin-editor-hint">
          why · when · included · process · work · pricing · faq · cta. Кожен
          сервіс має власний порядок.
        </small>
      </section>
      <section className="admin-editor-section">
        <h3>Hero</h3>
        <Field
          label="Основний текст"
          value={value.hero}
          onChange={(v) => setField("hero", v)}
        />
        <Field
          label="Продовження тексту"
          value={value.heroRest}
          onChange={(v) => setField("heroRest", v)}
        />
        <Field
          label="Текст кнопки"
          value={value.heroAction}
          onChange={(v) => setField("heroAction", v)}
        />
        <fieldset className="admin-illustration-picker">
          <legend>Ілюстрація картки та сторінки послуги</legend>
          <div className="admin-illustration-grid">
            {(Object.keys(ILLUSTRATIONS) as IllustrationName[]).map((name) => (
              <label
                className={`admin-illustration-option ${value.form === name ? "is-selected" : ""}`}
                key={name}
              >
                <input
                  type="radio"
                  name="illustration-choice"
                  value={name}
                  checked={value.form === name}
                  onChange={() => setField("form", name)}
                />
                <Image
                  src={ILLUSTRATIONS[name].src}
                  alt={`Прев’ю ${name}`}
                  width={180}
                  height={120}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="admin-editor-section">
        <h3>Переваги</h3>
        <Field
          label="Ліва мітка"
          value={value.whyLeft}
          onChange={(v) => setField("whyLeft", v)}
        />
        <Field
          label="Права мітка"
          value={value.whyRight}
          onChange={(v) => setField("whyRight", v)}
        />
        <Field
          label="Заголовок секції · кожен рядок окремо"
          value={value.whyTitle.join("\n")}
          multiline
          onChange={(v) => setField("whyTitle", v.split("\n"))}
        />
        <ArrayField
          item={arrayFields[0]}
          value={arrayText.why}
          error={arrayErrors.why}
          onChange={(v) => updateArray("why", v)}
        />
      </section>
      <section className="admin-editor-section">
        <h3>Коли потрібна послуга</h3>
        <Field
          label="Мітка секції"
          value={value.whenLabel}
          onChange={(v) => setField("whenLabel", v)}
        />
        <Field
          label="Заголовок секції · кожен рядок окремо"
          value={value.whenTitle.join("\n")}
          multiline
          onChange={(v) => setField("whenTitle", v.split("\n"))}
        />
        <ArrayField
          item={arrayFields[1]}
          value={arrayText.when}
          error={arrayErrors.when}
          onChange={(v) => updateArray("when", v)}
        />
        <Field
          label="Текст під списком"
          value={value.whenText}
          multiline
          onChange={(v) => setField("whenText", v)}
        />
      </section>
      <section className="admin-editor-section">
        <h3>Склад послуги</h3>
        <Field
          label="Мітка секції"
          value={value.includedLabel}
          onChange={(v) => setField("includedLabel", v)}
        />
        <Field
          label="Підзаголовок · перенесення рядків збережуться"
          value={value.includedLead}
          multiline
          onChange={(v) => setField("includedLead", v)}
        />
        <ArrayField
          item={arrayFields[2]}
          value={arrayText.included}
          error={arrayErrors.included}
          onChange={(v) => updateArray("included", v)}
        />
      </section>
      <section className="admin-editor-section">
        <h3>Процес роботи</h3>
        <Field
          label="Ліва мітка"
          value={value.processLeft}
          onChange={(v) => setField("processLeft", v)}
        />
        <Field
          label="Права мітка"
          value={value.processRight}
          onChange={(v) => setField("processRight", v)}
        />
        <Field
          label="Заголовок секції · кожен рядок окремо"
          value={value.processTitle.join("\n")}
          multiline
          onChange={(v) => setField("processTitle", v.split("\n"))}
        />
        <ArrayField
          item={arrayFields[3]}
          value={arrayText.process}
          error={arrayErrors.process}
          onChange={(v) => updateArray("process", v)}
        />
      </section>
      <section className="admin-editor-section">
        <h3>Проєкти</h3>
        <Field
          label="Заголовок секції · кожен рядок окремо"
          value={value.workTitle.join("\n")}
          multiline
          onChange={(v) => setField("workTitle", v.split("\n"))}
        />
        <Field
          label="Slug проєктів · кожен рядок окремо"
          value={value.workSlugs.join("\n")}
          multiline
          onChange={(v) =>
            setField(
              "workSlugs",
              v
                .split("\n")
                .map((slug) => slug.trim())
                .filter(Boolean),
            )
          }
        />
      </section>
      <section className="admin-editor-section">
        <h3>Формат співпраці</h3>
        <Field
          label="Ліва мітка"
          value={value.pricingLeft}
          onChange={(v) => setField("pricingLeft", v)}
        />
        <Field
          label="Права мітка"
          value={value.pricingRight}
          onChange={(v) => setField("pricingRight", v)}
        />
        <Field
          label="Текст кнопки"
          value={value.pricingCta}
          onChange={(v) => setField("pricingCta", v)}
        />
        <ArrayField
          item={arrayFields[4]}
          value={arrayText.pricing}
          error={arrayErrors.pricing}
          onChange={(v) => updateArray("pricing", v)}
        />
      </section>
      <section className="admin-editor-section">
        <h3>FAQ</h3>
        <Field
          label="Заголовок секції · кожен рядок окремо"
          value={value.faqTitle.join("\n")}
          multiline
          onChange={(v) => setField("faqTitle", v.split("\n"))}
        />
        <Field
          label="Вступний текст"
          value={value.faqText}
          multiline
          onChange={(v) => setField("faqText", v)}
        />
        <ArrayField
          item={arrayFields[5]}
          value={arrayText.faq}
          error={arrayErrors.faq}
          onChange={(v) => updateArray("faq", v)}
        />
      </section>
      <section className="admin-editor-section">
        <h3>Фінальний заклик</h3>
        <Field
          label="Заголовок"
          value={value.ctaQ}
          onChange={(v) => setField("ctaQ", v)}
        />
        <Field
          label="Текст"
          value={value.ctaText}
          multiline
          onChange={(v) => setField("ctaText", v)}
        />
        <Field
          label="Мітка"
          value={value.ctaTag}
          onChange={(v) => setField("ctaTag", v)}
        />
        <Field
          label="Кнопка"
          value={value.ctaAction}
          onChange={(v) => setField("ctaAction", v)}
        />
        <Field
          label="Великий текст · кожен рядок окремо"
          value={value.ctaLines.join("\n")}
          multiline
          onChange={(v) => setField("ctaLines", v.split("\n"))}
        />
      </section>
      <div className="admin-form-actions">
        <button
          className="admin-button"
          type="submit"
          disabled={disabled || Object.values(arrayErrors).some(Boolean)}
        >
          Зберегти зміни
        </button>
        <span>Зміни одразу застосуються на сайті.</span>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="admin-editor-field">
      {label}
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function ArrayField({
  item,
  value,
  error,
  onChange,
}: {
  item: (typeof arrayFields)[number];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="admin-editor-field">
      {item.label}
      <small>{item.hint}</small>
      <textarea
        className="admin-editor-array"
        value={value}
        spellCheck={false}
        rows={8}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <em>{error}</em>}
    </label>
  );
}
