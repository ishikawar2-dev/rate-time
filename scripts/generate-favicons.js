#!/usr/bin/env node
// favicon.png (1024x1024) から各サイズのファビコンを生成するスクリプト
// 依存: sharp (node_modules に既存)

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'favicon.png');
const PUBLIC = path.join(ROOT, 'public');
const APP_DIR = path.join(ROOT, 'src', 'app');

async function resize(size) {
  return sharp(SRC).resize(size, size).png().toBuffer();
}

// ICO バイナリを組み立てる（PNG-in-ICO 形式）
function buildIco(images) {
  const HEADER_SIZE = 6;
  const DIR_ENTRY_SIZE = 16;
  const headerTotal = HEADER_SIZE + images.length * DIR_ENTRY_SIZE;

  let totalSize = headerTotal;
  for (const { buf } of images) totalSize += buf.length;

  const out = Buffer.alloc(totalSize);
  out.writeUInt16LE(0, 0); // Reserved
  out.writeUInt16LE(1, 2); // Type: ICO
  out.writeUInt16LE(images.length, 4);

  let dataOffset = headerTotal;
  for (let i = 0; i < images.length; i++) {
    const { size, buf } = images[i];
    const de = HEADER_SIZE + i * DIR_ENTRY_SIZE;
    out.writeUInt8(size >= 256 ? 0 : size, de);
    out.writeUInt8(size >= 256 ? 0 : size, de + 1);
    out.writeUInt8(0, de + 2);   // ColorCount
    out.writeUInt8(0, de + 3);   // Reserved
    out.writeUInt16LE(1, de + 4); // Planes
    out.writeUInt16LE(32, de + 6); // BitCount
    out.writeUInt32LE(buf.length, de + 8);
    out.writeUInt32LE(dataOffset, de + 12);
    buf.copy(out, dataOffset);
    dataOffset += buf.length;
  }
  return out;
}

async function main() {
  console.log('元画像:', SRC);

  // --- public/ に配置するファイル ---
  const publicFiles = [
    { size: 48,  name: 'favicon-48x48.png' },
    { size: 96,  name: 'favicon-96x96.png' },
    { size: 192, name: 'favicon-192x192.png' },
    { size: 180, name: 'apple-touch-icon.png' },
  ];

  for (const { size, name } of publicFiles) {
    const buf = await resize(size);
    fs.writeFileSync(path.join(PUBLIC, name), buf);
    console.log(`生成: public/${name} (${size}x${size})`);
  }

  // --- favicon.ico (16/32/48 マルチサイズ) ---
  const icoImages = await Promise.all(
    [16, 32, 48].map(async size => ({ size, buf: await resize(size) }))
  );
  const icoBuf = buildIco(icoImages);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), icoBuf);
  console.log('生成: public/favicon.ico (16x16, 32x32, 48x48)');

  // --- src/app/ のファイルを最新の元画像で上書き ---
  const icon512 = await resize(512);
  fs.writeFileSync(path.join(APP_DIR, 'icon.png'), icon512);
  console.log('更新: src/app/icon.png (512x512)');

  const icon180 = await resize(180);
  fs.writeFileSync(path.join(APP_DIR, 'apple-icon.png'), icon180);
  console.log('更新: src/app/apple-icon.png (180x180)');

  console.log('\n全ファビコンの生成が完了しました。');
}

main().catch(err => { console.error(err); process.exit(1); });
