import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public/data');

export function generateOgImage(entityCount) {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 1. Base gradient
  const base = ctx.createLinearGradient(0, 0, 1200, 630);
  base.addColorStop(0, '#05060a');
  base.addColorStop(0.55, '#0a0f1e');
  base.addColorStop(1, '#0d1226');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1200, 630);

  // 2. Aurora blobs
  function blob(x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  blob(980, 90, 460, 'rgba(34,211,238,0.50)', 0.55);
  blob(180, 560, 420, 'rgba(129,140,248,0.45)', 0.50);
  blob(640, 400, 320, 'rgba(244,114,182,0.30)', 0.35);

  // 3. Fine grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1200; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 630); ctx.stroke(); }
  for (let y = 0; y <= 630; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }

  // 4. Inner frame
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, 1088, 518);

  // 5. Eyebrow chip
  ctx.fillStyle = 'rgba(34,211,238,0.12)';
  roundRect(96, 108, 372, 44, 22); ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,0.5)'; ctx.lineWidth = 1.5;
  roundRect(96, 108, 372, 44, 22); ctx.stroke();
  ctx.fillStyle = '#22d3ee';
  ctx.font = '600 17px monospace';
  ctx.fillText('TRUST & ESCROW AUTHORITY', 122, 136);

  // 6. Headline with glow
  ctx.shadowColor = 'rgba(34,211,238,0.45)';
  ctx.shadowBlur = 34;
  ctx.fillStyle = '#eef2f8';
  ctx.font = '700 74px system-ui, Arial, sans-serif';
  ctx.fillText('The Exchange', 96, 268);
  const grad = ctx.createLinearGradient(96, 0, 780, 0);
  grad.addColorStop(0, '#22d3ee'); grad.addColorStop(1, '#818cf8');
  ctx.fillStyle = grad;
  ctx.fillText('Trust Index', 96, 356);
  ctx.shadowBlur = 0;

  // 7. Subline with DYNAMIC count
  ctx.fillStyle = 'rgba(238,242,248,0.62)';
  ctx.font = '400 26px system-ui, Arial, sans-serif';
  ctx.fillText('Opaque marketplaces, decoded. ' + entityCount + ' entities under continuous audit.', 96, 412);

  // 8. Tier legend chips
  const tiers = [ ['ESCROW-BACKED', '#34d399'], ['VERIFY-FIRST', '#fbbf24'], ['NO-RECOURSE', '#fb7185'] ];
  let tx = 96;
  tiers.forEach(([label, color]) => {
    ctx.font = '600 16px monospace';
    const w = ctx.measureText(label).width + 46;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(tx, 486, w, 42, 21); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1;
    roundRect(tx, 486, w, 42, 21); ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(tx + 22, 507, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(238,242,248,0.85)';
    ctx.fillText(label, tx + 38, 513);
    tx += w + 16;
  });

  // 9. Save to public/data
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(DATA_DIR, 'og-image.png'), buffer);
  console.log(`- OG Image auto-generated: ${entityCount} entities`);
}