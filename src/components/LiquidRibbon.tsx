import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { SceneClock } from '../motion/clock';
import { RIBBON } from '../motion/sceneConfig';
import type { Box, SceneLayout } from '../motion/sceneLayout';

interface Props {
  layout: SceneLayout;
  clock: SceneClock;
  active: boolean;
  text: string;
  getAvoidRects: () => Box[];
  occluders: Box[];
}

interface Metrics {
  fontSize: number;
  capH: number;
  repLen: number;
  copies: number;
  pathLen: number;
  samples: { x: number; y: number; nx: number; ny: number; s: number }[];
}

interface Drip {
  el: SVGPathElement;
  live: boolean;
  phase: 'attached' | 'falling';
  age: number;
  char: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  dropY: number;
}

const FONT = '"Anton", "Impact", "Arial Narrow Bold", sans-serif';

const hit = (x: number, y: number, b: Box, pad = 0) =>
  x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad;

export function LiquidRibbon({ layout, clock, active, text, getAvoidRects, occluders }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const pathId = `ribbon-path-${uid}`;
  const maskId = `ribbon-glyph-mask-${uid}`;
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const tpVisible = useRef<SVGTextPathElement>(null);
  const tpMask = useRef<SVGTextPathElement>(null);
  const milkRef = useRef<SVGPathElement>(null);
  const milkShadeRef = useRef<SVGPathElement>(null);
  const milkHiRef = useRef<SVGPathElement>(null);
  const dripLayer = useRef<SVGGElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const state = useRef({ phase: 0, time: 0, nextDrip: 1.2, drips: [] as Drip[] });

  const band = layout.ribbonWidth;
  const fontSize = Math.round(band * 0.62);

  useEffect(() => {
    let alive = true;
    const done = () => alive && setFontsReady(true);
    if (!document.fonts) {
      done();
      return;
    }
    Promise.race([
      document.fonts.load(`400 ${fontSize}px Anton`).then(() => document.fonts.ready),
      new Promise((r) => setTimeout(r, 2500)),
    ]).then(done, done);
    return () => {
      alive = false;
    };
  }, [fontSize]);

  useLayoutEffect(() => {
    if (!fontsReady || !pathRef.current || !measureRef.current) return;
    const path = pathRef.current;
    const pathLen = path.getTotalLength();
    const repLen = measureRef.current.getComputedTextLength() || fontSize * text.length * 0.5;
    const copies = Math.ceil((pathLen + repLen * 1.5) / repLen) + 1;
    const c = document.createElement('canvas').getContext('2d')!;
    c.font = `400 ${fontSize}px ${FONT}`;
    const capH = c.measureText('H').actualBoundingBoxAscent || fontSize * 0.72;
    const step = 4;
    const samples: Metrics['samples'] = [];
    for (let s = 0; s <= pathLen; s += step) {
      const p = path.getPointAtLength(s);
      const q = path.getPointAtLength(Math.min(pathLen, s + 1));
      const p0 = s + 1 > pathLen ? path.getPointAtLength(s - 1) : p;
      const dx = s + 1 > pathLen ? p.x - p0.x : q.x - p.x;
      const dy = s + 1 > pathLen ? p.y - p0.y : q.y - p.y;
      const l = Math.hypot(dx, dy) || 1;
      samples.push({ x: p.x, y: p.y, nx: -dy / l, ny: dx / l, s });
    }
    setMetrics({ fontSize, capH, repLen, copies, pathLen, samples });
  }, [fontsReady, layout.ribbonPath, layout.w, layout.h, fontSize, text]);

  useEffect(() => {
    if (!metrics) return;
    const st = state.current;
    const speed = RIBBON.speed * Math.max(0.6, layout.w / 1440);
    const { capH, repLen, samples } = metrics;
    const lam1 = metrics.fontSize * 3.4;
    const lam2 = metrics.fontSize * 1.15;

    const render = () => {
      const offset = -(st.phase % repLen);
      tpVisible.current?.setAttribute('startOffset', offset.toFixed(2));
      tpMask.current?.setAttribute('startOffset', offset.toFixed(2));
      const t = st.time;
      let top = '';
      let shade = '';
      let hiTop = '';
      const hiBottom: string[] = [];
      const bottom: string[] = [];
      const shadeBottom: string[] = [];
      for (let i = 0; i < samples.length; i++) {
        const p = samples[i];
        const xText = p.s - offset;
        const fill =
          0.5 +
          0.15 * Math.sin((xText / lam1) * Math.PI * 2 + t * 1.6) +
          0.07 * Math.sin((xText / lam2) * Math.PI * 2 - t * 2.4);
        const lev = capH / 2 - fill * capH;
        const tx = p.x + p.nx * lev;
        const ty = p.y + p.ny * lev;
        top += `${i ? 'L' : 'M'}${tx.toFixed(1)},${ty.toFixed(1)}`;
        hiTop += `${i ? 'L' : 'M'}${(tx + p.nx * capH * 0.035).toFixed(1)},${(ty + p.ny * capH * 0.035).toFixed(1)}`;
        const hb = lev + capH * 0.13;
        hiBottom.push(`L${(p.x + p.nx * hb).toFixed(1)},${(p.y + p.ny * hb).toFixed(1)}`);
        const sl = capH / 2 - capH * 0.16;
        shade += `${i ? 'L' : 'M'}${(p.x + p.nx * sl).toFixed(1)},${(p.y + p.ny * sl).toFixed(1)}`;
        const bo = band / 2;
        bottom.push(`L${(p.x + p.nx * bo).toFixed(1)},${(p.y + p.ny * bo).toFixed(1)}`);
        shadeBottom.push(`L${(p.x + p.nx * bo).toFixed(1)},${(p.y + p.ny * bo).toFixed(1)}`);
      }
      milkRef.current?.setAttribute('d', `${top}${bottom.reverse().join('')}Z`);
      milkShadeRef.current?.setAttribute('d', `${shade}${shadeBottom.reverse().join('')}Z`);
      milkHiRef.current?.setAttribute('d', `${hiTop}${hiBottom.reverse().join('')}Z`);
    };

    const textEl = textRef.current!;
    const totalChars = text.length * metrics.copies;
    const letter = /[A-Z]/;

    const glyphBottom = (i: number) => {
      try {
        const a = textEl.getStartPositionOfChar(i);
        const b = textEl.getEndPositionOfChar(i);
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, dx: b.x - a.x, dy: b.y - a.y };
      } catch {
        return null;
      }
    };

    const spawnDrip = () => {
      const live = st.drips.filter((d) => d.live).length;
      if (live >= RIBBON.maxDrips) return;
      const avoid = getAvoidRects();
      for (let attempt = 0; attempt < 8; attempt++) {
        const i = Math.floor(Math.random() * totalChars);
        if (!letter.test(text[i % text.length])) continue;
        const g = glyphBottom(i);
        if (!g || g.x < 24 || g.x > layout.w - 24 || g.y < 0 || g.y > layout.h - 40) continue;
        if (Math.hypot(g.dx, g.dy) < 1) continue;
        if (occluders.some((b) => hit(g.x, g.y, b, 6))) continue;
        if (avoid.some((b) => hit(g.x, g.y + 50, b, 28) || hit(g.x, g.y + 10, b, 28))) continue;
        let d = st.drips.find((x) => !x.live);
        if (!d) {
          const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          el.setAttribute('class', 'ribbon-drip');
          dripLayer.current?.appendChild(el);
          d = { el, live: false, phase: 'attached', age: 0, char: 0, x: 0, y: 0, vx: 0, vy: 0, r: 0, dropY: 0 };
          st.drips.push(d);
        }
        Object.assign(d, {
          live: true,
          phase: 'attached',
          age: 0,
          char: i,
          x: g.x,
          y: g.y,
          vx: 0,
          vy: 0,
          r: Math.max(2.2, metrics.fontSize * 0.075) * (0.8 + Math.random() * 0.4),
          dropY: 0,
        });
        d.el.style.display = '';
        return;
      }
    };

    const updateDrips = (dt: number) => {
      for (const d of st.drips) {
        if (!d.live) continue;
        d.age += dt;
        if (d.phase === 'attached') {
          const g = glyphBottom(d.char);
          if (!g) {
            d.live = false;
            d.el.style.display = 'none';
            continue;
          }
          const k = Math.min(1, d.age / 0.55);
          const r = d.r * (0.4 + 0.6 * k);
          const neck = d.r * (0.3 + 2.2 * k * k);
          const ax = g.x;
          const ay = g.y - 1;
          const cx = ax;
          const cy = ay + neck;
          const nw = r * 0.5;
          d.el.setAttribute(
            'd',
            `M${ax - nw},${ay} C${ax - nw * 0.6},${ay + neck * 0.5} ${cx - r},${cy - r * 0.6} ${cx - r},${cy} A${r},${r} 0 1 0 ${cx + r},${cy} C${cx + r},${cy - r * 0.6} ${ax + nw * 0.6},${ay + neck * 0.5} ${ax + nw},${ay} Z`,
          );
          d.el.style.opacity = '1';
          if (k >= 1) {
            d.phase = 'falling';
            d.x = cx;
            d.y = cy;
            const len = Math.hypot(g.dx, g.dy) || 1;
            d.vx = (-speed * g.dx) / len;
            d.vy = 30;
            d.age = 0;
          }
        } else {
          d.vy += 980 * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          const fade = Math.max(0, 1 - d.age / 0.55);
          const stretch = 1 + Math.min(0.8, d.vy / 600);
          const r = d.r;
          d.el.setAttribute(
            'd',
            `M${d.x},${d.y - r * 1.5 * stretch} C${d.x + r * 0.5},${d.y - r * 0.6} ${d.x + r},${d.y - r * 0.1} ${d.x + r},${d.y + r * 0.2} A${r},${r} 0 1 1 ${d.x - r},${d.y + r * 0.2} C${d.x - r},${d.y - r * 0.1} ${d.x - r * 0.5},${d.y - r * 0.6} ${d.x},${d.y - r * 1.5 * stretch} Z`,
          );
          d.el.style.opacity = fade.toFixed(3);
          if (fade <= 0 || d.y > layout.h) {
            d.live = false;
            d.el.style.display = 'none';
          }
        }
      }
    };

    if (!active) {
      for (const d of st.drips) {
        d.live = false;
        d.el.style.display = 'none';
      }
      render();
      return;
    }

    render();
    return clock.subscribe((dt) => {
      st.phase += speed * dt;
      st.time += dt;
      st.nextDrip -= dt;
      if (st.nextDrip <= 0) {
        spawnDrip();
        const [a, b] = RIBBON.dripEvery;
        st.nextDrip = a + Math.random() * (b - a);
      }
      render();
      updateDrips(dt);
    });
  }, [metrics, active, clock, layout.w, layout.h, band, text, getAvoidRects, occluders]);

  useEffect(
    () => () => {
      state.current.drips.forEach((d) => d.el.remove());
      state.current.drips = [];
    },
    [],
  );

  const copies = metrics?.copies ?? 6;
  const repeated = text.repeat(copies);
  const outline = Math.max(2, Math.round(band * 0.045));
  const textProps = {
    fontFamily: FONT,
    fontSize,
    letterSpacing: fontSize * 0.02,
    dy: (metrics?.capH ?? fontSize * 0.72) / 2,
    style: { whiteSpace: 'pre' as const },
  };

  return (
    <svg
      className="ribbon"
      width={layout.w}
      height={layout.h}
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id={pathId} ref={pathRef} d={layout.ribbonPath} />
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={layout.w} height={layout.h}>
          <text {...textProps} fill="#fff" stroke="#000" strokeWidth={Math.max(1.6, fontSize * 0.075)}>
            <textPath ref={tpMask} href={`#${pathId}`} startOffset="0">
              {repeated}
            </textPath>
          </text>
        </mask>
      </defs>
      <use href={`#${pathId}`} fill="none" stroke="#171717" strokeWidth={band + outline * 2} />
      <use href={`#${pathId}`} fill="none" stroke="var(--mint)" strokeWidth={band} />
      <text ref={textRef} {...textProps} fill="#171717">
        <textPath ref={tpVisible} href={`#${pathId}`} startOffset="0">
          {repeated}
        </textPath>
      </text>
      <g mask={`url(#${maskId})`}>
        <path ref={milkRef} fill="#F3EEE2" />
        <path ref={milkHiRef} fill="#FFFFFF" />
        <path ref={milkShadeRef} fill="rgba(176,160,138,0.32)" />
      </g>
      <g ref={dripLayer} />
      <text ref={measureRef} {...textProps} x={-9999} y={-9999} visibility="hidden">
        {text}
      </text>
    </svg>
  );
}
