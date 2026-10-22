import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MapData, MapEdge, MapNode } from '@/lib/map-layout';
import type { Constraint, Gate, Lever, Link as LinkRec } from '@/types';
import { loadConstraints, loadGates, loadLevers, loadLinks } from '@/lib/heavy';
import { RELATION_MEANING, stageLabel } from '@/lib/data';
import Prose from '@/components/records/Prose';
import CiteList from '@/components/records/CiteList';
import NoteButton from '@/components/notepad/NoteButton';
import { BlockLabel, GradeChip, LegacyLine, ListOf, PendingChanges, RecordLinks, StageChip, SynProse, synId } from '@/components/records/Bits';
import { DependencyLists, EvidenceBlock, IndicatorTable } from '@/components/records/RecordParts';
import type { GraphState } from './SystemsGraph';

function useRecord<T extends { id: string }>(load: () => Promise<T[]>, id: string): T | null | undefined {
  const [r, setR] = useState<T | null | undefined>();
  useEffect(() => { let live = true; setR(undefined); load().then((xs) => { if (live) setR(xs.find((x) => x.id === id) ?? null); }); return () => { live = false; }; }, [load, id]);
  return r;
}

const KIND_PATH: Record<MapNode['kind'], string> = { constraint: 'constraints', lever: 'levers', gate: 'gates' };

