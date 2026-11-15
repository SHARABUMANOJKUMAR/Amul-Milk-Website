import { POUR } from './sceneConfig';

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function cartonAngleOffset(t: number): number {
  if (t < POUR.settleEnd) return lerp(POUR.restAngle, 0, easeOutBack(seg(t, 0, POUR.settleEnd)));
  if (t < POUR.sustainEnd) return 0.35 * Math.sin((t - POUR.settleEnd) * 2.1) * seg(t, 0.6, 1.4);
  if (t < POUR.narrowEnd) {
    const base = 0.35 * Math.sin((POUR.sustainEnd - POUR.settleEnd) * 2.1);
    return lerp(base, POUR.returnAngle, easeInOut(seg(t, POUR.sustainEnd, POUR.narrowEnd)));
  }
  return POUR.returnAngle;
}

export function flowAt(t: number): number {
  if (t < POUR.threadStart) return 0;
  if (t < POUR.threadEnd) return lerp(0.2, 0.6, easeOutCubic(seg(t, POUR.threadStart, POUR.threadEnd)));
  if (t < 1.8) return lerp(0.6, 1, easeOutCubic(seg(t, POUR.threadEnd, 1.8)));
  if (t < POUR.sustainEnd) return 1 + 0.055 * Math.sin(t * 8.2) + 0.035 * Math.sin(t * 18.3 + 1.1);
  if (t < POUR.breakAt) return lerp(1, 0.3, easeInOut(seg(t, POUR.sustainEnd, POUR.breakAt)));
  if (t < POUR.narrowEnd) return lerp(0.3, 0.14, seg(t, POUR.breakAt, POUR.narrowEnd));
  return 0;
}

export interface StreamState {
  head: number;
  tail: number;
  flow: number;
  visible: boolean;
}

export function streamAt(t: number): StreamState {
  const head = t < POUR.threadStart ? 0 : Math.pow(seg(t, POUR.threadStart, POUR.threadEnd), 1.45);
  const tail = t < POUR.breakAt ? 0 : Math.pow(seg(t, POUR.breakAt, 4.9), 1.7);
  const flow = flowAt(t);
  return { head, tail, flow, visible: head > 0.001 && tail < 0.999 };
}

export interface Drop {
  u: number;
  size: number;
  forming: number;
}

const DROPS = [
  { form: 4.86, detach: 5.0, land: 5.27, size: 0.42 },
  { form: 5.1, detach: 5.2, land: 5.46, size: 0.3 },
];

export function dropsAt(t: number): Drop[] {
  const out: Drop[] = [];
  for (const d of DROPS) {
    if (t < d.form || t > d.land) continue;
    if (t < d.detach) out.push({ u: -1, size: d.size, forming: seg(t, d.form, d.detach) });
    else out.push({ u: Math.pow(seg(t, d.detach, d.land), 1.8), size: d.size, forming: 1 });
  }
  return out;
}

export interface Ripple {
  age: number;
  strength: number;
}

const RIPPLE_LIFE = 0.95;
const rippleBirths: { t: number; s: number }[] = (() => {
  const births: { t: number; s: number }[] = [];
  for (let t = POUR.threadEnd; t < 4.86; t += 0.17) births.push({ t, s: 0.55 + 0.45 * flowAt(t) });
  for (const d of DROPS) births.push({ t: d.land, s: 0.55 + d.size });
  return births;
})();

export function ripplesAt(t: number): Ripple[] {
  const out: Ripple[] = [];
  for (const b of rippleBirths) {
    const age = (t - b.t) / RIPPLE_LIFE;
    if (age >= 0 && age < 1) out.push({ age, strength: b.s });
  }
  return out;
}

export function sloshAt(t: number): number {
  if (t < POUR.threadEnd) return 0;
  const on = seg(t, POUR.threadEnd, 1.6);
  const off = 1 - seg(t, 4.85, 6.0);
  return 0.18 * on * Math.max(off, 0) + 0.05 * on * Math.exp(-Math.max(0, t - 4.85) * 1.8);
}

const FILL_TABLE: Float32Array = (() => {
  const dt = 1 / 240;
  const n = Math.ceil(POUR.duration / dt) + 1;
  const table = new Float32Array(n);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const t = i * dt;
    const s = streamAt(t);
    const arriving = s.head >= 0.999 && s.tail < 0.999 ? s.flow : 0;
    let dropMass = 0;
    for (const d of DROPS) if (Math.abs(t - d.land) < dt / 2) dropMass += d.size * 0.02;
    acc += arriving * dt + dropMass;
    table[i] = acc;
  }
  const total = table[n - 1] || 1;
  for (let i = 0; i < n; i++) table[i] = (table[i] / total) * POUR.maxFill;
  return table;
})();

export function fillAt(t: number): number {
  const i = Math.max(0, Math.min(FILL_TABLE.length - 1, Math.round(t * 240)));
  return FILL_TABLE[i];
}
