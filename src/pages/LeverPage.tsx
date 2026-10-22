import { Link, useParams } from 'react-router-dom';
import { loadLevers, useAsync } from '@/lib/heavy';
import { recordMeta } from '@/lib/records';
import { AsOf, BlockLabel, Field, LegacyLine, RecordHeader, RecordLinks, Sources, StageChip } from '@/components/records/Bits';
import { EvidenceBlock, useMapData } from '@/components/records/RecordParts';
import { SynProse, synId } from '@/components/records/Bits';
import NotFound from './NotFound';

/**
 * `/levers/:id` (KICKOFF §4b): what → the evidence block (grade, effect, population, k_n, exactly as carried) →
 * what it does not do (always, directly beneath) → costs → when it binds elsewhere (with the map edge where one
 * exists) → gates → enablers → how to → the constraints that list it → legacy line → sources → as_of.
 */
export default function LeverPage() {
  const { id = '' } = useParams();
  const all = useAsync(loadLevers);
  const map = useMapData();
  if (!all) return <p className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</p>;
  const l = all.find((x) => x.id === id);
  if (!l) return <NotFound />;
  const edgeTo = (target: string) => map?.edges.find((e) => e.from === l.id && e.to === target) ?? map?.edges.find((e) => e.to === target && e.from === l.id);
  return (
    <article className="mx-auto max-w-3xl px-4 py-8" data-testid="lever-page">
      <p className="text-xs bx-muted uppercase tracking-[0.12em] font-semibold">Lever</p>
      <RecordHeader title={l.name} anchor={{ type: 'levers', id: l.id }}>
        {l.stages.map((s) => <StageChip key={s} stage={s} />)}<AsOf date={l.as_of} />
        <Link className="underline font-semibold" to={`/map?node=${l.id}`}>See this on the map →</Link>
      </RecordHeader>

      <BlockLabel>What it is</BlockLabel>
      <SynProse md={l.what} synId={synId('levers', l.id, 'what')} />

      <BlockLabel>Evidence</BlockLabel>
      <EvidenceBlock lever={l} />

      <Field label="Costs" value={l.costs} syn={{ file: 'levers', id: l.id, field: 'costs' }} />

      <BlockLabel>When it binds elsewhere ({l.when_it_binds_elsewhere.length})</BlockLabel>
      {l.when_it_binds_elsewhere.length ? (
        <ul className="grid gap-1.5" data-testid="binds-elsewhere">
          {l.when_it_binds_elsewhere.map((t) => {
            const m = recordMeta('constraints', t) ?? recordMeta('levers', t) ?? recordMeta('gates', t);
            const e = edgeTo(t);
            return (
              <li key={t} className="text-sm flex flex-wrap items-baseline gap-2">
                {m ? <Link to={m.to} className="bx-chip border border-[color:var(--bx-line)] hover:underline">{m.title}</Link> : <span className="bx-todo">{t}</span>}
                {e ? <Link to={`/map?edge=${e.id}`} className="text-xs underline">on the map: {e.relation} — {e.link}</Link> : <span className="text-xs bx-muted">no edge in links.yaml</span>}
              </li>
            );
          })}
        </ul>
      ) : <p className="text-sm bx-muted">The record names no record this lever can worsen.</p>}

      <BlockLabel>Gates ({l.gates.length})</BlockLabel>
      {l.gates.length ? <RecordLinks type="gates" ids={l.gates} /> : <p className="text-sm bx-muted">None named.</p>}
      <BlockLabel>Enablers ({l.enablers.length})</BlockLabel>
      {l.enablers.length ? <RecordLinks type="enablers" ids={l.enablers} /> : <p className="text-sm bx-muted">None named.</p>}

      <Field label="How to (steps from a cited source)" value={l.how_to} ordered syn={{ file: 'levers', id: l.id, field: 'how_to' }} />

      <BlockLabel>Constraints that list it ({l.constraints.length})</BlockLabel>
      <RecordLinks type="constraints" ids={l.constraints} />
      {l.controversy && (<><BlockLabel>Controversy</BlockLabel><Link className="underline text-sm" to={`/controversies#${l.controversy}`}>{recordMeta('controversies', l.controversy)?.title ?? l.controversy}</Link></>)}
      {l.changes_affecting.length > 0 && (<><BlockLabel>In the dated ledger</BlockLabel><RecordLinks type="changes" ids={l.changes_affecting} /></>)}
      <LegacyLine ids={l.legacy} />
      <Sources ns={l.sources} />
      <p className="mt-6"><AsOf date={l.as_of} /></p>
    </article>
  );
}
