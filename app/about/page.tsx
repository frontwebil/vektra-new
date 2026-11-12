import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import Image from "next/image";
import { Illustration } from "@/components/Illustration";
import { RequestButton } from "@/components/RequestButton";
import { DotMatrix, ExpertiseList } from "@/components/interactive";
import { Lines, SectionReviews } from "@/components/sections";
import { Label, Star } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Про нас",
  description: "Vektra — digital-агенція, що поєднує стратегію, дизайн і технології.",
  path: "/about",
});

const PRINCIPLES = [
  {
    a: "Занурюємося",
    b: "в задачу",
    t: "Починаємо з розуміння бізнесу, а не з готової відповіді.",
    p: "ripple",
  },
  {
    a: "Думаємо",
    b: "системно",
    t: "Дизайн, технології та контент мають працювати разом.",
    p: "lattice",
  },
  {
    a: "Пояснюємо",
    b: "рішення",
    t: "Клієнт розуміє процес, логіку та наступні кроки.",
    p: "sweep",
  },
  {
    a: "Дивимося",
    b: "далі запуску",
    t: "Створюємо рішення, які можуть розвиватися разом із бізнесом.",
    p: "rise",
  },
] as const;

const NUMBERS = [
  { v: 30, plus: "+", unit: "", t: ["реалізованих", "проєктів"], i: "A" },
  {
    v: 5,
    plus: "",
    unit: "років",
    t: ["досвіду в дизайні", "та розробці"],
    i: "B",
  },
  {
    v: 6,
    plus: "",
    unit: "напрямів",
    t: ["експертизи", "в одній команді"],
    i: "C",
  },
  {
    v: 1,
    plus: "",
    unit: "команда",
    t: ["на всіх", "ключових етапах"],
    i: "D",
  },
];

const TEAM = [
  {
    name: "Ілля",
    area: "BUILD",
    role: "Full-Stack Developer",
    description:
      "Перетворює дизайн на стабільні вебпродукти, поєднуючи frontend, backend, бізнес-логіку та інтеграції в єдину систему.",
    photo: "/team/1.webp",
  },
  {
    name: "Аріна",
    area: "EXPERIENCE",
    role: "UX/UI Designer",
    description:
      "Проєктує цифрові продукти навколо логіки користувача й задач бізнесу — від UX до цілісних інтерфейсів і дизайн-систем.",
    photo: "/team/2.webp",
  },
  {
    name: "Єва",
    area: "IDENTITY",
    role: "Graphic Designer",
    description:
      "Створює айдентику, графіку та digital-візуали, що формують впізнаваний образ бренду й цілісну візуальну комунікацію.",
    photo: "/team/4.webp",
  },
  {
    name: "Тимофій",
    area: "CONNECT",
    role: "Communication Manager",
    description:
      "Координує комунікацію між клієнтом і командою, щоб задачі, рішення та весь процес залишалися зрозумілими на кожному етапі.",
    photo: "/team/3.webp",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="sec g4 ab-hero" data-hero>
        <Illustration
          name="sphere"
          className="fx ab-hero__il"
          density={1.3}
          brightness={0.72}
        />
        <Star className="star--a" style={{ left: "104rem", top: "32rem" }} />
        <Star className="star--b" style={{ left: "27rem", top: "60rem" }} />
        <Label className="ab-hero__label">(01) / About Vektra</Label>
        <p className="body18 ab-hero__p" data-r>
          Vektra — digital-агенція,{" "}
          <span className="dim">
            що поєднує стратегію, дизайн і технології для створення продуктів,
            готових до реальної роботи та розвитку бізнесу.
          </span>
        </p>
        <Lines
          as="h1"
          className="d100 ab-hero__h"
          lines={[
            { t: "Одна команда." },
            { t: "Різні компетенції.", dim: true },
            { t: "Спільний вектор." },
          ]}
        />
      </section>

      <section className="sec g2 ab-who">
        <div className="wrap ab-who__g">
          <Lines
            className="h1 ab-who__h"
            lines={[
              { t: "Не просто" },
              { t: "виконавці.", dim: true },
              { t: "Частина процесу." },
            ]}
          />
          <p className="body18 ab-who__p" data-words>
            Підключаємося до проєкту не лише на етапі виконання.{" "}
            <span className="dim">
              Допомагаємо визначити задачу, знайти правильний формат рішення та
              пройти весь шлях від першої концепції до запуску.
            </span>
          </p>
        </div>
      </section>

      <section className="sec ab-num">
        <div className="wrap">
          <Lines
            className="h2 ab-num__h"
            lines={[
              { t: "Досвід," },
              { t: "що працює", dim: true },
              { t: "на ваш результат." },
            ]}
          />
          {NUMBERS.map((n) => (
            <div className="ab-num__row" key={n.i} data-r>
              <span className="ab-num__v">
                <span data-count={n.v}>{n.v}</span>
                {n.plus}
                {n.unit && <span className="dim"> {n.unit}</span>}
              </span>
              <span className="ab-num__t">
                {n.t[0]}
                <br />
                {n.t[1]}
              </span>
              <span className="ab-num__i small">[ {n.i} ]</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sec g4 ab-pr">
        <div className="wrap">
          <div className="shead">
            <Label>(02) / How we think</Label>
          </div>
          <div className="ab-pr__g">
            {PRINCIPLES.map((p) => (
              <article className="ab-pr__c" key={p.a} data-r data-hot>
                <DotMatrix pattern={p.p} />
                <h3 className="h3">
                  {p.a}
                  <br />
                  <span className="dim">{p.b}</span>
                </h3>
                <p>{p.t}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec ab-ex">
        <div className="wrap">
          <div className="shead shead--t">
            <Label>Expertise</Label>
            <p className="small w40">6 напрямів</p>
          </div>
          <ExpertiseList />
        </div>
      </section>

      <section className="sec ab-tm">
        <div className="wrap">
          <div className="shead shead--t">
            <Label>(03) / Team</Label>
            <p className="small w40">
              Люди, що ведуть проєкт від ідеї до запуску
            </p>
          </div>
          <Lines
            className="d100 ab-tm__h"
            lines={[{ t: "Люди" }, { t: "за системою.", dim: true }]}
          />
          <div className="ab-tm__g">
            {TEAM.map((person) => (
              <div className="ab-tm__c" key={person.name} data-r>
                <div className="ab-tm__ph">
                  <Image
                    src={person.photo}
                    alt={`Фото: ${person.name}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <p className="label">
                  {person.name} <span className="dim">— {person.area}</span>
                </p>
                <p className="small">{person.role}</p>
                <p className="small w40 ab-tm__skills">{person.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionReviews />

      <section className="sec g4 ab-cta">
        <Illustration
          name="infinity"
          className="fx ab-cta__il"
          density={1.4}
          brightness={0.72}
        />
        <Lines
          className="d120 ab-cta__h"
          lines={[
            { t: "Маєте задачу?" },
            { t: "Знайдемо", dim: true },
            { t: "напрямок." },
          ]}
        />
        <div className="ab-cta__b" data-r>
          <RequestButton>Обговорити проєкт</RequestButton>
        </div>
      </section>
    </>
  );
}
