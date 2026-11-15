import { useMotion } from '../hooks/motion';

export function MotionToggle({ wide = false }: { wide?: boolean }) {
  const { motionOn, setMotionOn } = useMotion();
  return (
    <button
      type="button"
      className={`motion-toggle${wide ? ' motion-toggle--wide' : ''}`}
      aria-pressed={motionOn}
      onClick={() => setMotionOn(!motionOn)}
    >
      <span className="motion-toggle__track" aria-hidden="true">
        <span className="motion-toggle__thumb" />
      </span>
      <span>Motion {motionOn ? 'on' : 'off'}</span>
    </button>
  );
}

export function StripPauseButton({
  paused,
  onToggle,
  label,
}: {
  paused: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button type="button" className="strip-pause" aria-pressed={paused} onClick={onToggle}>
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        {paused ? (
          <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.3-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2z" fill="currentColor" />
        ) : (
          <>
            <rect x="5" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
            <rect x="11.6" y="4" width="3.4" height="12" rx="1" fill="currentColor" />
          </>
        )}
      </svg>
      <span className="visually-hidden">
        {paused ? 'Play' : 'Pause'} {label}
      </span>
    </button>
  );
}
