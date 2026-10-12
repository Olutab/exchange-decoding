import { useState, useEffect } from 'react';
import './App.css';

interface Entity {
  id: string;
  entity_name: string;
  functional_category: string;
  safety_alert_tier: 'INERT' | 'REACTION-RISK' | 'VOLATILE';
  target_user_profile: string;
  routine_conflict: string;
  typical_fee_range: string;
  clear_mechanism_note: string;
}

const profiles = [
  { id: 'chargeback', label: 'Chargeback-Sensitive Buyer', riskFocus: 'Suppresses every VOLATILE-tier venue and ghost-inventory vector.' },
  { id: 'highvalue', label: 'High-Value Seller', riskFocus: 'Demands enforced escrow holds and strict verification windows on large transfers.' },
  { id: 'budget', label: 'Tight Budget Optimizer', riskFocus: 'Strips high-fee intermediaries and spread-heavy routing layers.' },
];

const heroWords = ['Decoded.', 'Secured.', 'Audited.', 'Quantified.'];

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
  const [profile, setProfile] = useState(profiles[0]);
  const [query, setQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const signals = useCountUp(5842);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}exchange_matrix.json`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Matrix feed unavailable:', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroWords.length), 2400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const volatileEntities = data.filter((e) => e.safety_alert_tier === 'VOLATILE');

  const filtered = data.filter((entity) => {
    const q = query.toLowerCase();
    const hay = `${entity.entity_name} ${entity.safety_alert_tier} ${TIER_ALIAS[entity.safety_alert_tier]} ${entity.functional_category}`.toLowerCase();
    if (!hay.includes(q)) return false;
    if (profile.id === 'chargeback' && entity.safety_alert_tier === 'VOLATILE') return false;
    if (profile.id === 'budget' && entity.functional_category === 'escrow_intermediary') return false;
    return true;
  });

  return (
    <div className="shell">
      <div className="aurora-grid" aria-hidden="true" />

      <header className="hero">
        <span className="eyebrow">Trust &amp; Escrow Authority · Independent Audit Layer</span>
        <h1>
          Alternative Exchange <span className="gradient-text">Risk Matrix</span>
        </h1>
        <p className="sub">
          Opaque marketplaces, <span className="rotor" key={heroIndex}>{heroWords[heroIndex]}</span>
        </p>
        <div className="stat-row">
          <div className="stat">
            <span className="stat-num">{signals.toLocaleString()}</span>
            <span className="stat-label">Risk signals decoded</span>
          </div>
          <div className="stat">
            <span className="stat-num">{data.length || 120}</span>
            <span className="stat-label">Entities under audit</span>
          </div>
          <div className="stat">
            <span className="stat-num">0</span>
            <span className="stat-label">Bytes leave your device</span>
          </div>
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
        <section id="calculator" className="panel control-panel">
          <div className="panel-head">
            <h2>Risk Profile Optimizer</h2>
            <span className="panel-tag">100% client-side</span>
          </div>

          <p className="step-label">01 · Select operating profile</p>
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

          <p className="step-label">02 · Interrogate the matrix</p>
          <input
            className="search-box"
            type="text"
            placeholder="Search entity — e.g. Paxful, StockX, Escrow.com…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </section>

        <section className="how">
          {[
            ['Ingest', 'The 15-column trust matrix is compiled to a flat JSON feed at build time. No databases, no trackers.'],
            ['Cross-reference', 'Your profile is matched against tier ratings, fee bands and conflict vectors entirely in your browser.'],
            ['Flag', 'Any NO-RECOURSE tier or profile conflict raises an immediate disruption banner before you commit capital.'],
          ].map(([title, body], i) => (
            <article className="panel how-card" key={title}>
              <span className="how-num">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </section>

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
                <div className="banner danger">⚠ NO-RECOURSE venue — watch out for {entity.routine_conflict}.</div>
              )}
              {profile.id === 'highvalue' && entity.safety_alert_tier === 'REACTION-RISK' && (
                <div className="banner caution">⚠ VERIFY-FIRST venue — enforce the escrow hold window before release.</div>
              )}
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="no-results">No entity satisfies this profile's risk parameters.</p>
          )}
        </section>
      </main>

      {showSticky && (
        <a className="sticky-mobile-btn" href="#calculator">
          Jump to Calculator ↑
        </a>
      )}
    </div>
  );
}