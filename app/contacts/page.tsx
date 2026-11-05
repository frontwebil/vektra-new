import type { Metadata } from "next";
import { Illustration } from "@/components/Illustration";
import { ContactForm } from "@/components/interactive";
import { Lines } from "@/components/sections";
import { Arrow, Label, Star } from "@/components/ui";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Контакти",
  description: "Розкажіть, що потрібно створити, змінити або покращити.",
};

export default function ContactsPage() {
  const rows = [
    { k: "Email", v: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { k: "Telegram", v: CONTACT.telegram.label, href: CONTACT.telegram.href },
    { k: "WhatsApp", v: CONTACT.whatsapp.label, href: CONTACT.whatsapp.href },
    { k: "Instagram", v: "Instagram", href: CONTACT.socials[0].href },
  ];
  return (
    <>
      <section className="sec g2 ct-hero" data-hero>
        <Illustration name="vortex" fit="cover" className="fx ct-hero__il" brightness={0.6} />
        <Star className="star--a" style={{ left: "58rem", top: "80rem" }} />
        <div className="wrap ct-g">
          <div className="ct-l">
            <Label>(01) / Contact</Label>
            <Lines as="h1" className="d100" lines={[{ t: "Почнемо" }, { t: "з вашої", dim: true }, { t: "задачі." }]} />
            <p className="ct-l__p body18" data-r>Розкажіть, що потрібно створити, змінити або покращити. Ми розберемо задачу та запропонуємо оптимальний формат роботи.</p>
          </div>
          <ContactForm />
        </div>
      </section>
      <section className="sec g2 ct-direct">
        <span className="hr hr--full" data-hr />
        <div className="wrap ct-direct__g">
          <Lines className="h1" lines={[{ t: "Або напишіть" }, { t: "напряму.", dim: true }]} />
          <div>
            {rows.map((r) => (
              <a className="ct-row" href={r.href} key={r.k} data-r>
                <span className="small">{r.k}</span>
                <b>{r.v}</b>
                <Arrow />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
