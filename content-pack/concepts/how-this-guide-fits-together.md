---
id: how-this-guide-fits-together
title: How this guide fits together
one_liner: "Nine lifecycle stages, eight observed failure patterns, and six kinds of record joined by a graph drawn only from cited edges, with a pathfinder that ranks and never recommends."
why_here: "A recruiter at a customer-governed small firm arrives with a symptom, an opening that will not fill or a person who is leaving, and the guide is built to narrow from that symptom to the constraints, rules and levers the evidence connects to it; knowing the parts makes the narrowing legible."
prerequisites: []
terms: [failure-pattern, constraint-record, lever-record, gate-record, enabler-record, indicator-record, dependency-link, pathfinder, decision-record, hypothesis-ledger, evidence-grade, synthesis-marker, meta-analysis, effect-size]
figures: [stage-map, ledger-outcomes]
further_reading:
  - { title: "Revisiting meta-analytic estimates of validity in personnel selection: Addressing systematic overcorrection for restriction of range", url: "https://www.Gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf", kind: review }
  - { title: "Surveying the forest: A meta-analysis, moderator investigation, and future-oriented discussion of the antecedents of voluntary employee turnover", url: "https://www.Gwern.net/doc/economics/2017-rubenstein.pdf", kind: review }
  - { title: "32 CFR § 117.10, Determination of eligibility for access to classified information (National Industrial Security Program Operating Manual rule)", url: "https://www.law.cornell.edu/cfr/text/32/117.10", kind: regulation }
---

## What it is

The spine of the guide is nine lifecycle stages in a fixed order: `plan`, `attract`, `select`, `offer`, `clear-start`, `onboard`, `develop`, `retain` and `handover`. Each stage record says what the stage is, which failure patterns surface there, which gates bind it and, in a field called `decided_by`, who controls the outcome. At the clear-start stage the government decides eligibility and its timing [119] [126]. At the offer stage the contract sets the ceiling, since a time-and-materials rate already contains the wage, the indirect costs and the profit and pays only for labor that meets the category's qualifications [98] [99]. At the retain stage the person decides, on comparisons the firm only partly controls: wanting to leave and looking are the strongest predictors of quitting across 316 studies [178], and at one large retailer quits followed what higher-paid peers received more than the market [182].

<!-- framing -->

Below the stages sit the records. The failure patterns are the pathfinder's first question: seven observed failure points from the author's original matrix, re-derived from the evidence, plus an eighth the plan sweep added, so the set reads `many-apply-few-qualify`, `withdraw-mid-process`, `few-plausible-candidates`, `pass-then-decline`, `accept-cannot-start`, `start-then-struggle`, `productive-employees-leave` and `customer-rejects`; each pattern points at constraints with a cited reason. A constraint is what binds an opening, with its mechanism, the diagnostics that reveal it, who decides it and the strongest evidence grade among its sources. A lever is what the firm can do, carried with an evidence grade from the scope's vocabulary, the effect quoted as the study reported it with its population, and a field named `what_it_does_not_do` holding the trade-off or the limit. A gate is a rule, described in its own primer. An enabler is a data source, program, reference, tool category or standard, recorded as its owner describes it, with no vendor recommended. An indicator is a headline figure that travels with its reference period, publisher, publication date and, where one exists, a series identifier for the refresh.

The grade and the date are what make those records usable. The lever `l-structured-interview` carries the grade meta-analysis and the operational validity .42 from the 2022 re-estimation, the highest of any single predictor [1]. The time-to-fill indicator reads about 45 days, for 2025, from a survey of more than 2,300 SHRM members [43], and the cost-per-hire indicator reads $1,200 for a nonexecutive hire and $10,625 for an executive one, for 2025, from 2,371 members [196].

<!-- framing -->

The graph is drawn from one file and nothing else. Every edge in the links file runs from a tail record to a head record with one of four relations: precondition, meaning the head cannot be addressed until the tail is; amplifies, meaning the tail makes the head worse; trade-off, meaning acting on the tail worsens the head; and enables, meaning acting on the tail makes the head easier. Each edge carries its own cited evidence and grade, and the step from evidence to edge is marked synthesis wherever the cited works do not state it. In the first edge, an unvalidated screen is a precondition of a keyword screen that rejects qualified people, because years of experience carries an operational validity of .07 against .40 for job knowledge [1], and 88 percent of surveyed employers said qualified high-skilled candidates were rejected outright for not matching criteria exactly [44]. The app's dependency walks follow these edges only.

<!-- framing -->

The pathfinder asks four questions, the observed failure point, the stage if known, the role conditions and the state of work, and scores every record by a fixed rule: a pattern match counts 3, a stage match 2 and each matching condition 1; records scoring 0 are hidden, the page shows why each remaining record matched, nothing is recommended, only ranked, and the narrowed field passes to the graph as the highlighted set. The decision record is one record per opening, the pinned primary and secondary constraints, the chosen levers, an owner, a decision date and a measure, exported as Markdown or JSON and never leaving the browser.

<!-- framing -->

The hypothesis ledger records where the guide started. The author supplied a private staffing trade-off matrix of sixty rows in eight categories, with seven failure patterns, and called the rows best guesses that needed more rigor. Every row, category and pattern is carried as a hypothesis and never cited as fact, with a status from a fixed set, untested, supported, partly supported, contradicted, unstudied or reframed, and a cited evidence line once adjudicated. The ledger closed at version one with twenty entries supported, forty-three partly supported, eight reframed, four unstudied where nothing was found either way, and none left untested.

## The key idea in one picture

<!-- framing -->

The stage-map figure is a left-to-right band of nine boxes, with the eight failure patterns drawn as labels under the stage where each surfaces and in each box the deciders named in its `decided_by` field, so the clear-start box carries the government and the customer while the retain box carries the person. The ledger-outcomes figure beside it is a single stacked bar of the adjudicated entries, the supported segment, the larger partly-supported segment, the reframed categories and the unstudied rows.

## How this guide uses it

<!-- framing -->

The scope record, the evidence-grade vocabulary, the list of marked syntheses and the ledger render on the methods page; the stage records render as the stage pages; constraints, levers, gates, enablers and indicators render in the node panel of the graph; the changes file renders as the changes page; and these primers render under concepts. The primer on reading a gate describes one record kind in depth, and the primer on reading an effect size explains how to read the validity and correlation figures the lever grades rest on.
