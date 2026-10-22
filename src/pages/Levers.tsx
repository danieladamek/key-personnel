import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GRADE_ORDER, stageLabel, STAGES } from '@/lib/data';
import { loadGates, loadLevers, useAsync } from '@/lib/heavy';
import { StageChip } from '@/components/records/Bits';
import { EvidenceBlock } from '@/components/records/RecordParts';

/**
 * `/levers` — the catalogue (KICKOFF §4b), filterable by stage, evidence grade and gate. Levers keep the pack's order;
 * nothing is ordered by merit and every lever shows its evidence block with its limits line.
 */
export default function Levers() {
  const levers = useAsync(loadLevers);
  const gates = useAsync(loadGates);
  const [sp, setSp] = useSearchParams();
  const stage = sp.get('stage') ?? '';
  const grade = sp.get('grade') ?? '';
  const gate = sp.get('gate') ?? '';
  const set = (k: string, v: string) => { const p = new URLSearchParams(sp); if (v) p.set(k, v); else p.delete(k); setSp(p, { replace: true }); };
  const grades = useMemo(() => [...new Set((levers ?? []).map((l) => l.evidence.grade))].sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b)), [levers]);
  const gateIds = useMemo(() => [...new Set((levers ?? []).flatMap((l) => l.gates))], [levers]);
  const shown = (levers ?? []).filter((l) => (!stage || l.stages.includes(stage as never)) && (!grade || l.evidence.grade === grade) && (!gate || l.gates.includes(gate)));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Levers</h1>
      <p className="bx-prose mt-2 max-w-3xl">What the firm can do about a constraint. Each lever carries the evidence grade of the strongest study behind it, the effect as that study reported it with its population, and directly beneath, what the lever has not been shown to do. They are listed in the pack’s order; filtering narrows the list and never ranks it.</p>
      <div className="bx-card p-3 mt-5 grid gap-2 sm:grid-cols-3 text-sm" role="search" aria-label="Filter levers">
        <label className="block"><span className="block text-xs bx-muted mb-1">Stage</span><select className="bx-input" value={stage} onChange={(e) => set('stage', e.target.value)} data-testid="filter-stage"><option value="">Every stage</option>{STAGES.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}</select></label>
        <label className="block"><span className="block text-xs bx-muted mb-1">Evidence grade</span><select className="bx-input" value={grade} onChange={(e) => set('grade', e.target.value)} data-testid="filter-grade"><option value="">Every grade</option>{grades.map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
        <label className="block"><span className="block text-xs bx-muted mb-1">Gate</span><select className="bx-input" value={gate} onChange={(e) => set('gate', e.target.value)} data-testid="filter-gate"><option value="">Any gate</option>{gateIds.map((g) => <option key={g} value={g}>{gates?.find((x) => x.id === g)?.name ?? g}</option>)}</select></label>
      </div>
      <p className="mt-3 text-sm bx-muted" role="status">{levers ? `${shown.length} of ${levers.length} levers` : 'Loading…'}</p>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {shown.map((l) => (
          <li key={l.id} className="grid gap-1.5 content-start" data-testid={`lever-${l.id}`}>
            <Link to={`/levers/${l.id}`} className="font-display text-lg font-semibold underline leading-snug">{l.name}</Link>
            <p className="flex flex-wrap gap-1">{l.stages.map((s) => <StageChip key={s} stage={s} />)}</p>
            <EvidenceBlock lever={l} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}
