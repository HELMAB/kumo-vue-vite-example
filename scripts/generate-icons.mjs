/**
 * Builds every icon and the social preview image from public/favicon.svg.
 *
 *   npm run icons
 *
 * Edit public/favicon.svg (the logo) and re-run. Text in the OG image is drawn
 * with the fonts installed on this machine (Google Sans, with Khmer).
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const pub = new URL("../public/", import.meta.url);
const logo = await readFile(new URL("favicon.svg", pub), "utf8");
const inner = logo.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
// The artwork without its rounded background tile, for full-bleed icons
const artwork = inner.replace(/<rect[^>]*rx=[^>]*\/>/, "");

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** Full-bleed square (no rounded corners) with the artwork scaled into a safe zone. */
const fullBleed = (scale) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="fb" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#418dff"/><stop offset="1" stop-color="#024dd6"/>
  </linearGradient></defs>
  <rect width="512" height="512" fill="url(#fb)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${artwork}</g>
</svg>`;

const out = async (name, buf) => {
  await writeFile(new URL(name, pub), buf);
  console.log("  ✓", name);
};

// Browser + PWA icons
await out("icon-192.png", await png(logo, 192));
await out("icon-512.png", await png(logo, 512));
// Android adaptive icons crop to a circle: keep the art inside the 80% safe zone
await out("icon-maskable-512.png", await png(fullBleed(0.8), 512));
// iOS rounds the corners itself, so give it a square tile
await out("apple-touch-icon.png", await png(fullBleed(0.92), 180));

// favicon.ico for old browsers / tools that ignore SVG: an ICO holding PNGs
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(logo, s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e); // width
  header.writeUInt8(s, e + 1); // height
  header.writeUInt16LE(1, e + 4); // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
await out("favicon.ico", Buffer.concat([header, ...images]));

// Open Graph / Twitter card image, 1200×630
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="ogbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b2a66"/><stop offset="1" stop-color="#024dd6"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.18" cy="0.5" r="0.55">
      <stop offset="0" stop-color="#ffb43c" stop-opacity=".35"/><stop offset="1" stop-color="#ffb43c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogbg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96 179) scale(0.53)">${inner}</g>
  <g font-family="Google Sans, Noto Sans Khmer, sans-serif" fill="#ffffff">
    <text x="420" y="270" font-size="68" font-weight="700">សាលាបឋមសិក្សា រះអរុណ</text>
    <text x="420" y="345" font-size="38" font-weight="500" fill="#cfe0ff">ប្រព័ន្ធគ្រប់គ្រងសាលា</text>
    <text x="420" y="420" font-size="30" font-weight="400" fill="#9fbfff">Sunrise Primary School · School Management System</text>
  </g>
</svg>`;
await out("og-image.png", await sharp(Buffer.from(og)).png().toBuffer());
