# VC Fund Flows — Sankey Sketch

A data model + visualization sketch of how money moves through a standard VC fund
structure. Hypothetical **$15M micro-fund** ("Vienna Ventures Fund I"): 3%/yr fees in
years 1–5 stepping to 1%/yr in years 6–10, 20% carry on LP profits, **30% GP commitment
($4.5M)**, 10-year life, whole-fund waterfall.

## Files

| File | What it is |
|---|---|
| `data.js` | The data model instance — nodes, stages, flows. Edit this to iterate. |
| `index.html` | The sankey. Open directly in a browser (no server needed). Toggle between stages, hover ribbons for notes. |
| `validate.mjs` | `node validate.mjs` — checks that every internal node's inflows equal its outflows, per stage. |

## Data model

Three layers:

1. **Nodes** — `{ id, label, kind, desc }`. `kind` distinguishes:
   - `entity`: an actual legal entity in the structure (Fund LP, GP LLC, MgmtCo LLC)
   - `aggregate`: many real parties squashed into one (LPs, portfolio companies, law firms, team)
   - `pseudo`: an accounting fiction needed to keep the sankey honest (see below)
2. **Stages** — `{ id, label, period, internalNodes }`. Each stage is one self-contained,
   acyclic sankey. `internalNodes` lists which nodes must conserve (in == out) within
   that stage; everything else is a source or sink for that stage.
3. **Flows** — `{ stage, source, target, amount, kind, notes }`. `kind` is the color/legend
   taxonomy: `capital`, `mgmt_fee`, `fund_expense`, `deal_expense`, `investment`,
   `carryover`, `appreciation`, `exit_proceeds`, `distribution`, `carry`, `compensation`,
   `opex`, `profit`. `notes` becomes the hover tooltip.

## Design decisions (the load-bearing ones)

**Two stages instead of one diagram.** Fund money flows in a circle — LPs → Fund →
Portfolio → Fund → LPs — and sankeys cannot represent cycles. Splitting the fund's life
at the deploy/harvest boundary makes each half naturally acyclic, and happens to match
how practitioners actually think about fund lifecycle. Stage ① reads left-to-right as
"capital in → costs out + investments"; Stage ② reads as "exits in → waterfall out."

**Value creation is a pseudo-source.** $12.25M of invested capital becomes $37.2M of exit
proceeds. Sankeys conserve mass, so the appreciation has to *come from somewhere*: a
"Value Creation" pseudo-node injects the $24.95M markup into the portfolio node. This is
the single most useful visual in Stage ② — it makes the point that everything the GP and
LPs take home is downstream of that one green ribbon.

**Conservation is enforced, not hoped for.** Real fund accounting balances; so should the
sketch. The validator makes "I tweaked a number" safe.

**A node can play different roles per stage.** LPs are a source in ①, a sink in ②. Rather
than duplicating nodes, roles are stage-scoped via `internalNodes`.

## Simplifications (deliberate, revisit as needed)

- **The returns scenario is an assumption**: 3.0x gross on invested capital ($37.2M of
  exit proceeds), which nets LPs 2.13x after fees and carry. With a 30% GP commitment
  the waterfall carve-out is material, so it's modeled properly: carry (20%) applies to
  LP-attributable profit only; the GP's own 30% rides pro rata, carry-free.
- **Management fees are charged on full committed capital, including the GP's own
  $4.5M** — no fee waiver on the GP commitment is modeled, though with a commitment
  this size many funds would negotiate one (worth ~$900K over the fund's life).
- **No recycling** of early exit proceeds, no fee offsets, no clawback scenario, no
  follow-on reserves shown separately.
- **Time is collapsed** within each stage — capital calls, fees, and distributions that
  actually dribble over 5 years show as single ribbons.
- **MgmtCo runs ~breakeven during deployment** (realistic for many firms); shows a small
  profit-to-owners flow only in harvest.
- Portfolio companies pay deal counsel out of round proceeds ($0.8M) — the customary
  "company pays both sides" arrangement.

## Possible next steps

- **Lifetime view**: a third, single cradle-to-grave sankey. Doable without cycles by
  splitting the Fund node into "Fund (deploying)" and "Fund (distributing)" columns.
- **Scenario knobs**: fund size, fee %, carry %, gross multiple as inputs; derive the
  waterfall instead of hand-writing amounts.
- **Bad-fund scenario**: a 0.8x fund, where the carry ribbon vanishes and fees dominate —
  arguably the more instructive picture.
- **Fee offsets / recycling** as flows once the base picture is agreed.
