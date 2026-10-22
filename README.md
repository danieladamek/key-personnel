# Key Personnel

What constrains filling and keeping an opening at a small technical firm whose hires must satisfy a labor category, a
key-personnel clause, a rate ceiling, a clearance or a customer's approval: sixty evidence-graded constraints, the
levers the firm can pull (each with what it has **not** been shown to do), the gates that bind, a cited dependency
map, the state overlays, and the public data behind the benchmarks.

A commissioned guide written by an AI research builder (Manuscript Interrogator 0.10) from published studies and
public government sources, current as of **2026-10-22**. **Not peer reviewed. Not legal, HR, compliance or financial
advice.** No firm is named in it or had any part in it.

Live: <https://danieladamek.github.io/key-personnel/>

## Quick start

On Daniel's machine the app opens from **`App Shortcuts/▶ Open Key Personnel.command`** (one folder up from `apps/`),
which runs `npm ci` if needed, `npm run build` if the sources are newer than `dist/`, and then
`npm run preview -- --port 4192 --strictPort`. The app is then at **<http://localhost:4192/>**.

By hand:

```bash
npm ci
npm run build:content   # validate the content pack and emit src/data/*.json
npm run dev             # http://localhost:5173
npm run build && npm run preview
```

| Script | What it does |
|---|---|
| `npm run build:content` | `scripts/build-content.ts`: validates `content-pack/` (zod schemas mirroring `docs/CONTENT-PACK.md` and `content-pack/EXTENSIONS.md`), checks every id and every `[n]`, applies the citation-coverage gate, links glossary terms, precomputes the map's walks, writes `src/data/*.json` and `public/provenance.json`. Exits 1 on any error and writes `content-pack/BUILD-ERRORS.md`; the app still builds from what validated and lists the errors on `/methods`. |
| `npm run build` | `tsc -b && vite build` into `dist/` (a copy of `index.html` as `404.html` for deep links). `BASE_PATH=/key-personnel/` for Pages. Does not need the BLS refresh. |
| `npm run refresh:bls` | `scripts/refresh-bls.mjs`: the BLS benchmark refresh (below). Separate from the build. |
| `npm run probe:sources` | `scripts/probe-sources.mjs`: the weekly reachability probe (below). Never run at build time. |
| `npm test` | Vitest: pack schemas on a fixture pack with one deliberate error per rule, the term matcher (longest match: "key-personnel substitution" is never "key personnel clause"), the section and citation parser, currency vs. maths, the pathfinder ranker, the graph walker on a 12-node fixture with a cycle, the map layout, the hypothesis ledger, the BLS parser, the notepad and decision-record reducers. |
| `npm run test:e2e` | Playwright over `dist/` on :4173 (build first, with `tests/fixtures/benchmarks/latest.json` copied to `public/data/benchmarks/`). `BX_PORT` overrides the port. |

## Editing the content pack

`content-pack/` is the only source of content. Edit it, then `npm run build:content` and read the summary table and any
errors. Never fix an uncited block by adding a citation, and never re-point an unknown id at a similar one: fix the pack.
`docs/` holds the frozen builder specs (APP-SPEC, DESIGN-SYSTEM, CONTENT-PACK, TOPIC-WORKFLOW); `content-pack/EXTENSIONS.md`
is the schema of the record files (stages, patterns, constraints, levers, gates, enablers, indicators, links, states,
controversies, changes, hypotheses, queries, pathfinder).

Rules the build enforces: every `[n]` resolves; every record id resolves to a record of the right file; a link's
endpoints are constraints, levers or gates and its relation is one of precondition, amplifies, trade-off, enables; a
constraint's `situations` are pathfinder tags; the pathfinder rows agree with the constraint and pattern records; every
`legacy` id is in the ledger and the ledger's counts equal its header; every state record carries all nine overlays
with `primary_pending`; a lever carries `what_it_does_not_do`; any prose block of 25 words or more carries a `[n]` or a
`<!-- framing -->` marker. Every `$` followed by a digit is escaped as currency before the maths renderer sees it.

## The BLS benchmark refresh

Indicators with a `series` are refreshed from the **BLS Public Data API v1**, no key:
`GET https://api.bls.gov/publicAPI/v1/timeseries/data/{seriesID}` (path and response shape confirmed on
<https://www.bls.gov/developers/api_signature.htm>). `scripts/refresh-bls.mjs` writes
`public/data/benchmarks/latest.json` (`fetchedAt`, and per series `series`, `period`, `year`, `periodName`, `value`,
`status`, `error?`), one request per series, no retries; it exits non-zero on a failed request but writes the other
series first. The output is never committed (`public/data/benchmarks/` is ignored). `/benchmarks` shows the refreshed
value **beside** the pack's figure, labelled "BLS, refreshed <date>", reading the file from the site itself; no page
calls BLS. Without the file (a local build) the page shows the pack's values alone and says so.

## Workflows

- `.github/workflows/deploy.yml` — on push to `main`, `workflow_dispatch` and weekly (`23 10 * * 1`): tests, the content
  build, Playwright against the fixture BLS file; then `npm ci → npm test → build:content → refresh:bls → build`
  (`BASE_PATH=/key-personnel/`) → `404.html` → Pages. The scheduled run skips the test job and only re-refreshes and
  redeploys.
- `.github/workflows/probe-sources.yml` — weekly and on demand: HEAD (or a one-byte ranged GET) to each BLS series and each
  reference URL marked `recheck: true`; red on any non-2xx/206; a Markdown summary on the run.

## Provenance

Everything the app renders comes from `content-pack/` as written: the review on `/read` verbatim, record prose verbatim,
effect sizes exactly as each record carries them with their population, and `(synthesis)` and `<!-- synthesis -->`
passages visibly marked and listed on `/methods`. `/methods` publishes the scope (in and out), the interview, the
evidence grades, all 500 queries, the corpus profile, the known gaps, the hypothesis ledger, every synthesis passage,
the build errors and every `TODO(author)`. Pathfinder answers, decision records, notes and saved filters stay in the
browser's `localStorage`; there is no server, account or analytics.
