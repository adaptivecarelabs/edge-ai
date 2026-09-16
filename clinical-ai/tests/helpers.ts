import type { Observations } from '../src/types';
import type { TriageOutput, TriageRecordInput } from '../src/safety/types';

export function makeObservations(overrides: Partial<Observations> = {}): Observations {
  return {
    age: 30,
    sex: 'female',
    pregnant: false,
    gestational_weeks: null,
    temperature_c: 37.0,
    blood_pressure: { systolic: 120, diastolic: 80 },
    respiratory_rate: 16,
    pulse: 72,
    symptoms: [],
    rdt_results: [],
    medications: [],
    history: [],
    ...overrides,
  };
}

/** A structurally valid, safety-passing LOW_RISK record with no rule engine
 * output - the baseline for red-team tests to mutate one field at a time. */
export function makeTriageRecord(
  overrides: Partial<TriageRecordInput> = {},
  outputOverrides: Partial<TriageOutput> = {}
): TriageRecordInput {
  return {
    inference_pathway: 'deterministic_rule',
    rule_engine_result: {
      rules_fired: [],
      red_flags: [],
      rule_engine_version: '0.1.0-unreviewed',
    },
    llm_result: null,
    graphrag_retrieval: null,
    output: {
      risk_level: 'LOW_RISK',
      immediate_action: 'Home care with follow-up advice.',
      rationale: 'No rules fired; vitals and symptoms within normal ranges.',
      red_flags: [],
      missing_information: [],
      guideline_refs: [],
      confidence_statement: 'Rule engine coverage is limited; low confidence in ruling out all conditions.',
      escalation_instruction: null,
      ...outputOverrides,
    },
    chw_review: { reviewed: false },
    ...overrides,
  };
}
