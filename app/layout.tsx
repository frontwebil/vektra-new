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
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CONTACT } from "@/lib/content";
import { DEFAULT_OG_IMAGE, HOME_TITLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Canonical тут немає навмисно: його задає кожна сторінка, інакше всі вказували б на головну
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s - ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: SITE_DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
  formatDetection: { telephone: false, email: false, address: false },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      email: CONTACT.email,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "uk-UA",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
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
        <AnalyticsTracker />
      </body>
    </html>
  );
}
