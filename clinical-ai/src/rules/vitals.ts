import type { RuleDefinition } from '../types';

/**
 * DRAFT / UNREVIEWED. Thresholds are commonly-cited adult danger-sign ranges used
 * to scaffold the engine and its test suite - they do NOT implement WHO IMCI's
 * age-banded pediatric thresholds (respiratory rate and pulse danger ranges vary
 * significantly by age band, which this scaffold deliberately does not attempt).
 * Age-banding and real citations are follow-up work once a clinical reviewer is
 * assigned (docs/project_plan.md governance; docs/progress.md).
 */

const UNVERIFIED = { source: 'GENERIC_VITALS', id: 'UNVERIFIED', version: 'n/a' } as const;

export const vitalRules: RuleDefinition[] = [
  {
    id: 'VT-001-high-fever',
    category: 'vital',
    description: 'Temperature at or above 39.5C.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.temperature_c === null || obs.temperature_c < 39.5) return null;
      return { ruleId: 'VT-001-high-fever', redFlag: true, message: `High fever: ${obs.temperature_c}C` };
    },
  },
  {
    id: 'VT-002-hypothermia',
    category: 'vital',
    description: 'Temperature below 35C.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.temperature_c === null || obs.temperature_c >= 35) return null;
      return { ruleId: 'VT-002-hypothermia', redFlag: true, message: `Hypothermia: ${obs.temperature_c}C` };
    },
  },
  {
    id: 'VT-003-tachypnea',
    category: 'vital',
    description: 'Respiratory rate at or above 30 breaths/min (adult threshold).',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.respiratory_rate === null || obs.respiratory_rate < 30) return null;
      return {
        ruleId: 'VT-003-tachypnea',
        redFlag: true,
        message: `Elevated respiratory rate: ${obs.respiratory_rate}/min`,
      };
    },
  },
  {
    id: 'VT-004-pulse-abnormal',
    category: 'vital',
    description: 'Pulse at or above 120 or at or below 40 bpm.',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      if (obs.pulse === null || (obs.pulse < 120 && obs.pulse > 40)) return null;
      return { ruleId: 'VT-004-pulse-abnormal', redFlag: true, message: `Abnormal pulse: ${obs.pulse}bpm` };
    },
  },
  {
    id: 'VT-005-hypotension',
    category: 'vital',
    description: 'Systolic BP below 90 or diastolic BP below 60 (possible shock).',
    guidelineRef: { ...UNVERIFIED },
    reviewStatus: 'unreviewed',
    evaluate: (obs) => {
      const bp = obs.blood_pressure;
      if (!bp) return null;
      const lowSystolic = bp.systolic !== null && bp.systolic < 90;
      const lowDiastolic = bp.diastolic !== null && bp.diastolic < 60;
      if (!lowSystolic && !lowDiastolic) return null;
      return {
        ruleId: 'VT-005-hypotension',
        redFlag: true,
        message: `Hypotension: ${bp.systolic ?? '?'}/${bp.diastolic ?? '?'} mmHg`,
      };
    },
  },
];
