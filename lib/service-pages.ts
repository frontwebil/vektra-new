import { cache } from "react";
import { BRANDING, BRANDING_PRICING, FAQ, PRICING, PROJECTS, SERVICES, type Service } from "@/lib/content";
import type { IllustrationName } from "@/lib/illustrations";
import { getPrisma } from "@/lib/prisma";

export type ServicePageData = {
  sectionOrder: ServiceSectionKey[];
  whyLeft: string;
  whyRight: string;
  whenLabel: string;
  processLeft: string;
  processRight: string;
  pricingLeft: string;
  pricingRight: string;
  hero: string;
  heroRest: string;
  heroAction: string;
  form: IllustrationName;
  whyTitle: string[];
  why: { a: string; b: string; text: string }[];
  whenTitle: string[];
  when: { t: string; d: string }[];
  whenText: string;
  includedLabel: string;
  includedLead: string;
  included: { t: string; d: string }[];
  processTitle: string[];
  process: { letter: string; n: string; title: string; text: string; result?: string }[];
  workTitle: string[];
  workSlugs: string[];
  pricing: { badge: string; title: string[]; text: string; features: string[]; foot: string; featured?: boolean }[];
  pricingCta: string;
  faqTitle: string[];
  faqText: string;
  faq: { q: string; a: string }[];
  ctaQ: string;
  ctaText: string;
  ctaTag: string;
  ctaLines: string[];
  ctaAction: string;
};

export type ServiceSectionKey = "why" | "when" | "included" | "process" | "work" | "pricing" | "faq" | "cta";

const serviceSectionOrders: Record<string, ServiceSectionKey[]> = {
  branding: ["why", "when", "included", "process", "work", "pricing", "faq", "cta"],
  "ux-ui": ["why", "included", "process", "work", "when", "pricing", "faq", "cta"],
  "web-development": ["included", "why", "process", "work", "when", "pricing", "faq", "cta"],
  "digital-social": ["why", "work", "included", "when", "process", "faq", "pricing", "cta"],
  "qa-launch": ["included", "when", "process", "why", "faq", "pricing", "cta"],
  automation: ["when", "why", "included", "process", "work", "pricing", "faq", "cta"],
};

