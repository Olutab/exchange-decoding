import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EDITORIAL } from './editorial-data.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public/data');
const MATRIX_FILE = path.join(DATA_DIR, 'exchange_matrix.txt');
const OUT_DIR = path.join(ROOT_DIR, 'dist');
const REACT_PUBLIC = path.join(ROOT_DIR, 'react-hook/public');

const SITE_URL = process.env.SITE_URL || 'https://yourdomain.com';
const BRAND = 'The Exchange Trust Index';

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
fs.rmSync(path.join(OUT_DIR, 'react'), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT_DIR, 'directory'), { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'advisory'), { recursive: true });

const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@600;700&display=swap');:root{--bg:#05070c;--panel:rgba(255,255,255,.04);--border:rgba(255,255,255,.09);--text:#eef2f8;--muted:#9aa4b2;--cyan:#22d3ee;--violet:#818cf8}*{box-sizing:border-box}body{margin:0;color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.75;background:radial-gradient(1000px 460px at 88% -12%,rgba(129,140,248,.15),transparent 62%),radial-gradient(820px 420px at 4% 8%,rgba(34,211,238,.10),transparent 60%),var(--bg)}header,main{max-width:880px;margin:0 auto;padding:0 24px}header{padding:64px 24px 30px;border-bottom:1px solid var(--border)}header h1{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;letter-spacing:-.02em;margin:0 0 8px}header p{font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.32em;text-transform:uppercase;color:var(--muted);margin:0}.ai-hook{margin:40px 0 0;padding:24px 28px;background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--cyan);border-radius:16px;backdrop-filter:blur(12px);font-size:1.04rem}.cellular,.regimen{color:var(--muted);margin:24px 4px}.cellular strong,.regimen strong{color:var(--text)}details{margin:36px 0 24px;padding:8px 24px;background:var(--panel);border:1px solid var(--border);border-radius:16px;backdrop-filter:blur(12px)}summary{cursor:pointer;padding:14px 0;color:var(--cyan);font-weight:600}.foot{margin:0 0 40px}.disclaimer{font-size:.8rem;color:var(--muted);border-top:1px solid var(--border);padding-top:16px;margin-top:32px}a{color:var(--cyan);text-decoration:none;border-bottom:1px solid rgba(34,211,238,.35)}a:hover{color:var(--violet)}.site-foot{max-width:880px;margin:0 auto;padding:20px 24px 64px}.site-foot nav{display:flex;gap:30px;justify-content:center;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:26px}.site-foot a{font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);border-bottom:none}.site-foot a:hover{color:var(--cyan)}.hub-cta{display:inline-block;margin:6px 0 26px;padding:14px 26px;border-radius:999px;background:linear-gradient(94deg,var(--cyan),var(--violet));color:#041014;font-weight:700;border-bottom:none}.hub-cta:hover{color:#041014;filter:brightness(1.1)}`;
fs.writeFileSync(path.join(OUT_DIR, 'style.css'), css);

const FOOTER = `<footer class="site-foot"><nav><a href="/">Home</a><a href="/directory/">Exchange Directory</a><a href="/advisory/">Advisory</a><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a></nav></footer>`;

const HUB_STYLE = `<style>
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
.hub-tier.cat{color:var(--cyan);background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.35)}
.top-back{display:inline-block;margin-bottom:20px;font-family:'JetBrains Mono',monospace;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:var(--cyan);border:1px solid rgba(34,211,238,.4);padding:8px 16px;border-radius:999px;text-decoration:none}
.top-back:hover{background:rgba(34,211,238,.08)}
.pagination{display:flex;justify-content:center;align-items:center;gap:16px;margin:40px 0 20px}
.pagination button{background:var(--panel);border:1px solid var(--border);color:var(--text);padding:10px 20px;border-radius:10px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:.85rem}
.pagination button:hover:not(:disabled){border-color:var(--cyan);color:var(--cyan)}
.pagination button:disabled{opacity:.3;cursor:not-allowed}
.pagination .page-info{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:var(--muted)}
</style>`;

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
<title>${row.entity_name} — ${BRAND}</title>
<meta name="description" content="${row.clear_mechanism_note}">
<meta property="og:title" content="${row.entity_name} — ${BRAND}">
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
<header><h1>${row.entity_name}</h1><p>${BRAND} · ${alias}</p></header>
<main>
<p class="ai-hook">${linkedP1}</p>
<p class="cellular">${linkedP2}</p>
<p class="regimen">${linkedP3}</p>
<details><summary>Is ${row.entity_name} safe for ${row.target_user_profile}?</summary><p>It carries a <strong>${alias}</strong> (${row.safety_alert_tier}) rating. ⚠️ Watch out for ${row.routine_conflict}.</p></details>
<p class="disclaimer">This material is informational only and is not financial, legal, or investment advice.</p>
<p class="foot"><a href="/directory/">← Back to Exchange Directory</a></p>
</main>
${FOOTER}
</body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, `${row.exchange_slug}.html`), html);
  sitemapItems.push(`${SITE_URL}/${row.exchange_slug}.html`);
  const search = (row.entity_name + ' ' + row.safety_alert_tier + ' ' + alias + ' ' + row.functional_category).toLowerCase();
  indexListHtml += `<li data-search="${search}"><a class="hub-card" href="/${row.exchange_slug}.html"><span class="hub-name">${row.entity_name}</span><span class="hub-tier ${row.safety_alert_tier.toLowerCase()}" title="${row.safety_alert_tier}">${alias}</span></a></li>`;
}

