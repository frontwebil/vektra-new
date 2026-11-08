import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { loadProjectRecords } from "@/lib/projects";
import { logoutAction } from "@/app/admin/actions";
import { createProjectAction, moveProjectAction, togglePublishedAction } from "./actions";
import { ProjectEditor } from "./ProjectEditor";
import { DeleteProjectButton } from "./DeleteProjectButton";
import "../admin.css";
import "./projects.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Проєкти", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  slug: "Адреса може містити лише малі латинські літери, цифри й дефіси, напр. my-project.",
  taken: "Проєкт із такою адресою вже існує.",
  name: "Вкажіть назву проєкту.",
  json: "Не вдалося прочитати дані форми. Оновіть сторінку й спробуйте ще раз.",
  shape: "Бракує обовʼязкових полів: назва, опис, hero або огляд.",
};

type Search = { p?: string; saved?: string; created?: string; deleted?: string; error?: string };

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!(await hasAdminSession())) redirect("/admin/login");
  const params = await searchParams;
  const { rows, fromDb } = await loadProjectRecords();
  const selected = rows.find((r) => r.slug === params.p) ?? rows[0];

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/admin"><span>VEKTRA</span><i>ADMIN</i></a>
        <div className="admin-topbar__right">
          <Link className="admin-logout" href="/admin">← До огляду</Link>
          <form action={logoutAction}><button className="admin-logout" type="submit">Вийти ↗</button></form>
        </div>
      </header>
      <section className="admin-content">
        <div className="admin-heading">
          <div><span className="admin-kicker">КОНТЕНТ САЙТУ</span><h1>Проєкти</h1></div>
          <p>Картки на /projects і головній та повні сторінки кейсів.</p>
        </div>

        {!fromDb && <div className="admin-notice"><b>Немає зʼєднання з базою</b><p>Перевірте DATABASE_URL і застосуйте міграції командою npm run db:migrate. Зараз показано дані з коду, зберегти зміни не вийде.</p></div>}
        {params.saved && <p className="admin-success">Зміни збережено. Сторінки сайту вже оновлені.</p>}
        {params.created && <p className="admin-success">Проєкт створено як чернетку з шаблону. Заповніть поля й увімкніть «Опубліковано».</p>}
        {params.deleted && <p className="admin-success">Проєкт видалено.</p>}
        {params.error && <div className="admin-notice"><b>Не вдалося зберегти</b><p>{ERRORS[params.error] ?? "Спробуйте ще раз."}</p></div>}

        <div className="pe-layout">
          <aside className="admin-panel pe-side">
            <div className="admin-panel__head"><div><h2>Усі проєкти</h2><p>Порядок тут = порядок на сайті</p></div></div>
            <ol className="pe-projects">
              {rows.map((r, i) => (
                <li key={r.slug} className={r.slug === selected?.slug ? "is-active" : ""}>
                  <Link href={`/admin/projects?p=${r.slug}`}>
                    <b>{r.doc.card.name}</b>
                    <small>/{r.slug} · {r.published ? "опубліковано" : "чернетка"}</small>
                  </Link>
                  <span className="pe-mini">
                    <form action={moveProjectAction}>
                      <input type="hidden" name="slug" value={r.slug} /><input type="hidden" name="dir" value="up" /><input type="hidden" name="current" value={selected?.slug} />
                      <button type="submit" title="Вище" disabled={!fromDb || i === 0}>↑</button>
                    </form>
                    <form action={moveProjectAction}>
                      <input type="hidden" name="slug" value={r.slug} /><input type="hidden" name="dir" value="down" /><input type="hidden" name="current" value={selected?.slug} />
                      <button type="submit" title="Нижче" disabled={!fromDb || i === rows.length - 1}>↓</button>
                    </form>
                    <form action={togglePublishedAction}>
                      <input type="hidden" name="slug" value={r.slug} /><input type="hidden" name="current" value={selected?.slug} />
                      <button type="submit" title={r.published ? "Сховати з сайту" : "Опублікувати"} disabled={!fromDb}>{r.published ? "●" : "○"}</button>
                    </form>
                  </span>
                </li>
              ))}
            </ol>

            <form action={createProjectAction} className="pe-new">
              <h3>Новий проєкт</h3>
              <label className="admin-editor-field">Назва<input name="name" required placeholder="Brand Name" /></label>
              <label className="admin-editor-field">Адреса<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="brand-name" /></label>
              <button className="admin-add-item" type="submit" disabled={!fromDb}>+ Створити з шаблону</button>
            </form>
          </aside>

          {selected && (
            <section className="admin-panel pe-main">
              <div className="admin-panel__head">
                <div><h2>{selected.doc.card.name}</h2><p>Структура як у шаблону кейсу. Секції можна вмикати й вимикати.</p></div>
                <span className="pe-head-actions">
                  <Link className="admin-view-all" href={`/projects/${selected.slug}`} target="_blank">Відкрити сторінку ↗</Link>
                  <DeleteProjectButton slug={selected.slug} name={selected.doc.card.name} disabled={!fromDb} />
                </span>
              </div>
              <ProjectEditor key={selected.slug} slug={selected.slug} published={selected.published} initial={selected.doc} disabled={!fromDb} />
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
