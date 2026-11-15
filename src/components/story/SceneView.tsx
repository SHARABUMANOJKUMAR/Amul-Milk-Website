import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';
import { products, type ProductId } from '../../data/products';
import { sceneArt, STORY_SOURCE, storyCopy, type StoryScene } from '../../data/story';

export interface SceneHandle {
  setProgress: (s: number) => void;
}
export interface PictureBox {
  w: number;
  h: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

type FrameFn = (s: number) => number | void;
interface OverlayProps {
  active: boolean;
  react: () => void;
  onExplore: (id: ProductId) => void;
  frame: MutableRefObject<FrameFn | null>;
}

function Hotspot({
  at,
  side = 'r',
  label,
  onPress,
  done = false,
}: {
  at: [number, number];
  side?: 'l' | 'r' | 't' | 'b';
  label: string;
  onPress: () => void;
  done?: boolean;
}) {
  return (
    <button type="button" className={`hot hot--${side}${done ? ' is-done' : ''}`} style={{ left: `${at[0]}%`, top: `${at[1]}%` }} onClick={onPress}>
      <span className="hot__dot" aria-hidden="true" />
      <span className="hot__label">{label}</span>
    </button>
  );
}

function Burst({ n, text, at, className = '' }: { n: number; text: string; at: [number, number]; className?: string }) {
  if (!n) return null;
  return (
    <span key={n} className={`burst ${className}`} style={{ left: `${at[0]}%`, top: `${at[1]}%` }} aria-hidden="true">
      {text}
    </span>
  );
}

function Say({ text }: { text: string }) {
  return (
    <span className="visually-hidden" role="status">
      {text}
    </span>
  );
}

function DawnOverlay({ react, frame }: OverlayProps) {
  const veil = useRef<HTMLDivElement>(null);
  const [crows, setCrows] = useState(0);
  useEffect(() => {
    frame.current = (s) => {
      if (veil.current) veil.current.style.opacity = String(0.62 * (1 - clamp01(s / 0.75)));
    };
    return () => {
      frame.current = null;
    };
  }, [frame]);
  return (
    <>
      <div ref={veil} className={`dawn-veil${crows ? ' is-day' : ''}`} aria-hidden="true" />
      <span className={`window-glow${crows ? ' is-on' : ''}`} style={{ left: '8.1%', top: '47.8%' }} aria-hidden="true" />
      <span className={`window-glow${crows ? ' is-on' : ''}`} style={{ left: '40.4%', top: '52%' }} aria-hidden="true" />
      <Hotspot
        at={[94.6, 47]}
        side="l"
        label="Tap the rooster"
        onPress={() => {
          setCrows((n) => n + 1);
          react();
        }}
      />
      <Burst n={crows} text="COCK-A-DOODLE-DOO!" at={[80, 31]} className="burst--left" />
      <Say text={crows ? 'The rooster crows and the village lights up.' : ''} />
    </>
  );
}

function HerdOverlay({ react }: OverlayProps) {
  const [moos, setMoos] = useState(0);
  return (
    <>
      <Hotspot
        at={[67, 81.5]}
        side="r"
        label="Tap the bell"
        onPress={() => {
          setMoos((n) => n + 1);
          react();
        }}
      />
      <Burst n={moos} text="MOO!" at={[62.5, 49]} className="burst--bubble" />
      <Burst n={moos} text="♪ ting ting" at={[72.5, 73]} className="burst--small" />
      <Say text={moos ? 'The cow rings her bell and moos.' : ''} />
    </>
  );
}

function MilkingOverlay({ active }: OverlayProps) {
  const [p, setP] = useState(0);
  const holding = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const stop = useCallback(() => {
    holding.current = false;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);
  const start = useCallback(() => {
    if (holding.current) return;
    holding.current = true;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      let finished = false;
      setP((v) => {
        const nv = Math.min(1, v + dt / 2.4);
        finished = nv >= 1;
        return nv;
      });
      raf.current = holding.current && !finished ? requestAnimationFrame(tick) : 0;
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);
  const done = p >= 1;
  const millions = (3.6 * (1 - Math.pow(1 - p, 2))).toFixed(1);
  const C = 2 * Math.PI * 21;
  return (
    <>
      <button
        type="button"
        className={`hot hot--hold hot--b${done ? ' is-done' : ''}`}
        style={{ left: '32.5%', top: '79%' }}
        onPointerDown={(e) => {
          if (done) return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          start();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !done) {
            e.preventDefault();
            start();
          }
        }}
        aria-label={done ? 'The pail is full' : 'Press and hold to fill the pail'}
      >
        <svg className="hot__ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="21" className="hot__ring-bg" />
          <circle cx="24" cy="24" r="21" className="hot__ring-fg" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p) }} />
        </svg>
        <span className="hot__dot" aria-hidden="true" />
        <span className="hot__label">{done ? 'Pail full ✓' : p > 0 ? 'Keep holding…' : 'Press and hold to fill'}</span>
      </button>
      <div className={`meter${p > 0 ? ' is-on' : ''}${done ? ' is-done' : ''}`} style={{ left: '8.5%', top: '58%' }} aria-hidden="true">
        <strong>{millions} million</strong>
        <span>farmer members</span>
        <i style={{ transform: `scaleX(${p})` }} />
      </div>
      <Say text={done ? '3.6 million farmer members. The pail is full.' : ''} />
    </>
  );
}