const serviceProcesses: Record<string, ServicePageData["process"]> = {
  "ux-ui": [
    { letter: "A", n: "01", title: "Дослідження", text: "Вивчаємо користувачів, контекст продукту та основні сценарії взаємодії.", result: "розуміння аудиторії та її потреб." },
    { letter: "B", n: "02", title: "Структура", text: "Будуємо інформаційну архітектуру й визначаємо логіку ключових сторінок.", result: "узгоджена структура продукту." },
    { letter: "C", n: "03", title: "Дизайн", text: "Створюємо прототипи, візуальну систему й адаптивні макети.", result: "готовий до розробки інтерфейс." },
    { letter: "D", n: "04", title: "Передача", text: "Готуємо макети, компоненти та специфікації для команди розробки.", result: "матеріали для точного впровадження." },
  ],
  "web-development": [
    { letter: "A", n: "01", title: "Вимоги й план", text: "Уточнюємо функціонал, інтеграції, контент і критерії запуску.", result: "погоджений обсяг і технічний план." },
    { letter: "B", n: "02", title: "Архітектура", text: "Визначаємо структуру системи, дані та технології під задачу.", result: "основа для масштабованої розробки." },
    { letter: "C", n: "03", title: "Розробка", text: "Створюємо інтерфейс, серверну логіку й потрібні інтеграції.", result: "робоча версія продукту." },
    { letter: "D", n: "04", title: "Перевірка й запуск", text: "Тестуємо сценарії, виправляємо помилки та готуємо реліз.", result: "стабільний продукт онлайн." },
  ],
  "digital-social": [
    { letter: "A", n: "01", title: "Аудит", text: "Оцінюємо бренд, аудиторію, канали й поточний контент.", result: "розуміння точки старту." },
    { letter: "B", n: "02", title: "Стратегія", text: "Формуємо теми, тон комунікації та пріоритетні формати.", result: "цілісний напрямок комунікації." },
    { letter: "C", n: "03", title: "Виробництво", text: "Готуємо контент і візуали та плануємо публікації.", result: "контент-план і готові матеріали." },
    { letter: "D", n: "04", title: "Оптимізація", text: "Аналізуємо реакції аудиторії й коригуємо наступні активності.", result: "зрозумілі наступні кроки росту." },
  ],
  "qa-launch": [
    { letter: "A", n: "01", title: "План перевірки", text: "Уточнюємо функціонал, платформи та критичні сценарії.", result: "пріоритетний план тестування." },
    { letter: "B", n: "02", title: "Тестування", text: "Перевіряємо функції, адаптивність і поведінку на пристроях.", result: "список підтверджених дефектів." },
    { letter: "C", n: "03", title: "Повторна перевірка", text: "Перевіряємо виправлення та проходження основних сценаріїв.", result: "підтверджена якість релізу." },
    { letter: "D", n: "04", title: "Підготовка запуску", text: "Звіряємо чеклист, середовище та критичні налаштування.", result: "продукт готовий до запуску." },
  ],
  automation: [
    { letter: "A", n: "01", title: "Аудит процесу", text: "Розбираємо поточний процес, інструменти та повторювані задачі.", result: "визначені точки для автоматизації." },
    { letter: "B", n: "02", title: "Сценарій", text: "Проєктуємо послідовність дій, умови та обробку винятків.", result: "узгоджена схема автоматизації." },
    { letter: "C", n: "03", title: "Інтеграція", text: "З’єднуємо сервіси, налаштовуємо передачу даних і сповіщення.", result: "автоматизований робочий процес." },
    { letter: "D", n: "04", title: "Тест і передача", text: "Перевіряємо сценарії та пояснюємо команді роботу системи.", result: "перевірене рішення, готове до роботи." },
  ],
};

