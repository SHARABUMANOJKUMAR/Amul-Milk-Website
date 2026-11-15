import { useEffect, useRef, useState } from 'react';
import { nav } from '../data/siteContent';
import { MotionToggle } from './MotionControls';

export function AmulLogo({ className = '' }: { className?: string }) {
  return <img className={`amul-logo ${className}`} src="/assets/brand/amul-logo.svg" width={91} height={36} alt="Amul" />;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 860px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const [ourMilk, moments, explore] = nav.links;

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="site-nav" aria-label="Main">
        <div className="site-nav__side site-nav__side--left">
          <button
            ref={buttonRef}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-btn__bars" aria-hidden="true" />
            <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
          <a className="nav-pill" href={ourMilk.href}>
            {ourMilk.label}
          </a>
          <a className="nav-link" href={moments.href}>
            {moments.label}
          </a>
        </div>
        <a className="site-nav__logo" href="#top" aria-label={nav.logoLabel}>
          <AmulLogo />
        </a>
        <div className="site-nav__side site-nav__side--right">
          <a className="nav-link" href={explore.href}>
            {explore.label}
          </a>
          <MotionToggle />
        </div>
      </nav>
      <div id="mobile-menu" ref={panelRef} className="mobile-menu" hidden={!open}>
        <ul>
          {nav.links.map((l) => (
            <li key={l.id}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <MotionToggle wide />
      </div>
    </header>
  );
}
