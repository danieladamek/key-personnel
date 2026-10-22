import { useSearchParams } from 'react-router-dom';
import { loadEnablers, useAsync } from '@/lib/heavy';
import { AsOf, BlockLabel, GeoChips, OfficialLink, PendingChanges, RecordHeader, RecordLinks, Sources, SynProse, synId } from '@/components/records/Bits';
import Prose from '@/components/records/Prose';

const KINDS = ['data-source', 'program', 'reference', 'tooling', 'standard'] as const;
const KIND_LABEL: Record<string, string> = { 'data-source': 'Data sources', program: 'Programs', reference: 'References', tooling: 'Tooling categories', standard: 'Standards' };

/**
 * `/enablers` (KICKOFF §4b): data sources, programs, references, tooling categories and standards, filterable by kind;
 * cost and conditions as stated; the official page; the levers each serves. A tooling record names a category and lists
 * vendors as they describe themselves; none is recommended.
 */
export default function Enablers() {
  const all = useAsync(loadEnablers);
  const [sp, setSp] = useSearchParams();
  const kind = sp.get('kind') ?? '';
  const shown = (all ?? []).filter((e) => !kind || e.kind === kind);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Enablers</h1>
      <p className="bx-prose mt-2">The public data, programs, references, standards and tooling categories a recruiter without an HR department can put to work, each as its owner states it. Tooling records name a category and list vendors in their own descriptions; no vendor is recommended.</p>
      <div className="mt-4 flex flex-wrap gap-1.5 text-sm" role="group" aria-label="Filter by kind">
        <button type="button" className={`bx-btn ${!kind ? 'bx-btn-on' : ''}`} aria-pressed={!kind} onClick={() => setSp({}, { replace: true })}>All</button>
        {KINDS.map((k) => <button key={k} type="button" className={`bx-btn ${kind === k ? 'bx-btn-on' : ''}`} aria-pressed={kind === k} onClick={() => setSp({ kind: k }, { replace: true })} data-testid={`kind-${k}`}>{KIND_LABEL[k]}</button>)}
      </div>
      <p className="mt-3 text-sm bx-muted" role="status">{all ? `${shown.length} of ${all.length}` : 'Loading…'}</p>
      <ul className="mt-4 grid gap-4">
        {shown.map((e) => (
          <li key={e.id} id={e.id} className="bx-card p-4 scroll-mt-28" data-testid={`enabler-${e.id}`}>
            <RecordHeader title={e.name} anchor={{ type: 'enablers', id: e.id }} level={2}><span className="bx-status">{e.kind}</span><GeoChips geo={e.geo} sector={e.sector} /><AsOf date={e.as_of} /></RecordHeader>
            <BlockLabel>What it is</BlockLabel><SynProse md={e.what} synId={synId('enablers', e.id, 'what')} />
            <div className="grid gap-2 sm:grid-cols-2">
              <div><BlockLabel>Cost, as stated</BlockLabel>{e.cost ? <SynProse md={e.cost} synId={synId('enablers', e.id, 'cost')} /> : <p className="text-sm bx-muted">not stated</p>}</div>
              <div><BlockLabel>Conditions, as stated</BlockLabel>{e.conditions ? <SynProse md={e.conditions} synId={synId('enablers', e.id, 'conditions')} /> : <p className="text-sm bx-muted">not stated</p>}</div>
            </div>
            <div className="mt-3"><OfficialLink url={e.official_url} /></div>
            <BlockLabel>Levers it serves ({e.levers_all.length})</BlockLabel>
            {e.levers_all.length ? <RecordLinks type="levers" ids={e.levers_all} /> : <p className="text-sm bx-muted">None named.</p>}
            <PendingChanges items={e.pending_changes} />
            {typeof e.note === 'string' && <div className="mt-2 text-sm"><Prose md={e.note} /></div>}
            <Sources ns={e.sources} />
          </li>
        ))}
      </ul>
    </div>
  );
}
