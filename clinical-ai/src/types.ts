/**
 * Mirrors schemas/encounter.schema.json's `observations` object and
 * schemas/triage.schema.json's `rule_engine_result` / `output` shapes, so engine
 * input/output can be written directly into those documents without translation.
 */

export interface BloodPressure {
  systolic: number | null;
  diastolic: number | null;
}

export interface RdtResult {
  test_type: string;
  result: string;
}

export interface Observations {
  age: number | null;
  sex: 'male' | 'female' | 'unknown';
  pregnant: boolean | null;
  gestational_weeks: number | null;
  temperature_c: number | null;
  blood_pressure: BloodPressure | null;
  respiratory_rate: number | null;
  pulse: number | null;
  symptoms: string[];
  rdt_results: RdtResult[];
  medications: string[];
  history: string[];
}

export type RuleCategory = 'red_flag' | 'rdt' | 'vital' | 'pregnancy';

/**
 * Matches triage.schema.json's output.guideline_refs[] shape. `id`/`version` are
 * "UNVERIFIED" until the Phase 1 guideline source inventory (docs/project_plan.md,
 * blocked on a named clinical reviewer) is finalized and this rule is reviewed
 * against a real, approved source. Never replace this with an invented citation -
 * system_prompt.md explicitly prohibits fabricating guideline citations.
 */
export interface GuidelineRef {
  source: string;
  id: string;
  version: string;
}

export type ReviewStatus = 'unreviewed' | 'clinically_reviewed';

export interface RuleOutcome {
  ruleId: string;
  /** True only for danger-sign rules that must force escalation regardless of other findings. */
  redFlag: boolean;
  message: string;
}

export interface RuleDefinition {
  id: string;
  category: RuleCategory;
  description: string;
  guidelineRef: GuidelineRef;
  reviewStatus: ReviewStatus;
  evaluate: (obs: Observations) => RuleOutcome | null;
}

/** Matches triage.schema.json's rule_engine_result.rules_fired[] item shape. */
export interface RuleFired {
  rule_id: string;
  guideline_ref: string;
}

export type RiskLevel = 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK' | 'INSUFFICIENT_DATA' | 'ESCALATE';

/** Matches triage.schema.json's rule_engine_result object shape. */
export interface RuleEngineResult {
  rules_fired: RuleFired[];
  red_flags: string[];
  rule_engine_version: string;
}

export interface TriageEngineResult extends RuleEngineResult {
  risk_level: RiskLevel;
  /** True when the rule engine alone resolves the case (system_prompt.md Hybrid Inference step 2);
   * false means the case should proceed to the medical LLM / GraphRAG pathway. */
  resolved: boolean;
}
