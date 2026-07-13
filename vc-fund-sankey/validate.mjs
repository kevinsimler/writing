// Conservation checker: for each stage, every node declared "internal" must
// have inflows == outflows. Sources/sinks are exempt. Run: node validate.mjs
import "./data.js";

const data = globalThis.FUND_DATA;
const EPS = 0.001;
let failures = 0;

const nodeById = Object.fromEntries(data.nodes.map((n) => [n.id, n]));

for (const flow of data.flows) {
  for (const end of [flow.source, flow.target]) {
    if (!nodeById[end]) {
      console.error(`✗ flow references unknown node "${end}"`);
      failures++;
    }
  }
  if (!data.stages.some((s) => s.id === flow.stage)) {
    console.error(`✗ flow ${flow.source}→${flow.target} references unknown stage "${flow.stage}"`);
    failures++;
  }
}

for (const stage of data.stages) {
  const flows = data.flows.filter((f) => f.stage === stage.id);
  console.log(`\n${stage.label} (${stage.period}) — ${flows.length} flows`);

  const totals = {};
  for (const f of flows) {
    (totals[f.source] ??= { in: 0, out: 0 }).out += f.amount;
    (totals[f.target] ??= { in: 0, out: 0 }).in += f.amount;
  }

  for (const [id, t] of Object.entries(totals).sort()) {
    const internal = stage.internalNodes.includes(id);
    const delta = t.in - t.out;
    const balanced = Math.abs(delta) < EPS;
    const role = internal ? "internal" : t.in === 0 ? "source" : t.out === 0 ? "sink" : "mixed";
    const mark = internal ? (balanced ? "✓" : "✗") : "·";
    console.log(
      `  ${mark} ${id.padEnd(18)} in ${t.in.toFixed(1).padStart(6)}  out ${t.out.toFixed(1).padStart(6)}  ${role}${
        internal && !balanced ? `  IMBALANCE ${delta.toFixed(3)}` : ""
      }`
    );
    if (internal && !balanced) failures++;
  }
}

// Headline sanity numbers
const h = data.flows.filter((f) => f.stage === "harvest");
const lpIn = data.flows.filter((f) => f.stage === "deploy" && f.source === "lps").reduce((s, f) => s + f.amount, 0);
const lpOut = h.filter((f) => f.target === "lps").reduce((s, f) => s + f.amount, 0);
console.log(`\nLP net multiple: ${(lpOut / lpIn).toFixed(2)}x  ($${lpIn}M in → $${lpOut}M back)`);

if (failures) {
  console.error(`\n${failures} problem(s) found`);
  process.exit(1);
}
console.log("All internal nodes conserve. Ship it.");
