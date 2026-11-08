"use client";

import { deleteProjectAction } from "./actions";
import { SubmitButton } from "./SubmitButton";

export function DeleteProjectButton({ slug, name, disabled }: { slug: string; name: string; disabled?: boolean }) {
  return (
    <form
      action={deleteProjectAction}
      onSubmit={(e) => {
        if (!confirm(`Видалити проєкт «${name}»? Його сторінка зникне з сайту. Це не можна скасувати.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <SubmitButton className="admin-remove-item pe-danger" disabled={disabled} pending="Видаляю…">Видалити</SubmitButton>
    </form>
  );
}
