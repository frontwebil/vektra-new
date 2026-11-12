import type { Metadata } from "next";
import type { ReactNode } from "react";

// Уся адмінка (і майбутні її сторінки) закрита від індексації
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
