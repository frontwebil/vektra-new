/**
 * Документ статті блогу — те, що зберігається в базі (таблиця BlogPost, поле content)
 * і редагується в адмінці /admin/blog.
 *
 * Тіло статті — список блоків у довільному порядку. Блок «Розділ» відкриває нумерований
 * розділ і пункт у змісті; «Велика цитата» розриває колонку тексту на всю ширину.
 *
 * Модуль без серверних залежностей: його використовують і сайт, і клієнтський редактор.
 */
import type { IllustrationName } from "./illustrations";

export type HeadLine = { t: string; dim?: boolean };

export type BlogBlock =
  | { type: "section"; title: string }
  | { type: "text"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "highlight"; text: string }
  | { type: "insight"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "illustration"; name: IllustrationName; caption?: string }
  | { type: "quote"; lines: HeadLine[] };

export type BlogBlockType = BlogBlock["type"];

/** Блоки, які можна вимкнути цілком. Вимкнений блок зберігає вміст, але не показується. */
export const OPTIONAL_PARTS = ["toc", "note", "cta", "related"] as const;
export type OptionalPart = (typeof OPTIONAL_PARTS)[number];

export type BlogDoc = {
  /** Великий заголовок на першому екрані, рядок за рядком. */
  headline: HeadLine[];
  /** Заголовок одним рядком: картки, вкладка браузера, пошук. */
  title: string;
  /** Короткий опис для картки в каталозі й пошуковиків. */
  excerpt: string;
  /** Вступний абзац на першому екрані. */
  lead: string;
  category: BlogCategoryKey;
  /** Дата публікації, YYYY-MM-DD. */
  date: string;
  /** Головна стаття в каталозі. Якщо не позначено жодну — найсвіжіша. */
  featured?: boolean;
  cover: { illustration: IllustrationName; image?: string; imageAlt?: string };
  note: { label: string; text: string };
  cta: { headline: HeadLine[]; text: string; button: string };
  blocks: BlogBlock[];
  hidden?: OptionalPart[];
  seo?: { title?: string; description?: string };
};

export type BlogRecord = { slug: string; published: boolean; doc: BlogDoc };

export const BLOG_CATEGORIES = [
  { key: "design", label: "Design" },
  { key: "development", label: "Development" },
  { key: "branding", label: "Branding" },
  { key: "digital", label: "Digital" },
  { key: "business", label: "Business" },
] as const;
export type BlogCategoryKey = (typeof BLOG_CATEGORIES)[number]["key"];

export const categoryLabel = (key: string) => BLOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;
export const isCategory = (key: string | undefined): key is BlogCategoryKey => BLOG_CATEGORIES.some((c) => c.key === key);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ---------- Похідні значення --------------------------------------------- */

const blockText = (b: BlogBlock): string => {
  switch (b.type) {
    case "list":
      return b.items.join(" ");
    case "quote":
      return b.lines.map((l) => l.t).join(" ");
    case "image":
    case "illustration":
      return b.caption ?? "";
    case "section":
      return b.title;
    default:
      return b.text;
  }
};

/** Час читання: ~200 слів на хвилину, щонайменше 1 хвилина. */
export function readMinutes(doc: BlogDoc): number {
  const words = [doc.lead, ...doc.blocks.map(blockText)].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 2026-10-12 → 12 Oct 2026 (як у макеті). */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]} ${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}

export const isShown = (doc: BlogDoc, part: OptionalPart) => !(doc.hidden ?? []).includes(part);

/** Рядки заголовка ↔ текст: кожен рядок окремо, *зірочки* — сірий тон. */
export function linesToText(lines: HeadLine[]): string {
  return lines.map((l) => (l.dim ? `*${l.t}*` : l.t)).join("\n");
}
export function textToLines(text: string): HeadLine[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length > 2 && s.startsWith("*") && s.endsWith("*") ? { t: s.slice(1, -1), dim: true } : { t: s }));
}

/* ---------- Нова стаття й початкові дані --------------------------------- */

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_NOTE = { label: "Як читати", text: "" };
const DEFAULT_CTA = {
  headline: [{ t: "Є схожа" }, { t: "задача?", dim: true }],
  text: "Розкажіть, що потрібно створити, змінити або покращити, і ми запропонуємо, з чого почати.",
  button: "Обговорити проєкт",
};

