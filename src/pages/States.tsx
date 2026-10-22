import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadStates, loadStatesHeader, useAsync } from '@/lib/heavy';
import { OVERLAY_LABEL, OVERLAYS, PENDING_TAG } from '@/lib/data';
import type { OverlayKey } from '@/types';
import ReaderFigure from '@/components/reader/ReaderFigure';

/** The sentence of the states.yaml header that says what a word means (e.g. none-found), quoted from the pack. */
export function headerSentence(header: string, word: string): string | null {
  const flat = header.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return flat.split(/(?<=\.)\s+/).find((s) => s.includes(`\`${word}\``) && /means/.test(s))?.replace(/`/g, '') ?? null;
}

/** The status vocabulary per overlay, as the header lists it (`overlay: a | b | c;`). */
export function vocabulary(header: string): Record<string, string[]> {
  const flat = header.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  const out: Record<string, string[]> = {};
  for (const o of OVERLAYS) {
    const m = new RegExp(`${o}: ([a-z0-9| -]+?)[;.]`).exec(flat);
    if (m) out[o] = m[1].split('|').map((x) => x.trim()).filter(Boolean);
  }
  return out;
}

/**
 * `/states` (KICKOFF §4b): the 51-row overlay table — one column per overlay, each cell the status word, with the
 * compilation tag where `primary_pending` — filterable by overlay and status, under the file header's own vocabulary.
 */
export default function States() {
  const states = useAsync(loadStates);
  const header = useAsync(loadStatesHeader);
  const [sp, setSp] = useSearchParams();
  const overlay = (sp.get('overlay') ?? '') as OverlayKey | '';
  const status = sp.get('status') ?? '';
  const set = (k: string, v: string) => { const p = new URLSearchParams(sp); if (v) p.set(k, v); else p.delete(k); if (k === 'overlay') p.delete('status'); setSp(p, { replace: true }); };
  const vocab = useMemo(() => (header ? vocabulary(header) : {}), [header]);
  const statuses = overlay ? vocab[overlay] ?? [] : [...new Set(Object.values(vocab).flat())];
  const shown = (states ?? []).filter((s) => !status || (overlay ? s[overlay].status === status : OVERLAYS.some((o) => s[o].status === status)));
  const cols = overlay ? [overlay] : OVERLAYS;
  const noneFound = header ? headerSentence(header, 'none-found') : null;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">The state overlay</h1>
      <p className="bx-prose mt-2 max-w-3xl">Nine employment-law overlays for each state and the District of Columbia. Each cell is the overlay’s status word; an amber tag marks an overlay that rests on a compilation rather than the statute itself ({PENDING_TAG}).</p>
      <details className="mt-3 bx-card p-3 text-sm max-w-4xl" open>
        <summary className="cursor-pointer font-semibold">What the status words mean (the states.yaml header, as written)</summary>
        {header ? <pre className="mt-2 whitespace-pre-wrap font-body text-[13px] leading-6" data-testid="states-header">{header}</pre> : <p className="bx-muted" role="status">Loading…</p>}
      </details>
      {noneFound && <p className="mt-2 text-sm max-w-4xl" data-testid="none-found-meaning"><span className="font-semibold">none-found:</span> {noneFound}</p>}
      <ReaderFigure id="state-overlay-counts" />
      <div className="bx-card p-3 mt-5 grid gap-2 sm:grid-cols-2 text-sm max-w-2xl" role="search" aria-label="Filter the overlay table">
        <label className="block"><span className="block text-xs bx-muted mb-1">Overlay</span><select className="bx-input" value={overlay} onChange={(e) => set('overlay', e.target.value)} data-testid="filter-overlay"><option value="">All nine</option>{OVERLAYS.map((o) => <option key={o} value={o}>{OVERLAY_LABEL[o]}</option>)}</select></label>
        <label className="block"><span className="block text-xs bx-muted mb-1">Status</span><select className="bx-input" value={status} onChange={(e) => set('status', e.target.value)} data-testid="filter-status"><option value="">Any status</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
      </div>
      <p className="mt-3 text-sm bx-muted" role="status">{states ? `${shown.length} of ${states.length} states` : 'Loading…'}</p>
      <div className="overflow-x-auto mt-2" data-testid="states-table">
        <table className="bx-table w-full text-[13px]">
          <caption className="sr-only">States by overlay status</caption>
          <thead><tr><th scope="col" className="sticky left-0 bg-paper dark:bg-night">State</th>{cols.map((o) => <th key={o} scope="col">{OVERLAY_LABEL[o]}</th>)}</tr></thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.id} className="align-top" data-testid={`state-row-${s.id}`}>
                <th scope="row" className="sticky left-0 bg-paper dark:bg-night text-left font-semibold"><Link className="underline" to={`/states/${s.id}`}>{s.state}</Link></th>
                {cols.map((o) => (
                  <td key={o} className={status && s[o].status === status ? 'font-semibold' : ''}>
                    <span className="bx-status">{s[o].status}</span>
                    {s[o].primary_pending && <span className="block mt-0.5"><span className="bx-todo !text-[10px]" title={PENDING_TAG}>compilation</span></span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs bx-muted">“compilation” in a cell is short for {PENDING_TAG}.</p>
    </div>
  );
}
