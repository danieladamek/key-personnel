---
id: reading-an-effect-size
title: Reading an effect size
one_liner: "What the coefficients on the guide's record cards mean, how to read a correlation, a d and an odds ratio, and how far a number from one firm travels."
why_here: "Every lever in this guide carries an evidence grade and an effect size quoted as the study reported it, with its population; a recruiter without an HR department has to read those lines without a statistician and know when a figure is a direction and when it is a forecast."
prerequisites: []
terms: [effect-size, correlation-coefficient, odds-ratio, k-and-n, meta-analysis, evidence-grade, operational-validity, subgroup-difference, field-experiment, quasi-experimental-design, practitioner-survey, synthesis-marker, range-restriction]
figures: [validity-2022, turnover-predictors]
further_reading:
  - { title: "Revisiting meta-analytic estimates of validity in personnel selection: Addressing systematic overcorrection for restriction of range", url: "https://www.Gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf", kind: review }
  - { title: "Surveying the forest: A meta-analysis, moderator investigation, and future-oriented discussion of the antecedents of voluntary employee turnover", url: "https://www.Gwern.net/doc/economics/2017-rubenstein.pdf", kind: review }
  - { title: "Mechanical versus clinical data combination in selection and admissions decisions: A meta-analysis", url: "https://Www.Gwern.net/doc/statistics/prediction/2013-kuncel.pdf", kind: review }
---

## What it is

The guide grades every lever by the design of the strongest study behind it. A meta-analysis grade means a published meta-analysis or systematic review, with the effect size quoted together with its k and N as reported, which is the grade the 2022 selection table carries [1]. Field-experiment means a randomized or natural experiment in a real employment setting, as when employees were randomly told about a salary database [92]; quasi-experimental means a difference-in-differences, discontinuity or matched design on administrative data, as in the study of raises and quits at a large retailer [182]; observational means survey research without a causal design, as in the one-firm study of onboarding tactics [155]; practitioner-survey means a benchmark from a publisher such as SHRM or ClearanceJobs, carried as a dated fact and never as evidence of effect [89]; regulation binds regardless of evidence; synthesis is a conclusion no cited work states on its own, marked wherever a record makes one.

Most lines on the select and retain records are correlations. A correlation coefficient, written r, or ρ when a meta-analysis has corrected it for measurement error and range restriction, runs from −1 to +1 and says how closely two measures move together. In the 2022 table, .42 for structured interviews and .19 for unstructured ones means that interview scores track later performance much more closely when the interview is structured, and .07 for years of experience means a count of years tells almost nothing [1]. The sign carries the direction: in the turnover table, withdrawal cognitions correlate .56 with leaving and job embeddedness −.26, so wanting to leave goes with leaving and being embedded goes with staying [178].

A standardized mean difference, d, compares two groups' averages in units of the standard deviation. The 2022 table pairs each validity with a Black–White d so that the trade-off sits on one line: cognitive ability pairs a validity of .31 with d = .79 and structured interviews .42 with .23, and the authors say the d values mix applicant, incumbent and national samples and are offered to locate predictors as having large, modest or minimal group differences [1].

Where the outcome is yes or no, such as leaving within a year, studies report odds ratios. Below 1 means the factor goes with lower odds: in a one-firm study of 222 newcomers, experienced insiders as role models carried an OR of 0.44 for leaving within the year and affirmation of who the newcomer already is an OR of 0.52, which the author describes as roughly halving the odds [155]. Above 1 means higher odds: among 157,154 accepted entry-level offers at one telecommunications employer, each additional week between acceptance and the start date carried an OR of 1.22 for the hire never appearing, about a fifth more per week as the authors put it, while an employee referral carried 0.42 [144].

k is the number of studies a meta-analysis pools and N the number of people across them; together they say how much of the world a figure has seen. The 2022 estimates rest on pooled databases such as k = 36 with N = 3,069 and k = 69 with N = 4,795 for structured interviews, and k = 54 with N = 10,469 for work samples [1]; the turnover table on 316 articles, 57 predictors and about 1,800 effect sizes with a mean lag of about 16 months between predictor and leaving [178]; the collective-turnover table on 694 effect sizes from 82 studies [181]. The comparison of formula against judgment rests on nine job-performance studies, which is why its authors call the values probable underestimates [7]. A meta-analysis is the top grade because it has seen many settings, and it still inherits its studies' populations: the turnover table is 78.9 percent U.S. samples, with healthcare at 25.9 percent and banking at 12.6 percent [178].

Several of the guide's most vivid numbers come from one employer and are carried for their shape. Output rose 53 percent over the first year for windshield installers at one autoglass company while pay rose much less; the job is manual, so the slope does not transfer and the shape does [157]. The 24.8 percent first-year turnover figure is 222 newcomers at one financial-services firm with no standardized orientation, so the direction is what carries [155]. The guide names the population on every such line, and the controversy `cost-of-turnover` shows what happens when a number travels without one: practitioner literature repeats a total cost of 90 to 200 percent of salary that names no study [195], while the case-study median is 21 percent [180].

## The maths, gently

$$ r = \frac{\operatorname{cov}(X, Y)}{s_X \, s_Y} \qquad d = \frac{\bar{x}_1 - \bar{x}_2}{s_{\text{pooled}}} \qquad \mathrm{OR} = \frac{p_1 / (1 - p_1)}{p_0 / (1 - p_0)} $$

- $r$: the correlation between a predictor $X$ (an interview score) and an outcome $Y$ (a performance rating); $\operatorname{cov}$ is their covariance and $s_X$ and $s_Y$ their standard deviations. A meta-analysis reports $\rho$, the same quantity corrected for unreliability and, where the authors judge it warranted, for range restriction [1].
- $d$: the difference between two group means, $\bar{x}_1$ and $\bar{x}_2$, divided by the pooled standard deviation $s_{\text{pooled}}$.
- $\mathrm{OR}$: the odds of the outcome when the factor is present, $p_1 / (1 - p_1)$, divided by the odds when it is absent, $p_0 / (1 - p_0)$; an odds ratio of 1 means no association.

Take the 2022 table [1]. A structured interview at r = .42 and an unstructured one at .19 are both positive, so higher scores go with better performance under either method, and the structured coefficient is more than twice the size. Put d beside r: cognitive ability at .31 carries d = .79, the largest group difference in the table, while the structured interview at .42 carries .23, so the method with the higher validity also has the smaller difference [1].

## How this guide uses it

Every lever record carries a grade, an effect, a population and a k and N line in these terms: `l-structured-interview` carries the .42 and its two pooled databases [1], `l-embeddedness-building` carries ρ −.26 at k = 29 beside the one-firm OR of 0.42 [178] [155], and `l-offer-to-start-interval-management` carries the per-week OR of 1.22 with its entry-level population [144]. Each constraint names the strongest grade among its sources, the indicator `ind-turnover-predictors-rubenstein2018` is the turnover table itself [178], and the methods page lists the grades, the hypothesis ledger and every synthesis the records mark.
