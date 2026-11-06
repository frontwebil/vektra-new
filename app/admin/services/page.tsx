import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { SERVICES } from "@/lib/content";
import { defaultServicePage, ensureServicePageTemplates } from "@/lib/service-pages";
import { logoutAction } from "@/app/admin/actions";
import { ServiceContentEditor } from "@/app/admin/services/ServiceContentEditor";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Редактор послуг", robots: { index: false, follow: false } };

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ service?: string; saved?: string; error?: string }> }) {
  if (!(await hasAdminSession())) redirect("/admin/login");
  const params = await searchParams;
  const selected = SERVICES.find((service) => service.slug === params.service) ?? SERVICES[0];
  let value = defaultServicePage(selected);
  let dbError = false;
  try {
    const rows = await ensureServicePageTemplates();
    const saved = rows.find((row) => row.slug === selected.slug);
    if (saved) value = { ...value, ...(saved.content as Partial<typeof value>) };
  } catch {
    dbError = true;
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/admin"><span>VEKTRA</span><i>ADMIN</i></a>
        <div className="admin-topbar__right"><Link className="admin-logout" href="/admin">← До огляду</Link><form action={logoutAction}><button className="admin-logout" type="submit">Вийти ↗</button></form></div>
      </header>
      <section className="admin-content admin-service-editor">
        <div className="admin-heading">
          <div><span className="admin-kicker">КОНТЕНТ САЙТУ</span><h1>Сторінки послуг</h1></div>
          <p>Виберіть послугу, щоб змінити текст її секцій.</p>
        </div>
        <nav className="admin-service-tabs" aria-label="Вибір послуги">
          {SERVICES.map((service) => <Link key={service.slug} className={service.slug === selected.slug ? "is-active" : ""} href={`/admin/services?service=${service.slug}`}>{service.index} · {service.short}</Link>)}
        </nav>
        {dbError && <div className="admin-notice"><b>Немає зʼєднання з базою</b><p>Перевірте DATABASE_URL і застосуйте міграції командою npm run db:migrate. Поки що показано початковий шаблон.</p></div>}
        {params.saved && <p className="admin-success">Зміни збережено. Сторінка послуги оновиться з новим контентом.</p>}
        {params.error && <div className="admin-notice"><b>Не вдалося зберегти</b><p>{params.error === "json" ? "Перевірте JSON: дужки, лапки й коми." : params.error === "sections" ? "У структурі використовуйте тільки ключі зі списку: why, when, included, process, work, pricing, faq, cta." : "У вмісті бракує обовʼязкових секцій. Поверніть поля з початкового шаблону."}</p></div>}
        <section className="admin-panel admin-service-form-panel">
          <div className="admin-panel__head"><div><h2>{selected.name}</h2><p>Секції сторінки зберігаються окремо для кожної послуги.</p></div><Link className="admin-view-all" href={`/services/${selected.slug}`} target="_blank">Відкрити сторінку ↗</Link></div>
          <div className="admin-template-help"><b>Усі секції шаблону</b><p>Тексти можна змінювати у відповідних полях. Повторювані картки та списки відредагуйте у JSON-блоці кожної секції.</p></div>
          <ServiceContentEditor slug={selected.slug} initialValue={value} disabled={dbError} />
        </section>
      </section>
    </div>
  );
}
