/**
 * npm run probe:sources (KICKOFF §4c): a weekly reachability probe, never run at build time. For each BLS series in
 * content-pack/indicators.yaml and each reference URL marked `recheck: true`, send a HEAD request (falling back to a
 * GET for the first byte only, Range: bytes=0-0, when HEAD is refused) and record the status. Bodies are never read.
 * Writes probe-results.json and a Markdown summary (probe-results.md); exits non-zero on any status outside 2xx/206
 * or any network error, so a blocked source shows red.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { BLS_V1 } from './lib/bls.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'key-personnel-probe (github.com/danieladamek/key-personnel)';
const indicators = yaml.load(fs.readFileSync(path.join(ROOT, 'content-pack/indicators.yaml'), 'utf8'));
const references = yaml.load(fs.readFileSync(path.join(ROOT, 'content-pack/references.yaml'), 'utf8'));
const targets = [
  ...[...new Set(indicators.map((i) => String(i.series ?? '').trim()).filter(Boolean))].map((s) => ({ kind: 'bls', id: s, url: BLS_V1 + s })),
  ...references.filter((r) => r.recheck && r.url).map((r) => ({ kind: 'reference', id: `[${r.n}] ${r.key}`, url: r.url })),
];

async function probe(t) {
  const t0 = Date.now();
  const go = async (method, extra = {}) => {
    const r = await fetch(t.url, { method, redirect: 'follow', signal: AbortSignal.timeout(30000), headers: { 'User-Agent': UA, ...extra } });
    if (r.body) await r.body.cancel().catch(() => {});
    return r.status;
  };
  try {
    let status = await go('HEAD');
    if (status === 405 || status === 403 || status === 501) status = await go('GET', { Range: 'bytes=0-0' });
    return { ...t, status, ok: (status >= 200 && status < 300) || status === 206, ms: Date.now() - t0 };
  } catch (e) {
    return { ...t, status: null, ok: false, error: String(e?.message ?? e), ms: Date.now() - t0 };
  }
}

const results = [];
const queue = [...targets];
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) results.push(await probe(queue.shift())); }));
results.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id, 'en', { numeric: true }));
const bad = results.filter((r) => !r.ok);
fs.writeFileSync(path.join(ROOT, 'probe-results.json'), JSON.stringify({ ranAt: new Date().toISOString(), total: results.length, failed: bad.length, results }, null, 2) + '\n');
const md = [
  `## Source probe — ${new Date().toISOString().slice(0, 10)}`, '',
  `${results.length} sources probed (${results.filter((r) => r.kind === 'bls').length} BLS series, ${results.filter((r) => r.kind === 'reference').length} references awaiting recheck); ${bad.length} not reachable.`, '',
  ...(bad.length ? ['| Kind | Source | Status | URL |', '|---|---|---|---|', ...bad.map((r) => `| ${r.kind} | ${r.id} | ${r.status ?? r.error} | ${r.url} |`)] : ['Every source answered 2xx or 206.']), '',
].join('\n');
fs.writeFileSync(path.join(ROOT, 'probe-results.md'), md);
console.log(md);
if (bad.length) process.exit(1);
