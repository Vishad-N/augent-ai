/**
 * X-Ray / wireframe reveal for the Architecture section.
 *
 * A frosted outer shell dissolves into a thin gold wire cage, then the
 * architecture layers fade in as translucent stacked panels. Focusing a layer
 * lifts it toward the viewer, brightens it, dims the rest and runs a gold scan
 * line across it.
 *
 * Plain three.js, low-poly, three lights, no textures or loaded assets.
 * Everything animates by material opacity / position, eased per frame.
 * Loaded with dynamic import() only when the section approaches the viewport.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type XRayHandle = {
  /** Layer to focus (index) or null for the overview. */
  setFocus: (index: number | null) => void;
  /** Play the shell-to-wireframe reveal (no-op once revealed). */
  reveal: () => void;
  dispose: () => void;
};

type Options = {
  count: number;
  reduced: boolean;
  /** HTML callout positioned under the focused layer each frame. */
  label: HTMLElement;
  onHover: (index: number | null) => void;
  onPick: (index: number) => void;
};

const GOLD = new THREE.Color("#00c2ff"); // wireframe + focus edges: Electric Blue
const CHARTREUSE = new THREE.Color("#d6ff4a"); // scan line: the one high-energy highlight
const LAYER = new THREE.Color("#3a424e");
const REVEAL_MS = 800;

