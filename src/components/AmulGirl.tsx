import { useRef, type CSSProperties } from 'react';
import manifest from '../data/girl-manifest.json';
import { useInView, useMotion } from '../hooks/motion';

export type GirlPose = 'peek' | 'sit' | 'point' | 'chef' | 'wave' | 'tray';

interface Props {
  pose: GirlPose;
  className?: string;
  playing?: boolean;
  flip?: boolean;
  style?: CSSProperties;
}

const info = manifest as Record<GirlPose, { w: number; h: number; loop: boolean; hd?: boolean }>;

/* Shared Amul Girl styles and animation keyframes */
const AMUL_GIRL_STYLES = `
  .amul-anim-root {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .amul-anim-root.is-paused * {
    animation-play-state: paused !important;
  }

  /* Blinking Eyes (Natural interval) */
  @keyframes amulBlink {
    0%, 92%, 96%, 100% { transform: scaleY(1); }
    94% { transform: scaleY(0.05); }
  }
  .amul-blink {
    transform-origin: 50% 50%;
    animation: amulBlink 3.6s infinite ease-in-out;
  }

  /* Ponytail physics */
  @keyframes amulPonytailSwish {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(9deg); }
  }
  .amul-ponytail {
    transform-origin: 30% 90%;
    animation: amulPonytailSwish 1.8s infinite ease-in-out;
  }

  /* Ribbon flutter */
  @keyframes amulRibbonFlutter {
    0%, 100% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(-6deg) scale(1.05); }
  }
  .amul-ribbon {
    transform-origin: 50% 50%;
    animation: amulRibbonFlutter 1.6s infinite ease-in-out;
  }

  /* Pose: Peek (Bobbing and looking) */
  @keyframes amulPeekBob {
    0%, 100% { transform: translateY(0); }
    35% { transform: translateY(-14px); }
    60% { transform: translateY(-11px) rotate(2deg); }
    85% { transform: translateY(-3px) rotate(-1deg); }
  }
  @keyframes amulPeekEyesLook {
    0%, 100% { transform: translateX(0); }
    30%, 70% { transform: translateX(5px); }
  }
  .amul-peek-body {
    animation: amulPeekBob 3.2s infinite ease-in-out;
  }
  .amul-peek-pupils {
    animation: amulPeekEyesLook 3.2s infinite ease-in-out;
  }

  /* Pose: Sit (Swinging legs & sipping) */
  @keyframes amulLegSwingL {
    0%, 100% { transform: rotate(-22deg); }
    50% { transform: rotate(18deg); }
  }
  @keyframes amulLegSwingR {
    0%, 100% { transform: rotate(16deg); }
    50% { transform: rotate(-20deg); }
  }
  @keyframes amulSitSway {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(2.5deg); }
  }
  @keyframes amulSip {
    0%, 65%, 100% { transform: translateY(0) rotate(0deg); }
    25%, 45% { transform: translateY(-6px) rotate(-3deg); }
  }
  .amul-leg-l {
    transform-origin: 50% 0%;
    animation: amulLegSwingL 1.6s infinite ease-in-out;
  }
  .amul-leg-r {
    transform-origin: 50% 0%;
    animation: amulLegSwingR 1.6s infinite ease-in-out;
  }
  .amul-sit-body {
    transform-origin: 50% 90%;
    animation: amulSitSway 2.4s infinite ease-in-out;
  }
  .amul-sip-glass {
    transform-origin: 50% 80%;
    animation: amulSip 2.8s infinite ease-in-out;
  }

  /* Pose: Point (Arm pulse and energetic bounce) */
  @keyframes amulPointPulse {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(8px, -2px) rotate(4deg); }
  }
  @keyframes amulPointBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-9px); }
  }
  .amul-point-arm {
    transform-origin: 15% 45%;
    animation: amulPointPulse 1.1s infinite ease-in-out;
  }
  .amul-point-body {
    animation: amulPointBounce 1.1s infinite cubic-bezier(0.28, 0.84, 0.42, 1);
  }

  /* Pose: Chef (Whisking and floating sparkles) */
  @keyframes amulWhiskStir {
    0% { transform: rotate(0deg) translate(0, 0); }
    25% { transform: rotate(14deg) translate(5px, -3px); }
    50% { transform: rotate(0deg) translate(2px, 4px); }
    75% { transform: rotate(-14deg) translate(-4px, 1px); }
    100% { transform: rotate(0deg) translate(0, 0); }
  }
  @keyframes amulHatJiggle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    35% { transform: rotate(3deg) scale(1.03, 0.98); }
    70% { transform: rotate(-2.5deg) scale(0.98, 1.03); }
  }
  @keyframes amulSparkleRise1 {
    0% { opacity: 0; transform: translate(0, 0) scale(0.3); }
    40% { opacity: 0.9; transform: translate(6px, -18px) scale(1.1); }
    100% { opacity: 0; transform: translate(12px, -38px) scale(0.4); }
  }
  @keyframes amulSparkleRise2 {
    0% { opacity: 0; transform: translate(0, 0) scale(0.2); }
    50% { opacity: 1; transform: translate(-8px, -22px) scale(1); }
    100% { opacity: 0; transform: translate(-14px, -44px) scale(0.3); }
  }
  .amul-chef-arm {
    transform-origin: 30% 30%;
    animation: amulWhiskStir 1.2s infinite linear;
  }
  .amul-chef-hat {
    transform-origin: 50% 100%;
    animation: amulHatJiggle 1.8s infinite ease-in-out;
  }
  .amul-sparkle-1 {
    animation: amulSparkleRise1 1.9s infinite ease-out;
  }
  .amul-sparkle-2 {
    animation: amulSparkleRise2 2.3s infinite ease-out 0.8s;
  }

  /* Pose: Wave (Friendly waving arm and body sway) */
  @keyframes amulWaveHand {
    0%, 100% { transform: rotate(-24deg); }
    50% { transform: rotate(26deg); }
  }
  @keyframes amulWaveBody {
    0%, 100% { transform: rotate(-1.5deg) translateY(0); }
    50% { transform: rotate(1.5deg) translateY(-4px); }
  }
  .amul-wave-arm {
    transform-origin: 20% 85%;
    animation: amulWaveHand 0.9s infinite ease-in-out;
  }
  .amul-wave-body {
    transform-origin: 50% 100%;
    animation: amulWaveBody 1.8s infinite ease-in-out;
  }

  /* Pose: Tray (Tray balancing and walking cadence) */
  @keyframes amulTrayBal {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-7px) rotate(1.8deg); }
  }
  .amul-tray-group {
    animation: amulTrayBal 1.5s infinite ease-in-out;
  }
`;

