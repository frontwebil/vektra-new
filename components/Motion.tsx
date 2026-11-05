"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { getLenis, setLenis } from "@/lib/smooth";

gsap.registerPlugin(ScrollTrigger);

const GLYPHS = "/—[]()+#*01ABCDEFGHKLMNPRSTVX";

function scramble(el: HTMLElement) {
  const text = el.dataset.text || el.textContent || "";
  el.dataset.text = text;
  const chars = Array.from(text);
  const state = { p: 0 };
  // ширину фіксуємо, щоб сусідні елементи не сіпалися під час перебору
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  gsap.to(state, {
    p: 1,
    duration: 0.9,
    ease: "none",
    onUpdate() {
      const done = Math.floor(state.p * chars.length);
      el.textContent = chars
        .map((c, i) => (i < done || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join("");
    },
    onComplete() {
      el.textContent = text;
      el.style.minWidth = "";
    },
  });
}

/** Обгортає слова в абзаці, зберігаючи вкладені теги й кольори. */
function splitWords(root: HTMLElement) {
  if (root.dataset.split) return Array.from(root.querySelectorAll<HTMLElement>(".w"));
  root.dataset.split = "1";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const n of nodes) {
    const parts = (n.textContent || "").split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
      else {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = part;
        frag.appendChild(s);
      }
    }
    n.replaceWith(frag);
  }
  return Array.from(root.querySelectorAll<HTMLElement>(".w"));
}

function animatePage(main: HTMLElement) {
  const start = "top 88%";

  // Рядки заголовків виїжджають із маски
  main.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
    const lines = el.querySelectorAll(".ln__i");
    const inHero = el.closest("[data-hero]");
    const tween: gsap.TweenVars = { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.11, delay: inHero ? 0.25 : 0 };
    if (!inHero) tween.scrollTrigger = { trigger: el, start, once: true };
    gsap.fromTo(lines, { yPercent: 112 }, tween);
  });

  // Великі назви: по літерах
  main.querySelectorAll<HTMLElement>("[data-chars]").forEach((el) => {
    const inHero = el.closest("[data-hero]");
    const tween: gsap.TweenVars = { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.035, delay: inHero ? 0.2 : 0 };
    if (!inHero) tween.scrollTrigger = { trigger: el, start: "top 94%", once: true };
    gsap.fromTo(el.querySelectorAll(".ch__i"), { yPercent: 115 }, tween);
  });

  // Звичайна поява блоків. Сусідні елементи стартують із затримкою
  const risers = main.querySelectorAll("[data-r]");
  gsap.set(risers, { y: 28, autoAlpha: 0 });
  ScrollTrigger.batch(risers, {
    start,
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", stagger: 0.08 }),
  });

  // Великий абзац: слова проявляються разом зі скролом до свого кольору
  main.querySelectorAll<HTMLElement>("[data-words]").forEach((el) => {
    const words = splitWords(el);
    words.forEach((w) => {
      const final = getComputedStyle(w).color;
      gsap.fromTo(w, { color: "#2b2b2b" }, {
        color: final,
        ease: "none",
        scrollTrigger: { trigger: w, start: "top 82%", end: "top 62%", scrub: 0.4 },
      });
    });
    el.style.visibility = "visible";
  });

  // Лінії-роздільники промальовуються
  main.querySelectorAll<HTMLElement>("[data-hr]").forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 94%", once: true } });
  });

  // Зображення відкриваються шторкою
  main.querySelectorAll<HTMLElement>("[data-media]").forEach((el) => {
    const img = el.querySelector("img");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } });
    tl.fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut", clearProps: "clipPath" });
    if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1.04, duration: 1.8, ease: "expo.out", clearProps: "scale" }, 0.1);
  });

  // Лічильники
  main.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate() { el.textContent = String(Math.round(o.v)); },
    });
  });

  // Технічні мітки перебирають символи при появі
  main.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 94%", once: true, onEnter: () => scramble(el) });
  });

  // Повільний зсув елементів на скролі
  main.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    gsap.to(el, {
      y: Number(el.dataset.drift) * rem,
      ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 0.6 },
    });
  });

  // Величезні літери в процесі рухаються повільніше за контент
  main.querySelectorAll<HTMLElement>("[data-wm]").forEach((el, i) => {
    gsap.fromTo(el, { yPercent: 14 + i * 3 }, {
      yPercent: -6,
      ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 },
    });
  });

  // Точки-етапи в процесі загоряються по черзі
  main.querySelectorAll<HTMLElement>("[data-steps]").forEach((row) => {
    const dots = row.querySelectorAll(".dots i");
    gsap.to(dots, {
      backgroundColor: "#fff",
      stagger: 0.05,
      ease: "none",
      scrollTrigger: { trigger: row, start: "top 70%", end: "bottom 70%", scrub: 0.5 },
    });
  });

  // Прогрес читання статті й активний пункт змісту
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  const article = main.querySelector<HTMLElement>("[data-article]");
  if (bar && article) {
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: article, start: "top top", end: "bottom bottom", scrub: 0.2 } });
    main.querySelectorAll<HTMLElement>(".sect[id]").forEach((s) => {
      ScrollTrigger.create({
        trigger: s,
        start: "top 45%",
        end: "bottom 45%",
        toggleClass: { targets: `.ar-toc a[href="#${s.id}"]`, className: "is-on" },
      });
    });
  }

  // Етапи кейсу підсвічуються по мірі прокрутки
  const state = main.querySelector<HTMLElement>("[data-ap-state]");
  main.querySelectorAll<HTMLElement>(".cs-ap__item").forEach((it) => {
    ScrollTrigger.create({
      trigger: it,
      start: "top 55%",
      end: "bottom 55%",
      toggleClass: "is-on",
      onToggle: (st) => {
        if (st.isActive && state) state.textContent = it.querySelector("h3")?.textContent || "";
      },
    });
  });
}

