/**
 * Shared Three.js stage for the small capability icons.
 *
 * Seven separate <canvas> WebGL contexts would be wasteful (and browsers cap
 * them), so there is ONE off-screen WebGLRenderer. Each frame it renders every
 * visible icon's tiny scene in turn and copies the result into that icon's own
 * 2D canvas. One loop, one GPU context, nothing drawn for icons off screen.
 *
 * This module imports three, so it is only loaded via dynamic import() when the
 * first icon scrolls near the viewport.
 */
import * as THREE from "three";

export type IconKind = "agentic" | "tenant" | "llm" | "rag" | "eval" | "security" | "observability";

export type IconHandle = {
  setVisible: (v: boolean) => void;
  setHover: (h: boolean) => void;
  dispose: () => void;
};

type Built = {
  root: THREE.Group;
  /** materials that glow gold on hover */
  glow: THREE.MeshStandardMaterial[];
  /** per-icon idle motion; hk = hover amount 0..1, k = intensity */
  animate?: (t: number, dt: number, hk: number, k: number) => void;
};

type Entry = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene: THREE.Scene;
  built: Built;
  visible: boolean;
  hover: boolean;
  hk: number;
  t: number;
};

export const ICON_PX = 72;

const GOLD = new THREE.Color("#F5BC27"); // hover glow: Electric Blue
const BASE_EMISSIVE = new THREE.Color("#0d0f12");

let renderer: THREE.WebGLRenderer | null = null;
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
// framed so the widest icon (agentic orbit, ~1.45 units) just fits the 72px well
camera.position.set(0, 0, 4.9);
const entries = new Set<Entry>();

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowPower = () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

function getRenderer() {
  if (renderer) return renderer;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  const px = Math.round(ICON_PX * Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(px, px, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.addEventListener("visibilitychange", schedule);
  return renderer;
}

function draw(e: Entry) {
  const r = getRenderer();
  r.render(e.scene, camera);
  // copy synchronously after render, so preserveDrawingBuffer is not needed
  e.ctx.clearRect(0, 0, e.canvas.width, e.canvas.height);
  e.ctx.drawImage(r.domElement, 0, 0, e.canvas.width, e.canvas.height);
}

function step(e: Entry, dt: number, k: number) {
  e.hk += ((e.hover ? 1 : 0) - e.hk) * Math.min(1, dt * 7);
  e.t += dt * k * (1 + e.hk * 1.8);
  const { root, glow, animate } = e.built;
  // gentle idle spin, faster + tilted toward the viewer on hover
  root.rotation.y += dt * (0.45 + e.hk * 1.6) * k;
  root.rotation.x = 0.35 + Math.sin(e.t * 0.6) * 0.08 * k - e.hk * 0.28;
  for (const m of glow) m.emissive.copy(BASE_EMISSIVE).lerp(GOLD, 0.06 + e.hk * 0.42);
  animate?.(e.t, dt, e.hk, k);
}

let raf = 0;
let last = 0;
let lastDraw = 0;

function loop(now: number) {
  raf = 0;
  const small = lowPower();
  const minFrame = small ? 1000 / 30 : 0; // ~30fps on phones
  const visible = [...entries].filter((e) => e.visible);
  if (!visible.length || document.hidden || reduced()) return;

  raf = requestAnimationFrame(loop);
  if (now - lastDraw < minFrame) return;
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  lastDraw = now;
  const k = small ? 0.6 : 1; // calmer on phones
  for (const e of visible) {
    step(e, dt, k);
    draw(e);
  }
}

function schedule() {
  if (raf || document.hidden || reduced()) return;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

/* ---------------- icon designs ---------------- */

function purpleMat() {
  return new THREE.MeshStandardMaterial({
    color: "#3a424e",
    roughness: 0.42,
    metalness: 0.3,
    emissive: BASE_EMISSIVE.clone(),
    emissiveIntensity: 1,
  });
}

function goldMat() {
  return new THREE.MeshStandardMaterial({
    color: "#F5BC27",
    roughness: 0.35,
    metalness: 0.55,
    emissive: new THREE.Color("#003a52"),
  });
}

const goldLine = () => new THREE.LineBasicMaterial({ color: "#F5BC27", transparent: true, opacity: 0.85 });

function withEdges(mesh: THREE.Mesh, threshold = 20) {
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, threshold), goldLine()));
  return mesh;
}