export function AmulGirl({ pose, className = '', playing = true, flip = false, style }: Props) {
  const { motionOn } = useMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, '120px');
  const { w, h, loop } = info[pose];
  const animate = loop && motionOn && inView && playing;

  return (
    <span
      ref={ref}
      className={`girl girl--${pose}${flip ? ' is-flipped' : ''} ${className}`}
      style={{ aspectRatio: `${w} / ${h}`, ...style }}
      aria-hidden="true"
    >
      <svg
        className={`amul-anim-root ${animate ? 'is-animating' : 'is-paused'}`}
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height="100%"
      >
        <defs>
          <style>{AMUL_GIRL_STYLES}</style>
          {/* Radial cheek blush gradient */}
          <radialGradient id="amulBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B8B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF6B8B" stopOpacity="0" />
          </radialGradient>
          {/* Polka Dot Pattern */}
          <pattern id="amulPolka" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#E51B23" />
            <circle cx="4" cy="4" r="2.2" fill="#FFFFFF" />
            <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
          </pattern>
        </defs>

        {pose === 'peek' && <PeekPose />}
        {pose === 'sit' && <SitPose />}
        {pose === 'point' && <PointPose />}
        {pose === 'chef' && <ChefPose />}
        {pose === 'wave' && <WavePose />}
        {pose === 'tray' && <TrayPose />}
      </svg>
    </span>
  );
}

