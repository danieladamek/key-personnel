import { Link } from 'react-router-dom';
import { GATE_COLOUR, stageColour } from '@/lib/data';
import { loadGates, loadStages, useAsync } from '@/lib/heavy';
import { Disclosure } from '@/components/records/RecordSections';
import { GateBody } from './GatePage';

/**
 * `/gates` (KICKOFF §4b): grouped by the stages that list them, derived from the stage records, not hard-coded. A gate
 * listed by several stages opens in full under the first; later stages link to it.
 */
export default function Gates() {
  const gates = useAsync(loadGates);
  const stages = useAsync(loadStages);
  const seen = new Set<string>();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Gates</h1>
      <p className="bx-prose mt-2">The regulatory and contractual gates an opening has to pass: what each is, the governing text, when it applies, the stages it binds, the steps, the official page, pending changes and where sources differ. Grouped by the stages whose records list them.</p>
      {(!gates || !stages) && <p className="bx-muted mt-4" role="status">Loading…</p>}
      {gates && stages?.map((s) => {
        const list = s.gates.map((gid) => gates.find((g) => g.id === gid)).filter((g): g is NonNullable<typeof g> => !!g);
        return (
          <section key={s.id} className="mt-8" aria-labelledby={`gs-${s.id}`}>
            <h2 id={`gs-${s.id}`} className="text-2xl flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(s.id) }} /><Link to={`/stages/${s.id}`} className="hover:underline">{s.name}</Link> <span className="bx-muted text-base font-body">({list.length})</span></h2>
            <div className="mt-3 grid gap-2">
              {list.map((g) => {
                if (seen.has(g.id)) return <p key={g.id} className="text-sm pl-3"><span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm mr-1.5" style={{ background: GATE_COLOUR }} /><Link className="underline" to={`/gates/${g.id}`}>{g.name}</Link> <span className="text-xs bx-muted">(also binds an earlier stage; opened there)</span></p>;
                seen.add(g.id);
                return (
                  <Disclosure key={g.id} id={g.id} summary={<><span className="font-semibold">{g.name}</span><span className="block text-xs bx-muted mt-0.5">binds {g.binds.join(', ')}{g.pending_changes.length ? ` · ${g.pending_changes.length} pending change${g.pending_changes.length === 1 ? '' : 's'}` : ''}{g.conflicts.length ? ' · sources differ' : ''}</span></>}>
                    <p className="mt-1"><Link className="underline text-sm font-semibold" to={`/gates/${g.id}`}>The gate’s own page, with the constraints, levers and states that touch it →</Link></p>
                    <GateBody g={g} />
                  </Disclosure>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
