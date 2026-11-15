import { POUR } from './sceneConfig';
import {
  cartonAngleOffset,
  clamp01,
  dropsAt,
  easeInOut,
  easeOutCubic,
  fillAt,
  lerp,
  ripplesAt,
  sloshAt,
  streamAt,
} from './pourTimeline';
import { cartonLipNormal, cartonOpening, type Box, type SceneLayout, type Vec } from './sceneLayout';

export interface PourAssets {
  sheen: HTMLImageElement;
  front: HTMLImageElement;
}

const MILK = '#F4F1E8';
const MILK_HI = '#FFFFFF';

interface Curve {
  p0: Vec;
  p1: Vec;
  p2: Vec;
  p3: Vec;
}

const bez = (c: Curve, u: number): Vec => {
  const v = 1 - u;
  const a = v * v * v;
  const b = 3 * v * v * u;
  const cc = 3 * v * u * u;
  const d = u * u * u;
  return {
    x: a * c.p0.x + b * c.p1.x + cc * c.p2.x + d * c.p3.x,
    y: a * c.p0.y + b * c.p1.y + cc * c.p2.y + d * c.p3.y,
  };
};
const bezT = (c: Curve, u: number): Vec => {
  const v = 1 - u;
  const x = 3 * v * v * (c.p1.x - c.p0.x) + 6 * v * u * (c.p2.x - c.p1.x) + 3 * u * u * (c.p3.x - c.p2.x);
  const y = 3 * v * v * (c.p1.y - c.p0.y) + 6 * v * u * (c.p2.y - c.p1.y) + 3 * u * u * (c.p3.y - c.p2.y);
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
};

export interface FrameGeometry {
  angle: number;
  opening: Vec;
  normal: Vec;
  curve: Curve;
  landing: Vec;
  baseWidth: number;
  surface: { cx: number; cy: number; rx: number; ry: number; tilt: number } | null;
  fill: number;
}

export function frameGeometry(layout: SceneLayout, t: number): FrameGeometry {
  const { carton, glass } = layout;
  const angle = carton.angle + cartonAngleOffset(t);
  const opening = cartonOpening(carton, angle);
  const normal = cartonLipNormal(angle);
  const fill = fillAt(t);
  const top = glass.rimInner.cy;
  const bottom = glass.innerBottom.cy;
  const sy = bottom - fill * (bottom - top);
  const frac = (bottom - sy) / (bottom - top);
  const lw = glass.wallLeft(sy);
  const rw = glass.wallRight(sy);
  const slosh = sloshAt(t);
  const surface =
    fill > 0.002
      ? {
          cx: (lw + rw) / 2,
          cy: sy + Math.sin(t * 9.5) * slosh * 1.2,
          rx: (rw - lw) / 2,
          ry: lerp(glass.innerBottom.ry, glass.rimInner.ry, frac),
          tilt: Math.sin(t * 6.3 + 0.7) * slosh * 0.035,
        }
      : null;
  const s = streamAt(t);
  const inner = glass.rimInner;
  const landX = inner.cx + inner.rx * (-0.2 + 0.16 * Math.min(1, s.flow));
  const landY = surface ? surface.cy : bottom;
  const landing = { x: landX, y: landY };
  const dx = landing.x - opening.x;
  const dy = landing.y - opening.y;
  const len = Math.hypot(dx, dy);
  const dir = { x: normal.x * 0.85, y: normal.y * 0.85 + 0.25 };
  const dl = Math.hypot(dir.x, dir.y);
  const curve: Curve = {
    p0: opening,
    p1: { x: opening.x + (dir.x / dl) * len * 0.3, y: opening.y + (dir.y / dl) * len * 0.3 },
    p2: { x: landing.x - len * 0.03, y: landing.y - len * 0.45 },
    p3: landing,
  };
  const baseWidth = Math.max(6, inner.rx * 2 * 0.096);
  return { angle, opening, normal, curve, landing, baseWidth, surface, fill };
}

