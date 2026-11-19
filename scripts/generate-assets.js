import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public', 'assets');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function svgToWebp(svgString, outPath, width, height) {
  ensureDir(path.dirname(outPath));
  await sharp(Buffer.from(svgString))
    .resize(width, height)
    .webp({ quality: 90 })
    .toFile(outPath);
  console.log(`✓ Generated: ${path.relative(ROOT, outPath)} (${width}x${height})`);
}

/* ======================================================== */
/* 1. MOMENTS ASSETS                                         */
/* ======================================================== */
function getBreakfastSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFDF7" />
        <stop offset="60%" stop-color="#F5EFE0" />
        <stop offset="100%" stop-color="#E2D6C0" />
      </linearGradient>
      <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF8E7" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#FFE8B5" stop-opacity="0" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#2D1C08" flood-opacity="0.14" />
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)" />
    <!-- Morning Sunlight beam -->
    <polygon points="0,0 800,0 400,900 0,900" fill="url(#sun)" />
    <!-- Table Linen Napkin -->
    <polygon points="120,480 880,420 980,850 160,890" fill="#1E8FD8" opacity="0.18" />
    <polygon points="140,500 860,440 950,830 180,870" fill="#1E8FD8" opacity="0.85" rx="12" />
    <path d="M140 500 L860 440 L950 830 L180 870 Z" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="10 8" fill="none" opacity="0.6" />

    <!-- Glass of Fresh Milk -->
    <g filter="url(#shadow)" transform="translate(240, 260)">
      <ellipse cx="90" cy="460" rx="60" ry="14" fill="#000000" opacity="0.12" />
      <!-- Glass Body -->
      <path d="M40 80 L52 440 C52 455 128 455 128 440 L140 80 Z" fill="rgba(255,255,255,0.4)" stroke="#CBD5E1" stroke-width="3" />
      <!-- Fresh Cold Milk -->
      <path d="M42 120 L53 435 C53 450 127 450 127 435 L138 120 Z" fill="#FFFDF7" />
      <ellipse cx="90" cy="120" rx="48" ry="12" fill="#FAF7EE" />
      <ellipse cx="90" cy="80" rx="50" ry="14" fill="none" stroke="#FFFFFF" stroke-width="4" />
      <!-- Glass reflection highlight -->
      <path d="M50 140 L58 420" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.75" />
    </g>

    <!-- Bowl of Cereal with Milk -->
    <g filter="url(#shadow)" transform="translate(620, 360)">
      <ellipse cx="240" cy="380" rx="200" ry="32" fill="#000000" opacity="0.15" />
      <!-- Ceramic Bowl Outer -->
      <path d="M40 120 C40 320 440 320 440 120 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4" />
      <!-- Creamy Milk Level -->
      <ellipse cx="240" cy="150" rx="180" ry="52" fill="#FFFDF7" />
      <ellipse cx="240" cy="150" rx="174" ry="48" fill="#F8F4E8" />
      <!-- Golden Cornflakes -->
      <g fill="#F59E0B" stroke="#D97706" stroke-width="1.5">
        <ellipse cx="140" cy="140" rx="22" ry="14" transform="rotate(-15 140 140)" />
        <ellipse cx="190" cy="160" rx="26" ry="16" transform="rotate(25 190 160)" />
        <ellipse cx="260" cy="140" rx="24" ry="15" transform="rotate(-8 260 140)" />
        <ellipse cx="320" cy="165" rx="25" ry="15" transform="rotate(18 320 165)" />
        <ellipse cx="220" cy="128" rx="20" ry="12" transform="rotate(-20 220 128)" />
        <ellipse cx="290" cy="128" rx="22" ry="14" transform="rotate(12 290 128)" />
        <ellipse cx="160" cy="175" rx="24" ry="14" transform="rotate(10 160 175)" />
        <ellipse cx="240" cy="180" rx="26" ry="16" transform="rotate(-5 240 180)" />
        <ellipse cx="340" cy="135" rx="20" ry="13" transform="rotate(-15 340 135)" />
      </g>
      <!-- Fresh Strawberries -->
      <g fill="#E51B23">
        <path d="M190 130 C190 110 220 110 220 130 C220 150 205 165 205 165 C205 165 190 150 190 130 Z" />
        <circle cx="205" cy="114" r="5" fill="#15803D" />
        <path d="M275 145 C275 125 305 125 305 145 C305 165 290 180 290 180 C290 180 275 165 275 145 Z" />
        <circle cx="290" cy="129" r="5" fill="#15803D" />
      </g>
      <!-- Silver Spoon -->
      <path d="M380 90 L460 300 C475 340 520 340 535 300 L510 110 Z" fill="#E2E8F0" opacity="0.9" />
      <ellipse cx="370" cy="95" rx="36" ry="22" fill="#CBD5E1" transform="rotate(-20 370 95)" />
      <ellipse cx="370" cy="95" rx="32" ry="18" fill="#F1F5F9" transform="rotate(-20 370 95)" />
    </g>
    <text x="600" y="820" text-anchor="middle" font-family="'Anton', sans-serif" font-size="36" fill="#171717" opacity="0.12" letter-spacing="4">AMUL BREAKFAST MOMENTS</text>
  </svg>`;
}

function getCoffeeSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2D1C12" />
        <stop offset="50%" stop-color="#4A3326" />
        <stop offset="100%" stop-color="#1B1009" />
      </linearGradient>
      <radialGradient id="cupGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#6F4E37" />
        <stop offset="85%" stop-color="#4A2F1D" />
        <stop offset="100%" stop-color="#2E1B0E" />
      </radialGradient>
      <filter id="cshadow">
        <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#000" flood-opacity="0.4" />
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#cbg)" />
    <!-- Rustic Wood Table Rings -->
    <circle cx="600" cy="450" r="700" stroke="#3D281C" stroke-width="2" fill="none" opacity="0.4" />
    <circle cx="600" cy="450" r="540" stroke="#3D281C" stroke-width="1.5" fill="none" opacity="0.3" />

    <!-- Coffee Saucer & Cup Center -->
    <g filter="url(#cshadow)" transform="translate(480, 260)">
      <!-- Saucer -->
      <ellipse cx="200" cy="240" rx="260" ry="180" fill="#E2E8F0" />
      <ellipse cx="200" cy="240" rx="245" ry="168" fill="#F8FAFC" />
      <ellipse cx="200" cy="240" rx="160" ry="105" fill="#CBD5E1" opacity="0.5" />

      <!-- Ceramic Cup Rim -->
      <ellipse cx="200" cy="220" rx="140" ry="98" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="8" />
      <!-- Rich Latte Surface -->
      <ellipse cx="200" cy="220" rx="126" ry="86" fill="url(#cupGrad)" />

      <!-- Intricate Leaf Latte Art (White milk foam) -->
      <g fill="#FFFDF7" opacity="0.95">
        <!-- Stem -->
        <path d="M200 280 Q200 180 200 150" stroke="#FFFDF7" stroke-width="5" stroke-linecap="round" fill="none" />
        <!-- Heart Top -->
        <path d="M200 154 C185 140 175 158 200 180 C225 158 215 140 200 154 Z" />
        <!-- Leaves -->
        <path d="M198 185 C176 172 170 188 198 200 C226 188 220 172 198 185 Z" />
        <path d="M198 210 C168 196 160 214 198 226 C236 214 228 196 198 210 Z" />
        <path d="M198 235 C162 220 152 238 198 250 C244 238 234 220 198 235 Z" />
      </g>
    </g>

    <!-- Small Glass Jug of Fresh Milk beside Cup -->
    <g filter="url(#cshadow)" transform="translate(180, 320)">
      <ellipse cx="90" cy="260" rx="65" ry="20" fill="#000" opacity="0.3" />
      <!-- Glass Jug Body -->
      <path d="M50 80 Q35 180 40 240 C45 270 135 270 140 240 Q145 180 130 80 L155 70 Q160 85 145 95 Z" fill="rgba(255,255,255,0.3)" stroke="#CBD5E1" stroke-width="2.5" />
      <!-- Fresh Amul Milk in Jug -->
      <path d="M44 140 Q38 190 42 238 C45 265 135 265 138 238 Q142 190 136 140 Z" fill="#FFFDF7" />
      <ellipse cx="90" cy="140" rx="46" ry="14" fill="#FAF5E8" />
      <path d="M48 160 Q44 210 48 240" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7" />
    </g>

    <!-- Coffee Beans scattered -->
    <g fill="#2B160C" stroke="#170A04" stroke-width="1.5">
      <ellipse cx="380" cy="560" rx="14" ry="9" transform="rotate(35 380 560)" />
      <path d="M374 554 Q380 560 386 566" stroke="#170A04" stroke-width="1.5" fill="none" />
      <ellipse cx="410" cy="590" rx="13" ry="8" transform="rotate(-20 410 590)" />
      <path d="M405 586 Q410 590 415 594" stroke="#170A04" stroke-width="1.5" fill="none" />
      <ellipse cx="940" cy="460" rx="15" ry="10" transform="rotate(50 940 460)" />
      <ellipse cx="970" cy="490" rx="14" ry="9" transform="rotate(-10 970 490)" />
    </g>
    <text x="600" y="780" text-anchor="middle" font-family="'Anton', sans-serif" font-size="34" fill="#FFFDF7" opacity="0.16" letter-spacing="4">AMUL MILK &amp; COFFEE</text>
  </svg>`;
}

function getDessertSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1E1428" />
        <stop offset="60%" stop-color="#32183B" />
        <stop offset="100%" stop-color="#140D1C" />
      </linearGradient>
      <radialGradient id="kheerGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFDF5" />
        <stop offset="70%" stop-color="#FDF4DC" />
        <stop offset="100%" stop-color="#F5E4B5" />
      </radialGradient>
      <filter id="dshadow">
        <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000" flood-opacity="0.5" />
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#dbg)" />

    <!-- Royal Brass Thali / Platter Base -->
    <g filter="url(#dshadow)" transform="translate(600, 450)">
      <ellipse cx="0" cy="0" rx="420" ry="240" fill="#D97706" opacity="0.8" />
      <ellipse cx="0" cy="0" rx="400" ry="226" fill="#F59E0B" />
      <ellipse cx="0" cy="0" rx="380" ry="212" fill="#B45309" opacity="0.4" />
      <ellipse cx="0" cy="0" rx="360" ry="200" fill="#FBBF24" />

      <!-- Traditional White Ceramic Bowl of Kheer -->
      <ellipse cx="0" cy="-20" rx="270" ry="150" fill="#000000" opacity="0.25" />
      <ellipse cx="0" cy="-40" rx="250" ry="135" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="8" />
      <!-- Creamy Rich Saffron Kheer -->
      <ellipse cx="0" cy="-40" rx="230" ry="122" fill="url(#kheerGrad)" />

      <!-- Saffron Strands (Delicate gold-orange threads) -->
      <g stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" fill="none">
        <path d="M-60 -60 Q-40 -70 -20 -55" />
        <path d="M-10 -40 Q15 -55 35 -38" />
        <path d="M30 -65 Q60 -75 80 -60" />
        <path d="M-80 -30 Q-50 -45 -35 -20" />
        <path d="M10 -20 Q40 -30 65 -15" />
        <path d="M-20 -75 Q0 -88 20 -78" />
      </g>

      <!-- Slivered Pistachios & Almonds -->
      <g fill="#65A30D" stroke="#4D7C0F" stroke-width="1.2">
        <ellipse cx="-45" cy="-45" rx="9" ry="5" transform="rotate(40 -45 -45)" />
        <ellipse cx="45" cy="-55" rx="8" ry="4" transform="rotate(-30 45 -55)" />
        <ellipse cx="-20" cy="-25" rx="10" ry="5" transform="rotate(15 -20 -25)" />
        <ellipse cx="50" cy="-30" rx="9" ry="5" transform="rotate(70 50 -30)" />
        <ellipse cx="-70" cy="-40" rx="8" ry="4" transform="rotate(-50 -70 -40)" />
        <ellipse cx="10" cy="-50" rx="9" ry="5" transform="rotate(-10 10 -50)" />
      </g>
      <!-- Almond slivers -->
      <g fill="#FEF3C7" stroke="#D97706" stroke-width="1">
        <ellipse cx="-30" cy="-65" rx="10" ry="4" transform="rotate(-20 -30 -65)" />
        <ellipse cx="25" cy="-45" rx="11" ry="5" transform="rotate(45 25 -45)" />
        <ellipse cx="-10" cy="-40" rx="10" ry="4" transform="rotate(80 -10 -40)" />
      </g>

      <!-- Silver Spoon resting on edge -->
      <path d="M160 -90 L320 60 C340 80 370 70 380 40 L230 -110 Z" fill="#E2E8F0" />
      <ellipse cx="160" cy="-90" rx="42" ry="24" fill="#F8FAFC" transform="rotate(-35 160 -90)" />
      <ellipse cx="160" cy="-90" rx="36" ry="19" fill="#CBD5E1" transform="rotate(-35 160 -90)" />
    </g>
    <text x="600" y="800" text-anchor="middle" font-family="'Anton', sans-serif" font-size="34" fill="#FBBF24" opacity="0.3" letter-spacing="4">AMUL DESSERT PERFECTION</text>
  </svg>`;
}

/* ======================================================== */
/* 2. FX: MILK DRIP EDGE (1600x533)                          */
/* ======================================================== */
function getMilkDripEdgeSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="dripGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFDF7" />
        <stop offset="85%" stop-color="#FAF5E8" />
        <stop offset="100%" stop-color="#EFE8D6" />
      </linearGradient>
      <filter id="dripGlow" x="-5%" y="-5%" width="110%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#171717" flood-opacity="0.12" />
      </filter>
    </defs>
    <!-- Organic dripping milk wave -->
    <path filter="url(#dripGlow)" d="
      M 0 0
      L 1600 0
      L 1600 90
      C 1560 90, 1540 180, 1520 260
      C 1500 320, 1470 320, 1460 250
      C 1445 160, 1420 85, 1380 85
      C 1340 85, 1320 140, 1300 200
      C 1280 250, 1255 250, 1240 190
      C 1220 110, 1190 85, 1150 85
      C 1110 85, 1090 220, 1060 380
      C 1040 450, 1000 450, 985 360
      C 965 240, 950 85, 900 85
      C 860 85, 840 160, 810 240
      C 790 300, 760 300, 745 220
      C 725 120, 700 85, 660 85
      C 620 85, 590 260, 560 420
      C 540 490, 500 490, 485 410
      C 460 270, 440 85, 390 85
      C 350 85, 330 150, 310 220
      C 290 280, 260 280, 245 210
      C 225 120, 200 85, 160 85
      C 120 85, 100 210, 75 320
      C 60 370, 30 370, 20 300
      C 10 220, 5 90, 0 90
      Z"
      fill="url(#dripGrad)"
    />
    <!-- Hanging milk drops -->
    <ellipse cx="522" cy="505" rx="14" ry="18" fill="#FFFDF7" filter="url(#dripGlow)" />
    <ellipse cx="1022" cy="465" rx="12" ry="16" fill="#FFFDF7" filter="url(#dripGlow)" />
    <ellipse cx="1490" cy="335" rx="10" ry="13" fill="#FFFDF7" filter="url(#dripGlow)" />
    <ellipse cx="778" cy="315" rx="9" ry="12" fill="#FFFDF7" filter="url(#dripGlow)" />
    <!-- Highlights -->
    <path d="M0 20 L1600 20" stroke="#FFFFFF" stroke-width="12" opacity="0.6" />
  </svg>`;
}

