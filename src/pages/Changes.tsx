import { useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { recordedDate, scrollToId, stageLabel, STAGES, STATUS_WORD } from '@/lib/data';
import { loadChanges, useAsync } from '@/lib/heavy';
import Prose from '@/components/records/Prose';
import { AnyRecordLinks, ChangeChip, RecordHeader, Sources, StageChip } from '@/components/records/Bits';
import type { Change } from '@/types';

/** Newest first by the date as recorded (a day, a month or a year); undated last. */
export function sortChanges(xs: Change[]): Change[] {
  const key = (d: string) => { const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d); return m ? Number(m[1]) * 10000 + Number(m[2] ?? 0) * 100 + Number(m[3] ?? 0) : -1; };
  return [...xs].sort((a, b) => key(b.date) - key(a.date) || a.id.localeCompare(b.id));
}

function Entry({ c, all }: { c: Change; all: Change[] }) {
  const sup = c.superseded_by !== null && c.superseded_by !== undefined;
  const successor = sup ? all.find((x) => x.id === c.superseded_by) : undefined;
  return (
    <li id={c.id} className="bx-card p-3 scroll-mt-28" data-testid={`change-${c.id}`} data-superseded={sup ? 'true' : 'false'}>
      <RecordHeader title={c.title} anchor={{ type: 'changes', id: c.id }} level={3}>
        <ChangeChip status={c.status} date={c.date} />
        {sup && <span className="bx-chip border border-[color:var(--bx-line)] font-semibold" data-testid="superseded-chip">superseded — not current</span>}
        {c.stages.map((s) => <StageChip key={s} stage={s} />)}
      </RecordHeader>
      <div className={`mt-1 ${sup ? 'line-through decoration-1 opacity-75' : ''}`} data-testid="change-what"><Prose md={c.what} /></div>
      {sup && <p className="mt-1 text-sm" data-testid="successor">Superseded by {successor ? <Link className="underline font-semibold" to={`/changes#${successor.id}`}>{recordedDate(successor.date)} · {successor.title}</Link> : <span className="bx-todo">{c.superseded_by}</span>}.</p>}
      {c.records.length > 0 && <p className="mt-2 text-sm"><span className="bx-muted mr-1">Records:</span><AnyRecordLinks ids={c.records} prefer={['gates', 'enablers', 'constraints', 'levers']} /></p>}
      <Sources ns={c.sources} />
    </li>
  );
}

/**
 * `/changes` (KICKOFF §4b): the dated ledger from changes.yaml, newest first, filterable by status and stage; each
 * entry links to the records it names and to its sources; a `Superseded:` entry is struck through with its successor
 * linked and is never shown as current.
 */
export default function Changes() {
  const changes = useAsync(loadChanges);
  const loc = useLocation();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const stage = params.get('stage') ?? '';
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p, { replace: true }); };
  const sorted = useMemo(() => sortChanges(changes ?? []), [changes]);
  const statuses = [...new Set(sorted.map((c) => c.status))];
  const shown = sorted.filter((c) => (!status || c.status === status) && (!stage || c.stages.includes(stage as never)));
  useEffect(() => { if (changes && loc.hash) scrollToId(loc.hash.slice(1)); }, [changes, loc.hash]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">What changed</h1>
      <p className="bx-prose mt-2">The dated ledger of 2025 and 2026, newest first: each entry’s status, the date as recorded, the stages it touches, the records it names and its sources. An entry superseded by a later one is struck through and points to its successor.</p>
      <div className="bx-card p-3 mt-5 grid gap-2 sm:grid-cols-2 text-sm" role="search" aria-label="Filter changes">
        <label className="block"><span className="block text-xs bx-muted mb-1">Status</span><select className="bx-input" value={status} onChange={(e) => set('status', e.target.value)} data-testid="changes-status"><option value="">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{STATUS_WORD[s] ?? s}</option>)}</select></label>
        <label className="block"><span className="block text-xs bx-muted mb-1">Stage</span><select className="bx-input" value={stage} onChange={(e) => set('stage', e.target.value)} data-testid="changes-stage"><option value="">Every stage</option>{STAGES.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}</select></label>
      </div>
      <p className="mt-3 text-sm bx-muted" role="status">{changes ? `${shown.length} of ${changes.length} entries` : 'Loading…'}</p>
      <ol className="mt-4 grid gap-3">{shown.map((c) => <Entry key={c.id} c={c} all={sorted} />)}</ol>
    </div>
  );
}
