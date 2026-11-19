import { useEffect, useRef, useState } from 'react';
import { products, productSrcSet, type Product, type ProductId } from '../data/products';
import { productSection } from '../data/siteContent';
import { useRevealOnce } from '../hooks/motion';
import { AmulGirl } from './AmulGirl';
import { AmulPackVector } from './AmulPackVector';

interface GridProps {
  selected: ProductId | null;
  onExplore: (id: ProductId) => void;
}

function ProductCard({
  product,
  index,
  expanded,
  onExplore,
  onPoint,
}: {
  product: Product;
  index: number;
  expanded: boolean;
  onExplore: () => void;
  onPoint: (index: number) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const h = `calc(var(--pack-h) * ${product.relativeHeight})`;
  return (
    <li
      id={`product-${product.id}`}
      className="product-card"
      style={{ ['--i' as string]: index }}
      onPointerEnter={() => onPoint(index)}
      onFocus={() => onPoint(index)}
    >
      <div className="product-card__reveal">
        <div className="product-card__lift">
          {imgFailed ? (
            <AmulPackVector product={product} style={{ height: h }} />
          ) : (
            <img
              className="product-card__img"
              src={`${product.image.base}-480.webp`}
              srcSet={productSrcSet(product.image.base)}
              width={product.image.width}
              height={product.image.height}
              style={{ height: h }}
              alt={product.image.alt}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
      </div>
      <div className="product-card__shadow" aria-hidden="true" />
      <h3 className="product-card__name">
        {product.name} <span className="size-chip">{product.size}</span>
      </h3>
      <button
        type="button"
        className="product-card__explore"
        aria-expanded={expanded}
        aria-controls="product-details"
        onClick={onExplore}
      >
        Explore <span className="visually-hidden">{product.name}</span>
        <span aria-hidden="true">{product.shortName}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </li>
  );
}

export function ProductGrid({ selected, onExplore }: GridProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const shown = useRevealOnce(listRef, 0.15);
  const [pointed, setPointed] = useState(1);
  return (
    <section id="our-milk" className="products" aria-labelledby="products-title">
      <h2 id="products-title" className="section-title section-title--sentence">
        {productSection.heading}
      </h2>
      <ul ref={listRef} className={`product-row${shown ? ' is-revealed' : ''}`}>
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} expanded={selected === p.id} onExplore={() => onExplore(p.id)} onPoint={setPointed} />
        ))}
        <li className="shelf-girl" style={{ left: `${Math.max(1, pointed) * 25}%` }} aria-hidden="true">
          <AmulGirl pose="point" flip={pointed === 0} />
        </li>
      </ul>
    </section>
  );
}

interface DetailsProps {
  product: Product | null;
  loading: boolean;
  focusKey: number;
  onClose: () => void;
}

export function ProductDetails({ product, loading, focusKey, onClose }: DetailsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product || !focusKey) return;
    const region = regionRef.current;
    if (region) {
      const r = region.getBoundingClientRect();
      const reduce = document.documentElement.dataset.motion === 'off';
      if (r.top < 70 || r.bottom > window.innerHeight) region.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [focusKey, product]);

  return (
    <div
      id="product-details"
      ref={regionRef}
      className={`details${product ? ' is-open' : ''}`}
      role="region"
      aria-label={product ? `${product.name} details` : 'Product details'}
      aria-busy={loading}
    >
      {product && (
        <div className="details__inner" key={product.id} style={{ ['--accent' as string]: product.accent }}>
          <div className="details__media">
            <AmulPackVector product={product} style={{ height: `calc(var(--details-pack-h) * ${product.relativeHeight})` }} />
          </div>
          <div className="details__body">
            <p className="details__eyebrow">{product.category}</p>
            <h3 ref={headingRef} tabIndex={-1} className="details__title">
              {product.name}
            </h3>
            <dl className="details__meta">
              <div>
                <dt>Pack size</dt>
                <dd>{product.size}</dd>
              </div>
              <div>
                <dt>Pack colour</dt>
                <dd>
                  <span className="swatches" aria-hidden="true">
                    {product.swatches.map((c) => (
                      <span key={c} className="swatch" style={{ background: c }} />
                    ))}
                  </span>
                  {product.packColour}
                </dd>
              </div>
            </dl>
            <p className="details__desc">{product.description}</p>
            <dl className="details__facts">
              {product.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            {product.note && <p className="details__note">{product.note}</p>}
            <p className="details__source">
              Source:{' '}
              <a href={product.source.url} target="_blank" rel="noopener noreferrer">
                {product.source.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
            <button type="button" className="btn btn--ghost details__close" onClick={onClose}>
              Close details
            </button>
          </div>
        </div>
      )}
      {!product && <p className="visually-hidden">{productSection.detailsEmpty}</p>}
    </div>
  );
}
