import geometry from './scene-geometry.json';

export const GEOMETRY = geometry;

export const POUR = {
  duration: 7,
  settleEnd: 0.6,
  threadStart: 0.6,
  threadEnd: 1.1,
  sustainEnd: 4.3,
  narrowEnd: 4.9,
  breakAt: 4.62,
  dropsEnd: 5.5,
  holdEnd: 6.3,
  wipeStart: 6.3,
  wipeEnd: 7.0,
  cycles: 3,
  restAngle: -7,
  returnAngle: -4,
  maxFill: 0.56,
} as const;

export const WIPE = { duration: 0.7 } as const;

export const RIBBON = {
  speed: 42,
  maxDrips: 5,
  dripEvery: [0.9, 2.1] as [number, number],
};

export interface LayoutPreset {
  name: 'wide' | 'medium' | 'portrait';
  ref: [number, number];
  carton: { scale: number; rot: number; open: [number, number] };
  glass: { scale: number; rim: [number, number] };
  ribbon: [number, number][];
  ribbonWidth: number;
}

export const LAYOUTS: LayoutPreset[] = [
  {
    name: 'wide',
    ref: [1672, 880],
    carton: { scale: 0.64, rot: 8, open: [0.618, 0.36] },
    glass: { scale: 0.56, rim: [0.664, 0.585] },
    ribbon: [
      [-0.08, 0.5],
      [0.1, 0.6],
      [0.27, 0.66],
      [0.45, 0.56],
      [0.6, 0.47],
      [0.74, 0.41],
      [0.9, 0.5],
      [1.08, 0.6],
    ],
    ribbonWidth: 0.085,
  },
  {
    name: 'medium',
    ref: [1000, 760],
    carton: { scale: 0.46, rot: 12, open: [0.6, 0.36] },
    glass: { scale: 0.44, rim: [0.67, 0.6] },
    ribbon: [
      [-0.1, 0.5],
      [0.12, 0.62],
      [0.33, 0.64],
      [0.52, 0.54],
      [0.68, 0.49],
      [0.84, 0.47],
      [1.1, 0.58],
    ],
    ribbonWidth: 0.075,
  },
  {
    name: 'portrait',
    ref: [390, 700],
    carton: { scale: 0.3, rot: 19, open: [0.6, 0.355] },
    glass: { scale: 0.33, rim: [0.64, 0.6] },
    ribbon: [
      [-0.15, 0.47],
      [0.12, 0.56],
      [0.4, 0.55],
      [0.62, 0.46],
      [0.85, 0.42],
      [1.15, 0.5],
    ],
    ribbonWidth: 0.078,
  },
];

export const pickLayout = (w: number, h: number): LayoutPreset => {
  const aspect = w / h;
  if (aspect >= 1.55) return LAYOUTS[0];
  if (aspect >= 0.95) return LAYOUTS[1];
  return LAYOUTS[2];
};
