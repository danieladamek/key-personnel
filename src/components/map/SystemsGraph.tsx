/**
 * The dependency graph (KICKOFF §4b /map), ported from apps/alabama-mental-health-systems SystemsGraph.tsx: the same
 * node panel, edge panel, upstream/downstream walks, table view, keyboard handling and URL state, with the layout
 * adapted — nine stage sectors on a ring, constraints on the inner ring, levers on a middle ring beside the constraint
 * that first lists them, gates on an outer arc beside the stages they bind. Nothing is added: nodes are the
 * constraint, lever and gate records, and the edges are exactly links.yaml, the relation drawn in the stroke
 * (precondition solid, amplifies dashed, trade-off dotted, enables double) with an arrowhead at the head.
 */
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CX, CY, edgePath, H, layout, R_STAGE_LABEL, sectorOf, W, wedge, type MapData, type MapEdge, type MapNode } from '@/lib/map-layout';
import { GATE_COLOUR, LEVER_COLOUR, RELATION_MEANING, stageColour, STAGES } from '@/lib/data';
import type { Closure, Relation } from '@/types';
import { NodePanel, EdgePanel } from './Panels';

export interface GraphState { node: string | null; edge: string | null; walk: 'upstream' | 'downstream' | null; view: 'graph' | 'table'; field: string[] | null; from: string | null }

const NR = 7;
/** room beside the ring for the labels of the outermost nodes */
const VB_PAD = 110;
export const DASH: Record<string, string | undefined> = { precondition: undefined, amplifies: '7 4', 'trade-off': '1.5 4', enables: undefined };
const short = (s: string, n = 40) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const KIND_WORD: Record<MapNode['kind'], string> = { constraint: 'Constraint', lever: 'Lever', gate: 'Gate' };

export function RelationStroke({ relation, w = 30 }: { relation: string; w?: number }) {
  return (
    <svg width={w} height="10" aria-hidden="true" className="inline-block align-middle">
      {relation === 'enables'
        ? <><line x1="1" y1="5" x2={w - 1} y2="5" stroke="currentColor" strokeWidth="3.4" /><line x1="1" y1="5" x2={w - 1} y2="5" stroke="var(--bx-bg)" strokeWidth="1.2" /></>
        : <line x1="1" y1="5" x2={w - 1} y2="5" stroke="currentColor" strokeWidth="1.8" strokeDasharray={DASH[relation]} strokeLinecap={relation === 'trade-off' ? 'round' : undefined} />}
    </svg>
  );
}

