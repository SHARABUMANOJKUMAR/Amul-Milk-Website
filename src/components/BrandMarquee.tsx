import { useState, type ReactNode } from 'react';
import { products } from '../data/products';
import { strip, textStrip } from '../data/siteContent';
import { AmulGirl } from './AmulGirl';
import { StripPauseButton } from './MotionControls';

const COPIES = 3;

interface MarqueeProps {
  direction: 'rtl' | 'ltr';
  variant: 'brand' | 'text';
  label: string;
  duration: number;
  renderItems: (decorative: boolean) => ReactNode;
  onPausedChange?: (paused: boolean) => void;
}

function Marquee({ direction, variant, label, duration, renderItems, onPausedChange }: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  const toggle = () => {
    const next = !paused;
    setPaused(next);
    onPausedChange?.(next);
  };
  return (
    <div
      className={`marquee marquee--${variant}`}
      data-dir={direction}
      data-paused={paused}
      style={{ ['--marquee-duration' as string]: `${duration}s` }}
    >
      <div className="marquee__viewport">
        <div className="marquee__track">
          {Array.from({ length: COPIES }, (_, i) =>
            i === 0 ? (
              <ul key={i} className="marquee__group" aria-label={label}>
                {renderItems(false)}
              </ul>
            ) : (
              <ul key={i} className="marquee__group marquee__group--copy" aria-hidden="true" inert>
                {renderItems(true)}
              </ul>
            ),
          )}
        </div>
      </div>
      <StripPauseButton paused={paused} onToggle={toggle} label={label} />
    </div>
  );
}

export function BrandMarquee() {
  const [stripPaused, setStripPaused] = useState(false);
  return (
    <section id="explore" className="strip-section" aria-labelledby="strip-title">
      <h2 id="strip-title" className="strip-title">
        {strip.heading}
      </h2>
      <Marquee
        direction="rtl"
        variant="brand"
        label="Amul milk line-up"
        duration={34}
        onPausedChange={setStripPaused}
        renderItems={(decorative) =>
          products.map((p) => (
            <li key={p.id} className="marquee__item">
              <a href={`#product-${p.id}`} tabIndex={decorative ? -1 : undefined}>
                <img src="/assets/brand/amul-logo.svg" width={58} height={23} alt={decorative ? '' : 'Amul'} />
                <span className="marquee__name">{p.shortName}</span>
                <span className="marquee__size">{p.size}</span>
              </a>
            </li>
          ))
        }
      />
      <AmulGirl pose="sit" className="strip-girl" playing={!stripPaused} />
    </section>
  );
}

const Drop = () => (
  <svg className="marquee__drop" viewBox="0 0 12 16" width="12" height="16" aria-hidden="true">
    <path d="M6 0C6 0 0 7 0 10.2A6 6 0 0 0 12 10.2C12 7 6 0 6 0Z" fill="currentColor" />
  </svg>
);

export function TextMarquee() {
  return (
    <div className="text-strip">
      <Marquee
        direction="ltr"
        variant="text"
        label={textStrip.label}
        duration={46}
        renderItems={() =>
          textStrip.items.map((item) => (
            <li key={item} className="marquee__item">
              <span>{item}</span>
              <Drop />
            </li>
          ))
        }
      />
    </div>
  );
}
