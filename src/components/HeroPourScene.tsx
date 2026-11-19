import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { hero } from '../data/siteContent';
import { useInView, useMotion } from '../hooks/motion';
import { SceneClock } from '../motion/clock';
import { PourController, type PourStatus } from '../motion/PourController';
import { PourRenderer, drawWipe } from '../motion/pourRenderer';
import { cartonPoint, computeSceneLayout, type Box, type SceneLayout } from '../motion/sceneLayout';
import { AmulGirl } from './AmulGirl';
import { LiquidRibbon } from './LiquidRibbon';

type AssetState = 'loading' | 'ready' | 'failed';

function createProceduralTexture(type: 'bg' | 'carton' | 'glass' | 'sheen' | 'front'): HTMLImageElement {
  const canvas = document.createElement('canvas');
  if (type === 'bg') {
    canvas.width = 1672;
    canvas.height = 880;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 880);
    grad.addColorStop(0, '#FFFDF7');
    grad.addColorStop(0.65, '#F7F2E6');
    grad.addColorStop(1, '#EDE5D2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1672, 880);
    ctx.fillStyle = 'rgba(23, 23, 23, 0.04)';
    ctx.fillRect(0, 560, 1672, 320);
  } else if (type === 'carton') {
    canvas.width = 1448;
    canvas.height = 1086;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.translate(760, 560);
    ctx.rotate((43.784 * Math.PI) / 180);
    // Carton Front Face Body (x: -320 to 360, y: -115 to 115)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-320, -115, 680, 230);
    // Blue section (Amul Taaza)
    ctx.fillStyle = '#1E8FD8';
    ctx.fillRect(100, -115, 260, 230);
    // Slanted gable towards spout
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(360, -115);
    ctx.lineTo(445, -115);
    ctx.lineTo(462.55, 0);
    ctx.lineTo(360, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0369A1';
    ctx.beginPath();
    ctx.moveTo(360, 0);
    ctx.lineTo(462.55, 0);
    ctx.lineTo(445, 115);
    ctx.lineTo(360, 115);
    ctx.closePath();
    ctx.fill();
    // Red bottom band
    ctx.fillStyle = '#E51B23';
    ctx.fillRect(-320, -115, 75, 230);
    // Spout cap centered at (462.55, 0) -> World (1094, 880)
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(456, 0, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0369A1';
    ctx.beginPath();
    ctx.ellipse(462.55, 0, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Brand Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('Amul', 230, -30);
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('TAAZA', 230, 42);
    // Hand holding carton
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.ellipse(-20, -35, 55, 32, -0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (type === 'glass') {
    canvas.width = 1448;
    canvas.height = 1086;
    const ctx = canvas.getContext('2d')!;
    const ro = { cx: 390.5, cy: 277.5, rx: 213.5, ry: 46.5 };
    const ib = { cx: 395, cy: 722, rx: 184, ry: 29 };
    const baseBottom = 818;
    ctx.save();
    // Glass outer silhouette
    ctx.beginPath();
    ctx.moveTo(177, 277.5);
    ctx.lineTo(209.4, baseBottom);
    ctx.ellipse(395, baseBottom, 189.5, 28, 0, 0, Math.PI, false);
    ctx.lineTo(604, 277.5);
    ctx.ellipse(ro.cx, ro.cy, ro.rx, ro.ry, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.stroke();
    // Solid heavy base
    ctx.beginPath();
    ctx.ellipse(ib.cx, ib.cy, ib.rx, ib.ry, 0, 0, Math.PI, false);
    ctx.lineTo(587.8, baseBottom);
    ctx.ellipse(395, baseBottom, 189.5, 28, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fill();
    ctx.restore();
  } else if (type === 'sheen') {
    canvas.width = 1448;
    canvas.height = 1086;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.lineTo(226, 760);
    ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(584, 300);
    ctx.lineTo(572, 760);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    ctx.restore();
  } else if (type === 'front') {
    canvas.width = 1448;
    canvas.height = 1086;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(390.5, 277.5, 213.5, 46.5, 0, 0, Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();
    // Front thumb
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.moveTo(424, 556);
    const pts = [[430, 540], [443, 523], [460, 511], [484, 503], [515, 497], [550, 492], [590, 487], [640, 482], [640, 614], [592, 604], [560, 608], [525, 612], [490, 608], [463, 598], [443, 585], [430, 571]];
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
    ctx.stroke();
    ctx.restore();
  }
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

const loadImage = (src: string, fallbackType: 'bg' | 'carton' | 'glass' | 'sheen' | 'front') =>
  new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().then(() => resolve(img), () => resolve(img)) : resolve(img));
    img.onerror = () => {
      resolve(createProceduralTexture(fallbackType));
    };
    img.src = src;
  });

const PauseIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <rect x="5" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
    <rect x="11.6" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.3-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2z" fill="currentColor" />
  </svg>
);
const ReplayIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      d="M10 3.5a6.5 6.5 0 1 1-6.1 4.3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path d="M2.6 3.4l1.3 4.7 4.6-1.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HeroPourScene() {
  const { motionOn } = useMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLCanvasElement>(null);
  const interiorRef = useRef<HTMLCanvasElement>(null);
  const wipeRef = useRef<HTMLCanvasElement>(null);
  const cartonRef = useRef<HTMLImageElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PourRenderer | null>(null);
  const peekRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [assets, setAssets] = useState<AssetState>('loading');
  const [status, setStatus] = useState<PourStatus>('poster');
  const [optIn, setOptIn] = useState(false);
  const inView = useInView(frameRef, '80px');

  const clock = useMemo(() => new SceneClock(), []);
  const controller = useMemo(() => new PourController(), []);
  useEffect(() => {
    clock.attach();
    return () => clock.detach();
  }, [clock]);
  useEffect(() => controller.onChange((s) => setStatus(s.status)), [controller]);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout: SceneLayout | null = useMemo(() => (size ? computeSceneLayout(size.w, size.h) : null), [size]);
  const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const variant = layout && layout.carton.width * dpr > 820 ? 1448 : 800;
  const bgVariant = layout && layout.w * dpr > 1100 ? 1672 : 960;
  const src = {
    bg: `/assets/hero/bg-${bgVariant}.webp`,
    carton: `/assets/hero/carton-hand-${variant}.webp`,
    glass: `/assets/hero/glass-hand-${variant}.webp`,
    sheen: `/assets/hero/glass-sheen-${variant}.webp`,
    front: `/assets/hero/glass-front-${variant}.webp`,
  };

  useEffect(() => {
    if (!layout) return;
    let alive = true;
    Promise.all([
      loadImage(src.bg, 'bg'),
      loadImage(src.carton, 'carton'),
      loadImage(src.glass, 'glass'),
      loadImage(src.sheen, 'sheen'),
      loadImage(src.front, 'front'),
    ])
      .then(([, , , sheen, front]) => {
        if (!alive) return;
        if (!streamRef.current || !interiorRef.current) throw new Error('canvas missing');
        if (!streamRef.current.getContext('2d')) throw new Error('2D canvas unavailable');
        rendererRef.current = new PourRenderer(streamRef.current, interiorRef.current, { sheen, front });
        setAssets('ready');
      })
      .catch((err) => {
        if (!alive) return;
        console.warn('[hero] layered pour unavailable, keeping poster:', err);
        setAssets('failed');
      });
    return () => {
      alive = false;
    };
  }, [variant, bgVariant, layout !== null]);

  const paint = useCallback(() => {
    const r = rendererRef.current;
    if (!r || !layout) return;
    const g = r.draw(layout, controller.t);
    const img = cartonRef.current;
    if (img) img.style.transform = `translate3d(${layout.carton.tx}px, ${layout.carton.ty}px, 0) rotate(${g.angle}deg)`;
    const wipe = wipeRef.current;
    const p = controller.wipeProgress;
    if (wipe) {
      wipe.style.display = p === null ? 'none' : 'block';
      drawWipe(wipe, bgRef.current, layout.w, layout.h, p);
    }
    frameRef.current?.classList.toggle('is-live', !controller.posterVisible);
    peekRef.current?.classList.toggle('is-ducked', p !== null);
  }, [controller, layout]);

  useEffect(() => {
    if (assets === 'ready') paint();
  }, [assets, paint]);

  const allowed = motionOn || optIn;
  useEffect(() => {
    controller.setHold('view', !inView);
  }, [controller, inView]);

  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (!allowed && controller.status === 'playing') {
      wasPlayingRef.current = true;
      controller.pause();
    } else if (allowed && wasPlayingRef.current && controller.status === 'paused') {
      wasPlayingRef.current = false;
      controller.play();
    }
  }, [allowed, controller]);

  useEffect(() => {
    if (assets !== 'ready' || !motionOn || !inView || controller.status !== 'poster') return;
    const id = window.setTimeout(() => controller.start(), 450);
    return () => window.clearTimeout(id);
  }, [assets, motionOn, inView, controller]);

  const running = status === 'playing' && inView && assets === 'ready';
  useEffect(() => {
    if (!running) return;
    return clock.subscribe((dt) => {
      if (controller.tick(dt)) paint();
    });
  }, [running, clock, controller, paint]);

  const onPourButton = () => {
    if (status === 'playing') {
      wasPlayingRef.current = false;
      controller.pause();
      return;
    }
    if (!motionOn) setOptIn(true);
    if (status === 'finished') controller.replay();
    else controller.play();
  };

  const occluders = useMemo<Box[]>(() => {
    if (!layout) return [];
    const c = layout.carton;
    const pts = ([[280, 330], [1190, 330], [1190, 915], [280, 915]] as [number, number][]).map((p) =>
      cartonPoint(c, p, c.angle),
    );
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const g = layout.glass;
    return [
      { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) },
      { x: g.x + 140 * g.scale, y: g.rimOuter.cy - g.rimOuter.ry, w: layout.w, h: layout.h },
    ];
  }, [layout]);

  const getAvoidRects = useCallback((): Box[] => {
    const frame = frameRef.current?.getBoundingClientRect();
    if (!frame) return [];
    return [ctaRef.current, controlsRef.current]
      .filter((el): el is HTMLAnchorElement | HTMLDivElement => !!el)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - frame.left, y: r.top - frame.top, w: r.width, h: r.height };
      });
  }, []);

  const label =
    status === 'playing' ? 'Pause pour' : status === 'finished' ? 'Replay pour' : 'Play pour';
  const Icon = status === 'playing' ? PauseIcon : status === 'finished' ? ReplayIcon : PlayIcon;
  const showControl = assets !== 'failed';

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__frame" ref={frameRef} data-layout={layout?.preset.name}>
        <div className="hero__scene" role="img" aria-label={hero.sceneLabel}>
          {layout && (
            <>
              <img ref={bgRef} className="hero__bg" src={src.bg} alt="" draggable={false} />
              <LiquidRibbon
                layout={layout}
                clock={clock}
                active={motionOn && inView}
                text={hero.ribbonText}
                getAvoidRects={getAvoidRects}
                occluders={occluders}
              />
              <img
                ref={cartonRef}
                className="hero__layer hero__carton"
                src={src.carton}
                alt=""
                draggable={false}
                style={{
                  width: layout.carton.width,
                  height: layout.carton.height,
                  transformOrigin: `${layout.carton.pivot.x}px ${layout.carton.pivot.y}px`,
                  transform: `translate3d(${layout.carton.tx}px, ${layout.carton.ty}px, 0) rotate(${layout.carton.angle - 7}deg)`,
                }}
              />
              <canvas
                ref={streamRef}
                className="hero__canvas"
                style={{ left: layout.streamBox.x, top: layout.streamBox.y, width: layout.streamBox.w, height: layout.streamBox.h }}
              />
              <img
                className="hero__layer hero__glass"
                src={src.glass}
                alt=""
                draggable={false}
                style={{
                  width: layout.glass.width,
                  height: layout.glass.height,
                  transform: `translate3d(${layout.glass.x}px, ${layout.glass.y}px, 0)`,
                }}
              />
              <canvas
                ref={interiorRef}
                className="hero__canvas"
                style={{ left: layout.glassBox.x, top: layout.glassBox.y, width: layout.glassBox.w, height: layout.glassBox.h }}
              />
            </>
          )}
          <img
            ref={posterRef}
            className="hero__poster"
            src="/assets/hero/poster-1672.webp"
            srcSet="/assets/hero/poster-960.webp 960w, /assets/hero/poster-1672.webp 1672w"
            sizes="(max-width: 700px) 100vw, 96vw"
            alt=""
            fetchPriority="high"
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
          <img
            className="hero__poster-fg"
            src="/assets/hero/poster-fg-1672.webp"
            srcSet="/assets/hero/poster-fg-960.webp 960w, /assets/hero/poster-fg-1672.webp 1672w"
            sizes="(max-width: 700px) 100vw, 96vw"
            alt=""
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
          <canvas ref={wipeRef} className="hero__wipe" style={{ display: 'none' }} />
        </div>

        <div ref={peekRef} className="hero__peek">
          <AmulGirl pose="peek" />
        </div>
        <div className="hero__ui">
          <h1 id="hero-title" className="visually-hidden">
            {hero.heading}
          </h1>
          <a ref={ctaRef} className="btn btn--yellow hero__cta" href={hero.cta.href}>
            {hero.cta.label}
          </a>
          {showControl && (
            <div className="hero__controls" ref={controlsRef}>
              <button
                type="button"
                className="pill-btn"
                onClick={onPourButton}
                disabled={assets === 'loading' && status === 'poster'}
              >
                <Icon />
                <span>{label}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="hero__supporting">{hero.supporting}</p>
    </section>
  );
}
