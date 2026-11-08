/**
 * Кейси портфоліо: контент окремо від верстки.
 *
 * Сторінка app/projects/[slug] — один шаблон для всіх кейсів. Щоб додати кейс:
 *   1. додайте проєкт у PROJECTS (lib/content.ts): назва, обкладинка, категорія — їх використовують
 *      список проєктів, головна та блок Next project;
 *   2. додайте об'єкт CaseStudy у CASES нижче з тим самим slug. Найпростіше — скопіювати CASE_TEMPLATE.
 *
 * Обов'язкові секції: hero, overview, challenge, approach, solution, result (+ Next project формується сам).
 * Необов'язкові: system, experience, technology, testimonial. Якщо поля немає — секція не рендериться,
 * а нумерація (01), (02)… перераховується автоматично, тож ритм сторінки не ламається.
 * Поки для проєкту немає CaseStudy, сторінка показує короткий кейс із даних PROJECTS.
 *
 * Тексти: не вигадувати метрики, відгуки та інтеграції. Немає реальних даних — не заповнюйте поле.
 */
import { PROJECTS, REVIEWS, type Project } from "./content";
import type { IllustrationName } from "./illustrations";

/* ---------- Базові типи -------------------------------------------------- */

/**
 * Рядок великого заголовка. dim — другий (сірий) тон.
 * indent — зсув рядка по сітці: 1 = ½ колонки, 2 = 1 колонка, 3 = 1½, 4 = 2 колонки.
 */
export type Line = { t: string; dim?: boolean; indent?: 1 | 2 | 3 | 4 };

/** Абзац: звичайний рядок або частини з різним тоном. */
export type Rich = string | { t: string; dim?: boolean }[];

export type Item = { title: string; text: string };

type MediaBase = {
  /** Пропорції слота, напр. "16/9". Слот резервує місце до завантаження: без зсуву макета. */
  ratio?: string;
  /** Короткий підпис поверх медіа. */
  caption?: string;
};

/**
 * Медіа-слот.
 * image — jpg / png / webp / avif / gif (gif віддається без оптимізації, щоб анімація не зламалась);
 * video — mp4 / webm: без звуку, по колу, вмикається лише у видимій зоні й ставиться на паузу поза нею;
 * illustration — частинки Vektra; device — ноутбук + телефон;
 * placeholder — порожня заглушка під фото з підписом (поки немає реального скриншота).
 */
export type Media =
  | (MediaBase & { type: "image"; src: string; alt: string; position?: string })
  | (MediaBase & { type: "video"; src: string | { src: string; type: string }[]; poster?: string; alt?: string })
  | (MediaBase & { type: "illustration"; name: IllustrationName; zoom?: number; density?: number })
  | (MediaBase & { type: "device"; desktop: Media; mobile: Media })
  | (MediaBase & { type: "placeholder"; label: string });

/**
 * Макети модулів рішення. Кількість модулів не обмежена: скільки об'єктів у solution.modules —
 * стільки блоків «фото + заголовок + текст» на сторінці, нумерація [ 01 ], [ 02 ]… рахується сама.
 * Чергуйте макети, щоб кейс читався як історія, а не галерея:
 * wide → closeup → split → cinematic → device → pair …
 *
 * wide      — медіа на всю ширину контенту, текст рядком над ним;        media[0]
 * split     — 50 / 50 текст і медіа (reverse міняє сторони);              media[0]
 * pair      — два пов'язані екрани зі зсувом по вертикалі;                 media[0], media[1]
 * device    — сцена з ноутбуком і телефоном на панелі з частинками;        media[0] desktop, media[1] mobile
 * closeup   — великий кадрований фрагмент, текст закріплений збоку;        media[0]
 * cinematic — медіа від краю до краю сторінки, мінімум тексту;             media[0]
 */
export type SolutionLayout = "wide" | "split" | "pair" | "device" | "closeup" | "cinematic";

export type SolutionModule = {
  layout: SolutionLayout;
  title: string;
  text: string;
  media: Media[];
  reverse?: boolean;
};

export type CaseMeta = {
  industry?: string;
  year?: string;
  services?: string[];
  market?: string;
  platform?: string;
  /** Посилання на живий сайт. */
  website?: string;
  team?: string;
  technology?: string;
};

/** Клітинка секції System. size: lg — 2×2, wide — 2×1, tall — 1×2, без size — 1×1. */
export type SystemCell = {
  key: string;
  title?: string;
  text?: string;
  /** Зразок шрифту, напр. "Aa". */
  specimen?: string;
  /** Кольори проєкту. */
  swatches?: string[];
  media?: Media;
  size?: "lg" | "wide" | "tall";
};

