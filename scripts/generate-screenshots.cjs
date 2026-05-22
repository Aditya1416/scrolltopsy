const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../docs');
const outputDir = path.join(__dirname, '../docs/screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertSvgToPng(filename) {
  const svgPath = path.join(inputDir, filename);
  if (!fs.existsSync(svgPath)) return;
  
  const outPath = path.join(outputDir, filename.replace('.svg', '.png'));
  
  await sharp(svgPath)
    .resize({
      width: 1080,
      height: 1920,
      fit: 'contain',
      background: { r: 10, g: 10, b: 10, alpha: 1 }
    })
    .png()
    .toFile(outPath);
  
  console.log(`Generated ${outPath}`);
}

async function createFeatureGraphic() {
  const outPath = path.join(outputDir, 'feature_graphic.png');
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
      <rect width="1080" height="1920" fill="#0a0a0a" />
      <text x="540" y="900" font-family="Courier New, monospace" font-weight="bold" font-size="80" fill="#ffffff" text-anchor="middle">scrolltopsy</text>
      <text x="540" y="1000" font-family="Courier New, monospace" font-size="30" fill="#888888" text-anchor="middle">a post-mortem of your scroll session.</text>
    </svg>
  `;
  await sharp(Buffer.from(svgStr)).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}

async function run() {
  await convertSvgToPng('screen_idle.svg');
  await convertSvgToPng('screen_tracking.svg');
  await convertSvgToPng('screen_shame.svg');
  await createFeatureGraphic();
}

run().catch(console.error);