// DIRECTORY with pagination (30 per page)
const ITEMS_PER_PAGE = 30;
const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);

const directoryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Exchange Directory — ${BRAND}</title>
<meta name="description" content="Full index of ${rows.length} audited alternative exchange platforms with tier ratings and conflict vectors.">
<link rel="canonical" href="${SITE_URL}/directory/">
<link rel="stylesheet" href="/style.css">
${HUB_STYLE}
</head>
<body>
<header><h1>Exchange Directory</h1><p>${BRAND} · ${rows.length} Platforms Under Audit</p></header>
<main class="hub">
<a class="top-back" href="/">← Back to Home</a>
<a class="hub-cta" href="/">Open the Interactive Calculator →</a>
<input type="text" id="filter" placeholder="Filter by platform, tier, or category…">
<ul id="list">${indexListHtml}</ul>
<div class="pagination">
  <button id="prevBtn" disabled>← Previous</button>
  <span class="page-info" id="pageInfo">Page 1 of ${totalPages}</span>
  <button id="nextBtn">Next →</button>
</div>
</main>
${FOOTER}
<script>
const ITEMS_PER_PAGE = ${ITEMS_PER_PAGE};
let currentPage = 1;
const list = document.getElementById('list');
const items = Array.from(list.querySelectorAll('li'));
const filterInput = document.getElementById('filter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

function applyPagination() {
  const filtered = items.filter(li => li.style.display !== 'none');
  const totalFiltered = filtered.length;
  const totalPagesNow = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
  if (currentPage > totalPagesNow) currentPage = totalPagesNow;
  items.forEach(li => {
    if (li.style.display === 'none') { li.dataset.paginated = 'hidden'; return; }
    li.dataset.paginated = 'visible';
  });
  const visible = items.filter(li => li.dataset.paginated === 'visible');
  visible.forEach((li, i) => {
    li.style.display = (i >= (currentPage - 1) * ITEMS_PER_PAGE && i < currentPage * ITEMS_PER_PAGE) ? 'block' : 'none';
  });
  pageInfo.textContent = \`Page \${currentPage} of \${totalPagesNow}\`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPagesNow;
}

filterInput.addEventListener('keyup', (e) => {
  const f = e.target.value.toLowerCase();
  items.forEach(li => {
    const hay = (li.dataset.search || li.innerText).toLowerCase();
    li.style.display = hay.includes(f) ? 'block' : 'none';
  });
  currentPage = 1;
  applyPagination();
});

prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; applyPagination(); window.scrollTo({top: 400, behavior: 'smooth'}); } });
nextBtn.addEventListener('click', () => { currentPage++; applyPagination(); window.scrollTo({top: 400, behavior: 'smooth'}); });

applyPagination();
</script>
</body>
</html>`;
fs.writeFileSync(path.join(OUT_DIR, 'directory', 'index.html'), directoryHtml);
sitemapItems.push(`${SITE_URL}/directory/`);

let advisoryListHtml = '';
for (const post of EDITORIAL) {
  const bodyHtml = post.paragraphs.map(p => `<p class="cellular">${p}</p>`).join('\n');
  const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${post.title} — Advisory</title>
<meta name="description" content="${post.excerpt}">
<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.excerpt}">
<meta property="og:image" content="${SITE_URL}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${SITE_URL}/advisory/${post.slug}.html">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", "headline": post.title, "author": { "@type": "Organization", name: post.author }, "datePublished": post.date, "description": post.excerpt })}</script>
</head>
<body>
<header><h1>${post.title}</h1><p>${post.author} · ${post.role} · ${post.date}</p></header>
<main>
<a class="top-back" href="/">← Back to Home</a>
<p class="ai-hook">${post.excerpt}</p>
${bodyHtml}
<p class="disclaimer">This material is informational only and is not financial, legal, or investment advice.</p>
<p class="foot"><a href="/advisory/">← Back to Advisory Index</a></p>
</main>
${FOOTER}
</body>
</html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'advisory', `${post.slug}.html`), page);
  sitemapItems.push(`${SITE_URL}/advisory/${post.slug}.html`);
  advisoryListHtml += `<li><a class="hub-card" href="/advisory/${post.slug}.html"><span class="hub-name">${post.title}</span><span class="hub-tier cat">${post.category}</span></a></li>`;
}

