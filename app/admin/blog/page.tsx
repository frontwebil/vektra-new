import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { loadBlogRecords } from "@/lib/blog";
import { categoryLabel, formatDate } from "@/lib/blog-docs";
import { logoutAction } from "@/app/admin/actions";
import { createPostAction, togglePostAction } from "./actions";
import { BlogEditor } from "./BlogEditor";
import { DeletePostButton } from "./DeletePostButton";
import { SubmitButton } from "../projects/SubmitButton";
import "../admin.css";
import "../projects/projects.css";
import "./blog.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Блог", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  slug: "Адреса може містити лише малі латинські літери, цифри й дефіси, напр. my-article.",
  taken: "Стаття з такою адресою вже існує.",
  title: "Вкажіть заголовок статті.",
  json: "Не вдалося прочитати дані форми. Оновіть сторінку й спробуйте ще раз.",
  shape: "Бракує обовʼязкових полів: заголовок, дата або категорія.",
};

type Search = { p?: string; saved?: string; created?: string; deleted?: string; error?: string };

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!(await hasAdminSession())) redirect("/admin/login");
  const params = await searchParams;
  const { rows, fromDb } = await loadBlogRecords();
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
          <div><span className="admin-kicker">КОНТЕНТ САЙТУ</span><h1>Блог</h1></div>
          <p>Статті на /blog: каталог, сторінки статей і «Схожі статті».</p>
        </div>

        {!fromDb && <div className="admin-notice"><b>Немає зʼєднання з базою</b><p>Перевірте DATABASE_URL і застосуйте міграції командою npm run db:migrate. Зараз показано дані з коду, зберегти зміни не вийде.</p></div>}
        {params.saved && <p className="admin-success">Зміни збережено. Сторінки сайту вже оновлені.</p>}
        {params.created && <p className="admin-success">Статтю створено як чернетку. Заповніть текст і увімкніть «Опубліковано».</p>}
        {params.deleted && <p className="admin-success">Статтю видалено.</p>}
        {params.error && <div className="admin-notice"><b>Не вдалося зберегти</b><p>{ERRORS[params.error] ?? "Спробуйте ще раз."}</p></div>}

        <div className="pe-layout">
          <aside className="admin-panel pe-side">
            <div className="admin-panel__head"><div><h2>Усі статті</h2><p>Новіші вище, за датою публікації</p></div></div>
            <ol className="pe-projects">
              {rows.map((r) => (
                <li key={r.slug} className={r.slug === selected?.slug ? "is-active" : ""}>
                  <Link href={`/admin/blog?p=${r.slug}`}>
                    <b>{r.doc.title}</b>
                    <small>{formatDate(r.doc.date)} · {categoryLabel(r.doc.category)} · {r.published ? "опубліковано" : "чернетка"}</small>
                  </Link>
                  <span className="pe-mini">
                    <form action={togglePostAction}>
                      <input type="hidden" name="slug" value={r.slug} /><input type="hidden" name="current" value={selected?.slug} />
                      <button type="submit" title={r.published ? "Сховати з сайту" : "Опублікувати"} disabled={!fromDb}>{r.published ? "●" : "○"}</button>
                    </form>
                  </span>
                </li>
              ))}
            </ol>

            <form action={createPostAction} className="pe-new">
              <h3>Нова стаття</h3>
              <label className="admin-editor-field">Заголовок<input name="title" required placeholder="Як ми…" /></label>
              <label className="admin-editor-field">Адреса<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="yak-my-robymo" /></label>
              <SubmitButton className="admin-add-item" disabled={!fromDb} pending="Створюю…">+ Створити чернетку</SubmitButton>
            </form>
          </aside>

          {selected && (
            <section className="admin-panel pe-main">
              <div className="admin-panel__head">
                <div><h2>{selected.doc.title}</h2><p>Блоки статті додаються, переставляються й видаляються в розділі «Текст статті».</p></div>
                <span className="pe-head-actions">
                  {selected.published && <Link className="admin-view-all" href={`/blog/${selected.slug}`} target="_blank">Відкрити сторінку ↗</Link>}
                  <DeletePostButton slug={selected.slug} title={selected.doc.title} disabled={!fromDb} />
                </span>
              </div>
              <BlogEditor key={selected.slug} slug={selected.slug} published={selected.published} initial={selected.doc} disabled={!fromDb} />
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