const CAN_START: [number, number] = [73, 93.5];
const CAN_TARGET: [number, number] = [70.9, 58.6];
const STEPS = ['Checked', 'Pooled', 'Chilled', 'Paid digitally'];

function CoopOverlay(_: OverlayProps) {
  const [pos, setPos] = useState<[number, number]>(CAN_START);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const drag = useRef<{ dx: number; dy: number; moved: boolean; rect: DOMRect } | null>(null);

  useEffect(() => {
    if (!done || step >= STEPS.length) return;
    const id = window.setTimeout(() => setStep((n) => n + 1), step === 0 ? 450 : 520);
    return () => window.clearTimeout(id);
  }, [done, step]);

  const finish = () => {
    setPos(CAN_TARGET);
    setDone(true);
  };
  const toPct = (e: ReactPointerEvent, rect: DOMRect): [number, number] => [((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100];

  return (
    <>
      <span className="coop-sign" aria-hidden="true">
        Village Dairy
        <br />
        Co-operative Society
      </span>
      <span className={`drop-target${done ? ' is-done' : ''}${dragging ? ' is-hot' : ''}`} style={{ left: `${CAN_TARGET[0]}%`, top: `${CAN_TARGET[1]}%` }} aria-hidden="true" />
      <button
        type="button"
        className={`can${dragging ? ' is-dragging' : ''}${done ? ' is-done' : ''}`}
        style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
        disabled={done}
        aria-label={done ? 'Milk can on the scale' : 'Put the milk can on the scale'}
        onPointerDown={(e) => {
          if (done) return;
          const stage = e.currentTarget.closest('.scene__stage') as HTMLElement | null;
          if (!stage) return;
          const rect = stage.getBoundingClientRect();
          const [px, py] = toPct(e, rect);
          drag.current = { dx: pos[0] - px, dy: pos[1] - py, moved: false, rect };
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const [px, py] = toPct(e, d.rect);
          const nx = px + d.dx;
          const ny = py + d.dy;
          if (Math.abs(nx - pos[0]) + Math.abs(ny - pos[1]) > 0.4) d.moved = true;
          setPos([Math.max(3, Math.min(97, nx)), Math.max(12, Math.min(99, ny))]);
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          setDragging(false);
          if (!d) return;
          const near = Math.hypot(pos[0] - CAN_TARGET[0], (pos[1] - CAN_TARGET[1]) * 0.6) < 9;
          if (near || !d.moved) finish();
          else setPos(CAN_START);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
          if (!done) setPos(CAN_START);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finish();
          }
        }}
      >
        <img src="/assets/story/can.webp" alt="" draggable={false} />
        {!done && <span className="can__hint">Drag me to the scale</span>}
      </button>
      <ul className="stamps" style={{ left: '80.5%', top: '24%' }} aria-hidden="true">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'is-on' : ''}>
            {s} ✓
          </li>
        ))}
      </ul>
      <Say text={done && step >= STEPS.length ? 'Checked, pooled and chilled. The farmer is paid digitally.' : ''} />
    </>
  );
}