const advisoryIndex = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Advisory Index — ${BRAND}</title>
<meta name="description" content="Operational guidance from the Trust & Escrow analysis desk. Informational only.">
<link rel="canonical" href="${SITE_URL}/advisory/">
<link rel="stylesheet" href="/style.css">
${HUB_STYLE}
</head>
<body>
<header><h1>Advisory</h1><p>Trust & Escrow Analysis Desk · Editorial</p></header>
<main class="hub">
<a class="top-back" href="/">← Back to Home</a>
<p style="color:var(--muted);margin:0 0 24px">Operational guidance on escrow mechanics, fee architecture, chargeback defense, and custody taxonomy. Informational only; not financial advice.</p>
<ul>${advisoryListHtml}</ul>
</main>
${FOOTER}
</body>
</html>`;
fs.writeFileSync(path.join(OUT_DIR, 'advisory', 'index.html'), advisoryIndex);
sitemapItems.push(`${SITE_URL}/advisory/`);

const extraPages = [
  ['about', 'About', `<p>${BRAND} is an independent, informational trust-and-escrow audit layer for alternative asset marketplaces: gift cards, peer-to-peer venues, crypto on-ramps, and fractional hard assets.</p><p>We never process transactions, hold payments, or custody funds. Every platform is scored across a 15-column quantitative matrix covering fee bands, booking risk, escrow mechanics, and routine conflict vectors. Monetization is limited to referral traffic, affiliate links to verified platforms, and sponsored directory listings.</p>`],
  ['contact', 'Contact', '<p>Data corrections and editorial inquiries: <a href="mailto:audit@exchangelot.netlify.app">audit@exchangelot.netlify.app</a></p><p>Sponsored directory inquiries must include: platform name, jurisdiction of registration, and escrow or custody documentation.</p>'],
  ['privacy', 'Privacy Protocol', '<p>This platform is privacy-first by architecture. The interactive calculator executes 100% client-side: no search query, profile selection, or pasted exchange detail ever leaves your device.</p><p>We set no advertising cookies, run no third-party analytics, and store no session data. Static pages are served from CDN edge cache with zero tracking pixels.</p>']
];
for (const [slug, title, body] of extraPages) {
  const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — ${BRAND}</title>
<meta name="description" content="${title} page of ${BRAND}.">
<link rel="canonical" href="${SITE_URL}/${slug}.html">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header><h1>${title}</h1><p>${BRAND}</p></header>
<main>
<a class="top-back" href="/">← Back to Home</a>
${body}
<p class="foot"><a href="/directory/">← Back to Exchange Directory</a></p>
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
fs.writeFileSync(path.join(DATA_DIR, 'advisory.json'), JSON.stringify(EDITORIAL, null, 2));
fs.writeFileSync(path.join(REACT_PUBLIC, 'advisory.json'), JSON.stringify(EDITORIAL, null, 2));

const ogSource = path.join(DATA_DIR, 'og-image.png');
if (fs.existsSync(ogSource)) fs.copyFileSync(ogSource, path.join(OUT_DIR, 'og-image.png'));
for (const f of fs.readdirSync(ROOT_DIR)) {
  if (/^google[0-9a-f]+\.html$/.test(f)) fs.copyFileSync(path.join(ROOT_DIR, f), path.join(OUT_DIR, f));
}

console.log(`\n[SUCCESS] Build Engine Complete.`);
console.log(`- Entities compiled: ${rows.length}`);
console.log(`- Advisory posts: ${EDITORIAL.length}`);
console.log(`- Directory pagination: ${ITEMS_PER_PAGE} items/page, ${totalPages} pages`);
console.log(`- Sitemap chunks: ${Math.ceil(sitemapItems.length / chunkSize)}`);
console.log(`- Output directory: ./dist`);