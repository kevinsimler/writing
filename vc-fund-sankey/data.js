// Data model instance: a hypothetical $15M micro-fund ("Vienna Ventures Fund I").
// All amounts in $M. Loaded by both index.html (browser) and validate.mjs (Node).

globalThis.FUND_DATA = {
  meta: {
    name: "Vienna Ventures Fund I",
    units: "$M",
    fundSize: 15,
    terms: {
      mgmtFee: "3.0%/yr of committed capital in years 1–5, 1.0%/yr in years 6–10 ($3M lifetime, 20% of fund)",
      carry: "20% on LP profits, whole-fund (European) waterfall, no hurdle; no carry on the GP's own commitment",
      gpCommit: "30% ($4.5M)",
      life: "10 years",
    },
  },

  // kind: entity   = a real legal entity in the fund structure
  //       aggregate = many real parties collapsed into one node
  //       pseudo   = accounting fiction to keep the sankey conservative (e.g. value creation)
  nodes: [
    { id: "lps",              label: "Limited Partners",            kind: "aggregate", desc: "Outside investors — $10.5M of the $15M" },
    { id: "partners",         label: "GP Partners (individuals)",   kind: "aggregate", desc: "The humans who run the firm — and this fund's biggest investors" },
    { id: "gp",               label: "General Partner LLC",         kind: "entity",    desc: "Vienna Ventures GP I, LLC — controls the fund, receives carry" },
    { id: "fund",             label: "The Fund, L.P.",              kind: "entity",    desc: "Vienna Ventures Fund I, L.P. — the pool of capital itself" },
    { id: "mgmtco",           label: "Management Co. LLC",          kind: "entity",    desc: "Vienna Ventures Management, LLC — employs the team, pays the bills" },
    { id: "portfolio",        label: "Portfolio Companies (~20)",   kind: "aggregate", desc: "The startups" },
    { id: "lawyers",          label: "Law Firms",                   kind: "aggregate", desc: "Fund formation counsel, deal counsel, firm counsel" },
    { id: "providers",        label: "Admin · Audit · Tax",         kind: "aggregate", desc: "Fund administration platform, audit, tax prep, insurance" },
    { id: "team",             label: "Team Salaries & Benefits",    kind: "aggregate", desc: "Partner + staff compensation through the management company" },
    { id: "ops",              label: "Office & Operations",         kind: "aggregate", desc: "Rent, travel, software, events" },
    { id: "invested_capital", label: "Invested Capital (from ①)",   kind: "pseudo",    desc: "Stage ①'s investments, carried into Stage ② as the cost basis" },
    { id: "value_creation",   label: "Value Creation",              kind: "pseudo",    desc: "Growth between investment and exit — the reason the whole machine exists" },
  ],

  // internalNodes: nodes whose inflows must equal outflows within that stage.
  // Everything else is a source (money enters the picture) or sink (money leaves it).
  stages: [
    { id: "deploy",  label: "① Deployment",  period: "Years 0–5",  internalNodes: ["gp", "fund", "mgmtco"] },
    { id: "harvest", label: "② Harvest",     period: "Years 6–10", internalNodes: ["portfolio", "fund", "gp", "mgmtco"] },
  ],

  // kind drives color. amount in $M.
  flows: [
    // ── Stage ①: formation & deployment ─────────────────────────────
    { stage: "deploy", source: "lps",      target: "fund",      amount: 10.5, kind: "capital",     notes: "Capital calls against $10.5M of LP commitments (70% of fund)" },
    { stage: "deploy", source: "partners", target: "gp",        amount: 4.5,  kind: "capital",     notes: "Partners fund the GP commitment personally" },
    { stage: "deploy", source: "gp",       target: "fund",      amount: 4.5,  kind: "capital",     notes: "GP commitment: 30% of the fund — typical is 1–2%; this GP is its own anchor LP" },
    { stage: "deploy", source: "fund",     target: "mgmtco",    amount: 2.25, kind: "mgmt_fee",    notes: "3.0% × $15M × 5 years (investment period) — ~$450K/yr to run the firm" },
    { stage: "deploy", source: "fund",     target: "lawyers",   amount: 0.1,  kind: "fund_expense", notes: "Fund formation legal — standard docs, capped in the LPA" },
    { stage: "deploy", source: "fund",     target: "providers", amount: 0.25, kind: "fund_expense", notes: "Fund admin, audit, tax, insurance — ~$50K/yr on a lean admin platform" },
    { stage: "deploy", source: "fund",     target: "portfolio", amount: 12.4, kind: "investment",  notes: "Checks into ~20 companies — 83¢ of every committed dollar reaches startups" },
    { stage: "deploy", source: "portfolio", target: "lawyers",  amount: 0.15, kind: "deal_expense", notes: "Deal counsel at closings — companies customarily pay both sides from round proceeds" },
    { stage: "deploy", source: "mgmtco",   target: "team",      amount: 1.6,  kind: "compensation", notes: "~$320K/yr total comp across a lean team — the fee's main job" },
    { stage: "deploy", source: "mgmtco",   target: "ops",       amount: 0.6,  kind: "opex",        notes: "Rent, travel, software, events — ~$120K/yr" },
    { stage: "deploy", source: "mgmtco",   target: "lawyers",   amount: 0.05, kind: "opex",        notes: "Firm-level legal: employment, regulatory, trademark" },

    // ── Stage ②: harvest & distribution ──────────────────────────────
    { stage: "harvest", source: "invested_capital", target: "portfolio", amount: 12.25, kind: "carryover",    notes: "Cost basis carried in from Stage ① (net of deal fees)" },
    { stage: "harvest", source: "value_creation",   target: "portfolio", amount: 24.95, kind: "appreciation", notes: "Appreciation between investment and exit (~3.0x gross on invested)" },
    { stage: "harvest", source: "portfolio", target: "fund",    amount: 37.2,  kind: "exit_proceeds", notes: "Gross exit proceeds: M&A and IPOs" },
    { stage: "harvest", source: "fund",      target: "mgmtco",  amount: 0.75,  kind: "mgmt_fee",     notes: "1.0% × $15M × 5 years — stepped-down tail fees, ~$150K/yr" },
    { stage: "harvest", source: "fund",      target: "providers", amount: 0.15, kind: "fund_expense", notes: "Admin, audit, tax over years 6–10" },
    { stage: "harvest", source: "fund",      target: "lawyers", amount: 0.05,  kind: "fund_expense", notes: "Fund counsel: amendments, distributions, wind-down" },
    { stage: "harvest", source: "fund",      target: "lps",     amount: 22.4,  kind: "distribution", notes: "$10.5M capital back + $11.9M profit share (80% of LP profits) → 2.13x net" },
    { stage: "harvest", source: "fund",      target: "gp",      amount: 4.5,   kind: "distribution", notes: "Return of the GP commitment" },
    { stage: "harvest", source: "fund",      target: "gp",      amount: 6.375, kind: "distribution", notes: "GP's pro-rata profit on its own 30% — no carry charged on your own money" },
    { stage: "harvest", source: "fund",      target: "gp",      amount: 2.975, kind: "carry",        notes: "Carried interest: 20% of the LPs' $14.9M profit" },
    { stage: "harvest", source: "gp",        target: "partners", amount: 10.875, kind: "distribution", notes: "Commitment back + investment profit — being the anchor LP pays better than carry here" },
    { stage: "harvest", source: "gp",        target: "partners", amount: 2.975, kind: "carry",        notes: "Carry, split per partner points & vesting" },
    { stage: "harvest", source: "mgmtco",    target: "team",    amount: 0.5,   kind: "compensation", notes: "Skeleton crew through the harvest years" },
    { stage: "harvest", source: "mgmtco",    target: "ops",     amount: 0.2,   kind: "opex",         notes: "Smaller footprint post-investment-period" },
    { stage: "harvest", source: "mgmtco",    target: "lawyers", amount: 0.02,  kind: "opex",         notes: "Firm-level legal" },
    { stage: "harvest", source: "mgmtco",    target: "partners", amount: 0.03, kind: "profit",       notes: "MgmtCo profit to its owners (~breakeven in practice)" },
  ],
};
