import type { RiskLevel } from '../types';

/**
 * Mirrors the subset of schemas/triage.schema.json relevant to output validation.
 * This is the ASSEMBLED triage record - rule engine, LLM, and GraphRAG stages are
 * expected to have already run; the safety validator is the final gate before a
 * recommendation reaches a CHW (system_prompt.md Hybrid Inference step 5).
 */

export interface RuleEngineResultInput {
  rules_fired: { rule_id: string; guideline_ref: string }[];
  red_flags: string[];
  rule_engine_version: string;
}

export interface LlmResultInput {
  model_version: string;
  reasoning_summary: string;
  confidence: number;
}

export interface GraphragRetrievalInput {
  graph_version: string;
  guideline_ids: string[];
}

export interface GuidelineRefOutput {
  source: string;
  id: string;
  version: string;
}

export interface TriageOutput {
  risk_level: RiskLevel;
  immediate_action: string;
  rationale: string;
  red_flags: string[];
  missing_information: string[];
  guideline_refs: GuidelineRefOutput[];
  confidence_statement: string;
  escalation_instruction: string | null;
}

export interface ChwOverride {
  risk_level: RiskLevel;
  reason: string;
}

export interface ChwReviewInput {
  reviewed: boolean;
  override?: ChwOverride | null;
}

export interface TriageRecordInput {
  inference_pathway: 'deterministic_rule' | 'hybrid_llm' | 'escalated_no_inference';
  rule_engine_result: RuleEngineResultInput | null;
  llm_result: LlmResultInput | null;
  graphrag_retrieval: GraphragRetrievalInput | null;
  output: TriageOutput;
  chw_review: ChwReviewInput;
}

export type FindingSeverity = 'block' | 'flag';

export interface SafetyFinding {
  id: string;
  severity: FindingSeverity;
  message: string;
}

/** Matches schemas/triage.schema.json's safety_validation object shape, plus the
 * structured `findings` a caller needs to act on (schema's `notes` is a flattened
 * string rendering of the same findings). */
export interface SafetyValidationResult {
  passed: boolean;
  validator_version: string;
  notes: string | null;
  findings: SafetyFinding[];
}