export function newBlogDoc(title: string): BlogDoc {
  return {
    headline: [{ t: title }],
    title,
    excerpt: "",
    lead: "",
    category: "design",
    date: today(),
    cover: { illustration: "lattice" },
    note: DEFAULT_NOTE,
    cta: DEFAULT_CTA,
    blocks: [
      { type: "section", title: "Перший розділ" },
      { type: "text", text: "" },
    ],
    hidden: ["note"],
  };
}

export const ARTICLE_SLUG = "yak-zrozumity-shcho-saytu-potriben-redyzayn";

const REDESIGN: BlogDoc = {
  headline: [{ t: "Як зрозуміти," }, { t: "що сайту потрібен", dim: true }, { t: "редизайн" }],
  title: "Як зрозуміти, що сайту потрібен редизайн",
  excerpt: "7 сигналів, які показують, що дизайн уже не підтримує потреби користувачів і задачі бізнесу.",
  lead: "Редизайн потрібен не тоді, коли сайт просто «набрид». Він стає необхідним, коли продукт перестає відповідати задачам бізнесу та очікуванням користувачів.",
  category: "design",
  date: "2026-10-12",
  featured: true,
  cover: { illustration: "lattice" },
  note: {
    label: "Як читати",
    text: "Один сигнал не завжди означає повний редизайн. Іноді достатньо переробити окремий сценарій.\n\nКілька сигналів одночасно — це вже привід подивитися на продукт системно.",
  },
  cta: {
    headline: [{ t: "Побачили" }, { t: "свою ситуацію?", dim: true }],
    text: "Можемо проаналізувати ваш поточний продукт і визначити, де дизайн або структура обмежують його розвиток.",
    button: "Обговорити редизайн",
  },
  blocks: [
    { type: "section", title: "Сайт більше не відповідає бізнесу" },
    {
      type: "text",
      text: "Компанія змінюється швидше за свій сайт. З’являються нові послуги, сегменти клієнтів і ринки, а головна сторінка досі описує бізнес таким, яким він був кілька років тому.\n\nНайпростіша перевірка — покажіть сайт людині, яка не знає вашої компанії, і запитайте, що ви робите та для кого. Якщо відповідь не збігається з тим, що ви продаєте сьогодні, проблема вже не у візуальній частині.",
    },
    { type: "highlight", text: "Редизайн починається тоді, коли сайт розповідає про компанію, якої вже не існує." },
    { type: "section", title: "Користувачам складно знайти потрібне" },
    { type: "text", text: "Меню розростається разом із бізнесом: кожен новий розділ додають туди, де знайшлося місце. Згодом структура відображає внутрішню логіку компанії, а не те, як думає клієнт." },
    { type: "subheading", text: "Що варто перевірити" },
    {
      type: "list",
      items: [
        "Які запитання менеджери чують найчастіше, хоча відповіді вже є на сайті.",
        "Скільки кроків потрібно, щоб дійти від головної до ключової послуги.",
        "Чи зрозумілі назви розділів людині поза вашою компанією.",
      ],
    },
    { type: "text", text: "Якщо підтримка щодня пояснює те, що мав би пояснювати інтерфейс, сайт перекладає свою роботу на команду." },
    { type: "section", title: "Конверсія падає, хоча трафік залишається" },
    { type: "text", text: "Це один із найбільш показових сигналів. Люди приходять на сайт, але не залишають заявку і не купують. Отже, реклама та пошук працюють, а втрата відбувається вже всередині продукту." },
    { type: "insight", text: "Дивіться не на загальну конверсію, а на конкретний крок, де користувачі виходять зі сценарію. Часто проблема локальна, і саме це визначає обсяг майбутніх змін." },
    { type: "text", text: "Перш ніж змінювати весь дизайн, варто зрозуміти причину: незрозуміла пропозиція, форма із зайвими полями, повільне завантаження чи недостатньо аргументів для рішення." },
    { type: "illustration", name: "wave" },
    { type: "section", title: "Mobile experience став проблемою" },
    {
      type: "text",
      text: "Адаптивна версія часто створена за залишковим принципом: десктопний макет просто стиснули до вузького екрана. Формально все працює, але кнопки дрібні, таблиці не читаються, а форми незручно заповнювати.\n\nПеревірте сайт на власному телефоні так, як це зробив би новий клієнт: знайдіть послугу, відкрийте ціну, залиште заявку. Якщо це дратує вас, те саме відчуває і ваш покупець.",
    },
    { type: "quote", lines: [{ t: "Хороший редизайн" }, { t: "починається не з UI,", dim: true }, { t: "а з розуміння проблеми." }] },
    { type: "section", title: "Система дизайну не масштабується" },
    { type: "text", text: "Кожна нова сторінка потребує окремого дизайну, а схожі блоки виглядають по-різному. Так накопичуються варіанти кнопок, шрифтових розмірів і відступів, які вже ніхто не контролює." },
    { type: "subheading", text: "Як це виглядає на практиці" },
    { type: "text", text: "Прості правки займають непропорційно багато часу, а команда боїться чіпати старі сторінки, бо зміна в одному місці ламає інше. **Це питання не естетики, а вартості кожної наступної зміни.**" },
    { type: "section", title: "Технологічна база обмежує розвиток" },
    { type: "text", text: "Іноді дизайн тримається не на рішеннях, а на обмеженнях платформи. Потрібну функцію неможливо додати без перебудови, інтеграцію з CRM роблять обхідними шляхами, а зміна тексту потребує розробника." },
    { type: "highlight", text: "Якщо бізнес планує завдання навколо обмежень сайту, сайт уже керує бізнесом, а не навпаки." },
    { type: "text", text: "У такому випадку редизайн варто розглядати разом із технічним рішенням. Новий інтерфейс на старій основі лише відкладе ту саму проблему." },
    { type: "section", title: "Бренд змінився, а сайт — ні" },
    {
      type: "text",
      text: "Нове позиціонування, інша аудиторія, оновлена айдентика — а сайт досі говорить старим голосом. Клієнт бачить одну компанію в презентації та іншу на сайті, і це знижує довіру ще до першої розмови.\n\nУзгодженість важлива не лише візуально. Тон текстів, логіка подачі та сценарії мають підтримувати те, що бренд обіцяє сьогодні.",
    },
  ],
};