/* ======================================================== */
/* 3. HERO & GOLD POSTER ASSETS                              */
/* ======================================================== */
function getHeroBgSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFDF7" />
        <stop offset="55%" stop-color="#F7F1E1" />
        <stop offset="100%" stop-color="#ECE2CD" />
      </linearGradient>
      <radialGradient id="sunGlow" cx="65%" cy="30%" r="55%">
        <stop offset="0%" stop-color="#FFF7DC" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#FFF7DC" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#hbg)" />
    <rect width="${w}" height="${h}" fill="url(#sunGlow)" />
    <!-- Warm kitchen counter tabletop line -->
    <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="#E5D9C2" opacity="0.45" />
    <line x1="0" y1="${h * 0.62}" x2="${w}" y2="${h * 0.62}" stroke="#D1C3A7" stroke-width="3" opacity="0.6" />
  </svg>`;
}

function getGoldPosterSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="goldBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#201306" />
        <stop offset="50%" stop-color="#422507" />
        <stop offset="100%" stop-color="#160C03" />
      </linearGradient>
      <radialGradient id="goldAura" cx="50%" cy="50%" r="45%">
        <stop offset="0%" stop-color="#F5C82A" stop-opacity="0.5" />
        <stop offset="60%" stop-color="#D97706" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#B45309" stop-opacity="0" />
      </radialGradient>
      <filter id="packGlow">
        <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#000" flood-opacity="0.65" />
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#goldBg)" />
    <circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.45}" fill="url(#goldAura)" />

    <!-- 3D Amul Gold Carton in center -->
    <g filter="url(#packGlow)" transform="translate(${w / 2 - 130}, ${h / 2 - 250})">
      <!-- Carton Slanted Top -->
      <polygon points="30,40 210,40 240,15 60,15" fill="#DC2626" />
      <polygon points="210,40 240,15 240,55 210,80" fill="#991B1B" />
      <!-- Main Face -->
      <rect x="30" y="40" width="180" height="420" rx="6" fill="#E51B23" />
      <!-- Side Face -->
      <polygon points="210,40 240,55 240,445 210,460" fill="#991B1B" />
      <!-- Golden Top Accent Band -->
      <rect x="30" y="40" width="180" height="90" fill="#F5C82A" />
      <polygon points="210,40 240,55 240,105 210,95" fill="#D97706" />
      <!-- Spout -->
      <ellipse cx="170" cy="40" rx="16" ry="8" fill="#F5C82A" stroke="#FFFFFF" stroke-width="2" />

      <!-- Typography -->
      <text x="120" y="85" text-anchor="middle" font-family="'Anton', sans-serif" font-size="38" fill="#E51B23">Amul</text>
      <text x="120" y="105" text-anchor="middle" font-family="system-ui" font-size="8" font-weight="700" fill="#B45309">THE TASTE OF INDIA</text>
      <text x="120" y="190" text-anchor="middle" font-family="'Anton', sans-serif" font-size="44" fill="#F5C82A" letter-spacing="1">GOLD</text>
      <text x="120" y="220" text-anchor="middle" font-family="system-ui" font-size="9" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">STANDARDISED MILK · UHT</text>

      <rect x="50" y="270" width="140" height="50" rx="4" fill="#B91C1C" />
      <text x="120" y="292" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#FDE047">FAT 4.5% MINIMUM</text>
      <text x="120" y="308" text-anchor="middle" font-family="system-ui" font-size="10" fill="#FFFFFF">SNF 8.5% MINIMUM</text>

      <text x="120" y="420" text-anchor="middle" font-family="'Anton', sans-serif" font-size="32" fill="#FFFFFF">1 L</text>
    </g>

    <!-- Swirling Ribbon of Liquid Milk -->
    <path d="
      M -50 ${h * 0.7}
      Q ${w * 0.25} ${h * 0.85} ${w * 0.5} ${h * 0.65}
      T ${w + 50} ${h * 0.5}
      " fill="none" stroke="#FFFDF7" stroke-width="28" stroke-linecap="round" opacity="0.85" filter="url(#packGlow)" />
  </svg>`;
}

