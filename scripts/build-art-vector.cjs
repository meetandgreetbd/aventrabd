/**
 * Draws the hero illustration for each page as vector artwork (SVG), following
 * the compositions in the design mockup: glass rings and sphere, connected
 * spheres, growth bars, glass loops, stacked cubes, compass, chat bubble, globe.
 *
 *   node scripts/build-art-vector.cjs     -> public/art-vector/*.svg  (fallback set, not used by the site)
 *
 * Everything is described in code below, so colours and shapes can be tuned
 * and regenerated. The files have transparent backgrounds and stay sharp at any size.
 */
const fs = require("node:fs");

const OUT = "public/art-vector";
const n = (value) => Number(value.toFixed(1));

const svg = (width, height, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">\n<defs>${defs}\n</defs>${body}\n</svg>\n`;

const blur = (id, amount) =>
  `\n<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${amount}"/></filter>`;

const radial = (id, stops, cx = 0.34, cy = 0.28, r = 0.8) =>
  `\n<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
    .join("")}</radialGradient>`;

const linear = (id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) =>
  `\n<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
    .join("")}</linearGradient>`;

/** The one violet ramp and one set of metal greys used by every illustration. */
const P = {
  pale: "#efeaff",
  light: "#cfc4ff",
  soft: "#b7a6ff",
  mid: "#7c5cf5",
  main: "#4f1fe0",
  deep: "#2a0fa8",
  dark: "#14064f",
};

const PURPLE_BALL = [[0, P.pale], [0.18, P.soft], [0.5, P.main], [0.8, P.deep], [1, P.dark]];
const CHROME_BALL = [[0, "#ffffff"], [0.2, "#cfcbe8"], [0.55, "#6f6a9c"], [0.85, "#2d2952"], [1, "#17142f"]];

/** A glossy sphere with a soft highlight, a rim light and a contact shadow. */
function sphere(x, y, r, fill, shadow = true) {
  return `
<g>${shadow ? `\n  <ellipse cx="${n(x + r * 0.15)}" cy="${n(y + r * 1.02)}" rx="${n(r * 0.9)}" ry="${n(r * 0.22)}" fill="#1b1250" opacity="0.22" filter="url(#soft)"/>` : ""}
  <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${fill})"/>
  <ellipse cx="${n(x - r * 0.32)}" cy="${n(y - r * 0.42)}" rx="${n(r * 0.34)}" ry="${n(r * 0.2)}" fill="#ffffff" opacity="0.75" transform="rotate(-28 ${n(x - r * 0.32)} ${n(y - r * 0.42)})"/>
  <path d="M ${n(x - r * 0.62)} ${n(y + r * 0.6)} A ${r} ${r} 0 0 0 ${n(x + r * 0.78)} ${n(y + r * 0.45)}" fill="none" stroke="#d9ccff" stroke-width="${n(Math.max(1.5, r * 0.07))}" stroke-linecap="round" opacity="0.55"/>
</g>`;
}

/* ---------- About: glass rings around a purple sphere ---------- */
function rings() {
  const cx = 420;
  const cy = 330;
  const defs =
    blur("soft", 10) +
    blur("glow", 26) +
    radial("ball", PURPLE_BALL) +
    linear("band", [[0, "#ffffff", 1], [0.5, "#e6e3f5", 0.9], [1, "#a39cd0", 0.75]]) +
    linear("edge", [[0, "#ffffff", 1], [1, "#ffffff", 0.2]]);
  let body = `\n<circle cx="${cx}" cy="${cy}" r="150" fill="${P.mid}" opacity="0.28" filter="url(#glow)"/>`;
  [306, 262, 220, 180, 142, 106].forEach((radius, index) => {
    const width = 28 - index * 2;
    const opacity = 0.6 + index * 0.08;
    body += `
<circle cx="${cx + 6}" cy="${cy + 10}" r="${radius}" fill="none" stroke="#3a356e" stroke-width="${width}" opacity="0.3" filter="url(#soft)"/>
<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="url(#band)" stroke-width="${width}" opacity="${n(opacity)}"/>
<circle cx="${cx}" cy="${cy}" r="${n(radius + width / 2 - 1)}" fill="none" stroke="url(#edge)" stroke-width="1.6" opacity="0.9"/>
<circle cx="${cx}" cy="${cy}" r="${n(radius - width / 2 + 1)}" fill="none" stroke="#7a74ad" stroke-width="1.4" opacity="0.6"/>`;
  });
  body += sphere(cx, cy, 66, "ball");
  return svg(760, 660, defs, body);
}

/* ---------- Culture: connected spheres ---------- */
function network() {
  const nodes = [
    [330, 78, 40, "chrome"],
    [112, 190, 44, "chrome"],
    [468, 96, 20, "purple"],
    [246, 148, 15, "purple"],
    [414, 288, 52, "purple"],
    [270, 266, 18, "chrome"],
    [156, 332, 22, "purple"],
    [224, 452, 44, "chrome"],
    [420, 552, 48, "purple"],
    [300, 596, 16, "chrome"],
    [530, 420, 14, "chrome"],
  ];
  const links = [[0, 2], [0, 3], [0, 4], [1, 3], [1, 5], [1, 6], [3, 5], [4, 5], [4, 7], [4, 8], [4, 10], [5, 6], [6, 7], [7, 8], [7, 9], [8, 9], [8, 10]];
  const defs = blur("soft", 9) + blur("glow", 30) + radial("purple", PURPLE_BALL) + radial("chrome", CHROME_BALL);
  let body = `\n<ellipse cx="330" cy="330" rx="210" ry="250" fill="${P.mid}" opacity="0.14" filter="url(#glow)"/>`;
  for (const [from, to] of links) {
    body += `\n<line x1="${nodes[from][0]}" y1="${nodes[from][1]}" x2="${nodes[to][0]}" y2="${nodes[to][1]}" stroke="#5f5a8c" stroke-width="2.2" opacity="0.62"/>`;
  }
  for (const [x, y, r, tone] of nodes) body += sphere(x, y, r, tone, r > 30);
  return svg(620, 660, defs, body);
}

/* ---------- Careers: rising bars and arrow ---------- */
function bars() {
  const base = 560;
  const heights = [78, 128, 190, 262, 340, 430];
  const defs =
    blur("soft", 8) +
    blur("glow", 28) +
    linear("front", [[0, P.mid], [0.55, P.main], [1, P.dark]], 0, 0, 0, 1) +
    linear("frontPale", [[0, "#c9c2ee"], [0.6, "#8b84c4"], [1, "#5f58a0"]], 0, 0, 0, 1) +
    linear("side", [[0, P.deep], [1, P.dark]], 0, 0, 0, 1) +
    linear("sidePale", [[0, "#6d66a8"], [1, "#3f3a72"]], 0, 0, 0, 1) +
    linear("arrow", [[0, P.mid, 0], [0.35, P.mid, 0.55], [1, P.main, 1]], 0, 1, 1, 0) +
    linear("shine", [[0, "#ffffff", 0.55], [1, "#ffffff", 0]], 0, 0, 1, 0) +
    linear("mirror", [[0, P.main, 0.42], [1, P.main, 0]], 0, 0, 0, 1) +
    linear("mirrorPale", [[0, "#8b84c4", 0.35], [1, "#8b84c4", 0]], 0, 0, 0, 1) +
    linear("mirrorSide", [[0, P.dark, 0.3], [1, P.dark, 0]], 0, 0, 0, 1);
  let body = `
<ellipse cx="380" cy="${base + 6}" rx="330" ry="34" fill="${P.mid}" opacity="0.5" filter="url(#glow)"/>
<path d="M30 ${base + 10} L700 ${base - 30}" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
<path d="M60 ${base + 44} L720 ${base + 4}" stroke="#a99cf0" stroke-width="1.2" opacity="0.5"/>`;
  heights.forEach((height, index) => {
    const x = 96 + index * 96;
    const y = base - height - index * 5;
    const bottom = base - index * 5;
    const width = 56;
    const dx = 20;
    const dy = -12;
    const pale = index < 2;
    body += `
<g opacity="${n(0.72 + index * 0.056)}">
  <polygon points="${x + width},${y} ${x + width + dx},${y + dy} ${x + width + dx},${bottom + dy} ${x + width},${bottom}" fill="url(#${pale ? "sidePale" : "side"})"/>
  <polygon points="${x},${y} ${x + dx},${y + dy} ${x + width + dx},${y + dy} ${x + width},${y}" fill="${pale ? "#e4e1f6" : P.light}"/>
  <rect x="${x}" y="${y}" width="${width}" height="${bottom - y}" fill="url(#${pale ? "frontPale" : "front"})"/>
  <rect x="${x}" y="${y}" width="15" height="${bottom - y}" fill="url(#shine)"/>
  <rect x="${x}" y="${bottom - 46}" width="${width}" height="46" fill="${P.soft}" opacity="0.3"/>
  <rect x="${x}" y="${bottom + 2}" width="${width}" height="${Math.min(110, (bottom - y) * 0.42)}" fill="url(#${pale ? "mirrorPale" : "mirror"})"/>
  <polygon points="${x + width},${bottom + 2} ${x + width + dx},${bottom + dy + 2} ${x + width + dx},${bottom + dy + 60} ${x + width},${bottom + 62}" fill="url(#mirrorSide)"/>
</g>`;
  });
  body += `
<path d="M70 300 C 250 290, 440 210, 640 52" fill="none" stroke="url(#arrow)" stroke-width="15" stroke-linecap="round"/>
<polygon points="690,8 668,96 612,38" fill="${P.main}"/>
<polygon points="690,8 668,96 648,52" fill="${P.deep}"/>`;
  return svg(760, 700, defs, body);
}

/* ---------- Life at Aventra: interlocked glass loops ---------- */
function loops() {
  // Two wide glass rings, as in the design: a larger one behind and to the left, a
  // smaller one in front at the top right. The glass is pale and see-through, the
  // holes show darker smoke, and the rings turn deep violet where they overlap.
  const ellipsePath = (cx, cy, rx, ry) =>
    `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
  const rings = {
    back: { outer: [300, 372, 252, 240], inner: [312, 366, 150, 140] },
    front: { outer: [424, 246, 208, 218], inner: [430, 240, 122, 134] },
    base: { outer: [452, 468, 226, 150], inner: [452, 452, 128, 66] },
  };
  const annulus = (ring) => `${ellipsePath(...ring.outer)} ${ellipsePath(...ring.inner)}`;

  const defs =
    blur("soft", 14) +
    blur("glow", 36) +
    blur("fine", 4) +
    linear("glassBack", [[0, "#ffffff", 0.82], [0.45, P.pale, 0.5], [1, P.soft, 0.6]], 0.1, 0, 0.9, 1) +
    linear("glassFront", [[0, "#ffffff", 0.9], [0.5, P.pale, 0.46], [1, P.light, 0.55]], 0.9, 0, 0.1, 1) +
    linear("overlap", [[0, P.soft, 0.25], [0.45, P.mid, 0.75], [1, P.main, 0.95]], 0.5, 0, 0.5, 1) +
    linear("baseFill", [[0, P.mid, 0.75], [0.5, P.main, 0.92], [1, P.dark, 0.95]], 0, 0, 1, 1) +
    linear("hole", [[0, "#3f3d57", 0.34], [1, "#55536f", 0.12]], 0.2, 0, 0.8, 1) +
    `\n<clipPath id="inBack"><path clip-rule="evenodd" d="${annulus(rings.back)}"/></clipPath>` +
    `\n<clipPath id="inBase"><path clip-rule="evenodd" d="${annulus(rings.base)}"/></clipPath>`;

  const edges = (ring, strength = 1) => `
<path d="${ellipsePath(...ring.outer)}" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="${0.9 * strength}"/>
<path d="${ellipsePath(...ring.inner)}" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="${0.75 * strength}"/>`;

  const body = `
<ellipse cx="370" cy="350" rx="290" ry="260" fill="${P.mid}" opacity="0.26" filter="url(#glow)"/>
<path fill-rule="evenodd" d="${annulus(rings.back)}" fill="#14122b" opacity="0.2" filter="url(#soft)" transform="translate(10 22)"/>

<!-- deep violet ring lying behind, at the bottom -->
<path fill-rule="evenodd" d="${annulus(rings.base)}" fill="url(#baseFill)"/>
${edges(rings.base, 0.6)}

<!-- smoke seen through the holes -->
<path d="${ellipsePath(...rings.back.inner)}" fill="url(#hole)"/>
<path d="${ellipsePath(...rings.front.inner)}" fill="url(#hole)"/>

<!-- back ring -->
<path fill-rule="evenodd" d="${annulus(rings.back)}" fill="url(#glassBack)"/>
<path fill-rule="evenodd" d="${annulus(rings.back)}" fill="url(#overlap)" clip-path="url(#inBase)" opacity="0.85"/>

<!-- front ring, turning violet where it crosses the other two -->
<path fill-rule="evenodd" d="${annulus(rings.front)}" fill="url(#glassFront)"/>
<path fill-rule="evenodd" d="${annulus(rings.front)}" fill="url(#overlap)" clip-path="url(#inBack)"/>
<path fill-rule="evenodd" d="${annulus(rings.front)}" fill="url(#overlap)" clip-path="url(#inBase)" opacity="0.7"/>

<!-- soft sheen along the upper-left of each band -->
<path d="M 86 300 A 252 240 0 0 1 300 132" fill="none" stroke="#ffffff" stroke-width="22" opacity="0.3" stroke-linecap="round" filter="url(#fine)"/>
<path d="M 250 150 A 208 218 0 0 1 424 28" fill="none" stroke="#ffffff" stroke-width="18" opacity="0.34" stroke-linecap="round" filter="url(#fine)"/>
${edges(rings.back)}${edges(rings.front)}

<!-- light where the rings cross -->
<ellipse cx="392" cy="452" rx="120" ry="16" fill="${P.light}" opacity="0.7" filter="url(#fine)" transform="rotate(-18 392 452)"/>
<path d="M300 486 C 370 470, 440 440, 520 396" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>`;
  return svg(720, 660, defs, body);
}

/* ---------- Learning: stacked cubes ---------- */
function cubes() {
  const size = 78;
  const w = size * 0.866;
  const defs =
    blur("soft", 10) +
    blur("glow", 30) +
    linear("topSolid", [[0, P.pale], [1, P.soft]]) +
    linear("leftSolid", [[0, P.mid], [1, P.main]], 0, 0, 0, 1) +
    linear("rightSolid", [[0, P.deep], [1, P.dark]], 0, 0, 0, 1) +
    linear("topGlass", [[0, "#ffffff", 0.95], [1, "#dcd6ff", 0.6]]) +
    linear("leftGlass", [[0, "#ffffff", 0.7], [1, "#c5bcf2", 0.35]], 0, 0, 0, 1) +
    linear("rightGlass", [[0, "#bdb4ee", 0.6], [1, "#8279c4", 0.4]], 0, 0, 0, 1);
  const cube = (col, row, level, tone) => {
    // col/row walk the two ground axes of the isometric grid, level goes up.
    const cx = 330 + (col - row) * w;
    const cy = 470 + (col + row) * (size / 2) - level * size;
    const p = (x, y) => `${n(cx + x)},${n(cy + y)}`;
    const kind = tone === "glass" ? "Glass" : "Solid";
    return `
<g>
  <polygon points="${p(-w, -size / 2)} ${p(0, 0)} ${p(0, size)} ${p(-w, size / 2)}" fill="url(#left${kind})"/>
  <polygon points="${p(0, 0)} ${p(w, -size / 2)} ${p(w, size / 2)} ${p(0, size)}" fill="url(#right${kind})"/>
  <polygon points="${p(0, -size)} ${p(w, -size / 2)} ${p(0, 0)} ${p(-w, -size / 2)}" fill="url(#top${kind})"/>
  <path d="M ${p(-w, -size / 2)} L ${p(0, 0)} L ${p(w, -size / 2)} M ${p(0, 0)} L ${p(0, size)}" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.9"/>
  <polygon points="${p(0, -size)} ${p(w, -size / 2)} ${p(w, size / 2)} ${p(0, size)} ${p(-w, size / 2)} ${p(-w, -size / 2)}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.55"/>
</g>`;
  };
  // Painted back-to-front, bottom-to-top.
  const stack = [
    [-1, 0, 0, "glass"], [0, -1, 0, "solid"], [0, 0, 0, "solid"], [1, 0, 0, "glass"], [0, 1, 0, "solid"],
    [-1, 0, 1, "solid"], [0, -1, 1, "glass"], [0, 0, 1, "glass"], [1, 0, 1, "solid"],
    [0, -1, 2, "solid"], [0, 0, 2, "solid"],
    [0, -1, 3, "glass"],
  ];
  let body = `
<ellipse cx="330" cy="330" rx="220" ry="250" fill="${P.mid}" opacity="0.22" filter="url(#glow)"/>
<ellipse cx="340" cy="600" rx="230" ry="40" fill="${P.mid}" opacity="0.45" filter="url(#glow)"/>
<ellipse cx="346" cy="596" rx="200" ry="30" fill="#14122b" opacity="0.3" filter="url(#soft)"/>`;
  for (const [col, row, level, tone] of stack) body += cube(col, row, level, tone);
  return svg(660, 660, defs, body);
}

/* ---------- Leadership: compass ---------- */
function compass() {
  const defs =
    blur("soft", 14) +
    blur("glow", 32) +
    blur("fine", 5) +
    linear("metal", [[0, "#ffffff"], [0.3, "#e3e2ee"], [0.62, "#a3a1bb"], [1, "#5d5b7a"]]) +
    linear("metalSide", [[0, "#9997b3"], [0.5, "#55536f"], [1, "#2b2940"]], 0, 0, 0, 1) +
    linear("groove", [[0, "#4a4863"], [1, "#8a88a5"]]) +
    linear("face", [[0, "#f6f5fb"], [0.6, "#d6d5e3"], [1, "#b4b2ca"]]) +
    linear("faceInner", [[0, "#ffffff"], [1, "#cfcee0"]]) +
    linear("needleTop", [[0, P.light], [0.45, P.mid], [1, P.main]], 1, 0, 0, 1) +
    linear("needleSide", [[0, P.main], [1, P.dark]], 1, 0, 0, 1) +
    linear("tailTop", [[0, "#ffffff"], [1, "#b9b8cc"]], 1, 0, 0, 1) +
    linear("tailSide", [[0, "#8a88a5"], [1, "#33314d"]], 1, 0, 0, 1) +
    linear("shine", [[0, "#ffffff", 0.95], [1, "#ffffff", 0]], 0, 0, 1, 1);

  let ticks = "";
  for (let angle = 0; angle < 360; angle += 15) {
    const major = angle % 90 === 0;
    ticks += `\n    <line x1="0" y1="${major ? -222 : -222}" x2="0" y2="${major ? -186 : -204}" stroke="#4a4863" stroke-width="${major ? 5 : 2.2}" opacity="0.65" transform="rotate(${angle})"/>`;
  }
  // The dial is drawn flat, then tilted into perspective by this transform.
  const tilt = `translate(350 352) rotate(-17) scale(1 0.6)`;
  const body = `
<ellipse cx="350" cy="380" rx="290" ry="190" fill="${P.mid}" opacity="0.24" filter="url(#glow)"/>
<ellipse cx="372" cy="452" rx="286" ry="150" fill="#14122b" opacity="0.3" filter="url(#soft)"/>
<g transform="${tilt}">
  <circle cx="0" cy="40" r="270" fill="url(#metalSide)"/>
  <path d="M 262 70 A 270 270 0 0 1 -60 303" fill="none" stroke="${P.main}" stroke-width="30" opacity="0.85" filter="url(#fine)"/>
  <path d="M 252 100 A 270 270 0 0 1 30 308" fill="none" stroke="${P.light}" stroke-width="6" opacity="0.8"/>
  <circle cx="0" cy="0" r="270" fill="url(#metal)"/>
  <path d="M -262 -60 A 270 270 0 0 1 60 -263" fill="none" stroke="url(#shine)" stroke-width="16" opacity="0.9" filter="url(#fine)"/>
  <circle cx="0" cy="0" r="269" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.9"/>
  <circle cx="0" cy="0" r="236" fill="url(#groove)"/>
  <circle cx="0" cy="6" r="228" fill="url(#face)"/>${ticks}
  <ellipse cx="120" cy="120" rx="150" ry="110" fill="${P.mid}" opacity="0.3" filter="url(#soft)"/>
  <circle cx="0" cy="10" r="164" fill="none" stroke="#3f3d5a" stroke-width="24" opacity="0.4" filter="url(#fine)"/>
  <circle cx="0" cy="0" r="164" fill="none" stroke="url(#metal)" stroke-width="24"/>
  <circle cx="0" cy="0" r="176" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.9"/>
  <circle cx="0" cy="0" r="152" fill="none" stroke="#55536f" stroke-width="1.4" opacity="0.6"/>
  <circle cx="0" cy="4" r="150" fill="url(#faceInner)"/>
  <path d="M-150 4 H150 M0 -146 V154" stroke="#8a88a5" stroke-width="1.2" opacity="0.45"/>
  <path d="M 150 80 A 170 170 0 0 1 40 166" fill="none" stroke="${P.mid}" stroke-width="12" opacity="0.6" filter="url(#fine)"/>
</g>
<polygon points="566,186 326,322 222,486 426,424" fill="#14122b" opacity="0.32" filter="url(#soft)" transform="translate(14 26)"/>
<g>
  <polygon points="326,310 374,342 214,472" fill="url(#tailTop)"/>
  <polygon points="374,342 420,410 214,472" fill="url(#tailSide)"/>
  <polygon points="560,166 326,310 374,342" fill="url(#needleTop)"/>
  <polygon points="560,166 374,342 420,410" fill="url(#needleSide)"/>
  <path d="M560 166 L326 310" stroke="#ffffff" stroke-width="2.6" opacity="0.85" stroke-linecap="round"/>
  <path d="M560 166 L374 342 L214 472" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.6"/>
  <path d="M536 190 L368 296" stroke="#ffffff" stroke-width="9" opacity="0.22" stroke-linecap="round" filter="url(#fine)"/>
</g>`;
  return svg(700, 640, defs, body);
}

/* ---------- Contact: chat bubble ---------- */
function bubble() {
  const defs =
    blur("soft", 14) +
    blur("glow", 30) +
    linear("body", [[0, P.soft], [0.45, P.mid], [1, P.deep]]) +
    linear("gloss", [[0, "#ffffff", 0.5], [1, "#ffffff", 0]], 0, 0, 0, 1) +
    linear("halo", [[0, "#ffffff", 0.9], [1, "#ffffff", 0.15]]);
  const shape = "M214 150 H486 a70 70 0 0 1 70 70 V330 a70 70 0 0 1 -70 70 H330 L246 470 V400 H214 a70 70 0 0 1 -70 -70 V220 a70 70 0 0 1 70 -70 Z";
  let halos = "";
  [[350, 280, 300, 210, -8], [350, 280, 262, 176, 14], [350, 280, 330, 236, 22]].forEach(([cx, cy, rx, ry, rotate], index) => {
    halos += `\n<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff" opacity="${0.1 - index * 0.02}" transform="rotate(${rotate} ${cx} ${cy})"/>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="url(#halo)" stroke-width="1.6" opacity="${0.8 - index * 0.15}" transform="rotate(${rotate} ${cx} ${cy})"/>`;
  });
  const body = `
<ellipse cx="350" cy="290" rx="250" ry="180" fill="${P.mid}" opacity="0.3" filter="url(#glow)"/>${halos}
<path d="${shape}" fill="${P.dark}" opacity="0.4" filter="url(#soft)" transform="translate(8 22)"/>
<path d="${shape}" fill="url(#body)"/>
<path d="M214 150 H486 a70 70 0 0 1 70 70 V244 C 430 200, 270 200, 144 244 V220 a70 70 0 0 1 70 -70 Z" fill="url(#gloss)"/>
<path d="${shape}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.55"/>
<circle cx="262" cy="278" r="22" fill="#ffffff"/>
<circle cx="350" cy="278" r="22" fill="#ffffff"/>
<circle cx="438" cy="278" r="22" fill="#ffffff"/>`;
  return svg(700, 560, defs, body);
}