export default function SystemsGraph({ data, state, set, walks }: { data: MapData; state: GraphState; set: (p: Partial<GraphState>) => void; walks?: Record<string, { up: Record<string, Closure>; down: Record<string, Closure> }> }) {
  const pos = useMemo(() => layout(data), [data]);
  const nodeById = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const sel = state.node ? nodeById.get(state.node) ?? null : null;
  const selEdge = state.edge ? data.edges.find((e) => e.id === state.edge) ?? null : null;
  const field = useMemo(() => (state.field ? new Set(state.field.filter((id) => nodeById.has(id))) : null), [state.field, nodeById]);
  const [hover, setHover] = useState<string | null>(null);

  const hl = useMemo(() => {
    const nodes = new Set<string>(); const edges = new Set<string>();
    let pending = false;
    if (selEdge) { nodes.add(selEdge.from); nodes.add(selEdge.to); edges.add(selEdge.id); }
    else if (sel) {
      nodes.add(sel.id);
      if (state.walk) {
        const w = walks?.[sel.id]?.[state.walk === 'upstream' ? 'up' : 'down']?.all;
        if (!walks) pending = true;
        for (const n of w?.nodes ?? []) nodes.add(n);
        for (const e of w?.edges ?? []) edges.add(e);
      } else for (const e of data.edges) if (e.from === sel.id || e.to === sel.id) { edges.add(e.id); nodes.add(e.from); nodes.add(e.to); }
    } else if (field) {
      for (const n of field) nodes.add(n);
      for (const e of data.edges) if (field.has(e.from) && field.has(e.to)) edges.add(e.id);
    }
    return { nodes, edges, any: !!(sel || selEdge || field), pending };
  }, [sel, selEdge, state.walk, walks, data.edges, field]);

  const key = (e: KeyboardEvent, f: () => void) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } };
  const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && (sel || selEdge)) { e.preventDefault(); set({ node: null, edge: null, walk: null }); } };
  const labelled = useMemo(() => {
    const s = new Set<string>();
    if (sel) s.add(sel.id);
    if (selEdge) { s.add(selEdge.from); s.add(selEdge.to); }
    if (hl.nodes.size <= 26) for (const n of hl.nodes) s.add(n);
    if (hover) s.add(hover);
    return s;
  }, [sel, selEdge, hl.nodes, hover]);

  const colourOf = (n: MapNode) => (n.kind === 'constraint' ? stageColour(n.stage) : n.kind === 'lever' ? LEVER_COLOUR : GATE_COLOUR);

  const svg = (
    <svg viewBox={`${-VB_PAD} ${-VB_PAD / 3} ${W + 2 * VB_PAD} ${H + (2 * VB_PAD) / 3}`} className="w-full h-auto max-h-[86vh]" role="group" aria-label={`Dependency map: ${data.nodes.length} records and ${data.edges.length} cited dependencies`} data-testid="map-svg" onKeyDown={onEsc}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bx-muted)" /></marker>
        <marker id="arrow-hl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--bx-accent)" /></marker>
      </defs>
      <g aria-hidden="true">
        {data.stages.map((s, i) => {
          const { mid } = sectorOf(i, data.stages.length);
          const lx = CX + R_STAGE_LABEL * Math.cos(mid); const ly = CY + R_STAGE_LABEL * Math.sin(mid);
          return (
            <g key={s.id}>
              <path d={wedge(i, data.stages.length)} fill={stageColour(s.id)} fillOpacity={0.09} stroke="var(--bx-line)" strokeWidth={1} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={15} fontWeight={700} fill={stageColour(s.id)} className="font-display">{s.name}</text>
            </g>
          );
        })}
      </g>
      <g>
        {data.edges.map((e) => {
          const a = pos.get(e.from); const b = pos.get(e.to);
          if (!a || !b) return null;
          const p = edgePath(a, b, NR);
          const on = hl.edges.has(e.id);
          const dim = hl.any && !on;
          const from = nodeById.get(e.from); const to = nodeById.get(e.to);
          const stroke = on ? 'var(--bx-accent)' : 'var(--bx-muted)';
          const op = dim ? 0.1 : on ? 1 : 0.45;
          const w = on ? 2.2 : 1.1;
          return (
            <g key={e.id} data-testid="map-edge" data-edge={e.id} data-relation={e.relation} role="button" tabIndex={0} aria-pressed={state.edge === e.id}
              aria-label={`${e.relation}: ${from?.name} to ${to?.name}: ${e.link}`}
              onClick={() => set({ edge: e.id, node: null, walk: null })} onKeyDown={(ev) => key(ev, () => set({ edge: e.id, node: null, walk: null }))} className="cursor-pointer outline-none group">
              <path d={p.d} fill="none" stroke="transparent" strokeWidth={10} />
              {e.relation === 'enables' ? (
                <>
                  <path d={p.d} fill="none" stroke={stroke} strokeOpacity={op} strokeWidth={w + 2.2} markerEnd={on ? 'url(#arrow-hl)' : 'url(#arrow)'} className="group-focus-visible:stroke-[4]" />
                  <path d={p.d} fill="none" stroke="var(--bx-bg)" strokeOpacity={dim ? 0.4 : 1} strokeWidth={Math.max(0.9, w - 0.3)} />
                </>
              ) : (
                <path d={p.d} fill="none" stroke={stroke} strokeOpacity={op} strokeWidth={w} strokeDasharray={DASH[e.relation]} strokeLinecap={e.relation === 'trade-off' ? 'round' : undefined} markerEnd={on ? 'url(#arrow-hl)' : 'url(#arrow)'} className="group-focus-visible:stroke-[3]" />
              )}
              {on && selEdge?.id === e.id && (
                <text x={p.mx} y={p.my} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--bx-ink)" stroke="var(--bx-bg)" strokeWidth={4} paintOrder="stroke" pointerEvents="none">{e.link}</text>
              )}
            </g>
          );
        })}
      </g>
      <g>
        {data.nodes.map((n) => {
          const p = pos.get(n.id);
          if (!p) return null;
          const on = hl.nodes.has(n.id);
          const dim = hl.any && !on;
          const isSel = state.node === n.id;
          const c = colourOf(n);
          const sw = isSel ? 3.2 : 1.4;
          const shape = n.kind === 'constraint'
            ? <circle r={NR} fill={c} stroke="var(--bx-ink)" strokeWidth={sw} />
            : n.kind === 'lever'
              ? <rect x={-NR * 0.85} y={-NR * 0.85} width={NR * 1.7} height={NR * 1.7} transform="rotate(45)" fill="var(--bx-bg)" stroke={c} strokeWidth={isSel ? 3.4 : 2} />
              : <rect x={-NR} y={-NR * 0.75} width={NR * 2} height={NR * 1.5} rx={2.5} fill={c} fillOpacity={0.85} stroke="var(--bx-ink)" strokeWidth={sw} />;
          const showLabel = labelled.has(n.id);
          const right = Math.cos(p.angle) >= 0;
          const out = n.kind === 'constraint' ? -1 : 1; // constraint labels point inward, levers and gates outward
          const lx = (right ? 1 : -1) * (NR + 4) * (out === 1 ? 1 : 1);
          return (
            <g key={n.id} transform={`translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`} data-testid="map-node" data-node={n.id} data-kind={n.kind} role="button" tabIndex={0} aria-pressed={isSel}
              aria-label={`${KIND_WORD[n.kind]}: ${n.name}`}
              onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover((h) => (h === n.id ? null : h))} onFocus={() => setHover(n.id)} onBlur={() => setHover((h) => (h === n.id ? null : h))}
              onClick={() => set({ node: n.id, edge: null, walk: null })} onKeyDown={(ev) => key(ev, () => set({ node: n.id, edge: null, walk: null }))} className="cursor-pointer outline-none" opacity={dim ? 0.22 : 1}>
              <title>{`${KIND_WORD[n.kind]}: ${n.name}`}</title>
              <circle r={NR + 5} fill="transparent" />
              {field?.has(n.id) && !sel && !selEdge && <circle r={NR + 4} fill="none" stroke="var(--bx-accent)" strokeWidth={1.6} />}
              {shape}
              {showLabel && (
                <text x={lx} y={4} textAnchor={right ? 'start' : 'end'} fontSize={isSel ? 14 : 12} fontWeight={isSel ? 700 : 600} fill="var(--bx-ink)" stroke="var(--bx-bg)" strokeWidth={4} paintOrder="stroke" pointerEvents="none">{short(n.name, isSel ? 60 : 40)}</text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2 items-center mb-3 text-sm no-print">
          <div role="group" aria-label="View" className="flex gap-1">
            <button type="button" className={`bx-btn ${state.view === 'graph' ? 'bx-btn-on' : ''}`} aria-pressed={state.view === 'graph'} onClick={() => set({ view: 'graph' })} data-testid="graph-view">Graph</button>
            <button type="button" className={`bx-btn ${state.view === 'table' ? 'bx-btn-on' : ''}`} aria-pressed={state.view === 'table'} onClick={() => set({ view: 'table' })} data-testid="table-view">Table</button>
          </div>
          <div role="group" aria-label="Walk the dependencies" className="flex gap-1">
            <button type="button" className={`bx-btn ${state.walk === 'upstream' ? 'bx-btn-on' : ''}`} aria-pressed={state.walk === 'upstream'} disabled={!sel} onClick={() => set({ walk: state.walk === 'upstream' ? null : 'upstream' })} data-testid="walk-upstream">Depends on</button>
            <button type="button" className={`bx-btn ${state.walk === 'downstream' ? 'bx-btn-on' : ''}`} aria-pressed={state.walk === 'downstream'} disabled={!sel} onClick={() => set({ walk: state.walk === 'downstream' ? null : 'downstream' })} data-testid="walk-downstream">Is depended on by</button>
          </div>
          {state.walk && sel && <span className="text-xs bx-muted" role="status">{hl.pending ? 'Loading the walk…' : `${hl.nodes.size - 1} record${hl.nodes.size - 1 === 1 ? '' : 's'} reached along ${hl.edges.size} edge${hl.edges.size === 1 ? '' : 's'}`}</span>}
          {(sel || selEdge) && <button type="button" className="bx-btn ml-auto" onClick={() => set({ node: null, edge: null, walk: null })}>Clear selection</button>}
        </div>
        {state.view === 'graph' ? (
          <>
            {svg}
            <Legend />
          </>
        ) : <EdgeTable data={data} nodeById={nodeById} state={state} set={set} hl={hl} />}
      </div>
      <aside className="min-w-0" aria-live="polite">
        {selEdge ? <EdgePanel e={selEdge} nodeById={nodeById} set={set} /> : sel ? <NodePanel n={sel} data={data} nodeById={nodeById} set={set} /> : (
          <div className="bx-card p-4 text-sm grid gap-2" data-testid="map-help">
            <p>Each dot is a record: a constraint (filled circle, coloured by its stage), a lever (open diamond) or a gate (filled square). Each arrow is one dependency from links.yaml, drawn tail to head; selecting one shows the cited evidence for it.</p>
            <p>Selecting a record shows it and its dependencies in two lists, “depends on” and “is depended on by”; the two walk buttons then dim everything outside the chain upstream or downstream of it. Esc clears the selection.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Legend() {
  return (
    <div className="text-xs bx-muted mt-2 grid gap-1.5" data-testid="map-legend">
      <p className="flex flex-wrap gap-x-4 gap-y-1 items-center">
        <span><svg width="14" height="14" aria-hidden="true" className="inline align-middle"><circle cx="7" cy="7" r="5" fill="#888" stroke="var(--bx-ink)" /></svg> constraint (inner ring; colour = stage)</span>
        <span><svg width="14" height="14" aria-hidden="true" className="inline align-middle"><rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="none" stroke={LEVER_COLOUR} strokeWidth="2" /></svg> lever (middle ring)</span>
        <span><svg width="16" height="14" aria-hidden="true" className="inline align-middle"><rect x="1" y="3" width="14" height="9" rx="2" fill={GATE_COLOUR} stroke="var(--bx-ink)" /></svg> gate (outer arc)</span>
      </p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 items-center">
        {(['precondition', 'amplifies', 'trade-off', 'enables'] as Relation[]).map((r) => <span key={r} title={RELATION_MEANING[r]}><RelationStroke relation={r} /> {r}: {RELATION_MEANING[r]}</span>)}
      </p>
      <p>The arrow points from the tail to the head; in every relation the head depends on the tail.</p>
    </div>
  );
}

type SortKey = 'stage' | 'relation' | 'grade';
function EdgeTable({ data, nodeById, state, set, hl }: { data: MapData; nodeById: Map<string, MapNode>; state: GraphState; set: (p: Partial<GraphState>) => void; hl: { edges: Set<string>; any: boolean } }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const stageOf = (e: MapEdge) => nodeById.get(e.to)?.stage ?? nodeById.get(e.from)?.stage ?? '';
  const rows = useMemo(() => {
    const xs = [...data.edges];
    if (!sort) return xs;
    const val = (e: MapEdge): string | number => (sort.key === 'stage' ? STAGES.indexOf(stageOf(e) as never) : sort.key === 'relation' ? e.relation : e.grade);
    return xs.sort((a, b) => { const va = val(a); const vb = val(b); return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir || a.id.localeCompare(b.id); });
  }, [data.edges, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const th = (k: SortKey, label: ReactNode) => {
    const on = sort?.key === k;
    return (
      <th scope="col" aria-sort={on ? (sort!.dir === 1 ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className="font-semibold underline-offset-2 hover:underline" onClick={() => setSort((s) => (s?.key === k ? { key: k, dir: s.dir === 1 ? -1 : 1 } : { key: k, dir: 1 }))} data-testid={`sort-${k}`}>{label}{on ? (sort!.dir === 1 ? ' ▲' : ' ▼') : ''}</button>
      </th>
    );
  };
  const nodeBtn = (id: string) => <button type="button" className="underline text-left" onClick={() => set({ node: id, edge: null, walk: null })}>{nodeById.get(id)?.name ?? id}</button>;
  return (
    <div className="overflow-x-auto" data-testid="map-table">
      <table className="bx-table w-full">
        <caption className="sr-only">Every dependency in links.yaml, one row per edge</caption>
        <thead><tr><th scope="col">Tail</th>{th('relation', 'Relation')}<th scope="col">Link</th><th scope="col">Head</th>{th('stage', 'Stage')}{th('grade', 'Grade')}</tr></thead>
        <tbody>
          {rows.map((e) => {
            const on = hl.edges.has(e.id);
            return (
              <tr key={e.id} data-edge={e.id} className={`align-top ${state.edge === e.id ? 'bg-paper-2 dark:bg-night-2' : ''} ${hl.any && !on ? 'opacity-50' : ''}`} data-testid="map-row">
                <td>{nodeBtn(e.from)}</td>
                <td className="whitespace-nowrap"><RelationStroke relation={e.relation} w={22} /> {e.relation}</td>
                <td><button type="button" className="underline text-left font-semibold" onClick={() => set({ edge: e.id, node: null, walk: null })}>{e.link}</button></td>
                <td>{nodeBtn(e.to)}</td>
                <td className="whitespace-nowrap"><span aria-hidden="true" className="inline-block h-2 w-2 rounded-full mr-1" style={{ background: stageColour(stageOf(e)) }} />{stageOf(e)}</td>
                <td>{e.grade}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
