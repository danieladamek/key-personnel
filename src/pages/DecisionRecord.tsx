import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import pathfinderJson from '@/data/pathfinder.json';
import { SLUG } from '@/lib/data';
import { loadConstraints, loadLevers, loadStages, useAsync } from '@/lib/heavy';
import { rank } from '@/lib/pathfinder';
import { emptyRecords, fromFile, normaliseRecords, recordsReducer, toJson, toMarkdown, type DecisionRecord as DR, type RecordsState } from '@/lib/decision-record';
import { downloadBlob } from '@/components/figures/download';
import { EvidenceBlock } from '@/components/records/RecordParts';
import { GradeChip } from '@/components/records/Bits';
import { loadAnswers } from './Home';
import type { Pathfinder } from '@/types';

const pf = pathfinderJson as unknown as Pathfinder;
const KEY = `${SLUG}:decision-records`;
const load = (): RecordsState => { try { const raw = localStorage.getItem(KEY); return raw ? normaliseRecords(JSON.parse(raw)) : emptyRecords(); } catch { return emptyRecords(); } };
const answerLabel = (q: string, tag: string) => pf.questions.find((x) => x.id === q)?.options.find((o) => o.tag === tag)?.label ?? tag;

/**
 * `/record` — the decision record (KICKOFF §4b). One record per opening, several allowed, all in this browser only;
 * exported as Markdown or JSON and imported back. It holds what the person typed and pinned; it scores nothing.
 */
