import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope/wght.css";
import "@/styles/system.css";
import "@/styles/sections.css";
import "@/styles/responsive.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Motion } from "@/components/Motion";
import { RequestModal } from "@/components/RequestModal";

export const metadata: Metadata = {
  title: { default: "Vektra — digital-агенція повного циклу", template: "%s — Vektra" },
  description: "Поєднуємо стратегію, брендинг, UX/UI дизайн, веброзробку та автоматизацію, щоб перетворювати бізнес-задачі на цифрові продукти.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000001",
};

// Стан до появи ставимо до першого малювання. Якщо скрипти не запустилися, сторінка все одно покажеться
const BOOT = `(function(){var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('anim');setTimeout(function(){if(!window.__vk)d.classList.remove('anim')},4000)}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <div className="page">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
        <div className="veil" data-veil aria-hidden="true" />
        <RequestModal />
        <Motion />
      </body>
    </html>
  );
}
