/**
 * The decision record (KICKOFF §4b `/record`, an APP-SPEC §3.1 notepad extension): one record per opening — a name,
 * the pathfinder answers that produced the field, primary and secondary constraints pinned from that field, the levers
 * chosen, the customer decision needed, owner, decision date and measure. Browser-local; several may exist; none is
 * shared. Pure state + serialisation, so it is unit-tested; the page persists it in localStorage only.
 */
import type { Answers } from './pathfinder';

export interface DecisionRecord {
  id: string;
  name: string;
  created: string;
  updated: string;
  answers: Answers;
  /** the ranked constraint ids the answers produced, in rank order */
  field: string[];
  primary: string[];
  secondary: string[];
  levers: string[];
  customer_decision: string;
  owner: string;
  decision_date: string;
  measure: string;
}
export interface RecordsState { version: 1; records: DecisionRecord[] }
export const emptyRecords = (): RecordsState => ({ version: 1, records: [] });

export type RecordAction =
  | { type: 'create'; id?: string; name?: string; answers?: Answers; field?: string[] }
  | { type: 'update'; id: string; patch: Partial<Pick<DecisionRecord, 'name' | 'customer_decision' | 'owner' | 'decision_date' | 'measure'>> }
  | { type: 'pin'; id: string; constraint: string; as: 'primary' | 'secondary' }
  | { type: 'unpin'; id: string; constraint: string }
  | { type: 'choose'; id: string; lever: string }
  | { type: 'unchoose'; id: string; lever: string }
  | { type: 'remove'; id: string }
  | { type: 'import'; records: DecisionRecord[] }
  | { type: 'replace'; state: RecordsState };

let n = 0;
export const newRecordId = () => `r-${Date.now().toString(36)}-${(n = (n + 1) % 1e6).toString(36)}`;

