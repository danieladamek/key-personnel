import { describe, expect, it } from 'vitest';
import { emptyNotepad, fromMarkdown, groupBySection, normalise, reducer, resolveAnchor, toMarkdown, type AnchorIndex, type NotepadState } from '../../src/lib/notepad';

const now = () => '2026-10-01T10:00:00.000Z';
const idx: AnchorIndex = {
  sections: [{ id: 'abstract', title: 'Abstract', number: null }, { id: '4-claim-1', title: '4. Being small', number: '4' }, { id: '13-repair', title: '13. Gates', number: '13' }],
  terms: new Map([['prior', { term: 'Prior', sections: ['4-claim-1'] }]]),
  concepts: new Map([['bayesian-inference', { title: 'Priors', sections: [] }]]),
  figures: new Map([['fig1', { label: 'Figure 1', title: 'The thesis as a path', sections: ['abstract'] }]]),
  refs: new Map([[12, { citation: 'Schooler 1990', key: 'Schooler1990', sections: ['4-claim-1'] }], [59, { citation: 'Barsalou 1987', key: 'Barsalou1987', sections: [] }]]),
  records: new Map([['constraints/c-salary-above-rate', { title: 'The salary exceeds the rate', to: '/constraints/c-salary-above-rate' }], ['gates/ugesp', { title: 'Uniform Guidelines', to: '/gates/ugesp' }], ['levers/l-structured-interview', { title: 'Structured interview', to: '/levers/l-structured-interview' }], ['links/k-001', { title: 'k-001', to: '/map?edge=k-001' }], ['states/us-wa', { title: 'Washington', to: '/states/us-wa' }], ['changes/ch-1', { title: '2025-03 · a change', to: '/changes#ch-1' }]]),
};

function seed(): NotepadState {
  let s = emptyNotepad();
  s = reducer(s, { type: 'add', note: { id: 'a', anchor: { type: 'section', id: '4-claim-1' }, quote: 'overshadowed, not erased', body: 'Check Experiment 6.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'b', anchor: { type: 'section', id: 'abstract' }, body: 'Tighten.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'c', anchor: { type: 'ref', id: '59' }, body: 'Borrow it.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'd', anchor: { type: 'concept', id: 'bayesian-inference' }, body: 'Study.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'e', anchor: { type: 'constraints', id: 'c-salary-above-rate' }, body: 'Design it.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'f', anchor: { type: 'free', id: '' }, body: 'Loose thought.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'g', anchor: { type: 'levers', id: 'l-structured-interview' }, body: 'Ask the customer.' } }, now);
  s = reducer(s, { type: 'add', note: { id: 'h', anchor: { type: 'changes', id: 'ch-1' }, body: 'Watch this.' } }, now);
  return s;
}

describe('notepad reducer', () => {
  it('adds, updates and removes notes', () => {
    let s = seed();
    expect(s.notes).toHaveLength(8);
    s = reducer(s, { type: 'update', id: 'a', body: 'Check Experiment 6 again.' }, now);
    expect(s.notes.find((n) => n.id === 'a')!.body).toBe('Check Experiment 6 again.');
    s = reducer(s, { type: 'remove', id: 'b' }, now);
    expect(s.notes.map((n) => n.id)).toEqual(['a', 'c', 'd', 'e', 'f', 'g', 'h']);
  });
  it('merges imported notes by id, keeping the newer', () => {
    const s = seed();
    const merged = reducer(s, { type: 'merge', notes: [{ ...s.notes[0], body: 'newer', updated: '2027-01-01' }, { ...s.notes[1], body: 'older', updated: '2020-01-01' }] }, now);
    expect(merged.notes.find((n) => n.id === 'a')!.body).toBe('newer');
    expect(merged.notes.find((n) => n.id === 'b')!.body).toBe('Tighten.');
  });
  it('normalises a v1 single-text notepad into one unanchored note, and unknown anchor types to free', () => {
    expect(normalise({ text: 'old notes' }).notes[0].anchor.type).toBe('free');
    expect(normalise({ notes: [{ id: 'x', body: 'b', anchor: { type: 'claim', id: 'C0001' } }] }).notes[0].anchor.type).toBe('free');
  });
});

describe('anchors', () => {
  it('resolves every object type this app renders to a label and a link', () => {
    expect(resolveAnchor({ type: 'ref', id: '12' }, idx)).toEqual({ ok: true, label: 'reference [12] Schooler 1990', section: '4-claim-1', to: '/references#ref-12' });
    expect(resolveAnchor({ type: 'term', id: 'prior' }, idx)).toMatchObject({ ok: true, section: '4-claim-1', to: '/glossary#prior' });
    expect(resolveAnchor({ type: 'figure', id: 'fig1' }, idx)).toMatchObject({ ok: true, section: 'abstract', to: '/figures/fig1' });
    expect(resolveAnchor({ type: 'constraints', id: 'c-salary-above-rate' }, idx)).toEqual({ ok: true, label: 'constraint “The salary exceeds the rate”', section: null, to: '/constraints/c-salary-above-rate' });
    expect(resolveAnchor({ type: 'gates', id: 'ugesp' }, idx)).toMatchObject({ ok: true, to: '/gates/ugesp' });
    expect(resolveAnchor({ type: 'concept', id: 'bayesian-inference' }, idx)).toMatchObject({ ok: true, label: '101 “Priors”', section: null, to: '/concepts/bayesian-inference' });
    expect(resolveAnchor({ type: 'levers', id: 'l-structured-interview' }, idx)).toEqual({ ok: true, label: 'lever “Structured interview”', section: null, to: '/levers/l-structured-interview' });
    expect(resolveAnchor({ type: 'links', id: 'k-001' }, idx)).toMatchObject({ ok: true, label: 'map edge “k-001”', to: '/map?edge=k-001' });
    expect(resolveAnchor({ type: 'states', id: 'us-wa' }, idx)).toMatchObject({ ok: true, label: 'state “Washington”', to: '/states/us-wa' });
    expect(resolveAnchor({ type: 'changes', id: 'ch-1' }, idx)).toMatchObject({ ok: true, to: '/changes#ch-1' });
  });
});

describe('Markdown export', () => {
  it('is organised by review section in reading order, each note carrying its anchor and quote, and round-trips', () => {
    const s = seed();
    const md = toMarkdown(s, idx, { title: 'T', slug: 'key-personnel', app: 'Key Personnel', date: '2026-10-22' });
    expect(md).toContain('from Key Personnel (key-personnel). Organised by guide section in reading order, then by record');
    const order = ['## Abstract', '## §4 Being small', '## Constraints', '## Levers', '## What changed', '## References, terms, primers and figures', '## Unanchored'].map((h) => md.indexOf(h));
    expect(order.every((x) => x >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(md).toContain('### section §4 Being small\n\n> overshadowed, not erased\n\nCheck Experiment 6.');
    const back = fromMarkdown(md);
    const key = (xs: typeof s.notes) => xs.map((n) => [n.id, n.anchor, n.body, n.quote ?? null]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    expect(key(back)).toEqual(key(s.notes));
  });
});

describe('record anchors and rebuilds', () => {
  it('an anchor that disappears is kept and reported as orphaned, never dropped', () => {
    const smaller: AnchorIndex = { ...idx, records: new Map([...idx.records].filter(([k]) => !k.startsWith('constraints/'))) };
    const g = groupBySection(seed(), smaller);
    expect(g.find((x) => x.key === '_orphan')!.notes.map((n) => n.id)).toEqual(['e']);
    expect(g.flatMap((x) => x.notes)).toHaveLength(8);
  });
});