export type Testimonial = {
  quote: Rich;
  name: string;
  role: string;
  country?: string;
  logo?: string;
};

export type CaseStudy = {
  slug: string;
  name: string;
  /** Номер у мітці [ PROJECT / 01 ]. За замовчуванням — позиція в PROJECTS. */
  index?: string;
  /** Головна цінність проєкту, а не тип роботи. */
  statement: Line[];
  /** Опис для пошуковиків і соцмереж. */
  description: string;
  meta: CaseMeta;
  hero: { media: Media; illustration?: IllustrationName };

  overview: { headline: Line[]; body: Rich[]; tags?: string[] };
  challenge: { headline: Line[]; items: Item[] };
  approach: { headline?: Line[]; illustration?: IllustrationName; steps: Item[] };
  solution: { headline: Line[]; note?: string; modules: SolutionModule[] };

  /** label змінює підпис секції, напр. "Brand system" або "Architecture". */
  system?: { label?: string; headline: Line[]; text?: string; cells: SystemCell[] };
  /** Для брендингу: label "Brand in use", а items — social, packaging, print… */
  experience?: { label?: string; headline: Line[]; text?: string; items: { label: string; media: Media }[] };
  technology?: { label?: string; headline: Line[]; stack?: string[]; items: Item[] };

  /** metrics — лише реальні цифри. Немає цифр — залиште поле порожнім. */
  result: { headline: Line[]; metrics?: { value: number; prefix?: string; suffix?: string; label: string; text?: string }[]; items: Item[] };
  /** Лише справжній відгук. Немає відгуку — секція прихована. */
  testimonial?: Testimonial;
  /** slug наступного кейсу. За замовчуванням — наступний у PROJECTS. */
  next?: string;
};

/** Те, що рендерить шаблон. Для короткого кейсу частина обов'язкових секцій ще порожня. */
export type CaseView = Omit<CaseStudy, "challenge" | "approach" | "solution" | "result"> &
  Partial<Pick<CaseStudy, "challenge" | "approach" | "solution" | "result">>;

function fromReview(i: number, quote?: Rich): Testimonial {
  const r = REVIEWS[i];
  return { quote: quote ?? r.paragraphs[0], name: r.name, role: r.company, logo: r.logo };
}

function cover(p: Project): Media {
  return { type: "image", src: p.image, alt: p.alt };
}

/** Заглушка під фото: підпис + пропорції слота. Замініть на { type: "image", src, alt }, коли буде скриншот. */
const ph = (label: string, ratio: string): Media => ({ type: "placeholder", label, ratio });

const project = (slug: string) => PROJECTS.find((p) => p.slug === slug)!;

/* ---------- Кейси -------------------------------------------------------- */

const pumplab = project("pumplab");