/* ---------------------------------------------------- */
/* POSE 1: PEEK (w: 225, h: 280)                        */
/* Peeking over the ledge, looking around with eyes     */
/* ---------------------------------------------------- */
function PeekPose() {
  return (
    <g className="amul-peek-body">
      {/* High Ponytail */}
      <g className="amul-ponytail">
        <path d="M72 75 C45 35 70 12 105 18 C115 32 108 55 90 70 Z" fill="#1A237E" />
        <path d="M82 62 C70 42 85 28 102 32" stroke="#283593" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Ribbon */}
      <g className="amul-ribbon">
        <path d="M82 72 C74 65 65 68 70 76 C74 82 82 78 86 74 Z" fill="#E51B23" />
        <path d="M92 70 C100 64 108 68 104 76 C100 81 92 77 88 73 Z" fill="#E51B23" />
        <circle cx="89" cy="73" r="4.5" fill="#C62828" />
      </g>

      {/* Head & Hair base */}
      <path d="M68 122 C65 85 88 64 125 64 C162 64 185 85 182 122 C180 135 174 146 166 154 L166 160 C148 178 102 178 84 160 L84 154 C76 146 70 135 68 122 Z" fill="#FED7AA" />
      {/* Dark blue hair contour */}
      <path d="M72 120 C68 86 92 62 126 62 C160 62 182 86 178 120 C168 105 152 98 126 98 C100 98 84 105 72 120 Z" fill="#1A237E" />
      {/* Cute side bangs */}
      <path d="M72 110 C80 102 96 102 108 112 C96 116 84 116 72 110 Z" fill="#1A237E" />
      <path d="M178 110 C170 102 154 102 142 112 C154 116 166 116 178 110 Z" fill="#1A237E" />

      {/* Rosy Cheeks */}
      <circle cx="92" cy="144" r="14" fill="url(#amulBlush)" />
      <circle cx="158" cy="144" r="14" fill="url(#amulBlush)" />

      {/* Expressive Eyes */}
      <g className="amul-blink">
        {/* Sclera */}
        <ellipse cx="102" cy="132" rx="10" ry="12" fill="#FFFFFF" />
        <ellipse cx="148" cy="132" rx="10" ry="12" fill="#FFFFFF" />
        {/* Pupils (animated glance) */}
        <g className="amul-peek-pupils">
          <ellipse cx="103" cy="132" rx="6" ry="7.5" fill="#171717" />
          <circle cx="105" cy="130" r="2.2" fill="#FFFFFF" />
          <ellipse cx="149" cy="132" rx="6" ry="7.5" fill="#171717" />
          <circle cx="151" cy="130" r="2.2" fill="#FFFFFF" />
        </g>
        {/* Eyelashes */}
        <path d="M92 124 C97 120 107 120 112 124" stroke="#171717" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M91 122 L86 117" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
        <path d="M138 124 C143 120 153 120 158 124" stroke="#171717" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M159 122 L164 117" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Button Nose & Sweet Smile */}
      <circle cx="125" cy="142" r="2.5" fill="#F97316" opacity="0.6" />
      <path d="M115 152 C120 160 130 160 135 152" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="round" fill="#F87171" />

      {/* Dress shoulders & white collar peeking */}
      <path d="M82 178 C95 168 155 168 168 178 L180 230 L70 230 Z" fill="url(#amulPolka)" />
      <path d="M102 172 C114 184 136 184 148 172 C138 176 112 176 102 172 Z" fill="#FFFFFF" />

      {/* Little hands gripping the counter/ledge */}
      <g>
        {/* Left hand */}
        <rect x="74" y="214" width="28" height="18" rx="8" fill="#FED7AA" stroke="#FDBA74" strokeWidth="1.5" />
        <path d="M83 214 L83 226 M91 214 L91 226" stroke="#FDBA74" strokeWidth="1.2" />
        {/* Right hand */}
        <rect x="148" y="214" width="28" height="18" rx="8" fill="#FED7AA" stroke="#FDBA74" strokeWidth="1.5" />
        <path d="M157 214 L157 226 M165 214 L165 226" stroke="#FDBA74" strokeWidth="1.2" />
      </g>
    </g>
  );
}

