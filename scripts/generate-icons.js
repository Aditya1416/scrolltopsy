import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const webSizes = [
  { size: 16,   name: 'favicon-16.png' },
  { size: 32,   name: 'favicon-32.png' },
  { size: 180,  name: 'apple-touch-icon.png' },
  { size: 192,  name: 'icon-192.png' },
  { size: 512,  name: 'icon-512.png' },
  { size: 1024, name: 'icon-1024.png' },
];

const androidSizes = [
  { size: 48,  dir: 'mipmap-mdpi' },
  { size: 72,  dir: 'mipmap-hdpi' },
  { size: 96,  dir: 'mipmap-xhdpi' },
  { size: 144, dir: 'mipmap-xxhdpi' },
  { size: 192, dir: 'mipmap-xxxhdpi' },
];

async function run() {
  const svg = fs.readFileSync(path.join('public', 'logo.svg'));

  for (const { size, name } of webSizes) {
    await sharp(svg).resize(size, size).png().toFile(path.join('public', name));
    console.log('✓', name, size + 'x' + size);
  }

  await sharp(svg).resize(32, 32).png().toFile(path.join('public', 'favicon.ico'));
  console.log('✓ favicon.ico');

  const androidBase = path.join('android', 'app', 'src', 'main', 'res');
  if (fs.existsSync(androidBase)) {
    for (const { size, dir } of androidSizes) {
      const dest = path.join(androidBase, dir);
      fs.mkdirSync(dest, { recursive: true });
      await sharp(svg).resize(size, size).png().toFile(path.join(dest, 'ic_launcher.png'));
      await sharp(svg).resize(size, size).png().toFile(path.join(dest, 'ic_launcher_round.png'));
      console.log('✓ android/' + dir + '/ic_launcher.png', size + 'x' + size);
    }
  }
}
run().catch(e => { console.error(e); process.exit(1); });
