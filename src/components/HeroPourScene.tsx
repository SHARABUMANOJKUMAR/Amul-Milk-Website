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

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => (img.decode ? img.decode().then(() => resolve(img), () => resolve(img)) : resolve(img));
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
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
    Promise.all([loadImage(src.bg), loadImage(src.carton), loadImage(src.glass), loadImage(src.sheen), loadImage(src.front)])
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
          />
          <img
            className="hero__poster-fg"
            src="/assets/hero/poster-fg-1672.webp"
            srcSet="/assets/hero/poster-fg-960.webp 960w, /assets/hero/poster-fg-1672.webp 1672w"
            sizes="(max-width: 700px) 100vw, 96vw"
            alt=""
            draggable={false}
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
