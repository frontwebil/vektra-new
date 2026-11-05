# Vektra: сайт на Next.js і TypeScript

## Як запустити

**Windows:** двічі клацніть `start.bat`. Перший запуск встановить залежності й збере сайт, це займе кілька хвилин. Потім сайт відкриється за адресою http://localhost:3000.

**Будь-яка система:** потрібен Node.js 20.9 або новіший.

```bash
npm install
npm run build
npm start
```

Для роботи з кодом: `npm run dev`. На Vercel проєкт публікується без додаткових налаштувань.

## Сторінки

| Адреса | Сторінка |
|---|---|
| `/` | Головна |
| `/services` | Послуги |
| `/services/branding` | Стратегія & Брендинг (повний макет із Figma) |
| `/services/ux-ui`, `web-development`, `digital-social`, `qa-launch`, `automation` | Решта послуг (спільний шаблон) |
| `/projects` | Проєкти |
| `/projects/pumplab` | Повний кейс |
| `/projects/clave-shop`, `/projects/softh-cto` | Короткі кейси |
| `/about` | Про нас |
| `/contacts` | Контакти |
| `/blog`, `/blog/yak-zrozumity-shcho-saytu-potriben-redyzayn` | Блог і стаття |

## Де що лежить

- `lib/content.ts`: усі тексти, послуги, кейси, відгуки, контакти.
- `public/illustrations`: ілюстрації. `lib/illustrations.ts`: їхні розміри й характер руху.
- `public/images`: фото проєктів і логотипи клієнтів.
- `lib/particles.ts`: анімація ілюстрацій на WebGL.
- `components/Motion.tsx`: анімації текстів і скролу, переходи між сторінками.
- `components/RequestModal.tsx`: попап заявки. Відкривається з будь-якої кнопки через `RequestButton`.
- `styles/system.css`: кольори та основа. `styles/sections.css`: секції. `styles/responsive.css`: планшет і телефон.

## Заміна ілюстрацій на оригінали з Figma

Файли зараз вирізані зі скриншотів макета. Експортуйте оригінали у PNG (бажано 2x), назвіть так само й покладіть у `public/illustrations`:
`hero`, `flower`, `lattice`, `knot`, `wave`, `sphere`, `infinity`, `vortex`, `web`.
Потім оновіть `w` і `h` у `lib/illustrations.ts`. Форма, частинки й рух перебудуються самі. Підходить чорний або прозорий фон.

Фото проєктів так само замінюються в `public/images`: `pumplab.jpg`, `clave.jpg`, `softh-cto.jpg`.

## Куди приходять заявки

Сервера для заявок немає: форми відкривають лист на адресу з `lib/content.ts`. Щоб заявки надходили на ваш обробник, скопіюйте `.env.example` у `.env.local` і вкажіть адресу в `NEXT_PUBLIC_REQUEST_ENDPOINT`.

## Адаптив

| Ширина | Макет | Масштаб |
|---|---|---|
| від 1200 px | десктоп, 4 колонки | 1rem = ширина / 144, до 1920 px |
| 768–1199 px | планшет, 2 колонки | 1rem = ширина / 83.4, до 11.5 px |
| до 767 px | телефон, 1 колонка | 1rem = ширина / 39 |

Якщо в системі ввімкнено зменшення руху, анімації вимикаються, а ілюстрації показуються статичними.
