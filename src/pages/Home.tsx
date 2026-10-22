import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pathfinderJson from '@/data/pathfinder.json';
import homeJson from '@/data/home.json';
import { AS_OF, asOfLong, CONCEPTS_LABEL, conceptsIndex, manifest, OVERLAY_LABEL, OVERLAYS, PENDING_TAG, recordedDate, SLUG, stageColour, STAGES, STATUS_WORD } from '@/lib/data';
import { fieldOf, groupByStage, hasAnyAnswer, hasScoringAnswer, notAdviceClause, rank, type Answers } from '@/lib/pathfinder';
import { loadStates } from '@/lib/heavy';
import type { HomeData, Pathfinder, StateRecord } from '@/types';
// markdown (and the citation machinery) stays out of the entry chunk; the overlay text fills in when it arrives
const Prose = lazy(() => import('@/components/records/Prose'));

const pf = pathfinderJson as unknown as Pathfinder;
const home = homeJson as unknown as HomeData;
export const ANSWERS_KEY = `${SLUG}:pathfinder-answers`;

export function loadAnswers(): Answers {
  try { const raw = localStorage.getItem(ANSWERS_KEY); return raw ? (JSON.parse(raw) as Answers) : {}; } catch { return {}; }
}
const q = (id: string) => pf.questions.find((x) => x.id === id)!;

/** An evidence grade as a quiet chip — information, not a ranking. */
export const GradeChip = ({ grade }: { grade: string }) => <span className="bx-tier" data-testid="grade-chip">{grade}</span>;

/**
 * `/` — the pathfinder (KICKOFF §4b). The pack's four questions as one short form; answers live in localStorage only.
 * Constraints are ranked by `pathfinder.rule` exactly as written and grouped by stage in stage order, each with why
 * it matched in the question labels' words, its levers (name, grade) and its gates. No other score, nothing labelled
 * best or recommended. The state answer opens the overlay panel and adds nothing to the score.
 */
