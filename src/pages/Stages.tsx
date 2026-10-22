import { Link } from 'react-router-dom';
import { loadStages, useAsync } from '@/lib/heavy';
import { stageColour } from '@/lib/data';
import Prose from '@/components/records/Prose';
import ReaderFigure from '@/components/reader/ReaderFigure';

/** `/stages` — the nine stages in order, each with what decides it and its counts. */
export default function Stages() {
  const stages = useAsync(loadStages);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">The nine stages</h1>
      <p className="bx-prose mt-2">From planning the opening to handing the work over when the person leaves. Each stage carries the failure patterns seen there, the metrics that measure it, its constraints and the gates that bind it.</p>
      <ReaderFigure id="stage-map" />
      {!stages && <p className="bx-muted" role="status">Loading…</p>}
      <ol className="mt-6 grid gap-3">
        {(stages ?? []).map((s) => (
          <li key={s.id} className="bx-card p-4" data-testid={`stage-${s.id}`}>
            <h2 className="text-xl flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(s.id) }} /><span className="text-sm bx-muted font-body">{s.order}.</span> <Link to={`/stages/${s.id}`} className="hover:underline">{s.name}</Link></h2>
            <p className="text-xs bx-muted mt-1">{s.constraints.length} constraints · {s.gates.length} gates · {s.failure_patterns.length} failure patterns · {s.metrics.length} metrics · as of {s.as_of}</p>
            <div className="text-sm mt-2"><span className="font-semibold">Decided by: </span><Prose md={s.decided_by} className="inline [&>p]:inline" /></div>
          </li>
        ))}
      </ol>
    </div>
  );
}
