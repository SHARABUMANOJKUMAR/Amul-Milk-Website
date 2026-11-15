import { useCallback, useRef, useState } from 'react';
import { BrandMarquee, TextMarquee } from './components/BrandMarquee';
import { GoldReveal } from './components/GoldReveal';
import { HeroPourScene } from './components/HeroPourScene';
import { ProductDetails, ProductGrid } from './components/ProductGrid';
import { BrandIntroduction, EverydayMoments, FinalCta, SiteFooter } from './components/Sections';
import { SiteHeader } from './components/SiteHeader';
import { StorySection } from './components/story/StorySection';
import { productById, type ProductId } from './data/products';
import { MotionProvider } from './hooks/motion';

const decodeImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode().then(() => resolve(), () => resolve()) : resolve());
    img.onerror = () => resolve();
    img.src = src;
  });

function Page() {
  const [selected, setSelected] = useState<ProductId | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const request = useRef(0);
  const lastTrigger = useRef<ProductId | null>(null);

  const explore = useCallback((id: ProductId) => {
    const req = ++request.current;
    lastTrigger.current = id;
    setLoading(true);
    decodeImage(`${productById(id).image.base}-900.webp`).then(() => {
      if (req !== request.current) return;
      setSelected(id);
      setLoading(false);
      setFocusKey((k) => k + 1);
    });
  }, []);

  const close = useCallback(() => {
    request.current++;
    setSelected(null);
    setLoading(false);
    const id = lastTrigger.current;
    if (id) document.querySelector<HTMLButtonElement>(`#product-${id} .product-card__explore`)?.focus();
  }, []);

  return (
    <>
      <div id="top" />
      <SiteHeader />
      <main id="main">
        <HeroPourScene />
        <BrandMarquee />
        <BrandIntroduction />
        <ProductGrid selected={selected} onExplore={explore} />
        <ProductDetails product={selected ? productById(selected) : null} loading={loading} focusKey={focusKey} onClose={close} />
        <StorySection onExplore={explore} />
        <EverydayMoments />
        <TextMarquee />
        <GoldReveal onExplore={() => explore('gold')} />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <MotionProvider>
      <Page />
    </MotionProvider>
  );
}
