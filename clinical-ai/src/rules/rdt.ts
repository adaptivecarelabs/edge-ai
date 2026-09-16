import type { RuleDefinition } from '../types';

/**
 * DRAFT / UNREVIEWED. RDT = Rapid Diagnostic Test. Mirrors the general
 * uncomplicated-vs-severe malaria distinction (positive RDT is treatable per
 * protocol; positive RDT plus danger signs is a medical emergency) to scaffold
 * the engine and its test suite. Not a substitute for clinical review - see
 * clinical-ai/README.md.
 */

function hasSymptomMatching(symptoms: string[], keywords: string[]): boolean {
  const lowered = symptoms.map((s) => s.toLowerCase());
  return keywords.some((kw) => lowered.some((s) => s.includes(kw)));
}

function malariaRdtPositive(rdtResults: { test_type: string; result: string }[]): boolean {
  return rdtResults.some(
    (r) => r.test_type.toLowerCase().includes('malaria') && r.result.toLowerCase() === 'positive'
  );
}

const UNVERIFIED = { source: 'NATIONAL_MALARIA_PROTOCOL', id: 'UNVERIFIED', version: 'n/a' } as const;

const DANGER_SIGN_KEYWORDS = [
  'convulsion',
  'seizure',
  'unconscious',
  'unresponsive',
  'lethargic',
  'unable to drink',
  'vomiting everything',
];

export const rdtRules: RuleDefinition[] = [
  {
    id: 'RDT-002-severe-malaria',
    category: 'rdt',
    description: 'Positive malaria RDT with a danger sign or high fever present (possible severe malaria).',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (!malariaRdtPositive(obs.rdt_results)) return null;
      const hasDangerSign = hasSymptomMatching(obs.symptoms, DANGER_SIGN_KEYWORDS);
      const highFever = obs.temperature_c !== null && obs.temperature_c >= 39.5;
      if (!hasDangerSign && !highFever) return null;
      return {
        ruleId: 'RDT-002-severe-malaria',
        redFlag: true,
        message: 'Positive malaria RDT with danger sign(s) or high fever (possible severe malaria)',
      };
    },
  },
  {
    id: 'RDT-001-uncomplicated-malaria',
    category: 'rdt',
    description: 'Positive malaria RDT with no danger sign or high fever present.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (!malariaRdtPositive(obs.rdt_results)) return null;
      const hasDangerSign = hasSymptomMatching(obs.symptoms, DANGER_SIGN_KEYWORDS);
      const highFever = obs.temperature_c !== null && obs.temperature_c >= 39.5;
      if (hasDangerSign || highFever) return null; // RDT-002 already covers this case
      return {
        ruleId: 'RDT-001-uncomplicated-malaria',
        redFlag: false,
        message: 'Positive malaria RDT, no danger signs (treat per national malaria protocol)',
      };
    },
  },
];
