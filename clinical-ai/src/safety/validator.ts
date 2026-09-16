import type {
  FindingSeverity,
  SafetyFinding,
  SafetyValidationResult,
  TriageRecordInput,
} from './types';

/**
 * DRAFT / UNREVIEWED, like the rule engine. Each check below is mechanically
 * derived from an explicit rule in docs/system_prompt.md (cited per check) or a
 * required field in schemas/triage.schema.json's Clinical Recommendation Format.
 * It does NOT attempt to police free-text content (e.g. detecting a fabricated
 * drug name in llm_result.reasoning_summary) - that needs either a real LLM
 * output classifier or clinical review, neither of which exist yet. This
 * validator only catches structurally-detectable safety violations.
 */

export const SAFETY_VALIDATOR_VERSION = '0.1.0-draft';

const HIGH_URGENCY_LEVELS = ['HIGH_RISK', 'ESCALATE'];

interface ParsedGuidelineRef {
  source: string;
  id: string;
  version: string;
  where: string;
}

/** rule_engine_result.rules_fired[].guideline_ref is the flat "source:id@version"
 * string produced by engine.ts's formatGuidelineRef. */
function parseFlatGuidelineRef(where: string, raw: string): ParsedGuidelineRef {
  const match = /^([^:]*):([^@]*)@(.*)$/.exec(raw);
  if (!match) {
    return { source: '', id: '', version: '', where };
  }
  const [, source, id, version] = match;
  return { source, id, version, where };
}

export function validateTriageRecord(record: TriageRecordInput): SafetyValidationResult {
  const findings: SafetyFinding[] = [];
  const push = (id: string, severity: FindingSeverity, message: string) => {
    findings.push({ id, severity, message });
  };

  const ruleRedFlags = record.rule_engine_result?.red_flags ?? [];
  const outputRedFlags = record.output.red_flags ?? [];

  // system_prompt.md rule 7 / Triage Priority / prohibited-behavior list: never
  // downgrade a deterministic emergency rule.
  if (ruleRedFlags.length > 0 && !HIGH_URGENCY_LEVELS.includes(record.output.risk_level)) {
    push(
      'SV-001-red-flag-downgrade',
      'block',
      `Deterministic red flag(s) present (${ruleRedFlags.join('; ')}) but risk_level is ` +
        `${record.output.risk_level}, not HIGH_RISK/ESCALATE.`
    );
  }

  // A red flag silently dropped between the rule engine and final output is as
  // dangerous as an explicit downgrade.
  const suppressedFlags = ruleRedFlags.filter((f) => !outputRedFlags.includes(f));
  if (suppressedFlags.length > 0) {
    push(
      'SV-002-red-flag-suppressed',
      'block',
      `Red flag(s) detected by the rule engine are missing from output.red_flags: ${suppressedFlags.join('; ')}`
    );
  }

  // Clinical Recommendation Format point 8: explicit escalation instruction
  // required for unsupported/ambiguous/high-urgency cases.
  if (HIGH_URGENCY_LEVELS.includes(record.output.risk_level) && !record.output.escalation_instruction?.trim()) {
    push(
      'SV-003-missing-escalation-instruction',
      'block',
      `risk_level is ${record.output.risk_level} but escalation_instruction is missing.`
    );
  }

  // system_prompt.md rule 8: never suppress a clinically significant uncertainty;
  // Clinical Recommendation Format point 7 requires this on every recommendation.
  if (!record.output.confidence_statement?.trim()) {
    push('SV-004-missing-confidence-statement', 'block', 'output.confidence_statement is empty.');
  }

  // Hybrid Inference: the LLM must be GraphRAG-grounded. An ungrounded LLM claim
  // is exactly the "unsupported treatment recommendation" / fabricated-guideline
  // risk the prohibited-behavior list calls out.
  if (record.inference_pathway === 'hybrid_llm') {
    const grounded =
      !!record.llm_result && !!record.graphrag_retrieval && record.graphrag_retrieval.guideline_ids.length > 0;
    if (!grounded) {
      push(
        'SV-005-ungrounded-llm-output',
        'block',
        'inference_pathway is hybrid_llm but llm_result/graphrag_retrieval is missing or has no retrieved guideline_ids.'
      );
    }
  }

  const refs: ParsedGuidelineRef[] = [
    ...(record.rule_engine_result?.rules_fired ?? []).map((rf) =>
      parseFlatGuidelineRef(`rule_engine_result.rules_fired[${rf.rule_id}]`, rf.guideline_ref)
    ),
    ...record.output.guideline_refs.map((gr, i) => ({ ...gr, where: `output.guideline_refs[${i}]` })),
  ];
  for (const ref of refs) {
    if (!ref.source.trim() || !ref.id.trim() || !ref.version.trim()) {
      push('SV-007-empty-guideline-ref', 'block', `Empty or malformed guideline citation in ${ref.where}.`);
      continue;
    }
    // Honest labeling of an unreviewed rule (UNVERIFIED) is not fabrication - it's
    // the opposite - so this is a flag surfaced to the reviewer, not a block.
    if (ref.id === 'UNVERIFIED') {
      push(
        'SV-006-unreviewed-citation',
        'flag',
        `Citation in ${ref.where} is UNVERIFIED - underlying rule is not yet clinically reviewed.`
      );
    }
  }

  // Any override of the recommendation must be justified and auditable.
  if (record.chw_review.override && !record.chw_review.override.reason?.trim()) {
    push('SV-008-chw-override-missing-reason', 'block', 'chw_review.override is present without a reason.');
  }

  const passed = !findings.some((f) => f.severity === 'block');
  const notes =
    findings.length > 0 ? findings.map((f) => `[${f.severity.toUpperCase()}] ${f.id}: ${f.message}`).join(' | ') : null;

  return { passed, validator_version: SAFETY_VALIDATOR_VERSION, notes, findings };
}
