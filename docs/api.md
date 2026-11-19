# API & Data Architecture Documentation

## Overview
The Amul Milk Website is a high-performance, client-side interactive application built with **React 19**, **TypeScript**, and **Vite**. The application operates statically without requiring external backend servers or REST/GraphQL endpoints.

---

## Static Asset System (`public/assets/`)

All image assets have been generated and optimized in modern WebP and SVG formats across responsive break-points:

### 1. Brand Assets (`public/assets/brand/`)
- `amul-logo.svg`: Official Amul vector wordmark with "The Taste of India" tagline.

### 2. Everyday Moments (`public/assets/moments/`)
- `breakfast-720.webp`, `breakfast-1200.webp`: Morning sunlight breakfast scene with milk glass, cereal, and napkin.
- `coffee-720.webp`, `coffee-1200.webp`: Coffee cup with leaf latte art and milk pitcher.
- `dessert-720.webp`, `dessert-1200.webp`: Traditional bowl of saffron kheer with pistachios.

### 3. Hero Scene Assets (`public/assets/hero/`)
- `bg-960.webp`, `bg-1672.webp`: Warm countertop background.
- `poster-960.webp`, `poster-1672.webp`: Initial load poster.
- `poster-fg-960.webp`, `poster-fg-1672.webp`: Foreground overlay.
- `carton-hand-800.webp`, `carton-hand-1448.webp`: Tilting milk carton.
- `glass-hand-800.webp`, `glass-hand-1448.webp`: Drinking glass.
- `glass-sheen-800.webp`, `glass-sheen-1448.webp`: Specular reflection.
- `glass-front-800.webp`, `glass-front-1448.webp`: Front rim gleam.

### 4. Product Packaging (`public/assets/products/`)
- `taaza-480.webp`, `taaza-900.webp`: Amul Taaza 1 L pack.
- `gold-480.webp`, `gold-900.webp`: Amul Gold 1 L pack.
- `calci-plus-480.webp`, `calci-plus-900.webp`: Amul Calci+ 1 L pack.
- `lactose-free-480.webp`, `lactose-free-900.webp`: Amul Lactose Free 1 L pack.

### 5. Story Scenes (`public/assets/story/`)
- `dawn-960.webp`, `dawn-1920.webp`: Anand village sunrise.
- `herd-960.webp`, `herd-1920.webp`: Cattle grazing in green pasture.
- `milking-960.webp`, `milking-1920.webp`: Fresh morning milking.
- `coop-960.webp`, `coop-1920.webp`: Village cooperative collection.
- `road-960.webp`, `road-1920.webp`: Cold-chain milk tanker on road.
- `dairy-960.webp`, `dairy-1920.webp`: Processing and automated packaging plant.
- `home-960.webp`, `home-1920.webp`: Breakfast table with glasses of milk.

### 6. Special FX & Reveal (`public/assets/fx/` & `public/assets/gold/`)
- `fx/milk-drip-edge-1600.webp`: Wavy dripping milk transition edge.
- `gold/poster-720.webp`, `gold/poster-1086.webp`: Gold reveal showcase backdrop.
