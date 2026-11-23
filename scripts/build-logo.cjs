/**
 * Builds the Aventra logo as clean vector files, traced from the supplied
 * artwork (brand-source/aventra-logo.jpg). Vectors stay sharp at every size
 * and weigh about 2 KB each.
 *
 *   node scripts/build-logo.cjs
 *
 * Writes:
 *   public/brand/mark.svg            the "A" on its own
 *   public/brand/logo-on-light.svg   "A" + AVENTRA + tagline in black lettering
 *   public/brand/logo-on-dark.svg    "A" + AVENTRA + tagline in white lettering
 *   src/app/icon.svg                 favicon (the "A" only)
 *   src/app/apple-icon.png           home-screen icon for phones
 */
const fs = require("node:fs");
const sharp = require("sharp");

// The "A", in the coordinates measured on the artwork (a 880 x 780 tracing grid).
const MARK_BOX = { x: 56, y: 76, width: 776, height: 644 };

const gradients = `
  <linearGradient id="a-left" gradientUnits="userSpaceOnUse" x1="470" y1="90" x2="140" y2="700">
    <stop offset="0" stop-color="#7340c4"/>
    <stop offset="0.22" stop-color="#a45be6"/>
    <stop offset="0.55" stop-color="#d85cf0"/>
    <stop offset="1" stop-color="#9a35f5"/>
  </linearGradient>
  <linearGradient id="a-right" gradientUnits="userSpaceOnUse" x1="500" y1="100" x2="650" y2="465">
    <stop offset="0" stop-color="#dcaaf9"/>
    <stop offset="0.45" stop-color="#cf63f7"/>
    <stop offset="1" stop-color="#bd1df9"/>
  </linearGradient>
  <linearGradient id="a-foot" gradientUnits="userSpaceOnUse" x1="620" y1="460" x2="770" y2="675">
    <stop offset="0" stop-color="#8a1fe8"/>
    <stop offset="1" stop-color="#3f00ad"/>
  </linearGradient>
  <linearGradient id="a-wing-left" gradientUnits="userSpaceOnUse" x1="300" y1="545" x2="482" y2="506">
    <stop offset="0" stop-color="#e03cec"/>
    <stop offset="1" stop-color="#5a0aa8"/>
  </linearGradient>
  <linearGradient id="a-wing-right" gradientUnits="userSpaceOnUse" x1="482" y1="506" x2="620" y2="520">
    <stop offset="0" stop-color="#3a0585"/>
    <stop offset="1" stop-color="#5c0cc4"/>
  </linearGradient>
  <linearGradient id="a-edge" gradientUnits="userSpaceOnUse" x1="420" y1="97" x2="68" y2="712">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0.95"/>
  </linearGradient>`;

const shapes = `
  <path d="M482 506 Q545 476 583 470 L632 563 Q560 522 482 506 Z" fill="url(#a-wing-right)"/>
  <path d="M327 500 Q410 492 482 506 Q380 530 290 566 Z" fill="url(#a-wing-left)"/>
  <polygon points="583,470 708,455 820,670 690,675" fill="url(#a-foot)"/>
  <polygon points="515,85 708,455 583,470 468,252" fill="url(#a-right)"/>
  <polygon points="420,97 515,85 468,252 222,685 68,712" fill="url(#a-left)"/>
  <polygon points="420,97 515,85 468,252" fill="#4a1fa8" opacity="0.35"/>
  <path d="M420 97 L68 712 L222 685" fill="none" stroke="url(#a-edge)" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M420 97 L515 85" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="5" stroke-linecap="round"/>`;

