import { useEffect, useRef, useState } from 'react';
import { goldReveal } from '../data/siteContent';
import { useInView, useMotion } from '../hooks/motion';
import { AmulGirl } from './AmulGirl';

export const GOLD_VIDEO: { webm?: string; mp4: string; hd?: { webm?: string; mp4: string } } | null = {
  webm: '/assets/gold/gold-reveal.webm',
  mp4: '/assets/gold/gold-reveal.mp4',
  hd: { webm: '/assets/gold/gold-reveal-1080.webm', mp4: '/assets/gold/gold-reveal-1080.mp4' },
};

export function GoldReveal({ onExplore }: { onExplore: () => void }) {
  const { motionOn } = useMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(stageRef, '-15% 0px');
  const [run, setRun] = useState(0);
  const [played, setPlayed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = !!GOLD_VIDEO && !videoFailed;
  const [hd, setHd] = useState(false);
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !GOLD_VIDEO?.hd) return;
    setHd(el.clientWidth * (window.devicePixelRatio || 1) > 900);
  }, []);
  const clip = GOLD_VIDEO && hd && GOLD_VIDEO.hd ? GOLD_VIDEO.hd : GOLD_VIDEO;

  useEffect(() => {
    if (!inView || played || !motionOn) return;
    setPlayed(true);
    setRun((r) => r + 1);
  }, [inView, played, motionOn]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !run || !useVideo) return;
    v.currentTime = 0;
    v.play().catch(() => setVideoFailed(true));
  }, [run, useVideo]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!motionOn || !inView) v.pause();
  }, [motionOn, inView]);

  const replay = () => setRun((r) => r + 1);

  return (
    <section className="gold" aria-labelledby="gold-title">
      <AmulGirl pose="chef" className="gold-girl" />
      <div className="gold__copy">
        <p className="eyebrow">{goldReveal.eyebrow}</p>
        <h2 id="gold-title" className="display-title display-title--left">
          {goldReveal.heading}
        </h2>
        <p className="gold__body">{goldReveal.body}</p>
        <div className="gold__actions">
          <button type="button" className="btn btn--red" onClick={onExplore} aria-controls="product-details">
            {goldReveal.cta}
          </button>
          <button type="button" className="pill-btn pill-btn--light" onClick={replay} disabled={!motionOn && !useVideo}>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path d="M10 3.5a6.5 6.5 0 1 1-6.1 4.3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M2.6 3.4l1.3 4.7 4.6-1.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Replay reveal</span>
          </button>
        </div>
      </div>
      <div ref={stageRef} className={`gold__stage${run ? ' is-running' : ''}`}>
        <div className="gold__entrance" key={useVideo ? `v${hd ? 'h' : 's'}` : `l${run}`}>
          {useVideo ? (
            <video
              ref={videoRef}
              className="gold__media"
              muted
              playsInline
              preload="none"
              poster="/assets/gold/poster-1086.webp"
              aria-label={goldReveal.posterAlt}
              onError={() => setVideoFailed(true)}
            >
              {clip!.webm && <source src={clip!.webm} type="video/webm" />}
              <source src={clip!.mp4} type="video/mp4" />
            </video>
          ) : (
            <div className="gold__layered">
              <img
                className="gold__media gold__turn"
                src="/assets/gold/poster-720.webp"
                srcSet="/assets/gold/poster-720.webp 720w, /assets/gold/poster-1086.webp 1086w"
                sizes="(max-width: 860px) 90vw, 44vw"
                width={1086}
                height={1448}
                alt={goldReveal.posterAlt}
                loading="lazy"
                decoding="async"
              />
              <span className="gold__sheen" aria-hidden="true" />
              <svg className="gold__drops" viewBox="0 0 100 133" aria-hidden="true">
                <ellipse cx="14" cy="96" rx="2.6" ry="1.9" />
                <ellipse cx="86" cy="30" rx="2.2" ry="1.7" />
                <ellipse cx="80" cy="56" rx="1.6" ry="1.3" />
                <circle cx="21" cy="88" r="0.9" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