/* ---------------------------------------------------- */
/* POSE 2: SIT (w: 220, h: 400)                         */
/* Swinging legs on the ticker strip & sipping milk     */
/* ---------------------------------------------------- */
function SitPose() {
  return (
    <g>
      {/* Swinging Legs (under the dress) */}
      <g className="amul-leg-l" style={{ transformOrigin: '82px 255px' }}>
        <path d="M76 255 L74 330 C74 340 88 340 88 330 L86 255 Z" fill="#FED7AA" />
        {/* White Sock */}
        <path d="M74 318 L74 334 C74 342 88 342 88 334 L88 318 Z" fill="#FFFFFF" />
        {/* Red Mary Jane Shoe */}
        <path d="M70 332 C70 326 92 326 94 332 L96 342 C96 348 68 348 70 342 Z" fill="#C62828" />
        <rect x="76" y="332" width="12" height="3" fill="#FFFFFF" />
      </g>

      <g className="amul-leg-r" style={{ transformOrigin: '138px 255px' }}>
        <path d="M132 255 L134 330 C134 340 148 340 148 330 L144 255 Z" fill="#FED7AA" />
        {/* White Sock */}
        <path d="M134 318 L134 334 C134 342 148 342 148 334 L148 318 Z" fill="#FFFFFF" />
        {/* Red Mary Jane Shoe */}
        <path d="M130 332 C130 326 152 326 154 332 L156 342 C156 348 128 348 130 342 Z" fill="#C62828" />
        <rect x="136" y="332" width="12" height="3" fill="#FFFFFF" />
      </g>

      {/* Seated Body & Head */}
      <g className="amul-sit-body">
        {/* High Ponytail */}
        <g className="amul-ponytail" style={{ transformOrigin: '76px 65px' }}>
          <path d="M68 65 C40 28 64 6 98 12 C108 26 102 48 84 62 Z" fill="#1A237E" />
          <path d="M78 52 C66 34 80 20 95 24" stroke="#283593" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>
        {/* Ribbon */}
        <g className="amul-ribbon">
          <circle cx="82" cy="64" r="4.2" fill="#C62828" />
          <path d="M76 58 C68 52 60 56 64 62 C68 67 76 64 80 60 Z" fill="#E51B23" />
        </g>

        {/* Head */}
        <path d="M64 104 C62 70 82 50 115 50 C148 50 168 70 166 104 C164 125 150 144 115 144 C80 144 66 125 64 104 Z" fill="#FED7AA" />
        {/* Hair */}
        <path d="M66 102 C62 70 84 48 116 48 C148 48 168 70 164 102 C154 88 138 82 115 82 C92 82 78 88 66 102 Z" fill="#1A237E" />
        <path d="M66 94 C74 86 88 86 98 94 C88 98 78 98 66 94 Z" fill="#1A237E" />
        <path d="M164 94 C156 86 142 86 132 94 C142 98 152 98 164 94 Z" fill="#1A237E" />

        {/* Cheeks */}
        <circle cx="86" cy="122" r="12" fill="url(#amulBlush)" />
        <circle cx="144" cy="122" r="12" fill="url(#amulBlush)" />

        {/* Blinking Eyes */}
        <g className="amul-blink">
          <ellipse cx="94" cy="112" rx="9" ry="11" fill="#FFFFFF" />
          <ellipse cx="136" cy="112" rx="9" ry="11" fill="#FFFFFF" />
          <ellipse cx="96" cy="112" rx="5.5" ry="7" fill="#171717" />
          <circle cx="98" cy="110" r="2" fill="#FFFFFF" />
          <ellipse cx="138" cy="112" rx="5.5" ry="7" fill="#171717" />
          <circle cx="140" cy="110" r="2" fill="#FFFFFF" />
          <path d="M85 105 C90 102 99 102 103 105" stroke="#171717" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M127 105 C132 102 141 102 145 105" stroke="#171717" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>

        {/* Mouth with cute sipping smile */}
        <circle cx="115" cy="120" r="2.2" fill="#F97316" opacity="0.6" />
        <ellipse cx="115" cy="130" rx="6" ry="4" fill="#B91C1C" />
        <circle cx="115" cy="131" r="3" fill="#F87171" />

        {/* Classic Red Polka Dot Dress */}
        <path d="M78 152 C94 144 136 144 152 152 L172 248 C150 258 80 258 58 248 Z" fill="url(#amulPolka)" />
        {/* Collar */}
        <path d="M94 148 C104 158 126 158 136 148 C126 152 104 152 94 148 Z" fill="#FFFFFF" />

        {/* Milk Glass & Sipping Straw */}
        <g className="amul-sip-glass">
          {/* Glass */}
          <path d="M104 146 L107 194 C107 198 123 198 123 194 L126 146 Z" fill="rgba(255,255,255,0.7)" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Fresh Milk Level */}
          <path d="M105 156 L108 192 C108 196 122 196 122 192 L125 156 Z" fill="#FFFDF7" />
          {/* Red & White Striped Straw */}
          <path d="M115 130 L115 186" stroke="#E51B23" strokeWidth="3" strokeDasharray="4 3" strokeLinecap="round" />
          {/* Hands holding the glass */}
          <circle cx="102" cy="170" r="7" fill="#FED7AA" />
          <circle cx="128" cy="170" r="7" fill="#FED7AA" />
        </g>
      </g>
    </g>
  );
}

