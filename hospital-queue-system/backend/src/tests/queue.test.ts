import { describe, expect, it } from 'vitest';
import { estimateWaitTimeMinutes } from '../services/queue/waitTime.js';

describe('wait time estimation', () => {
  it('calculates patientsAhead * avgConsultTime', () => {
    expect(estimateWaitTimeMinutes(4, 8)).toBe(32);
  });

  it('never goes negative', () => {
    expect(estimateWaitTimeMinutes(-5, 8)).toBe(0);
    expect(estimateWaitTimeMinutes(5, -8)).toBe(0);
  });
});
