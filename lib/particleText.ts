/**
 * Particle text assembly for the Who Uses cards.
 *
 * On assemble(): the card's icon + role dissolve into a few thousand particles
 * that stream across the card and lock into the exact pixels of the revealed
 * role + description, all converging together. When they land, the real DOM
 * text fades in underneath and the canvas fades out, so the end state is crisp,
 * selectable text. scatter() runs it in reverse: the text breaks back into
 * particles that drift away and fade.
 *
 * Target pixels come from the live DOM layout (one Range per word), so the
 * particles land exactly where the browser draws the text.
 */

const MAX_PARTICLES = 6500;
const IN_DURATION = 1.05; // s, per particle
const IN_STAGGER = 0.28; // s, max random delay
const OUT_DURATION = 0.7;
const HANDOFF = 0.4; // s, canvas fade-out while the DOM text fades in
const SIZE = 1.35; // css px

type Mode = "idle" | "in" | "handoff" | "out";

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export class ParticleAssembler {
  private ctx: CanvasRenderingContext2D | null;
  private w = 0;
  private h = 0;
  private n = 0;
  private x = new Float32Array(0);
  private y = new Float32Array(0);
  private sx = new Float32Array(0); // phase start
  private sy = new Float32Array(0);
  private tx = new Float32Array(0); // text pixel
  private ty = new Float32Array(0);
  private ex = new Float32Array(0); // phase end
  private ey = new Float32Array(0);
  private delay = new Float32Array(0);
  private swirl = new Float32Array(0);
  /** particles are sorted by colour; groups[i] = [colour, start, end) */
  private groups: [string, number, number][] = [];
  private mode: Mode = "idle";
  private t0 = 0;
  private raf = 0;

  constructor(
    private card: HTMLElement,
    private canvas: HTMLCanvasElement,
    private onShown: () => void
  ) {
    this.ctx = canvas.getContext("2d");
  }

  assemble() {
    if (!this.ctx) return this.onShown();
    const fresh = this.mode === "idle" || this.mode === "handoff";
    if (!this.build()) return this.onShown();
    if (fresh) {
      // start from the icon + role pixels (or anywhere, if those can't be read)
      const src = this.sampleFront();
      for (let i = 0; i < this.n; i++) {
        const p = src.length ? src[(Math.random() * src.length) | 0] : [Math.random() * this.w, Math.random() * this.h];
        this.x[i] = p[0] + (Math.random() - 0.5) * 3;
        this.y[i] = p[1] + (Math.random() - 0.5) * 3;
      }
    }
    // otherwise (interrupting a scatter) start from wherever the particles are now
    for (let i = 0; i < this.n; i++) {
      this.sx[i] = this.x[i];
      this.sy[i] = this.y[i];
      this.ex[i] = this.tx[i];
      this.ey[i] = this.ty[i];
      this.delay[i] = Math.random() * IN_STAGGER;
      this.swirl[i] = (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 46);
    }
    this.go("in");
  }

  scatter() {
    if (!this.ctx || this.n === 0 || this.mode === "idle") {
      this.stop();
      return;
    }
    const cx = this.w / 2;
    const cy = this.h / 2;
    const fromText = this.mode === "handoff";
    for (let i = 0; i < this.n; i++) {
      if (fromText) {
        this.x[i] = this.tx[i];
        this.y[i] = this.ty[i];
      }
      this.sx[i] = this.x[i];
      this.sy[i] = this.y[i];
      const a = Math.atan2(this.y[i] - cy, this.x[i] - cx) + (Math.random() - 0.5) * 1.4;
      const d = 40 + Math.random() * 120;
      this.ex[i] = this.x[i] + Math.cos(a) * d;
      this.ey[i] = this.y[i] + Math.sin(a) * d - 20 * Math.random();
      this.delay[i] = Math.random() * 0.18;
      this.swirl[i] = (Math.random() - 0.5) * 30;
    }
    this.go("out");
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }

  /* ---------------------------------------------------------------- */

  private go(mode: Mode) {
    this.mode = mode;
    this.t0 = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    this.mode = "idle";
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private frame = (now: number) => {
    const ctx = this.ctx!;
    const t = (now - this.t0) / 1000;
    const dpr = this.canvas.width / Math.max(1, this.w);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let done = true;
    let fade = 1;

    if (this.mode === "handoff") {
      fade = 1 - Math.min(1, t / HANDOFF);
      if (fade > 0) done = false;
    }

    const dur = this.mode === "out" ? OUT_DURATION : IN_DURATION;
    for (const [colour, a, b] of this.groups) {
      ctx.fillStyle = colour;
      for (let i = a; i < b; i++) {
        let alpha = fade;
        if (this.mode === "in" || this.mode === "out") {
          const raw = (t - this.delay[i]) / dur;
          const p = raw <= 0 ? 0 : raw >= 1 ? 1 : raw;
          if (p < 1) done = false;
          const e = this.mode === "in" ? easeInOut(p) : easeOut(p);
          const dx = this.ex[i] - this.sx[i];
          const dy = this.ey[i] - this.sy[i];
          const len = Math.hypot(dx, dy) || 1;
          // curve sideways mid-flight, settling exactly on the end point
          const bend = this.swirl[i] * Math.sin(Math.PI * e);
          this.x[i] = this.sx[i] + dx * e + (-dy / len) * bend;
          this.y[i] = this.sy[i] + dy * e + (dx / len) * bend;
          alpha = this.mode === "in" ? Math.min(1, 0.25 + p * 3) : 1 - e;
        }
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x[i], this.y[i], SIZE, SIZE);
      }
    }
    ctx.globalAlpha = 1;

    if (!done) {
      this.raf = requestAnimationFrame(this.frame);
      return;
    }
    if (this.mode === "in") {
      // landed: let the real text take over
      this.onShown();
      this.go("handoff");
    } else {
      this.stop();
    }
  };

  /** Sample the revealed text into particle targets. Returns false if there's nothing to draw. */
  private build(): boolean {
    const card = this.card;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    if (!w || !h) return false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }
    // targets only need rebuilding when the card size changes
    if (w === this.w && h === this.h && this.n > 0) return true;
    this.w = w;
    this.h = h;

    const rect = card.getBoundingClientRect();
    const k = w / rect.width; // undo any transform scale on ancestors
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const o = off.getContext("2d", { willReadFrequently: true });
    const reveal = card.querySelector<HTMLElement>(".who-reveal");
    if (!o || !reveal) return false;

    // group words by colour, one sampling pass per colour
    const byColour = new Map<string, { word: string; x: number; y: number; font: string }[]>();
    const walker = document.createTreeWalker(reveal, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el || el.getClientRects().length === 0) continue; // display:none
      const cs = getComputedStyle(el);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const text = node.textContent ?? "";
      for (const m of text.matchAll(/\S+/g)) {
        range.setStart(node, m.index!);
        range.setEnd(node, m.index! + m[0].length);
        const r = range.getClientRects()[0];
        if (!r) continue;
        const list = byColour.get(cs.color) ?? [];
        list.push({ word: m[0], x: (r.left - rect.left) * k, y: (r.top + r.height / 2 - rect.top) * k, font });
        byColour.set(cs.color, list);
      }
    }

    const pts: { x: number; y: number; c: number }[] = [];
    const colours: string[] = [];
    o.textBaseline = "middle";
    o.fillStyle = "#000";
    for (const [colour, words] of byColour) {
      o.clearRect(0, 0, w, h);
      for (const wd of words) {
        o.font = wd.font;
        o.fillText(wd.word, wd.x, wd.y);
      }
      const data = o.getImageData(0, 0, w, h).data;
      const c = colours.push(colour) - 1;
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          if (data[(yy * w + xx) * 4 + 3] > 110) pts.push({ x: xx, y: yy, c });
        }
      }
    }
    if (!pts.length) return false;

    // cap the count, keeping an even spread
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    const kept = pts.slice(0, MAX_PARTICLES).sort((a, b) => a.c - b.c);

    const n = kept.length;
    this.n = n;
    this.x = new Float32Array(n);
    this.y = new Float32Array(n);
    this.sx = new Float32Array(n);
    this.sy = new Float32Array(n);
    this.tx = new Float32Array(n);
    this.ty = new Float32Array(n);
    this.ex = new Float32Array(n);
    this.ey = new Float32Array(n);
    this.delay = new Float32Array(n);
    this.swirl = new Float32Array(n);
    this.groups = [];
    for (let i = 0; i < n; i++) {
      this.tx[i] = kept[i].x;
      this.ty[i] = kept[i].y;
      const last = this.groups[this.groups.length - 1];
      if (last && last[0] === colours[kept[i].c]) last[2] = i + 1;
      else this.groups.push([colours[kept[i].c], i, i + 1]);
    }
    this.mode = this.mode === "handoff" ? "idle" : this.mode;
    return true;
  }

  /** Pixels of the resting face (icon + role), where the particles come from. */
  private sampleFront(): [number, number][] {
    const w = this.w;
    const h = this.h;
    const rect = this.card.getBoundingClientRect();
    const k = w / rect.width;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const o = off.getContext("2d", { willReadFrequently: true });
    if (!o) return [];
    try {
      const icon = this.card.querySelector<HTMLImageElement>(".who-front .user-icon");
      if (icon?.complete && icon.naturalWidth) {
        const r = icon.getBoundingClientRect();
        o.drawImage(icon, (r.left - rect.left) * k, (r.top - rect.top) * k, r.width * k, r.height * k);
      }
      const role = this.card.querySelector<HTMLElement>(".who-front .role");
      if (role) {
        const cs = getComputedStyle(role);
        o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        o.textBaseline = "middle";
        const range = document.createRange();
        const node = role.firstChild;
        if (node) {
          for (const m of (node.textContent ?? "").matchAll(/\S+/g)) {
            range.setStart(node, m.index!);
            range.setEnd(node, m.index! + m[0].length);
            const r = range.getClientRects()[0];
            if (r) o.fillText(m[0], (r.left - rect.left) * k, (r.top + r.height / 2 - rect.top) * k);
          }
        }
      }
      const data = o.getImageData(0, 0, w, h).data;
      const out: [number, number][] = [];
      for (let yy = 0; yy < h; yy += 2) {
        for (let xx = 0; xx < w; xx += 2) {
          if (data[(yy * w + xx) * 4 + 3] > 110) out.push([xx, yy]);
        }
      }
      return out;
    } catch {
      return []; // canvas tainted or similar: fall back to random starts
    }
  }
}
