import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatRange, hcmcParts, tenureLabel } from './time.ts';

describe('tenureLabel', () => {
  it('formats an ended job under two years', () => {
    assert.equal(tenureLabel('2021-01', '2022-08'), '1 yr 7 mo');
  });

  it('formats a multi-year job', () => {
    assert.equal(tenureLabel('2022-09', '2026-02'), '3 yrs 5 mo');
  });

  it('counts a current job up to the current HCMC month', () => {
    assert.equal(tenureLabel('2026-03', undefined, new Date('2026-10-23T05:00:00Z')), '7 mo');
  });

  it('rolls forward after deploy', () => {
    assert.equal(tenureLabel('2026-03', undefined, new Date('2026-12-10T05:00:00Z')), '9 mo');
  });

  it('omits the month part on whole years', () => {
    assert.equal(tenureLabel('2024-01', '2026-01'), '2 yrs');
  });

  it('handles a job that started this month', () => {
    assert.equal(tenureLabel('2026-10', undefined, new Date('2026-10-23T05:00:00Z')), '< 1 mo');
  });
});

describe('hcmcParts', () => {
  it('reports HCMC wall-clock time for any instant', () => {
    const p = hcmcParts(new Date('2026-10-23T02:41:00Z'));
    assert.deepEqual([p.year, p.month, p.day, p.hour, p.minute], [2026, 10, 23, '09', '41']);
  });

  it('crosses midnight relative to UTC', () => {
    const p = hcmcParts(new Date('2026-12-31T17:05:00Z'));
    assert.deepEqual([p.year, p.month, p.day, p.hour, p.minute], [2027, 1, 1, '00', '05']);
  });
});

describe('formatRange', () => {
  it('formats ended and current ranges', () => {
    assert.equal(formatRange('2022-09', '2026-02'), 'Sep 2022 — Feb 2026');
    assert.equal(formatRange('2026-03'), 'Mar 2026 — Present');
  });
});
