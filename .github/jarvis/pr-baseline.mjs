#!/usr/bin/env node
// Metadata-only baseline: plans are declarations, never verification proof.
import { createHash } from 'node:crypto';
import { readFile, appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const NUMBER = /^[1-9][0-9]{0,15}$/;
const RECORD = /^\.jarvis\/changes\/[A-Za-z0-9_.-]+\.json$/;
const KEYS = ['record_version', 'change_id', 'goal', 'scope', 'verification_plan', 'limits', 'next_action'];
const EXTENSIONS = new Set(['.md', '.txt', '.json', '.yml', '.yaml', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.css', '.scss', '.html', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.sh', '.py', '.toml', '.xml', '.csv', '.sql', '.graphql', '.gitignore', '.gitattributes', '.editorconfig']);
const SECRET = /-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,})\b|\bBearer\s+[A-Za-z0-9._~+/-]{12,}|\b(?:password|secret|api[_ -]?key|(?:access|refresh|id)[_ -]?token|client[_ -]?secret|private[_ -]?key)\s*["']?\s*[:=]\s*["']?[^\s"',}]{4,}/i;

function safePath(value, prefix = false) {
  if (typeof value !== 'string' || !value || value.length > 1000 || /[\\:\x00-\x1f\x7f]/.test(value) || value.startsWith('/')) return false;
  const path = prefix && value.endsWith('/') ? value.slice(0, -1) : value;
  const parts = path.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) return false;
  return !parts.some(part => /^(?:\.git|\.env(?:\..*)?|credentials?(?:\..*)?|secrets?(?:\..*)?|service[-_]?accounts?(?:\..*)?|tokens?[^/]*\.json)$/i.test(part))
    && !/(?:^|\/)(?:private[-_]?fixtures?|fixtures?[-_]?private)(?:\/|\.|$)|(?:^|\/)private\/.*fixtures?(?:\/|\.|$)|(?:^|\/)fixtures?\/private(?:\/|$)|\.(?:pem|key|p12|pfx|keystore)$/i.test(path);
}

function textField(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value);
}

