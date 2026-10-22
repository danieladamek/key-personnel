import { Link } from 'react-router-dom';
import provenance from '@/data/provenance.json';
import { AS_OF, asOfLong, CONCEPTS_LABEL, manifest, REPO_URL } from '@/lib/data';

/** `/about` — the disclaimer in full, what the app is and is not, who built it, the as-of date, the repo, the no-firm statement. */
export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 bx-prose text-ink dark:text-night-ink">
      <h1 className="text-3xl sm:text-4xl text-ink dark:text-night-ink">About Key Personnel</h1>
      <p className="mt-2 flex flex-wrap items-center gap-2"><span className="bx-chip border border-[color:var(--bx-line)] bx-muted">COMMISSIONED GUIDE — NOT PEER REVIEWED · NOT ADVICE</span><span className="bx-asof" data-testid="about-asof">Current as of {AS_OF}</span></p>

      <section className="bx-card p-4 mt-4 border-l-4 border-l-[color:var(--bx-accent)]" aria-labelledby="disc-h" data-testid="disclaimer-full">
        <h2 id="disc-h" className="text-xl text-ink dark:text-night-ink">Disclaimer</h2>
        <p className="mt-1 font-semibold">{manifest.disclaimer}</p>
        <p className="mt-2">{manifest.venue}</p>
      </section>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">What it is</h2>
      <p className="mt-2">{manifest.plain_abstract}</p>
      <p className="mt-2">It is written for {manifest.audience}. The question behind it: {manifest.question}</p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">What it is not</h2>
      <ul className="list-disc pl-5 mt-2 grid gap-1">
        <li>Not peer reviewed, not official, and not legal, HR, compliance or financial advice. No agency, court, customer or professional body has reviewed or endorsed it.</li>
        <li>Not a recommendation. The pathfinder ranks constraints by a count of matches under the rule it prints; levers are listed with their evidence grade and what they have not been shown to do, never ordered by merit.</li>
        <li>Not current beyond its date. The sweep closed on {asOfLong()}; every record shows its own as-of date and links to the governing text or the study it rests on. Every reference still awaits its re-read against the live page.</li>
        <li>Not a copy of anyone’s figures: all {provenance.figures.total} figures are the builder’s own — {provenance.figures.by_synthesis.data ?? 0} synthesised from data across cited works and {provenance.figures.by_synthesis.conceptual ?? 0} a conceptual diagram. No published figure image is reproduced.</li>
        <li>Not a systematic review. It is a scope-bounded commissioned review whose scope, interview and every query are published on <Link className="underline" to="/methods">Methods</Link>.</li>
      </ul>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">No firm</h2>
      <p className="mt-2" data-testid="no-firm">No firm is named anywhere in this app, no firm had any part in it, and nothing in it is tailored to one. There is no account, no server-side state and no analytics. The author’s own guesses about staffing, which started the sweep, appear only as a tested ledger on Methods, in general words.</p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">What stays in this browser, and what does not</h2>
      <p className="mt-2">Pathfinder answers, decision records, notes and saved filters are kept in this browser’s storage and never sent anywhere; export them to keep a copy. The only figures that came from outside after the sweep are on <Link className="underline" to="/benchmarks">Benchmarks</Link>: a scheduled workflow requests the latest values of the BLS series named there from the BLS public API when the site is built, and writes them into the site. No page makes a request to BLS or anyone else while it is being read.</p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Who built it</h2>
      <p className="mt-2">
        The guide and its records were written by an AI research builder, the {manifest.builder.name} (version {manifest.builder.version}, {manifest.builder.date}), from {provenance.references.total.toLocaleString()} published
        studies and public government sources read as of {asOfLong()}. The app — the pathfinder, the map, the record pages, the reader, the {CONCEPTS_LABEL}, the figures and the search — was built from that content by Claude Code.
        Listed author: {manifest.authors.join(', ')}.
      </p>
      <p className="mt-2"><span className="font-semibold">Text and figures: </span>{manifest.permissions.text}. {manifest.permissions.figures}.</p>

      <h2 className="text-2xl mt-8 text-ink dark:text-night-ink">Reporting an error</h2>
      <p className="mt-2">Every record links to its governing text and its sources; where a record and its source disagree, the source governs. Errors can be reported as an issue on the repository: <a className="underline" href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">{REPO_URL}/issues</a>. The source and the content pack are at <a className="underline" href={REPO_URL} target="_blank" rel="noreferrer">{REPO_URL}</a>. How it was built and what it does not cover is on <Link className="underline" to="/methods">Methods</Link>.</p>
    </div>
  );
}
