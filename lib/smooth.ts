import type Lenis from "lenis";

let instance: Lenis | null = null;
let locks = 0;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

export function setScrollLocked(on: boolean) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const locked = locks > 0;
  document.documentElement.classList.toggle("is-locked", locked);
  if (locked) instance?.stop();
  else instance?.start();
}
