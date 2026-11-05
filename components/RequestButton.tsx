"use client";

import type { ReactNode } from "react";
import { openRequest } from "@/lib/request";
import { Arrow } from "./ui";

type Props = {
  children: ReactNode;
  variant?: "btn" | "white" | "link";
  service?: string;
  className?: string;
};

/** Усі заклики до дії відкривають попап заявки, а не ведуть на сторінку контактів. */
export function RequestButton({ children, variant = "btn", service, className = "" }: Props) {
  const cls = variant === "link" ? "lnk" : variant === "white" ? "btn btn--w" : "btn";
  return (
    <button type="button" className={`${cls} ${className}`} onClick={() => openRequest(service)}>
      {children} <Arrow />
    </button>
  );
}
