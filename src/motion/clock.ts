export type Tick = (dt: number, now: number) => void;

export class SceneClock {
  private subs = new Set<Tick>();
  private raf = 0;
  private last = 0;
  private hidden = false;
  private attached = 0;
  private inFrame = false;

  private onVisibility = () => {
    this.hidden = document.hidden;
    if (this.hidden) this.stop();
    else this.ensure();
  };

  attach() {
    if (this.attached++ === 0) {
      this.hidden = document.hidden;
      document.addEventListener('visibilitychange', this.onVisibility);
    }
    this.ensure();
  }

  detach() {
    if (--this.attached <= 0) {
      this.attached = 0;
      document.removeEventListener('visibilitychange', this.onVisibility);
      this.stop();
    }
  }

  subscribe(fn: Tick): () => void {
    this.subs.add(fn);
    this.ensure();
    return () => {
      this.subs.delete(fn);
      if (!this.subs.size) this.stop();
    };
  }

  private ensure() {
    if (this.raf || this.inFrame || this.hidden || !this.subs.size) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.raf = 0;
    this.inFrame = true;
    for (const fn of [...this.subs]) {
      try {
        fn(dt, now);
      } catch (err) {
        console.warn('[clock] subscriber failed', err);
      }
    }
    this.inFrame = false;
    if (!this.hidden && this.subs.size) this.raf = requestAnimationFrame(this.frame);
  };
}
