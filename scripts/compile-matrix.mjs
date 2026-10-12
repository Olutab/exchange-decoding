import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public/data');
const MATRIX_FILE = path.join(DATA_DIR, 'exchange_matrix.txt');
const OUT_DIR = path.join(ROOT_DIR, 'dist');
const REACT_PUBLIC = path.join(ROOT_DIR, 'react-hook/public');

const SITE_URL = process.env.SITE_URL || 'https://yourdomain.com';

const VALID_CATEGORIES = ['direct_platform', 'escrow_intermediary', 'peer_to_peer_marketplace', 'gift_card_specialist', 'crypto_on_ramp', 'multi_asset_aggregator'];
const VALID_TIERS = ['INERT', 'REACTION-RISK', 'VOLATILE'];
const TIER_ALIAS = { 'INERT': 'Escrow-Backed', 'REACTION-RISK': 'Verify-First', 'VOLATILE': 'No-Recourse' };

const raw = fs.readFileSync(MATRIX_FILE, 'utf-8');
const lines = raw.split('\n').map(l => l.replace(/\r/g, '')).filter(l => l.trim() !== '');
const headers = lines[0].split('|').map(h => h.trim());
const rows = lines.slice(1).map(line => {
  const cols = line.split('|');
  const obj = {};
  headers.forEach((h, i) => { obj[h] = cols[i] ? cols[i].trim() : ''; });
  return obj;
});

