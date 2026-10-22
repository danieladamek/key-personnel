import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadControversies, useAsync } from '@/lib/heavy';
import { scrollToId } from '@/lib/data';
import { findRecord } from '@/lib/records';
import { Link } from 'react-router-dom';
import Prose from '@/components/records/Prose';
import CiteList from '@/components/records/CiteList';
import { BlockLabel, LegacyLine, RecordHeader, Sources, synId } from '@/components/records/Bits';

/**
 * `/controversies` (KICKOFF §4b): each dispute's question, every position with its holder and citations, and
 * `what_a_recruiter_can_rely_on` rendered as a synthesis block. Linked from the constraints and levers that name it.
 */
export default function Controversies() {
  const all = useAsync(loadControversies);
  const loc = useLocation();
  useEffect(() => { if (all && loc.hash) scrollToId(loc.hash.slice(1)); }, [all, loc.hash]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Controversies</h1>
      <p className="bx-prose mt-2">The live disputes the records sit inside. Each position is named and cited as its holder put it; the last block of each is the builder’s synthesis and is marked as one.</p>
      {!all && <p className="bx-muted mt-4" role="status">Loading…</p>}
      <div className="mt-6 grid gap-8">
        {(all ?? []).map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-28" data-testid={`controversy-${c.id}`}>
            <RecordHeader title={c.name} anchor={{ type: 'controversies', id: c.id }} level={2} />
            <p className="mt-2 font-display text-lg leading-snug">{c.question}</p>
            <BlockLabel>Positions ({c.positions.length})</BlockLabel>
            <ul className="grid gap-2">
              {c.positions.map((p, i) => (
                <li key={i} className="bx-card p-3 text-sm" data-testid="position">
                  <p className="font-semibold">{p.holder}</p>
                  <Prose md={p.claim} className="mt-1" />
                  {p.sources.length > 0 && <CiteList ns={p.sources} />}
                </li>
              ))}
            </ul>
            <div className="bx-synthesis scroll-mt-28" id={synId('controversies', c.id, 'what_a_recruiter_can_rely_on')} data-testid="rely-on">
              <span className="bx-synthesis-label">synthesis · what a recruiter can rely on</span>
              <Prose md={c.what_a_recruiter_can_rely_on} />
            </div>
            {c.named_by.length > 0 && <p className="text-xs bx-muted">Named by: {c.named_by.map((k) => { const [t, id] = k.split('/'); const m = findRecord(id, [t as never]); return m ? <Link key={k} className="underline mr-2" to={m.to}>{m.title}</Link> : <span key={k} className="mr-2">{k}</span>; })}</p>}
            <LegacyLine ids={c.legacy} />
            <Sources ns={c.sources} />
          </section>
        ))}
      </div>
    </div>
  );
}
