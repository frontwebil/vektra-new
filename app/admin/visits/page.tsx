import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { hasAdminSession } from "@/lib/admin-auth";
import { pruneOldVisits } from "@/lib/analytics";
import { getPrisma } from "@/lib/prisma";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Усі відвідування", robots: { index: false, follow: false } };

const perPage = 50;
const dateFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Chisinau",
});
const regionNames = new Intl.DisplayNames(["uk"], { type: "region" });

function countryName(code: string | null) {
  if (!code) return "Невідомо";
  return regionNames.of(code) ?? code;
}

export default async function AdminVisitsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!(await hasAdminSession())) redirect("/admin/login");

  const { page: rawPage } = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  await pruneOldVisits();
  const prisma = getPrisma();
  const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const where = { visitedAt: { gte: periodStart } };
  const total = await prisma.visit.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(requestedPage, totalPages);
  const visits = await prisma.visit.findMany({
    where,
    orderBy: { visitedAt: "desc" },
    skip: (currentPage - 1) * perPage,
    take: perPage,
    select: { visitedAt: true, ipAddress: true, country: true, device: true, browser: true, path: true, referrerHost: true },
  });

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/admin"><span>VEKTRA</span><i>ADMIN</i></a>
        <div className="admin-topbar__right">
          <Link className="admin-logout" href="/admin">← До огляду</Link>
          <form action={logoutAction}><button className="admin-logout" type="submit">Вийти ↗</button></form>
        </div>
      </header>

      <section className="admin-content admin-visits-page">
        <div className="admin-heading">
          <div><span className="admin-kicker">АРХІВ ВІДВІДУВАНЬ</span><h1>Усі перегляди</h1></div>
          <p>{total.toLocaleString("uk-UA")} переглядів · останні 30 днів</p>
        </div>

        <section className="admin-panel admin-recent">
          <div className="admin-panel__head"><div><h2>Сторінка {currentPage} з {totalPages}</h2><p>По {perPage} записів на сторінку</p></div></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Час</th><th>IP</th><th>Країна</th><th>Пристрій</th><th>Браузер</th><th>Сторінка</th><th>Джерело</th></tr></thead>
              <tbody>
                {visits.map((row, index) => <tr key={`${row.visitedAt.toISOString()}-${index}`}>
                  <td>{dateFormat.format(row.visitedAt)}</td><td>{row.ipAddress ?? "—"}</td>
                  <td>{countryName(row.country)}</td><td>{row.device}</td><td>{row.browser}</td>
                  <td className="admin-path">{row.path}</td><td>{row.referrerHost ?? "Прямий перехід"}</td>
                </tr>)}
                {visits.length === 0 && <tr><td className="admin-empty" colSpan={7}>Поки немає відвідувань.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {totalPages > 1 && <nav className="admin-pagination" aria-label="Сторінки відвідувань">
          {currentPage > 1 ? <Link href={`/admin/visits?page=${currentPage - 1}`}>← Новіші</Link> : <span />}
          <span>{currentPage} / {totalPages}</span>
          {currentPage < totalPages ? <Link href={`/admin/visits?page=${currentPage + 1}`}>Старіші →</Link> : <span />}
        </nav>}
      </section>
    </div>
  );
}
