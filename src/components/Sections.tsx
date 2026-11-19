import { useRef, useState } from 'react';
import { finalCta, footer, intro, moments, nav } from '../data/siteContent';
import { useRevealOnce } from '../hooks/motion';
import { AmulGirl } from './AmulGirl';
import { AmulLogo } from './SiteHeader';

export function BrandIntroduction() {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRevealOnce(ref, 0.3);
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div ref={ref} className={`intro__inner reveal-up${shown ? ' is-revealed' : ''}`}>
        <h2 id="intro-title" className="display-title">
          {intro.headingLines.map((l, i) => (
            <span key={l} className="display-title__line">
              {l}
              {i < intro.headingLines.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h2>
        <p className="intro__body">{intro.body}</p>
      </div>
    </section>
  );
}

function MomentPanel({ item, index }: { item: (typeof moments.items)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useRevealOnce(ref, 0.25);
  const [open, setOpen] = useState(false);
  const descId = `moment-desc-${item.id}`;
  return (
    <article ref={ref} className={`moment${shown ? ' is-revealed' : ''}`} style={{ ['--i' as string]: index }}>
      <div className="moment__media">
        <img
          src={`${item.image}-720.webp`}
          srcSet={`${item.image}-720.webp 720w, ${item.image}-1200.webp 1200w`}
          sizes="(max-width: 760px) 92vw, 31vw"
          width={1200}
          height={900}
          alt={item.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="moment__body">
        <h3 className="moment__label">{item.label}</h3>
        <div className="moment__actions">
          <button
            type="button"
            className="link-btn"
            aria-expanded={open}
            aria-controls={descId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Hide scene' : 'About this scene'}
          </button>
          <a className="link-btn" href="#our-milk">
            Choose a milk <span aria-hidden="true">→</span>
          </a>
        </div>
        <p id={descId} className="moment__desc" hidden={!open}>
          {item.scene}
        </p>
      </div>
    </article>
  );
}

export function EverydayMoments() {
  return (
    <section id="moments" className="moments" aria-labelledby="moments-title">
      <h2 id="moments-title" className="display-title display-title--single">
        {moments.heading}
      </h2>
      <div className="moments__grid">
        {moments.items.map((m, i) => (
          <MomentPanel key={m.id} item={m} index={i} />
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-title">
      <img className="final-cta__drip" src="/assets/fx/milk-drip-edge-1600.webp" alt="" loading="lazy" width={1600} height={533} />
      <AmulGirl pose="wave" className="cta-girl" />
      <div className="final-cta__inner">
        <h2 id="final-title" className="display-title display-title--single">
          {finalCta.heading}
        </h2>
        <a className="btn btn--yellow btn--lg" href={finalCta.button.href}>
          {finalCta.button.label}
        </a>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <a href="#top" aria-label="Amul — back to top">
          <AmulLogo className="amul-logo--footer" />
        </a>
        <p className="site-footer__tagline">{footer.tagline}</p>
        <nav aria-label="Footer">
          <ul>
            {nav.links.map((l) => (
              <li key={l.id}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#top">Back to top</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="site-footer__note">{footer.note}</p>
      <div className="site-footer__watermark">
        <span>Developed by <strong>Shaivika, IIT Technologies</strong></span>
      </div>
    </footer>
  );
}
