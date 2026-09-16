import { rdtRules } from '../../src/rules/rdt';
import { makeObservations } from '../helpers';

function fire(ruleId: string, obs: ReturnType<typeof makeObservations>) {
  const rule = rdtRules.find((r) => r.id === ruleId);
  if (!rule) throw new Error(`no such rule: ${ruleId}`);
  return rule.evaluate(obs);
}

describe('rdt rules', () => {
  it('RDT-001 fires (non-red-flag) on positive malaria RDT with no danger signs', () => {
    const obs = makeObservations({ rdt_results: [{ test_type: 'malaria', result: 'positive' }] });
    const outcome = fire('RDT-001-uncomplicated-malaria', obs);
    expect(outcome).not.toBeNull();
    expect(outcome?.redFlag).toBe(false);
  });

  it('RDT-001 does not fire on negative RDT', () => {
    const obs = makeObservations({ rdt_results: [{ test_type: 'malaria', result: 'negative' }] });
    expect(fire('RDT-001-uncomplicated-malaria', obs)).toBeNull();
  });

  it('RDT-001 defers to RDT-002 when a danger sign is present', () => {
    const obs = makeObservations({
      rdt_results: [{ test_type: 'malaria', result: 'positive' }],
      symptoms: ['convulsions'],
    });
    expect(fire('RDT-001-uncomplicated-malaria', obs)).toBeNull();
  });

  it('RDT-002 fires (red flag) on positive malaria RDT with a danger sign', () => {
    const obs = makeObservations({
      rdt_results: [{ test_type: 'malaria', result: 'positive' }],
      symptoms: ['convulsions'],
    });
    expect(fire('RDT-002-severe-malaria', obs)?.redFlag).toBe(true);
  });

  it('RDT-002 fires (red flag) on positive malaria RDT with high fever', () => {
    const obs = makeObservations({
      rdt_results: [{ test_type: 'malaria', result: 'positive' }],
      temperature_c: 40.0,
    });
    expect(fire('RDT-002-severe-malaria', obs)?.redFlag).toBe(true);
  });

  it('RDT-002 does not fire without a danger sign or high fever', () => {
    const obs = makeObservations({ rdt_results: [{ test_type: 'malaria', result: 'positive' }] });
    expect(fire('RDT-002-severe-malaria', obs)).toBeNull();
  });
});
