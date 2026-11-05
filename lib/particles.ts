import { ILLUSTRATIONS, type IllustrationName, type Motion } from "./illustrations";

/**
 * Оживляє реальну ілюстрацію з макета: положення частинок беруться з яскравості
 * файлу, тому форма завжди та сама, що в Figma. Під частинками лежить сам файл,
 * який деформується разом із ними. Зміна name перетікає однією формою в іншу.
 */

const VERT = `
attribute vec4 aA;
attribute vec3 aB;
attribute vec2 aPrev;
uniform float uT, uReveal, uMorph, uSize, uDpr, uGain;
uniform float uSpin, uSwirl, uWave, uPulse, uNoise, uHover;
uniform vec2 uView, uPtr;
varying float vA;

vec2 flow(vec2 p, float t) {
  return vec2(
    sin(p.y * 2.1 + t * .31) + sin(p.x * 1.7 - t * .23 + p.y * .6),
    sin(p.x * 2.3 - t * .27) + cos(p.y * 1.9 + t * .19 - p.x * .5)
  );
}
vec2 rot(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}
vec2 live(vec2 p) {
  float r = length(p);
  p = rot(p, uSpin * uT + uSwirl * sin(uT * .22) / (r + .45));
  p.y += uWave * sin(p.x * 3.2 + uT * .8) * 1.4;
  p *= 1. + uPulse * sin(r * 7. - uT * 1.1);
  p += flow(p * 1.4, uT) * uNoise;
  return p;
}
void main() {
  float m = uMorph * uMorph * (3. - 2. * uMorph);
  vec2 home = aA.xy;
  vec2 p = mix(aPrev, home, m);
  float arc = sin(3.14159 * m);
  p += vec2(-(home.y - aPrev.y), home.x - aPrev.x) * arc * (aB.x - .5) * .9;

  float r = length(home);
  float stag = clamp(r * .28 + aB.x * .45, 0., .72);
  float d = clamp((uReveal - stag) / (1. - stag), 0., 1.);
  d = 1. - pow(1. - d, 3.);

  p = live(p);

  vec2 dp = p - uPtr;
  float f = exp(-dot(dp, dp) * 16.) * uHover;
  p += normalize(dp + vec2(.0001)) * f * (.05 + aB.y * .08);
  p += vec2(-dp.y, dp.x) * f * .22;

  float a0 = (1. - d) * (2.2 + aB.y * 1.6);
  vec2 far = rot(home * (1.18 + aB.z * .9), a0);
  p = mix(far, p, d);

  gl_Position = vec4(p * uView, 0., 1.);
  float big = pow(aB.y, 14.) * 2.2;
  gl_PointSize = uDpr * uSize * (.72 + aA.z * .8 + big);
  float tw = .72 + .28 * sin(uT * (.5 + aB.y * 1.7) + aA.w * 6.283);
  vA = uGain * (.1 + aA.z * .8 + big * 1.4) * tw * d * d;
}`;

const FRAG = `
precision mediump float;
varying float vA;
void main() {
  float q = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .12, q) * vA;
  gl_FragColor = vec4(a, a, a, a);
}`;

const QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vC;
void main() { vC = aPos; gl_Position = vec4(aPos, 0., 1.); }`;

const QUAD_FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uT, uBase, uAspect;
uniform float uSpin, uSwirl, uWave, uPulse, uNoise;
uniform vec2 uView;
varying vec2 vC;
vec2 flow(vec2 p, float t) {
  return vec2(
    sin(p.y * 2.1 + t * .31) + sin(p.x * 1.7 - t * .23 + p.y * .6),
    sin(p.x * 2.3 - t * .27) + cos(p.y * 1.9 + t * .19 - p.x * .5)
  );
}
vec2 rot(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}
void main() {
  vec2 p = vC / uView;
  p -= flow(p * 1.4, uT) * uNoise;
  float r = length(p);
  p /= 1. + uPulse * sin(r * 7. - uT * 1.1);
  p.y -= uWave * sin(p.x * 3.2 + uT * .8) * 1.4;
  r = length(p);
  p = rot(p, -(uSpin * uT + uSwirl * sin(uT * .22) / (r + .45)));
  vec2 uv = vec2(p.x / uAspect, -p.y) * .5 + .5;
  float l = 0.;
  if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) l = texture2D(uTex, uv).r;
  l *= uBase;
  gl_FragColor = vec4(l, l, l, l);
}`;