export const CASES: CaseStudy[] = [
  {
    slug: "pumplab",
    name: pumplab.name,
    statement: [{ t: "Кастомна e-commerce" }, { t: "система для клієнта", dim: true, indent: 1 }, { t: "й бізнесу." }],
    description: `${pumplab.lead} ${pumplab.rest}`,
    meta: {
      industry: "E-commerce",
      year: "2026",
      services: ["UX/UI", "Development", "Automation"],
      market: "Ukraine",
      platform: "Web",
    },
    hero: { media: cover(pumplab), illustration: "wave" },
    overview: {
      headline: [{ t: "Не просто магазин." }, { t: "Робочий інструмент", dim: true, indent: 2 }, { t: "для бізнесу.", indent: 2 }],
      body: [
        "Клієнт звернувся із задачею створити власну e-commerce платформу для магазину спортивного харчування.",
        [{ t: "Основною проблемою було поєднати великий каталог із варіаціями товарів, зрозумілий шлях до покупки та щоденне керування магазином без залучення розробника.", dim: true }],
        [{ t: "Метою стало спростити покупки для клієнтів і щоденне управління магазином для бізнесу.", dim: true }],
      ],
      tags: pumplab.tags,
    },
    challenge: {
      headline: [{ t: "Складна система." }, { t: "Простий досвід.", dim: true, indent: 2 }],
      items: [
        { title: "Великий каталог", text: "Покупець має швидко дістатися потрібного товару, навіть якщо не знає його точної назви." },
        { title: "Варіативні товари", text: "Смак, фасування та наявність мають бути зрозумілими ще до додавання в кошик." },
        { title: "Складний checkout", text: "Кожне зайве поле чи крок на оформленні — ще одна причина не завершити покупку." },
        { title: "Управління без розробника", text: "Товари, ціни, контент і замовлення команда має змінювати самостійно." },
      ],
    },
    approach: {
      headline: [{ t: "Від задачі" }, { t: "до системного", dim: true }, { t: "рішення." }],
      illustration: "lattice",
      steps: [
        { title: "Research", text: "Вивчаємо продукт, аудиторію та те, як магазин працює щодня — із боку покупця й команди." },
        { title: "Structure", text: "Вибудовуємо логіку каталогу, категорій і сценаріїв, перш ніж малювати інтерфейс." },
        { title: "UX", text: "Проєктуємо шлях від пошуку до покупки та перевіряємо, де він може обриватися." },
        { title: "UI System", text: "Збираємо компоненти й стани в систему, щоб нові сторінки не вимагали нового дизайну." },
        { title: "Development", text: "Реалізуємо frontend, backend, інтеграції та власну адмін-панель керування." },
        { title: "Launch", text: "Тестуємо ключові сценарії на різних пристроях і готуємо продукт до запуску." },
      ],
    },
    solution: {
      headline: [{ t: "Одна система" }, { t: "для покупця", dim: true, indent: 2 }, { t: "й команди.", indent: 2 }],
      note: "[ Заглушки. Замініть реальними скриншотами ]",
      modules: [
        {
          layout: "wide",
          title: "Smart catalog",
          text: "Фільтри, категорії та варіації товарів спроєктовані так, щоб користувач швидко переходив від пошуку до покупки.",
          media: [ph("Smart catalog / screenshot", "132/66")],
        },
        {
          layout: "split",
          reverse: true,
          title: "Custom checkout",
          text: "Послідовний сценарій покупки без зайвих кроків і непотрібних полів.",
          media: [ph("Checkout / screenshot", "66/56")],
        },
        {
          layout: "closeup",
          title: "Admin system",
          text: "Власна система керування товарами, цінами, контентом і замовленнями.",
          media: [ph("Admin panel / screenshot", "99/56")],
        },
      ],
    },
    result: {
      headline: [{ t: "Не просто" }, { t: "інтернет-магазин.", dim: true, indent: 1 }, { t: "Готова система.", indent: 3 }],
      items: [
        { title: "Простіший шлях до покупки", text: "Покупець без зайвих кроків проходить шлях від каталогу до оформлення." },
        { title: "Незалежне управління магазином", text: "Команда сама керує товарами, цінами, контентом і замовленнями." },
        { title: "Автоматизовані процеси", text: "Ключові e-commerce процеси більше не потребують постійної ручної роботи." },
        { title: "Готовність до масштабування", text: "Система дозволяє додавати товари, сторінки та функції без перебудови основи." },
      ],
    },
    testimonial: {
      ...fromReview(0),
      country: "Ukraine",
      quote: [
        { t: "Дуже вдячні за швидку реакцію та за те, що ви одразу зрозуміли, " },
        { t: "що саме нам потрібно.", dim: true },
        { t: " Ви завжди ввічливо сприймали всі наші зауваження та побажання " },
        { t: "і дуже швидко вносили необхідні зміни.", dim: true },
      ],
    },
  },
];

/* ---------- Майстер-шаблон ----------------------------------------------- */

/**
 * Еталон зі всіма секціями та всіма макетами модулів. Копіюйте його для нового кейсу.
 * Відкривається лише в режимі розробки: /projects/case-template.
 */
