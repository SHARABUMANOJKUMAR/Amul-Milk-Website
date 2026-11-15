import { GEOMETRY, POUR, pickLayout, type LayoutPreset } from './sceneConfig';

export type Vec = { x: number; y: number };

export interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface CartonLayout {
  scale: number;
  width: number;
  height: number;
  tx: number;
  ty: number;
  pivot: Vec;
  angle: number;
}

export interface GlassLayout {
  scale: number;
  width: number;
  height: number;
  x: number;
  y: number;
  rimOuter: Ellipse;
  rimInner: Ellipse;
  innerBottom: Ellipse;
  wallLeft: (y: number) => number;
  wallRight: (y: number) => number;
  outerLeft: (y: number) => number;
  outerRight: (y: number) => number;
  baseBottom: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SceneLayout {
  w: number;
  h: number;
  preset: LayoutPreset;
  carton: CartonLayout;
  glass: GlassLayout;
  streamBox: Box;
  glassBox: Box;
  ribbonPath: string;
  ribbonWidth: number;
}

const rad = (d: number) => (d * Math.PI) / 180;
const rot = (v: Vec, deg: number): Vec => {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
};

export const cartonPoint = (c: CartonLayout, src: [number, number], angle: number): Vec => {
  const local = { x: src[0] * c.scale - c.pivot.x, y: src[1] * c.scale - c.pivot.y };
  const r = rot(local, angle);
  return { x: c.tx + c.pivot.x + r.x, y: c.ty + c.pivot.y + r.y };
};

export const cartonOpening = (c: CartonLayout, angle: number) =>
  cartonPoint(c, GEOMETRY.carton.opening as [number, number], angle);

export const cartonLipNormal = (angle: number): Vec => {
  const [nx, ny] = GEOMETRY.carton.lipNormal;
  return rot({ x: nx, y: ny }, angle);
};

export const catmullRomPath = (pts: Vec[]): string => {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(2)},${c1.y.toFixed(2)} ${c2.x.toFixed(2)},${c2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
};

export function computeSceneLayout(w: number, h: number): SceneLayout {
  const preset = pickLayout(w, h);
  const k = Math.min(w / preset.ref[0], h / preset.ref[1]);
  const gc = GEOMETRY.carton;
  const gg = GEOMETRY.glass;

  const s6 = preset.carton.scale * k;
  const pivot = { x: gc.pivot[0] * s6, y: gc.pivot[1] * s6 };
  const openTarget = { x: preset.carton.open[0] * w, y: preset.carton.open[1] * h };
  const angle = preset.carton.rot;
  const oLocal = { x: gc.opening[0] * s6 - pivot.x, y: gc.opening[1] * s6 - pivot.y };
  const oRot = rot(oLocal, angle);
  const carton: CartonLayout = {
    scale: s6,
    width: gc.src[0] * s6,
    height: gc.src[1] * s6,
    tx: openTarget.x - pivot.x - oRot.x,
    ty: openTarget.y - pivot.y - oRot.y,
    pivot,
    angle,
  };
  const cutSamples: [number, number][] = [];
  for (let y = 0; y <= 470; y += 20) cutSamples.push([0, y]);
  for (let x = 0; x <= 420; x += 20) cutSamples.push([x, 0]);
  let lift = 0;
  for (const a of [angle, angle + POUR.restAngle, angle + POUR.returnAngle]) {
    for (const p of cutSamples) {
      const sp = cartonPoint(carton, p, a);
      if (sp.x > -2 && sp.y > -2) lift = Math.max(lift, sp.y + 3);
    }
  }
  carton.ty -= lift;

  let s7 = preset.glass.scale * k;
  const rim = { x: preset.glass.rim[0] * w, y: preset.glass.rim[1] * h };
  s7 = Math.max(s7, (w + 3 - rim.x) / (gg.src[0] - gg.rimOuter.cx));
  const bottomLimit = h - Math.max(10, h * 0.03);
  const overshoot = rim.y + (gg.baseBottomY - gg.rimOuter.cy) * s7 - bottomLimit;
  if (overshoot > 0) rim.y -= overshoot;
  const gx = rim.x - gg.rimOuter.cx * s7;
  const gy = rim.y - gg.rimOuter.cy * s7;
  const toHero = (e: { cx: number; cy: number; rx: number; ry: number }): Ellipse => ({
    cx: gx + e.cx * s7,
    cy: gy + e.cy * s7,
    rx: e.rx * s7,
    ry: e.ry * s7,
  });
  const wallFn = (spec: number[]) => (y: number) => {
    const ySrc = (y - gy) / s7;
    return gx + (spec[0] + (ySrc - gg.rimOuter.cy) * spec[1]) * s7;
  };
  const glass: GlassLayout = {
    scale: s7,
    width: gg.src[0] * s7,
    height: gg.src[1] * s7,
    x: gx,
    y: gy,
    rimOuter: toHero(gg.rimOuter),
    rimInner: toHero(gg.rimInner),
    innerBottom: toHero(gg.innerBottom),
    wallLeft: wallFn(gg.wallInner.left),
    wallRight: wallFn(gg.wallInner.right),
    outerLeft: wallFn(gg.wallOuter.left),
    outerRight: wallFn(gg.wallOuter.right),
    baseBottom: gy + gg.baseBottomY * s7,
  };

  const opens = [angle, angle + POUR.restAngle, angle + POUR.returnAngle].map((a) => cartonOpening(carton, a));
  const pad = 48 * Math.max(k, 0.5);
  const sx0 = Math.min(...opens.map((o) => o.x), glass.rimOuter.cx - glass.rimOuter.rx) - pad;
  const sx1 = Math.max(...opens.map((o) => o.x), glass.rimOuter.cx + glass.rimOuter.rx) + pad;
  const sy0 = Math.min(...opens.map((o) => o.y)) - pad;
  const sy1 = glass.baseBottom + 4;
  const streamBox = { x: Math.floor(sx0), y: Math.floor(sy0), w: Math.ceil(sx1 - sx0), h: Math.ceil(sy1 - sy0) };
  const gb0 = glass.rimOuter.cy - glass.rimOuter.ry - pad;
  const glassBox = {
    x: Math.floor(glass.outerLeft(glass.rimOuter.cy) - 6),
    y: Math.floor(gb0),
    w: Math.ceil(glass.outerRight(glass.rimOuter.cy) - glass.outerLeft(glass.rimOuter.cy) + 12),
    h: Math.ceil(glass.baseBottom - gb0 + 6),
  };

  const pts = preset.ribbon.map(([fx, fy]) => ({ x: fx * w, y: fy * h }));
  const ribbonWidth = Math.round(
    Math.min(86, Math.max(36, preset.ribbonWidth * (preset.name === 'portrait' ? w * 1.9 : h))),
  );

  return { w, h, preset, carton, glass, streamBox, glassBox, ribbonPath: catmullRomPath(pts), ribbonWidth };
}
