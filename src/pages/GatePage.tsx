import { Link, useParams } from 'react-router-dom';
import { loadGates, loadStates, useAsync } from '@/lib/heavy';
import { GATE_COLOUR, OVERLAY_LABEL, PENDING_TAG } from '@/lib/data';
import type { Gate } from '@/types';
import { AsOf, BlockLabel, Conflicts, Field, LegacyLine, OfficialLink, PendingChanges, RecordHeader, RecordLinks, Sources, StageChip, SynProse, synId } from '@/components/records/Bits';
import Prose from '@/components/records/Prose';
import NotFound from './NotFound';

/** The body of a gate, shared by /gates (as a disclosure) and /gates/:id: every field the KICKOFF names, in its order. */
export function GateBody({ g, level = 2 }: { g: Gate; level?: 1 | 2 | 3 }) {
  return (
    <>
      {level === 1 && (
        <RecordHeader title={g.name} anchor={{ type: 'gates', id: g.id }}>
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: GATE_COLOUR }} />
          {g.binds.map((s) => <StageChip key={s} stage={s} />)}<AsOf date={g.as_of} />
        </RecordHeader>
      )}
      <BlockLabel>What it is</BlockLabel><SynProse md={g.what} synId={synId('gates', g.id, 'what')} />
      <BlockLabel>Governing text</BlockLabel>{g.governing_text ? <Prose md={g.governing_text} /> : <p className="text-sm bx-muted">— (empty in the pack)</p>}
      <Field label="Applies when" value={g.applies_when} syn={{ file: 'gates', id: g.id, field: 'applies_when' }} />
      <BlockLabel>Binds</BlockLabel><p className="flex flex-wrap gap-1.5">{g.binds.map((s) => <StageChip key={s} stage={s} />)}</p>
      <Field label="Steps" value={g.steps} ordered syn={{ file: 'gates', id: g.id, field: 'steps' }} />
      <div className="mt-4"><OfficialLink url={g.official_url} /></div>
      <PendingChanges items={g.pending_changes} />
      <Conflicts items={g.conflicts} />
      <Sources ns={g.sources} />
      <p className="mt-4"><AsOf date={g.as_of} /></p>
    </>
  );
}

/**
 * `/gates/:id` (KICKOFF §4b): the gate in full, then the constraints and levers that touch it and, where state
 * overlays point at it, the states by overlay status (state, status, tag).
 */
export default function GatePage() {
  const { id = '' } = useParams();
  const all = useAsync(loadGates);
  const states = useAsync(loadStates);
  if (!all) return <p className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</p>;
  const g = all.find((x) => x.id === id);
  if (!g) return <NotFound />;
  const stateName = (sid: string) => states?.find((s) => s.id === sid)?.state ?? sid;
  return (
    <article className="mx-auto max-w-3xl px-4 py-8" data-testid="gate-page">
      <p className="text-xs bx-muted uppercase tracking-[0.12em] font-semibold">Gate</p>
      <GateBody g={g} level={1} />
      <BlockLabel>Constraints that name it ({g.constraints.length})</BlockLabel>
      {g.constraints.length ? <RecordLinks type="constraints" ids={g.constraints} /> : <p className="text-sm bx-muted">None.</p>}
      <BlockLabel>Levers that name it ({g.levers.length})</BlockLabel>
      {g.levers.length ? <RecordLinks type="levers" ids={g.levers} /> : <p className="text-sm bx-muted">None.</p>}
      {g.changes_affecting.length > 0 && (<><BlockLabel>In the dated ledger</BlockLabel><RecordLinks type="changes" ids={g.changes_affecting} /></>)}
      {g.states.length > 0 && (
        <section data-testid="gate-states">
          <BlockLabel>State overlays that modify it ({g.states.length})</BlockLabel>
          <div className="overflow-x-auto">
            <table className="bx-table w-full">
              <thead><tr><th scope="col">State</th><th scope="col">Overlay</th><th scope="col">Status</th><th scope="col">Tag</th></tr></thead>
              <tbody>
                {[...g.states].sort((a, b) => a.status.localeCompare(b.status) || stateName(a.state).localeCompare(stateName(b.state))).map((s) => (
                  <tr key={`${s.state}-${s.overlay}`}>
                    <td><Link className="underline" to={`/states/${s.state}`}>{stateName(s.state)}</Link></td>
                    <td>{OVERLAY_LABEL[s.overlay]}</td>
                    <td><span className="bx-status">{s.status}</span></td>
                    <td>{s.primary_pending ? <span className="bx-todo">{PENDING_TAG}</span> : <span className="bx-muted text-xs">primary read</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <LegacyLine ids={g.legacy} />
    </article>
  );
}