export function defaultServicePage(service: Service): ServicePageData {
  if (service.slug === "branding") {
    return {
      sectionOrder: serviceSectionOrders.branding,
      whyLeft: "Чому",
      whyRight: "Навіщо",
      whenLabel: "Коли потрібен брендинг",
      processLeft: "How we work",
      processRight: "Process",
      pricingLeft: "Price",
      pricingRight: "Формат співпраці",
      hero: BRANDING.hero,
      heroRest: BRANDING.heroRest,
      heroAction: "Розрахувати вартість",
      form: "flower",
      whyTitle: ["Не просто", "впізнавано.", "Зрозуміло, хто ви."],
      why: BRANDING.why,
      whenTitle: ["Якщо бренд вже є,", "але напрямку", "ще немає."],
      when: BRANDING.when,
      whenText: BRANDING.whenText,
      includedLabel: "Склад послуги",
      includedLead: "Стратегія визначає напрямок,\nайдентика робить його видимим.",
      included: BRANDING.included,
      processTitle: ["Від дослідження", "до бренду, який", "можна запускати."],
      process: BRANDING.process,
      workTitle: ["Стратегія, яку", "можна побачити"],
      workSlugs: ["clave-shop", "softh-cto"],
      pricing: BRANDING_PRICING,
      pricingCta: "Подати запит",
      faqTitle: ["Перед стартом", "брендингу"],
      faqText: "Зібрали запитання, які найчастіше виникають перед стартом брендингу. Якщо вашого тут немає, поставте його напряму.",
      faq: BRANDING.faq,
      ctaQ: "Ваш бренд",
      ctaText: "Розкажіть, що відбувається з брендом зараз і куди ви хочете його привести.",
      ctaTag: "Contact us",
      ctaLines: ["Може", "говорити", "чіткіше"],
      ctaAction: "Обговорити проєкт",
    };
  }

  const serviceCopy: Record<string, { whyTitle: string[]; whenTitle: string[]; includedLead: string; processTitle: string[]; workTitle: string[]; faqTitle: string[] }> = {
    "ux-ui": {
      whyTitle: ["Досвід, який", "починається з", "користувача."],
      whenTitle: ["Коли продукту", "потрібен кращий", "досвід."],
      includedLead: "Логіка й візуальна мова\nпрацюють як єдине ціле.",
      processTitle: ["Від дослідження", "до прототипу", "й готового дизайну."],
      workTitle: ["Інтерфейси, що", "ведуть до дії"],
      faqTitle: ["Перед початком", "дизайну"],
    },
    "web-development": {
      whyTitle: ["Надійна основа", "для цифрового", "продукту."],
      whenTitle: ["Коли ідею", "час перетворити", "на продукт."],
      includedLead: "Від структури та коду\nдо готового запуску.",
      processTitle: ["Від плану", "до протестованого", "релізу."],
      workTitle: ["Продукти, які", "готові до зростання"],
      faqTitle: ["Перед розробкою", "сайту чи платформи"],
    },
    "digital-social": {
      whyTitle: ["Комунікація,", "яку аудиторія", "помічає."],
      whenTitle: ["Коли контенту", "потрібен чіткий", "напрямок."],
      includedLead: "Стратегія, контент\nі візуальна система.",
      processTitle: ["Від голосу бренду", "до стабільної", "комунікації."],
      workTitle: ["Ідеї, що стають", "системною присутністю"],
      faqTitle: ["Перед стартом", "digital-комунікації"],
    },
    "qa-launch": {
      whyTitle: ["Запуск із", "впевненістю", "у якості."],
      whenTitle: ["Коли продукт", "має бути готовий", "до користувачів."],
      includedLead: "Перевіряємо сценарії,\nпристрої та стабільність.",
      processTitle: ["Від тестового", "сценарію до", "спокійного запуску."],
      workTitle: ["Перевірені продукти", "готові до запуску"],
      faqTitle: ["Перед релізом", "продукту"],
    },
    automation: {
      whyTitle: ["Менше ручної", "роботи. Більше", "контролю."],
      whenTitle: ["Коли процеси", "гальмують розвиток", "команди."],
      includedLead: "З’єднуємо інструменти\nв один робочий процес.",
      processTitle: ["Від аудиту", "до автоматизованого", "процесу."],
      workTitle: ["Процеси, що", "працюють самостійно"],
      faqTitle: ["Перед автоматизацією", "процесів"],
    },
  };
  const copy = serviceCopy[service.slug];
  const labels: Record<string, Pick<ServicePageData, "whyLeft" | "whyRight" | "whenLabel" | "processLeft" | "processRight" | "pricingLeft" | "pricingRight">> = {
    "ux-ui": { whyLeft: "UX", whyRight: "UI", whenLabel: "Коли потрібен UX/UI дизайн", processLeft: "Design process", processRight: "Етапи дизайну", pricingLeft: "Design formats", pricingRight: "Формат співпраці" },
    "web-development": { whyLeft: "Build", whyRight: "Scale", whenLabel: "Коли потрібна розробка", processLeft: "Development", processRight: "Етапи розробки", pricingLeft: "Development formats", pricingRight: "Формат розробки" },
    "digital-social": { whyLeft: "Content", whyRight: "Growth", whenLabel: "Коли потрібен digital", processLeft: "Content process", processRight: "Етапи комунікації", pricingLeft: "Digital formats", pricingRight: "Формат ведення" },
    "qa-launch": { whyLeft: "Quality", whyRight: "Launch", whenLabel: "Коли потрібні QA та запуск", processLeft: "QA process", processRight: "Перевірки перед запуском", pricingLeft: "QA formats", pricingRight: "Формат перевірки" },
    automation: { whyLeft: "Systems", whyRight: "Automation", whenLabel: "Коли потрібна автоматизація", processLeft: "Automation process", processRight: "Етапи автоматизації", pricingLeft: "Automation formats", pricingRight: "Формат впровадження" },
  };

  return {
    sectionOrder: serviceSectionOrders[service.slug] ?? serviceSectionOrders.branding,
    ...labels[service.slug],
    hero: service.lead,
    heroRest: service.rest,
    heroAction: "Розрахувати вартість",
    form: service.form,
    whyTitle: copy.whyTitle,
    why: [
      { a: "Чітка", b: "ціль", text: `Починаємо з задачі бізнесу й визначаємо, як ${service.short.toLowerCase()} має допомогти її розв’язати.` },
      { a: "Зрозумілий", b: "результат", text: "Погоджуємо обсяг, критерії готовності та очікуваний результат до початку робіт." },
      { a: "Цілісна", b: "реалізація", text: "Узгоджуємо рішення з продуктом, аудиторією та іншими етапами його розвитку." },
    ],
    whenTitle: copy.whenTitle,
    when: service.tags.slice(0, 4).map((tag) => ({ t: tag, d: `Допомагаємо розв’язати задачу «${tag.toLowerCase()}» у межах послуги ${service.short}.` })),
    whenText: service.accordion,
    includedLabel: "Склад послуги",
    includedLead: copy.includedLead,
    included: service.tags.map((tag) => ({ t: tag, d: `Опрацьовуємо напрям «${tag}» з урахуванням задачі, контексту та наступних кроків продукту.` })),
    processTitle: copy.processTitle,
    process: serviceProcesses[service.slug],
    workTitle: copy.workTitle,
    workSlugs: PROJECTS.map((project) => project.slug),
    pricing: PRICING,
    pricingCta: "Подати запит",
    faqTitle: copy.faqTitle,
    faqText: `Відповіді на часті запитання про ${service.short.toLowerCase()}. Якщо вашого тут немає, поставте його напряму.`,
    faq: FAQ,
    ctaQ: "Є задача?",
    ctaText: `Розкажіть, що потрібно змінити або запустити у напрямі «${service.short}».`,
    ctaTag: "Contact us",
    ctaLines: ["Знайдемо", "правильний", "напрямок."],
    ctaAction: "Обговорити задачу",
  };
}

