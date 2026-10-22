# Key Personnel content pack — extension schema (draft v0.3, 2026-10-22; v0.2 plus the geo / sector / counterpart tags of sweep 9)

Key Personnel is `mode: topic` with extension files, the pattern FAR Out and Token for Granted established. Standard files follow `docs/CONTENT-PACK.md` (`manifest.yaml`, `scope.yaml`, `review.md`, `references.yaml`, `glossary.yaml`, `concepts/`, `figures.yaml`, `todo.yaml`, `queries.yaml`). The extension files below are specific to this app. Every field that carries a fact carries a `[n]`; a record with no `[n]` fails the pack's own build.

## references.yaml (topic-mode schema + web-source keys + research keys)

FAR Out's keys apply unchanged (`n`, `key`, `tier`, `citation`, `url`, `year`, `published`, `accessed`, `publisher`, `source_kind`, `read`, `summary`, `key_facts`, `quotes` ≤ 25 words, `role_here`, `role_note`, `cited_in`, `used_by`, `verified`, `recheck`). Research sources add:

```yaml
  doi: 10.1037/apl0000994
  journal: Journal of Applied Psychology
  study_design: meta-analysis        # meta-analysis | field-experiment | quasi-experimental | observational | practitioner-survey | regulation | guidance | report
  population: 'US civilian jobs; k = 24 for structured interviews'   # as the work reports it
  effect: 'operational validity ρ = .42 for structured interviews'    # exactly as reported, with the statistic named
  peer_reviewed: true                 # false for working papers, reports and surveys
  tier_note: 'landmark: the current standard for selection validity'  # when tier is background but the sweep called it seminal
```

`source_kind: secondary` (law firms, consultants, vendors, trade press) never carries a fact alone.

## stages.yaml — the spine (nine records, fixed)

```yaml
- id: select                       # plan | attract | select | offer | clear-start | onboard | develop | retain | handover
  name: Select
  order: 3
  what: >                          # what the stage is and what the literature says decides it, every sentence cited [n]
  decided_by: '…the firm; …the customer; …the market [n]'   # who controls the outcome at this stage
  failure_patterns: [many-apply-few-qualify, pass-then-struggle]   # pattern ids
  metrics:                         # the stage's measures, each defined by a cited standard or survey
  - id: time-to-fill
    definition: '… [n]'
    benchmark: [ind-shrm-time-to-fill]   # indicator ids
  literatures: [personnel-selection]
  gates: [ugesp, ada-pre-offer, ai-hiring-laws]
  constraints: []                  # filled at assembly
  as_of: '2026-10-21'
  sources: []
```

## patterns.yaml — observed failure points (the pathfinder's first question)

```yaml
- id: accept-cannot-start
  name: Candidates accept but cannot start
  stage: clear-start
  what: '… [n]'                    # what the pattern looks like and what the evidence says usually underlies it
  points_at: [c-clearance-timing, c-site-access, c-customer-approval-stall]   # constraint ids, each with a cited reason
  reasons:
  - constraint: c-clearance-timing
    why: '… [n]'
  legacy: [h-pattern-p5]           # hypotheses.yaml ids this pattern tests
  sources: []
```

## constraints.yaml — what binds an opening (replaces the 60 rows)

```yaml
- id: c-clearance-timing
  name: Investigation time exceeds the vacancy's tolerance
  stage: clear-start
  what: >                          # plain layer, 2-4 sentences, every sentence cited
  mechanism: >                     # why it happens, as the literature or the regulation explains it, cited
  how_to_tell:                     # diagnostics a recruiter can run; cited where a source gives the test, otherwise marked synthesis
  - '… [n]'
  indicators: [ind-dcsa-inventory, ind-tw2-timeliness]   # indicator ids shown in the node panel
  levers: [l-separate-cleared-and-developmental-pipelines, l-interim-eligibility-check, l-bridge-work]
  gates: [clearance-sponsorship, interim-eligibility]
  situations: [requires-clearance, urgent-start]   # pathfinder tags
  decided_by: customer-and-government
  evidence_grade: regulation      # the strongest grade among the record's sources
  controversy: ''                  # names the controversy record if the constraint sits inside one
  legacy: [h-C2]                   # hypotheses.yaml ids this record tests
  as_of: '2026-10-21'
  sources: []
  conflicts: []
```

## levers.yaml — what the firm can do (replaces "suggested mitigation" + "trade-off")

```yaml
- id: l-structured-interview
  name: Structured interview with a scored rubric
  stages: [select]
  what: '… [n]'
  evidence:
    grade: meta-analysis
    effect: 'operational validity ρ = .42, the highest of any single predictor [n]'
    population: '… [n]'
    k_n: 'k = …, N = … [n]'
  what_it_does_not_do: '… [n]'     # the trade-off or limit, cited
  costs: '… [n]'                   # time, money, senior attention, as reported
  when_it_binds_elsewhere: [c-interview-length-withdrawal]   # constraints this lever can worsen, each a link in links.yaml
  gates: [ugesp]
  enablers: [opm-structured-interviews, coderpad]
  how_to:                          # steps from a cited guidance source, not invented
  - '… [n]'
  legacy: [h-E3]
  as_of: '2026-10-21'
  sources: []
```

## gates.yaml — regulatory and contractual gates (FAR Out field style)

`id, name, what (cited), governing_text, applies_when (thresholds, cited), binds (stages), steps (cited), official_url, pending_changes (status/date/text), as_of, sources, conflicts`. Status vocabulary for `pending_changes` as FAR Out: `proposed | announced | class-deviation | final | pending-implementation | suspended`.

