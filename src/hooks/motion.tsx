import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface MotionState {
  motionOn: boolean;
  prefersReduced: boolean;
  setMotionOn: (on: boolean) => void;
}

const MotionContext = createContext<MotionState | null>(null);

const query = '(prefers-reduced-motion: reduce)';
const readReduced = () => typeof window !== 'undefined' && window.matchMedia(query).matches;

export function MotionProvider({ children }: { children: ReactNode }) {
  const [prefersReduced, setPrefersReduced] = useState(readReduced);
  const [motionOn, setMotion] = useState(() => !readReduced());

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => {
      setPrefersReduced(mq.matches);
      if (mq.matches) setMotion(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motionOn ? 'on' : 'off';
  }, [motionOn]);

  const setMotionOn = useCallback((on: boolean) => setMotion(on), []);
  const value = useMemo(() => ({ motionOn, prefersReduced, setMotionOn }), [motionOn, prefersReduced, setMotionOn]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion outside MotionProvider');
  return ctx;
}

export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

export function useRevealOnce<T extends Element>(ref: React.RefObject<T | null>, threshold = 0.2) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, shown, threshold]);
  return shown;
}
