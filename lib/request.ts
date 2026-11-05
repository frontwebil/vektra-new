import { CONTACT } from "./content";

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
 * Якщо задано NEXT_PUBLIC_REQUEST_ENDPOINT, заявка йде туди POST-запитом у JSON.
 * Без нього відкривається лист із заповненим текстом на адресу агенції.
 */
export async function sendRequest(data: RequestData): Promise<"sent" | "mail"> {
  const endpoint = process.env.NEXT_PUBLIC_REQUEST_ENDPOINT;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(String(res.status));
    return "sent";
  }
  const body = [
    `Ім’я: ${data.name}`,
    `Контакт: ${data.contact}`,
    data.services.length ? `Послуги: ${data.services.join(", ")}` : "",
    data.budget ? `Бюджет: ${data.budget}` : "",
    "",
    data.message,
  ].filter((l, i) => l || i === 4).join("\n");
  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Запит із сайту Vektra")}&body=${encodeURIComponent(body)}`;
  return "mail";
}
