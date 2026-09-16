import type { RuleDefinition } from '../types';
import { redFlagRules } from './redFlag';
import { rdtRules } from './rdt';
import { vitalRules } from './vitals';
import { pregnancyRules } from './pregnancy';

export const allRules: RuleDefinition[] = [
  ...redFlagRules,
  ...rdtRules,
  ...vitalRules,
  ...pregnancyRules,
];

export { redFlagRules, rdtRules, vitalRules, pregnancyRules };
