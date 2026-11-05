import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { Lines, ProjectImage, SectionCta } from "@/components/sections";
import { Arrow, Crumbs, Label, Star, Tags } from "@/components/ui";
import { PROJECTS, REVIEWS, type Project } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  return p ? { title: `Кейс ${p.name}`, description: `${p.lead} ${p.rest}` } : {};
}

function Next({ p }: { p: Project }) {
  const i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  return (
    <Link className="sec cs-next" href={`/projects/${next.slug}`}>
      <Label className="cs-next__t">Next project</Label>
      <ProjectImage p={next} />
      <span className="lnk cs-next__c">Дивитися наступний кейс <Arrow /></span>
      <Lines className="d140 cs-next__n" lines={[{ t: next.name }]} />
    </Link>
  );
}

const Ui = {
  catalog: (
    <div className="ui" data-r aria-hidden="true">
      <div className="ui__bar"><b>PumpLab</b><span>Каталог</span><span>Бренди</span><span>Кошик</span></div>
      <div className="ui-cat">
        <div className="ui-cat__f">
          <b>Категорія</b>
          <span className="ui-chk on"><i />Обрана категорія</span>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "9rem" }} /></span>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "12rem" }} /></span>
          <b>Смак</b>
          <span className="ui-chk on"><i />Обраний варіант</span>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "7rem" }} /></span>
          <b>Фасування</b>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "6rem" }} /></span>
        </div>
        <div className="ui-cat__g">
          {[70, 55, 64, 50, 72, 58].map((w, i) => (
            <div className="ui-p" key={i}>
              <div className="ui-p__v" />
              <span className="sk sk--w" style={{ width: `${w}%` }} />
              <span className="sk" style={{ width: `${w - 25}%` }} />
              <div className="ui-p__chips"><i /><i />{i % 2 === 0 && <i />}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  checkout: (
    <div className="ui ui--m" data-r aria-hidden="true">
      <div className="ui__bar"><b>PumpLab</b><span>Оформлення замовлення</span></div>
      <div className="ui-co">
        <div>
          <div className="ui-co__steps"><span className="on">01 Контакти</span><span>02 Доставка</span><span>03 Оплата</span></div>
          <div className="ui-co__form">
            <div className="ui-in">Ім’я</div>
            <div className="ui-in">Телефон</div>
            <div className="ui-in w">Email</div>
            <div className="ui-in w">Місто та відділення</div>
          </div>
        </div>
        <div className="ui-co__sum">
          <b>Ваше замовлення</b>
          <div className="ui-co__row"><span className="sk sk--w" style={{ width: "60%" }} /><span className="sk" style={{ width: "20%" }} /></div>
          <div className="ui-co__row"><span className="sk sk--w" style={{ width: "48%" }} /><span className="sk" style={{ width: "20%" }} /></div>
          <span className="hr hr--2" />
          <div className="ui-co__row"><span>Разом</span><span className="sk sk--w" style={{ width: "28%" }} /></div>
          <div className="ui-btn">Підтвердити</div>
        </div>
      </div>
    </div>
  ),
  admin: (
    <div className="ui ui--m" data-r aria-hidden="true">
      <div className="ui__bar"><b>Admin</b><span>Пошук</span></div>
      <div className="ui-ad">
        <div className="ui-ad__nav"><span className="on">Замовлення</span><span>Товари</span><span>Ціни</span><span>Контент</span><span>Клієнти</span></div>
        <div className="ui-ad__t">
          <span className="hd2">Замовлення</span><span className="hd2">Сума</span><span className="hd2">Дата</span><span className="hd2">Статус</span>
          {[["60", "60", "Новий"], ["48", "50", "В роботі"], ["66", "44", "В роботі"], ["52", "60", "Доставлено"], ["58", "48", "Доставлено"]].map(([a, b, st], i) => (
            <div className="ui-ad__r" key={i}>
              <span><i className="sk sk--w" style={{ width: `${a}%` }} /></span>
              <span><i className="sk" style={{ width: `${b}%` }} /></span>
              <span><i className="sk" style={{ width: "70%" }} /></span>
              <span><i className={`ui-pill ${i === 0 ? "on" : ""}`}>{st}</i></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

function PumpLab({ p }: { p: Project }) {
  const q = REVIEWS[0];
  return (
    <>
      <section className="sec cs-hero" data-hero>
        <div className="wrap">
          <div className="cs-hero__name">
            <p className="label">PumpLab UA</p>
            <p className="label dim">Case study</p>
          </div>
          <Lines as="h1" className="d100 cs-hero__h" lines={[{ t: "Кастомна e-commerce" }, { t: "система для клієнта", dim: true }, { t: "й бізнесу." }]} />
          <dl className="cs-meta" data-r>
            <div><dt>Industry</dt><dd>E-commerce</dd></div>
            <div><dt>Year</dt><dd>2026</dd></div>
            <div><dt>Services</dt><dd>UX/UI / Development / Automation</dd></div>
            <div><dt>Platform</dt><dd>Web</dd></div>
          </dl>
        </div>
      </section>

      <section className="sec g3 cs-visual">
        <Illustration name="wave" className="fx cs-visual__il" density={1.1} zoom={0.9} />
        <Star className="star--a" style={{ left: "38rem", top: "7.8rem" }} />
        <ProjectImage p={p} priority sizes="(max-width: 767px) 100vw, 70vw" />
        <a className="btn cs-visual__cta" href="#">Відкрити сайт <Arrow /></a>
      </section>

      <section className="sec g2 cs-sec">
        <div className="wrap">
          <div className="shead"><Label>(01) / Project</Label></div>
          <div className="cs-ov">
            <Lines className="h1" lines={[{ t: "Задача" }]} />
            <div className="cs-ov__body body18">
              <p data-r>Клієнт звернувся із задачею створити власну e-commerce платформу для магазину спортивного харчування.</p>
              <p data-r className="dim">Основною проблемою було поєднати великий каталог із варіаціями товарів, зрозумілий шлях до покупки та щоденне керування магазином без залучення розробника.</p>
              <p data-r className="dim">Метою стало спростити покупки для клієнтів і щоденне управління магазином для бізнесу.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec cs-sec">
        <div className="wrap">
          <div className="shead shead--t"><Label>(02) / Challenge</Label></div>
          <Lines className="d100 cs-ch__h" lines={[{ t: "Складна система." }, { t: "Простий досвід.", dim: true }]} />
          <div className="cs-ch__grid">
            {[
              ["A", "Великий каталог", "Покупець має швидко дістатися потрібного товару, навіть якщо не знає його точної назви."],
              ["B", "Варіативні товари", "Смак, фасування та наявність мають бути зрозумілими ще до додавання в кошик."],
              ["C", "Складний checkout", "Кожне зайве поле чи крок на оформленні — ще одна причина не завершити покупку."],
              ["D", "Управління без розробника", "Товари, ціни, контент і замовлення команда має змінювати самостійно."],
            ].map(([l, t, d]) => (
              <div className="cs-ch__cell" key={l} data-r>
                <span className="cs-ch__wm" data-wm aria-hidden="true">{l}</span>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec cs-sec cs-sec--ap">
        <div className="wrap">
          <div className="shead shead--t"><Label>(03) / Approach</Label></div>
          <div className="cs-ap__g">
            <div className="cs-ap__vis">
              <Illustration name="lattice" className="fx" density={1.2} />
              <div className="cs-ap__state"><span className="small w40">Зараз:</span><span className="label" data-ap-state>Research</span></div>
            </div>
            <div>
              {[
                ["01", "Research", "Вивчаємо продукт, аудиторію та те, як магазин працює щодня — із боку покупця й команди."],
                ["02", "Structure", "Вибудовуємо логіку каталогу, категорій і сценаріїв, перш ніж малювати інтерфейс."],
                ["03", "UX", "Проєктуємо шлях від пошуку до покупки та перевіряємо, де він може обриватися."],
                ["04", "UI System", "Збираємо компоненти й стани в систему, щоб нові сторінки не вимагали нового дизайну."],
                ["05", "Development", "Реалізуємо frontend, backend, інтеграції та власну адмін-панель керування."],
                ["06", "Launch", "Тестуємо ключові сценарії на різних пристроях і готуємо продукт до запуску."],
              ].map(([n, t, d]) => (
                <div className="cs-ap__item" key={n}>
                  <span className="small">{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec cs-sec">
        <div className="wrap">
          <div className="shead shead--t"><Label>(04) / Solution</Label><p className="small w40">[ Схеми інтерфейсу. Замініть реальними макетами ]</p></div>
          {[
            { k: "A", t: "Smart catalog", d: "Фільтри, категорії та варіації товарів спроєктовані так, щоб користувач швидко переходив від пошуку до покупки.", ui: Ui.catalog, r: false },
            { k: "B", t: "Custom checkout", d: "Послідовний сценарій покупки без зайвих кроків і непотрібних полів.", ui: Ui.checkout, r: true },
            { k: "C", t: "Admin system", d: "Власна система керування товарами, цінами, контентом і замовленнями.", ui: Ui.admin, r: false },
          ].map((b) => (
            <div className={`cs-sol ${b.r ? "cs-sol--r" : ""}`} key={b.k}>
              <div className="cs-sol__t">
                <span className="small w40">{b.k}</span>
                <h3 className="h3" data-r>{b.t}</h3>
                <p data-r>{b.d}</p>
              </div>
              {b.ui}
            </div>
          ))}
        </div>
      </section>

      <section className="sec cs-sec">
        <div className="wrap">
          <div className="shead shead--t"><Label>(05) / Result</Label></div>
          <Lines className="d100 cs-res__h" lines={[{ t: "Не просто" }, { t: "інтернет-магазин.", dim: true }, { t: "Готова система." }]} />
          <div>
            {[
              ["01", "Простіший шлях до покупки", "Покупець без зайвих кроків проходить шлях від каталогу до оформлення."],
              ["02", "Незалежне управління магазином", "Команда сама керує товарами, цінами, контентом і замовленнями."],
              ["03", "Автоматизовані процеси", "Ключові e-commerce процеси більше не потребують постійної ручної роботи."],
              ["04", "Готовність до масштабування", "Система дозволяє додавати товари, сторінки та функції без перебудови основи."],
            ].map(([n, t, d]) => (
              <div className="cs-res__row" key={n} data-r>
                <span className="small w40">{n}</span>
                <span className="h3">{t}</span>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec g4 cs-q">
        <div className="wrap">
          <blockquote>
            <p className="cs-q__t" data-words>Дуже вдячні за швидку реакцію та за те, що ви одразу зрозуміли, <span>що саме нам потрібно.</span> Ви завжди ввічливо сприймали всі наші зауваження та побажання <span>і дуже швидко вносили необхідні зміни.</span></p>
            <footer className="cs-q__by" data-r>
              <Image src={q.logo} alt="" width={48} height={48} />
              <div>
                <p className="label">{q.name}</p>
                <p className="small w40"># {q.company}</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>
      <Next p={p} />
    </>
  );
}

function ShortCase({ p }: { p: Project }) {
  const q = REVIEWS.find((r) => r.logo.includes(p.slug.split("-")[0]));
  const [a, b] = p.name.split(" ");
  return (
    <>
      <section className="sec cs-hero" data-hero>
        <div className="wrap">
          <div className="cs-hero__name">
            <p className="label">{p.name}</p>
            <p className="label dim">Case study</p>
          </div>
          <Lines as="h1" className="d180 cs-hero__h" lines={[{ t: a }, { t: b, dim: true }]} />
          <dl className="cs-meta" data-r>
            <div><dt>Industry</dt><dd>{p.category}</dd></div>
            <div><dt>Year</dt>{p.year ? <dd>{p.year}</dd> : <dd className="w40">[ Year ]</dd>}</div>
            <div><dt>Services</dt><dd>{p.services}</dd></div>
            <div><dt>Platform</dt><dd>Web</dd></div>
          </dl>
        </div>
      </section>
      <section className="sec g3 cs-visual">
        <Illustration name={p.slug === "clave-shop" ? "knot" : "sphere"} className="fx cs-visual__il" density={1.1} zoom={0.9} />
        <Star className="star--a" style={{ left: "38rem", top: "7.8rem" }} />
        <ProjectImage p={p} priority sizes="(max-width: 767px) 100vw, 70vw" />
        <div className="cs-visual__cta"><RequestButton>Обговорити схожий проєкт</RequestButton></div>
      </section>
      <section className="sec g2 cs-sec">
        <div className="wrap">
          <div className="shead"><Label>(01) / Project</Label></div>
          <div className="cs-ov">
            <Lines className="h1" lines={[{ t: "Що зробили" }]} />
            <div className="cs-ov__body body18">
              <p data-r>{p.lead} <span className="dim">{p.rest}</span></p>
              <div data-r className="cs-ov__tags"><Tags items={p.tags} /></div>
            </div>
          </div>
        </div>
      </section>
      {q && (
        <section className="sec g4 cs-q">
          <div className="wrap">
            <blockquote>
              <p className="cs-q__t" data-words>{q.paragraphs[0]}</p>
              <footer className="cs-q__by" data-r>
                <Image src={q.logo} alt="" width={48} height={48} />
                <div>
                  <p className="label">{q.name}</p>
                  <p className="small w40"># {q.company}</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>
      )}
      <Next p={p} />
    </>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <>
      <div className="cs-crumbs"><Crumbs items={[{ label: "Головна", href: "/" }, { label: "Проєкти", href: "/projects" }, { label: p.name }]} /></div>
      {p.slug === "pumplab" ? <PumpLab p={p} /> : <ShortCase p={p} />}
      <SectionCta />
    </>
  );
}