export const CASE_TEMPLATE: CaseStudy = {
  slug: "case-template",
  name: "[Project name]",
  index: "00",
  statement: [{ t: "[Project value" }, { t: "statement —", dim: true, indent: 1 }, { t: "головна цінність]" }],
  description: "Шаблон кейсу Vektra.",
  meta: {
    industry: "[Industry]",
    year: "[Year]",
    services: ["[Service 01]", "[Service 02]", "[Service 03]"],
    market: "[Country / Region]",
    platform: "[Web / Mobile / Brand]",
    website: "#",
    team: "[Team / optional]",
    technology: "[Stack / optional]",
  },
  hero: { media: ph("Project hero media / image · video · device scene", "99/75"), illustration: "wave" },
  overview: {
    headline: [{ t: "[Project overview" }, { t: "headline —", dim: true, indent: 2 }, { t: "у 2–3 рядки]", indent: 2 }],
    body: [
      "[Client / business context: хто клієнт і що це за бізнес.]",
      [{ t: "[What the product is і для кого він створювався.]", dim: true }],
      [{ t: "[Why the project was created: бізнес-потреба та що саме потрібно було реалізувати.]", dim: true }],
    ],
    tags: ["[Category]", "[Service]", "[Platform]"],
  },
  challenge: {
    headline: [{ t: "[Challenge" }, { t: "statement]", dim: true, indent: 2 }],
    items: [
      { title: "[Challenge title]", text: "[Реальна задача продукту або бізнесу. 1–2 короткі речення.]" },
      { title: "[Challenge title]", text: "[Реальна задача продукту або бізнесу. 1–2 короткі речення.]" },
      { title: "[Challenge title]", text: "[Реальна задача продукту або бізнесу. 1–2 короткі речення.]" },
      { title: "[Challenge title]", text: "[Реальна задача продукту або бізнесу. 1–2 короткі речення.]" },
    ],
  },
  approach: {
    headline: [{ t: "Від задачі" }, { t: "до системного", dim: true }, { t: "рішення." }],
    illustration: "lattice",
    steps: [
      { title: "Research", text: "[Що досліджували і навіщо.]" },
      { title: "Structure", text: "[Як вибудували логіку продукту.]" },
      { title: "Concept", text: "[Яку ідею поклали в основу рішення.]" },
      { title: "Design", text: "[Як концепцію перетворили на систему інтерфейсу.]" },
      { title: "Development", text: "[Що реалізували. Етап можна прибрати.]" },
      { title: "Launch", text: "[Як готували продукт до запуску.]" },
    ],
  },
  solution: {
    headline: [{ t: "[Solution" }, { t: "headline]", dim: true, indent: 2 }],
    note: "[ Будь-яка кількість модулів. Чергуйте макети ]",
    modules: [
      { layout: "wide", title: "[Solution title]", text: "[Яку задачу вирішує модуль і що це дає користувачу.]", media: [ph("Wide media / animated UI", "132/66")] },
      { layout: "closeup", title: "[Solution title]", text: "[Яку задачу вирішує модуль і що це дає користувачу.]", media: [ph("UI close-up / cropped fragment", "99/62")] },
      { layout: "split", title: "[Solution title]", text: "[Яку задачу вирішує модуль і що це дає користувачу.]", media: [ph("Screen / video", "66/56")], reverse: true },
      { layout: "cinematic", title: "[Solution title]", text: "[Мінімальний підпис до великого візуалу.]", media: [ph("Cinematic / full-screen animation", "144/64")] },
      { layout: "device", title: "[Solution title]", text: "[Як рішення працює на різних пристроях.]", media: [ph("Desktop", "16/10"), ph("Mobile", "9/19")] },
      { layout: "pair", title: "[Solution title]", text: "[Як пов'язані два екрани одного сценарію.]", media: [ph("Screen A", "66/80"), ph("Screen B", "66/48")] },
    ],
  },
  system: {
    headline: [{ t: "Одна система." }, { t: "Багато сценаріїв.", dim: true, indent: 2 }],
    text: "[Що входить у систему проєкту: UI — типографіка, кольори, компоненти; Branding — логотип, палітра, графічна мова; Development — архітектура, модулі, API.]",
    cells: [
      { key: "Typography", specimen: "Aa", title: "[Font family]", size: "lg" },
      { key: "Colors", swatches: ["#ffffff", "#808080", "#333333", "#000001"] },
      { key: "Components", title: "[Component]", text: "[Короткий опис ролі.]" },
      { key: "States", media: ph("States / interaction", "33/18"), size: "wide" },
      { key: "Responsive", title: "[Principle]", text: "[Як система адаптується.]" },
      { key: "Forms", title: "[Component]", text: "[Короткий опис ролі.]" },
    ],
  },
  experience: {
    headline: [{ t: "Продукт," }, { t: "який працює", dim: true, indent: 1 }, { t: "в реальних сценаріях.", indent: 1 }],
    text: "[Де і як продуктом користуються. Для брендингу — Brand in use: social, packaging, print, web.]",
    items: [
      { label: "Desktop", media: ph("Desktop", "16/10") },
      { label: "Mobile", media: ph("Mobile", "9/19") },
      { label: "Tablet — optional", media: ph("Tablet", "4/3") },
      { label: "Animation — optional", media: ph("Interaction sequence", "4/3") },
    ],
  },
  technology: {
    headline: [{ t: "Те, чого не видно." }, { t: "Але на чому", dim: true, indent: 2 }, { t: "все працює.", dim: true, indent: 2 }],
    stack: ["[Frontend]", "[Backend]", "[CMS]", "[Infrastructure]"],
    items: [
      { title: "[Payments]", text: "[Функція технології для бізнесу, напр.: оплата синхронізована зі статусами замовлення.]" },
      { title: "[Delivery]", text: "[Функція технології для бізнесу, напр.: дані доставки підтягуються без ручного введення.]" },
      { title: "[CRM]", text: "[Функція технології для бізнесу.]" },
      { title: "[API]", text: "[Функція технології для бізнесу.]" },
    ],
  },
  result: {
    headline: [{ t: "Не просто" }, { t: "реалізовано.", dim: true, indent: 1 }, { t: "Готово працювати.", indent: 2 }],
    metrics: [
      { value: 0, suffix: "%", label: "[Metric — лише реальні]", text: "[Що змінилося.]" },
      { value: 0, suffix: "×", label: "[Metric — лише реальні]", text: "[Що змінилося.]" },
      { value: 0, label: "[Metric — лише реальні]", text: "[Що змінилося.]" },
    ],
    items: [
      { title: "[Result]", text: "[Цінність для користувача або бізнесу.]" },
      { title: "[Result]", text: "[Цінність для користувача або бізнесу.]" },
      { title: "[Result]", text: "[Цінність для користувача або бізнесу.]" },
      { title: "[Result]", text: "[Цінність для користувача або бізнесу.]" },
    ],
  },
  testimonial: {
    quote: [{ t: "“[Real client review — " }, { t: "лише справжній відгук. Немає відгуку — секція прихована.]”", dim: true }],
    name: "[Client name]",
    role: "[Role / Company]",
    country: "[Country — optional]",
  },
};

