import { describe, expect, it } from 'vitest';
import { emptyRecords, fromFile, normaliseRecords, recordsReducer, toJson, toMarkdown } from '../../src/lib/decision-record';

const now = () => '2026-10-22T09:00:00.000Z';
const names = { constraint: (id: string) => `C ${id}`, lever: (id: string) => `L ${id}`, limits: () => 'It does not hire anyone.', answer: (_q: string, t: string) => t };

function seed() {
  let s = emptyRecords();
  s = recordsReducer(s, { type: 'create', id: 'r1', name: 'Opening A', answers: { pattern: 'pass-then-decline', conditions: ['requires-clearance'] }, field: ['c-salary-above-rate', 'c-offer-process-exposure'] }, now);
  s = recordsReducer(s, { type: 'pin', id: 'r1', constraint: 'c-salary-above-rate', as: 'primary' }, now);
  s = recordsReducer(s, { type: 'pin', id: 'r1', constraint: 'c-offer-process-exposure', as: 'secondary' }, now);
  s = recordsReducer(s, { type: 'choose', id: 'r1', lever: 'l-set-range-from-rate-and-market' }, now);
  s = recordsReducer(s, { type: 'update', id: 'r1', patch: { owner: 'Hiring lead', measure: 'offer acceptance rate' } }, now);
  return s;
}

describe('the decision-record reducer', () => {
  it('pins, re-pins, unpins and chooses without duplicates', () => {
    let s = seed();
    const r = s.records[0];
    expect([r.primary, r.secondary, r.levers]).toEqual([['c-salary-above-rate'], ['c-offer-process-exposure'], ['l-set-range-from-rate-and-market']]);
    s = recordsReducer(s, { type: 'pin', id: 'r1', constraint: 'c-offer-process-exposure', as: 'primary' }, now);
    expect(s.records[0].primary).toEqual(['c-salary-above-rate', 'c-offer-process-exposure']);
    expect(s.records[0].secondary).toEqual([]);
    s = recordsReducer(s, { type: 'choose', id: 'r1', lever: 'l-set-range-from-rate-and-market' }, now);
    expect(s.records[0].levers).toHaveLength(1);
    s = recordsReducer(s, { type: 'unpin', id: 'r1', constraint: 'c-salary-above-rate' }, now);
    expect(s.records[0].primary).toEqual(['c-offer-process-exposure']);
  });
  it('holds several records and removes one', () => {
    let s = seed();
    s = recordsReducer(s, { type: 'create', id: 'r2', name: 'Opening B' }, now);
    expect(s.records.map((r) => r.id)).toEqual(['r1', 'r2']);
    expect(recordsReducer(s, { type: 'remove', id: 'r1' }, now).records.map((r) => r.id)).toEqual(['r2']);
  });
  it('exports JSON and Markdown that import back to the same record', () => {
    const r = seed().records[0];
    expect(fromFile(toJson(r))).toEqual([r]);
    const md = toMarkdown(r, names);
    expect(md).toContain('# Decision record — Opening A');
    expect(md).toContain('What it does not do: It does not hire anyone.');
    expect(fromFile(md)).toEqual([r]);
    const merged = recordsReducer(emptyRecords(), { type: 'import', records: fromFile(md) }, now);
    expect(merged.records).toEqual([r]);
  });
  it('normalises junk safely', () => {
    expect(normaliseRecords(null).records).toEqual([]);
    expect(normaliseRecords({ records: [{ id: 'x' }, 7] }).records[0]).toMatchObject({ id: 'x', name: 'Untitled opening', primary: [] });
    expect(fromFile('not a record')).toEqual([]);
  });
});