function prepCanvas(canvas: HTMLCanvasElement, box: Box, dpr: number) {
  const w = Math.max(1, Math.round(box.w * dpr));
  const h = Math.max(1, Math.round(box.h * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, -box.x * dpr, -box.y * dpr);
  ctx.clearRect(box.x, box.y, box.w, box.h);
  return ctx;
}

function streamOutline(g: FrameGeometry, t: number, u0: number, u1: number, flow: number) {
  const n = 40;
  const left: Vec[] = [];
  const right: Vec[] = [];
  const centre: Vec[] = [];
  const widths: number[] = [];
  const normals: Vec[] = [];
  const span = u1 - u0;
  for (let i = 0; i <= n; i++) {
    const u = u0 + (span * i) / n;
    const p = bez(g.curve, u);
    const tg = bezT(g.curve, u);
    const nm = { x: -tg.y, y: tg.x };
    let w = g.baseWidth * Math.max(0.12, flow) * lerp(1.22, 0.7, Math.sqrt(u));
    if (u < 0.06) w *= 1 + 0.55 * Math.pow(1 - u / 0.06, 2);
    const headDist = (u1 - u) / Math.max(span, 1e-3);
    if (u1 < 0.999) w *= Math.min(1, 0.55 + headDist * 9);
    const tailDist = (u - u0) / Math.max(span, 1e-3);
    if (u0 > 0.001) w *= Math.min(1, 0.35 + tailDist * 5);
    const lateral = g.baseWidth * 0.16 * u * Math.sin(Math.PI * 2 * (1.35 * u - 1.7 * t));
    const eL = g.baseWidth * 0.055 * Math.sin(Math.PI * 2 * (5.1 * u - 3.2 * t));
    const eR = g.baseWidth * 0.055 * Math.sin(Math.PI * 2 * (4.2 * u - 2.6 * t + 0.6));
    const c = { x: p.x + nm.x * lateral, y: p.y + nm.y * lateral };
    centre.push(c);
    widths.push(w);
    normals.push(nm);
    left.push({ x: c.x - nm.x * (w / 2 + eL), y: c.y - nm.y * (w / 2 + eL) });
    right.push({ x: c.x + nm.x * (w / 2 + eR), y: c.y + nm.y * (w / 2 + eR) });
  }
  return { left, right, centre, widths, normals };
}

function drawStream(ctx: CanvasRenderingContext2D, g: FrameGeometry, t: number) {
  const s = streamAt(t);
  if (!s.visible) return;
  const u0 = s.tail;
  const u1 = s.head;
  if (u1 - u0 < 0.004) return;
  const o = streamOutline(g, t, u0, u1, s.flow);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(o.left[0].x, o.left[0].y);
  for (const p of o.left) ctx.lineTo(p.x, p.y);
  const last = o.centre[o.centre.length - 1];
  const lw = o.widths[o.widths.length - 1];
  const lastR = o.right[o.right.length - 1];
  ctx.quadraticCurveTo(last.x + bezT(g.curve, u1).x * lw * 0.6, last.y + bezT(g.curve, u1).y * lw * 0.6, lastR.x, lastR.y);
  for (let i = o.right.length - 1; i >= 0; i--) ctx.lineTo(o.right[i].x, o.right[i].y);
  ctx.closePath();
  ctx.fillStyle = MILK;
  ctx.fill();
  ctx.clip();
  const strokeOffset = (k: number, width: number, style: string) => {
    ctx.beginPath();
    o.centre.forEach((c, i) => {
      const x = c.x + o.normals[i].x * o.widths[i] * k;
      const y = c.y + o.normals[i].y * o.widths[i] * k;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.stroke();
  };
  const w0 = g.baseWidth * Math.max(0.3, s.flow);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  strokeOffset(0.42, w0 * 0.42, 'rgba(176,163,146,0.30)');
  strokeOffset(0.5, w0 * 0.18, 'rgba(150,136,120,0.28)');
  strokeOffset(-0.42, w0 * 0.2, 'rgba(206,196,183,0.28)');
  strokeOffset(-0.16, w0 * 0.16, 'rgba(255,255,255,0.95)');
  ctx.setLineDash([w0 * 1.6, w0 * 3.4]);
  ctx.lineDashOffset = -t * g.baseWidth * 22;
  strokeOffset(-0.2, w0 * 0.1, 'rgba(255,255,255,1)');
  ctx.setLineDash([]);
  ctx.restore();

  if (u0 < 0.001) {
    const lip = { x: -g.normal.y, y: g.normal.x };
    ctx.save();
    ctx.translate(g.opening.x + g.normal.x * w0 * 0.15, g.opening.y + g.normal.y * w0 * 0.15);
    ctx.rotate(Math.atan2(lip.y, lip.x));
    ctx.beginPath();
    ctx.ellipse(0, 0, w0 * 0.85, w0 * 0.34, 0, 0, Math.PI * 2);
    ctx.fillStyle = MILK;
    ctx.fill();
    ctx.restore();
  }
}

function drawDrops(ctx: CanvasRenderingContext2D, g: FrameGeometry, t: number) {
  for (const d of dropsAt(t)) {
    const r = g.baseWidth * d.size * 0.95;
    if (d.u < 0) {
      const rr = r * (0.35 + 0.65 * d.forming);
      const cx = g.opening.x + g.normal.x * rr * 0.6;
      const cy = g.opening.y + g.normal.y * rr * 0.4 + rr * 0.9 * d.forming;
      ctx.beginPath();
      ctx.moveTo(g.opening.x, g.opening.y);
      ctx.quadraticCurveTo(cx - rr * 0.4, cy - rr * 0.6, cx - rr, cy);
      ctx.arc(cx, cy, rr, Math.PI, 0, true);
      ctx.quadraticCurveTo(cx + rr * 0.4, cy - rr * 0.6, g.opening.x + 1, g.opening.y);
      ctx.fillStyle = MILK;
      ctx.fill();
      continue;
    }
    const p = bez(g.curve, d.u);
    const tg = bezT(g.curve, d.u);
    const stretch = 1 + 0.9 * d.u;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(tg.y, tg.x) - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.6 * stretch);
    ctx.bezierCurveTo(r * 0.55, -r * 0.6, r, -r * 0.1, r, r * 0.25);
    ctx.arc(0, r * 0.25, r, 0, Math.PI, false);
    ctx.bezierCurveTo(-r, -r * 0.1, -r * 0.55, -r * 0.6, 0, -r * 1.6 * stretch);
    ctx.fillStyle = MILK;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-r * 0.32, r * 0.05, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.restore();
  }
}

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function interiorPath(ctx: CanvasRenderingContext2D, layout: SceneLayout) {
  const g = layout.glass;
  const ri = g.rimInner;
  const ib = g.innerBottom;
  ctx.beginPath();
  ctx.ellipse(ri.cx, ri.cy, ri.rx, ri.ry, 0, Math.PI, Math.PI * 2, false);
  ctx.lineTo(g.wallRight(ib.cy), ib.cy);
  ctx.ellipse(ib.cx, ib.cy, ib.rx, ib.ry, 0, 0, Math.PI, false);
  ctx.lineTo(g.wallLeft(ri.cy), ri.cy);
  ctx.closePath();
}

function drawMilkVolume(ctx: CanvasRenderingContext2D, layout: SceneLayout, g: FrameGeometry, t: number) {
  const gl = layout.glass;
  const ib = gl.innerBottom;
  const s = g.surface;
  if (!s) return;
  const lw = gl.wallLeft(s.cy);
  const rw = gl.wallRight(s.cy);

  const baseAlpha = 0.72 * clamp01(g.fill / 0.06);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(ib.cx, ib.cy, ib.rx, ib.ry, 0, 0, Math.PI, false);
  ctx.lineTo(gl.outerLeft(gl.baseBottom - ib.ry) + 3, gl.baseBottom - ib.ry);
  ctx.ellipse(ib.cx, gl.baseBottom - ib.ry * 1.05, ib.rx * 0.98, ib.ry * 0.95, 0, Math.PI, 0, true);
  ctx.closePath();
  const bg = ctx.createLinearGradient(0, ib.cy, 0, gl.baseBottom);
  bg.addColorStop(0, `rgba(246,243,235,${baseAlpha})`);
  bg.addColorStop(1, `rgba(236,232,222,${baseAlpha * 0.75})`);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(lw, s.cy);
  ctx.ellipse(s.cx, s.cy, s.rx, s.ry, s.tilt, Math.PI, Math.PI * 2, false);
  ctx.lineTo(gl.wallRight(ib.cy), ib.cy);
  ctx.ellipse(ib.cx, ib.cy, ib.rx, ib.ry, 0, 0, Math.PI, false);
  ctx.closePath();
  const body = ctx.createLinearGradient(lw, 0, rw, 0);
  body.addColorStop(0, '#D9D2C5');
  body.addColorStop(0.1, '#EEEAE1');
  body.addColorStop(0.32, '#FAF8F2');
  body.addColorStop(0.62, '#F3F0E8');
  body.addColorStop(0.9, '#E2DCD0');
  body.addColorStop(1, '#CFC7B9');
  ctx.fillStyle = body;
  ctx.fill();
  const shade = ctx.createLinearGradient(0, s.cy, 0, ib.cy + ib.ry);
  shade.addColorStop(0, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(120,108,96,0.10)');
  ctx.fillStyle = shade;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(s.cx, s.cy, s.rx, s.ry, s.tilt, 0, Math.PI * 2);
  const sg = ctx.createRadialGradient(s.cx - s.rx * 0.25, s.cy - s.ry * 0.2, s.rx * 0.05, s.cx, s.cy, s.rx);
  sg.addColorStop(0, '#FFFFFF');
  sg.addColorStop(0.7, '#F8F6F0');
  sg.addColorStop(1, '#E8E3D8');
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.clip();
  ctx.beginPath();
  ctx.ellipse(s.cx, s.cy + s.ry * 0.12, s.rx * 1.0, s.ry * 1.0, s.tilt, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineWidth = Math.max(1.5, s.ry * 0.16);
  ctx.strokeStyle = 'rgba(160,148,134,0.28)';
  ctx.stroke();
  const lx = g.landing.x;
  const ratio = s.ry / s.rx;
  for (const r of ripplesAt(t)) {
    const e = easeOutCubic(r.age);
    const rx = lerp(g.baseWidth * 0.5, s.rx * 1.1, e);
    const a = (1 - r.age) * 0.5 * r.strength;
    ctx.beginPath();
    ctx.ellipse(lx, s.cy, rx, rx * ratio, s.tilt, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(1, g.baseWidth * 0.12);
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(lx, s.cy + 1, rx * 1.06, rx * ratio * 1.06, s.tilt, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(1, g.baseWidth * 0.08);
    ctx.strokeStyle = `rgba(150,136,120,${a * 0.45})`;
    ctx.stroke();
  }
  const pouring = streamAt(t);
  const bubbleLife = 1.6;
  for (let i = 0; i < 14; i++) {
    const birth = POUR.threadEnd + i * 0.27;
    const age = (t - birth) / bubbleLife;
    if (age < 0 || age > 1) continue;
    const ang = rnd(i) * Math.PI * 2;
    const dist = (0.15 + 0.6 * rnd(i + 40)) * s.rx * easeOutCubic(age);
    const bx = lx + Math.cos(ang) * dist;
    const by = s.cy + Math.sin(ang) * dist * ratio;
    const br = g.baseWidth * (0.08 + 0.1 * rnd(i + 90)) * (1 - age * 0.4);
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = `rgba(170,158,142,${0.45 * (1 - age)})`;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - age)})`;
    ctx.fill();
  }
  ctx.restore();

  if (pouring.visible && pouring.head > 0.98) {
    const w = g.baseWidth * Math.max(0.3, pouring.flow) * 0.7;
    ctx.beginPath();
    ctx.ellipse(lx, s.cy, w * 1.25 + Math.sin(t * 23) * w * 0.08, w * 0.42, s.tilt, 0, Math.PI * 2);
    ctx.fillStyle = MILK_HI;
    ctx.fill();
  }
}

export class PourRenderer {
  private dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  constructor(
    private streamCanvas: HTMLCanvasElement,
    private interiorCanvas: HTMLCanvasElement,
    private assets: PourAssets,
  ) {}

  draw(layout: SceneLayout, t: number): FrameGeometry {
    const g = frameGeometry(layout, t);
    const sc = prepCanvas(this.streamCanvas, layout.streamBox, this.dpr);
    drawStream(sc, g, t);
    drawDrops(sc, g, t);

    const ic = prepCanvas(this.interiorCanvas, layout.glassBox, this.dpr);
    ic.save();
    interiorPath(ic, layout);
    ic.clip();
    drawMilkVolume(ic, layout, g, t);
    drawStream(ic, g, t);
    drawDrops(ic, g, t);
    ic.restore();
    const gl = layout.glass;
    ic.globalCompositeOperation = 'source-atop';
    ic.globalAlpha = 0.9;
    ic.drawImage(this.assets.sheen, gl.x, gl.y, gl.width, gl.height);
    ic.globalAlpha = 1;
    ic.drawImage(this.assets.front, gl.x, gl.y, gl.width, gl.height);
    ic.globalCompositeOperation = 'source-over';
    return g;
  }
}

export function drawWipe(canvas: HTMLCanvasElement, bg: HTMLImageElement | null, w: number, h: number, p: number | null) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cw = Math.round(w * dpr);
  const ch = Math.round(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (p === null) return;
  const covering = p < 0.5;
  const k = easeInOut(covering ? p / 0.5 : (p - 0.5) / 0.5);
  const edgeX = lerp(-0.2 * w, 1.2 * w, k);
  const amp = Math.min(46, w * 0.03);
  const waveX = (y: number) => edgeX + Math.sin((y / h) * Math.PI * 2.2 + p * 5) * amp;
  ctx.save();
  ctx.beginPath();
  const steps = 24;
  if (covering) {
    ctx.moveTo(-10, -10);
    for (let i = 0; i <= steps; i++) ctx.lineTo(waveX((h * i) / steps), (h * i) / steps);
    ctx.lineTo(-10, h + 10);
  } else {
    ctx.moveTo(w + 10, -10);
    for (let i = 0; i <= steps; i++) ctx.lineTo(waveX((h * i) / steps), (h * i) / steps);
    ctx.lineTo(w + 10, h + 10);
  }
  ctx.closePath();
  ctx.clip();
  if (bg && bg.complete && bg.naturalWidth) {
    const s = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
    const iw = bg.naturalWidth * s;
    const ih = bg.naturalHeight * s;
    ctx.drawImage(bg, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else {
    ctx.fillStyle = '#BA9BE7';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const y = (h * i) / steps;
    if (i === 0) ctx.moveTo(waveX(y), y);
    else ctx.lineTo(waveX(y), y);
  }
  ctx.lineWidth = Math.max(6, w * 0.006);
  ctx.strokeStyle = 'rgba(255,253,247,0.95)';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
