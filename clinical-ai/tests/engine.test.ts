import { RuleEngine } from '../src/engine';
import { allRules } from '../src/rules';
import { makeObservations } from './helpers';

describe('RuleEngine', () => {
  const engine = new RuleEngine(allRules, 'test-version');

  it('rejects duplicate rule ids at construction', () => {
    const dup = allRules[0];
    expect(() => new RuleEngine([dup, dup], 'v')).toThrow(/Duplicate rule id/);
  });

  it('every defined red-flag scenario triggers HIGH_RISK escalation', () => {
    const redFlagScenarios = [
      makeObservations({ symptoms: ['convulsions'] }),
      makeObservations({ symptoms: ['unconscious'] }),
      makeObservations({ symptoms: ['unable to drink'] }),
      makeObservations({ symptoms: ['severe bleeding'] }),
      makeObservations({ temperature_c: 40.0 }),
      makeObservations({ temperature_c: 34.0 }),
      makeObservations({ respiratory_rate: 32 }),
      makeObservations({ pulse: 130 }),
      makeObservations({ blood_pressure: { systolic: 85, diastolic: 55 } }),
      makeObservations({ pregnant: true, symptoms: ['severe headache', 'blurred vision'] }),
      makeObservations({ pregnant: true, symptoms: ['vaginal bleeding'] }),
      makeObservations({
        rdt_results: [{ test_type: 'malaria', result: 'positive' }],
        symptoms: ['convulsions'],
      }),
    ];

    for (const obs of redFlagScenarios) {
      const result = engine.evaluate(obs);
      expect(result.risk_level).toBe('HIGH_RISK');
      expect(result.red_flags.length).toBeGreaterThan(0);
      expect(result.resolved).toBe(true);
    }
  });

  it('a red flag is never downgraded by other findings (system_prompt.md rule 7)', () => {
    // Positive-but-uncomplicated RDT alongside an unrelated red flag: overall
    // result must still be HIGH_RISK, not averaged down to MEDIUM_RISK.
    const obs = makeObservations({
      symptoms: ['convulsions'],
      rdt_results: [{ test_type: 'malaria', result: 'positive' }],
    });
    expect(engine.evaluate(obs).risk_level).toBe('HIGH_RISK');
  });

  it('reports INSUFFICIENT_DATA when there is nothing to reason about', () => {
    const obs = makeObservations({
      temperature_c: null,
      respiratory_rate: null,
      pulse: null,
      blood_pressure: null,
      symptoms: [],
      rdt_results: [],
    });
    const result = engine.evaluate(obs);
    expect(result.risk_level).toBe('INSUFFICIENT_DATA');
    expect(result.resolved).toBe(false);
  });

  it('reports MEDIUM_RISK when a non-red-flag rule fires', () => {
    const obs = makeObservations({ rdt_results: [{ test_type: 'malaria', result: 'positive' }] });
    const result = engine.evaluate(obs);
    expect(result.risk_level).toBe('MEDIUM_RISK');
    expect(result.red_flags).toHaveLength(0);
    expect(result.rules_fired).toHaveLength(1);
  });

  it('reports LOW_RISK with normal vitals and no symptoms', () => {
    const result = engine.evaluate(makeObservations());
    expect(result.risk_level).toBe('LOW_RISK');
    expect(result.resolved).toBe(false);
  });

  it('formats rules_fired guideline_ref as "source:id@version"', () => {
    const obs = makeObservations({ temperature_c: 40.0 });
    const result = engine.evaluate(obs);
    expect(result.rules_fired[0].guideline_ref).toBe('GENERIC_VITALS:UNVERIFIED@n/a');
  });
});