export function recordsReducer(state: RecordsState, a: RecordAction, now: () => string = () => new Date().toISOString()): RecordsState {
  const t = now();
  const edit = (id: string, f: (r: DecisionRecord) => DecisionRecord) => ({ ...state, records: state.records.map((r) => (r.id === id ? { ...f(r), updated: t } : r)) });
  switch (a.type) {
    case 'create': {
      const r: DecisionRecord = {
        id: a.id ?? newRecordId(), name: a.name ?? `Opening ${state.records.length + 1}`, created: t, updated: t,
        answers: a.answers ?? {}, field: a.field ?? [], primary: [], secondary: [], levers: [],
        customer_decision: '', owner: '', decision_date: '', measure: '',
      };
      return { ...state, records: [...state.records, r] };
    }
    case 'update': return edit(a.id, (r) => ({ ...r, ...a.patch }));
    case 'pin': return edit(a.id, (r) => {
      const primary = r.primary.filter((x) => x !== a.constraint);
      const secondary = r.secondary.filter((x) => x !== a.constraint);
      return a.as === 'primary' ? { ...r, primary: [...primary, a.constraint], secondary } : { ...r, primary, secondary: [...secondary, a.constraint] };
    });
    case 'unpin': return edit(a.id, (r) => ({ ...r, primary: r.primary.filter((x) => x !== a.constraint), secondary: r.secondary.filter((x) => x !== a.constraint) }));
    case 'choose': return edit(a.id, (r) => (r.levers.includes(a.lever) ? r : { ...r, levers: [...r.levers, a.lever] }));
    case 'unchoose': return edit(a.id, (r) => ({ ...r, levers: r.levers.filter((x) => x !== a.lever) }));
    case 'remove': return { ...state, records: state.records.filter((r) => r.id !== a.id) };
    case 'import': {
      const byId = new Map(state.records.map((r) => [r.id, r]));
      for (const r of a.records) { const prev = byId.get(r.id); if (!prev || prev.updated < r.updated) byId.set(r.id, r); }
      return { ...state, records: [...byId.values()] };
    }
    case 'replace': return normaliseRecords(a.state);
  }
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Accept anything that looks like a saved record or list of records and return valid state; junk is dropped. */
export function normaliseRecords(raw: unknown): RecordsState {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && Array.isArray((raw as RecordsState).records) ? (raw as RecordsState).records : raw && typeof raw === 'object' && 'id' in (raw as object) ? [raw] : [];
  const records = (list as Record<string, unknown>[]).filter((r) => r && typeof r === 'object' && typeof r.id === 'string').map((r) => ({
    id: str(r.id), name: str(r.name) || 'Untitled opening', created: str(r.created), updated: str(r.updated),
    answers: (r.answers && typeof r.answers === 'object' ? r.answers : {}) as Answers, field: strs(r.field), primary: strs(r.primary), secondary: strs(r.secondary), levers: strs(r.levers),
    customer_decision: str(r.customer_decision), owner: str(r.owner), decision_date: str(r.decision_date), measure: str(r.measure),
  }));
  return { version: 1, records };
}

export function toJson(r: DecisionRecord): string { return JSON.stringify({ kind: 'key-personnel-decision-record', version: 1, record: r }, null, 2); }

const MARK = 'kp-decision-record';
/**
 * Markdown export: the record in words, with each chosen lever's limits line beside it (supplied by the caller from
 * the pack), and the machine copy in a trailing comment so the file imports back.
 */
export function toMarkdown(r: DecisionRecord, names: { constraint: (id: string) => string; lever: (id: string) => string; limits: (id: string) => string; answer: (q: string, tag: string) => string }): string {
  const ans: string[] = [];
  if (r.answers.pattern) ans.push(`- What is being seen: ${names.answer('pattern', r.answers.pattern)}`);
  if (r.answers.stage) ans.push(`- Stage: ${names.answer('stage', r.answers.stage)}`);
  for (const c of r.answers.conditions ?? []) ans.push(`- Condition: ${names.answer('conditions', c)}`);
  if (r.answers.state) ans.push(`- State of work: ${names.answer('state', r.answers.state)}`);
  const lines = [
    `# Decision record — ${r.name}`, '',
    `_Kept in one browser with Key Personnel; exported ${r.updated.slice(0, 10)}. Not advice: the pathfinder field is a count of matches._`, '',
    '## Pathfinder answers', '', ...(ans.length ? ans : ['- none recorded']), '',
    '## Primary constraints', '', ...(r.primary.length ? r.primary.map((c) => `- ${names.constraint(c)} (${c})`) : ['- none pinned']), '',
    '## Secondary constraints', '', ...(r.secondary.length ? r.secondary.map((c) => `- ${names.constraint(c)} (${c})`) : ['- none pinned']), '',
    '## Levers chosen', '', ...(r.levers.length ? r.levers.flatMap((l) => [`- ${names.lever(l)} (${l})`, `  - What it does not do: ${names.limits(l)}`]) : ['- none chosen']), '',
    '## Customer decision needed', '', r.customer_decision || '—', '',
    '## Owner', '', r.owner || '—', '',
    '## Decision date', '', r.decision_date || '—', '',
    '## Measure', '', r.measure || '—', '',
    `<!-- ${MARK} ${JSON.stringify(r).replace(/--/g, '\\u002d\\u002d')} -->`, '',
  ];
  return lines.join('\n');
}

/** Read an exported file (JSON or Markdown) back into records. */
export function fromFile(text: string): DecisionRecord[] {
  const t = text.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      const j = JSON.parse(t) as { record?: unknown; records?: unknown };
      if (j && typeof j === 'object' && 'record' in j) return normaliseRecords([j.record]).records;
      return normaliseRecords(j).records;
    } catch { return []; }
  }
  const out: DecisionRecord[] = [];
  for (const m of t.matchAll(new RegExp(`<!-- ${MARK} (\\{[\\s\\S]*?\\}) -->`, 'g'))) {
    try { out.push(...normaliseRecords([JSON.parse(m[1])]).records); } catch { /* skip */ }
  }
  return out;
}