/* ---------------------------------------------------- */
/* POSE 3: POINT (w: 233, h: 400)                       */
/* Directing attention with pulsing finger to product   */
/* ---------------------------------------------------- */
function PointPose() {
  return (
    <g className="amul-point-body">
      {/* Legs & Shoes */}
      <path d="M96 270 L96 348 C96 356 110 356 110 348 L110 270 Z" fill="#FED7AA" />
      <path d="M128 270 L128 348 C128 356 142 356 142 348 L142 270 Z" fill="#FED7AA" />
      {/* Socks */}
      <rect x="96" y="336" width="14" height="14" fill="#FFFFFF" rx="2" />
      <rect x="128" y="336" width="14" height="14" fill="#FFFFFF" rx="2" />
      {/* Red Shoes */}
      <path d="M92 348 C92 342 114 342 116 348 L118 358 C118 364 90 364 92 358 Z" fill="#C62828" />
      <path d="M124 348 C124 342 146 342 148 348 L150 358 C150 364 122 364 124 358 Z" fill="#C62828" />

      {/* High Ponytail */}
      <g className="amul-ponytail" style={{ transformOrigin: '82px 64px' }}>
        <path d="M72 64 C42 25 68 4 104 10 C114 24 108 48 88 62 Z" fill="#1A237E" />
        <path d="M82 50 C70 32 84 18 100 22" stroke="#283593" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Ribbon */}
      <circle cx="86" cy="62" r="4.5" fill="#C62828" />

      {/* Head */}
      <path d="M74 100 C72 66 92 46 125 46 C158 46 178 66 176 100 C174 122 160 140 125 140 C90 140 76 122 74 100 Z" fill="#FED7AA" />
      <path d="M76 98 C72 66 94 44 126 44 C158 44 178 66 174 98 C164 84 148 78 125 78 C102 78 88 84 76 98 Z" fill="#1A237E" />

      {/* Cheeks */}
      <circle cx="94" cy="118" r="13" fill="url(#amulBlush)" />
      <circle cx="154" cy="118" r="13" fill="url(#amulBlush)" />

      {/* Blinking Eyes (Glancing toward pointing hand) */}
      <g className="amul-blink">
        <ellipse cx="104" cy="108" rx="9.5" ry="11.5" fill="#FFFFFF" />
        <ellipse cx="146" cy="108" rx="9.5" ry="11.5" fill="#FFFFFF" />
        <ellipse cx="108" cy="108" rx="5.5" ry="7.5" fill="#171717" />
        <circle cx="110" cy="106" r="2.2" fill="#FFFFFF" />
        <ellipse cx="150" cy="108" rx="5.5" ry="7.5" fill="#171717" />
        <circle cx="152" cy="106" r="2.2" fill="#FFFFFF" />
      </g>
      {/* Smile */}
      <path d="M115 124 C120 132 130 132 135 124" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="round" fill="#F87171" />

      {/* Dress */}
      <path d="M84 148 C102 140 148 140 166 148 L188 274 C162 284 88 284 62 274 Z" fill="url(#amulPolka)" />
      <path d="M102 144 C114 154 136 154 148 144 Z" fill="#FFFFFF" />

      {/* Left arm: hand on hip (confident stance) */}
      <path d="M84 156 L64 194 L76 204 L90 178" stroke="#FED7AA" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Right arm: Pointing Index Finger (Animated Pulse) */}
      <g className="amul-point-arm" style={{ transformOrigin: '155px 165px' }}>
        <path d="M155 165 L200 175" stroke="#FED7AA" strokeWidth="12" strokeLinecap="round" fill="none" />
        {/* Pointing hand with extended index finger */}
        <path d="M196 168 L228 174 C232 175 232 179 227 180 L204 182 L198 186 Z" fill="#FED7AA" />
        <circle cx="202" cy="177" r="7.5" fill="#FED7AA" />
      </g>
    </g>
  );
}