/* ======================================================== */
/* 4. STORY SCENE ILLUSTRATIONS                              */
/* ======================================================== */
function getStorySceneSvg(sceneId, w, h) {
  const titles = {
    dawn: 'ANAND, GUJARAT — DAWN IN THE VILLAGE',
    herd: 'MORNING PASTURE WITH THE HERD',
    milking: 'FRESH MORNING MILKING',
    coop: 'VILLAGE CO-OPERATIVE COLLECTION CENTRE',
    road: 'COLD CHAIN MILK TANKER ON THE ROAD',
    dairy: 'AMUL MODERN PROCESSING &amp; PACKAGING DAIRY',
    home: 'POURED FRESH AT THE FAMILY TABLE',
  };
  const title = titles[sceneId] || 'AMUL MILK JOURNEY';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="sky-${sceneId}" x1="0" y1="0" x2="0" y2="1">
        ${sceneId === 'dawn' ? '<stop offset="0%" stop-color="#311B92" /><stop offset="45%" stop-color="#E65100" /><stop offset="80%" stop-color="#FFB300" /><stop offset="100%" stop-color="#FFF9C4" />' :
          sceneId === 'herd' ? '<stop offset="0%" stop-color="#0284C7" /><stop offset="60%" stop-color="#BAE6FD" /><stop offset="100%" stop-color="#FEF08A" />' :
          sceneId === 'dairy' ? '<stop offset="0%" stop-color="#0F172A" /><stop offset="60%" stop-color="#1E293B" /><stop offset="100%" stop-color="#334155" />' :
          '<stop offset="0%" stop-color="#0369A1" /><stop offset="60%" stop-color="#7DD3FC" /><stop offset="100%" stop-color="#F0FDF4" />'}
      </linearGradient>
      <linearGradient id="ground-${sceneId}" x1="0" y1="0" x2="0" y2="1">
        ${sceneId === 'dairy' ? '<stop offset="0%" stop-color="#475569" /><stop offset="100%" stop-color="#1E293B" />' :
          sceneId === 'home' ? '<stop offset="0%" stop-color="#E2D6C0" /><stop offset="100%" stop-color="#C5B499" />' :
          '<stop offset="0%" stop-color="#4ADE80" /><stop offset="50%" stop-color="#16A34A" /><stop offset="100%" stop-color="#14532D" />'}
      </linearGradient>
      <filter id="sglow">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>
    <!-- Background Sky -->
    <rect width="${w}" height="${h}" fill="url(#sky-${sceneId})" />
    <!-- Ground / Horizon -->
    <rect x="0" y="${h * 0.55}" width="${w}" height="${h * 0.45}" fill="url(#ground-${sceneId})" />

    <!-- Scene Specific Iconic Graphics -->
    <g filter="url(#sglow)">
      ${sceneId === 'dawn' ? `
        <!-- Sunrise Sun -->
        <circle cx="${w * 0.5}" cy="${h * 0.55}" r="140" fill="#FFFBEB" />
        <circle cx="${w * 0.5}" cy="${h * 0.55}" r="180" fill="#FDE047" opacity="0.3" />
        <!-- Village Thatched Sheds Silhouette -->
        <polygon points="${w * 0.1},${h * 0.55} ${w * 0.22},${h * 0.38} ${w * 0.34},${h * 0.55}" fill="#78350F" />
        <rect x="${w * 0.13}" y="${h * 0.55}" width="${w * 0.18}" height="${h * 0.2}" fill="#B45309" />
        <polygon points="${w * 0.65},${h * 0.55} ${w * 0.78},${h * 0.35} ${w * 0.9},${h * 0.55}" fill="#78350F" />
        <rect x="${w * 0.68}" y="${h * 0.55}" width="${w * 0.19}" height="${h * 0.2}" fill="#B45309" />
      ` : sceneId === 'herd' ? `
        <!-- Rolling Pasture Hills -->
        <ellipse cx="${w * 0.3}" cy="${h * 0.65}" rx="${w * 0.4}" ry="${h * 0.2}" fill="#22C55E" />
        <ellipse cx="${w * 0.75}" cy="${h * 0.7}" rx="${w * 0.45}" ry="${h * 0.25}" fill="#16A34A" />
        <!-- Cows Silhouette in Pasture -->
        <ellipse cx="${w * 0.45}" cy="${h * 0.62}" rx="65" ry="38" fill="#FFFFFF" stroke="#0F172A" stroke-width="4" />
        <circle cx="${w * 0.45 + 50}" cy="${h * 0.62 - 18}" r="22" fill="#FFFFFF" stroke="#0F172A" stroke-width="4" />
        <circle cx="${w * 0.45 - 20}" cy="${h * 0.62 - 10}" r="15" fill="#0F172A" />
        <circle cx="${w * 0.45 + 15}" cy="${h * 0.62 + 8}" r="18" fill="#0F172A" />
      ` : sceneId === 'coop' ? `
        <!-- Co-op Building -->
        <rect x="${w * 0.25}" y="${h * 0.35}" width="${w * 0.5}" height="${h * 0.35}" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="6" rx="8" />
        <polygon points="${w * 0.22},${h * 0.35} ${w * 0.5},${h * 0.22} ${w * 0.78},${h * 0.35}" fill="#1E8FD8" />
        <text x="${w * 0.5}" y="${h * 0.32}" text-anchor="middle" font-family="'Anton', sans-serif" font-size="28" fill="#FFFFFF">AMUL CO-OPERATIVE CENTRE</text>
        <!-- Milk Cans lined up -->
        <g fill="#94A3B8" stroke="#475569" stroke-width="3">
          <rect x="${w * 0.35}" y="${h * 0.6}" width="45" height="75" rx="6" />
          <rect x="${w * 0.42}" y="${h * 0.6}" width="45" height="75" rx="6" />
          <rect x="${w * 0.49}" y="${h * 0.6}" width="45" height="75" rx="6" />
          <rect x="${w * 0.56}" y="${h * 0.6}" width="45" height="75" rx="6" />
        </g>
      ` : sceneId === 'road' ? `
        <!-- Country Road -->
        <polygon points="${w * 0.45},${h * 0.55} ${w * 0.55},${h * 0.55} ${w * 0.8},${h} ${w * 0.2},${h}" fill="#334155" />
        <line x1="${w * 0.5}" y1="${h * 0.55}" x2="${w * 0.5}" y2="${h}" stroke="#FDE047" stroke-width="8" stroke-dasharray="30 20" />
        <!-- Insulated Stainless Steel Tanker Truck -->
        <g transform="translate(${w * 0.4 - 100}, ${h * 0.45})">
          <!-- Tanker Body -->
          <rect x="0" y="30" width="220" height="90" rx="35" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4" />
          <text x="110" y="85" text-anchor="middle" font-family="'Anton', sans-serif" font-size="34" fill="#E51B23">Amul</text>
          <!-- Truck Cabin -->
          <path d="M220 50 L270 50 L285 85 L285 120 L220 120 Z" fill="#1E8FD8" stroke="#0F172A" stroke-width="4" />
          <!-- Wheels -->
          <circle cx="45" cy="125" r="22" fill="#1E293B" />
          <circle cx="100" cy="125" r="22" fill="#1E293B" />
          <circle cx="175" cy="125" r="22" fill="#1E293B" />
          <circle cx="255" cy="125" r="22" fill="#1E293B" />
        </g>
      ` : sceneId === 'dairy' ? `
        <!-- High-tech Stainless Steel Dairy Facility -->
        <rect x="${w * 0.2}" y="${h * 0.25}" width="160" height="${h * 0.45}" rx="20" fill="#E2E8F0" stroke="#64748B" stroke-width="4" />
        <rect x="${w * 0.4}" y="${h * 0.2}" width="180" height="${h * 0.5}" rx="25" fill="#CBD5E1" stroke="#64748B" stroke-width="4" />
        <rect x="${w * 0.65}" y="${h * 0.25}" width="160" height="${h * 0.45}" rx="20" fill="#E2E8F0" stroke="#64748B" stroke-width="4" />
        <!-- Pipes & Conveyors -->
        <line x1="${w * 0.1}" y1="${h * 0.35}" x2="${w * 0.9}" y2="${h * 0.35}" stroke="#94A3B8" stroke-width="12" />
        <line x1="${w * 0.1}" y1="${h * 0.45}" x2="${w * 0.9}" y2="${h * 0.45}" stroke="#94A3B8" stroke-width="8" />
        <text x="${w * 0.5}" y="${h * 0.15}" text-anchor="middle" font-family="'Anton', sans-serif" font-size="36" fill="#38BDF8">AMUL PROCESSING PLANT</text>
      ` : `
        <!-- Home Breakfast Table -->
        <ellipse cx="${w * 0.5}" cy="${h * 0.75}" rx="${w * 0.38}" ry="${h * 0.22}" fill="#FDFBF7" stroke="#E2E8F0" stroke-width="6" />
        <!-- Glasses of Milk -->
        <g transform="translate(${w * 0.5 - 90}, ${h * 0.65})">
          <rect x="0" y="0" width="38" height="75" rx="6" fill="#FFFDF7" stroke="#CBD5E1" stroke-width="2" />
          <rect x="70" y="0" width="38" height="75" rx="6" fill="#FFFDF7" stroke="#CBD5E1" stroke-width="2" />
          <rect x="140" y="0" width="38" height="75" rx="6" fill="#FFFDF7" stroke="#CBD5E1" stroke-width="2" />
        </g>
      `}
    </g>

    <!-- Amul Scene Badge Top Right -->
    <rect x="${w - 380}" y="40" width="340" height="52" rx="10" fill="rgba(23,23,23,0.75)" />
    <text x="${w - 210}" y="74" text-anchor="middle" font-family="'Anton', sans-serif" font-size="19" fill="#FFFDF7" letter-spacing="1">
      ${title}
    </text>
  </svg>`;
}

/* ======================================================== */
/* 5. PRODUCTS & HERO LAYERS                                */
/* ======================================================== */
function getProductSvg(id, w, h) {
  const configs = {
    taaza: { top: '#1E8FD8', bottom: '#0F5685', accent: '#E51B23', name: 'TAAZA', sub: 'TONED MILK' },
    gold: { top: '#E51B23', bottom: '#991B1B', accent: '#F5C82A', name: 'GOLD', sub: 'FULL CREAM' },
    'calci-plus': { top: '#16A34A', bottom: '#14532D', accent: '#0284C7', name: 'CALCI+', sub: 'HIGH CALCIUM' },
    'lactose-free': { top: '#7C3AED', bottom: '#4C1D95', accent: '#F59E0B', name: 'LACTOSE FREE', sub: 'ZERO LACTOSE' },
  };
  const cfg = configs[id] || configs.taaza;
  const s = w / 300;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <filter id="psh-${id}">
        <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#171717" flood-opacity="0.2" />
      </filter>
    </defs>
    <g filter="url(#psh-${id})" transform="translate(${w * 0.12}, ${h * 0.05}) scale(${s})">
      <polygon points="25,30 145,30 175,10 55,10" fill="${cfg.top}" />
      <polygon points="145,30 175,10 175,45 145,65" fill="#6B7280" />
      <rect x="25" y="30" width="120" height="320" rx="4" fill="#FFFFFF" />
      <rect x="25" y="30" width="120" height="90" fill="${cfg.top}" />
      <rect x="25" y="310" width="120" height="40" fill="${cfg.bottom}" />
      <polygon points="145,30 175,45 175,335 145,350" fill="#9CA3AF" />
      <ellipse cx="120" cy="30" rx="12" ry="6" fill="${cfg.accent}" stroke="#FFF" stroke-width="1.5" />
      <text x="85" y="65" text-anchor="middle" font-family="'Anton', sans-serif" font-size="28" fill="#FFFFFF">Amul</text>
      <text x="85" y="80" text-anchor="middle" font-family="system-ui" font-size="6" font-weight="700" fill="#FFFFFF" opacity="0.85">THE TASTE OF INDIA</text>
      <text x="85" y="150" text-anchor="middle" font-family="'Anton', sans-serif" font-size="24" fill="${cfg.top}">${cfg.name}</text>
      <text x="85" y="170" text-anchor="middle" font-family="system-ui" font-size="7" font-weight="700" fill="#4B5563">${cfg.sub}</text>
      <text x="85" y="336" text-anchor="middle" font-family="'Anton', sans-serif" font-size="18" fill="#FFFFFF">1 L</text>
    </g>
  </svg>`;
}

