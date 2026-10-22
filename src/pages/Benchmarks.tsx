import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl, longDate, manifest, stageColour, stageLabel, STAGES } from '@/lib/data';
import { loadIndicators, useAsync } from '@/lib/heavy';
import type { BlsLatest, Indicator } from '@/types';
import Prose from '@/components/records/Prose';
import CiteList from '@/components/records/CiteList';
import NoteButton from '@/components/notepad/NoteButton';
import { StageChip } from '@/components/records/Bits';
import ReaderFigure from '@/components/reader/ReaderFigure';

/**
 * The refreshed BLS values (KICKOFF §4c) ship as a static file in this site, written by the scheduled workflow at build
 * time; the page reads that file from its own origin and never calls BLS. A local build has no file, and the page
 * then shows the pack's values alone and says so.
 */
export function useBlsLatest(): BlsLatest | null | undefined {
  const [d, setD] = useState<BlsLatest | null | undefined>();
  useEffect(() => {
    let live = true;
    fetch(assetUrl('data/benchmarks/latest.json'), { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: BlsLatest | null) => { if (live) setD(j && Array.isArray(j.series) ? j : null); })
      .catch(() => { if (live) setD(null); });
    return () => { live = false; };
  }, []);
  return d;
}

function Refreshed({ i, bls }: { i: Indicator; bls: BlsLatest | null | undefined }) {
  if (!i.series) return <p className="text-xs bx-muted" data-testid="hand-updated">No BLS series: hand-updated from the cited source.</p>;
  if (bls === undefined) return <p className="text-xs bx-muted" role="status">Series {i.series} · checking for a refreshed value…</p>;
  const row = bls?.series.find((s) => s.series === i.series);
  if (!bls || !row) return <p className="text-xs bx-muted" data-testid="no-refresh">Series <code>{i.series}</code> · no refreshed value in this build; the pack’s figure stands.</p>;
  if (row.status !== 'ok' || row.value === null) return <p className="text-xs" data-testid="refresh-failed">Series <code>{i.series}</code> · <span className="bx-todo">the BLS request failed at the last refresh ({row.error ?? row.status})</span>; the pack’s figure stands.</p>;
  return (
    <p className="text-sm border-l-2 border-[color:var(--bx-accent)] pl-2" data-testid="refreshed-value">
      <span className="font-semibold">{row.value}</span> <span className="bx-muted">· {row.periodName ? `${row.periodName} ` : ''}{row.year ?? ''}{row.period ? ` (${row.period})` : ''}</span>
      <span className="block text-xs bx-muted">BLS, refreshed {longDate(bls.fetchedAt)} · series <code>{i.series}</code> · shown beside the pack’s figure, which is unchanged</span>
    </p>
  );
}

/**
 * `/benchmarks` (KICKOFF §4b, §4c): the indicators as cards — name, value, reference period, publisher, published,
 * note, citation, the stages they serve — with the BLS series and its refreshed value beside the pack's where a series
 * exists. Grouped by stage (each indicator under the first stage it lists).
 */
export default function Benchmarks() {
  const all = useAsync(loadIndicators);
  const bls = useBlsLatest();
  const refresh = (manifest.extensions as { refresh?: { bls_api?: string } }).refresh?.bls_api ?? '';
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Benchmarks</h1>
      <p className="bx-prose mt-2 max-w-3xl">The headline figures the records lean on, each with its reference period, publisher and publication date. None is timeless.</p>
      <p className="mt-2 text-sm max-w-3xl" data-testid="refresh-rule"><span className="font-semibold">The refresh rule: </span>{refresh}.</p>
      {bls === null && <p className="mt-2 text-sm bx-card p-2 max-w-3xl" data-testid="bls-degraded">This build carries no refreshed BLS file (a local build, or the refresh did not run), so every card shows the pack’s figure alone.</p>}
      {bls && <p className="mt-2 text-sm max-w-3xl" data-testid="bls-fetched">BLS series last refreshed {longDate(bls.fetchedAt)}, when the site was built; this page reads that file from the site itself and makes no call to BLS.</p>}
      <div className="grid gap-2 md:grid-cols-2"><ReaderFigure id="clearance-clock" /><ReaderFigure id="cost-of-a-hire" /></div>
      {!all && <p className="bx-muted mt-4" role="status">Loading…</p>}
      {STAGES.map((s) => {
        const list = (all ?? []).filter((i) => (i.stages[0] ?? 'plan') === s);
        if (!list.length) return null;
        return (
          <section key={s} className="mt-8" aria-labelledby={`bs-${s}`}>
            <h2 id={`bs-${s}`} className="text-2xl flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(s) }} /><Link to={`/stages/${s}`} className="hover:underline">{stageLabel(s)}</Link></h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {list.map((i) => (
                <li key={i.id} id={i.id} className="bx-card p-3 scroll-mt-28 grid gap-1.5 content-start" data-testid={`indicator-${i.id}`}>
                  <div className="flex items-start justify-between gap-2"><h3 className="text-base font-display font-semibold leading-snug">{i.name}</h3><NoteButton anchor={{ type: 'indicators', id: i.id }} label={i.name} /></div>
                  <p><span className="text-2xl font-display font-semibold" data-testid="pack-value">{i.value}</span> <span className="text-sm bx-muted">{i.reference_period}</span></p>
                  <p className="text-xs bx-muted">{i.publisher} · published {i.published}</p>
                  {i.note && <div className="text-sm"><Prose md={i.note} /></div>}
                  <CiteList ns={i.sources} />
                  <Refreshed i={i} bls={bls} />
                  <p className="flex flex-wrap gap-1">{i.stages.map((st) => <StageChip key={st} stage={st} />)}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
