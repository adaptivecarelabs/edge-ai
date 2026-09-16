import { validateTriageRecord } from '../../src/safety/validator';
import { makeTriageRecord } from '../helpers';

describe('validateTriageRecord: baseline', () => {
  it('passes a structurally valid LOW_RISK record with no findings', () => {
    const result = validateTriageRecord(makeTriageRecord());
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.notes).toBeNull();
  });
});

describe('SV-001 red-flag-downgrade', () => {
  it('blocks when a rule-engine red flag is present but risk_level is not escalated', () => {
    const record = makeTriageRecord(
      { rule_engine_result: { rules_fired: [], red_flags: ['Convulsions reported'], rule_engine_version: 'v1' } },
      { risk_level: 'MEDIUM_RISK', red_flags: ['Convulsions reported'], escalation_instruction: 'Refer now.' }
    );
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-001-red-flag-downgrade');
  });

  it('does not block when risk_level is escalated to match', () => {
    const record = makeTriageRecord(
      { rule_engine_result: { rules_fired: [], red_flags: ['Convulsions reported'], rule_engine_version: 'v1' } },
      { risk_level: 'HIGH_RISK', red_flags: ['Convulsions reported'], escalation_instruction: 'Refer now.' }
    );
    expect(validateTriageRecord(record).passed).toBe(true);
  });
});

describe('SV-002 red-flag-suppressed', () => {
  it('blocks when a rule-engine red flag is missing from output.red_flags', () => {
    const record = makeTriageRecord(
      { rule_engine_result: { rules_fired: [], red_flags: ['Severe bleeding'], rule_engine_version: 'v1' } },
      { risk_level: 'HIGH_RISK', red_flags: [], escalation_instruction: 'Refer now.' }
    );
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.id)).toContain('SV-002-red-flag-suppressed');
  });
});

describe('SV-003 missing-escalation-instruction', () => {
  it('blocks HIGH_RISK with no escalation_instruction', () => {
    const record = makeTriageRecord({}, { risk_level: 'HIGH_RISK', escalation_instruction: null });
    const result = validateTriageRecord(record);
    expect(result.findings.map((f) => f.id)).toContain('SV-003-missing-escalation-instruction');
  });

  it('does not require escalation_instruction for LOW_RISK', () => {
    const record = makeTriageRecord({}, { risk_level: 'LOW_RISK', escalation_instruction: null });
    expect(validateTriageRecord(record).passed).toBe(true);
  });
});

describe('SV-004 missing-confidence-statement', () => {
  it('blocks an empty confidence_statement', () => {
    const record = makeTriageRecord({}, { confidence_statement: '   ' });
    expect(validateTriageRecord(record).findings.map((f) => f.id)).toContain(
      'SV-004-missing-confidence-statement'
    );
  });
});

describe('SV-005 ungrounded-llm-output', () => {
  it('blocks hybrid_llm pathway with no graphrag_retrieval', () => {
    const record = makeTriageRecord({
      inference_pathway: 'hybrid_llm',
      llm_result: { model_version: 'v1', reasoning_summary: 'summary', confidence: 0.8 },
      graphrag_retrieval: null,
    });
    expect(validateTriageRecord(record).findings.map((f) => f.id)).toContain('SV-005-ungrounded-llm-output');
  });

  it('blocks hybrid_llm pathway with empty guideline_ids', () => {
    const record = makeTriageRecord({
      inference_pathway: 'hybrid_llm',
      llm_result: { model_version: 'v1', reasoning_summary: 'summary', confidence: 0.8 },
      graphrag_retrieval: { graph_version: 'g1', guideline_ids: [] },
    });
    expect(validateTriageRecord(record).findings.map((f) => f.id)).toContain('SV-005-ungrounded-llm-output');
  });

  it('passes hybrid_llm pathway that is properly grounded', () => {
    const record = makeTriageRecord({
      inference_pathway: 'hybrid_llm',
      llm_result: { model_version: 'v1', reasoning_summary: 'summary', confidence: 0.8 },
      graphrag_retrieval: { graph_version: 'g1', guideline_ids: ['NCDC-001'] },
    });
    expect(validateTriageRecord(record).passed).toBe(true);
  });
});

describe('SV-006 unreviewed-citation (flag, not block)', () => {
  it('flags but does not block a rule citation marked UNVERIFIED', () => {
    const record = makeTriageRecord({
      rule_engine_result: {
        rules_fired: [{ rule_id: 'VT-001-high-fever', guideline_ref: 'GENERIC_VITALS:UNVERIFIED@n/a' }],
        red_flags: [],
        rule_engine_version: 'v1',
      },
    });
    const result = validateTriageRecord(record);
    expect(result.passed).toBe(true);
    const finding = result.findings.find((f) => f.id === 'SV-006-unreviewed-citation');
    expect(finding?.severity).toBe('flag');
  });
});

describe('SV-007 empty-guideline-ref', () => {
  it('blocks a malformed rule_engine_result guideline_ref string', () => {
    const record = makeTriageRecord({
      rule_engine_result: {
        rules_fired: [{ rule_id: 'X', guideline_ref: 'not-a-valid-format' }],
        red_flags: [],
        rule_engine_version: 'v1',
      },
    });
    expect(validateTriageRecord(record).findings.map((f) => f.id)).toContain('SV-007-empty-guideline-ref');
  });

  it('blocks an output.guideline_refs entry with an empty field', () => {
    const record = makeTriageRecord(
      {},
      { guideline_refs: [{ source: 'WHO', id: '', version: '2024' }] }
    );
    expect(validateTriageRecord(record).findings.map((f) => f.id)).toContain('SV-007-empty-guideline-ref');
  });
});

describe('SV-008 chw-override-missing-reason', () => {
  it('blocks an override with an empty reason', () => {
    const record = makeTriageRecord({
      chw_review: { reviewed: true, override: { risk_level: 'LOW_RISK', reason: '  ' } },
    });
    expect(validateTriageRecord(record).findings.map((f) => f.id)).toContain(
      'SV-008-chw-override-missing-reason'
    );
  });

  it('passes an override with a real reason', () => {
    const record = makeTriageRecord({
      chw_review: {
        reviewed: true,
        override: { risk_level: 'LOW_RISK', reason: 'Clinician examined patient, ruled out concern.' },
      },
    });
    expect(validateTriageRecord(record).passed).toBe(true);
  });
});