function getCartonHandSvg(w, h) {
  // Always use reference coordinate space 1448x1086 with exact GEOMETRY:
  // Pivot at (760, 560), Opening at (1094, 880), Lip Normal [0.72, 0.69]
  // Angle from pivot to opening: atan2(320, 334) = 43.784 degrees. Distance = 462.55px.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 1086" width="${w}" height="${h}">
    <defs>
      <linearGradient id="cartonBodyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="60%" stop-color="#FBFBFB" />
        <stop offset="100%" stop-color="#F0EFEA" />
      </linearGradient>
      <linearGradient id="taazaBlueGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38BDF8" />
        <stop offset="30%" stop-color="#1E8FD8" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>
      <linearGradient id="taazaSideBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0F5685" />
        <stop offset="100%" stop-color="#083344" />
      </linearGradient>
      <filter id="cartonShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-12" dy="16" stdDeviation="18" flood-color="#171717" flood-opacity="0.22" />
      </filter>
      <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FED7AA" />
        <stop offset="65%" stop-color="#FDBA74" />
        <stop offset="100%" stop-color="#FB923C" />
      </linearGradient>
    </defs>

    <!-- Carton & Hand Assembly anchored at Pivot (760, 560) rotated along pour axis (43.784deg) -->
    <g transform="translate(760, 560) rotate(43.784)" filter="url(#cartonShadow)">
      <!-- 3D Isometric Side Face (Top/Side Depth) -->
      <polygon points="-360,-175 -320,-115 360,-115 320,-175" fill="url(#taazaSideBlue)" />
      <polygon points="320,-175 360,-115 440,-115 400,-175" fill="#083344" />

      <!-- Carton Front Face Body (x: -320 to 360, y: -115 to 115) -->
      <rect x="-320" y="-115" width="680" height="230" rx="8" fill="url(#cartonBodyGrad)" stroke="#CBD5E1" stroke-width="2" />

      <!-- Blue Section (Amul Taaza) -->
      <path d="M 100 -115 L 360 -115 L 360 115 L 100 115 Z" fill="url(#taazaBlueGrad)" />

      <!-- Slanted Gable Peak towards Spout -->
      <polygon points="360,-115 445,-115 462.5,0 360,0" fill="#0284C7" />
      <polygon points="360,0 462.5,0 445,115 360,115" fill="#0369A1" />
      <line x1="360" y1="0" x2="462.5" y2="0" stroke="#FFFFFF" stroke-width="2" opacity="0.6" />

      <!-- Red Base Stripe (Bottom of Carton) -->
      <rect x="-320" y="-115" width="75" height="230" fill="#E51B23" rx="4" />
      <text x="-280" y="8" text-anchor="middle" font-family="'Anton', sans-serif" font-size="28" fill="#FFFFFF">1 L</text>

      <!-- Amul Branding on Blue Section -->
      <g transform="translate(230, 0)">
        <text x="0" y="-30" text-anchor="middle" font-family="'Anton', sans-serif" font-size="44" fill="#FFFFFF" letter-spacing="1">Amul</text>
        <text x="0" y="-10" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF" opacity="0.9">THE TASTE OF INDIA</text>
        <text x="0" y="42" text-anchor="middle" font-family="'Anton', sans-serif" font-size="42" fill="#FDE047" letter-spacing="1.5">TAAZA</text>
        <text x="0" y="68" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#E0F2FE" letter-spacing="0.5">TONED MILK · UHT</text>
      </g>

      <!-- Quality & Nutrition on White Body -->
      <g transform="translate(-110, 0)">
        <rect x="-80" y="-85" width="160" height="170" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
        <text x="0" y="-50" text-anchor="middle" font-family="'Anton', sans-serif" font-size="26" fill="#1E8FD8">Amul TAAZA</text>
        <text x="0" y="-28" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#64748B">FRESH &amp; PURE</text>
        <line x1="-60" y1="-15" x2="60" y2="-15" stroke="#E2E8F0" stroke-width="1" />
        <text x="0" y="10" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284C7">FAT 3.0% MIN</text>
        <text x="0" y="32" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#475569">SNF 8.5% MIN</text>
        <text x="0" y="62" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8.5" font-weight="600" fill="#16A34A">NO PRESERVATIVES</text>
      </g>

      <!-- Natural Hand Grip holding Carton at Pivot (0, 0) -->
      <!-- Arm entering from top-left -->
      <path d="M -180 -150 C -220 -230 -260 -300 -330 -340 L -250 -380 C -170 -300 -110 -200 -50 -120 Z" fill="url(#skinGrad)" />
      <!-- Palm / Thumb grasping front of carton -->
      <ellipse cx="-20" cy="-35" rx="55" ry="32" fill="url(#skinGrad)" stroke="#FDBA74" stroke-width="2.5" transform="rotate(-15 -20 -35)" />
      <ellipse cx="14" cy="-42" rx="14" ry="10" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="1.5" />
      <!-- Fingers wrapped along bottom edge -->
      <path d="M -50 115 C -30 148 20 148 40 115" fill="url(#skinGrad)" stroke="#FDBA74" stroke-width="2" />
      <path d="M -120 115 C -100 145 -60 145 -40 115" fill="url(#skinGrad)" stroke="#FDBA74" stroke-width="2" />

      <!-- POUR SPOUT CAP EXACTLY AT (462.55, 0) -> WORLD (1094, 880) -->
      <ellipse cx="456" cy="0" rx="20" ry="16" fill="#0284C7" stroke="#FFFFFF" stroke-width="2.5" />
      <ellipse cx="462.55" cy="0" rx="15" ry="12" fill="#0369A1" stroke="#38BDF8" stroke-width="1.5" />
      <ellipse cx="462.55" cy="0" rx="10" ry="8" fill="#0C4A6E" />
      <!-- Glossy plastic highlight on spout lip -->
      <path d="M 454 -10 A 15 12 0 0 1 472 -2" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    </g>
  </svg>`;
}

function getGlassHandSvg(w, h) {
  // Always use reference coordinate space 1448x1086 with exact GEOMETRY:
  // Rim outer: cx: 390.5, cy: 277.5, rx: 213.5, ry: 46.5
  // Rim inner: cx: 391, cy: 277.5, rx: 205, ry: 41
  // Inner bottom: cx: 395, cy: 722, rx: 184, ry: 29
  // Base bottom: y: 818 (cx: 395, cy: 818, rx: 189.5, ry: 28)
  // Left outer wall: (177, 277.5) to (209.4, 818)
  // Right outer wall: (604, 277.5) to (587.8, 818)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 1086" width="${w}" height="${h}">
    <defs>
      <linearGradient id="glassBodyGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
        <stop offset="8%" stop-color="rgba(255,255,255,0.14)" />
        <stop offset="50%" stop-color="rgba(255,255,255,0.06)" />
        <stop offset="92%" stop-color="rgba(255,255,255,0.14)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.28)" />
      </linearGradient>
      <linearGradient id="thickBaseGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
        <stop offset="50%" stop-color="rgba(235,245,255,0.32)" />
        <stop offset="100%" stop-color="rgba(215,230,245,0.48)" />
      </linearGradient>
      <filter id="glassContactShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
    </defs>

    <!-- Table Contact Shadow underneath heavy glass base -->
    <ellipse cx="395" cy="824" rx="205" ry="32" fill="rgba(23,23,23,0.16)" filter="url(#glassContactShadow)" />

    <!-- Glass Outer Body Silhouette -->
    <path d="
      M 177 277.5
      L 209.4 818
      A 189.5 28 0 0 0 587.8 818
      L 604 277.5
      A 213.5 46.5 0 0 0 177 277.5
      Z"
      fill="url(#glassBodyGrad)"
      stroke="rgba(255,255,255,0.55)"
      stroke-width="2.5"
    />

    <!-- Heavy Solid Glass Base (y: 722 inner bottom to y: 818 base bottom) -->
    <path d="
      M 211 722
      A 184 29 0 0 0 579 722
      L 587.8 818
      A 189.5 28 0 0 1 209.4 818
      Z"
      fill="url(#thickBaseGrad)"
      stroke="rgba(255,255,255,0.35)"
      stroke-width="1.5"
    />

    <!-- Inner Bottom Floor Ellipse -->
    <ellipse cx="395" cy="722" rx="184" ry="29" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />

    <!-- Base Bottom Rim Ring -->
    <ellipse cx="395" cy="818" rx="189.5" ry="28" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2" />

    <!-- Back Half of Rim (Upper Arc) visible through empty glass -->
    <path d="M 177 277.5 A 213.5 46.5 0 0 1 604 277.5" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" />
    <path d="M 186 277.5 A 205 41 0 0 1 596 277.5" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" />

    <!-- Hand holding glass (Fingers wrapping behind the glass from right) -->
    <g opacity="0.6">
      <ellipse cx="585" cy="565" rx="34" ry="18" fill="#FDBA74" stroke="#FB923C" stroke-width="1.5" />
      <ellipse cx="575" cy="625" rx="36" ry="18" fill="#FDBA74" stroke="#FB923C" stroke-width="1.5" />
      <ellipse cx="560" cy="685" rx="34" ry="18" fill="#FDBA74" stroke="#FB923C" stroke-width="1.5" />
      <rect x="635" y="520" width="160" height="180" rx="24" fill="#FED7AA" stroke="#FDBA74" stroke-width="2" />
    </g>
  </svg>`;
}

