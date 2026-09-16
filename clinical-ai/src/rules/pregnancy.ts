import type { RuleDefinition } from '../types';

/**
 * DRAFT / UNREVIEWED. Mirrors widely-known obstetric danger signs (pre-eclampsia
 * warning symptoms, antepartum hemorrhage, reduced fetal movement) to scaffold the
 * engine and its test suite. Not a substitute for clinical review - see
 * clinical-ai/README.md.
 */

function hasSymptomMatching(symptoms: string[], keywords: string[]): boolean {
  const lowered = symptoms.map((s) => s.toLowerCase());
  return keywords.some((kw) => lowered.some((s) => s.includes(kw)));
}

const UNVERIFIED = { source: 'WHO_OBSTETRIC', id: 'UNVERIFIED', version: 'n/a' } as const;

export const pregnancyRules: RuleDefinition[] = [
  {
    id: 'PR-001-preeclampsia-signs',
    category: 'pregnancy',
    description: 'Pregnant with severe headache + blurred vision, or severe hypertension.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.pregnant !== true) return null;
      const hasSymptoms = hasSymptomMatching(obs.symptoms, ['severe headache']) &&
        hasSymptomMatching(obs.symptoms, ['blurred vision']);
      const bp = obs.blood_pressure;
      const severeHypertension =
        !!bp && ((bp.systolic !== null && bp.systolic >= 160) || (bp.diastolic !== null && bp.diastolic >= 110));
      if (!hasSymptoms && !severeHypertension) return null;
      return {
        ruleId: 'PR-001-preeclampsia-signs',
        redFlag: true,
        message: 'Possible severe pre-eclampsia: danger-sign symptoms or severe hypertension in pregnancy',
      };
    },
  },
  {
    id: 'PR-002-antepartum-hemorrhage',
    category: 'pregnancy',
    description: 'Pregnant with vaginal bleeding.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.pregnant !== true) return null;
      if (!hasSymptomMatching(obs.symptoms, ['vaginal bleeding'])) return null;
      return {
        ruleId: 'PR-002-antepartum-hemorrhage',
        redFlag: true,
        message: 'Vaginal bleeding during pregnancy (possible antepartum hemorrhage)',
      };
    },
  },
  {
    id: 'PR-003-reduced-fetal-movement',
    category: 'pregnancy',
    description: 'Pregnant, third trimester, with reduced or absent fetal movement.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.pregnant !== true) return null;
      if (obs.gestational_weeks === null || obs.gestational_weeks < 28) return null;
      if (!hasSymptomMatching(obs.symptoms, ['reduced fetal movement', 'no fetal movement', 'absent fetal movement'])) {
        return null;
      }
      return {
        ruleId: 'PR-003-reduced-fetal-movement',
        redFlag: true,
        message: 'Reduced or absent fetal movement reported in third trimester',
      };
    },
  },
];
