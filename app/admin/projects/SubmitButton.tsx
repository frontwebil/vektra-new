"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/**
 * Кнопка відправки форми з лоадером: поки сервер зберігає, показує спінер
 * і текст pending, а кнопка неактивна, щоб не натиснути двічі.
 */
export function SubmitButton({ children, pending: pendingText, className = "admin-button", disabled }: {
  children: ReactNode;
  pending: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${className} pe-submit ${pending ? "is-pending" : ""}`} disabled={disabled || pending} aria-busy={pending}>
      {pending && <i className="pe-spin" aria-hidden="true" />}
      {pending ? pendingText : children}
    </button>
  );
}

/** Напис поруч із кнопкою: «Зберігаю…» на час відправки. */
export function SaveState({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return <span>{pending ? "Зберігаю зміни…" : dirty ? "Є незбережені зміни" : "Усе збережено"}</span>;
}
