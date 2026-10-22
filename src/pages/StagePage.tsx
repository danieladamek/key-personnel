import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { loadConstraints, loadPatterns, loadStages, useAsync } from '@/lib/heavy';
import { scrollToId, stageColour } from '@/lib/data';
import Prose from '@/components/records/Prose';
import { AsOf, BlockLabel, GradeChip, LegacyLine, RecordHeader, RecordLinks, Sources, SynProse, synId } from '@/components/records/Bits';
import { IndicatorTable } from '@/components/records/RecordParts';
import NoteButton from '@/components/notepad/NoteButton';
import NotFound from './NotFound';

/**
 * `/stages/:id` (KICKOFF §4b): what, decided by, the failure patterns seen there (each pattern record in full, with
 * the constraints it points at and why), the metrics with their cited definitions and the indicator values beneath
 * each, the constraints, the gates, sources, as_of.
 */
export default function StagePage() {
  const { id = '' } = useParams();
  const loc = useLocation();
  const stages = useAsync(loadStages);
  const patterns = useAsync(loadPatterns);
  const constraints = useAsync(loadConstraints);
  useEffect(() => { if (loc.hash && patterns) scrollToId(loc.hash.slice(1)); }, [loc.hash, patterns]);
  if (!stages) return <p className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</p>;
  const s = stages.find((x) => x.id === id);
  if (!s) return <NotFound />;
  const i = stages.indexOf(s);
  const prev = stages[i - 1]; const next = stages[i + 1];
  return (
    <article className="mx-auto max-w-3xl px-4 py-8" data-testid="stage-page">
      <p className="text-xs bx-muted uppercase tracking-[0.12em] font-semibold flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(s.id) }} />Stage {s.order} of {stages.length}</p>
      <RecordHeader title={s.name} anchor={{ type: 'stages', id: s.id }}><AsOf date={s.as_of} />{s.status && <span className="bx-status">{s.status}</span>}</RecordHeader>

      <BlockLabel>What it is</BlockLabel>
      <SynProse md={s.what} synId={synId('stages', s.id, 'what')} />
      <BlockLabel>Decided by</BlockLabel>
      <SynProse md={s.decided_by} synId={synId('stages', s.id, 'decided_by')} />
      {s.literatures.length > 0 && <p className="mt-3 text-xs bx-muted">Literatures: {s.literatures.join(' · ')}</p>}

      <BlockLabel>Failure patterns seen here ({s.failure_patterns.length})</BlockLabel>
      <div className="grid gap-3">
        {s.failure_patterns.map((pid) => {
          const p = patterns?.find((x) => x.id === pid);
          if (!patterns) return <p key={pid} className="bx-muted text-sm" role="status">Loading…</p>;
          if (!p) return <span key={pid} className="bx-todo">{pid} (not a pattern record)</span>;
          return (
            <section key={pid} id={p.id} className="bx-card p-3 scroll-mt-28" data-testid={`pattern-${p.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg">{p.name}</h3>
                <NoteButton anchor={{ type: 'patterns', id: p.id }} label={p.name} />
              </div>
              <SynProse md={p.what} synId={synId('patterns', p.id, 'what')} />
              <p className="text-xs font-semibold bx-muted mt-2">Points at, in evidence order</p>
              <ol className="list-decimal pl-5 grid gap-1 text-sm mt-1">
                {p.points_at.map((cid) => {
                  const reason = p.reasons.find((r) => r.constraint === cid);
                  const ri = p.reasons.findIndex((r) => r.constraint === cid);
                  const c = constraints?.find((x) => x.id === cid);
                  return (
                    <li key={cid}>
                      <Link to={`/constraints/${cid}`} className="underline">{c?.name ?? cid}</Link>
                      {reason && <div className="text-[13px] bx-muted"><SynProse md={reason.why} synId={synId('patterns', p.id, `reasons/${ri}/why`)} /></div>}
                    </li>
                  );
                })}
              </ol>
              <LegacyLine ids={p.legacy} />
              <Sources ns={p.sources} />
            </section>
          );
        })}
      </div>

      <BlockLabel>Metrics</BlockLabel>
      <div className="grid gap-4">
        {s.metrics.map((m, mi) => (
          <section key={m.id} className="border-l-2 border-[color:var(--bx-line)] pl-3" data-testid={`metric-${m.id}`}>
            <h3 className="text-base font-display font-semibold">{m.id.replace(/-/g, ' ')}</h3>
            <SynProse md={m.definition} synId={synId('stages', s.id, `metrics/${mi}/definition`)} className="text-sm" />
            {m.benchmark.length > 0 ? <div className="mt-1.5"><IndicatorTable ids={m.benchmark} /></div> : <p className="text-xs bx-muted mt-1">No benchmark indicator recorded for this metric.</p>}
          </section>
        ))}
      </div>

      <BlockLabel>Constraints ({s.constraints.length})</BlockLabel>
      <ul className="grid gap-2">
        {s.constraints.map((cid) => {
          const c = constraints?.find((x) => x.id === cid);
          return (
            <li key={cid} className="bx-card p-3">
              <Link to={`/constraints/${cid}`} className="font-semibold underline">{c?.name ?? cid}</Link> {c && <GradeChip grade={c.evidence_grade} />}
              {c && <div className="text-[13px] mt-1 bx-muted line-clamp-3"><Prose md={c.what} /></div>}
            </li>
          );
        })}
      </ul>

      <BlockLabel>Gates ({s.gates.length})</BlockLabel>
      <RecordLinks type="gates" ids={s.gates} />
      <LegacyLine ids={s.legacy} />
      <Sources ns={s.sources} />
      <p className="mt-6"><AsOf date={s.as_of} /></p>
      <nav className="mt-8 flex justify-between gap-2 text-sm" aria-label="Stages">
        {prev ? <Link className="underline" to={`/stages/${prev.id}`}>← {prev.name}</Link> : <span />}
        {next ? <Link className="underline" to={`/stages/${next.id}`}>{next.name} →</Link> : <span />}
      </nav>
    </article>
  );
}