/* ---------- Home: globe rising from the corner (drawn for a dark background) ---------- */
function globe() {
  const cx = 560;
  const cy = 640;
  const radius = 540;
  const defs =
    blur("glow", 26) +
    blur("fine", 3) +
    radial("planet", [[0, "#3a2f6e"], [0.6, "#211b3d"], [1, "#14121f"]], 0.3, 0.2, 0.9) +
    linear("rim", [[0, "#ffffff", 0.95], [0.5, "#a98bff", 0.8], [1, "#6a45f0", 0]], 0, 0, 1, 0);
  // Points on the visible hemisphere, from a latitude/longitude grid tilted towards the viewer.
  const points = [];
  for (let lat = -10; lat <= 84; lat += 6) {
    for (let lon = -87; lon <= 87; lon += 6) {
      const phi = (lat * Math.PI) / 180;
      const theta = ((lon + lat * 0.5) * Math.PI) / 180;
      const depth = Math.cos(phi) * Math.cos(theta);
      if (depth < 0.12) continue;
      const x = cx + radius * Math.cos(phi) * Math.sin(theta);
      const y = cy - radius * Math.sin(phi);
      if (x < -10 || x > 770 || y > 530) continue;
      points.push({ x, y, depth, key: `${lat}:${lon}` });
    }
  }
  let links = "";
  let dots = "";
  points.forEach((point, index) => {
    const bright = (index * 7) % 11 === 0;
    dots += `\n<circle cx="${n(point.x)}" cy="${n(point.y)}" r="${n(bright ? 3.6 : 1.3 + point.depth * 1.5)}" fill="${bright ? "#ffffff" : "#b9a8ff"}" opacity="${n(bright ? 0.95 : 0.4 + point.depth * 0.55)}"/>`;
    const next = points[index + 1];
    if (next && (index * 5) % 3 !== 0 && Math.hypot(next.x - point.x, next.y - point.y) < 90) {
      links += `\n<line x1="${n(point.x)}" y1="${n(point.y)}" x2="${n(next.x)}" y2="${n(next.y)}" stroke="#8f6dff" stroke-width="1" opacity="0.4"/>`;
    }
    // A few diagonal links to the row above give the network its woven look.
    const above = points.find((other) => other.y < point.y - 20 && Math.hypot(other.x - point.x, other.y - point.y) < 75);
    if (above && index % 4 === 0) {
      links += `
<line x1="${n(point.x)}" y1="${n(point.y)}" x2="${n(above.x)}" y2="${n(above.y)}" stroke="#b9a8ff" stroke-width="1" opacity="0.4"/>`;
    }
  });
  const body = `
<circle cx="${cx}" cy="${cy}" r="${radius + 14}" fill="${P.mid}" opacity="0.45" filter="url(#glow)"/>
<circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#planet)"/>${links}${dots}
<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="url(#rim)" stroke-width="7" opacity="0.6" filter="url(#fine)"/>
<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="url(#rim)" stroke-width="2.4"/>`;
  return svg(760, 520, defs, body);
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, draw] of Object.entries({ rings, network, bars, loops, cubes, compass, bubble, globe })) {
  const markup = draw();
  fs.writeFileSync(`${OUT}/${name}.svg`, markup);
  const size = markup.match(/viewBox="0 0 (\d+) (\d+)"/);
  console.log(`${name}.svg  ${size[1]}x${size[2]}  ${(markup.length / 1024).toFixed(1)} KB`);
}
