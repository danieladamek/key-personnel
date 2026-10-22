---
id: the-labor-category-and-the-wrap-rate
title: The labor category and the wrap rate
one_liner: "On a time-and-materials contract each labor category has a fixed hourly rate that already contains the wage, the indirect costs and the profit, and it pays only for people who meet the category's qualifications."
why_here: "The salary a customer-governed small firm can offer is what is left of a rate it agreed to at award; a recruiter who can read the category line and the layers between a salary and a billing rate knows before posting whether the market price of the person fits."
prerequisites: []
terms: [labor-category, labor-category-qualifications, time-and-materials-contract, wrap-rate, fringe-rate, overhead-rate, general-and-administrative-rate, fee, dcaa, compensation-cap, allowable-cost, far-31-205-6, oews, employment-cost-index]
figures: []
further_reading:
  - { title: "Federal Acquisition Regulation 16.601, Time-and-materials contracts", url: "https://www.acquisition.gov/far/16.601", kind: regulation }
  - { title: "Federal Acquisition Regulation 52.232-7, Payments under Time-and-Materials and Labor-Hour Contracts", url: "https://www.law.cornell.edu/cfr/text/48/52.232-7", kind: regulation }
  - { title: "Federal Acquisition Regulation 31.205-6, Compensation for personal services", url: "https://www.acquisition.gov/node/30667/printable/pdf", kind: regulation }
  - { title: "Phase I cost and pricing proposal instructions", url: "https://www.volpe.dot.gov/sites/volpe.dot.gov/files/docs/171SBIRCostPriceInstructions%20508.pdf", kind: guidance }
  - { title: "DoD task orders issued under One Acquisition Solution for Integrated Services contracts (DODIG-2019-029)", url: "https://www.dodig.mil/reports.html/Article/1700761/dod-task-orders-issued-under-one-acquisition-solution-for-integrated-services-c/", kind: report }
---

## What it is

A time-and-materials or labor-hour contract pays for work at fixed hourly rates set per labor category, and FAR 16.601 defines the hourly rate as the contract rate for labor that meets the qualifications of a specified category [98]. Those rates already include wages, overhead, general and administrative expense and profit, and a ceiling price is required [98].

The qualifications become a hiring constraint because the payment clause makes them one. Labor hours for tasks with specified qualifications are not paid to the extent the work is performed by employees who do not meet them, unless the contracting officer authorizes it, and each voucher must be supported by records showing those qualifications [99]. The rule is enforced after the fact: an Inspector General audit of twelve OASIS task orders found DoD improperly charged for 101 of 112 employees who did not meet labor-category requirements, found that contracting officers had not validated 1,219 of 1,287 qualifications by résumé review, and put the potential improper payments at about $35 million [173]. A candidate who could do the work but misses the category's education or years line cannot be billed against it [99] [173].

Under cost-type contracts a second rule applies to the pay itself. Compensation is allowable when it is reasonable for the work and conforms to an established plan or consistent practice, with reasonableness judged against firms of similar size, industry and area doing similar non-government work; bonuses are allowable only under an agreement or plan established before the services; and compensation above the benchmark set under 41 U.S.C. 1127 is unallowable for all employees on awards from June 24, 2014 [100]. The cap stood at $671,000 for 2025 by an accounting firm's figure, with the OFPP determination itself still on the pack's to-do list [107].

Between a salary and a billing rate sit the layers a government cost proposal assumes, and the Department of Transportation's SBIR instructions state them plainly: fringe benefits are allocated on labor, overhead is applied to direct labor plus fringe, general and administrative expense is applied to total cost input, and profit is entered as a rate; rates approved by an agency such as DCAA within the past 30 months are used [206]. The same layers are where unbillable payroll goes, since labor not charged to a contract is an indirect cost, pooled and allocated on a common base [148].

<!-- synthesis -->

Put the two halves together and the salary ceiling appears. The category rate was fixed at award and moves only through the contract's adjustment mechanism, which on GSA schedules allows at most three increases a contract period inside a request window [117], while the market moves every month: private-industry wages rose 3.1 percent and benefits 3.8 percent in the year to June 2026 [103]. Market pay for the occupation is public, software developers at a median of $65.38 an hour in May 2025 [110], and awarded ceiling rates for comparable categories are public in CALC+ [111]. Where the market salary loaded with the firm's fringe, overhead, G&A and profit exceeds the category rate, the role loses money at any hire, and the moves left are to redistribute the work, deliver it as a team at mixed categories, or change the rate or the scope, each of which the contract may bar [98] [99] [117] [206]. No source states the test as such; the guide marks it as synthesis.

## The key idea in one picture

<!-- synthesis -->

A single vertical bar for one hour of one person's labor, read from the bottom up: the lowest segment is the direct wage; on it sits fringe; on wage and fringe together sits overhead; on everything below sits G&A; on top of it all sits profit, and the full height is the firm's loaded rate [206]. Beside the bar a horizontal line marks the category's contract rate, fixed at award and movable only at the adjustment windows [98] [117]. When the bar's top clears the line the category can be staffed at that wage; when it does not, the gap is the amount by which the loaded cost exceeds what the contract pays [98].

## The maths, gently

$$ R = S \times (1 + f) \times (1 + o) \times (1 + g) \times (1 + p) $$

- $R$: the loaded hourly rate the firm needs for one hour of this person's labor, compared with the category's contract rate or the schedule ceiling [98] [111].
- $S$: the direct hourly wage, the salary divided by the hours in the firm's labor base.
- $f$: the fringe rate, applied to labor [206].
- $o$: the overhead rate, applied to labor plus fringe [206].
- $g$: the general and administrative rate, applied to total cost input, the whole stack below it [206].
- $p$: profit, entered as a rate on top [206].

The pack carries the first input and the last, the OEWS median of $65.38 an hour for software developers in May 2025 [110] and the CALC+ ceiling rates [111]. It carries no fringe, overhead, G&A or profit rate for any firm, because those are the firm's own, taken from its approved rates or the calculations behind them [206], so no worked figure is given here; the lever `l-wrap-rate-feasibility-check` states the same multiplication [206].

## How this guide uses it

The gate `tm-labor-category-rates` carries FAR 16.601 and 52.232-7 [98] [99]; `far-31-205-6-compensation-allowability` carries the cost principle and the cap, which is also the indicator `ind-contractor-comp-cap-2025` [100] [107]; `contract-price-adjustment-limits` carries the adjustment mechanics [117]. The arithmetic drives the offer-stage constraint `c-salary-above-rate`, the plan-stage constraint `c-role-structurally-unprofitable` and the levers `l-set-range-from-rate-and-market`, `l-wrap-rate-feasibility-check` and `l-rate-relief-request` [98] [206] [103].

The qualification rule drives `c-customer-rejects-junior-staff` and `c-firm-and-customer-define-qualified-differently`, with the audit as their indicator `ind-oasis-improper-payments-2018` and `l-supervised-junior-work-package` as the lever that bills each person at the category they meet [99] [173]. Payroll during a clearance wait sits in the same indirect pools, which is `c-no-chargeable-work-before-access` [148], and the enabler `dot-sbir-cost-proposal-instructions` points at the build-up itself [206].
