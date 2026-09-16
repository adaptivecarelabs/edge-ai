export * from './types';
export { RuleEngine } from './engine';
export { allRules, redFlagRules, rdtRules, vitalRules, pregnancyRules } from './rules';

import { RuleEngine } from './engine';
import { allRules } from './rules';

/** Rule engine version, bumped whenever the rule set changes shape or content
 * (matches triage.schema.json's rule_engine_result.rule_engine_version). */
export const RULE_ENGINE_VERSION = '0.1.0-unreviewed';

export const defaultRuleEngine = new RuleEngine(allRules, RULE_ENGINE_VERSION);