export function createXRay(host: HTMLElement, canvas: HTMLCanvasElement, opts: Options): XRayHandle {
  const { count, reduced, label } = opts;
  const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const CAM = new THREE.Vector3(7.4, 5.0, 9.8).multiplyScalar(1.1);

  scene.add(new THREE.AmbientLight("#ffffff", 0.85));
  const key = new THREE.DirectionalLight("#ffffff", 1.25);
  key.position.set(4, 8, 6);
  const warm = new THREE.PointLight("#00c2ff", 1.2, 20);
  warm.position.set(-3, 2, 4);
  scene.add(key, warm);

  /* ---------- geometry ---------- */
  const W = 4.2; // layer width
  const D = 2.7; // layer depth
  const T = 0.1; // layer thickness
  const GAP = 0.62;
  const H = (count - 1) * GAP;
  const SW = W + 0.9;
  const SH = H + 1.25;
  const SD = D + 0.9;

  const stack = new THREE.Group();
  scene.add(stack);

  // outer shell: frosted, low-opacity volume
  const shellMat = new THREE.MeshStandardMaterial({
    color: "#1f2328",
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const shell = new THREE.Mesh(new RoundedBoxGeometry(SW, SH, SD, 3, 0.26), shellMat);
  stack.add(shell);

  // wire cage: 12 box edges + horizontal rings at each layer height
  const cagePts: number[] = [];
  const box = new THREE.EdgesGeometry(new THREE.BoxGeometry(SW, SH, SD));
  cagePts.push(...(box.attributes.position.array as Float32Array));
  const ring = (y: number, inset: number) => {
    const x = SW / 2 - inset;
    const z = SD / 2 - inset;
    const c = [
      [-x, y, -z], [x, y, -z], [x, y, -z], [x, y, z],
      [x, y, z], [-x, y, z], [-x, y, z], [-x, y, -z],
    ];
    c.forEach((p) => cagePts.push(...p));
  };
  // two inner rings only: enough to read as a scanned volume, not a cage of bars
  ring(SH / 6, 0);
  ring(-SH / 6, 0);
  // a few vertical mid lines on the front and side faces for a scanned feel
  for (const fx of [-SW / 6, SW / 6]) cagePts.push(fx, -SH / 2, SD / 2, fx, SH / 2, SD / 2);
  cagePts.push(SW / 2, -SH / 2, 0, SW / 2, SH / 2, 0);
  const cageGeo = new THREE.BufferGeometry();
  cageGeo.setAttribute("position", new THREE.Float32BufferAttribute(cagePts, 3));
  const cageMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0 });
  const cage = new THREE.LineSegments(cageGeo, cageMat);
  stack.add(cage);

  // layers
  const layerGeo = new RoundedBoxGeometry(W, T, D, 2, 0.05);
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, T, D));
  type Layer = { group: THREE.Group; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; edge: THREE.LineBasicMaterial; op: number; lift: number; glow: number };
  const layers: Layer[] = [];
  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    group.position.y = H / 2 - i * GAP;
    const mat = new THREE.MeshStandardMaterial({
      color: LAYER,
      roughness: 0.5,
      metalness: 0.1,
      emissive: new THREE.Color("#0d0f12"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(layerGeo, mat);
    mesh.userData.index = i;
    mesh.renderOrder = 2;
    const edge = new THREE.LineBasicMaterial({ color: "#cfe8fa", transparent: true, opacity: 0 });
    group.add(mesh, new THREE.LineSegments(edgeGeo, edge));
    stack.add(group);
    layers.push({ group, mesh, mat, edge, op: 0, lift: 0, glow: 0 });
  }

  // gold scan line that sweeps the focused layer
  const scanMat = new THREE.MeshBasicMaterial({ color: CHARTREUSE, transparent: true, opacity: 0, depthWrite: false });
  const scan = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.02, D * 0.96), scanMat);
  scan.renderOrder = 3;

  /* ---------- state ---------- */
  let revealStart = reduced ? -Infinity : 0; // 0 = not started
  let revealed = reduced;
  let focus: number | null = null;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  // "toward the camera" in the stack's horizontal plane
  const liftDir = new THREE.Vector3(CAM.x, 0, CAM.z).normalize();
  const localLift = new THREE.Vector3();
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  const SPIN_RAD_PER_S = (Math.PI * 2) / 26; // one full revolution every ~26s
  let spin = -0.12;

  const revealAmount = (now: number) => {
    if (revealed && revealStart === -Infinity) return 1;
    if (!revealStart) return 0;
    const t = Math.min(1, (now - revealStart) / REVEAL_MS);
    return 1 - Math.pow(1 - t, 3); // ease-out
  };

  /* ---------- sizing ---------- */
  const fit = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // The stack spins a full 360deg, so frame its footprint circle (half-diagonal
    // of the shell + the focused layer's lift) against the horizontal FOV, and
    // never come closer than the base framing.
    const footprint = Math.hypot(SW / 2, SD / 2) + 0.6;
    const halfH = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const needed = (footprint / Math.sin(halfH)) * 1.04;
    camera.position.copy(CAM).setLength(Math.max(CAM.length(), needed));
    camera.lookAt(0, -0.15, 0);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  fit();

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const meshes = layers.map((l) => l.mesh);
  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    return hit ? (hit.object.userData.index as number) : null;
  };
  let hovered: number | null = null;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (e.pointerType !== "mouse") return;
    handle.reveal(); // first hover also triggers the reveal
    const i = revealed || revealStart ? pick(e) : null;
    if (i !== hovered) {
      hovered = i;
      canvas.style.cursor = i === null ? "" : "pointer";
      opts.onHover(i);
    }
  };
  const onLeave = () => {
    pointer.tx = pointer.ty = 0;
    if (hovered !== null) {
      hovered = null;
      canvas.style.cursor = "";
      opts.onHover(null);
    }
  };
  const onClick = (e: MouseEvent) => {
    handle.reveal();
    const i = pick(e as PointerEvent);
    if (i !== null) opts.onPick(i);
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("click", onClick);

  /* ---------- frame ---------- */
  const anchor = new THREE.Vector3();
  let raf = 0;
  let last = performance.now();
  let lastDraw = 0;
  let t = 0;
  let inView = false;

  const frame = (now: number) => {
    raf = 0;
    if (!inView || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (small && now - lastDraw < 1000 / 30) return; // ~30fps on phones
    lastDraw = now;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    t += dt;

    const r = revealAmount(now);
    if (r >= 1) revealed = true;
    const ease = reduced ? 1 : Math.min(1, dt * 8);

    // shell: frosted -> nearly invisible; cage: 0 -> fine gold wire
    shellMat.opacity = 0.55 + (0.05 - 0.55) * r;
    cageMat.opacity = 0.5 * r;

    // continuous full revolution, front face travelling left -> right
    // (+rotation.y moves the camera-facing side toward screen right), plus a
    // little pointer parallax. Reduced motion: still, at the default angle.
    if (!reduced) {
      spin += dt * SPIN_RAD_PER_S;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
      stack.rotation.y = spin + pointer.x * 0.14;
      stack.rotation.x = pointer.y * 0.05;
    } else {
      stack.rotation.set(0, -0.12, 0);
    }
    // the focused layer always lifts toward the camera, whatever the spin angle
    localLift.copy(liftDir).applyAxisAngle(Y_AXIS, -stack.rotation.y);

    layers.forEach((l, i) => {
      // staggered fade-in, top to bottom
      const appear = Math.max(0, Math.min(1, (r - i * 0.05) / 0.65));
      const isFocus = focus === i;
      const targetOp = (focus === null ? 0.34 : isFocus ? 0.82 : 0.1) * appear;
      const targetLift = isFocus ? 0.6 : 0;
      const targetGlow = isFocus ? 1 : 0;
      l.op += (targetOp - l.op) * ease;
      l.lift += (targetLift - l.lift) * ease;
      l.glow += (targetGlow - l.glow) * ease;
      l.mat.opacity = l.op;
      l.edge.opacity = Math.min(1, l.op * 1.4 + 0.08 * appear);
      l.edge.color.set(l.glow > 0.5 ? GOLD : "#cfe8fa");
      // focused: a brighter blue (accent lives on its edges + scan line, not the fill)
      l.mat.emissive.setRGB(0.04, 0.045 + 0.2 * l.glow, 0.05 + 0.3 * l.glow);
      l.group.position.x = localLift.x * l.lift;
      l.group.position.z = localLift.z * l.lift;
    });

    // scan line across the focused layer
    if (focus !== null && !reduced) {
      const g = layers[focus].group;
      if (scan.parent !== g) g.add(scan);
      scan.position.set(-W / 2 + ((t * 0.55) % 1) * W, T / 2 + 0.015, 0);
      scanMat.opacity = 0.95 * Math.min(1, layers[focus].glow * 1.2);
    } else {
      scanMat.opacity += (0 - scanMat.opacity) * ease;
    }

    renderer.render(scene, camera);

    // keep the HTML callout under the focused layer's camera-facing edge
    // (world space, so it stays in front while the stack revolves)
    if (focus !== null) {
      layers[focus].group.updateMatrixWorld();
      anchor
        .set(0, -T / 2, 0)
        .applyMatrix4(layers[focus].group.matrixWorld)
        .addScaledVector(liftDir, D / 2)
        .project(camera);
      const x = (anchor.x * 0.5 + 0.5) * host.clientWidth;
      const y = (-anchor.y * 0.5 + 0.5) * host.clientHeight;
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 14px)`;
    }
  };

  const start = () => {
    if (!raf && inView && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    start();
  });
  io.observe(host);
  const onVis = () => start();
  document.addEventListener("visibilitychange", onVis);

  const handle: XRayHandle = {
    setFocus(i) {
      focus = i;
      if (i !== null) handle.reveal();
      start();
    },
    reveal() {
      if (revealed || revealStart) return;
      revealStart = performance.now();
      start();
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose?.();
      });
      renderer.dispose();
    },
  };
  return handle;
}
