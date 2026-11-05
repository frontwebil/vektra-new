import Link from "next/link";
import { CONTACT, NAV, SERVICES } from "@/lib/content";
import { RequestButton } from "./RequestButton";
import { Chars, Mark } from "./ui";

export function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__top">
          <div className="ft__brand">
            <Link className="ft__logo" href="/" aria-label="Vektra, на головну" data-chars>
              <Chars text="Vektra" />
              <Mark className="ft__mark" />
            </Link>
          </div>
          <div>
            <p className="ft__h">[ Навігація ]</p>
            <div className="ft__list">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>{n.label}</Link>
              ))}
            </div>
            <RequestButton variant="link" className="ft__cta">Обговорити проєкт</RequestButton>
          </div>
          <div>
            <p className="ft__h">[ Послуги ]</p>
            <div className="ft__list">
              {SERVICES.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`}>{s.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="ft__h">[ Мережі ]</p>
            <div className="ft__list ft__list--1">
              {CONTACT.socials.map((s) => (
                <a key={s.label} href={s.href}>{s.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="ft__bot">
          <span>© 2026 Vektra Agency. All Rights Reserved.</span>
          <span>
            <a href="#">Cookies</a>
            <a href="#">Privacy Policy</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
