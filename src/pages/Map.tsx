import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AS_OF } from '@/lib/data';
import { loadGraph, loadMap } from '@/lib/heavy';
import type { MapData } from '@/lib/map-layout';
import type { GraphData } from '@/types';
import SystemsGraph, { type GraphState } from '@/components/map/SystemsGraph';
import NoteButton from '@/components/notepad/NoteButton';

/**
 * `/map` (KICKOFF §4b): the dependency graph with URL-addressable selection — `?node=`, `?edge=`,
 * `?walk=upstream|downstream`, `?view=graph|table` and `?field=` round-trip. The table view is the default below
 * 768 px. The precomputed walks load when a walk is first asked for.
 */
export default function MapPage() {
  const [data, setData] = useState<MapData>();
  const [graph, setGraph] = useState<GraphData>();
  const [sp, setSp] = useSearchParams();
  useEffect(() => { let live = true; loadMap().then((d) => { if (live) setData(d); }); return () => { live = false; }; }, []);
  const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const state: GraphState = useMemo(() => ({
    node: sp.get('node'), edge: sp.get('edge'),
    walk: (['upstream', 'downstream'].includes(sp.get('walk') ?? '') ? sp.get('walk') : null) as GraphState['walk'],
    view: (sp.get('view') === 'table' || sp.get('view') === 'graph' ? sp.get('view') : narrow ? 'table' : 'graph') as GraphState['view'],
    field: sp.get('field') ? sp.get('field')!.split(',').filter(Boolean) : null,
    from: sp.get('from'),
  }), [sp, narrow]);
  useEffect(() => { if (state.walk && !graph) { let live = true; loadGraph().then((g) => { if (live) setGraph(g); }); return () => { live = false; }; } return undefined; }, [state.walk, graph]);
  const set = useCallback((p: Partial<GraphState>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(p)) {
      if (v === null || v === undefined) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : String(v));
    }
    if ('node' in p && p.node === null && !('walk' in p)) next.delete('walk');
    if ('field' in p && p.field === null) next.delete('from');
    setSp(next, { replace: true });
  }, [sp, setSp]);
  const fieldCount = state.field?.filter((id) => data?.nodes.some((n) => n.id === id)).length ?? 0;
  const anchorType = state.node ? (state.node.startsWith('c-') ? 'constraints' : state.node.startsWith('l-') ? 'levers' : 'gates') : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">The dependency map</h1>
      <p className="bx-prose mt-2 max-w-3xl">Sixty constraints, sixty-nine levers and forty-seven gates, with the {data?.edges.length ?? 144} dependencies links.yaml records among them, each edge cited. The layout is fixed: the nine stages are sectors of the ring, constraints sit inside their stage, levers beside the constraint that first lists them, and gates on the outer arc beside the stages they bind.</p>
      <p className="mt-2 flex flex-wrap gap-2 items-center text-sm">
        <span className="bx-asof">Current as of {AS_OF}</span>
        {state.node && anchorType && <NoteButton anchor={{ type: anchorType, id: state.node }} label={`map node ${state.node}`} />}
        <Link className="underline" to="/figures/stage-map">The stages and patterns as a picture (Figure 5) →</Link>
      </p>
      {state.field && (
        <div className="bx-banner mt-4 flex flex-wrap items-center gap-2" data-testid="field-banner" role="status">
          <span><strong>Highlighted field:</strong> {fieldCount} record{fieldCount === 1 ? '' : 's'} {state.from === 'pathfinder' || !state.from ? 'narrowed by the pathfinder on the front page (the ranked constraints with their levers and gates)' : `passed in the link (${state.from})`}; everything else is dimmed.</span>
          <button type="button" className="bx-btn ml-auto" onClick={() => set({ field: null })} data-testid="clear-field">Clear the field</button>
        </div>
      )}
      {!data ? <p className="bx-muted mt-6 min-h-[60vh]" role="status">Loading the map…</p> : (
        <div className="mt-6"><SystemsGraph data={data} state={state} set={set} walks={graph?.walks} /></div>
      )}
    </div>
  );
}
