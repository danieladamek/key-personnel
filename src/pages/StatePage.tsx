import { Link, useParams } from 'react-router-dom';
import { loadStates, loadStatesHeader, useAsync } from '@/lib/heavy';
import { OVERLAY_LABEL, OVERLAYS, PENDING_TAG } from '@/lib/data';
import Prose from '@/components/records/Prose';
import { AsOf, BlockLabel, RecordHeader, RecordLinks, Sources } from '@/components/records/Bits';
import { headerSentence } from './States';
import NotFound from './NotFound';

/**
 * `/states/:id` (KICKOFF §4b): the nine overlays in order, each with its status (in the header's meaning, never "no
 * law"), threshold, effective date and notice days where present, the text with citation tokens, the gates it
 * modifies and the compilation tag; then localities, sources, as_of and recheck. The header says how many of the
 * nine carry the tag.
 */
export default function StatePage() {
  const { id = '' } = useParams();
  const states = useAsync(loadStates);
  const header = useAsync(loadStatesHeader);
  if (!states) return <p className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</p>;
  const s = states.find((x) => x.id === id);
  if (!s) return <NotFound />;
  const tagged = OVERLAYS.filter((o) => s[o].primary_pending).length;
  const noneFound = header ? headerSentence(header, 'none-found') : null;
  return (
    <article className="mx-auto max-w-3xl px-4 py-8" data-testid="state-page">
      <p className="text-xs bx-muted uppercase tracking-[0.12em] font-semibold">State overlay · {s.abbr}</p>
      <RecordHeader title={s.state} anchor={{ type: 'states', id: s.id }}><AsOf date={s.as_of} />{s.recheck && <span className="bx-chip border border-dashed border-[color:var(--bx-line)] bx-muted">not yet re-read against the live pages</span>}</RecordHeader>
      {(s.state_gates ?? []).length > 0 && (
        <section className="mt-5" aria-labelledby="state-rules-h" data-testid="state-rules">
          <h2 id="state-rules-h" className="text-xl">State rules</h2>
          <p className="text-xs bx-muted mt-0.5">The {s.state} gates in the pack, each with its own page.</p>
          <ul className="mt-2 grid gap-1">{s.state_gates.map((g) => <li key={g}><RecordLinks type="gates" ids={[g]} /></li>)}</ul>
        </section>
      )}
      <p className="mt-3 text-sm" data-testid="tag-count"><strong>{tagged} of 9</strong> overlays are {PENDING_TAG}; {9 - tagged} rest on a primary source read in the sweep.</p>
      <ol className="mt-4 grid gap-3">
        {OVERLAYS.map((o) => {
          const ov = s[o];
          return (
            <li key={o} className="bx-card p-3" data-testid={`overlay-${o}`} data-pending={ov.primary_pending ? 'true' : 'false'}>
              <h2 className="text-lg flex flex-wrap items-center gap-2">{OVERLAY_LABEL[o]} <span className="bx-status font-body text-xs">{ov.status}</span></h2>
              {ov.primary_pending && <p className="mt-1"><span className="bx-todo" data-testid="pending-tag">{PENDING_TAG}</span></p>}
              {ov.status === 'none-found' && noneFound && <p className="text-xs bx-muted mt-1">none-found: {noneFound}</p>}
              {(ov.threshold || ov.effective || ov.notice_days) && (
                <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                  {ov.threshold && <><dt className="text-xs font-semibold bx-muted">Threshold</dt><dd>{ov.threshold}</dd></>}
                  {ov.effective && <><dt className="text-xs font-semibold bx-muted">Effective</dt><dd>{ov.effective}</dd></>}
                  {ov.notice_days && <><dt className="text-xs font-semibold bx-muted">Notice days</dt><dd>{ov.notice_days}</dd></>}
                </dl>
              )}
              <Prose md={ov.text} className="mt-1.5 text-[15px]" />
              {ov.gates.length > 0 && <p className="mt-2 text-xs"><span className="bx-muted mr-1">Modifies:</span><RecordLinks type="gates" ids={ov.gates} /></p>}
            </li>
          );
        })}
      </ol>
      {s.localities && (<><BlockLabel>Localities</BlockLabel><Prose md={s.localities} /></>)}
      <Sources ns={s.sources} />
      <p className="mt-6 flex flex-wrap gap-2 items-center"><AsOf date={s.as_of} /><span className="text-xs bx-muted">recheck: {s.recheck ? 'pending — the live pages have not been re-read' : 'done'}</span></p>
      <p className="mt-6"><Link className="underline" to="/states">All states →</Link></p>
    </article>
  );
}
