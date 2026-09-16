import type { Observations } from '../src/types';

export function makeObservations(overrides: Partial<Observations> = {}): Observations {
  return {
    age: 30,
    sex: 'female',
    pregnant: false,
    gestational_weeks: null,
    temperature_c: 37.0,
    blood_pressure: { systolic: 120, diastolic: 80 },
    respiratory_rate: 16,
    pulse: 72,
    symptoms: [],
    rdt_results: [],
    medications: [],
    history: [],
    ...overrides,
  };
}
