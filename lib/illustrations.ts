/**
 * Ілюстрації з макета. Файли лежать у public/illustrations.
 * Щоб замінити файл оригіналом із Figma, збережіть експорт із такою самою назвою
 * і вкажіть його розмір тут: частинки й анімація підлаштуються самі.
 */
export type IllustrationName =
  | "hero"
  | "flower"
  | "lattice"
  | "knot"
  | "wave"
  | "sphere"
  | "infinity"
  | "vortex"
  | "web";

export type Motion = {
  /** обертання всієї форми, рад/с */
  spin: number;
  /** закручування навколо центра: ближче до центра сильніше */
  swirl: number;
  /** хвиля, що біжить форму по горизонталі */
  wave: number;
  /** радіальні пульсації від центра */
  pulse: number;
  /** м'який шум потоку */
  noise: number;
};

export type Illustration = { src: string; w: number; h: number; motion: Motion };

export const ILLUSTRATIONS: Record<IllustrationName, Illustration> = {
  hero: { src: "/illustrations/hero.png", w: 2200, h: 1560, motion: { spin: 0, swirl: 0, wave: 0.02, pulse: 0.022, noise: 0.012 } },
  flower: { src: "/illustrations/flower.png", w: 1014, h: 1032, motion: { spin: 0.05, swirl: 0.1, wave: 0, pulse: 0.012, noise: 0.008 } },
  lattice: { src: "/illustrations/lattice.png", w: 625, h: 540, motion: { spin: 0, swirl: 0, wave: 0, pulse: 0.03, noise: 0.008 } },
  knot: { src: "/illustrations/knot.png", w: 625, h: 545, motion: { spin: 0.04, swirl: 0.16, wave: 0, pulse: 0.012, noise: 0.01 } },
  wave: { src: "/illustrations/wave.png", w: 625, h: 545, motion: { spin: 0, swirl: 0, wave: 0.038, pulse: 0.008, noise: 0.008 } },
  sphere: { src: "/illustrations/sphere.png", w: 625, h: 545, motion: { spin: 0, swirl: 0, wave: 0, pulse: 0.036, noise: 0.008 } },
  infinity: { src: "/illustrations/infinity.png", w: 625, h: 545, motion: { spin: 0, swirl: 0.22, wave: 0.008, pulse: 0.008, noise: 0.01 } },
  vortex: { src: "/illustrations/vortex.png", w: 1824, h: 680, motion: { spin: 0, swirl: 0.2, wave: 0.012, pulse: 0.008, noise: 0.012 } },
  web: { src: "/illustrations/web.png", w: 1522, h: 570, motion: { spin: 0, swirl: 0.06, wave: 0.016, pulse: 0.014, noise: 0.012 } },
};