const ROAD: [number, number, number][] = [
  [60, 73, 19],
  [66, 62, 15.5],
  [72, 54, 12.5],
  [80, 46.5, 9],
  [87.5, 40, 5.5],
  [88.8, 37.2, 3.6],
  [85.2, 35.4, 2.4],
];

function RoadOverlay({ frame }: OverlayProps) {
  const tanker = useRef<HTMLDivElement>(null);
  const [beeps, setBeeps] = useState(0);
  useEffect(() => {
    const place = (s: number) => {
      const el = tanker.current;
      if (!el) return;
      const t = ease(clamp01((s - 0.06) / 0.78)) * (ROAD.length - 1);
      const i = Math.min(ROAD.length - 2, Math.floor(t));
      const f = t - i;
      const a = ROAD[i];
      const b = ROAD[i + 1];
      const x = lerp(a[0], b[0], f);
      el.style.left = `${x}%`;
      el.style.top = `${lerp(a[1], b[1], f)}%`;
      el.style.width = `${lerp(a[2], b[2], f)}%`;
      return lerp(0.32, x / 100, ease(clamp01((s - 0.02) / 0.2)));
    };
    frame.current = place;
    place(0);
    return () => {
      frame.current = null;
    };
  }, [frame]);
  return (
    <>
      <div ref={tanker} className="tanker">
        <img key={beeps} className={beeps ? 'is-beeping' : ''} src="/assets/story/tanker.webp" alt="" draggable={false} />
        <button type="button" className="hot hot--t tanker__horn" onClick={() => setBeeps((n) => n + 1)}>
          <span className="hot__dot" aria-hidden="true" />
          <span className="hot__label">Tap the horn</span>
        </button>
        <Burst n={beeps} text="BEEP BEEP!" at={[50, -8]} className="burst--center" />
      </div>
      <Say text={beeps ? 'Beep beep! The tanker is on its way to the dairy.' : ''} />
    </>
  );
}

const BELT_HEIGHTS: Record<ProductId, number> = { taaza: 86, gold: 86, 'calci-plus': 97, 'lactose-free': 60 };