type Samples = {
  home: Float32Array; // x, y, lum, seed
  seeds: Float32Array;
  image: HTMLImageElement;
  aspect: number;
  n: number;
};

const cache = new Map<string, Promise<Samples>>();

function loadSamples(name: IllustrationName, n: number): Promise<Samples> {
  const key = `${name}:${n}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const def = ILLUSTRATIONS[name];
  const p = new Promise<Samples>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const k = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
      const w = Math.round(image.naturalWidth * k);
      const h = Math.round(image.naturalHeight * k);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.fillStyle = "#000";
      g.fillRect(0, 0, w, h);
      g.drawImage(image, 0, 0, w, h);
      const px = g.getImageData(0, 0, w, h).data;
      // чорна точка й нормування: лише яскраві ділянки несуть форму
      const hist = new Uint32Array(256);
      for (let i = 0; i < px.length; i += 4) hist[px[i]]++;
      const total = w * h;
      let acc = 0, low = 0, top = 255;
      for (let v = 0; v < 256; v++) {
        acc += hist[v];
        if (acc < total * 0.2) low = v;
        if (acc < total * 0.998) top = v;
      }
      top = Math.max(top, low + 12);
      const cum = new Float32Array(total);
      const lum = new Float32Array(total);
      let sum = 0;
      for (let i = 0; i < total; i++) {
        const l = Math.max(0, px[i * 4] - low) / (top - low);
        lum[i] = Math.min(1, l);
        sum += Math.pow(lum[i], 1.2);
        cum[i] = sum;
      }
      const aspect = w / h;
      const home = new Float32Array(n * 4);
      const seeds = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const t = Math.random() * sum;
        let a = 0, b = total - 1;
        while (a < b) {
          const m = (a + b) >> 1;
          if (cum[m] < t) a = m + 1;
          else b = m;
        }
        const x = a % w, y = (a / w) | 0;
        home[i * 4] = ((x + Math.random()) / w) * 2 * aspect - aspect;
        home[i * 4 + 1] = 1 - ((y + Math.random()) / h) * 2;
        home[i * 4 + 2] = lum[a];
        home[i * 4 + 3] = Math.random();
        seeds[i * 3] = Math.random();
        seeds[i * 3 + 1] = Math.random();
        seeds[i * 3 + 2] = Math.random();
      }
      resolve({ home, seeds, image, aspect, n });
    };
    image.onerror = reject;
    image.src = def.src;
  });
  cache.set(key, p);
  return p;
}

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}

function program(gl: WebGLRenderingContext, v: string, f: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, v));
  gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, f));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
}

export type FieldOptions = {
  fit: "contain" | "cover";
  zoom: number;
  density: number;
  brightness: number;
  interactive: boolean;
  onFail: () => void;
};

export class ParticleField {
  private gl: WebGLRenderingContext;
  private pts: WebGLProgram;
  private quad: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private q: Record<string, WebGLUniformLocation | null> = {};
  private bufA: WebGLBuffer;
  private bufB: WebGLBuffer;
  private bufPrev: WebGLBuffer;
  private bufQuad: WebGLBuffer;
  private tex: WebGLTexture;
  private raf = 0;
  private running = false;
  private visible = false;
  private last = 0;
  private time = Math.random() * 40;
  private reveal = 0;
  private revealing = false;
  private morph = 1;
  private pendingTex: HTMLImageElement | null = null;
  private count = 0;
  private drawCount = 0;
  private aspect = 1;
  private cw = 1;
  private ch = 1;
  private dpr = 1;
  private motion: Motion;
  private ptr = { x: 9, y: 9, hover: 0, target: 0 };
  private slow = 0;
  private frames = 0;
  private lastScroll = 0;
  private boost = 0;
  private current: IllustrationName;
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private token = 0;
  private ready = false;
  private destroyed = false;

  constructor(private canvas: HTMLCanvasElement, name: IllustrationName, private o: FieldOptions) {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) throw new Error("no webgl");
    this.gl = gl;
    this.current = name;
    this.motion = ILLUSTRATIONS[name].motion;
    this.pts = program(gl, VERT, FRAG);
    this.quad = program(gl, QUAD_VERT, QUAD_FRAG);
    for (const k of ["uT", "uReveal", "uMorph", "uSize", "uDpr", "uGain", "uSpin", "uSwirl", "uWave", "uPulse", "uNoise", "uHover", "uView", "uPtr"]) {
      this.u[k] = gl.getUniformLocation(this.pts, k);
    }
    for (const k of ["uTex", "uT", "uBase", "uAspect", "uSpin", "uSwirl", "uWave", "uPulse", "uNoise", "uView"]) {
      this.q[k] = gl.getUniformLocation(this.quad, k);
    }
    this.bufA = gl.createBuffer()!;
    this.bufB = gl.createBuffer()!;
    this.bufPrev = gl.createBuffer()!;
    this.bufQuad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufQuad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver((e) => {
      this.visible = e[e.length - 1].isIntersecting;
      if (this.visible && !this.reveal && !this.revealing && this.ready) this.revealing = true;
      this.sync();
    }, { rootMargin: "10% 0px" });
    this.io.observe(canvas);
    document.addEventListener("visibilitychange", this.sync);
    if (o.interactive && matchMedia("(hover:hover)").matches) {
      window.addEventListener("pointermove", this.onPointer, { passive: true });
    }
    this.resize();
    this.load(name, true);
  }

  private particleCount() {
    const area = this.cw * this.ch;
    const n = Math.min(120000, Math.max(16000, area * 0.11)) * this.o.density;
    return Math.round(n);
  }

  private async load(name: IllustrationName, first: boolean) {
    const tok = ++this.token;
    const n = this.count || this.particleCount();
    let s: Samples;
    try {
      s = await loadSamples(name, n);
    } catch {
      if (first) this.o.onFail();
      return;
    }
    if (tok !== this.token || this.destroyed) return;
    const gl = this.gl;
    if (first || !this.count) {
      this.count = s.n;
      this.drawCount = s.n;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPrev);
      gl.bufferData(gl.ARRAY_BUFFER, this.prevFrom(s.home), gl.DYNAMIC_DRAW);
      this.setTexture(s.image);
      this.aspect = s.aspect;
      this.morph = 1;
    } else {
      const old = this.homeData;
      if (old) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPrev);
        gl.bufferData(gl.ARRAY_BUFFER, this.prevFrom(old), gl.DYNAMIC_DRAW);
      }
      this.pendingTex = s.image;
      this.pendingAspect = s.aspect;
      this.morph = 0;
    }
    this.homeData = s.home;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufA);
    gl.bufferData(gl.ARRAY_BUFFER, s.home, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufB);
    gl.bufferData(gl.ARRAY_BUFFER, s.seeds, gl.STATIC_DRAW);
    this.motion = ILLUSTRATIONS[name].motion;
    this.current = name;
    this.ready = true;
    this.applyView();
    if (this.visible && !this.reveal) this.revealing = true;
    this.sync();
  }

  private homeData: Float32Array | null = null;
  private pendingAspect = 1;

  private prevFrom(home: Float32Array) {
    const out = new Float32Array((home.length / 4) * 2);
    for (let i = 0, j = 0; i < home.length; i += 4, j += 2) {
      out[j] = home[i];
      out[j + 1] = home[i + 1];
    }
    return out;
  }

  private setTexture(img: HTMLImageElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  }

  setIllustration(name: IllustrationName) {
    if (name === this.current && this.ready) return;
    this.load(name, false);
  }

  private onPointer = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    this.ptr.target = inside ? 1 : 0;
    if (!inside) return;
    const [sx, sy] = this.view();
    this.ptr.x = (((e.clientX - r.left) / r.width) * 2 - 1) / sx;
    this.ptr.y = (1 - ((e.clientY - r.top) / r.height) * 2) / sy;
  };

  private view(): [number, number] {
    const ca = this.cw / this.ch;
    const ia = this.aspect;
    const k = (this.o.fit === "contain" ? Math.min(1, ca / ia) : Math.max(1, ca / ia)) * this.o.zoom;
    return [k / ca, k];
  }

  private applyView() {
    const gl = this.gl;
    const [sx, sy] = this.view();
    gl.useProgram(this.pts);
    gl.uniform2f(this.u.uView, sx, sy);
    gl.useProgram(this.quad);
    gl.uniform2f(this.q.uView, sx, sy);
    gl.uniform1f(this.q.uAspect, this.aspect);
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.cw = r.width;
    this.ch = r.height;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.applyView();
    if (this.ready && !this.running) this.frame(performance.now());
  }

  private sync = () => {
    const should = this.visible && !document.hidden && this.ready;
    if (should && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.lastScroll = window.scrollY;
      this.raf = requestAnimationFrame(this.frame);
    } else if (!should && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  };

  private frame = (now: number) => {
    const raw = (now - this.last) / 1000;
    const dt = Math.min(0.05, raw);
    this.last = now;
    // скрол підганяє рух, форма відгукується на прокрутку
    const sc = window.scrollY;
    const v = Math.min(1, Math.abs(sc - this.lastScroll) / 60);
    this.lastScroll = sc;
    this.boost += (v * 4 - this.boost) * 0.08;
    this.time += dt * (1 + this.boost);
    if (this.revealing) {
      this.reveal = Math.min(1, this.reveal + Math.min(raw, 0.25) / 2.4);
      if (this.reveal >= 1) this.revealing = false;
    }
    if (this.morph < 1) {
      this.morph = Math.min(1, this.morph + Math.min(raw, 0.25) / 1.25);
      if (this.morph >= 0.5 && this.pendingTex) {
        this.setTexture(this.pendingTex);
        this.pendingTex = null;
        this.aspect = this.pendingAspect;
        this.applyView();
      }
    }
    this.ptr.hover += (this.ptr.target - this.ptr.hover) * 0.06;
    this.draw();
    // якщо пристрій не встигає, малюємо менше частинок
    if (this.running) {
      this.frames++;
      this.slow += raw;
      if (this.slow >= 1.2) {
        if (this.frames / this.slow < 34) this.drawCount = Math.max(Math.round(this.count * 0.25), Math.round(this.drawCount * 0.65));
        this.frames = 0;
        this.slow = 0;
      }
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  private draw() {
    const gl = this.gl;
    const m = this.motion;
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.drawCount) return;
    const fade = Math.abs(this.morph * 2 - 1);
    const b = this.o.brightness;

    gl.useProgram(this.quad);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufQuad);
    const qa = gl.getAttribLocation(this.quad, "aPos");
    gl.enableVertexAttribArray(qa);
    gl.vertexAttribPointer(qa, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(this.q.uT, this.time);
    gl.uniform1f(this.q.uBase, 0.8 * b * this.reveal * this.reveal * fade);
    gl.uniform1f(this.q.uSpin, m.spin);
    gl.uniform1f(this.q.uSwirl, m.swirl);
    gl.uniform1f(this.q.uWave, m.wave);
    gl.uniform1f(this.q.uPulse, m.pulse);
    gl.uniform1f(this.q.uNoise, m.noise);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(qa);

    gl.useProgram(this.pts);
    const a = gl.getAttribLocation(this.pts, "aA");
    const s = gl.getAttribLocation(this.pts, "aB");
    const p = gl.getAttribLocation(this.pts, "aPrev");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufA);
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufB);
    gl.enableVertexAttribArray(s);
    gl.vertexAttribPointer(s, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPrev);
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(this.u.uT, this.time);
    gl.uniform1f(this.u.uReveal, this.reveal);
    gl.uniform1f(this.u.uMorph, this.morph);
    gl.uniform1f(this.u.uDpr, this.dpr);
    gl.uniform1f(this.u.uSize, 1.15);
    gl.uniform1f(this.u.uGain, 0.2 * b);
    gl.uniform1f(this.u.uSpin, m.spin);
    gl.uniform1f(this.u.uSwirl, m.swirl);
    gl.uniform1f(this.u.uWave, m.wave);
    gl.uniform1f(this.u.uPulse, m.pulse);
    gl.uniform1f(this.u.uNoise, m.noise);
    gl.uniform1f(this.u.uHover, this.ptr.hover);
    gl.uniform2f(this.u.uPtr, this.ptr.x, this.ptr.y);
    gl.drawArrays(gl.POINTS, 0, this.drawCount);
  }

  destroy() {
    this.destroyed = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    document.removeEventListener("visibilitychange", this.sync);
    window.removeEventListener("pointermove", this.onPointer);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