/** The node panel: the record, and beneath it its dependencies in two groups, each row clickable. */
export function NodePanel({ n, data, set }: { n: MapNode; data: MapData; nodeById: Map<string, MapNode>; set: (p: Partial<GraphState>) => void }) {
  return (
    <div className="bx-card p-4 text-sm grid gap-2" data-testid="node-panel" data-node={n.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs bx-muted uppercase tracking-[0.12em] font-semibold">{n.kind}</p>
        <NoteButton anchor={{ type: KIND_PATH[n.kind] as 'constraints', id: n.id }} label={n.name} />
      </div>
      <h2 className="text-xl leading-snug">{n.name}</h2>
      {n.kind === 'constraint' && <ConstraintBody id={n.id} />}
      {n.kind === 'lever' && <LeverBody id={n.id} />}
      {n.kind === 'gate' && <GateBody id={n.id} />}
      <DependencyLists id={n.id} data={data} row={(e, _other, label) => (
        <button type="button" className="text-left w-full rounded px-1 py-0.5 hover:bg-paper-2 dark:hover:bg-night-2" onClick={() => set({ edge: e.id, node: null, walk: null })} data-testid="dependency-row" data-edge={e.id}>{label}</button>
      )} />
      <p className="mt-2"><Link to={`/${KIND_PATH[n.kind]}/${n.id}`} className="font-semibold underline">The full {n.kind} page →</Link></p>
    </div>
  );
}

function ConstraintBody({ id }: { id: string }) {
  const c = useRecord<Constraint>(loadConstraints, id);
  if (c === undefined) return <p className="bx-muted" role="status">Loading…</p>;
  if (c === null) return <p><span className="bx-todo">no constraint record {id}</span></p>;
  return (
    <div className="grid gap-1" data-testid="panel-record">
      <p className="flex flex-wrap gap-1.5 items-center"><StageChip stage={c.stage} /><GradeChip grade={c.evidence_grade} /></p>
      <BlockLabel>What it is</BlockLabel><SynProse md={c.what} synId={synId('constraints', c.id, 'what')} />
      <BlockLabel>Mechanism</BlockLabel><SynProse md={c.mechanism} synId={synId('constraints', c.id, 'mechanism')} />
      <BlockLabel>How to tell</BlockLabel><ListOf items={c.how_to_tell} syn={{ file: 'constraints', id: c.id, field: 'how_to_tell' }} />
      <BlockLabel>Indicators</BlockLabel><IndicatorTable ids={c.indicators} />
      <BlockLabel>Levers ({c.levers.length})</BlockLabel><RecordLinks type="levers" ids={c.levers} />
      <BlockLabel>Gates ({c.gates.length})</BlockLabel><RecordLinks type="gates" ids={c.gates} />
    </div>
  );
}

function LeverBody({ id }: { id: string }) {
  const l = useRecord<Lever>(loadLevers, id);
  if (l === undefined) return <p className="bx-muted" role="status">Loading…</p>;
  if (l === null) return <p><span className="bx-todo">no lever record {id}</span></p>;
  return (
    <div className="grid gap-1" data-testid="panel-record">
      <p className="flex flex-wrap gap-1.5">{l.stages.map((s) => <StageChip key={s} stage={s} />)}</p>
      <BlockLabel>What it is</BlockLabel><SynProse md={l.what} synId={synId('levers', l.id, 'what')} />
      <BlockLabel>Evidence</BlockLabel>
      <EvidenceBlock lever={l} compact />
      <LegacyLine ids={l.legacy} />
    </div>
  );
}

function GateBody({ id }: { id: string }) {
  const g = useRecord<Gate>(loadGates, id);
  if (g === undefined) return <p className="bx-muted" role="status">Loading…</p>;
  if (g === null) return <p><span className="bx-todo">no gate record {id}</span></p>;
  return (
    <div className="grid gap-1" data-testid="panel-record">
      <p className="flex flex-wrap gap-1.5">{g.binds.map((s) => <StageChip key={s} stage={s} />)}</p>
      <BlockLabel>Governing text</BlockLabel><Prose md={g.governing_text || '—'} />
      <BlockLabel>What it is</BlockLabel><SynProse md={g.what} synId={synId('gates', g.id, 'what')} />
      <PendingChanges items={g.pending_changes} />
      <p className="text-xs bx-muted mt-1">Gates carry no edges in links.yaml; the constraints and levers that name this gate are on its page.</p>
    </div>
  );
}

/** The edge panel: the relation, the `link`, the `evidence` with its citation tokens, the `grade`, the two endpoints. */
export function EdgePanel({ e, nodeById, set }: { e: MapEdge; nodeById: Map<string, MapNode>; set: (p: Partial<GraphState>) => void }) {
  const rec = useRecord<LinkRec>(loadLinks, e.id);
  const from = nodeById.get(e.from); const to = nodeById.get(e.to);
  return (
    <div className="bx-card p-4 text-sm grid gap-2" data-testid="edge-panel" data-edge={e.id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs bx-muted"><span className="bx-status font-semibold">{e.relation}</span> · {RELATION_MEANING[e.relation as keyof typeof RELATION_MEANING]} · {e.id}</p>
        <NoteButton anchor={{ type: 'links', id: e.id }} label={`edge ${e.id}`} />
      </div>
      <h2 className="text-xl leading-snug">{e.link}</h2>
      <p>
        <button type="button" className="underline font-semibold text-left" onClick={() => set({ node: e.from, edge: null })}>{from?.name ?? e.from}</button>
        {' → '}
        <button type="button" className="underline font-semibold text-left" onClick={() => set({ node: e.to, edge: null })}>{to?.name ?? e.to}</button>
      </p>
      <p className="text-xs bx-muted">Tail: {from?.kind}{from?.stage ? ` · ${stageLabel(from.stage)}` : ''} · head: {to?.kind}{to?.stage ? ` · ${stageLabel(to.stage)}` : ''}</p>
      <p className="flex items-center gap-1.5"><span className="text-xs font-semibold bx-muted">Grade</span> <GradeChip grade={e.grade} /></p>
      <BlockLabel>Evidence</BlockLabel>
      <div data-testid="edge-evidence">{rec === undefined ? <p className="bx-muted" role="status">Loading…</p> : rec === null ? <span className="bx-todo">edge {e.id} not in links.yaml</span> : <SynProse md={rec.evidence} synId={synId('links', rec.id, 'evidence')} />}</div>
      {rec && rec.sources.length > 0 && (<><BlockLabel>Sources</BlockLabel><CiteList ns={rec.sources} /></>)}
      {rec && <LegacyLine ids={rec.legacy} />}
    </div>
  );
}