function covered(path, scopes) {
  return scopes.some(scope => {
    const prefix = scope.endsWith('/') ? scope.slice(0, -1) : scope;
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

function needsReview(path) {
  // Record identifiers are bookkeeping, not an impact classifier for product code.
  if (RECORD.test(path)) return null;
  if (/^\.github\//i.test(path) || /^(?:AGENTS|CLAUDE|GEMINI)\.md$/i.test(path)
    || (/^\.jarvis\//i.test(path) && !RECORD.test(path)) || /^(?:harness|policy|policies)\//i.test(path)
    || /(?:^|\/)(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock)$/i.test(path)
    || /(?:^|\/)(?:auth(?:entication|orization|z|n)?|oauth|oidc|saml|security|iam|adapters?)(?:[/.\-_]|$)/i.test(path)
    || /(?:guard|pr-baseline|baseline-checker)/i.test(path)) return 'SENSITIVE_CHANGE';
  const name = path.split('/').at(-1);
  const extension = name.startsWith('.') && !name.slice(1).includes('.') ? name : name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '';
  return EXTENSIONS.has(extension) ? null : 'UNKNOWN_EXTENSION';
}

/** Pure evaluation; record may be a parsed object or its bounded JSON text. */
export function evaluate({ files, record, head, base }) {
  const blocked = new Set();
  const review = new Set();
  if (!SHA.test(head ?? '') || !SHA.test(base ?? '')) blocked.add('INVALID_REVISION');
  if (!Array.isArray(files) || files.length === 0 || files.length > 3000) blocked.add('INVALID_FILE_LIST');
  const entries = Array.isArray(files) ? files : [];
  const paths = [];
  const seen = new Set();
  let records = 0;
  for (const file of entries) {
    if (!file || !safePath(file.filename) || !['added', 'modified', 'removed', 'renamed', 'copied', 'changed', 'unchanged'].includes(file.status) || seen.has(file.filename)) {
      blocked.add('INVALID_FILE_PATH');
      continue;
    }
    seen.add(file.filename);
    paths.push(file.filename);
    if (RECORD.test(file.filename)) {
      records++;
      if (!['added', 'modified'].includes(file.status)) blocked.add('RECORD_STATUS');
    }
    if (file.status === 'renamed' && !safePath(file.previous_filename)) blocked.add('INVALID_RENAME_PATH');
    if (file.previous_filename !== undefined) {
      if (!safePath(file.previous_filename)) blocked.add('INVALID_RENAME_PATH');
      else paths.push(file.previous_filename);
    }
  }
  if (records !== 1) blocked.add('RECORD_COUNT');
  let value;
  try {
    const raw = typeof record === 'string' ? record : JSON.stringify(record);
    if (typeof raw !== 'string') blocked.add('RECORD_MISSING');
    else if (Buffer.byteLength(raw, 'utf8') > 32768) blocked.add('RECORD_TOO_LARGE');
    else if (SECRET.test(raw)) blocked.add('RECORD_SECRET_PATTERN');
    else {
      value = typeof record === 'string' ? JSON.parse(raw) : record;
      if (SECRET.test(JSON.stringify(value))) { blocked.add('RECORD_SECRET_PATTERN'); value = undefined; }
    }
  } catch { blocked.add('RECORD_JSON'); }
  if (value !== undefined) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== KEYS.length || KEYS.some(key => !Object.hasOwn(value, key))) blocked.add('RECORD_SCHEMA');
    else {
      if (value.record_version !== 1 || typeof value.change_id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value.change_id) || !textField(value.goal, 500)
        || !textField(value.next_action, 300) || !textField(value.limits, 1000)
        || !Array.isArray(value.scope) || value.scope.length < 1 || value.scope.length > 100 || value.scope.some(path => !safePath(path, true))
        || !Array.isArray(value.verification_plan) || value.verification_plan.length < 1 || value.verification_plan.length > 8 || value.verification_plan.some(plan => !textField(plan, 200))) blocked.add('RECORD_SCHEMA');
      else if (paths.some(path => !covered(path, value.scope))) blocked.add('SCOPE_COVERAGE');
    }
  }
  for (const path of paths) {
    const reason = needsReview(path);
    if (reason) review.add(reason);
  }
  if (blocked.size) return { status: 'BLOCKED', reasons: [...blocked].sort() };
  if (review.size) return { status: 'REVIEW_REQUIRED', reasons: [...review].sort() };
  return { status: 'PASS', reasons: ['BASELINE_PASS'] };
}

class BaselineError extends Error {
  constructor(code) { super(code); this.code = code; }
}
function requireValue(condition, code) { if (!condition) throw new BaselineError(code); }

async function request(fetchImpl, token, path) {
  try {
    const response = await fetchImpl(`https://api.github.com${path}`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    requireValue(response.ok, 'API_RESPONSE');
    // Bound response memory; never output or persist API bodies or patches.
    const reader = response.body.getReader();
    const chunks = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 8 * 1024 * 1024) { await reader.cancel(); throw new BaselineError('API_RESPONSE_SIZE'); }
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    if (error instanceof BaselineError) throw error;
    throw new BaselineError('API_REQUEST_FAILED');
  }
}

function prMetadata(pr, repository, repositoryId, number) {
  requireValue(pr?.state === 'open' && pr.number === number, 'PR_NOT_OPEN');
  requireValue(pr.base?.repo?.full_name === repository && String(pr.base?.repo?.id) === repositoryId, 'PR_REPOSITORY_MISMATCH');
  requireValue(SHA.test(pr.head?.sha ?? '') && SHA.test(pr.base?.sha ?? ''), 'PR_REVISION');
  requireValue(Number.isInteger(pr.changed_files) && pr.changed_files > 0 && pr.changed_files <= 3000, 'FILE_COUNT_LIMIT');
  return { head: pr.head.sha, base: pr.base.sha, count: pr.changed_files };
}

/** Runtime adapter kept separate from the pure declaration evaluator. */
export async function runBaseline({ env = process.env, event, fetchImpl = globalThis.fetch } = {}) {
  const identity = {};
  try {
    requireValue(REPO.test(env.GITHUB_REPOSITORY ?? ''), 'ENV_REPOSITORY');
    identity.repository = env.GITHUB_REPOSITORY;
    requireValue(SHA.test(env.JARVIS_BASELINE_CORE_SHA ?? ''), 'ENV_CORE_SHA');
    identity.checker_core = env.JARVIS_BASELINE_CORE_SHA;
    requireValue(SHA.test(env.GITHUB_SHA ?? ''), 'ENV_WORKFLOW_SHA');
    identity.workflow_commit = env.GITHUB_SHA;
    requireValue(NUMBER.test(env.GITHUB_RUN_ID ?? '') && NUMBER.test(env.GITHUB_RUN_ATTEMPT ?? ''), 'ENV_RUN');
    identity.run = env.GITHUB_RUN_ID;
    identity.attempt = env.GITHUB_RUN_ATTEMPT;
    requireValue(['pull_request_target', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME), 'EVENT_UNSUPPORTED');
    identity.event = env.GITHUB_EVENT_NAME;
    if (event === undefined) {
      requireValue(typeof env.GITHUB_EVENT_PATH === 'string' && env.GITHUB_EVENT_PATH.length > 0, 'EVENT_MISSING');
      const source = await readFile(env.GITHUB_EVENT_PATH);
      requireValue(source.length <= 1024 * 1024, 'EVENT_SIZE');
      event = JSON.parse(source.toString('utf8'));
    }
    requireValue(event?.repository?.full_name === identity.repository && NUMBER.test(String(event?.repository?.id ?? '')), 'EVENT_REPOSITORY_MISMATCH');
    identity.repository_id = String(event.repository.id);
    const prNumber = env.GITHUB_EVENT_NAME === 'pull_request_target' ? String(event.pull_request?.number ?? '') : String(env.PR_NUMBER ?? event.inputs?.pr_number ?? '');
    requireValue(NUMBER.test(prNumber) && Number.isSafeInteger(Number(prNumber)), 'PR_NUMBER');
    identity.pr = Number(prNumber);
    requireValue(typeof env.GITHUB_TOKEN === 'string' && env.GITHUB_TOKEN.length > 0, 'TOKEN_UNAVAILABLE');
    const get = path => request(fetchImpl, env.GITHUB_TOKEN, `/repos/${identity.repository}${path}`);
    const first = prMetadata(await get(`/pulls/${identity.pr}`), identity.repository, identity.repository_id, identity.pr);
    identity.subject_head = first.head;
    identity.subject_base = first.base;
    if (env.GITHUB_EVENT_NAME === 'pull_request_target') {
      requireValue(event.pull_request?.base?.repo?.full_name === identity.repository && String(event.pull_request?.base?.repo?.id) === identity.repository_id, 'EVENT_REPOSITORY_MISMATCH');
      requireValue(event.pull_request?.head?.sha === first.head && event.pull_request?.base?.sha === first.base, 'STALE_EVENT');
    }
    const files = [];
    for (let page = 1; page <= Math.ceil(first.count / 100); page++) {
      const batch = await get(`/pulls/${identity.pr}/files?per_page=100&page=${page}`);
      requireValue(Array.isArray(batch) && batch.length > 0 && batch.length <= 100, 'FILE_LIST_INCOMPLETE');
      requireValue(page === Math.ceil(first.count / 100) || batch.length === 100, 'FILE_LIST_INCOMPLETE');
      files.push(...batch.map(file => ({ filename: file.filename, status: file.status, ...(file.previous_filename === undefined ? {} : { previous_filename: file.previous_filename }) })));
    }
    requireValue(files.length === first.count && files.length <= 3000, 'FILE_LIST_INCOMPLETE');
    // Reject protected/invalid paths before fetching any candidate blob.
    const metadataResult = evaluate({ files, record: undefined, head: first.head, base: first.base });
    const metadataFailure = metadataResult.reasons.find(reason => ['INVALID_FILE_LIST', 'INVALID_FILE_PATH', 'INVALID_RENAME_PATH', 'RECORD_COUNT', 'RECORD_STATUS'].includes(reason));
    requireValue(!metadataFailure, metadataFailure);
    const records = files.filter(file => RECORD.test(file.filename ?? ''));
    requireValue(records.length === 1, 'RECORD_COUNT');
    requireValue(['added', 'modified'].includes(records[0].status), 'RECORD_STATUS');
    const commit = await get(`/git/commits/${first.head}`);
    let treeSha = commit?.tree?.sha;
    requireValue(SHA.test(treeSha ?? ''), 'RECORD_TREE');
    const parts = records[0].filename.split('/');
    let blobSha;
    for (let index = 0; index < parts.length; index++) {
      const tree = await get(`/git/trees/${treeSha}`);
      requireValue(tree.truncated === false && Array.isArray(tree.tree), 'RECORD_TREE');
      const matches = tree.tree.filter(entry => entry.path === parts[index]);
      const entry = matches[0];
      requireValue(matches.length === 1 && SHA.test(entry?.sha ?? '') && entry.type === (index === parts.length - 1 ? 'blob' : 'tree'), 'RECORD_TREE');
      if (entry.type === 'blob') {
        requireValue(['100644', '100755'].includes(entry.mode), 'RECORD_MODE');
        blobSha = entry.sha;
      }
      else treeSha = entry.sha;
    }
    const blob = await get(`/git/blobs/${blobSha}`);
    requireValue(blob.sha === blobSha && blob.encoding === 'base64' && Number.isInteger(blob.size) && blob.size > 0 && blob.size <= 32768 && typeof blob.content === 'string' && blob.content.length <= 45000, 'RECORD_BLOB');
    requireValue(/^[A-Za-z0-9+/=\r\n]+$/.test(blob.content), 'RECORD_BLOB');
    const bytes = Buffer.from(blob.content, 'base64');
    requireValue(bytes.length === blob.size, 'RECORD_BLOB');
    const gitSha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    requireValue(gitSha === blobSha, 'RECORD_BLOB_SHA');
    identity.record_blob = blobSha;
    identity.record_digest = createHash('sha256').update(bytes).digest('hex');
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const result = evaluate({ files, record: raw, head: first.head, base: first.base });
    const last = prMetadata(await get(`/pulls/${identity.pr}`), identity.repository, identity.repository_id, identity.pr);
    requireValue(last.head === first.head && last.base === first.base && last.count === first.count, 'STALE_PR');
    return { ...result, identity };
  } catch (error) {
    return { status: 'BLOCKED', reasons: [error instanceof BaselineError ? error.code : 'BASELINE_FAILURE'], identity };
  }
}

async function main() {
  const result = await runBaseline();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      await appendFile(process.env.GITHUB_STEP_SUMMARY, `## JARVIS PR baseline\n\nStatus: ${result.status}\n\nReasons: ${result.reasons.join(', ')}\n\nBound identity (declarations only):\n\n\`\`\`json\n${JSON.stringify(result.identity, null, 2)}\n\`\`\`\n`);
    } catch { process.exitCode = 1; return; }
  }
  process.exitCode = result.status === 'PASS' ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
