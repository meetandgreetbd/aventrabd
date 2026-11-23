/**
 * Cuts the real artwork for each page out of the original design
 * (brand-source/design-mockup.png, 1536 x 1024) and prepares it for the site.
 *
 *   node scripts/build-art.cjs            -> public/art/*.webp
 *
 * For each piece the design's own backdrop colour is made transparent, so only the
 * artwork itself (light glass and highlights as well as dark and violet parts) shows
 * on the page. Edges are feathered, and any bit of headline that overlaps the
 * artwork is masked out.
 *
 * The source is small (each piece is roughly 150-200 px wide), so the results are
 * soft. If a larger render ever becomes available, replace the PNG, scale the boxes
 * below with BASE_WIDTH, and re-run.
 */
const fs = require("node:fs");
const sharp = require("sharp");

const SOURCE = ["brand-source/design-mockup.png", "brand-source/design-mockup.jpg"].find((file) =>
  fs.existsSync(file),
);
const OUT = "public/art";
const BASE_WIDTH = 1536; // the boxes below are measured on a 1536px-wide sheet
const TARGET_WIDTH = 720;
// Colour distance (0-255) from the backdrop at which a pixel starts / finishes becoming visible.
const KEY_FROM = 7;
const KEY_TO = 30;

/**
 * box:   [left, top, width, height] on the sheet
 * dark:  artwork sits on the dark home page (screen blend) instead of a light one
 * solid: edges that are NOT feathered because they sit against the page edge.
 *        The hero pieces are cut by the panel edge in the design itself; on the site they end
 *        inside the page, so that cut edge fades out instead of ending in a line.
 * erase: [left, top, width, height] areas (sheet coordinates) to mask out, e.g. overlapping text
 * ball:  [x, y, radius] (sheet px inside the crop) of a sphere on the mirror axis whose real pixels are kept
 * roundRight: trim the cut right side along a curve instead of a straight edge
 * reflectRight: continue the artwork past its cut right edge by reflecting this fraction of its width
 * circleRight: [cx, cy, rx, ry] ellipse the right side is trimmed to
 * mirrorAxis: x (sheet px inside the crop) of a vertical axis; the right side becomes an exact mirror of the left
 * mirrorRight: repeat the left-hand fraction of the artwork (its pale glass shapes), mirrored, on the right
 * completeAround: [x, y, sphereRadius] inside the crop (sheet px): the centre of concentric rings. The part the
 *        design cut off on the right is drawn by sweeping the rings round that centre.
 * key:   [from, to] colour distance for the cut-out, where the default leaves backdrop residue
 * keepBackdrop: do not cut the backdrop out by colour (for soft smoke, where that leaves jagged edges)
 * wideFade: fade out over a long distance instead of a thin edge
 * softLeft: wide fade on the left as well (for artwork with no clear outline on that side)
 */
const pieces = {
  rings: { box: [628, 62, 136, 262], completeAround: [114, 133.5, 31] },
  network: { box: [970, 58, 176, 244], key: [8, 30], erase: [[958, 150, 40, 118]], mirrorAxis: 134.5 },
  bars: { box: [1320, 66, 210, 270], erase: [[1310, 138, 96, 58]], softLeft: true },
  loops: { box: [232, 610, 166, 190], key: [16, 50], reflectRight: 0.1, circleRight: [[90, 95, 86, 84, 0.06], [104, 68, 61.5, 55, 0.035]] },
  cubes: { box: [636, 616, 126, 200], key: [12, 40], mirrorRight: 0.516 },
  compass: { box: [962, 616, 184, 184] },
  bubble: { box: [1366, 604, 146, 126], key: [12, 40], softLeft: true, mirrorRight: 0.34 },
  globe: { box: [205, 420, 195, 128], dark: true, solid: ["bottom"], wideFade: true },
  swirl: { box: [935, 418, 215, 94], solid: ["bottom"], keepBackdrop: true, wideFade: true },
  // bottom-right corner of the About panel: large violet arcs
  arcs: { box: [668, 426, 100, 86], solid: ["bottom"], keepBackdrop: true, wideFade: true },
};

const smooth = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