export function Motion() {
  const path = usePathname();
  const router = useRouter();
  const first = useRef(true);

  // Плавний скрол і переходи між сторінками
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tick: ((t: number) => void) | null = null;
    if (!reduce) {
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const veil = document.querySelector<HTMLElement>("[data-veil]");
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") {
        if (href === "#") e.preventDefault();
        return;
      }
      if (!href.startsWith("/") && !href.startsWith("#")) return;
      const url = new URL(a.href);
      if (url.pathname === location.pathname) {
        if (url.hash) {
          e.preventDefault();
          const target = document.querySelector<HTMLElement>(url.hash);
          if (target) {
            const l = getLenis();
            if (l) l.scrollTo(target, { offset: -110 });
            else target.scrollIntoView();
          }
        }
        return;
      }
      if (reduce || !veil) return;
      e.preventDefault();
      veil.classList.add("is-on");
      window.setTimeout(() => router.push(url.pathname + url.hash), 380);
    };
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      if (tick) gsap.ticker.remove(tick);
      getLenis()?.destroy();
      setLenis(null);
    };
  }, [router]);

  // Анімації сторінки перезапускаються після кожного переходу
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".page");
    if (!main) return;
    (window as unknown as { __vk?: boolean }).__vk = true;
    const veil = document.querySelector<HTMLElement>("[data-veil]");
    if (!first.current) {
      const l = getLenis();
      if (l) l.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    }
    first.current = false;
    window.setTimeout(() => veil?.classList.remove("is-on"), 60);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.classList.remove("anim");
      return;
    }
    const ctx = gsap.context(() => animatePage(main), main);
    // Початкові стани вже виставлені скриптом, запасні зі стилів більше не потрібні
    document.documentElement.classList.remove("anim");

    // висота змінюється від шрифтів, акордеонів і зображень
    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(main);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [path]);

  return null;
}