/* ---------- Доступ ------------------------------------------------------- */

const isDev = process.env.NODE_ENV !== "production";

/** Короткий кейс із карточки проєкту, поки повний CaseStudy не заповнений. */
function brief(p: Project): CaseView {
  const words = p.name.split(" ");
  const review = REVIEWS.findIndex((r) => r.logo.includes(p.slug.split("-")[0]));
  return {
    slug: p.slug,
    name: p.name,
    statement: words.length > 1 ? [{ t: words[0] }, { t: words.slice(1).join(" "), dim: true, indent: 1 }] : [{ t: p.name }],
    description: `${p.lead} ${p.rest}`,
    meta: {
      industry: p.category,
      year: p.year ?? undefined,
      services: p.services.split(", "),
      platform: "Web",
    },
    hero: { media: cover(p), illustration: p.slug === "clave-shop" ? "knot" : "sphere" },
    overview: { headline: [{ t: "Що зробили" }], body: [[{ t: `${p.lead} ` }, { t: p.rest, dim: true }]], tags: p.tags },
    testimonial: review >= 0 ? fromReview(review) : undefined,
  };
}

export function getCase(slug: string): CaseView | null {
  if (slug === CASE_TEMPLATE.slug) return isDev ? CASE_TEMPLATE : null;
  const full = CASES.find((c) => c.slug === slug);
  if (full) return full;
  const p = PROJECTS.find((x) => x.slug === slug);
  return p ? brief(p) : null;
}

export function caseSlugs() {
  return [...PROJECTS.map((p) => p.slug), ...(isDev ? [CASE_TEMPLATE.slug] : [])];
}

/**
 * Порядок кейсів, як на сторінці /projects ([ 01 / 03 ] …). Від нього залежать
 * номер у мітці [ PROJECT / 01 ] і блок Next project. Новий кейс — додайте slug сюди.
 */
export const CASE_ORDER = ["pumplab", "clave-shop", "softh-cto"];

/** Усі проєкти в порядку CASE_ORDER; проєкти, яких там немає, — у кінці. */
export const orderedProjects = (): Project[] => [
  ...CASE_ORDER.map((s) => PROJECTS.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p)),
  ...PROJECTS.filter((p) => !CASE_ORDER.includes(p.slug)),
];

export function caseIndex(c: CaseView) {
  if (c.index) return c.index;
  const i = orderedProjects().findIndex((p) => p.slug === c.slug);
  return String(i + 1).padStart(2, "0");
}

export function nextProject(c: CaseView): Project {
  const list = orderedProjects();
  if (c.next) {
    const n = list.find((p) => p.slug === c.next);
    if (n) return n;
  }
  const i = list.findIndex((p) => p.slug === c.slug);
  return list[(i + 1) % list.length];
}
