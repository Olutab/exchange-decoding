import { useState, useEffect } from 'react';
import './App.css';

interface Entity {
  id: string;
  exchange_slug: string;
  entity_name: string;
  functional_category: string;
  safety_alert_tier: 'INERT' | 'REACTION-RISK' | 'VOLATILE';
  target_user_profile: string;
  routine_conflict: string;
  typical_fee_range: string;
  clear_mechanism_note: string;
}

interface Advisory {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
}

const profiles = [
  { id: 'chargeback', label: 'Cautious Buyer', riskFocus: 'Hides every No-Recourse platform. Only shows venues with real buyer protection.' },
  { id: 'highvalue', label: 'High-Value Seller', riskFocus: 'Flags platforms where you must manually confirm the escrow hold before releasing anything.' },
  { id: 'budget', label: 'Fee-Conscious Trader', riskFocus: 'Strips out expensive middlemen so you see only the lowest-fee venues.' },
];

const heroWords = ['Decoded.', 'Secured.', 'Audited.', 'Verified.'];

const TIER_ALIAS: Record<string, string> = {
  'INERT': 'Escrow-Backed',
  'REACTION-RISK': 'Verify-First',
  'VOLATILE': 'No-Recourse',
};

function useCountUp(target: number, duration = 1800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = Math.max(1, duration / 16);
    const timer = setInterval(() => {
      frame += 1;
      const eased = 1 - Math.pow(1 - Math.min(frame / steps, 1), 3);
      setValue(Math.floor(target * eased));
      if (frame >= steps) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export default function App() {
  const [data, setData] = useState<Entity[]>([]);
  const [posts, setPosts] = useState<Advisory[]>([]);
  const [profile, setProfile] = useState(profiles[0]);
  const [query, setQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const signals = useCountUp(5842);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}exchange_matrix.json`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Matrix feed unavailable:', err));
    fetch(`${import.meta.env.BASE_URL}advisory.json`)
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroWords.length), 2400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 5) % data.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [data.length]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const volatileEntities = data.filter((e) => e.safety_alert_tier === 'VOLATILE');
  const tierCounts = {
    INERT: data.filter((e) => e.safety_alert_tier === 'INERT').length,
    'REACTION-RISK': data.filter((e) => e.safety_alert_tier === 'REACTION-RISK').length,
    VOLATILE: data.filter((e) => e.safety_alert_tier === 'VOLATILE').length,
  };
  const catCounts = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.functional_category] = (acc[e.functional_category] || 0) + 1;
    return acc;
  }, {});

  const previewItems = data.length > 0
    ? Array.from({ length: 5 }, (_, i) => data[(carouselIndex + i) % data.length])
    : [];

  const filtered = data.filter((entity) => {
    const q = query.toLowerCase();
    const hay = `${entity.entity_name} ${entity.safety_alert_tier} ${TIER_ALIAS[entity.safety_alert_tier]} ${entity.functional_category}`.toLowerCase();
    if (!hay.includes(q)) return false;
    if (profile.id === 'chargeback' && entity.safety_alert_tier === 'VOLATILE') return false;
    if (profile.id === 'budget' && entity.functional_category === 'escrow_intermediary') return false;
    return true;
  });

  const isSearching = query.trim().length > 0;

  return (
    <div className="shell">
      <div className="aurora-grid" aria-hidden="true" />

      <header className="hero">
        <span className="eyebrow">Independent Audit Layer · Not Financial Advice</span>
        <h1>
          The Exchange <span className="gradient-text">Trust Index</span>
        </h1>
        <p className="sub">
          Independent audits of alternative asset marketplaces — <span className="rotor" key={heroIndex}>{heroWords[heroIndex]}</span>
        </p>
        <div className="stat-row">
          <div className="stat">
            <span className="stat-num">{signals.toLocaleString()}</span>
            <span className="stat-label">Risk signals decoded</span>
          </div>
          <div className="stat">
            <span className="stat-num">{data.length || 180}</span>
            <span className="stat-label">Platforms under audit</span>
          </div>
          <div className="stat">
            <span className="stat-num">0</span>
            <span className="stat-label">Bytes leave your device</span>
          </div>
        </div>
        <div className="cta-row">
          <a className="hub-cta" href="/directory/">Browse Full Exchange Directory →</a>
        </div>
      </header>

      <div className="marquee-shell" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((half) => (
            <div className="marquee-half" key={half}>
              <span className="marquee-label">Live volatile watch</span>
              {volatileEntities.map((e) => (
                <span className="ticker-item" key={`${half}-${e.id}`}>
                  <i className="dot" />
                  {e.entity_name} — {e.routine_conflict}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main className="content">
        {/* ROTATING 5-ITEM PREVIEW */}
        <section className="preview-section panel">
          <div className="panel-head">
            <h2>Live Audit Feed</h2>
            <span className="panel-tag">rotates every 4s</span>
          </div>
          <div className="preview-grid">
            {previewItems.map((entity) => (
              <a
                className={`preview-card tier-${entity.safety_alert_tier.toLowerCase()}`}
                href={`/${entity.exchange_slug}.html`}
                key={entity.id}
              >
                <span className={`preview-badge ${entity.safety_alert_tier.toLowerCase()}`}>
                  {TIER_ALIAS[entity.safety_alert_tier]}
                </span>
                <h4>{entity.entity_name}</h4>
                <p className="preview-note">{entity.clear_mechanism_note}</p>
              </a>
            ))}
          </div>
          <a className="see-all-link" href="/directory/">See all {data.length} platforms →</a>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="panel control-panel">
          <div className="panel-head">
            <h2>Risk Profile Filter</h2>
            <span className="panel-tag">100% client-side</span>
          </div>

          <p className="step-label">01 · Pick how you trade</p>
          <div className="profile-toggles" role="group" aria-label="User profile">
            {profiles.map((p) => (
              <button
                key={p.id}
                className={profile.id === p.id ? 'toggle active' : 'toggle'}
                onClick={() => setProfile(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="profile-desc">{profile.riskFocus}</p>

          <p className="step-label">02 · Search a platform</p>
          <input
            className="search-box"
            type="text"
            placeholder="e.g. Paxful, StockX, Escrow.com…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </section>

        {/* HOW IT WORKS — plain English */}
        <section className="how">
          <article className="panel how-card">
            <span className="how-num">01</span>
            <h3>We audit the platform</h3>
            <p>Every platform is scored across 15 risk factors — fees, escrow rules, chargeback history, and more. No databases, no trackers.</p>
          </article>
          <article className="panel how-card">
            <span className="how-num">02</span>
            <h3>You pick your profile</h3>
            <p>Tell us how you trade. A cautious buyer gets different warnings than a high-volume seller. It all runs in your browser.</p>
          </article>
          <article className="panel how-card">
            <span className="how-num">03</span>
            <h3>We flag the danger</h3>
            <p>We instantly hide or flag any platform that doesn't fit your risk tolerance. Nothing is sold here — we just help you decide.</p>
          </article>
        </section>

        {/* SEARCH RESULTS — only when user is actively searching */}
        {isSearching && (
          <section className="results-grid">
            {filtered.map((entity) => (
              <article
                key={entity.id}
                className={`panel result-card tier-${entity.safety_alert_tier.toLowerCase()}`}
              >
                <div className="card-header">
                  <h3>{entity.entity_name}</h3>
                  <span className={`badge ${entity.safety_alert_tier.toLowerCase()}`} title={entity.safety_alert_tier}>
                    {TIER_ALIAS[entity.safety_alert_tier]}
                  </span>
                </div>
                <p className="meta">
                  {entity.functional_category.replace(/_/g, ' ')} · fee band {entity.typical_fee_range}
                </p>
                <p className="note">{entity.clear_mechanism_note}</p>

                {entity.safety_alert_tier === 'VOLATILE' && (
                  <div className="banner danger">⚠ No-Recourse venue — watch out for {entity.routine_conflict}.</div>
                )}
                {profile.id === 'highvalue' && entity.safety_alert_tier === 'REACTION-RISK' && (
                  <div className="banner caution">⚠ Verify-First venue — confirm the escrow hold before release.</div>
                )}
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="no-results">No platform matches this profile's risk parameters.</p>
            )}
          </section>
        )}

        {/* MARKET SNAPSHOT */}
        <section className="snapshot panel">
          <div className="panel-head">
            <h2>Market Snapshot</h2>
            <span className="panel-tag">live from audit data</span>
          </div>
          {(['INERT', 'REACTION-RISK', 'VOLATILE'] as const).map((tier) => {
            const pct = data.length ? Math.round((tierCounts[tier] / data.length) * 100) : 0;
            return (
              <div className="dist-row" key={tier}>
                <span className="dist-label">{TIER_ALIAS[tier]}</span>
                <div className="dist-track">
                  <div className={`dist-bar tier-${tier.toLowerCase()}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="dist-num">{tierCounts[tier]} · {pct}%</span>
              </div>
            );
          })}
          <div className="cat-grid">
            {Object.entries(catCounts).map(([cat, count]) => (
              <div className="cat-tile" key={cat}>
                <span className="cat-count">{count}</span>
                <span className="cat-name">{cat.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ADVISORY TEASERS */}
        <section className="adv-section">
          <div className="panel-head">
            <h2>From the Advisory Desk</h2>
            <a className="more-link" href="/advisory/">All articles →</a>
          </div>
          <div className="adv-grid">
            {posts.slice(0, 3).map((p) => (
              <a className="panel adv-card" href={`/advisory/${p.slug}.html`} key={p.slug}>
                <span className="adv-cat">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <nav>
          <a href="/">Home</a>
          <a href="/directory/">Exchange Directory</a>
          <a href="/advisory/">Advisory</a>
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy.html">Privacy</a>
        </nav>
      </footer>

      {showSticky && (
        <a className="sticky-mobile-btn" href="#calculator">
          Jump to Calculator ↑
        </a>
      )}
    </div>
  );
}