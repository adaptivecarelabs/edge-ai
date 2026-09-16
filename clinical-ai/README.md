# clinical-ai

Edge-AI's Phase 2 "Clinical AI" work (`docs/project_plan.md`): a deterministic
rule engine (red-flag, RDT, vital-sign, and pregnancy rules) plus a safety
validator that gates the assembled triage record before it reaches a CHW.

Written in TypeScript (not Python, despite the rest of this repo being Python)
because `docs/architecture.md` commits the Android app to React Native, and the
BRD requires offline triage to run fully on-device with no edge-server
dependency — this code is meant to be embedded directly in that app's JS
runtime once it exists, with no port required. Until then it runs standalone
under Node for development and testing.

## ⚠️ Rules are draft and clinically unreviewed

Every rule in `src/rules/` has `reviewStatus: 'unreviewed'` and a
`guidelineRef` of `UNVERIFIED`. They mirror widely-published WHO IMCI-style
danger signs and standard vital-sign thresholds well enough to scaffold the
engine and its test suite, but they are **not** backed by the Phase 1
guideline source inventory sign-off (`docs/project_plan.md` governance row) —
that's blocked on naming a clinical reviewer (see `docs/progress.md`).

Per `docs/system_prompt.md`'s prohibited-behavior list ("must not fabricate
guideline citations"), `guidelineRef` stays `UNVERIFIED` rather than being
filled with an invented-sounding citation. Do not treat this rule set as safe
for real patient triage. When a clinical reviewer is named:

1. Each rule's thresholds/keywords get validated or corrected against the
   actual guideline documents in the (still-pending) source inventory.
2. `guidelineRef` gets updated to the real `{source, id, version}`.
3. `reviewStatus` flips to `'clinically_reviewed'`.

Known scaffolding gaps beyond clinical review: vital-sign thresholds are adult
values only — WHO IMCI's pediatric age-banding (respiratory rate and pulse
danger ranges vary a lot by age) isn't implemented.

## Layout

- `src/types.ts` — shared types, deliberately mirroring
  `schemas/encounter.schema.json`'s `observations` object and
  `schemas/triage.schema.json`'s `rule_engine_result`/`output` shapes, so
  engine input/output round-trips into those documents without translation.
- `src/rules/{redFlag,rdt,vitals,pregnancy}.ts` — one file per category.
- `src/engine.ts` — `RuleEngine`: runs every rule, aggregates results. A fired
  red flag always forces `HIGH_RISK` and is never downgraded by anything else
  (`docs/system_prompt.md` rule 7 and the Triage Priority section).
- `src/safety/` — `validateTriageRecord`: the output-validation gate
  (`docs/project_plan.md`'s "Safety validator" task). Takes an assembled
  `TriageRecordInput` (rule engine + LLM + GraphRAG stages already run,
  mirroring `schemas/triage.schema.json`) and returns
  `{passed, findings, notes}`. Each of its 8 checks traces to a specific
  `docs/system_prompt.md` rule or Clinical Recommendation Format field — see
  the comments in `validator.ts`. It only catches *structurally* detectable
  violations (e.g. a red flag dropped between pipeline stages, an ungrounded
  LLM claim) — it cannot police free-text content like a fabricated drug name,
  which needs either a real LLM output classifier or clinical review.
- `src/index.ts` — public entry point; exports a ready-to-use
  `defaultRuleEngine` and the safety validator.

## Usage

```ts
import { defaultRuleEngine, validateTriageRecord } from '@edge-ai/clinical-ai';

const ruleResult = defaultRuleEngine.evaluate({
  age: 34,
  sex: 'female',
  pregnant: true,
  gestational_weeks: 32,
  temperature_c: 37.2,
  blood_pressure: { systolic: 118, diastolic: 76 },
  respiratory_rate: 16,
  pulse: 80,
  symptoms: ['severe headache', 'blurred vision'],
  rdt_results: [],
  medications: [],
  history: [],
});
// ruleResult.risk_level === 'HIGH_RISK'

// Whoever assembles the final triage.schema.json record (today: just the rule
// engine output; later: + LLM + GraphRAG stages) runs it through the validator
// before it reaches a CHW:
const safety = validateTriageRecord({
  inference_pathway: 'deterministic_rule',
  rule_engine_result: ruleResult,
  llm_result: null,
  graphrag_retrieval: null,
  output: {
    risk_level: ruleResult.risk_level,
    immediate_action: 'Refer now.',
    rationale: 'Possible severe pre-eclampsia.',
    red_flags: ruleResult.red_flags,
    missing_information: [],
    guideline_refs: [],
    confidence_statement: 'Rule engine coverage is limited; low confidence in ruling out other conditions.',
    escalation_instruction: 'Refer to nearest facility immediately.',
  },
  chw_review: { reviewed: false },
});
// safety.passed === true
```

## Develop

```bash
npm install
npm test        # jest
npm run typecheck
npm run build    # emits dist/ (commonjs + .d.ts)
```
