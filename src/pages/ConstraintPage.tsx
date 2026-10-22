import { Link, useParams } from 'react-router-dom';
import { loadConstraints, loadLevers, useAsync } from '@/lib/heavy';
import { recordMeta } from '@/lib/records';
import { AsOf, BlockLabel, Conflicts, GradeChip, LegacyLine, ListOf, RecordHeader, RecordLinks, Sources, StageChip, SynProse, synId } from '@/components/records/Bits';
import { DependencyLists, EvidenceBlock, IndicatorTable, useMapData } from '@/components/records/RecordParts';
import NotFound from './NotFound';

/**
 * `/constraints/:id` (KICKOFF §4b), in a fixed order: what → mechanism → how to tell → indicators → levers (name,
 * grade, effect with population, what it does not do) → gates → dependencies → decided by, evidence grade,
 * controversy → where sources differ → the legacy line → sources → as_of. Nothing is reordered or reworded.
 */
export default function ConstraintPage() {
  const { id = '' } = useParams();
  const all = useAsync(loadConstraints);
  const levers = useAsync(loadLevers);
  const map = useMapData();
  if (!all) return <p className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</p>;
  const c = all.find((x) => x.id === id);
  if (!c) return <NotFound />;
  const S = (field: string) => ({ file: 'constraints', id: c.id, field });
  return (
    <article className="mx-auto max-w-3xl px-4 py-8" data-testid="constraint-page">
      <p className="text-xs bx-muted uppercase tracking-[0.12em] font-semibold">Constraint</p>
      <RecordHeader title={c.name} anchor={{ type: 'constraints', id: c.id }}>
        <StageChip stage={c.stage} /><GradeChip grade={c.evidence_grade} /><AsOf date={c.as_of} />
        <Link className="underline font-semibold" to={`/map?node=${c.id}`} data-testid="see-on-map">See this on the map →</Link>
      </RecordHeader>

      <BlockLabel>What it is</BlockLabel>
      <SynProse md={c.what} synId={synId('constraints', c.id, 'what')} />
      <BlockLabel>Mechanism</BlockLabel>
      <SynProse md={c.mechanism} synId={synId('constraints', c.id, 'mechanism')} />
      <BlockLabel>How to tell</BlockLabel>
      <ListOf items={c.how_to_tell} syn={S('how_to_tell')} />

      <BlockLabel>Indicators</BlockLabel>
      <IndicatorTable ids={c.indicators} />

      <BlockLabel>Levers ({c.levers.length})</BlockLabel>
      <p className="text-xs bx-muted mb-2">Listed in the record’s own order, each with its evidence grade and what it has not been shown to do; none is recommended.</p>
      <ul className="grid gap-3" data-testid="lever-cards">
        {c.levers.map((lid) => {
          const l = levers?.find((x) => x.id === lid);
          if (!levers) return <li key={lid} className="bx-muted text-sm" role="status">Loading…</li>;
          if (!l) return <li key={lid}><span className="bx-todo">{lid} (not a lever record)</span></li>;
          return (
            <li key={lid} className="grid gap-1.5" data-testid={`lever-card-${lid}`}>
              <Link to={`/levers/${l.id}`} className="font-semibold underline">{l.name}</Link>
              <EvidenceBlock lever={l} compact />
            </li>
          );
        })}
      </ul>

      <BlockLabel>Gates ({c.gates.length})</BlockLabel>
      <RecordLinks type="gates" ids={c.gates} testId="gate-chips" />

      <BlockLabel>Dependencies</BlockLabel>
      {map ? <DependencyLists id={c.id} data={map} row={(e, _o, label) => <Link to={`/map?edge=${e.id}`} className="block rounded px-1 py-0.5 hover:bg-paper-2 dark:hover:bg-night-2" data-testid="dependency-row">{label}</Link>} /> : <p className="text-sm bx-muted" role="status">Loading…</p>}

      <BlockLabel>Decided by</BlockLabel>
      <p className="text-sm">{c.decided_by}</p>
      <BlockLabel>Evidence grade</BlockLabel>
      <p><GradeChip grade={c.evidence_grade} /> <span className="text-xs bx-muted">the strongest grade among the record’s sources</span></p>
      {c.controversy && (<><BlockLabel>Controversy</BlockLabel><p className="text-sm">This constraint sits inside a live dispute: <Link className="underline" to={`/controversies#${c.controversy}`}>{recordMeta('controversies', c.controversy)?.title ?? c.controversy}</Link></p></>)}
      {c.patterns.length > 0 && (<><BlockLabel>Failure patterns that point here</BlockLabel><RecordLinks type="patterns" ids={c.patterns} /></>)}
      <Conflicts items={c.conflicts} />
      {c.changes_affecting.length > 0 && (<><BlockLabel>In the dated ledger</BlockLabel><RecordLinks type="changes" ids={c.changes_affecting} /></>)}
      <LegacyLine ids={c.legacy} />
      <Sources ns={c.sources} />
      <p className="mt-6"><AsOf date={c.as_of} /></p>
    </article>
  );
}
