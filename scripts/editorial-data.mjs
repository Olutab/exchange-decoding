export const EDITORIAL = [
  {
    slug: 'how-escrow-holds-protect-capital',
    title: 'How Escrow Holds Actually Protect Your Capital',
    author: 'The Advisory Board',
    role: 'Trust & Escrow Analysis Desk',
    date: '2026-10-12',
    category: 'Escrow Mechanics',
    excerpt: 'An escrow hold is a timed neutral custody window. Understanding its exact mechanics is the single highest-leverage risk control available to a peer-to-peer transactor.',
    paragraphs: [
      'An escrow hold inserts a neutral custodian between payer and payee. Funds or assets enter a restricted account and release only when predefined conditions are met. In our matrix, venues that enforce this by default score ESCROW-BACKED; venues that leave custody optional score lower regardless of brand recognition.',
      'The protective value of a hold is a function of its duration and its release trigger. A hold that releases on buyer confirmation protects against non-delivery. A hold that releases on seller shipment confirmation protects only against payment failure. Read the release trigger before you read the fee.',
      'Operational rule: never accept an off-platform settlement offer from a counterparty met on an escrow-backed venue. The moment custody leaves the platform, every protection in its terms of service terminates simultaneously.'
    ]
  },
  {
    slug: 'reading-fee-bands',
    title: 'Reading Fee Bands: What a 12% Spread Is Really Telling You',
    author: 'The Advisory Board',
    role: 'Quantitative Risk Desk',
    date: '2026-10-12',
    category: 'Fee Architecture',
    excerpt: 'A fee band is a price signal, not merely a cost. It discloses whether a venue can afford human review, insurance reserves, and dispute resolution.',
    paragraphs: [
      'A fee band is a price signal, not just a cost. Venues quoting 1-3% typically monetize volume and compete on throughput. Venues quoting 10-20% are pricing in authentication labor, insurance, and dispute resolution reserves.',
      'The risk inference: a venue charging 2% cannot afford a human review desk. Its protection is algorithmic, and algorithmic protection fails in exactly the patterns our routine conflict column documents. A 15% venue with physical inspection can absorb a counterfeit claim; a 2% venue cannot.',
      'When comparing two venues for the same asset, subtract the fee difference from your worst-case loss exposure. If the cheaper venue\'s fee saving is smaller than its uninsured loss ceiling, the cheaper venue is the more expensive choice.'
    ]
  },
  {
    slug: 'the-chargeback-window',
    title: 'The Chargeback Window: The 60 to 120 Days That Decide Your Outcome',
    author: 'The Advisory Board',
    role: 'Payments Risk Desk',
    date: '2026-10-12',
    category: 'Chargeback Defense',
    excerpt: 'Card-network reversal rights survive delivery confirmation for months. Any venue settling digital goods inside that window carries latent reversal risk.',
    paragraphs: [
      'Card-network chargeback rights survive delivery confirmation for 60 to 120 days depending on network and region. Any venue that settles a digital-goods sale inside that window carries latent reversal risk, and that risk is priced into seller fees whether disclosed or not.',
      'NO-RECOURSE venues in our matrix are typically those where the seller ships an irreversible asset (codes, keys, accounts) while the buyer retains a reversible payment rail. The asymmetry, not the platform\'s intent, is the hazard.',
      'Mitigation pattern: prefer payment rails that settle finally (wire, on-chain transfer, platform balance) for high-value digital goods, and reserve reversible rails for physical goods with tracked delivery and photographic evidence at packing.'
    ]
  },
  {
    slug: 'phantom-inventory-detection',
    title: 'Phantom Inventory: Detecting Listings That Never Existed',
    author: 'The Advisory Board',
    role: 'Fraud Vector Desk',
    date: '2026-10-12',
    category: 'Fraud Vectors',
    excerpt: 'Phantom inventory is a listing for stock that does not exist, used to collect deposits or harvest payment credentials. It concentrates where listing creation is free and unattested.',
    paragraphs: [
      'Phantom inventory is a listing for stock that does not exist, used to collect deposits or harvest payment credentials. It concentrates on venues with free listing creation and no inventory attestation.',
      'Detection heuristics: price more than two standard deviations below the category median; seller account age under 30 days; images reused across listings; refusal to provide a dated proof-of-holding photograph on request.',
      'Our matrix flags venues where listing creation is unattested as VERIFY-FIRST or NO-RECOURSE. On those venues, treat any listing that fails two or more heuristics as hostile until proven otherwise.'
    ]
  },
  {
    slug: 'self-custody-vs-platform-custody',
    title: 'Self-Custody vs Platform Custody: A Risk Taxonomy',
    author: 'The Advisory Board',
    role: 'Custody Analysis Desk',
    date: '2026-10-12',
    category: 'Custody Taxonomy',
    excerpt: 'Custody is binary in consequence and gradual in form. Either you hold the keys and bear operational risk, or a platform holds them and bears counterparty risk.',
    paragraphs: [
      'Custody is binary in consequence and gradual in form. Either you hold the keys and bear operational risk, or a platform holds them and bears counterparty risk. There is no third state, only hybrid labels.',
      'Platform custody risk is measurable: reserve attestations, insurance disclosures, and regulatory charter. Self-custody risk is also measurable: key management discipline and inheritance planning. Most losses we catalogue occur when users adopt self-custody without the discipline, or platform custody without checking the attestations.',
      'Match custody form to asset size and personal operational maturity. Small balances tolerate platform risk; large balances justify the fixed cost of disciplined self-custody or insured institutional custody.'
    ]
  },
  {
    slug: 'verification-window-rule',
    title: 'The Verification Window: Sequence Discipline Eliminates Most Exposure',
    author: 'The Advisory Board',
    role: 'Operational Discipline Desk',
    date: '2026-10-12',
    category: 'Operational Discipline',
    excerpt: 'Every peer-to-peer transfer has a verification window: the interval between initiation and irreversible settlement during which a human can still intervene.',
    paragraphs: [
      'Every peer-to-peer transfer has a verification window: the interval between initiation and irreversible settlement during which a human can still intervene. Our VERIFY-FIRST tier denotes venues where protection exists only inside that window.',
      'The discipline is temporal: confirm the hold is active before releasing anything; confirm the payment is final, not pending, before releasing anything else; and complete both checks inside the venue\'s stated dispute window, not after.',
      'Most catalogue losses in the VERIFY-FIRST tier are not exploits. They are sequence errors: asset released before payment finality, or dispute filed after the window closed. Sequence discipline is free and eliminates the majority of exposure.'
    ]
  }
];