const slugs = new Set();
const names = new Set();
for (const row of rows) {
  if (row.auditing_status !== 'Verified') throw new Error(`Unverified status for ${row.entity_name}`);
  if (!VALID_CATEGORIES.includes(row.functional_category)) throw new Error(`Invalid category: ${row.functional_category}`);
  if (!VALID_TIERS.includes(row.safety_alert_tier)) throw new Error(`Invalid tier: ${row.safety_alert_tier}`);
  if (slugs.has(row.exchange_slug)) throw new Error(`Duplicate slug: ${row.exchange_slug}`);
  if (names.has(row.entity_name)) throw new Error(`Duplicate name: ${row.entity_name}`);
  slugs.add(row.exchange_slug);
  names.add(row.entity_name);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(REACT_PUBLIC, { recursive: true });

const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@600;700&display=swap');:root{--bg:#05070c;--panel:rgba(255,255,255,.04);--border:rgba(255,255,255,.09);--text:#eef2f8;--muted:#9aa4b2;--cyan:#22d3ee;--violet:#818cf8}*{box-sizing:border-box}body{margin:0;color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.75;background:radial-gradient(1000px 460px at 88% -12%,rgba(129,140,248,.15),transparent 62%),radial-gradient(820px 420px at 4% 8%,rgba(34,211,238,.10),transparent 60%),var(--bg)}header,main{max-width:880px;margin:0 auto;padding:0 24px}header{padding:64px 24px 30px;border-bottom:1px solid var(--border)}header h1{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;letter-spacing:-.02em;margin:0 0 8px}header p{font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.32em;text-transform:uppercase;color:var(--muted);margin:0}.ai-hook{margin:40px 0 0;padding:24px 28px;background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--cyan);border-radius:16px;backdrop-filter:blur(12px);font-size:1.04rem}.cellular,.regimen{color:var(--muted);margin:24px 4px}.cellular strong,.regimen strong{color:var(--text)}details{margin:36px 0 24px;padding:8px 24px;background:var(--panel);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px)}summary{cursor:pointer;padding:14px 0;color:var(--cyan);font-weight:600}.foot{margin:0 0 40px}a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(34,211,238,.35)}a:hover{color:var(--violet)}.site-foot{max-width:880px;margin:0 auto;padding:20px 24px 64px}.site-foot nav{display:flex;gap:30px;justify-content:center;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:26px}.site-foot a{font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);border-bottom:none}.site-foot a:hover{color:var(--cyan)}.hub-cta{display:inline-block;margin:6px 0 26px;padding:14px 26px;border-radius:999px;background:linear-gradient(94deg,var(--cyan),var(--violet));color:#041014;font-weight:700;border-bottom:none}.hub-cta:hover{color:#041014;filter:brightness(1.1)}`;
fs.writeFileSync(path.join(OUT_DIR, 'style.css'), css);

const FOOTER = `<footer class="site-foot"><nav><a href="/index.html">Index</a><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a></nav></footer>`;

const allEntities = rows.map(r => ({ slug: r.exchange_slug, name: r.entity_name }));
function autoLink(text, currentSlug) {
  let linkCount = 0;
  let out = text;
  for (const entity of allEntities) {
    if (linkCount >= 5) break;
    if (entity.slug === currentSlug) continue;
    const escaped = entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    if (regex.test(out)) {
      out = out.replace(regex, `<a href="/${entity.slug}.html">${entity.name}</a>`);
      linkCount++;
    }
  }
  return out;
}

let sitemapItems = [];
let indexListHtml = '';

for (const row of rows) {
  const alias = TIER_ALIAS[row.safety_alert_tier];
  const p1 = `The structural analysis of the exchange component <strong>${row.entity_name}</strong> (commonly indexed as <em>${row.jargon_free_alias}</em>) categorizes it as a functional <strong>${row.functional_category}</strong>. Operating primarily within the <em>${row.penetration_impact_layer}</em> at a typical range of <em>${row.typical_fee_range}</em>, this component carries a <strong>${row.safety_alert_tier}</strong> (${alias}) classification for skin-to-skin user profile compatibility.`;
  const p2 = `Mechanically, this platform directly impacts the <strong>${row.target_user_profile}</strong> by ${row.clear_mechanism_note.toLowerCase()} during multi-step operational delays or verification holds.`;
  const p3 = `Pairing this entity with <strong>${row.synergy_pairing}</strong> fortifies transfer efficiency. However, users must avoid combining it with <strong>${row.routine_conflict}</strong> to eliminate immediate disruption vectors.`;

  const linkedP1 = autoLink(p1, row.exchange_slug);
  const linkedP2 = autoLink(p2, row.exchange_slug);
  const linkedP3 = autoLink(p3, row.exchange_slug);

  const jsonLd = [
    { "@context": "https://schema.org", "@type": "TechArticle", "headline": `${row.entity_name} — Exchange Mechanics Decode`, "description": row.clear_mechanism_note },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": `Is ${row.entity_name} safe for ${row.target_user_profile}?`, "acceptedAnswer": { "@type": "Answer", "text": `It carries a ${alias} (${row.safety_alert_tier}) rating. Watch out for ${row.routine_conflict}.` } }] },
    { "@context": "https://schema.org", "@type": "MedicalWebPage", "name": `${row.entity_name} Trust & Escrow Analysis`, "description": row.clear_mechanism_note }
  ];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${row.entity_name} — Exchange Risk & Trust Decode</title>
<meta name="description" content="${row.clear_mechanism_note}">
<meta property="og:title" content="${row.entity_name} — Exchange Risk Matrix">
<meta property="og:description" content="${row.clear_mechanism_note}">
<meta property="og:image" content="${SITE_URL}/og-image.png">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}/og-image.png">
<link rel="canonical" href="${SITE_URL}/${row.exchange_slug}.html">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<header><h1>${row.entity_name}</h1><p>Trust & Escrow Authority · ${alias}</p></header>
<main>
<p class="ai-hook">${linkedP1}</p>
<p class="cellular">${linkedP2}</p>
<p class="regimen">${linkedP3}</p>
<details><summary>Is ${row.entity_name} safe for ${row.target_user_profile}?</summary><p>It carries a <strong>${alias}</strong> (${row.safety_alert_tier}) rating. ⚠️ Watch out for ${row.routine_conflict}.</p></details>
<p class="foot"><a href="/index.html">← Back to Risk Matrix Hub</a></p>
</main>
${FOOTER}
</body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, `${row.exchange_slug}.html`), html);
  sitemapItems.push(`${SITE_URL}/${row.exchange_slug}.html`);
  const search = (row.entity_name + ' ' + row.safety_alert_tier + ' ' + alias + ' ' + row.functional_category).toLowerCase();
  indexListHtml += `<li data-search="${search}"><a class="hub-card" href="${row.exchange_slug}.html"><span class="hub-name">${row.entity_name}</span><span class="hub-tier ${row.safety_alert_tier.toLowerCase()}" title="${row.safety_alert_tier}">${alias}</span></a></li>`;
}

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alternative Exchange Risk Matrix — Trust & Escrow Authority</title>
<meta name="description" content="Independent trust and escrow risk decoding for gift cards, peer-to-peer marketplaces, crypto on-ramps and alternative assets.">
<meta property="og:image" content="${SITE_URL}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/style.css">
<style>
.hub{max-width:980px;margin:0 auto;padding:48px 24px 40px}
.hub input{width:100%;padding:16px 20px;border-radius:12px;background:rgba(0,0,0,.45);border:1px solid var(--border);color:var(--text);font:400 1rem Inter,sans-serif;outline:none;margin:10px 0 24px}
.hub input:focus{border-color:var(--cyan)}
.hub ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.hub-card{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px;background:var(--panel);border:1px solid var(--border);border-radius:14px;backdrop-filter:blur(12px)}
.hub-card:hover{border-color:rgba(255,255,255,.22)}
.hub-name{color:var(--text);font-weight:600}
.hub-tier{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;padding:5px 10px;border-radius:999px;white-space:nowrap}
.hub-tier.inert{color:#34d399;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.35)}
.hub-tier.reaction-risk{color:#fbbf24;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.35)}
.hub-tier.volatile{color:#fb7185;background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.4)}
</style>
</head>
<body>
<header><h1>Alternative Exchange Risk Matrix</h1><p>Trust & Escrow Authority · ${rows.length} Entities Under Audit</p></header>
<main class="hub">
<a class="hub-cta" href="/react/">Open Interactive Risk Calculator →</a>
<input type="text" id="filter" placeholder="Filter by entity, tier, or category…">
<ul id="list">${indexListHtml}</ul>
</main>
${FOOTER}
<script>
document.getElementById('filter').addEventListener('keyup', (e) => {
  const f = e.target.value.toLowerCase();
  document.querySelectorAll('#list li').forEach(li => {
    const hay = (li.dataset.search || li.innerText).toLowerCase();
    li.style.display = hay.includes(f) ? 'block' : 'none';
  });
});
</script>
</body>
</html>`;
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml);

const extraPages = [
  ['about', 'About the Authority', '<p>The Alternative Exchange Risk Matrix is an independent, informational trust-and-escrow audit layer for alternative asset marketplaces: gift cards, peer-to-peer venues, crypto on-ramps, and fractional hard assets.</p><p>We never process transactions, hold payments, or custody funds. Every entity is scored across a 15-column quantitative matrix covering fee bands, booking risk, escrow mechanics, and routine conflict vectors. Monetization is limited to referral traffic, affiliate links to verified platforms, and sponsored directory listings.</p>'],
  ['contact', 'Contact', '<p>Data corrections and editorial inquiries: <a href="mailto:audit@exchangelot.netlify.app">audit@exchangelot.netlify.app</a></p><p>Sponsored directory inquiries must include: entity name, jurisdiction of registration, and escrow or custody documentation.</p>'],
  ['privacy', 'Privacy Protocol', '<p>This platform is privacy-first by architecture. The interactive risk calculator executes 100% client-side: no search query, profile selection, or pasted exchange detail ever leaves your device.</p><p>We set no advertising cookies, run no third-party analytics, and store no session data. Static pages are served from CDN edge cache with zero tracking pixels.</p>']
];
for (const [slug, title, body] of extraPages) {
  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Exchange Risk Matrix</title>
<meta name="description" content="${title} page of the Alternative Exchange Risk Matrix, an independent trust and escrow audit layer.">
<link rel="canonical" href="${SITE_URL}/${slug}.html">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header><h1>${title}</h1><p>Trust & Escrow Authority</p></header>
<main>
${body}
<p class="foot"><a href="/index.html">← Back to Risk Matrix Hub</a></p>
</main>
${FOOTER}
</body>
</html>`;
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), pageHtml);
  sitemapItems.push(`${SITE_URL}/${slug}.html`);
}

