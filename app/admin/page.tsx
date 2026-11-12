import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-auth";
import { pruneOldVisits, visitRetentionDays } from "@/lib/analytics";
import { logoutAction } from "@/app/admin/actions";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Статистика відвідувань", robots: { index: false, follow: false } };

const periodDays = 30;
const dateFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Chisinau",
});
const regionNames = new Intl.DisplayNames(["uk"], { type: "region" });

function countryName(code: string | null) {
  if (!code) return "Невідомо";
  return regionNames.of(code) ?? code;
}

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin/login");

  let data;
  let setupMessage = "";
  try {
    await pruneOldVisits();
    const prisma = getPrisma();
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const where = { visitedAt: { gte: periodStart } };

    const [visits, uniqueRows, countries, devices, pages, days, recent] = await Promise.all([
      prisma.visit.count({ where }),
      prisma.visit.findMany({ where, distinct: ["visitorKey"], select: { visitorKey: true } }),
      prisma.visit.groupBy({
        by: ["country"], where: { ...where, country: { not: null } },
        _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8,
      }),
      prisma.visit.groupBy({
        by: ["device"], where, _count: { id: true }, orderBy: { _count: { id: "desc" } },
      }),
      prisma.visit.groupBy({
        by: ["path"], where, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8,
      }),
      prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', "visitedAt") AS day, COUNT(*) AS count
        FROM "Visit"
        WHERE "visitedAt" >= ${periodStart}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.visit.findMany({
        where, orderBy: { visitedAt: "desc" }, take: 50,
        select: { visitedAt: true, ipAddress: true, country: true, device: true, browser: true, path: true, referrerHost: true },
      }),
    ]);

    data = {
      visits,
      uniqueVisitors: uniqueRows.length,
      countries: countries.map((row) => ({ name: countryName(row.country), count: row._count.id })),
      devices: devices.map((row) => ({ name: row.device, count: row._count.id })),
      pages: pages.map((row) => ({ name: row.path, count: row._count.id })),
      days: days.map((row) => ({ date: row.day, count: Number(row.count) })),
      recent,
    };
  } catch (error) {
    console.error("Admin analytics could not load.");
    setupMessage = process.env.DATABASE_URL
      ? "Не вдалося підключитися до PostgreSQL. Перевірте DATABASE_URL і застосуйте міграції командою npm run db:migrate."
      : "Додайте DATABASE_URL до .env.local і застосуйте міграції командою npm run db:migrate.";
  }

  const maxDay = Math.max(1, ...(data?.days.map((day) => day.count) ?? []));
  const average = data ? (data.visits / periodDays).toFixed(1).replace(".", ",") : "0";

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/admin"><span>VEKTRA</span><i>ADMIN</i></a>
        <div className="admin-topbar__right">
          <span>Останні {periodDays} днів</span>
          <form action={logoutAction}><button className="admin-logout" type="submit">Вийти ↗</button></form>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-heading">
          <div><span className="admin-kicker">ОГЛЯД САЙТУ</span><h1>Відвідування</h1></div>
          <p>Час у часовому поясі Europe/Chisinau · IP зберігаються {visitRetentionDays} днів</p>
        </div>
        <Link className="admin-service-shortcut" href="/admin/services">Редагувати сторінки послуг <span>↗</span></Link>
        <Link className="admin-service-shortcut" href="/admin/projects">Редагувати проєкти й кейси <span>↗</span></Link>
        <Link className="admin-service-shortcut" href="/admin/blog">Редагувати статті блогу <span>↗</span></Link>

        {setupMessage ? (
          <div className="admin-notice"><b>Потрібне налаштування бази</b><p>{setupMessage}</p></div>
        ) : (
          <>
            <div className="admin-metrics">
              <article><span>Перегляди сторінок</span><strong>{data!.visits.toLocaleString("uk-UA")}</strong><small>За {periodDays} днів</small></article>
              <article><span>Унікальні відвідувачі</span><strong>{data!.uniqueVisitors.toLocaleString("uk-UA")}</strong><small>Оцінка за IP та браузером</small></article>
              <article><span>У середньому за день</span><strong>{average}</strong><small>Переглядів сторінок</small></article>
            </div>

            <div className="admin-grid">
              <section className="admin-panel admin-chart">
                <div className="admin-panel__head"><div><h2>Динаміка</h2><p>Перегляди за день</p></div><span>30 ДНІВ</span></div>
                <div className="admin-chart__bars" aria-label="Графік переглядів за днями">
                  {data!.days.map((day) => (
                    <div className="admin-chart__item" key={day.date.toISOString()} title={`${dateFormat.format(day.date)}: ${day.count}`}>
                      <i style={{ height: `${Math.max(3, day.count / maxDay * 100)}%` }} />
                    </div>
                  ))}
                  {data!.days.length === 0 && <p className="admin-empty">Поки немає відвідувань.</p>}
                </div>
                <div className="admin-chart__labels"><span>30 днів тому</span><span>Сьогодні</span></div>
              </section>

              <section className="admin-panel">
                <div className="admin-panel__head"><div><h2>Країни</h2><p>За останні {periodDays} днів</p></div></div>
                <ul className="admin-rank-list">
                  {data!.countries.map((item) => <li key={item.name}><span>{item.name}</span><b>{item.count}</b></li>)}
                  {data!.countries.length === 0 && <li className="admin-empty">Поки немає даних про країни.</li>}
                </ul>
              </section>

              <section className="admin-panel">
                <div className="admin-panel__head"><div><h2>Пристрої</h2><p>За останні {periodDays} днів</p></div></div>
                <ul className="admin-rank-list">
                  {data!.devices.map((item) => <li key={item.name}><span>{item.name}</span><b>{item.count}</b></li>)}
                  {data!.devices.length === 0 && <li className="admin-empty">Поки немає даних про пристрої.</li>}
                </ul>
              </section>

              <section className="admin-panel">
                <div className="admin-panel__head"><div><h2>Популярні сторінки</h2><p>За останні {periodDays} днів</p></div></div>
                <ul className="admin-rank-list admin-rank-list--pages">
                  {data!.pages.map((item) => <li key={item.name}><span>{item.name}</span><b>{item.count}</b></li>)}
                  {data!.pages.length === 0 && <li className="admin-empty">Поки немає переглядів.</li>}
                </ul>
              </section>
            </div>

            <section className="admin-panel admin-recent">
              <div className="admin-panel__head">
                <div><h2>Останні відвідування</h2><p>Останні 50 переглядів</p></div>
                {data!.visits > 50 && <Link className="admin-view-all" href="/admin/visits">Переглянути всі <span>↗</span></Link>}
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Час</th><th>IP</th><th>Країна</th><th>Пристрій</th><th>Браузер</th><th>Сторінка</th><th>Джерело</th></tr></thead>
                  <tbody>
                    {data!.recent.map((row, index) => <tr key={`${row.visitedAt.toISOString()}-${index}`}>
                      <td>{dateFormat.format(row.visitedAt)}</td><td>{row.ipAddress ?? "—"}</td><td>{countryName(row.country)}</td>
                      <td>{row.device}</td><td>{row.browser}</td><td className="admin-path">{row.path}</td><td>{row.referrerHost ?? "Прямий перехід"}</td>
                    </tr>)}
                    {data!.recent.length === 0 && <tr><td className="admin-empty" colSpan={7}>Ще немає відвідувань. Вони зʼявляться після згоди відвідувачів на збір статистики.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
            <p className="admin-footnote">Унікальні відвідувачі приблизні: визначаються за IP та типом браузера. Сторонні сервіси аналітики не використовуються.</p>
          </>
        )}
      </section>
    </div>
  );
}
