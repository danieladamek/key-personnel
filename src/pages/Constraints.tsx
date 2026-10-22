import { Link } from 'react-router-dom';
import { stageColour, stageLabel, STAGES } from '@/lib/data';
import { loadConstraints, useAsync } from '@/lib/heavy';
import { GradeChip } from '@/components/records/Bits';

/** `/constraints` — the sixty constraints by stage, in stage order and the pack's order within each stage. */
export default function Constraints() {
  const all = useAsync(loadConstraints);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Constraints</h1>
      <p className="bx-prose mt-2">What binds an opening, one record per evidence-backed constraint, grouped by the stage it belongs to. The <Link className="underline" to="/">pathfinder</Link> narrows them to one opening; the <Link className="underline" to="/map">map</Link> draws how they depend on one another.</p>
      {!all && <p className="bx-muted mt-4" role="status">Loading…</p>}
      {STAGES.map((s) => {
        const list = (all ?? []).filter((c) => c.stage === s);
        if (!list.length) return null;
        return (
          <section key={s} className="mt-8" aria-labelledby={`cs-${s}`}>
            <h2 id={`cs-${s}`} className="text-2xl flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(s) }} /><Link to={`/stages/${s}`} className="hover:underline">{stageLabel(s)}</Link> <span className="bx-muted text-base font-body">({list.length})</span></h2>
            <ul className="mt-2 grid gap-1.5">
              {list.map((c) => (
                <li key={c.id} className="flex flex-wrap items-baseline gap-2"><Link to={`/constraints/${c.id}`} className="underline">{c.name}</Link><GradeChip grade={c.evidence_grade} /><span className="text-xs bx-muted">{c.levers.length} levers · {c.gates.length} gates · {c.inbound.length + c.outbound.length} dependencies</span></li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