## enablers.yaml — data, programs, references and tooling

```yaml
- id: skillbridge
  name: DoD SkillBridge
  kind: program                    # data-source | program | reference | tooling | standard
  what: '… [n]'                    # what it does, as its owner states it
  cost: 'no employer wage cost; the service continues pay and benefits [n]'
  conditions: '75 percent of completers must receive a qualifying offer [n]'
  levers: [l-military-transition-pipeline]
  official_url: https://skillbridge.osd.mil/
  pending_changes: []
  as_of: '2026-10-21'
  sources: []
```

Tooling records name a category and list examples as the vendors describe themselves; no vendor is recommended.

## indicators.yaml — headline figures with their dates (node-panel tables)

```yaml
- id: ind-jolts-pbs-openings
  name: Job openings rate, professional and business services
  value: '5.0%'
  reference_period: 'August 2026 (preliminary)'
  published: '2026-09-29'
  publisher: U.S. Bureau of Labor Statistics
  series: JTS540099000000000JOR       # for the refresh routine
  series_confirmed: api               # api | mirror | none — how the series ID was proven (sweep 9: mirror = echoed by the DBnomics BLS mirror; the app's refresh routine upgrades it to api)
  counterpart: ind-jolts-south-openings-aug2026   # the indicator shown beside this one (an Alabama figure's national twin, and back); '' if none
  geo: us                             # us | al | huntsville-msa (sweep 9)
  sector: all                         # all | defense (sweep 9)
  stages: [plan, attract]
  sources: [n]
```

`geo` and `sector` (v0.3, sweep 9) also appear on `enablers.yaml` and `gates.yaml` records; records written before sweep 9 carry no tag and are read as `geo: us`, `sector: all`. The app's Numbers view groups indicators by `geo` and `sector` and shows each `counterpart` beside its twin; an Alabama or Huntsville figure is never shown without its national counterpart where one exists.

## links.yaml — the dependency graph (drawn exactly; nothing inferred)

```yaml
- id: k-001
  from: c-salary-above-rate        # the constraint or lever at the tail
  to: c-local-supply-thin          # the record at the head
  relation: precondition           # precondition | amplifies | trade-off | enables
  link: 'an unaffordable range makes wider sourcing futile'   # the label drawn on the arrow, ≤ 12 words
  evidence: >                      # the cited reason this dependency exists, 1-3 sentences [n]; synthesis marked
  grade: observational
  legacy: [h-A1]
  sources: []
```

`relation` semantics: `precondition` = the head cannot be addressed until the tail is; `amplifies` = the tail makes the head worse; `trade-off` = acting on the tail worsens the head; `enables` = acting on the tail makes the head easier. The app's "depends on / is depended on by" walks follow these edges and nothing else.

## states.yaml — state-by-state employment-law records a recruiter must check (schema v0.2, sweep 8)

One record per state and DC: `id (us-xx), state, abbr`, nine overlays, an optional `localities` line, an optional `state_gates` list (v0.3: the ids of `gates.yaml` records with `geo` equal to that state, the Alabama row carries six), the union `sources`, `as_of`, `recheck`. Each overlay is an object:

```yaml
  noncompete:
    status: income-threshold          # per-overlay vocabulary in the file header
    threshold: 'about $127,091 (2026, indexed)'   # optional; also effective, notice_days
    text: 'C.R.S. 8-2-113: enforceable only above … [209].'
    sources: [209]
    primary_pending: true             # no primary among the sources; the statute is a todo (t-8001)
    gates: [noncompete-agreements-federal-status, no-poach-and-non-solicitation]   # the federal gate(s) this overlay modifies
```

The overlays are `pay_transparency`, `salary_history_ban`, `noncompete`, `stay_or_pay`, `ai_hiring`, `cannabis_testing`, `ban_the_box`, `credit_check`, `mini_warn`. `none-found` means the state is absent from the named compilation as of its date. The app renders `primary_pending: true` as "compilation-sourced; verify" and `not-checked` as a gap. The pathfinder's state question selects the record; the node panel for a gate lists the overlays that point at it.

## controversies.yaml — the live disputes, each side cited

`id, name, question, positions[] (holder, claim, sources), what_a_recruiter_can_rely_on (synthesis, marked), sources`. First four: cognitive-ability validity after Sackett 2022; the cost of turnover; skills-based hiring in name versus practice; pay transparency and pay compression.

## changes.yaml — dated entries for /changes (FAR Out schema)

## hypotheses.yaml — the legacy ledger (schema in the file header)

## pathfinder.yaml — deterministic narrowing (FAR Out rule, adapted)

Questions: observed failure point (pattern, single) · stage, if known (single) · role conditions (multi: requires-clearance, customer-approves-candidate, developmental-hire-possible, onsite-fixed-schedule, rare-skill-or-passive-market, pay-above-rate, tight-cash-or-budget, urgent-start, tentative-opening, team-overloaded) · state of work (single, for the state overlay). Score = pattern match (3) + stage match (2) + each condition (1); records with score 0 are hidden; the page shows why each record matched; nothing is ever recommended, only ranked. The narrowed field is passed to the graph as the highlighted set.

## The decision record (browser-local, APP-SPEC §3.1 notepad extension)

One record per opening: pinned primary and secondary constraints, chosen levers, owner, decision date, measure; exported as Markdown or JSON; never leaves the browser.

## todo.yaml

FAR Out schema (`id, kind, about, text, owner, where, what`); `kind` adds `hypothesis` for ledger adjudications awaiting a source.