(async () => {
  if (!SOURCE) throw new Error("Put the design at brand-source/design-mockup.png");
  const meta = await sharp(SOURCE).metadata();
  const k = meta.width / BASE_WIDTH;
  console.log(`source ${SOURCE} ${meta.width}x${meta.height}`);
  fs.mkdirSync(OUT, { recursive: true });
  const sizes = {};
  const stamp = Date.now().toString(36); // changes on every build; used to defeat browser caching

  for (const [name, piece] of Object.entries(pieces)) {
    const [left, top, width, height] = piece.box.map((value) => Math.round(value * k));
    const scale = TARGET_WIDTH / width;
    let { data, info } = await sharp(SOURCE)
      .extract({ left, top, width, height })
      .resize({ width: TARGET_WIDTH, kernel: "lanczos3" })
      .blur(piece.keepBackdrop ? 1.6 : 0.5)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (piece.reflectRight) {
      // Keep the whole design as it is and only continue it past its cut right edge: the last
      // strip before the edge is reflected outwards, so curves that run into the edge (the ring's
      // rim) turn back and close, in the artwork's own colours and texture.
      const strip = Math.round(info.width * piece.reflectRight);
      const fullWidth = info.width + strip;
      const full = Buffer.alloc(fullWidth * info.height * 4);
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < fullWidth; x += 1) {
          const sourceX = x < info.width ? x : 2 * info.width - 1 - x;
          data.copy(full, (y * fullWidth + x) * 4, (y * info.width + sourceX) * 4, (y * info.width + sourceX) * 4 + 4);
        }
      }
      data = full;
      info = { ...info, width: fullWidth };
    }

    if (piece.mirrorAxis) {
      // Exact left/right symmetry: everything right of a vertical axis (sheet px inside the crop)
      // is replaced by a mirror image of what is left of it.
      const axis = Math.round(piece.mirrorAxis * k * scale);
      const fullWidth = axis * 2;
      const full = Buffer.alloc(fullWidth * info.height * 4);
      const ball = piece.ball
        ? { x: piece.ball[0] * k * scale, y: piece.ball[1] * k * scale, r: piece.ball[2] * k * scale }
        : null;
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < fullWidth; x += 1) {
          const sourceX = x < axis ? x : fullWidth - 1 - x;
          const o = (y * fullWidth + x) * 4;
          const mirrored = (y * info.width + sourceX) * 4;
          // Inside the sphere, real pixels right of the axis are kept where the design has them,
          // so the ball keeps its single highlight instead of getting a mirrored second one.
          const inBall = ball && x >= axis && x < info.width && Math.hypot(x - ball.x, y - ball.y) < ball.r;
          if (!inBall) {
            data.copy(full, o, mirrored, mirrored + 4);
            continue;
          }
          const real = (y * info.width + x) * 4;
          const w = Math.min(1, (info.width - 1 - x) / 30);
          for (let c = 0; c < 4; c += 1) full[o + c] = Math.round(data[real + c] * w + data[mirrored + c] * (1 - w));
        }
      }
      piece.repeated = { strip: axis, start: axis };
      data = full;
      info = { ...info, width: fullWidth };
    }

    if (piece.mirrorRight) {
      // The design cuts this artwork off on the right. Only the pale glass shapes from its LEFT
      // side (the first `mirrorRight` fraction of the width) are repeated there, mirrored, so the
      // right side ends in the same soft glass shapes instead of a hard cut or a second stack.
      const strip = Math.round(info.width * piece.mirrorRight);
      const blend = Math.round(strip * 0.3); // overlap in which the real edge hands over to the glass
      const fullWidth = info.width + strip - blend;
      const full = Buffer.alloc(fullWidth * info.height * 4);
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < fullWidth; x += 1) {
          const o = (y * fullWidth + x) * 4;
          const t = x - (info.width - blend); // position inside the added strip
          const real = x < info.width ? (y * info.width + x) * 4 : -1;
          const glass = t >= 0 ? (y * info.width + Math.max(0, strip - 1 - t)) * 4 : -1;
          const w = glass < 0 ? 1 : real < 0 ? 0 : 1 - t / blend; // weight of the real pixel
          for (let c = 0; c < 4; c += 1) {
            full[o + c] = Math.round((real >= 0 ? data[real + c] : 0) * w + (glass >= 0 ? data[glass + c] : 0) * (1 - w));
          }
        }
      }
      piece.repeated = { strip, start: info.width - blend };
      data = full;
      info = { ...info, width: fullWidth };
    }

    if (piece.completeAround) {
      // The design cuts the rings off on the right. The missing part is drawn by sweeping the
      // rings round the sphere's centre: every missing point takes the colour found at the same
      // distance from the centre straight above it and straight below it (both exist in the
      // design), mixed according to its angle. That gives smooth arcs that join the real rings
      // at the top and bottom without a seam. Real pixels are kept wherever they exist; inside
      // the sphere the missing sliver is mirrored left-to-right so the ball stays round.
      const cx = piece.completeAround[0] * k * scale;
      const cy = piece.completeAround[1] * k * scale;
      const sphereRadius = (piece.completeAround[2] ?? 0) * k * scale;
      const fullWidth = Math.round(cx * 2);
      const full = Buffer.alloc(fullWidth * info.height * 4);
      const blend = 70; // px over which real pixels hand over to the swept ones
      const at = (px, py) => {
        const sx = Math.min(info.width - 1, Math.max(0, Math.round(px)));
        const sy = Math.min(info.height - 1, Math.max(0, Math.round(py)));
        return (sy * info.width + sx) * 4;
      };
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < fullWidth; x += 1) {
          const o = (y * fullWidth + x) * 4;
          const real = x < info.width ? (y * info.width + x) * 4 : -1;
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.hypot(dx, dy);
          // How much of the real pixel to keep. Right of the centre it fades out towards the cut
          // edge. Left of the centre it is kept fully, except in a wedge (within 40 degrees of
          // straight up / straight down) where it eases into the swept arcs, so the real rings
          // turn into the drawn ones gradually instead of meeting them at an angle.
          let w = real < 0 ? 0 : x <= cx ? 1 : Math.min(1, (info.width - 1 - x) / blend);
          if (real >= 0 && r >= sphereRadius) {
            const fromVertical = (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
            const ease = x <= cx ? smooth(fromVertical / 40) : 0;
            w = x <= cx ? ease : Math.min(w, 0);
          }
          if (w >= 1) {
            data.copy(full, o, real, real + 4);
            continue;
          }
          let top;
          let bottom;
          let mix;
          if (r < sphereRadius) {
            top = bottom = at(2 * cx - 1 - x, y);
            mix = 1;
          } else {
            top = at(cx - 2, cy - r);
            bottom = at(cx - 2, cy + r);
            const angle = Math.atan2(-dy, Math.abs(dx)); // +90 degrees = straight up, -90 = straight down
            mix = smooth(angle / Math.PI + 0.5);
          }
          for (let c = 0; c < 4; c += 1) {
            const swept = data[top + c] * mix + data[bottom + c] * (1 - mix);
            full[o + c] = Math.round((real >= 0 ? data[real + c] : 0) * w + swept * (1 - w));
          }
        }
      }
      data = full;
      info = { ...info, width: fullWidth };
    }

    // The design's backdrop colour, estimated from the outer ring of the crop (median per channel).
    const ring = [[], [], []];
    for (let y = 0; y < info.height; y += 3) {
      for (let x = 0; x < info.width; x += 3) {
        const nx = x / info.width;
        const ny = y / info.height;
        if (nx > 0.1 && nx < 0.9 && ny > 0.1 && ny < 0.9) continue;
        const i = (y * info.width + x) * 4;
        for (let c = 0; c < 3; c += 1) ring[c].push(data[i + c]);
      }
    }
    const backdrop = ring.map((values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)]);

    const solid = new Set(piece.solid ?? []);
    const erase = (piece.erase ?? []).map(([ex, ey, ew, eh]) => ({
      x0: (ex * k - left) * scale,
      y0: (ey * k - top) * scale,
      x1: (ex * k - left + ew * k) * scale,
      y1: (ey * k - top + eh * k) * scale,
    }));
    if (piece.repeated) {
      // the same areas, where they landed in the mirrored copy on the right
      const { strip, start } = piece.repeated;
      for (const area of [...erase]) {
        erase.push({ x0: start + strip - 1 - area.x1, x1: start + strip - 1 - area.x0, y0: area.y0, y1: area.y1 });
      }
    }
    const soft = 26; // px of soft edge around erased areas

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const i = (y * info.width + x) * 4;
        // How far this pixel is from the design's backdrop colour. Pixels close to the
        // backdrop become transparent; both lighter parts (glass, highlights) and darker
        // parts (shadows, violet) are kept in their original colours.
        const distance = Math.max(
          Math.abs(data[i] - backdrop[0]),
          Math.abs(data[i + 1] - backdrop[1]),
          Math.abs(data[i + 2] - backdrop[2]),
        );
        const [keyFrom, keyTo] = piece.key ?? [KEY_FROM, KEY_TO];
        const key = piece.keepBackdrop ? 1 : smooth((distance - keyFrom) / (keyTo - keyFrom));

        // Feather towards the edges (skipped on edges that meet the page edge).
        let dx = (x / (info.width - 1)) * 2 - 1;
        let dy = (y / (info.height - 1)) * 2 - 1;
        if (solid.has("right")) dx = Math.min(dx, 0);
        if (solid.has("left")) dx = Math.max(dx, 0);
        if (solid.has("bottom")) dy = Math.min(dy, 0);
        if (solid.has("top")) dy = Math.max(dy, 0);
        // Thin fade on every side, so as much of the object as the design contains is shown.
        // (The design cuts the artwork off on the right; only the last strip there fades out.)
        const leftFrom = piece.softLeft ? 0.72 : 0.86; // softLeft: no clear outline on the left, so fade it widely
        const fadeX = dx < 0 ? smooth((-dx - leftFrom) / (0.99 - leftFrom)) : smooth((dx - 0.84) / 0.15);
        const fadeY = smooth((Math.abs(dy) - 0.86) / 0.13);
        let alpha = (1 - fadeX) * (1 - fadeY);
        // roundRight: the cut right side is trimmed along a curve that follows the ring, so the
        // artwork ends in a rounded outline there instead of a straight line with square corners.
        // circleRight [cx, cy, rx, ry] (sheet px inside the crop): right of cx the artwork is
        // trimmed to this ellipse, which follows the rings' own outline, so the cut side ends
        // as part of a circle instead of a straight edge.
        if (piece.circleRight) {
          // One or more ellipses; a pixel is kept if it is inside any of them. The first follows
          // the overall outline, the second the front ring itself, so that ring keeps its whole rim.
          let keep = 0;
          for (const [cx0, cy0, rx0, ry0, soft0] of piece.circleRight) {
            const [ex, ey, erx, ery] = [cx0, cy0, rx0, ry0].map((value) => value * k * scale);
            // Left of cx only the height counts, so the trim is continuous across cx (no vertical line).
            const e = Math.hypot(Math.max(0, x - ex) / erx, (y - ey) / ery);
            keep = Math.max(keep, 1 - smooth((e - (1 - soft0)) / soft0));
          }
          alpha = (dx < 0 ? 1 - fadeX : 1) * (1 - fadeY) * keep;
        }
        if (piece.roundRight && dx > 0) alpha *= 1 - smooth((Math.hypot(dx, dy * 0.92) - 0.8) / 0.2);
        if (piece.wideFade) {
          // Smoke has no outline to preserve, so it melts into the page over a long distance.
          const softX = dx < 0 ? smooth((-dx - 0.1) / 0.85) : smooth((dx - 0.62) / 0.36);
          const softY = dy < 0 ? smooth((-dy - 0.05) / 0.9) : 0;
          alpha = (1 - softX) * (1 - softY);
        }

        for (const area of erase) {
          const outside = Math.max(area.x0 - x, x - area.x1, area.y0 - y, y - area.y1);
          alpha *= smooth(outside / soft);
        }
        data[i + 3] = Math.round(alpha * key * 255);
      }
    }

    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 90, alphaQuality: 95 })
      .toFile(`${OUT}/${name}.webp`);
    sizes[name] = { width: info.width, height: info.height, v: stamp };
    console.log(`${name}.webp  ${info.width}x${info.height}`);
  }
  // Pieces whose missing part was painted in by AI (image outpainting), saved in brand-source/.
  // They replace the cut-off version above. box and ellipse are in that file's own pixels; the
  // ellipse (cx, cy, rx, ry) is a rough guide around the piece; the exact outline is found from it.
  const extended = {
    loops: { file: "brand-source/loops-extended.png", box: [470, 100, 1800, 1610], ellipse: [1345, 892, 792, 722], width: 1100 },
  };
  for (const [name, piece] of Object.entries(extended)) {
    if (!fs.existsSync(piece.file)) continue;
    const [left, top, width, height] = piece.box;
    const scale = piece.width / width;
    const { data, info } = await sharp(piece.file)
      .extract({ left, top, width, height })
      .resize({ width: piece.width })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    // Cut the piece out along its real silhouette. The painted background is smooth, so along
    // each ray from the centre the outermost sharp change in colour is the edge of the glass.
    const [ex, ey, erx, ery] = [piece.ellipse[0] - left, piece.ellipse[1] - top, piece.ellipse[2], piece.ellipse[3]].map((v) => v * scale);
    const soft = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).blur(2).raw().toBuffer();
    const at = (px, py) => {
      const sx = Math.min(info.width - 1, Math.max(0, Math.round(px)));
      const sy = Math.min(info.height - 1, Math.max(0, Math.round(py)));
      const i = (sy * info.width + sx) * 4;
      return [soft[i], soft[i + 1], soft[i + 2]];
    };
    const STEPS = 720;
    const edge = new Array(STEPS);
    for (let step = 0; step < STEPS; step += 1) {
      const angle = (step / STEPS) * Math.PI * 2;
      const [ux, uy] = [Math.cos(angle), Math.sin(angle)];
      const reach = 1.1; // start a little outside the guide ellipse
      let found = 0.8;
      for (let t = reach; t > 0.7; t -= 0.004) {
        const p = at(ex + ux * erx * t, ey + uy * ery * t);
        const q = at(ex + ux * erx * (t - 0.012), ey + uy * ery * (t - 0.012));
        const change = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
        if (change > 26) {
          found = t - 0.008;
          break;
        }
      }
      edge[step] = found;
    }
    // Median over neighbouring rays removes stray hits (e.g. a light beam in the background).
    const outline = edge.map((_, i) => {
      const near = [];
      for (let d = -22; d <= 22; d += 1) near.push(edge[(i + d + STEPS) % STEPS]);
      return near.sort((m, n) => m - n)[11]; // a low-ish value: stray hits are always too far out
    });
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const dx = (x - ex) / erx;
        const dy = (y - ey) / ery;
        const e = Math.hypot(dx, dy);
        const pos = ((Math.atan2(dy, dx) / (Math.PI * 2) + 1) % 1) * STEPS;
        const i0 = Math.floor(pos) % STEPS;
        const limit = outline[i0] + (outline[(i0 + 1) % STEPS] - outline[i0]) * (pos - Math.floor(pos));
        data[(y * info.width + x) * 4 + 3] = Math.round((1 - smooth((e - (limit - 0.012)) / 0.02)) * 255);
      }
    }
    // A soft, blended shadow on the "floor" under the piece (plus a faint violet glow), instead
    // of the hard-edged shadow the AI painted, which is cut away with the background.
    const pad = 70;
    const W = info.width;
    const H = info.height + pad;
    const shadow = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs><filter id="b" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="26"/></filter></defs>
        <ellipse cx="${ex + erx * 0.06}" cy="${ey + ery * 0.97}" rx="${erx * 0.82}" ry="${ery * 0.11}" fill="#1a1838" opacity="0.5" filter="url(#b)"/>
        <ellipse cx="${ex + erx * 0.12}" cy="${ey + ery * 1.0}" rx="${erx * 0.5}" ry="${ery * 0.05}" fill="#6a45f0" opacity="0.45" filter="url(#b)"/>
      </svg>`,
    );
    const cutout = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
    await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: shadow, left: 0, top: 0 }, { input: cutout, left: 0, top: 0 }])
      .webp({ quality: 90, alphaQuality: 95 })
      .toFile(`${OUT}/${name}.webp`);
    sizes[name] = { width: W, height: H, v: stamp };
    console.log(`${name}.webp  ${W}x${H}  (AI-extended)`);
  }

  // The crystal "A" from the design's home page, completed and sharpened by AI
  // (brand-source/a-extended.png). Its grey backdrop is darkened towards the site's dark page
  // colour and the whole image fades out towards its edges, so the "A" keeps its own light
  // rays and glow but has no visible frame.
  if (fs.existsSync("brand-source/a-extended.png")) {
    const { data, info } = await sharp("brand-source/a-extended.png").resize({ width: 1400 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const [cx, cy, rx, ry] = [0.535 * info.width, 0.5 * info.height, 0.53 * info.width, 0.55 * info.height];
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const i = (y * info.width + x) * 4;
        for (let c = 0; c < 3; c += 1) data[i + c] = Math.max(0, Math.round(((data[i + c] - 38) * 255) / 217));
        const e = Math.hypot((x - cx) / rx, (y - cy) / ry);
        data[i + 3] = Math.round((1 - smooth((e - 0.5) / 0.5)) * 255);
      }
    }
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 90, alphaQuality: 95 }).toFile(`${OUT}/a.webp`);
    sizes.a = { width: info.width, height: info.height, v: stamp };
    console.log(`a.webp  ${info.width}x${info.height}  (AI-extended)`);
  }

  fs.writeFileSync(`${OUT}/sizes.json`, JSON.stringify(sizes, null, 2) + "\n");
})();
