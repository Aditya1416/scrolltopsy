import sharp from 'sharp';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a0a"/>

  <!-- subtle grid lines -->
  <line x1="0" y1="210" x2="1200" y2="210" stroke="#111" stroke-width="1"/>
  <line x1="0" y1="420" x2="1200" y2="420" stroke="#111" stroke-width="1"/>
  <line x1="400" y1="0" x2="400" y2="630" stroke="#111" stroke-width="1"/>
  <line x1="800" y1="0" x2="800" y2="630" stroke="#111" stroke-width="1"/>

  <!-- top label -->
  <text x="64" y="90" font-family="Courier New, monospace" font-size="18" fill="#E24B4A" letter-spacing="4">scrolltopsy</text>

  <!-- main stat -->
  <text x="64" y="280" font-family="Courier New, monospace" font-size="180" font-weight="bold" fill="#E24B4A">47</text>

  <!-- unit label -->
  <text x="64" y="340" font-family="Courier New, monospace" font-size="22" fill="#555">minutes of your life to an algorithm</text>

  <!-- comparison lines -->
  <text x="64" y="400" font-family="Courier New, monospace" font-size="16" fill="#333">— pages you could have read</text>
  <text x="64" y="428" font-family="Courier New, monospace" font-size="16" fill="#333">— 4,700 steps you could have walked</text>

  <!-- divider -->
  <line x1="64" y1="460" x2="500" y2="460" stroke="#1e1e1e" stroke-width="1"/>

  <!-- tagline -->
  <text x="64" y="492" font-family="Courier New, monospace" font-size="16" fill="#E24B4A" letter-spacing="2">a post-mortem of your scroll session.</text>

  <!-- url -->
  <text x="1136" y="582" font-family="Courier New, monospace" font-size="15" fill="#333" text-anchor="end">scrolltopsy.vercel.app</text>
</svg>
`;

const svgBuffer = Buffer.from(svg);

await sharp(svgBuffer)
  .resize(1200, 630)
  .png()
  .toFile('public/og-image.png');

console.log('OG image generated: public/og-image.png');
