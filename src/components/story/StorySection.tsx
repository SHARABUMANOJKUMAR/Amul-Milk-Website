import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { products, type ProductId } from '../../data/products';
import { sceneArt, scenes, sceneStart, STORY_SOURCE, storyCopy, TIMELINE as T } from '../../data/story';
import { useMotion } from '../../hooks/motion';
import { AmulGirl } from '../AmulGirl';
import { SceneView, type SceneHandle } from './SceneView';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function blobPath(cx: number, cy: number, r: number, phase: number) {
  const n = 14;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(a * 3 + phase) + 0.045 * Math.sin(a * 5 - phase * 1.7) + 0.025 * Math.sin(a * 8 + phase * 0.6);
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.92]);
  }
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    if (i === 0) d += `M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

function wavePath(w: number, h: number, edge: number, phase: number) {
  const steps = 18;
  const amp = Math.min(34, h * 0.035);
  let d = `M-20,${h + 20}L-20,${edge.toFixed(1)}`;
  for (let i = 0; i <= steps; i++) {
    const x = (w * i) / steps;
    const y = edge + Math.sin((i / steps) * Math.PI * 3.2 + phase) * amp + Math.sin((i / steps) * Math.PI * 7 - phase * 1.4) * amp * 0.3;
    d += `L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return `${d}L${w + 20},${edge.toFixed(1)}L${w + 20},${h + 20}Z`;
}

interface StoryProps {
  onExplore: (id: ProductId) => void;
}

export function StorySection({ onExplore }: StoryProps) {
  const { motionOn } = useMotion();
  return motionOn ? <PinnedStory onExplore={onExplore} /> : <StaticStory onExplore={onExplore} />;
}

function PinnedStory({ onExplore }: StoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const milkRef = useRef<SVGPathElement>(null);
  const milkShadowRef = useRef<SVGPathElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const handles = useRef<(SceneHandle | null)[]>([]);
  const geom = useRef({ pinTop: 60, h: 1, w: 1 });
  const uRef = useRef(-9);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(-2);
  const [entered, setEntered] = useState(false);
  const [dropped, setDropped] = useState(false);

  const portrait = box.w > 0 && box.w / box.h < 0.9;
  const picShare = portrait ? (box.w >= 700 ? 0.66 : 0.56) : 1;
  const pic = useMemo(() => ({ w: box.w, h: Math.round(box.h * picShare) }), [box, picShare]);

  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const { pinTop, h, w } = geom.current;
    const u = (pinTop - section.getBoundingClientRect().top) / h;
    uRef.current = u;

    let idx = -2;
    if (u > -1.1 && u < T.end + 1.1) idx = u < T.introEnd ? -1 : Math.max(0, Math.min(scenes.length - 1, Math.floor((u - T.drainEnd) / T.sceneLen)));
    setActive((prev) => (prev === idx ? prev : idx));
    if (u > -0.6) setEntered(true);
    if (u > 0.01) setDropped(true);

    if (idx >= 0) handles.current[idx]?.setProgress(clamp01((u - sceneStart(idx)) / T.sceneLen));

    const milk = milkRef.current;
    if (milk) {
      let d = '';
      let shadow = '';
      if (u >= T.poolStart && u < T.introEnd) {
        const k = clamp01((u - T.poolStart) / (T.poolFull - T.poolStart));
        const cx = w * 0.5;
        const cy = h * (portrait ? 0.6 : 0.66);
        const rMax = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.22;
        d = k >= 1 ? `M-20,-20H${w + 20}V${h + 20}H-20Z` : blobPath(cx, cy, 10 + rMax * k * k, u * 9);
        if (k < 1) shadow = d;
      } else if (u >= T.introEnd && u < T.drainEnd) {
        const k = clamp01((u - T.introEnd) / (T.drainEnd - T.introEnd));
        d = wavePath(w, h, lerp(-0.1 * h, 1.12 * h, k), u * 10);
      } else if (u >= T.exitStart) {
        const k = clamp01((u - T.exitStart) / (T.exitFull - T.exitStart));
        d = k >= 1 ? `M-20,-20H${w + 20}V${h + 20}H-20Z` : wavePath(w, h, lerp(1.12 * h, -0.1 * h, k), u * 10);
      }
      milk.setAttribute('d', d);
      milkShadowRef.current?.setAttribute('d', shadow);
    }
    if (introRef.current) introRef.current.style.visibility = u < T.poolFull + 0.04 ? 'visible' : 'hidden';
    if (walkerRef.current) {
      const k = 1 - clamp01((u - (T.poolFull - 0.2)) / 0.14);
      walkerRef.current.style.opacity = String(k);
      walkerRef.current.style.visibility = k > 0 ? 'visible' : 'hidden';
    }
    if (titleRef.current) {
      const inK = clamp01((u - (T.poolFull - 0.06)) / 0.1);
      const outK = clamp01((u - (T.introEnd + 0.16)) / 0.16);
      titleRef.current.style.opacity = String(inK * (1 - outK));
      titleRef.current.style.transform = `translate3d(0, ${(lerp(18, 0, inK) + outK * 40).toFixed(1)}px, 0)`;
    }
    if (hudRef.current) hudRef.current.dataset.on = String(u > T.introEnd + 0.3 && u < T.exitStart + 0.3);
  }, [portrait]);

  useLayoutEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const measure = () => {
      const w = sticky.clientWidth;
      const h = sticky.clientHeight;
      geom.current = { pinTop: parseFloat(getComputedStyle(sticky).top) || 0, w, h };
      setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
      update();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sticky);
    return () => ro.disconnect();
  }, [update]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  useEffect(() => update(), [update, box, active]);

  const scrollToU = useCallback((u: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const { pinTop, h } = geom.current;
    const top = window.scrollY + section.getBoundingClientRect().top - pinTop + u * h;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);
  const goToScene = useCallback((i: number) => scrollToU(sceneStart(i) + T.sceneLen * 0.62), [scrollToU]);
  const onFocusInside = useCallback(
    (i: number) => {
      const u = uRef.current;
      if (u < sceneStart(i) || u > sceneStart(i) + T.sceneLen) goToScene(i);
    },
    [goToScene],
  );
  const skip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const end = window.scrollY + section.getBoundingClientRect().bottom - geom.current.pinTop;
    window.scrollTo({ top: end, behavior: 'smooth' });
    document.getElementById('moments-title')?.focus?.({ preventScroll: true });
  };

  return (
    <section ref={sectionRef} id="story" className="story" aria-labelledby="story-title" style={{ ['--story-len' as string]: T.end }}>
      <h2 id="story-title" className="visually-hidden">
        {storyCopy.title} {storyCopy.eyebrow}
      </h2>
      <div ref={stickyRef} className={`story__sticky${portrait ? ' is-portrait' : ''}`} style={{ ['--pic' as string]: `${picShare * 100}%` }}>
        <div className="story__scenes">
          {box.w > 0 &&
            scenes.map((scene, i) => (
              <SceneView
                key={scene.id}
                ref={(h) => {
                  handles.current[i] = h;
                }}
                scene={scene}
                index={i}
                total={scenes.length}
                active={active === i}
                near={active >= 0 ? Math.abs(active - i) <= 1 : active === -1 && i === 0}
                pic={pic}
                onExplore={onExplore}
                onFocusInside={onFocusInside}
              />
            ))}
        </div>

        <div ref={introRef} className={`story__intro${entered ? ' is-entered' : ''}`} aria-hidden="true">
          <p className="story__intro-line">
            {storyCopy.introLine.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <p className="story__hint">
            {storyCopy.introHint} <span>↓</span>
          </p>
        </div>

        <svg className="story__milk" width={box.w} height={box.h} viewBox={`0 0 ${box.w || 1} ${box.h || 1}`} aria-hidden="true" focusable="false">
          <path ref={milkShadowRef} className="story__milk-shadow" />
          <path ref={milkRef} />
        </svg>

        <div ref={walkerRef} className={`story__walker${entered ? ' is-entered' : ''}${dropped ? ' is-dropped' : ''}`} aria-hidden="true">
          <div className="story__walker-inner">
            <AmulGirl pose="tray" playing={active === -1} />
            <span className="story__drop" />
          </div>
        </div>

        <div ref={titleRef} className="story__title" aria-hidden="true">
          <small>{storyCopy.eyebrow}</small>
          {storyCopy.title}
        </div>

        <div ref={hudRef} className="story__hud" data-on="false">
          <ol className="story__rail" aria-label="Story scenes">
            {scenes.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={i === active ? 'is-on' : i < active ? 'is-done' : ''}
                  aria-current={i === active ? 'step' : undefined}
                  aria-label={`Scene ${i + 1} of ${scenes.length}: ${s.label}`}
                  onClick={() => goToScene(i)}
                />
              </li>
            ))}
          </ol>
          <button type="button" className="story__skip" onClick={skip}>
            {storyCopy.skip} <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      <img className="story__drips" src="/assets/fx/milk-drip-edge-1600.webp" alt="" width={1600} height={533} loading="lazy" />
    </section>
  );
}

