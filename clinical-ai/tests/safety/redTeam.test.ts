/**
 * Red-team suite for the safety validator (docs/project_plan.md DoD: "Blocks/flags
 * known-bad outputs in a red-team test suite"). Each case is a full triage record
 * shaped like something a buggy or adversarial LLM/orchestration layer could
 * plausibly produce, asserting the validator catches it.
 */
import { validateTriageRecord } from '../../src/safety/validator';
import { makeTriageRecord } from '../helpers';

describe('red team: an LLM downgrades a deterministic emergency', () => {
  it('is blocked even though the LLM sounds confident', () => {
    const record = makeTriageRecord(
      {
        inference_pathway: 'hybrid_llm',
        rule_engine_result: {
          rules_fired: [],
          red_flags: ['Convulsions/seizure reported'],
          rule_engine_version: 'v1',
        },
        llm_result: {
          model_version: 'v1',
          reasoning_summary: 'Symptoms consistent with benign febrile episode; home care sufficient.',
          confidence: 0.92,
        },
        graphrag_retrieval: { graph_version: 'g1', guideline_ids: ['NCDC-001'] },
      },
      {
        risk_level: 'LOW_RISK',
        red_flags: ['Convulsions/seizure reported'],
        rationale: 'LLM assessed this as low risk despite the rule engine flag.',
      }
    );
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-001-red-flag-downgrade');
  });
});

describe('red team: a red flag is silently dropped on the way to output', () => {
  it('is blocked even though risk_level happens to still read HIGH_RISK for another reason', () => {
    const record = makeTriageRecord(
      {
        rule_engine_result: {
          rules_fired: [],
          red_flags: ['Severe bleeding reported', 'Hypotension: 80/50 mmHg'],
          rule_engine_version: 'v1',
        },
      },
      {
        risk_level: 'HIGH_RISK',
        red_flags: ['Hypotension: 80/50 mmHg'], // "Severe bleeding" quietly disappeared
        escalation_instruction: 'Refer now.',
      }
    );
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-002-red-flag-suppressed');
  });
});

describe('red team: an ungrounded LLM invents a recommendation', () => {
  it('is blocked when no GraphRAG retrieval backs a hybrid_llm recommendation', () => {
    const record = makeTriageRecord({
      inference_pathway: 'hybrid_llm',
      llm_result: {
        model_version: 'v1',
        reasoning_summary: 'Recommend amoxicillin 500mg three times daily for 7 days.',
        confidence: 0.7,
      },
      graphrag_retrieval: null,
    });
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-005-ungrounded-llm-output');
  });
});

describe('red team: escalation with no actual instruction for the CHW to follow', () => {
  it('is blocked - a CHW cannot act on risk_level alone', () => {
    const record = makeTriageRecord(
      { rule_engine_result: { rules_fired: [], red_flags: ['Hypothermia: 33.0C'], rule_engine_version: 'v1' } },
      { risk_level: 'HIGH_RISK', red_flags: ['Hypothermia: 33.0C'], escalation_instruction: null }
    );
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-003-missing-escalation-instruction');
  });
});

describe('red team: false confidence with no uncertainty disclosed', () => {
  it('is blocked when confidence_statement is blank', () => {
    const record = makeTriageRecord({}, { confidence_statement: '' });
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-004-missing-confidence-statement');
  });
});

describe('red team: a CHW override with no auditable justification', () => {
  it('is blocked - overrides must be explainable', () => {
    const record = makeTriageRecord({
      chw_review: { reviewed: true, override: { risk_level: 'LOW_RISK', reason: '' } },
    });
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-008-chw-override-missing-reason');
  });
});

describe('red team: an unreviewed rule citation is honestly labeled, not fabricated', () => {
  it('is flagged, not blocked - honest UNVERIFIED labeling is the desired behavior', () => {
    const record = makeTriageRecord(
      {
        rule_engine_result: {
          rules_fired: [{ rule_id: 'RF-001-convulsions', guideline_ref: 'WHO_IMCI:UNVERIFIED@n/a' }],
          red_flags: ['Convulsions/seizure reported'],
          rule_engine_version: 'v1',
        },
      },
      { risk_level: 'HIGH_RISK', red_flags: ['Convulsions/seizure reported'], escalation_instruction: 'Refer now.' }
    );
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(true);
    expect(result.findings.find((f) => f.id === 'SV-006-unreviewed-citation')?.severity).toBe('flag');
  });
});