function DairyOverlay({ active, onExplore }: OverlayProps) {
  return (
    <div className="belt" data-running={active}>
      <div className="belt__track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="belt__group" aria-hidden={copy === 1 || undefined}>
            {products.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="belt__pack"
                  style={{ height: `${BELT_HEIGHTS[p.id]}%` }}
                  tabIndex={copy === 1 ? -1 : 0}
                  onClick={() => onExplore(p.id)}
                  aria-label={`${p.name} ${p.size}: open details`}
                >
                  <img src={`${p.image.base}-480.webp`} alt="" draggable={false} />
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

function HomeOverlay() {
  return <img className="home-pack" src="/assets/products/taaza-480.webp" alt="" draggable={false} />;
}

const OVERLAYS: Record<StoryScene['id'], (p: OverlayProps) => ReactElement> = {
  dawn: DawnOverlay,
  herd: HerdOverlay,
  milking: MilkingOverlay,
  coop: CoopOverlay,
  road: RoadOverlay,
  dairy: DairyOverlay,
  home: HomeOverlay,
};

interface SceneProps {
  scene: StoryScene;
  index: number;
  total: number;
  active: boolean;
  near: boolean;
  pic: PictureBox;
  onExplore: (id: ProductId) => void;
  onFocusInside: (index: number) => void;
}

export const SceneView = forwardRef<SceneHandle, SceneProps>(function SceneView(
  { scene, index, total, active, near, pic, onExplore, onFocusInside },
  ref,
) {
  const stageRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<HTMLVideoElement>(null);
  const reactRef = useRef<HTMLVideoElement>(null);
  const frame = useRef<FrameFn | null>(null);
  const lastS = useRef(0);
  const [reacting, setReacting] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  const sh = Math.max(pic.h, (pic.w * 9) / 16);
  const sw = (sh * 16) / 9;
  const offY = -(sh - pic.h) * scene.focusY;

  const apply = useCallback(
    (s: number) => {
      lastS.current = s;
      const follow = frame.current?.(s);
      let pan = lerp(scene.pan[0], scene.pan[1], ease(clamp01((s - 0.06) / 0.5)));
      if (typeof follow === 'number' && sw > pic.w + 1) {
        const vw = pic.w / sw;
        pan = clamp01((follow - vw / 2) / (1 - vw));
      }
      if (stageRef.current) stageRef.current.style.transform = `translate3d(${(-(sw - pic.w) * pan).toFixed(1)}px, ${offY.toFixed(1)}px, 0)`;
    },
    [scene.pan, sw, pic.w, offY],
  );
  useImperativeHandle(ref, () => ({ setProgress: apply }), [apply]);
  useEffect(() => apply(lastS.current), [apply]);

  useEffect(() => {
    const v = idleRef.current;
    if (!v) return;
    if (active && !reacting) v.play().catch(() => {});
    else v.pause();
    if (!active && reactRef.current) {
      reactRef.current.pause();
      setReacting(false);
    }
  }, [active, near, reacting]);

  const react = useCallback(() => {
    const r = reactRef.current;
    if (!r) return;
    r.currentTime = 0;
    r.play()
      .then(() => setReacting(true))
      .catch(() => {});
  }, []);
  const onReactEnd = () => {
    const v = idleRef.current;
    if (v) v.currentTime = 0;
    setReacting(false);
  };

  const art = sceneArt(scene.id);
  const px = sw * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const tier = px >= 1700 ? '-1080' : '';
  const Overlay = OVERLAYS[scene.id];
  const headingId = `story-${scene.id}`;

  return (
    <article
      className={`scene scene--${scene.id}${active ? ' is-active' : ''}`}
      data-cap={scene.cap}
      aria-labelledby={headingId}
      onFocusCapture={() => onFocusInside(index)}
    >
      <div className="scene__picture">
        <div ref={stageRef} className="scene__stage" style={{ width: sw, height: sh, ['--sw' as string]: `${sw}px` }}>
          <img
            className="scene__still"
            src={`${art}-960.webp`}
            srcSet={`${art}-960.webp 960w, ${art}-1920.webp 1920w, ${art}-2688.webp 2688w`}
            sizes={`${Math.round(sw)}px`}
            alt={scene.alt}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
          {near && videoOk && (
            <video key={`loop${tier}`} ref={idleRef} className="scene__video" muted loop playsInline preload="auto" aria-hidden="true" onError={() => setVideoOk(false)}>
              <source src={`${art}${tier}.webm`} type="video/webm" />
              <source src={`${art}${tier}.mp4`} type="video/mp4" onError={() => setVideoOk(false)} />
            </video>
          )}
          {active && videoOk && scene.reaction && (
            <video key={`react${tier}`} ref={reactRef} className={`scene__video scene__video--react${reacting ? ' is-on' : ''}`} muted playsInline preload="auto" aria-hidden="true" onEnded={onReactEnd}>
              <source src={`${art}-react${tier}.webm`} type="video/webm" />
              <source src={`${art}-react${tier}.mp4`} type="video/mp4" />
            </video>
          )}
          <Overlay active={active} react={react} onExplore={onExplore} frame={frame} />
        </div>
      </div>
      <div className="scene__cap">
        <p className="scene__count">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {scene.label}
        </p>
        <h3 id={headingId}>
          {scene.headline.map((l) => (
            <span key={l}>{l} </span>
          ))}
        </h3>
        {scene.fact && (
          <p className="scene__fact">
            {scene.fact.strong && <b>{scene.fact.strong} </b>}
            {scene.fact.text}
          </p>
        )}
        {scene.id === 'home' && (
          <>
            <a className="btn btn--yellow scene__cta" href={storyCopy.homeCta.href}>
              {storyCopy.homeCta.label}
            </a>
            <p className="scene__source">
              Facts:{' '}
              <a href={STORY_SOURCE.url} target="_blank" rel="noopener noreferrer">
                {STORY_SOURCE.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
          </>
        )}
      </div>
    </article>
  );
});
