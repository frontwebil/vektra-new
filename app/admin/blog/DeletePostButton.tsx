"use client";

import { deletePostAction } from "./actions";
import { SubmitButton } from "../projects/SubmitButton";

export function DeletePostButton({ slug, title, disabled }: { slug: string; title: string; disabled?: boolean }) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(e) => {
        if (!confirm(`Видалити статтю «${title}»? Її сторінка зникне з сайту. Це не можна скасувати.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <SubmitButton className="admin-remove-item pe-danger" disabled={disabled} pending="Видаляю…">Видалити</SubmitButton>
    </form>
  );
}