/* ---------------------------------------------------- */
/* POSE 4: CHEF (w: 175, h: 400)                        */
/* Whisking Gold milk in chef hat with floating sparkles */
/* ---------------------------------------------------- */
function ChefPose() {
  return (
    <g>
      {/* Floating Gold Sparkles */}
      <g className="amul-sparkle-1" transform="translate(125, 175)">
        <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#FFD84D" />
      </g>
      <g className="amul-sparkle-2" transform="translate(142, 195)">
        <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#F5C82A" />
      </g>

      {/* Legs & Shoes */}
      <path d="M68 280 L68 348 C68 356 82 356 82 348 L82 280 Z" fill="#FED7AA" />
      <path d="M98 280 L98 348 C98 356 112 356 112 348 L112 280 Z" fill="#FED7AA" />
      <rect x="68" y="338" width="14" height="12" fill="#FFFFFF" />
      <rect x="98" y="338" width="14" height="12" fill="#FFFFFF" rx="2" />
      <path d="M64 348 C64 342 86 342 88 348 L90 358 C90 364 62 364 64 358 Z" fill="#C62828" />
      <path d="M94 348 C94 342 116 342 118 348 L120 358 C120 364 92 364 94 358 Z" fill="#C62828" />

      {/* Body & Dress */}
      <path d="M56 166 C72 158 108 158 124 166 L144 286 C124 294 56 294 36 286 Z" fill="url(#amulPolka)" />
      <path d="M72 162 C82 172 98 172 108 162 Z" fill="#FFFFFF" />

      {/* Head */}
      <path d="M48 116 C46 84 64 66 90 66 C116 66 134 84 132 116 C130 136 118 152 90 152 C62 152 50 136 48 116 Z" fill="#FED7AA" />
      <path d="M50 114 C46 84 64 64 90 64 C116 64 134 84 130 114 C122 100 110 94 90 94 C70 94 58 100 50 114 Z" fill="#1A237E" />

      {/* Cheeks */}
      <circle cx="64" cy="132" r="10" fill="url(#amulBlush)" />
      <circle cx="116" cy="132" r="10" fill="url(#amulBlush)" />

      {/* Eyes: One winking, one open with delight */}
      <g className="amul-blink">
        {/* Open left eye */}
        <ellipse cx="72" cy="122" rx="8" ry="10" fill="#FFFFFF" />
        <ellipse cx="73" cy="122" rx="4.5" ry="6.5" fill="#171717" />
        <circle cx="75" cy="120" r="1.8" fill="#FFFFFF" />
        {/* Winking right eye */}
        <path d="M102 124 C106 118 116 118 120 124" stroke="#171717" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </g>
      {/* Cheerful chef grin */}
      <path d="M82 136 C86 144 94 144 98 136" stroke="#B91C1C" strokeWidth="2.6" strokeLinecap="round" fill="#F87171" />

      {/* Tall Puffy White Chef Hat (Jiggling) */}
      <g className="amul-chef-hat" style={{ transformOrigin: '90px 72px' }}>
        <path d="M60 72 L120 72 L116 58 L64 58 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M52 58 C38 42 46 16 68 22 C74 6 98 6 104 20 C124 14 138 36 128 58 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M72 58 L72 34 M90 58 L90 28 M108 58 L108 34" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Left arm holding the golden bowl */}
      <path d="M54 174 L38 214 L68 228" stroke="#FED7AA" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Golden mixing bowl */}
      <path d="M60 210 C60 210 58 244 88 244 C118 244 116 210 116 210 Z" fill="#F5C82A" stroke="#EAB308" strokeWidth="2" />
      {/* Rich Golden Cream Inside Bowl */}
      <ellipse cx="88" cy="214" rx="26" ry="8" fill="#FEF08A" />

      {/* Right arm & Whisk (Animated Circular Stir) */}
      <g className="amul-chef-arm" style={{ transformOrigin: '116px 174px' }}>
        <path d="M116 174 L102 208" stroke="#FED7AA" strokeWidth="10" strokeLinecap="round" fill="none" />
        {/* Whisk handle & wires */}
        <rect x="98" y="194" width="4" height="24" fill="#B45309" rx="1.5" />
        <ellipse cx="100" cy="222" rx="7" ry="12" fill="none" stroke="#F5C82A" strokeWidth="2.2" />
        <path d="M96 214 L104 230 M104 214 L96 230" stroke="#F5C82A" strokeWidth="1.6" />
      </g>
    </g>
  );
}

