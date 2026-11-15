export type SceneId = 'dawn' | 'herd' | 'milking' | 'coop' | 'road' | 'dairy' | 'home';

export interface StoryScene {
  id: SceneId;
  label: string;
  headline: string[];
  fact?: { strong?: string; text: string };
  alt: string;
  cap: 'br' | 'tr' | 'tl' | 'bl';
  pan: [number, number];
  focusY: number;
  reaction?: boolean;
}

export const STORY_SOURCE = { label: 'Amul — Our Legacy', url: 'https://amul.com/our-legacy' };

export const storyCopy = {
  title: 'Where your pour begins.',
  eyebrow: 'A story in seven pours',
  introLine: ['One drop.', 'One long journey.'],
  introHint: 'Keep scrolling',
  skip: 'Skip story',
  staticIntro: 'Follow the milk from a village at dawn to the glass on your table.',
  homeCta: { label: 'Explore our milk', href: '#our-milk' },
};

export const scenes: StoryScene[] = [
  {
    id: 'dawn',
    label: 'Dawn',
    headline: ['Before sunrise,', 'a village wakes.'],
    fact: { strong: 'Anand, Gujarat.', text: 'Where farmers launched their own co-operative in 1946.' },
    alt: 'A village at dawn: the Amul girl waves good morning beside a thatched shed where cows and a buffalo are waking, and a rooster stands on a wall.',
    cap: 'br',
    pan: [0, 1],
    focusY: 0.5,
    reaction: true,
  },
  {
    id: 'herd',
    label: 'The herd',
    headline: ['First, breakfast', 'for the herd.'],
    fact: { text: 'Cows and buffaloes, out on the grass.' },
    alt: 'A sunny pasture: the Amul girl feeds fresh fodder to a calf while cows and a buffalo graze near the village.',
    cap: 'tr',
    pan: [0, 1],
    focusY: 0.6,
    reaction: true,
  },
  {
    id: 'milking',
    label: 'Milking',
    headline: ['Milked by the farmers', 'who own Amul.'],
    fact: { strong: '3.6 million', text: 'producer members. The world’s largest farmer-owned dairy co-operative.' },
    alt: 'In a cattle shed a farmer in a pink sari milks a cow into a steel pail while the Amul girl crouches beside her with a small pail.',
    cap: 'tr',
    pan: [1, 0.12],
    focusY: 0.6,
  },
  {
    id: 'coop',
    label: 'The co-operative',
    headline: ['Checked. Pooled.', 'Chilled.'],
    fact: { strong: '18,600', text: 'village dairy co-operatives. Every farmer is paid digitally.' },
    alt: 'Farmers queue with steel milk cans at the village dairy co-operative; a worker tests a sample while the Amul girl lifts her pail onto the counter.',
    cap: 'tl',
    pan: [0, 1],
    focusY: 0.55,
  },
  {
    id: 'road',
    label: 'On the road',
    headline: ['Off to the dairy.'],
    fact: { strong: '35 million litres', text: 'of milk procured every day.' },
    alt: 'A country road curves through green fields to a distant dairy plant; the Amul girl and a farmer wave from the roadside as the milk tanker drives away.',
    cap: 'br',
    pan: [0, 1],
    focusY: 0.5,
  },
  {
    id: 'dairy',
    label: 'The dairy',
    headline: ['Tested again.', 'Then packed.'],
    fact: { text: 'At the dairy the milk “goes through quality checks and is processed”.' },
    alt: 'Inside a spotless dairy the Amul girl, in her chef’s hat, gives a thumbs-up beside a conveyor carrying Amul milk packs while a worker checks a clipboard.',
    cap: 'br',
    pan: [1, 0.04],
    focusY: 0.55,
  },
  {
    id: 'home',
    label: 'Home',
    headline: ['…and poured', 'into your day.'],
    fact: { strong: '80%', text: 'of every rupee spent by consumers goes back to dairy farmers.' },
    alt: 'A family at the breakfast table reach out as the Amul girl carries in a tray of glasses of milk.',
    cap: 'br',
    pan: [1, 0],
    focusY: 0.6,
  },
];

export const TIMELINE = (() => {
  const poolStart = 0.06;
  const poolFull = 0.8;
  const introEnd = 0.9;
  const drainEnd = 1.35;
  const sceneLen = 0.85;
  const exitStart = drainEnd + scenes.length * sceneLen;
  const exitFull = exitStart + 0.42;
  const end = exitStart + 0.55;
  return { poolStart, poolFull, introEnd, drainEnd, sceneLen, exitStart, exitFull, end };
})();

export const sceneStart = (i: number) => TIMELINE.drainEnd + i * TIMELINE.sceneLen;

export const sceneArt = (id: SceneId) => `/assets/story/${id}`;