function getGlassSheenSvg(w, h) {
  // Always use reference coordinate space 1448x1086 with exact GEOMETRY:
  // Rendered over milk liquid with source-atop to give realistic glossy glass reflections
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 1086" width="${w}" height="${h}">
    <defs>
      <linearGradient id="sheenLeftGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.6)" />
        <stop offset="50%" stop-color="rgba(255,255,255,0.3)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <!-- Left Specular Reflection Band following left wall taper -->
    <path d="M 200 300 L 226 760" stroke="url(#sheenLeftGrad)" stroke-width="18" stroke-linecap="round" />
    <!-- Bright Pinpoint Reflection Core -->
    <path d="M 205 315 L 228 745" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />
    <!-- Right Specular Reflection Band following right wall taper -->
    <path d="M 584 300 L 572 760" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.32" />
  </svg>`;
}

function getGlassFrontSvg(w, h) {
  // Always use reference coordinate space 1448x1086 with exact GEOMETRY:
  // Drawn ON TOP of the poured milk: front rim and thumb polygon holding the glass
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 1086" width="${w}" height="${h}">
    <defs>
      <linearGradient id="thumbGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FED7AA" />
        <stop offset="60%" stop-color="#FDBA74" />
        <stop offset="100%" stop-color="#FB923C" />
      </linearGradient>
      <filter id="thumbShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="-4" dy="6" stdDeviation="6" flood-color="#7C2D12" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- Front Half of Outer Rim (Lower Arc in front of milk) -->
    <path d="M 177 277.5 A 213.5 46.5 0 0 0 604 277.5" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="4" />
    <path d="M 186 277.5 A 205 41 0 0 0 596 277.5" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" />

    <!-- Thumb in front of glass matching GEOMETRY.glass.thumbPolygon exactly -->
    <polygon
      filter="url(#thumbShadow)"
      points="424,556 430,540 443,523 460,511 484,503 515,497 550,492 590,487 640,482 640,614 592,604 560,608 525,612 490,608 463,598 443,585 430,571"
      fill="url(#thumbGrad)"
      stroke="#FDBA74"
      stroke-width="2"
    />
    <!-- Thumb nail & cuticle detail -->
    <ellipse cx="452" cy="548" rx="15" ry="11" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="1.5" transform="rotate(-25 452 548)" />
    <path d="M 482 522 Q 487 544 492 566" fill="none" stroke="#F59E0B" stroke-width="1.8" opacity="0.6" />
  </svg>`;
}

