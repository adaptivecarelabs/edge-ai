import { pregnancyRules } from '../../src/rules/pregnancy';
import { makeObservations } from '../helpers';

function fire(ruleId: string, obs: ReturnType<typeof makeObservations>) {
  const rule = pregnancyRules.find((r) => r.id === ruleId);
  if (!rule) throw new Error(`no such rule: ${ruleId}`);
  return rule.evaluate(obs);
}

describe('pregnancy rules', () => {
  it('PR-001 fires on severe headache + blurred vision while pregnant', () => {
    const obs = makeObservations({ pregnant: true, symptoms: ['severe headache', 'blurred vision'] });
    expect(fire('PR-001-preeclampsia-signs', obs)?.redFlag).toBe(true);
  });

  it('PR-001 fires on severe hypertension while pregnant', () => {
    const obs = makeObservations({ pregnant: true, blood_pressure: { systolic: 165, diastolic: 100 } });
    expect(fire('PR-001-preeclampsia-signs', obs)?.redFlag).toBe(true);
  });

  it('PR-001 does not fire when not pregnant, even with matching symptoms', () => {
    const obs = makeObservations({ pregnant: false, symptoms: ['severe headache', 'blurred vision'] });
    expect(fire('PR-001-preeclampsia-signs', obs)).toBeNull();
  });

  it('PR-002 fires on vaginal bleeding while pregnant', () => {
    const obs = makeObservations({ pregnant: true, symptoms: ['vaginal bleeding'] });
    expect(fire('PR-002-antepartum-hemorrhage', obs)?.redFlag).toBe(true);
  });

  it('PR-003 fires on reduced fetal movement in third trimester', () => {
    const obs = makeObservations({
      pregnant: true,
      gestational_weeks: 32,
      symptoms: ['reduced fetal movement'],
    });
    expect(fire('PR-003-reduced-fetal-movement', obs)?.redFlag).toBe(true);
  });

  it('PR-003 does not fire before the third trimester', () => {
    const obs = makeObservations({
      pregnant: true,
      gestational_weeks: 20,
      symptoms: ['reduced fetal movement'],
    });
    expect(fire('PR-003-reduced-fetal-movement', obs)).toBeNull();
  });
});
