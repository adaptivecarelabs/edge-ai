import { vitalRules } from '../../src/rules/vitals';
import { makeObservations } from '../helpers';

function fire(ruleId: string, obs = makeObservations()) {
  const rule = vitalRules.find((r) => r.id === ruleId);
  if (!rule) throw new Error(`no such rule: ${ruleId}`);
  return rule.evaluate(obs);
}

describe('vital sign rules', () => {
  it('VT-001 fires on high fever', () => {
    expect(fire('VT-001-high-fever', makeObservations({ temperature_c: 40.0 }))?.redFlag).toBe(true);
  });

  it('VT-001 does not fire on normal temperature', () => {
    expect(fire('VT-001-high-fever', makeObservations({ temperature_c: 37.0 }))).toBeNull();
  });

  it('VT-002 fires on hypothermia', () => {
    expect(fire('VT-002-hypothermia', makeObservations({ temperature_c: 34.0 }))?.redFlag).toBe(true);
  });

  it('VT-003 fires on tachypnea', () => {
    expect(fire('VT-003-tachypnea', makeObservations({ respiratory_rate: 32 }))?.redFlag).toBe(true);
  });

  it('VT-004 fires on abnormal pulse (high)', () => {
    expect(fire('VT-004-pulse-abnormal', makeObservations({ pulse: 130 }))?.redFlag).toBe(true);
  });

  it('VT-004 fires on abnormal pulse (low)', () => {
    expect(fire('VT-004-pulse-abnormal', makeObservations({ pulse: 35 }))?.redFlag).toBe(true);
  });

  it('VT-004 does not fire on normal pulse', () => {
    expect(fire('VT-004-pulse-abnormal', makeObservations({ pulse: 72 }))).toBeNull();
  });

  it('VT-005 fires on hypotension', () => {
    const obs = makeObservations({ blood_pressure: { systolic: 85, diastolic: 55 } });
    expect(fire('VT-005-hypotension', obs)?.redFlag).toBe(true);
  });

  it('VT-005 does not fire when blood pressure is missing', () => {
    expect(fire('VT-005-hypotension', makeObservations({ blood_pressure: null }))).toBeNull();
  });
});
