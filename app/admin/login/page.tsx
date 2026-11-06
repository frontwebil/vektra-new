import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { loginAction } from "@/app/admin/login/actions";

export const metadata: Metadata = { title: "Вхід до адмінки", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await hasAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <span className="admin-kicker">VEKTRA / ADMIN</span>
        <h1>Вхід до панелі</h1>
        {!configured ? (
          <p className="admin-notice">Додайте <code>ADMIN_PASSWORD</code> і <code>ADMIN_SESSION_SECRET</code> у файл оточення.</p>
        ) : (
          <form action={loginAction} className="admin-login__form">
            <label htmlFor="admin-password">Пароль</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus />
            {error === "invalid" && <p className="admin-error">Неправильний пароль.</p>}
            <button className="admin-button" type="submit">Увійти</button>
          </form>
        )}
        <a className="admin-back" href="/">Повернутися на сайт ↗</a>
      </div>
    </div>
  );
}
