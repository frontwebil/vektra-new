/** Кнопки відкривають попап заявки цією подією, незалежно від того, де стоять. */
export const OPEN_REQUEST = "vektra:request";

export function openRequest(service?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_REQUEST, { detail: { service } }));
}

export type RequestData = {
  name: string;
  contact: string;
  services: string[];
  budget?: string;
  message: string;
};

/**
 * Якщо задано NEXT_PUBLIC_REQUEST_ENDPOINT, надсилає заявку на нього.
 * За замовчуванням використовує внутрішній API route, який передає заявку в Telegram.
 */
export async function sendRequest(data: RequestData): Promise<"sent"> {
  const endpoint = process.env.NEXT_PUBLIC_REQUEST_ENDPOINT || "/api/requests";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(String(res.status));
  return "sent";
}