function getPosterFgSvg(w, h) {
  // Transparent foreground placeholder - no stray ellipses
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"></svg>`;
}

/* ======================================================== */
/* 6. RUN ASSET PIPELINE                                     */
/* ======================================================== */
async function run() {
  console.log('--- Generating Amul Website Image Assets ---');

  // Moments
  await svgToWebp(getBreakfastSvg(1200, 900), path.join(PUBLIC, 'moments', 'breakfast-1200.webp'), 1200, 900);
  await svgToWebp(getBreakfastSvg(720, 540), path.join(PUBLIC, 'moments', 'breakfast-720.webp'), 720, 540);

  await svgToWebp(getCoffeeSvg(1200, 900), path.join(PUBLIC, 'moments', 'coffee-1200.webp'), 1200, 900);
  await svgToWebp(getCoffeeSvg(720, 540), path.join(PUBLIC, 'moments', 'coffee-720.webp'), 720, 540);

  await svgToWebp(getDessertSvg(1200, 900), path.join(PUBLIC, 'moments', 'dessert-1200.webp'), 1200, 900);
  await svgToWebp(getDessertSvg(720, 540), path.join(PUBLIC, 'moments', 'dessert-720.webp'), 720, 540);

  // FX: Milk Drip Edge
  await svgToWebp(getMilkDripEdgeSvg(1600, 533), path.join(PUBLIC, 'fx', 'milk-drip-edge-1600.webp'), 1600, 533);

  // Hero backgrounds & posters
  await svgToWebp(getHeroBgSvg(1672, 880), path.join(PUBLIC, 'hero', 'bg-1672.webp'), 1672, 880);
  await svgToWebp(getHeroBgSvg(960, 505), path.join(PUBLIC, 'hero', 'bg-960.webp'), 960, 505);
  await svgToWebp(getHeroBgSvg(1672, 880), path.join(PUBLIC, 'hero', 'poster-1672.webp'), 1672, 880);
  await svgToWebp(getHeroBgSvg(960, 505), path.join(PUBLIC, 'hero', 'poster-960.webp'), 960, 505);
  await svgToWebp(getPosterFgSvg(1672, 880), path.join(PUBLIC, 'hero', 'poster-fg-1672.webp'), 1672, 880);
  await svgToWebp(getPosterFgSvg(960, 505), path.join(PUBLIC, 'hero', 'poster-fg-960.webp'), 960, 505);

  // Hero interactive layers
  await svgToWebp(getCartonHandSvg(1448, 1086), path.join(PUBLIC, 'hero', 'carton-hand-1448.webp'), 1448, 1086);
  await svgToWebp(getCartonHandSvg(800, 600), path.join(PUBLIC, 'hero', 'carton-hand-800.webp'), 800, 600);
  await svgToWebp(getGlassHandSvg(1448, 1086), path.join(PUBLIC, 'hero', 'glass-hand-1448.webp'), 1448, 1086);
  await svgToWebp(getGlassHandSvg(800, 600), path.join(PUBLIC, 'hero', 'glass-hand-800.webp'), 800, 600);
  await svgToWebp(getGlassSheenSvg(1448, 1086), path.join(PUBLIC, 'hero', 'glass-sheen-1448.webp'), 1448, 1086);
  await svgToWebp(getGlassSheenSvg(800, 600), path.join(PUBLIC, 'hero', 'glass-sheen-800.webp'), 800, 600);
  await svgToWebp(getGlassFrontSvg(1448, 1086), path.join(PUBLIC, 'hero', 'glass-front-1448.webp'), 1448, 1086);
  await svgToWebp(getGlassFrontSvg(800, 600), path.join(PUBLIC, 'hero', 'glass-front-800.webp'), 800, 600);

  // Gold reveal poster
  await svgToWebp(getGoldPosterSvg(1086, 1448), path.join(PUBLIC, 'gold', 'poster-1086.webp'), 1086, 1448);
  await svgToWebp(getGoldPosterSvg(720, 960), path.join(PUBLIC, 'gold', 'poster-720.webp'), 720, 960);

  // Products
  const prods = ['taaza', 'gold', 'calci-plus', 'lactose-free'];
  for (const p of prods) {
    await svgToWebp(getProductSvg(p, 475, 900), path.join(PUBLIC, 'products', `${p}-480.webp`), 475, 900);
    await svgToWebp(getProductSvg(p, 475, 900), path.join(PUBLIC, 'products', `${p}-900.webp`), 475, 900);
  }

  // Story scenes
  const scenes = ['dawn', 'herd', 'milking', 'coop', 'road', 'dairy', 'home'];
  for (const s of scenes) {
    await svgToWebp(getStorySceneSvg(s, 1920, 1080), path.join(PUBLIC, 'story', `${s}-1920.webp`), 1920, 1080);
    await svgToWebp(getStorySceneSvg(s, 960, 540), path.join(PUBLIC, 'story', `${s}-960.webp`), 960, 540);
  }

  console.log('--- All Website Assets Successfully Generated! ---');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
