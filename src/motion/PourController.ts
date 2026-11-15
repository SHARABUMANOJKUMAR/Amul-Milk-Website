import { POUR, WIPE } from './sceneConfig';

export type PourStatus = 'poster' | 'playing' | 'paused' | 'finished';
export type WipeKind = 'intro' | 'loop' | 'replay';

export interface PourSnapshot {
  status: PourStatus;
  cycle: number;
}

export class PourController {
  t = 0;
  cycle = 0;
  wipe: number | null = null;
  wipeKind: WipeKind | null = null;
  posterVisible = true;
  status: PourStatus = 'poster';
  private holds = new Set<string>();
  private listeners = new Set<(s: PourSnapshot) => void>();
  private resetApplied = false;

  get running() {
    return this.status === 'playing' && this.holds.size === 0;
  }

  onChange(fn: (s: PourSnapshot) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    const snap = { status: this.status, cycle: this.cycle };
    for (const fn of this.listeners) fn(snap);
  }

  setHold(reason: string, on: boolean) {
    if (on) this.holds.add(reason);
    else this.holds.delete(reason);
  }

  start() {
    if (this.status !== 'poster') return;
    this.beginWipe('intro');
    this.status = 'playing';
    this.emit();
  }

  pause() {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    this.emit();
  }

  play() {
    if (this.status === 'poster') return this.start();
    if (this.status === 'finished') return this.replay();
    if (this.status !== 'paused') return;
    this.status = 'playing';
    this.emit();
  }

  replay() {
    this.cycle = 0;
    this.status = 'playing';
    this.beginWipe('replay');
    this.emit();
  }

  private beginWipe(kind: WipeKind) {
    this.wipe = 0;
    this.wipeKind = kind;
    this.resetApplied = false;
  }

  tick(dt: number): boolean {
    if (!this.running) return false;
    if (this.wipe !== null) {
      this.wipe += dt;
      if (!this.resetApplied && this.wipe >= WIPE.duration / 2) {
        this.resetApplied = true;
        this.posterVisible = false;
        if (this.wipeKind === 'loop') this.cycle += 1;
        this.t = 0;
      }
      if (this.wipe >= WIPE.duration) {
        this.wipe = null;
        this.wipeKind = null;
      }
      return true;
    }
    this.t += dt;
    if (this.t >= POUR.wipeStart) {
      if (this.cycle < POUR.cycles - 1) {
        this.t = POUR.wipeStart;
        this.beginWipe('loop');
      } else {
        this.t = POUR.wipeStart;
        this.status = 'finished';
        this.emit();
      }
    }
    return true;
  }

  get wipeProgress(): number | null {
    return this.wipe === null ? null : Math.min(1, this.wipe / WIPE.duration);
  }
}
