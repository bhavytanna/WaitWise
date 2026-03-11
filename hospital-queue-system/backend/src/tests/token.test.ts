import { describe, expect, it, vi } from 'vitest';

vi.mock('../models/Counter.js', () => {
  return {
    CounterModel: {
      findOneAndUpdate: vi.fn(async () => ({ seq: 101 })),
    },
  };
});

import { nextTokenForDepartment } from '../services/tokens/tokenService.js';

describe('token generation', () => {
  it('prefixes with department code and uses incremented number', async () => {
    const token = await nextTokenForDepartment('C');
    expect(token).toBe('C101');
  });
});
