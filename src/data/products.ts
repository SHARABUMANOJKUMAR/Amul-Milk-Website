export type ProductId = 'taaza' | 'gold' | 'calci-plus' | 'lactose-free';

export interface ProductFact {
  label: string;
  value: string;
}

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  size: string;
  category: string;
  description: string;
  packColour: string;
  swatches: string[];
  facts: ProductFact[];
  note?: string;
  image: { base: string; width: number; height: number; alt: string };
  relativeHeight: number;
  accent: string;
  source: { label: string; url: string };
}

export const products: Product[] = [
  {
    id: 'taaza',
    name: 'Amul Taaza',
    shortName: 'Taaza',
    size: '1 L',
    category: 'Homogenised toned milk · UHT',
    description:
      'Amul’s homogenised toned milk, UHT treated and packed in a 1 L carton for everyday pouring.',
    packColour: 'Blue and white',
    swatches: ['#1E8FD8', '#FFFFFF', '#E51B23'],
    facts: [
      { label: 'Fat', value: '3.0% minimum' },
      { label: 'SNF', value: '8.5% minimum' },
      { label: 'Protein', value: '3.0 g per 100 mL' },
      { label: 'Calcium', value: '110 mg per 100 mL' },
      { label: 'Ingredients', value: 'Toned milk' },
      { label: 'After opening', value: 'Refrigerate and use within 2 days' },
    ],
    note: 'Values are approximate, per the official product page.',
    image: {
      base: '/assets/products/taaza',
      width: 475,
      height: 900,
      alt: 'Amul Taaza 1 litre carton — blue and white pack with the Amul girl holding a tray of milk glasses',
    },
    relativeHeight: 1,
    accent: '#DCEFFB',
    source: {
      label: 'Dudhsagar Dairy — Amul Taaza UHT Milk',
      url: 'https://dudhsagardairy.coop/dairy/products/amul-taaza-uht-milk/',
    },
  },
  {
    id: 'gold',
    name: 'Amul Gold',
    shortName: 'Gold',
    size: '1 L',
    category: 'Homogenised standardised milk · UHT',
    description:
      'Amul’s homogenised standardised milk, UHT treated, in the red-and-white 1 L carton.',
    packColour: 'White, red and yellow',
    swatches: ['#FFFFFF', '#E51B23', '#F6B21A'],
    facts: [
      { label: 'Fat', value: '4.5% minimum' },
      { label: 'SNF', value: '8.5% minimum' },
      { label: 'Protein', value: '3.0 g per 100 mL' },
      { label: 'Calcium', value: '120 mg per 100 mL' },
      { label: 'Ingredients', value: 'Standardised milk' },
      { label: 'After opening', value: 'Refrigerate and use within 2 days' },
    ],
    note: 'Values are approximate, per the official product page.',
    image: {
      base: '/assets/products/gold',
      width: 476,
      height: 900,
      alt: 'Amul Gold 1 litre carton — white front with red border, yellow side panel and the Amul girl in a chef’s hat',
    },
    relativeHeight: 1,
    accent: '#FFF1C9',
    source: {
      label: 'Dudhsagar Dairy — Amul Gold UHT Milk',
      url: 'https://dudhsagardairy.coop/dairy/products/amul-gold-uht-milk/',
    },
  },
  {
    id: 'calci-plus',
    name: 'Amul Calci+',
    shortName: 'Calci+',
    size: '1 L',
    category: 'High calcium homogenised double toned milk',
    description:
      'Amul Calci+ Milk, “specially crafted with calcium” — a double toned milk in a capped 1 L pack.',
    packColour: 'White and blue, white screw cap',
    swatches: ['#FFFFFF', '#1AA6DF', '#1736A8'],
    facts: [
      { label: 'Fat', value: '1.5% minimum' },
      { label: 'SNF', value: '12.0% minimum' },
      { label: 'Protein', value: '11.25 g per 250 mL' },
      { label: 'Calcium', value: '520 mg per 250 mL' },
      { label: 'Storage', value: 'No refrigeration needed until opened' },
      { label: 'After opening', value: 'Refrigerate and use within 2 days' },
    ],
    image: {
      base: '/assets/products/calci-plus',
      width: 427,
      height: 900,
      alt: 'Amul Calci+ Milk 1 litre capped pack — white with large blue CALCI+ MILK lettering and a woman jumping',
    },
    relativeHeight: 1.12,
    accent: '#DDF5EE',
    source: {
      label: 'Amul Shop — Amul Calci+ Milk, 1 L',
      url: 'https://shop.amul.com/en/product/amul-calci-milk-1-l-or-pack-of-12',
    },
  },
  {
    id: 'lactose-free',
    name: 'Amul Lactose Free Milk',
    shortName: 'Lactose Free',
    size: '250 mL',
    category: 'Lactose free milk',
    description:
      'With less than 0.1% lactose, designed especially for people who are lactose intolerant. Ready to drink — shake well before use.',
    packColour: 'Deep blue, white screw cap',
    swatches: ['#1F49B6', '#FFFFFF'],
    facts: [
      { label: 'Lactose', value: 'Less than 0.1%' },
      { label: 'Ingredients', value: 'Toned milk, enzyme (beta galactosidase)' },
      { label: 'Allergen', value: 'Contains milk' },
      { label: 'Serve', value: 'Ready to drink. Shake well before use.' },
    ],
    image: {
      base: '/assets/products/lactose-free',
      width: 386,
      height: 900,
      alt: 'Amul Lactose Free Milk 250 millilitre capped pack in deep blue with white LACTOSE FREE lettering',
    },
    relativeHeight: 0.7,
    accent: '#E3E9FB',
    source: {
      label: 'Amul Shop — Amul Lactose Free Milk, 250 mL',
      url: 'https://shop.amul.com/en/product/amul-lactose-free-milk-250-ml-or-pack-of-32',
    },
  },
];

export const productById = (id: ProductId) => products.find((p) => p.id === id)!;

export const productSrcSet = (base: string) => `${base}-480.webp 1x, ${base}-900.webp 2x`;