export async function getServicePageData(service: Service): Promise<ServicePageData> {
  const fallback = defaultServicePage(service);
  try {
    const rows = await ensureServicePageTemplates();
    const saved = rows.find((row) => row.slug === service.slug);
    return saved ? { ...fallback, ...(saved.content as Partial<ServicePageData>) } : fallback;
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[database URL]") : "Unknown database error";
    console.error("Service page content could not load from database:", message);
    return fallback;
  }
}

export const ensureServicePageTemplates = cache(async function ensureServicePageTemplates() {
  const prisma = getPrisma();
  return Promise.all(SERVICES.map(async (item) => {
    const initial = defaultServicePage(item);
    const saved = await prisma.servicePageContent.upsert({
      where: { slug: item.slug },
      create: { slug: item.slug, content: initial },
      update: {},
    });
    const previous = saved.content as Partial<ServicePageData>;
    const oldGenericHeading = previous.whyTitle?.[0] === "Рішення під" || (item.slug !== "branding" && previous.whyTitle?.[0] === "Не просто");
    const oldGenericProcess = item.slug !== "branding" && previous.process?.[0]?.title === "Знайомство";
    const legacy = !previous.sectionOrder || oldGenericHeading || oldGenericProcess;
    if (Object.keys(initial).every((key) => key in previous) && !legacy) return saved;
    const merged = { ...initial, ...previous };
    if (legacy) {
      merged.sectionOrder = initial.sectionOrder;
      merged.whyTitle = initial.whyTitle;
      merged.whenTitle = initial.whenTitle;
      merged.processTitle = initial.processTitle;
      merged.workTitle = initial.workTitle;
      merged.faqTitle = initial.faqTitle;
    }
    if (oldGenericProcess) merged.process = initial.process;
    return prisma.servicePageContent.update({ where: { slug: item.slug }, data: { content: merged } });
  }));
});