/* ---------------------------------------------------- */
/* POSE 5: WAVE (w: 266, h: 400)                         */
/* Enthusiastic friendly waving in Final CTA section     */
/* ---------------------------------------------------- */
function WavePose() {
  return (
    <g className="amul-wave-body">
      {/* Legs & Shoes */}
      <path d="M114 274 L114 348 C114 356 128 356 128 348 L128 274 Z" fill="#FED7AA" />
      <path d="M148 274 L148 348 C148 356 162 356 162 348 L162 274 Z" fill="#FED7AA" />
      <rect x="114" y="336" width="14" height="14" fill="#FFFFFF" rx="2" />
      <rect x="148" y="336" width="14" height="14" fill="#FFFFFF" rx="2" />
      <path d="M110 348 C110 342 132 342 134 348 L136 358 C136 364 108 364 110 358 Z" fill="#C62828" />
      <path d="M144 348 C144 342 166 342 168 348 L170 358 C170 364 142 364 144 358 Z" fill="#C62828" />

      {/* High Ponytail */}
      <g className="amul-ponytail" style={{ transformOrigin: '100px 64px' }}>
        <path d="M90 64 C60 25 86 4 122 10 C132 24 126 48 106 62 Z" fill="#1A237E" />
        <path d="M100 50 C88 32 102 18 118 22" stroke="#283593" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="104" cy="62" r="4.5" fill="#C62828" />

      {/* Head */}
      <path d="M92 100 C90 66 110 46 143 46 C176 46 196 66 194 100 C192 122 178 140 143 140 C108 140 94 122 92 100 Z" fill="#FED7AA" />
      <path d="M94 98 C90 66 112 44 144 44 C176 44 196 66 192 98 C182 84 166 78 143 78 C120 78 106 84 94 98 Z" fill="#1A237E" />

      {/* Cheeks */}
      <circle cx="112" cy="118" r="13" fill="url(#amulBlush)" />
      <circle cx="172" cy="118" r="13" fill="url(#amulBlush)" />

      {/* Blinking Eyes */}
      <g className="amul-blink">
        <ellipse cx="122" cy="108" rx="9.5" ry="11.5" fill="#FFFFFF" />
        <ellipse cx="164" cy="108" rx="9.5" ry="11.5" fill="#FFFFFF" />
        <ellipse cx="124" cy="108" rx="5.5" ry="7.5" fill="#171717" />
        <circle cx="126" cy="106" r="2.2" fill="#FFFFFF" />
        <ellipse cx="166" cy="108" rx="5.5" ry="7.5" fill="#171717" />
        <circle cx="168" cy="106" r="2.2" fill="#FFFFFF" />
      </g>
      {/* Big joyful smile */}
      <path d="M132 122 C137 134 149 134 154 122" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" fill="#F87171" />

      {/* Red Dress with Polka Dots */}
      <path d="M102 148 C120 140 166 140 184 148 L206 274 C180 284 106 284 80 274 Z" fill="url(#amulPolka)" />
      <path d="M120 144 C132 154 154 154 166 144 Z" fill="#FFFFFF" />

      {/* Left arm: resting easily by hip holding small glass of milk */}
      <path d="M104 156 L88 198 L104 214" stroke="#FED7AA" strokeWidth="11" strokeLinecap="round" fill="none" />
      <ellipse cx="106" cy="218" rx="6" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

      {/* Right arm: Waving High (Animated Arc) */}
      <g className="amul-wave-arm" style={{ transformOrigin: '178px 156px' }}>
        <path d="M178 156 L216 112 L228 82" stroke="#FED7AA" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Open Palm Waving Hand */}
        <g transform="translate(228, 80) rotate(15)">
          <circle cx="0" cy="0" r="9" fill="#FED7AA" />
          <path d="M-6 -6 L-8 -18 M-2 -8 L-3 -22 M3 -8 L4 -21 M8 -6 L11 -16" stroke="#FED7AA" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/* ---------------------------------------------------- */
/* POSE 6: TRAY (w: 220, h: 400)                         */
/* Serving tray with glasses of milk in Story section   */
/* ---------------------------------------------------- */
function TrayPose() {
  return (
    <g>
      {/* Legs & Shoes */}
      <path d="M92 274 L92 348 C92 356 106 356 106 348 L106 274 Z" fill="#FED7AA" />
      <path d="M126 274 L126 348 C126 356 140 356 140 348 L140 274 Z" fill="#FED7AA" />
      <rect x="92" y="336" width="14" height="14" fill="#FFFFFF" rx="2" />
      <rect x="126" y="336" width="14" height="14" fill="#FFFFFF" rx="2" />
      <path d="M88 348 C88 342 110 342 112 348 L114 358 C114 364 86 364 88 358 Z" fill="#C62828" />
      <path d="M122 348 C122 342 144 342 146 348 L148 358 C148 364 120 364 122 358 Z" fill="#C62828" />

      {/* High Ponytail */}
      <g className="amul-ponytail" style={{ transformOrigin: '78px 64px' }}>
        <path d="M68 64 C38 25 64 4 100 10 C110 24 104 48 84 62 Z" fill="#1A237E" />
      </g>
      <circle cx="82" cy="62" r="4.5" fill="#C62828" />

      {/* Head */}
      <path d="M70 100 C68 66 88 46 121 46 C154 46 174 66 172 100 C170 122 156 140 121 140 C86 140 72 122 70 100 Z" fill="#FED7AA" />
      <path d="M72 98 C68 66 90 44 122 44 C154 44 174 66 170 98 C160 84 144 78 121 78 C98 78 84 84 72 98 Z" fill="#1A237E" />

      {/* Cheeks */}
      <circle cx="90" cy="118" r="12" fill="url(#amulBlush)" />
      <circle cx="150" cy="118" r="12" fill="url(#amulBlush)" />

      {/* Blinking Eyes */}
      <g className="amul-blink">
        <ellipse cx="100" cy="108" rx="9" ry="11" fill="#FFFFFF" />
        <ellipse cx="142" cy="108" rx="9" ry="11" fill="#FFFFFF" />
        <ellipse cx="102" cy="108" rx="5.5" ry="7" fill="#171717" />
        <circle cx="104" cy="106" r="2.2" fill="#FFFFFF" />
        <ellipse cx="144" cy="108" rx="5.5" ry="7" fill="#171717" />
        <circle cx="146" cy="106" r="2.2" fill="#FFFFFF" />
      </g>
      {/* Warm inviting smile */}
      <path d="M111 122 C116 132 126 132 131 122" stroke="#B91C1C" strokeWidth="2.8" strokeLinecap="round" fill="#F87171" />

      {/* Red Dress with Polka Dots */}
      <path d="M80 148 C98 140 144 140 162 148 L184 274 C158 284 84 284 58 274 Z" fill="url(#amulPolka)" />
      <path d="M98 144 C110 154 132 154 144 144 Z" fill="#FFFFFF" />

      {/* Serving Tray Group (Balancing) */}
      <g className="amul-tray-group" style={{ transformOrigin: '120px 200px' }}>
        {/* Silver Tray */}
        <ellipse cx="120" cy="202" rx="66" ry="16" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <ellipse cx="120" cy="200" rx="62" ry="13" fill="#F8FAFC" />

        {/* Glasses of milk on the tray */}
        <g transform="translate(95, 172)">
          <path d="M0 0 L2 22 C2 24 16 24 16 22 L18 0 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" strokeWidth="1" />
          <path d="M1 5 L2 21 C2 23 15 23 15 21 L17 5 Z" fill="#FFFDF7" />
        </g>
        <g transform="translate(125, 172)">
          <path d="M0 0 L2 22 C2 24 16 24 16 22 L18 0 Z" fill="rgba(255,255,255,0.85)" stroke="#94A3B8" strokeWidth="1" />
          <path d="M1 5 L2 21 C2 23 15 23 15 21 L17 5 Z" fill="#FFFDF7" />
        </g>

        {/* Hands carrying the tray */}
        <circle cx="62" cy="204" r="7.5" fill="#FED7AA" />
        <circle cx="178" cy="204" r="7.5" fill="#FED7AA" />
      </g>
    </g>
  );
}