const BUILDERS: Record<IconKind, () => Built> = {
  // orchestration: a hub with three agents orbiting on spokes
  agentic: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    root.add(withEdges(new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 0), mat)));
    const orbit = new THREE.Group();
    orbit.rotation.x = 0.5;
    const pts: number[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const p = new THREE.Vector3(Math.cos(a) * 1.25, 0, Math.sin(a) * 1.25);
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), goldMat());
      node.position.copy(p);
      orbit.add(node);
      pts.push(0, 0, 0, p.x, p.y, p.z);
    }
    const spokes = new THREE.BufferGeometry();
    spokes.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    orbit.add(new THREE.LineSegments(spokes, new THREE.LineBasicMaterial({ color: "#cfe8fa", transparent: true, opacity: 0.45 })));
    root.add(orbit);
    return { root, glow: [mat], animate: (_t, dt, hk, k) => (orbit.rotation.y += dt * (0.8 + hk * 2.4) * k) };
  },

  // isolation: four tenants as separate cubes; hover pulls them further apart
  tenant: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    const cubes: THREE.Mesh[] = [];
    const geo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const c = withEdges(new THREE.Mesh(geo, mat));
      c.userData.dir = new THREE.Vector2(x, y);
      cubes.push(c);
      root.add(c);
    }
    return {
      root,
      glow: [mat],
      animate: (_t, _dt, hk) => {
        const gap = 0.4 + hk * 0.16;
        for (const c of cubes) c.position.set(c.userData.dir.x * gap, c.userData.dir.y * gap, 0);
      },
    };
  },

  // three models working together: interlocking rings
  llm: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    const tube = new THREE.TorusGeometry(0.95, 0.07, 12, 48);
    const a = new THREE.Mesh(tube, mat);
    const b = new THREE.Mesh(tube, mat);
    b.rotation.x = Math.PI / 2;
    const c = new THREE.Mesh(tube, goldMat());
    c.rotation.y = Math.PI / 2;
    root.add(a, b, c);
    return {
      root,
      glow: [mat],
      animate: (_t, dt, hk, k) => {
        a.rotation.z += dt * (0.6 + hk) * k;
        b.rotation.y += dt * (0.4 + hk) * k;
      },
    };
  },

  // modular pipeline: stacked chunks, the middle module slides
  rag: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    const geo = new THREE.BoxGeometry(1.5, 0.22, 1.05);
    const layers = [-0.48, 0, 0.48].map((y) => {
      const m = withEdges(new THREE.Mesh(geo, mat));
      m.position.y = y;
      root.add(m);
      return m;
    });
    return {
      root,
      glow: [mat],
      animate: (t, _dt, hk) => {
        layers[1].position.x = Math.sin(t * 1.4) * (0.18 + hk * 0.12);
        layers[0].position.y = -0.48 - hk * 0.08;
        layers[2].position.y = 0.48 + hk * 0.08;
      },
    };
  },

  // scoring: a measured core inside a gold ring, with a marker travelling the ring
  eval: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    root.add(withEdges(new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 0), mat)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.045, 10, 64), goldMat());
    ring.rotation.x = Math.PI / 2.6;
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), goldMat());
    ring.add(marker);
    root.add(ring);
    return {
      root,
      glow: [mat],
      animate: (t) => marker.position.set(Math.cos(t * 1.6) * 1.08, Math.sin(t * 1.6) * 1.08, 0),
    };
  },

  // protection: a gold core held inside a counter-rotating shell
  security: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), goldMat());
    const shellGeo = new THREE.IcosahedronGeometry(1.1, 0);
    const shell = new THREE.Group();
    shell.add(new THREE.Mesh(shellGeo, new THREE.MeshStandardMaterial({ color: "#3a424e", transparent: true, opacity: 0.18, roughness: 0.6 })));
    shell.add(new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo), new THREE.LineBasicMaterial({ color: "#cfe8fa", transparent: true, opacity: 0.55 })));
    root.add(core, shell);
    return {
      root,
      glow: [mat, core.material as THREE.MeshStandardMaterial],
      animate: (_t, dt, hk, k) => {
        shell.rotation.y -= dt * (0.9 + hk * 1.2) * k;
        core.scale.setScalar(1 + hk * 0.18);
      },
    };
  },

  // continuous delivery loop
  observability: () => {
    const root = new THREE.Group();
    const mat = purpleMat();
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.62, 0.15, 96, 12, 2, 3), mat);
    root.add(knot);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), goldMat());
    root.add(dot);
    // a gold signal riding the same (p=2, q=3) path TorusKnotGeometry is built on
    const R = 0.62;
    const onKnot = (frac: number, out: THREE.Vector3) => {
      const u = frac * 2 * Math.PI * 2; // p = 2
      const cs = Math.cos(1.5 * u); // q / p = 1.5
      return out.set(R * (2 + cs) * 0.5 * Math.cos(u), R * (2 + cs) * 0.5 * Math.sin(u), R * Math.sin(1.5 * u) * 0.5);
    };
    return {
      root,
      glow: [mat],
      animate: (t) => onKnot((t * 0.12) % 1, dot.position),
    };
  },
};

function buildScene(kind: IconKind) {
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight("#ffffff", 0.9));
  const key = new THREE.DirectionalLight("#ffffff", 1.6);
  key.position.set(2.5, 3, 4);
  const rim = new THREE.DirectionalLight("#F5BC27", 0.7);
  rim.position.set(-3, -1.5, -2);
  scene.add(key, rim);
  const built = BUILDERS[kind]();
  scene.add(built.root);
  return { scene, built };
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose?.();
  });
}

/** Attach an icon to a 2D canvas. Returns null if WebGL is unavailable. */
export function registerIcon(kind: IconKind, canvas: HTMLCanvasElement): IconHandle | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    getRenderer();
  } catch {
    return null; // no WebGL: the card simply shows its empty icon well
  }
  const { scene, built } = buildScene(kind);
  const entry: Entry = { canvas, ctx, scene, built, visible: false, hover: false, hk: 0, t: Math.random() * 10 };
  entries.add(entry);

  // first frame immediately, so there is never an empty well while waiting
  step(entry, 0, 1);
  draw(entry);

  return {
    setVisible(v) {
      entry.visible = v;
      if (v) schedule();
    },
    setHover(h) {
      entry.hover = h;
      if (reduced()) {
        // no motion: just show the hover glow as a single static frame
        entry.hk = h ? 1 : 0;
        for (const m of built.glow) m.emissive.copy(BASE_EMISSIVE).lerp(GOLD, 0.06 + entry.hk * 0.42);
        draw(entry);
      } else schedule();
    },
    dispose() {
      entries.delete(entry);
      disposeScene(scene);
    },
  };
}
