import { useEffect, useState } from 'react';

import { assetUrl, GEO_LABEL, longDate, manifest, SERIES_CONFIRMED_LABEL } from '@/lib/data';
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
  const conf = <span className="bx-chip border border-[color:var(--bx-line)] bx-muted ml-1" data-testid="series-confirmed">{SERIES_CONFIRMED_LABEL[i.series_confirmed ?? 'none']}</span>;
  if (bls === undefined) return <p className="text-xs bx-muted" role="status">Series {i.series}{conf} · checking for a refreshed value…</p>;
  const row = bls?.series.find((s) => s.series === i.series);
  if (!bls || !row) return <p className="text-xs bx-muted" data-testid="no-refresh">Series <code>{i.series}</code>{conf} · no refreshed value in this build; the pack’s figure stands.</p>;
  if (row.status !== 'ok' || row.value === null) return <p className="text-xs" data-testid="refresh-failed">Series <code>{i.series}</code>{conf} · <span className="bx-todo">the BLS request failed at the last refresh ({row.error ?? row.status})</span>; the pack’s figure stands.</p>;
  return (
    <p className="text-sm border-l-2 border-[color:var(--bx-accent)] pl-2" data-testid="refreshed-value">
      <span className="font-semibold">{row.value}</span> <span className="bx-muted">· {row.periodName ? `${row.periodName} ` : ''}{row.year ?? ''}{row.period ? ` (${row.period})` : ''}</span>
      <span className="block text-xs bx-muted">BLS, refreshed {longDate(bls.fetchedAt)} · series <code>{i.series}</code>{conf} · shown beside the pack’s figure, which is unchanged</span>
    </p>
  );
}

/** The Numbers grouping (EXTENSIONS v0.3): National · Alabama · Huntsville area · Defense industry. Untagged records read as U.S., all sectors. */
const GROUPS: { id: string; label: string; test: (i: Indicator) => boolean }[] = [
  { id: 'national', label: 'National', test: (i) => (i.geo ?? 'us') === 'us' && (i.sector ?? 'all') === 'all' },
  { id: 'alabama', label: 'Alabama', test: (i) => i.geo === 'al' && (i.sector ?? 'all') === 'all' },
  { id: 'huntsville', label: 'Huntsville area', test: (i) => i.geo === 'huntsville-msa' && (i.sector ?? 'all') === 'all' },
  { id: 'defense', label: 'Defense industry', test: (i) => i.sector === 'defense' },
];

/** One indicator; where it has a counterpart, the twin's figure sits in the same card ("Alabama 3.5% · U.S. 4.2%"). */
function Card({ i, twin, bls }: { i: Indicator; twin?: Indicator; bls: BlsLatest | null | undefined }) {
  return (
    <li id={i.id} className="bx-card p-3 scroll-mt-28 grid gap-1.5 content-start" data-testid={`indicator-${i.id}`}>
      <div className="flex items-start justify-between gap-2"><h3 className="text-base font-display font-semibold leading-snug">{i.name}</h3><NoteButton anchor={{ type: 'indicators', id: i.id }} label={i.name} /></div>
      <p><span className="text-2xl font-display font-semibold" data-testid="pack-value">{i.value}</span> <span className="text-sm bx-muted">{GEO_LABEL[i.geo ?? 'us']} · {i.reference_period}</span></p>
      {i.counterpart && (twin ? (
        <p className="text-sm border-l-2 border-[color:var(--bx-line)] pl-2" data-testid="counterpart">
          <span className="font-semibold">{GEO_LABEL[i.geo ?? 'us']} {i.value}</span> · <a className="underline" href={`#${twin.id}`}>{GEO_LABEL[twin.geo ?? 'us']} {twin.value}</a>
          <span className="block text-xs bx-muted">beside: {twin.name}, {twin.reference_period} ({twin.publisher})</span>
        </p>
      ) : <p className="text-xs"><span className="bx-todo">counterpart {i.counterpart} is not an indicator record</span></p>)}
      {!i.counterpart && typeof i.counterpart_note === 'string' && <p className="text-xs bx-muted" data-testid="counterpart-note">No national twin shown: {i.counterpart_note}</p>}
      <p className="text-xs bx-muted">{i.publisher} · published {i.published}</p>
      {i.note && <div className="text-sm"><Prose md={i.note} /></div>}
      <CiteList ns={i.sources} />
      <Refreshed i={i} bls={bls} />
      <p className="flex flex-wrap gap-1">{i.stages.map((st) => <StageChip key={st} stage={st} />)}</p>
    </li>
  );
}

/**
 * `/benchmarks` (KICKOFF §4b, §4c): the indicators as cards — name, value, reference period, publisher, published,
 * note, citation, the stages they serve — with the BLS series and its refreshed value beside the pack's where a series
 * exists. Grouped by geography and sector (EXTENSIONS v0.3), each counterpart beside its twin.
 */
export default function Benchmarks() {
  const all = useAsync(loadIndicators);
  const bls = useBlsLatest();
  const refresh = (manifest.extensions as { refresh?: { bls_api?: string } }).refresh?.bls_api ?? '';
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Benchmarks</h1>
      <p className="bx-prose mt-2 max-w-3xl">The headline figures the records lean on, each with its reference period, publisher and publication date. None is timeless. They are grouped as national, Alabama, Huntsville area and defense-industry figures; a state or local figure that has a national twin is always shown beside it.</p>
      <p className="mt-2 text-sm max-w-3xl" data-testid="refresh-rule"><span className="font-semibold">The refresh rule: </span>{refresh}.</p>
      {bls === null && <p className="mt-2 text-sm bx-card p-2 max-w-3xl" data-testid="bls-degraded">This build carries no refreshed BLS file (a local build, or the refresh did not run), so every card shows the pack’s figure alone.</p>}
      {bls && <p className="mt-2 text-sm max-w-3xl" data-testid="bls-fetched">BLS series last refreshed {longDate(bls.fetchedAt)}, when the site was built; this page reads that file from the site itself and makes no call to BLS.</p>}
      <div className="grid gap-2 md:grid-cols-2"><ReaderFigure id="clearance-clock" /><ReaderFigure id="cost-of-a-hire" /></div>
      {!all && <p className="bx-muted mt-4" role="status">Loading…</p>}
      {GROUPS.map((g) => {
        const list = (all ?? []).filter(g.test);
        if (!list.length) return null;
        return (
          <section key={g.id} className="mt-8" aria-labelledby={`bg-${g.id}`} data-testid={`numbers-${g.id}`}>
            <h2 id={`bg-${g.id}`} className="text-2xl">{g.label} <span className="bx-muted text-base font-body">({list.length})</span></h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {list.map((i) => <Card key={i.id} i={i} twin={all?.find((x) => x.id === i.counterpart)} bls={bls} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
