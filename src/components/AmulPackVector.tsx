import type { Product } from '../data/products';

interface Props {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

export function AmulPackVector({ product, className = '', style }: Props) {
  const { id } = product;

  // Visual Theme configuration per product variant
  const themes: Record<string, { topColor: string; bottomColor: string; accentColor: string; subhead: string }> = {
    taaza: {
      topColor: '#1E8FD8',
      bottomColor: '#1268A0',
      accentColor: '#E51B23',
      subhead: 'HOMOGENISED TONED MILK',
    },
    gold: {
      topColor: '#E51B23',
      bottomColor: '#991B1B',
      accentColor: '#F5C82A',
      subhead: 'FULL CREAM · RICH MILK',
    },
    'calci-plus': {
      topColor: '#16A34A',
      bottomColor: '#166534',
      accentColor: '#0284C7',
      subhead: 'ENRICHED WITH CALCIUM',
    },
    'lactose-free': {
      topColor: '#7C3AED',
      bottomColor: '#5B21B6',
      accentColor: '#F59E0B',
      subhead: 'EASY TO DIGEST · ZERO LACTOSE',
    },
  };

  const theme = themes[id] || themes.taaza;

  return (
    <svg
      className={`amul-pack-svg ${className}`}
      viewBox="0 0 240 450"
      width="100%"
      height="100%"
      style={{ overflow: 'visible', filter: 'drop-shadow(0 12px 18px rgba(23, 23, 23, 0.16))', ...style }}
      aria-label={product.name}
    >
      <defs>
        {/* Isometric 3D Carton Shading */}
        <linearGradient id={`pack-side-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D4D4D8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A1A1AA" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`pack-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.topColor} />
          <stop offset="42%" stopColor={theme.topColor} />
          <stop offset="42.5%" stopColor="#FFFFFF" />
          <stop offset="84%" stopColor="#FFFFFF" />
          <stop offset="84.5%" stopColor={theme.bottomColor} />
          <stop offset="100%" stopColor={theme.bottomColor} />
        </linearGradient>
        <linearGradient id={`top-crease-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.topColor} />
          <stop offset="100%" stopColor={theme.bottomColor} />
        </linearGradient>
      </defs>

      {/* 3D Slanted Gable Top */}
      <polygon points="36,40 180,40 216,14 72,14" fill={`url(#top-crease-${id})`} />
      {/* Gable Roof Right Side */}
      <polygon points="180,40 216,14 216,56 180,82" fill="#9CA3AF" />

      {/* Main Front Face */}
      <rect x="36" y="40" width="144" height="376" rx="4" fill={`url(#pack-grad-${id})`} />

      {/* 3D Right Side Depth */}
      <polygon points="180,40 216,56 216,400 180,416" fill={`url(#pack-side-${id})`} />

      {/* Spout Cap on the Top Right */}
      <ellipse cx="146" cy="40" rx="14" ry="7" fill={theme.accentColor} stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="138" y="30" width="16" height="6" rx="2" fill={theme.accentColor} />

      {/* Brand & Variant Front Content */}
      <g>
        {/* Red Amul Wordmark */}
        <text x="108" y="78" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="32" fill="#FFFFFF" letterSpacing="1">
          Amul
        </text>
        <text x="108" y="94" textAnchor="middle" fontFamily="system-ui" fontSize="7" fontWeight="700" fill="#FFFFFF" opacity="0.9" letterSpacing="0.8">
          THE TASTE OF INDIA
        </text>

        {/* Product Variant Name */}
        <text x="108" y="160" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="28" fill={theme.topColor} letterSpacing="0.5">
          {product.shortName.toUpperCase()}
        </text>

        {/* Subhead descriptor */}
        <text x="108" y="184" textAnchor="middle" fontFamily="system-ui" fontSize="7.5" fontWeight="700" fill="#4B5563" letterSpacing="0.4">
          {theme.subhead}
        </text>

        {/* Decorative Milk Pitcher / Glass Icon */}
        <path d="M102 210 L114 210 L112 242 C112 245 104 245 104 242 Z" fill={theme.topColor} opacity="0.85" />
        <ellipse cx="108" cy="210" rx="6" ry="2" fill="#FFFFFF" />

        {/* Nutrition Highlight */}
        <rect x="52" y="260" width="112" height="42" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <text x="108" y="278" textAnchor="middle" fontFamily="system-ui" fontSize="8" fontWeight="700" fill="#1F2937">
          {product.facts[0]?.label || 'FAT'}: {product.facts[0]?.value || '3.0%'}
        </text>
        <text x="108" y="294" textAnchor="middle" fontFamily="system-ui" fontSize="7.5" fill="#6B7280">
          {product.facts[1]?.label || 'SNF'}: {product.facts[1]?.value || '8.5%'}
        </text>

        {/* Size Badge Bottom */}
        <text x="108" y="380" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="22" fill="#FFFFFF">
          {product.size}
        </text>
      </g>
    </svg>
  );
}
