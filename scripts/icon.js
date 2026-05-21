const sharp = require('sharp');
const path = require('path');
const src = path.join(__dirname, '../assets/icon.svg');
sharp(src).resize(1024, 1024).png().toFile(path.join(__dirname, '../assets/icon.png'))
  .then(() => console.log('icon.png done'));
sharp(src).resize(1024, 1024).png().toFile(path.join(__dirname, '../assets/adaptive-icon.png'))
  .then(() => console.log('adaptive-icon.png done'));