export default function Home() {
  const [answers, setAnswers] = useState<Answers>(loadAnswers);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      if (hasAnyAnswer(answers)) localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
      else localStorage.removeItem(ANSWERS_KEY);
    } catch { /* storage blocked: answers live for this visit only */ }
  }, [answers]);
  const ranked = useMemo(() => rank(pf, answers), [answers]);
  const groups = useMemo(() => groupByStage(ranked, STAGES), [ranked]);
  const field = useMemo(() => fieldOf(ranked, home.constraints), [ranked]);
  const cById = useMemo(() => new Map(home.constraints.map((c) => [c.id, c])), []);
  const any = hasAnyAnswer(answers);
  const scoring = hasScoringAnswer(answers);
  const setOne = (k: 'pattern' | 'stage' | 'state', v: string | null) => setAnswers((a) => ({ ...a, [k]: v ?? undefined }));
  const toggleCond = (t: string) => setAnswers((a) => {
    const cur = new Set(a.conditions ?? []);
    if (cur.has(t)) cur.delete(t); else cur.add(t);
    return { ...a, conditions: [...cur] };
  });
  const clear = () => { try { localStorage.removeItem(ANSWERS_KEY); } catch { /* ignore */ } setAnswers({}); };
  const clause = notAdviceClause(pf.rule);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="flex flex-wrap items-center gap-2">
        <span className="bx-chip border border-[color:var(--bx-line)] bx-muted" data-testid="commissioned-badge">COMMISSIONED GUIDE — NOT PEER REVIEWED · NOT ADVICE</span>
        <span className="bx-asof" data-testid="home-asof">Current as of {AS_OF}</span>
      </p>
      <h1 className="text-3xl sm:text-5xl leading-tight mt-3">Key Personnel</h1>
      <p className="mt-2 text-lg font-display leading-snug max-w-4xl">{manifest.title.replace(/^Key Personnel:\s*/, '').replace(/^./, (c) => c.toUpperCase())}</p>
      <p className="bx-prose mt-3 max-w-3xl">{manifest.question}</p>

      <section className="bx-card p-4 sm:p-5 mt-6" aria-labelledby="pf-h" data-testid="pathfinder">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="pf-h" className="text-2xl">The opening, in four questions</h2>
          <button type="button" className="bx-btn" onClick={clear} disabled={!any} data-testid="clear-answers">Clear my answers</button>
        </div>
        <p className="text-xs bx-muted mt-1" data-testid="pf-note">{pf.note}</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <fieldset className="min-w-0" data-testid="q-pattern">
            <legend className="font-semibold text-sm">{q('pattern').prompt}</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {q('pattern').options.map((o) => {
                const id = `opt-pattern-${o.tag ?? 'none'}`;
                const checked = (answers.pattern ?? null) === o.tag;
                return (
                  <label key={id} htmlFor={id} className={`bx-btn cursor-pointer !py-1 text-left ${checked ? 'bx-btn-on' : ''}`}>
                    <input id={id} className="sr-only" type="radio" name="pattern" checked={checked} onChange={() => setOne('pattern', o.tag)} data-testid={id} />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="min-w-0" data-testid="q-stage">
            <legend className="font-semibold text-sm">{q('stage').prompt}</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {q('stage').options.map((o) => {
                const id = `opt-stage-${o.tag ?? 'none'}`;
                const checked = (answers.stage ?? null) === o.tag;
                return (
                  <label key={id} htmlFor={id} className={`bx-btn cursor-pointer !py-1 text-left ${checked ? 'bx-btn-on' : ''}`}>
                    <input id={id} className="sr-only" type="radio" name="stage" checked={checked} onChange={() => setOne('stage', o.tag)} data-testid={id} />
                    {o.tag && <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: stageColour(o.tag) }} />}
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="min-w-0" data-testid="q-conditions">
            <legend className="font-semibold text-sm">{q('conditions').prompt} <span className="font-normal bx-muted">(any that apply)</span></legend>
            <div className="mt-1.5 grid gap-1">
              {q('conditions').options.filter((o) => o.tag).map((o) => {
                const id = `opt-conditions-${o.tag}`;
                const checked = (answers.conditions ?? []).includes(o.tag!);
                return (
                  <label key={id} htmlFor={id} className="flex items-start gap-2 text-sm cursor-pointer rounded px-1 py-0.5 hover:bg-paper-2 dark:hover:bg-night-2">
                    <input id={id} type="checkbox" className="mt-1" checked={checked} onChange={() => toggleCond(o.tag!)} data-testid={id} />
                    <span>{o.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="min-w-0" data-testid="q-state">
            <label htmlFor="pf-state" className="font-semibold text-sm block">{q('state').prompt}</label>
            <select id="pf-state" className="bx-input mt-1.5 max-w-xs" value={answers.state ?? ''} onChange={(e) => setOne('state', e.target.value || null)} data-testid="state-select">
              {q('state').options.map((o) => <option key={o.tag ?? 'none'} value={o.tag ?? ''}>{o.label}</option>)}
            </select>
            <p className="text-xs bx-muted mt-1">The state opens its nine employment-law overlays below; it adds nothing to the ranking.</p>
          </div>
        </div>
      </section>

      {answers.state && <StatePanel id={answers.state} />}

      <section className="mt-8" aria-labelledby="res-h" data-testid="pathfinder-results">
        <h2 id="res-h" className="text-2xl">The narrowed field</h2>
        <p className="text-sm mt-1 max-w-3xl" data-testid="not-advice">{clause ? `${clause.replace(/^./, (c) => c.toUpperCase())}.` : ''} The score is 3 when the pattern named points at the constraint, 2 when its stage matches, and 1 for each matching condition; constraints scoring 0 are not shown.</p>
        {!scoring && <p className="bx-muted mt-3">The ranking appears once a pattern, a stage or a condition is chosen; until then all sixty constraints stand.</p>}
        {scoring && !ranked.length && <p className="bx-muted mt-3" role="status">No constraint matches these answers.</p>}
        {scoring && ranked.length > 0 && (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold" role="status">{ranked.length} of {home.constraints.length} constraints match</span>
              <button type="button" className="bx-btn-primary" onClick={() => navigate(`/map?field=${field.join(',')}&from=pathfinder`)} data-testid="open-map-field">Open the map with this field highlighted</button>
              <button type="button" className="bx-btn" onClick={() => navigate('/record?new=pathfinder')} data-testid="start-record">Start a decision record</button>
            </div>
            <div className="mt-4 grid gap-6">
              {groups.map((g) => (
                <section key={g.stage} aria-label={`Stage: ${home.stages.find((s) => s.id === g.stage)?.name}`} data-testid={`result-stage-${g.stage}`}>
                  <h3 className="text-lg flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(g.stage) }} /><Link to={`/stages/${g.stage}`} className="hover:underline">{home.stages.find((s) => s.id === g.stage)?.name}</Link></h3>
                  <ul className="mt-2 grid gap-2">
                    {g.items.map((r) => {
                      const c = cById.get(r.id);
                      return (
                        <li key={r.id} className="bx-card p-3" data-testid={`result-${r.id}`}>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <Link to={`/constraints/${r.id}`} className="font-semibold hover:underline">{c?.name ?? r.id}</Link>
                            <span className="text-xs bx-muted tabular-nums" title="the match count under the pathfinder rule">{r.score} {r.score === 1 ? 'match point' : 'match points'}</span>
                          </div>
                          <p className="text-xs mt-1" data-testid="match-reasons"><span className="bx-muted">Matched on: </span>{r.reasons.map((x, i) => <span key={i}>{i > 0 && ' · '}{x.question === 'pattern' ? 'the pattern ' : x.question === 'stage' ? 'the stage ' : 'the condition '}“{x.label}” (+{x.points})</span>)}</p>
                          <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                            <div><span className="font-semibold">Levers: </span>{(c?.levers ?? []).length ? (c?.levers ?? []).map((l, i) => <span key={l}>{i > 0 && ' · '}<Link to={`/levers/${l}`} className="underline">{home.levers[l]?.name ?? l}</Link> <GradeChip grade={home.levers[l]?.grade ?? '—'} /></span>) : <span className="bx-muted">none recorded</span>}</div>
                            <div><span className="font-semibold">Gates: </span>{(c?.gates ?? []).length ? (c?.gates ?? []).map((gid, i) => <span key={gid}>{i > 0 && ' · '}<Link to={`/gates/${gid}`} className="underline">{home.gates[gid]?.name ?? gid}</Link></span>) : <span className="bx-muted">none recorded</span>}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-10" aria-labelledby="stages-h">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="stages-h" className="text-2xl">The nine stages</h2>
          <Link to="/figures/stage-map" className="text-sm underline">The same organisation as a picture: Figure 5, the stage map →</Link>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {home.stages.map((s) => (
            <li key={s.id}>
              <Link to={`/stages/${s.id}`} className="bx-card p-3 block hover:bg-paper-2 dark:hover:bg-night-2 h-full" data-testid={`stage-card-${s.id}`}>
                <span className="flex items-center gap-2"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: stageColour(s.id) }} /><span className="text-xs bx-muted">Stage {s.order}</span></span>
                <span className="block font-display text-lg font-semibold mt-0.5">{s.name}</span>
                <span className="block text-xs bx-muted">{s.constraints} constraints · {s.gates} gates · {s.patterns.length} failure pattern{s.patterns.length === 1 ? '' : 's'}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="changed-h" data-testid="changes-strip">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="changed-h" className="text-2xl">What changed</h2>
          <Link to="/changes" className="text-sm underline">The dated ledger →</Link>
        </div>
        <ul className="mt-2 grid gap-1.5">
          {home.changes.map((c) => (
            <li key={c.id} className="text-sm flex flex-wrap gap-2 items-baseline">
              <span className="bx-chip bg-paper-2 dark:bg-night-2 tabular-nums">{recordedDate(c.date)}</span>
              <span className="bx-status">{STATUS_WORD[c.status] ?? c.status}</span>
              <Link to={`/changes#${c.id}`} className="underline">{c.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2" aria-label="About this guide">
        <div>
          <h2 className="text-2xl">The guide</h2>
          <p className="bx-prose mt-2">{manifest.plain_abstract}</p>
          <p className="mt-3 flex flex-wrap gap-2 items-center"><Link to="/read" className="bx-btn-primary">Start reading</Link><span className="text-sm bx-muted">about {manifest.reading_minutes} minutes · current as of {asOfLong()}</span></p>
        </div>
        <div>
          <h2 className="text-2xl">{CONCEPTS_LABEL} to know first</h2>
          <ul className="mt-2 grid gap-1.5">
            {conceptsIndex.map((c) => <li key={c.id}><Link to={`/concepts/${c.id}`} className="underline font-semibold">{c.title}</Link></li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}

/** The state overlay panel: the nine overlays of the chosen state, each with its status word and its tag. */
function StatePanel({ id }: { id: string }) {
  const [st, setSt] = useState<StateRecord | null | undefined>();
  useEffect(() => { let live = true; setSt(undefined); loadStates().then((all) => { if (live) setSt(all.find((s) => s.id === id) ?? null); }); return () => { live = false; }; }, [id]);
  if (st === undefined) return <p className="mt-4 bx-muted" role="status">Loading the state overlays…</p>;
  if (st === null) return <p className="mt-4"><span className="bx-todo">no state record {id}</span></p>;
  const tagged = OVERLAYS.filter((o) => st[o].primary_pending).length;
  return (
    <section className="bx-card p-4 mt-4" aria-labelledby="sp-h" data-testid="state-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sp-h" className="text-xl">{st.state}: nine overlays</h2>
        <Link to={`/states/${st.id}`} className="text-sm underline">The state page →</Link>
      </div>
      <p className="text-xs bx-muted mt-1">{tagged} of 9 overlays are {PENDING_TAG}. As of {st.as_of}.</p>
      <ul className="mt-2 grid gap-2 md:grid-cols-3">
        {OVERLAYS.map((o) => (
          <li key={o} className="text-sm border-l-2 border-[color:var(--bx-line)] pl-2" data-testid={`overlay-${o}`}>
            <p className="font-semibold">{OVERLAY_LABEL[o]} <span className="bx-status">{st[o].status}</span></p>
            {st[o].primary_pending && <p><span className="bx-todo" data-testid="pending-tag">{PENDING_TAG}</span></p>}
            <Suspense fallback={null}><Prose md={st[o].text} className="text-[13px] mt-0.5" /></Suspense>
          </li>
        ))}
      </ul>
    </section>
  );
}