function StaticStory({ onExplore }: StoryProps) {
  return (
    <section id="story" className="story story--static" aria-labelledby="story-title">
      <header className="story-static__head">
        <AmulGirl pose="tray" className="story-static__girl" />
        <p className="eyebrow">{storyCopy.eyebrow}</p>
        <h2 id="story-title" className="display-title">
          {storyCopy.title}
        </h2>
        <p className="story-static__intro">{storyCopy.staticIntro}</p>
      </header>
      <ol className="story-static__list">
        {scenes.map((s, i) => (
          <li key={s.id} className="story-static__item">
            <img
              src={`${sceneArt(s.id)}-960.webp`}
              srcSet={`${sceneArt(s.id)}-960.webp 960w, ${sceneArt(s.id)}-1920.webp 1920w`}
              sizes="(max-width: 900px) 94vw, 720px"
              width={1920}
              height={1080}
              alt={s.alt}
              loading="lazy"
              decoding="async"
            />
            <div className="story-static__text">
              <p className="scene__count">
                {String(i + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')} · {s.label}
              </p>
              <h3>{s.headline.join(' ')}</h3>
              {s.fact && (
                <p className="scene__fact">
                  {s.fact.strong && <b>{s.fact.strong} </b>}
                  {s.fact.text}
                </p>
              )}
              {s.id === 'dairy' && (
                <ul className="story-static__packs">
                  {products.map((p) => (
                    <li key={p.id}>
                      <button type="button" className="link-btn" onClick={() => onExplore(p.id)}>
                        {p.name} {p.size}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {s.id === 'home' && (
                <a className="btn btn--yellow scene__cta" href={storyCopy.homeCta.href}>
                  {storyCopy.homeCta.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="story-static__source">
        Facts:{' '}
        <a href={STORY_SOURCE.url} target="_blank" rel="noopener noreferrer">
          {STORY_SOURCE.label}
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>
    </section>
  );
}
