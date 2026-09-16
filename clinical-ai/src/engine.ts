import type {
  Observations,
  RuleDefinition,
  RuleFired,
  TriageEngineResult,
} from './types';

function formatGuidelineRef(rule: RuleDefinition): string {
  const { source, id, version } = rule.guidelineRef;
  return `${source}:${id}@${version}`;
}

/** Coarse "do we have enough to reason about this case at all" check. Not a
 * substitute for per-rule data requirements - just guards against evaluating
 * an effectively empty observation set as if it were a confirmed low-risk case. */
function hasMinimumData(obs: Observations): boolean {
  const hasVitals =
    obs.temperature_c !== null ||
    obs.respiratory_rate !== null ||
    obs.pulse !== null ||
    (obs.blood_pressure !== null &&
      (obs.blood_pressure.systolic !== null || obs.blood_pressure.diastolic !== null));
  return obs.symptoms.length > 0 || obs.rdt_results.length > 0 || hasVitals;
}

export class RuleEngine {
  private readonly rules: RuleDefinition[];
  private readonly version: string;

  constructor(rules: RuleDefinition[], version: string) {
    const ids = new Set<string>();
    for (const rule of rules) {
      if (ids.has(rule.id)) {
        throw new Error(`Duplicate rule id: ${rule.id}`);
      }
      ids.add(rule.id);
    }
    this.rules = rules;
    this.version = version;
  }

  evaluate(obs: Observations): TriageEngineResult {
    const rulesFired: RuleFired[] = [];
    const redFlags: string[] = [];

    for (const rule of this.rules) {
      const outcome = rule.evaluate(obs);
      if (!outcome) continue;
      rulesFired.push({ rule_id: outcome.ruleId, guideline_ref: formatGuidelineRef(rule) });
      if (outcome.redFlag) {
        redFlags.push(outcome.message);
      }
    }

    // system_prompt.md rule 7 / Triage Priority: a fired red flag always forces
    // escalation and must never be downgraded by anything evaluated afterward.
    if (redFlags.length > 0) {
      return {
        risk_level: 'HIGH_RISK',
        rules_fired: rulesFired,
        red_flags: redFlags,
        rule_engine_version: this.version,
        resolved: true,
      };
    }

    if (!hasMinimumData(obs)) {
      return {
        risk_level: 'INSUFFICIENT_DATA',
        rules_fired: rulesFired,
        red_flags: redFlags,
        rule_engine_version: this.version,
        resolved: false,
      };
    }

    if (rulesFired.length > 0) {
      // A non-red-flag rule fired (e.g. uncomplicated malaria RDT positive): needs
      // protocol-based action but isn't an immediate emergency. Treated as not fully
      // resolved so it's eligible for LLM/GraphRAG-assisted guidance until a clinical
      // reviewer confirms rule coverage is complete for this category.
      return {
        risk_level: 'MEDIUM_RISK',
        rules_fired: rulesFired,
        red_flags: redFlags,
        rule_engine_version: this.version,
        resolved: false,
      };
    }

    return {
      risk_level: 'LOW_RISK',
      rules_fired: rulesFired,
      red_flags: redFlags,
      rule_engine_version: this.version,
      resolved: false,
    };
  }
}
