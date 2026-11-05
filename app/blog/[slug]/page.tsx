import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Banner, Lines } from "@/components/sections";
import { Crumbs, Label } from "@/components/ui";
import { ARTICLES, ARTICLE_SLUG } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [{ slug: ARTICLE_SLUG }];
}

export const metadata: Metadata = {
  title: "Як зрозуміти, що сайту потрібен редизайн",
  description: "7 сигналів, які показують, що дизайн уже не підтримує потреби користувачів і задачі бізнесу.",
};

const TOC = [
  "Сайт більше не відповідає бізнесу",
  "Користувачам складно знайти потрібне",
  "Конверсія падає, хоча трафік залишається",
  "Mobile experience став проблемою",
  "Система дизайну не масштабується",
  "Технологічна база обмежує розвиток",
  "Бренд змінився, а сайт — ні",
];

function Toc({ label }: { label: string }) {
  return (
    <nav className="ar-toc" aria-label={label}>
      <p className="label">7 сигналів</p>
      {TOC.map((t, i) => (
        <a key={t} href={`#s${i + 1}`}><span>0{i + 1}</span>{t}</a>
      ))}
    </nav>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  if (slug !== ARTICLE_SLUG) notFound();
  const related = ARTICLES.filter((a) => a.layout === "c" || a.layout === "t");
  return (
    <>
      <div className="pr" data-progress aria-hidden="true" />
      <section className="sec ar-hero" data-hero>
        <div className="wrap">
          <div className="cs-crumbs cs-crumbs--in"><Crumbs items={[{ label: "Головна", href: "/" }, { label: "Блог", href: "/blog" }, { label: "UX/UI" }]} /></div>
          <div className="ar-hero__top">
            <Label>UX/UI</Label>
            <div className="bl-meta" data-r><span>12 Oct 2026</span><span>8 min read</span></div>
          </div>
          <Lines as="h1" className="d100 ar-hero__h" lines={[{ t: "Як зрозуміти," }, { t: "що сайту потрібен", dim: true }, { t: "редизайн" }]} />
          <div className="ar-hero__g">
            <p data-r>Редизайн потрібен не тоді, коли сайт просто «набрид». Він стає необхідним, коли продукт перестає відповідати задачам бізнесу та очікуванням користувачів.</p>
          </div>
        </div>
        <div className="ar-visual sec g4">
          <Illustration name="lattice" className="fx ar-visual__il" density={1.5} />
        </div>
      </section>

      <section className="sec" data-article>
        <div className="wrap ar-body">
          <Toc label="Зміст статті" />
          <div className="ar-col prose">
            <section className="sect" id="s1">
              <span className="sect__n">01</span>
              <h2 data-r>Сайт більше не відповідає бізнесу</h2>
              <p>Компанія змінюється швидше за свій сайт. З’являються нові послуги, сегменти клієнтів і ринки, а головна сторінка досі описує бізнес таким, яким він був кілька років тому.</p>
              <p>Найпростіша перевірка — покажіть сайт людині, яка не знає вашої компанії, і запитайте, що ви робите та для кого. Якщо відповідь не збігається з тим, що ви продаєте сьогодні, проблема вже не у візуальній частині.</p>
              <div className="hl" data-r>Редизайн починається тоді, коли сайт розповідає про компанію, якої вже не існує.</div>
            </section>
            <section className="sect" id="s2">
              <span className="sect__n">02</span>
              <h2 data-r>Користувачам складно знайти потрібне</h2>
              <p>Меню розростається разом із бізнесом: кожен новий розділ додають туди, де знайшлося місце. Згодом структура відображає внутрішню логіку компанії, а не те, як думає клієнт.</p>
              <h3>Що варто перевірити</h3>
              <ul>
                <li>Які запитання менеджери чують найчастіше, хоча відповіді вже є на сайті.</li>
                <li>Скільки кроків потрібно, щоб дійти від головної до ключової послуги.</li>
                <li>Чи зрозумілі назви розділів людині поза вашою компанією.</li>
              </ul>
              <p>Якщо підтримка щодня пояснює те, що мав би пояснювати інтерфейс, сайт перекладає свою роботу на команду.</p>
            </section>
            <section className="sect" id="s3">
              <span className="sect__n">03</span>
              <h2 data-r>Конверсія падає, хоча трафік залишається</h2>
              <p>Це один із найбільш показових сигналів. Люди приходять на сайт, але не залишають заявку і не купують. Отже, реклама та пошук працюють, а втрата відбувається вже всередині продукту.</p>
              <div className="insight" data-r><b>→</b><p>Дивіться не на загальну конверсію, а на конкретний крок, де користувачі виходять зі сценарію. Часто проблема локальна, і саме це визначає обсяг майбутніх змін.</p></div>
              <p>Перш ніж змінювати весь дизайн, варто зрозуміти причину: незрозуміла пропозиція, форма із зайвими полями, повільне завантаження чи недостатньо аргументів для рішення.</p>
              <figure className="fig" data-r>
                <div className="fig__v"><Illustration name="wave" className="fx" zoom={0.92} interactive={false} /></div>
              </figure>
            </section>
            <section className="sect" id="s4">
              <span className="sect__n">04</span>
              <h2 data-r>Mobile experience став проблемою</h2>
              <p>Адаптивна версія часто створена за залишковим принципом: десктопний макет просто стиснули до вузького екрана. Формально все працює, але кнопки дрібні, таблиці не читаються, а форми незручно заповнювати.</p>
              <p>Перевірте сайт на власному телефоні так, як це зробив би новий клієнт: знайдіть послугу, відкрийте ціну, залиште заявку. Якщо це дратує вас, те саме відчуває і ваш покупець.</p>
            </section>
          </div>
          <aside className="ar-note">
            <p className="label">Як читати</p>
            <p>Один сигнал не завжди означає повний редизайн. Іноді достатньо переробити окремий сценарій.</p>
            <p>Кілька сигналів одночасно — це вже привід подивитися на продукт системно.</p>
          </aside>
        </div>

        <div className="sec g4 ar-quote">
          <span className="hr hr--full hr--top" data-hr />
          <span className="hr hr--full hr--bot" data-hr />
          <Lines as="blockquote" className="wrap d72" lines={[{ t: "Хороший редизайн" }, { t: "починається не з UI,", dim: true }, { t: "а з розуміння проблеми." }]} />
        </div>

        <div className="wrap ar-body">
          <Toc label="Зміст статті, продовження" />
          <div className="ar-col prose">
            <section className="sect" id="s5">
              <span className="sect__n">05</span>
              <h2 data-r>Система дизайну не масштабується</h2>
              <p>Кожна нова сторінка потребує окремого дизайну, а схожі блоки виглядають по-різному. Так накопичуються варіанти кнопок, шрифтових розмірів і відступів, які вже ніхто не контролює.</p>
              <h3>Як це виглядає на практиці</h3>
              <p>Прості правки займають непропорційно багато часу, а команда боїться чіпати старі сторінки, бо зміна в одному місці ламає інше. <strong>Це питання не естетики, а вартості кожної наступної зміни.</strong></p>
            </section>
            <section className="sect" id="s6">
              <span className="sect__n">06</span>
              <h2 data-r>Технологічна база обмежує розвиток</h2>
              <p>Іноді дизайн тримається не на рішеннях, а на обмеженнях платформи. Потрібну функцію неможливо додати без перебудови, інтеграцію з CRM роблять обхідними шляхами, а зміна тексту потребує розробника.</p>
              <div className="hl" data-r>Якщо бізнес планує завдання навколо обмежень сайту, сайт уже керує бізнесом, а не навпаки.</div>
              <p>У такому випадку редизайн варто розглядати разом із технічним рішенням. Новий інтерфейс на старій основі лише відкладе ту саму проблему.</p>
            </section>
            <section className="sect" id="s7">
              <span className="sect__n">07</span>
              <h2 data-r>Бренд змінився, а сайт — ні</h2>
              <p>Нове позиціонування, інша аудиторія, оновлена айдентика — а сайт досі говорить старим голосом. Клієнт бачить одну компанію в презентації та іншу на сайті, і це знижує довіру ще до першої розмови.</p>
              <p>Узгодженість важлива не лише візуально. Тон текстів, логіка подачі та сценарії мають підтримувати те, що бренд обіцяє сьогодні.</p>
            </section>
          </div>
          <div />
        </div>
      </section>

      <section className="sec ar-cta">
        <Banner form="sphere">
          <div className="ar-cta__in">
            <Lines className="h1" lines={[{ t: "Побачили" }, { t: "свою ситуацію?", dim: true }]} />
            <div className="ar-cta__r" data-r>
              <p className="dim">Можемо проаналізувати ваш поточний продукт і визначити, де дизайн або структура обмежують його розвиток.</p>
              <RequestButton>Обговорити редизайн</RequestButton>
            </div>
          </div>
        </Banner>
      </section>

      <section className="sec ar-rel">
        <div className="wrap">
          <Label>Related</Label>
          <div className="ar-rel__g">
            {related.map((a) => (
              <Link className="ar-rel__i" href={`/blog/${a.slug}`} key={a.title} data-r>
                <span className="small dim">{a.category}</span>
                <span className="h3">{a.title}</span>
                <span className="bl-meta"><span>{a.date}</span><span>{a.read}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