// AVENTRA lettering: geometric strokes on a 20-unit cap height, with the brand's crossbar-less "A".
const letters = [
  "M2 18.5 L10 2 L18 18.5",
  "M2 1.5 L10 18 L18 1.5",
  "M17 2 H4 V18 H17 M4 10 H15",
  "M3 18.5 V2 L17 18 V1.5",
  "M2 2 H18 M10 2 V18.5",
  "M4 18.5 V2 H12 a4.5 4.5 0 0 1 0 9 H4 M11 11 L17 18.5",
  "M2 18.5 L10 2 L18 18.5",
];
const LETTER_ADVANCE = 29.3;
const TAGLINE = "MULTI-DISCIPLINE HOLDING COMPANY";

function mark(height) {
  const scale = height / MARK_BOX.height;
  return {
    width: MARK_BOX.width * scale,
    svg: `<g transform="scale(${scale.toFixed(5)}) translate(${-MARK_BOX.x} ${-MARK_BOX.y})">${shapes}\n  </g>`,
  };
}

function markFile(size, padding) {
  const inner = size - padding * 2;
  const scale = inner / Math.max(MARK_BOX.width, MARK_BOX.height);
  const dx = (size - MARK_BOX.width * scale) / 2;
  const dy = (size - MARK_BOX.height * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>${gradients}
  </defs>
  <g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${scale.toFixed(5)}) translate(${-MARK_BOX.x} ${-MARK_BOX.y})">${shapes}
  </g>
</svg>
`;
}

function lockup(ink) {
  const height = 100;
  const a = mark(height);
  const capScale = 1.45; // cap height 29 of 100
  const wordX = a.width + 22;
  const wordY = 21; // lettering sits in the upper part, leaving room for the tagline
  const taglineY = wordY + 20 * capScale + 23;
  const wordWidth = (LETTER_ADVANCE * (letters.length - 1) + 20) * capScale;
  const width = Math.ceil(wordX + wordWidth + 4);
  const paths = letters
    .map((d, index) => `<path d="${d}" transform="translate(${(index * LETTER_ADVANCE).toFixed(1)} 0)"/>`)
    .join("\n      ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Aventra">
  <defs>${gradients}
  </defs>
  ${a.svg}
  <g transform="translate(${wordX.toFixed(1)} ${wordY.toFixed(1)}) scale(${capScale})">
    <g fill="none" stroke="${ink}" stroke-width="3.7" stroke-linecap="square" stroke-linejoin="miter">
      ${paths}
    </g>
    <polygon points="7.3,16.4 10,11.2 12.7,16.4" fill="#a855f7"/>
    <polygon points="${(6 * LETTER_ADVANCE + 7.3).toFixed(1)},16.4 ${(6 * LETTER_ADVANCE + 10).toFixed(1)},11.2 ${(6 * LETTER_ADVANCE + 12.7).toFixed(1)},16.4" fill="#a855f7"/>
  </g>
  <text x="${(wordX + 2).toFixed(1)}" y="${taglineY.toFixed(1)}" textLength="${(wordWidth - 4).toFixed(1)}" lengthAdjust="spacing" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="400" fill="${ink}" fill-opacity="0.9">${TAGLINE}</text>
</svg>
`;
}

(async () => {
  fs.mkdirSync("public/brand", { recursive: true });
  fs.writeFileSync("public/brand/mark.svg", markFile(512, 16));
  fs.writeFileSync("public/brand/logo-on-light.svg", lockup("#15132d"));
  fs.writeFileSync("public/brand/logo-on-dark.svg", lockup("#ffffff"));
  fs.writeFileSync("src/app/icon.svg", markFile(512, 28));

  // iOS home-screen icons must be opaque, so this one sits on the site's dark colour.
  const glyph = await sharp(Buffer.from(markFile(512, 0))).resize(124, 124).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: "#17171f" } })
    .composite([{ input: glyph, gravity: "centre" }])
    .png()
    .toFile("src/app/apple-icon.png");

  for (const file of ["mark.svg", "logo-on-light.svg", "logo-on-dark.svg"]) {
    console.log(file, fs.statSync(`public/brand/${file}`).size, "bytes");
  }
})();
