import type { RuleDefinition } from '../types';

/**
 * DRAFT / UNREVIEWED. These mirror widely-published WHO IMCI "general danger sign"
 * categories (convulsions, lethargy/unconsciousness, inability to drink/breastfeed,
 * severe bleeding) purely to scaffold the engine and its test suite. They are not
 * a substitute for the Phase 1 guideline source inventory sign-off
 * (docs/project_plan.md, blocked on a named clinical reviewer - see
 * docs/progress.md) and must not be treated as clinically approved until that
 * review happens and guidelineRef is updated with a real citation.
 */

function hasSymptomMatching(symptoms: string[], keywords: string[]): boolean {
  const lowered = symptoms.map((s) => s.toLowerCase());
  return keywords.some((kw) => lowered.some((s) => s.includes(kw)));
}

const UNVERIFIED = { source: 'WHO_IMCI', id: 'UNVERIFIED', version: 'n/a' } as const;

export const redFlagRules: RuleDefinition[] = [
  {
    id: 'RF-001-convulsions',
    category: 'red_flag',
    description: 'Convulsions or seizure activity reported.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (!hasSymptomMatching(obs.symptoms, ['convulsion', 'seizure'])) return null;
      return { ruleId: 'RF-001-convulsions', redFlag: true, message: 'Convulsions/seizure reported' };
    },
  },
  {
    id: 'RF-002-unconscious',
    category: 'red_flag',
    description: 'Lethargy, unresponsiveness, or unconsciousness reported.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (!hasSymptomMatching(obs.symptoms, ['unconscious', 'unresponsive', 'lethargic', 'lethargy'])) {
        return null;
      }
      return { ruleId: 'RF-002-unconscious', redFlag: true, message: 'Lethargic or unconscious' };
    },
  },
  {
    id: 'RF-003-unable-to-drink',
    category: 'red_flag',
    description: 'Unable to drink/breastfeed, or vomiting everything.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (
        !hasSymptomMatching(obs.symptoms, [
          'unable to drink',
          'not able to breastfeed',
          'unable to breastfeed',
          'vomiting everything',
          'vomits everything',
        ])
      ) {
        return null;
      }
      return {
        ruleId: 'RF-003-unable-to-drink',
        redFlag: true,
        message: 'Unable to drink/breastfeed or vomiting everything',
      };
    },
  },
  {
    id: 'RF-004-severe-bleeding',
    category: 'red_flag',
    description: 'Severe or uncontrolled bleeding reported.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (!hasSymptomMatching(obs.symptoms, ['severe bleeding', 'hemorrhage', 'heavy bleeding'])) {
        return null;
      }
      return { ruleId: 'RF-004-severe-bleeding', redFlag: true, message: 'Severe bleeding reported' };
    },
  },
];
