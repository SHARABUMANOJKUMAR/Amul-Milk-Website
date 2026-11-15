import { useEffect, useRef, useState, type CSSProperties } from 'react';
import manifest from '../data/girl-manifest.json';
import { useInView, useMotion } from '../hooks/motion';

export type GirlPose = 'peek' | 'sit' | 'point' | 'chef' | 'wave' | 'tray';

interface Props {
  pose: GirlPose;
  className?: string;
  playing?: boolean;
  flip?: boolean;
  style?: CSSProperties;
}

const info = manifest as Record<GirlPose, { w: number; h: number; loop: boolean; hd?: boolean }>;

export function AmulGirl({ pose, className = '', playing = true, flip = false, style }: Props) {
  const { motionOn } = useMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, '120px');
  const [loaded, setLoaded] = useState(false);
  const { w, h, loop, hd: hasHd } = info[pose];
  const animate = loop && motionOn && inView && playing;
  const [hd, setHd] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasHd) return;
    const check = () => setHd(el.clientHeight * (window.devicePixelRatio || 1) > h * 1.25);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasHd, h]);
  const x2 = hd ? '@2x' : '';
  return (
    <span
      ref={ref}
      className={`girl girl--${pose}${flip ? ' is-flipped' : ''} ${className}`}
      style={{ aspectRatio: `${w} / ${h}`, ...style }}
      aria-hidden="true"
    >
      <img className="girl__img" src={`/assets/girl/${pose}-still${x2}.webp`} width={w} height={h} alt="" draggable={false} loading="lazy" decoding="async" />
      {animate && (
        <img
          key={`loop${x2}`}
          className={`girl__img girl__img--loop${loaded ? ' is-loaded' : ''}`}
          src={`/assets/girl/${pose}${x2}.webp`}
          width={w}
          height={h}
          alt=""
          draggable={false}
          onLoad={() => setLoaded(true)}
        />
      )}
    </span>
  );
}