const robots = `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robots);

const chunkSize = 1000;
let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (let i = 0; i < sitemapItems.length; i += chunkSize) {
  const n = (i / chunkSize) + 1;
  const chunk = sitemapItems.slice(i, i + chunkSize);
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${n}.xml`), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunk.map(u => `<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`);
  sitemapIndex += `<sitemap><loc>${SITE_URL}/sitemap-${n}.xml</loc></sitemap>\n`;
}
sitemapIndex += `</sitemapindex>`;
fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemapIndex);

fs.writeFileSync(path.join(DATA_DIR, 'exchange_matrix.json'), JSON.stringify(rows, null, 2));
fs.writeFileSync(path.join(REACT_PUBLIC, 'exchange_matrix.json'), JSON.stringify(rows, null, 2));

const ogSource = path.join(DATA_DIR, 'og-image.png');
if (fs.existsSync(ogSource)) fs.copyFileSync(ogSource, path.join(OUT_DIR, 'og-image.png'));
for (const f of fs.readdirSync(ROOT_DIR)) {
  if (/^google[0-9a-f]+\.html$/.test(f)) fs.copyFileSync(path.join(ROOT_DIR, f), path.join(OUT_DIR, f));
}

console.log(`\n[SUCCESS] Build Engine Complete.`);
console.log(`- Entities compiled: ${rows.length}`);
console.log(`- Static pages: ${rows.length} + 1 hub + 3 auxiliary`);
console.log(`- Sitemap chunks: ${Math.ceil(sitemapItems.length / chunkSize)}`);
console.log(`- Output directory: ./dist`);