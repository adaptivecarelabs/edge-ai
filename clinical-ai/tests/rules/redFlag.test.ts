import { redFlagRules } from '../../src/rules/redFlag';
import { makeObservations } from '../helpers';

function fire(ruleId: string, obs = makeObservations()) {
  const rule = redFlagRules.find((r) => r.id === ruleId);
  if (!rule) throw new Error(`no such rule: ${ruleId}`);
  return rule.evaluate(obs);
}

describe('red flag rules', () => {
  it('RF-001 fires on convulsions', () => {
    const outcome = fire('RF-001-convulsions', makeObservations({ symptoms: ['Convulsions'] }));
    expect(outcome?.redFlag).toBe(true);
  });

  it('RF-001 does not fire without matching symptoms', () => {
    expect(fire('RF-001-convulsions', makeObservations({ symptoms: ['mild cough'] }))).toBeNull();
  });

  it('RF-002 fires on unconsciousness', () => {
    const outcome = fire('RF-002-unconscious', makeObservations({ symptoms: ['unconscious'] }));
    expect(outcome?.redFlag).toBe(true);
  });

  it('RF-003 fires on inability to drink', () => {
    const outcome = fire(
      'RF-003-unable-to-drink',
      makeObservations({ symptoms: ['unable to drink'] })
    );
    expect(outcome?.redFlag).toBe(true);
  });

  it('RF-004 fires on severe bleeding', () => {
    const outcome = fire('RF-004-severe-bleeding', makeObservations({ symptoms: ['severe bleeding'] }));
    expect(outcome?.redFlag).toBe(true);
  });

  it('every red-flag rule is marked unreviewed pending clinical sign-off', () => {
    for (const rule of redFlagRules) {
      expect(rule.reviewStatus).toBe('unreviewed');
      expect(rule.guidelineRef.id).toBe('UNVERIFIED');
    }
  });
});