export default function DecisionRecord() {
  const [state, dispatch] = useReducer((s: RecordsState, a: Parameters<typeof recordsReducer>[1]) => recordsReducer(s, a), undefined, load);
  const [sp, setSp] = useSearchParams();
  const [sel, setSel] = useState<string | null>(null);
  const constraints = useAsync(loadConstraints);
  const levers = useAsync(loadLevers);
  const stages = useAsync(loadStages);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* blocked */ } }, [state]);
  const createdFromLink = useRef(false);
  const newFromPathfinder = () => {
    const answers = loadAnswers();
    const field = rank(pf, answers).map((r) => r.id);
    const id = `r-${Date.now().toString(36)}`;
    dispatch({ type: 'create', id, answers, field });
    setSel(id);
  };
  useEffect(() => {
    if (sp.get('new') === 'pathfinder' && !createdFromLink.current) {
      createdFromLink.current = true;
      newFromPathfinder();
      setSp({}, { replace: true });
    }
  }, [sp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!sel && state.records.length) setSel(state.records[state.records.length - 1].id); }, [sel, state.records]);
  const r = state.records.find((x) => x.id === sel) ?? null;
  const cName = (id: string) => constraints?.find((c) => c.id === id)?.name ?? id;
  const lName = (id: string) => levers?.find((l) => l.id === id)?.name ?? id;
  const lLimits = (id: string) => (levers?.find((l) => l.id === id)?.what_it_does_not_do ?? '').replace(/\]\(#(term|cite):[^)]*\)/g, ']').replace(/\[([^\]]*)\](?!\()/g, '[$1]').replace(/\\\$/g, '$');

  const exportMd = (x: DR) => downloadBlob(new Blob([toMarkdown(x, { constraint: cName, lever: lName, limits: lLimits, answer: answerLabel })], { type: 'text/markdown;charset=utf-8' }), `${SLUG}-decision-${x.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`);
  const exportJson = (x: DR) => downloadBlob(new Blob([toJson(x)], { type: 'application/json' }), `${SLUG}-decision-${x.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`);
  const importFiles = async (fs: FileList) => {
    let count = 0;
    for (const f of Array.from(fs)) { const recs = fromFile(await f.text()); count += recs.length; dispatch({ type: 'import', records: recs }); if (recs[0]) setSel(recs[0].id); }
    setMsg(count ? `Imported ${count} record${count === 1 ? '' : 's'}.` : 'No decision record found in that file.');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl sm:text-4xl">Decision record</h1>
      <p className="bx-prose mt-2 max-w-3xl">One record per opening: the pathfinder answers that produced the field, the constraints pinned from it, the levers chosen (each with what it has not been shown to do), the customer decision needed, an owner, a date and a measure. It holds only what is typed or pinned here.</p>
      <p className="mt-2 text-sm font-semibold" data-testid="record-local-note">Stays in this browser: nothing on this page is sent anywhere, and no one else can see it. Export to keep a copy.</p>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button type="button" className="bx-btn-primary" onClick={newFromPathfinder} data-testid="new-record">New record from my pathfinder answers</button>
        <button type="button" className="bx-btn" onClick={() => fileRef.current?.click()}>Import (.md or .json)</button>
        <input ref={fileRef} type="file" accept=".md,.json,application/json,text/markdown" className="sr-only" aria-label="Import a decision record" data-testid="import-record" onChange={(e) => { const fs = e.target.files; if (fs?.length) void importFiles(fs); e.target.value = ''; }} />
        {msg && <span className="text-sm" role="status">{msg}</span>}
      </div>

      {state.records.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Records">
          {state.records.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === sel} className={`bx-btn ${x.id === sel ? 'bx-btn-on' : ''}`} onClick={() => setSel(x.id)}>{x.name}</button>)}
        </div>
      )}
      {!r && <p className="mt-6 bx-muted">No record yet. The <Link className="underline" to="/">pathfinder</Link> produces the field a record starts from.</p>}
      {r && (
        <section className="mt-5 grid gap-5" data-testid="record-editor" aria-label={`Decision record ${r.name}`}>
          <label className="block max-w-lg"><span className="block text-xs bx-muted mb-1">Name of the opening</span><input className="bx-input" value={r.name} onChange={(e) => dispatch({ type: 'update', id: r.id, patch: { name: e.target.value } })} data-testid="record-name" /></label>

          <div>
            <h2 className="text-xl">The pathfinder answers</h2>
            <ul className="text-sm mt-1 list-disc pl-5">
              {r.answers.pattern && <li>Seeing: {answerLabel('pattern', r.answers.pattern)}</li>}
              {r.answers.stage && <li>Stage: {answerLabel('stage', r.answers.stage)}</li>}
              {(r.answers.conditions ?? []).map((c) => <li key={c}>Condition: {answerLabel('conditions', c)}</li>)}
              {r.answers.state && <li>State: {answerLabel('state', r.answers.state)}</li>}
              {!r.answers.pattern && !r.answers.stage && !(r.answers.conditions ?? []).length && !r.answers.state && <li className="bx-muted">No answers were recorded when this record was made.</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-xl">The field ({r.field.length})</h2>
            <p className="text-xs bx-muted">The constraints the answers matched, in rank order (a count of matches, not advice). Each can be pinned as primary or secondary.</p>
            <ul className="mt-2 grid gap-1.5" data-testid="record-field">
              {r.field.map((cid) => {
                const as = r.primary.includes(cid) ? 'primary' : r.secondary.includes(cid) ? 'secondary' : null;
                return (
                  <li key={cid} className="flex flex-wrap items-center gap-2 text-sm" data-testid={`field-${cid}`}>
                    <Link to={`/constraints/${cid}`} className="underline flex-1 min-w-[12rem]">{cName(cid)}</Link>
                    <button type="button" className={`bx-btn !py-0.5 text-xs ${as === 'primary' ? 'bx-btn-on' : ''}`} aria-pressed={as === 'primary'} onClick={() => dispatch(as === 'primary' ? { type: 'unpin', id: r.id, constraint: cid } : { type: 'pin', id: r.id, constraint: cid, as: 'primary' })} data-testid={`pin-primary-${cid}`}>Primary</button>
                    <button type="button" className={`bx-btn !py-0.5 text-xs ${as === 'secondary' ? 'bx-btn-on' : ''}`} aria-pressed={as === 'secondary'} onClick={() => dispatch(as === 'secondary' ? { type: 'unpin', id: r.id, constraint: cid } : { type: 'pin', id: r.id, constraint: cid, as: 'secondary' })} data-testid={`pin-secondary-${cid}`}>Secondary</button>
                  </li>
                );
              })}
              {!r.field.length && <li className="text-sm bx-muted">The answers matched no constraint.</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-xl">Levers</h2>
            <p className="text-xs bx-muted">The levers of the pinned constraints, in the records’ own order, each with its evidence grade and what it does not do.</p>
            {(() => {
              const pinned = [...r.primary, ...r.secondary];
              const offered = [...new Set(pinned.flatMap((cid) => constraints?.find((c) => c.id === cid)?.levers ?? []))];
              if (!pinned.length) return <p className="text-sm bx-muted mt-1">The levers appear once a constraint is pinned.</p>;
              return (
                <ul className="mt-2 grid gap-3" data-testid="record-levers">
                  {offered.map((lid) => {
                    const l = levers?.find((x) => x.id === lid);
                    const on = r.levers.includes(lid);
                    return (
                      <li key={lid} className="grid gap-1">
                        <label className="flex items-start gap-2 text-sm font-semibold"><input type="checkbox" className="mt-1" checked={on} onChange={() => dispatch({ type: on ? 'unchoose' : 'choose', id: r.id, lever: lid })} data-testid={`choose-${lid}`} />{l?.name ?? lid} {l && <GradeChip grade={l.evidence.grade} />}</label>
                        {l && on && <div className="pl-6"><EvidenceBlock lever={l} compact /></div>}
                        {l && !on && <p className="pl-6 text-xs bx-muted">What it does not do is shown once chosen, and on <Link className="underline" to={`/levers/${l.id}`}>the lever’s page</Link>.</p>}
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="block text-xs bx-muted mb-1">Customer decision needed</span><textarea className="bx-input min-h-[4.5rem]" value={r.customer_decision} onChange={(e) => dispatch({ type: 'update', id: r.id, patch: { customer_decision: e.target.value } })} data-testid="record-customer" /></label>
            <label className="block"><span className="block text-xs bx-muted mb-1">Owner</span><input className="bx-input" value={r.owner} onChange={(e) => dispatch({ type: 'update', id: r.id, patch: { owner: e.target.value } })} data-testid="record-owner" /></label>
            <label className="block"><span className="block text-xs bx-muted mb-1">Decision date</span><input type="date" className="bx-input" value={r.decision_date} onChange={(e) => dispatch({ type: 'update', id: r.id, patch: { decision_date: e.target.value } })} data-testid="record-date" /></label>
            <MeasureField r={r} stages={stages} constraints={constraints} onChange={(v) => dispatch({ type: 'update', id: r.id, patch: { measure: v } })} />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[color:var(--bx-line)] pt-3">
            <button type="button" className="bx-btn" onClick={() => exportMd(r)} data-testid="export-record-md">Export Markdown</button>
            <button type="button" className="bx-btn" onClick={() => exportJson(r)} data-testid="export-record-json">Export JSON</button>
            <button type="button" className="bx-btn ml-auto" onClick={() => { if (confirm(`Delete the record “${r.name}” from this browser?`)) { dispatch({ type: 'remove', id: r.id }); setSel(null); } }}>Delete</button>
          </div>
        </section>
      )}
    </div>
  );
}

function MeasureField({ r, stages, constraints, onChange }: { r: DR; stages?: { id: string; metrics: { id: string; definition: string }[] }[]; constraints?: { id: string; stage: string }[]; onChange: (v: string) => void }) {
  const suggestions = useMemo(() => {
    const st = new Set([...r.primary, ...r.secondary].map((c) => constraints?.find((x) => x.id === c)?.stage).filter(Boolean) as string[]);
    if (r.answers.stage) st.add(r.answers.stage);
    return (stages ?? []).filter((s) => st.has(s.id)).flatMap((s) => s.metrics.map((m) => `${m.id.replace(/-/g, ' ')} (${s.id})`));
  }, [r, stages, constraints]);
  return (
    <div className="sm:col-span-2">
      <label className="block"><span className="block text-xs bx-muted mb-1">Measure</span><input className="bx-input" list="measure-suggestions" value={r.measure} onChange={(e) => onChange(e.target.value)} data-testid="record-measure" /></label>
      <datalist id="measure-suggestions">{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
      {suggestions.length > 0 && <p className="text-xs bx-muted mt-1">The stage metrics offered as suggestions: {suggestions.join(' · ')}.</p>}
    </div>
  );
}