/** Теми з макета каталогу. Тексту ще немає, тож вони стартують чернетками. */
const DRAFTS: { slug: string; title: string; excerpt: string; category: BlogCategoryKey; date: string; illustration: IllustrationName }[] = [
  { slug: "logotyp-chy-brend-systema", title: "Логотип чи бренд-система: що насправді потрібно бізнесу", excerpt: "Коли достатньо знака, а коли без правил і носіїв бренд розсипається на кожному новому макеті.", category: "branding", date: "2026-10-02", illustration: "flower" },
  { slug: "koly-hotovoi-cms-ne-vystachaie", title: "Коли готової CMS уже не вистачає", excerpt: "Ознаки того, що шаблон став обмеженням.", category: "development", date: "2026-09-24", illustration: "knot" },
  { slug: "yakyi-bryf-dopomahaie-dyzaineru", title: "Який бриф допомагає дизайнеру", excerpt: "Що варто описати до старту, а що залишити на дослідження.", category: "design", date: "2026-09-16", illustration: "wave" },
  { slug: "skilky-maie-koshtuvaty-sait", title: "Скільки має коштувати сайт — і чому це неправильне запитання", excerpt: "Від чого насправді залежить бюджет і як порівнювати пропозиції.", category: "business", date: "2026-09-05", illustration: "web" },
  { slug: "kontent-systema-dlia-komandy", title: "Контент-система, яку команда зможе підтримувати", excerpt: "Як домовитися про формати, ролі та ритм публікацій, щоб соцмережі не залежали від настрою.", category: "digital", date: "2026-08-28", illustration: "sphere" },
  { slug: "shcho-avtomatyzuvaty-pershym", title: "Що автоматизувати першим: заявки, замовлення чи звіти", excerpt: "Починаємо з процесу, який найчастіше повторюється і найдорожче коштує через помилки.", category: "development", date: "2026-08-19", illustration: "infinity" },
];

/** Початкові записи для першого заповнення бази та запасний варіант без бази. */
export function staticBlogRecords(): BlogRecord[] {
  return [
    { slug: ARTICLE_SLUG, published: true, doc: REDESIGN },
    ...DRAFTS.map((d) => {
      const doc = newBlogDoc(d.title);
      return {
        slug: d.slug,
        published: false,
        doc: { ...doc, excerpt: d.excerpt, category: d.category, date: d.date, cover: { illustration: d.illustration } },
      };
    }),
  ];
}
