#!/usr/bin/env node
// Metadata-only baseline: plans are declarations, never verification proof.
import { createHash, randomUUID } from 'node:crypto';
import { readFile, appendFile, open, rename, unlink, realpath } from 'node:fs/promises';
import { join, isAbsolute, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const SHA = /^[a-f0-9]{40}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const NUMBER = /^[1-9][0-9]{0,15}$/;
const RECORD = /^\.jarvis\/changes\/[A-Za-z0-9_.-]+\.json$/;
const KEYS = ['record_version', 'change_id', 'goal', 'scope', 'verification_plan', 'limits', 'next_action'];
const EXTENSIONS = new Set(['.md', '.txt', '.json', '.yml', '.yaml', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.css', '.scss', '.html', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.sh', '.py', '.toml', '.xml', '.csv', '.sql', '.graphql', '.gitignore', '.gitattributes', '.editorconfig']);
const SECRET = /-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,})\b|\bBearer\s+[A-Za-z0-9._~+/-]{12,}|\b(?:password|secret|api[_ -]?key|(?:access|refresh|id)[_ -]?token|client[_ -]?secret|private[_ -]?key)\s*["']?\s*[:=]\s*["']?[^\s"',}]{4,}/i;

const BLOCKED_REASONS = Object.freeze([
  'INVALID_REVISION', 'INVALID_FILE_LIST', 'INVALID_FILE_PATH', 'INVALID_RENAME_PATH', 'RECORD_COUNT', 'RECORD_STATUS',
  'RECORD_MISSING', 'RECORD_TOO_LARGE', 'RECORD_SECRET_PATTERN', 'RECORD_JSON', 'RECORD_SCHEMA', 'SCOPE_COVERAGE',
  'API_RESPONSE', 'API_RESPONSE_SIZE', 'API_REQUEST_FAILED', 'PR_NOT_OPEN', 'PR_REPOSITORY_MISMATCH', 'PR_REVISION',
  'FILE_COUNT_LIMIT', 'ENV_REPOSITORY', 'ENV_CORE_SHA', 'ENV_WORKFLOW_SHA', 'ENV_RUN', 'EVENT_UNSUPPORTED',
  'EVENT_MISSING', 'EVENT_SIZE', 'EVENT_REPOSITORY_MISMATCH', 'PR_NUMBER', 'TOKEN_UNAVAILABLE', 'STALE_EVENT',
  'FILE_LIST_INCOMPLETE', 'RECORD_TREE', 'RECORD_MODE', 'RECORD_BLOB', 'RECORD_BLOB_SHA', 'STALE_PR',
  'BASELINE_FAILURE', 'RESULT_SCHEMA', 'RESULT_WRITE_FAILED', 'SUMMARY_WRITE_FAILED', 'DOCUMENT_MODE',
]);
const identityProperties = Object.freeze({
  repository: { type: 'string', pattern: '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$', maxLength: 201 },
  repository_id: { type: 'string', pattern: '^[1-9][0-9]{0,15}$', maxLength: 16 },
  pr: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
  checker_core: { type: 'string', pattern: '^[a-f0-9]{40}$', maxLength: 40 },
  workflow_commit: { type: 'string', pattern: '^[a-f0-9]{40}$', maxLength: 40 },
  run: { type: 'string', pattern: '^[1-9][0-9]{0,15}$', maxLength: 16 },
  attempt: { type: 'string', pattern: '^[1-9][0-9]{0,15}$', maxLength: 16 },
  event: { type: 'string', enum: ['pull_request_target', 'workflow_dispatch'] },
  subject_head: { type: 'string', pattern: '^[a-f0-9]{40}$', maxLength: 40 },
  subject_base: { type: 'string', pattern: '^[a-f0-9]{40}$', maxLength: 40 },
  record_blob: { type: 'string', pattern: '^[a-f0-9]{40}$', maxLength: 40 },
  record_digest: { type: 'string', pattern: '^[a-f0-9]{64}$', maxLength: 64 },
});
const requiredIdentity = Object.keys(identityProperties).filter(key => !['record_blob', 'record_digest'].includes(key));

// Inline schema keeps the standalone checker dependency-free. Only BLOCKED may
// carry partial identity, because inspection can fail before all bindings exist.
export const RESULT_SCHEMA = Object.freeze({
  type: 'object', additionalProperties: false, required: ['result_version', 'status', 'reasons', 'identity'],
  properties: {
    result_version: { const: 1 },
    status: { enum: ['PASS', 'REVIEW_REQUIRED', 'BLOCKED'] },
    reasons: { type: 'array', uniqueItems: true, minItems: 1, maxItems: BLOCKED_REASONS.length,
      items: { enum: ['BASELINE_PASS', 'DOCUMENTATION_ONLY', 'SENSITIVE_CHANGE', 'UNKNOWN_EXTENSION', ...BLOCKED_REASONS] } },
    identity: { type: 'object', additionalProperties: false, properties: identityProperties },
  },
  allOf: [
    { if: { properties: { status: { const: 'PASS' } } }, then: { properties: { reasons: { maxItems: 1, items: { enum: ['BASELINE_PASS', 'DOCUMENTATION_ONLY'] } } } } },
    { if: { properties: { status: { const: 'REVIEW_REQUIRED' } } }, then: { properties: { reasons: { items: { enum: ['SENSITIVE_CHANGE', 'UNKNOWN_EXTENSION', 'DOCUMENTATION_ONLY'] }, contains: { enum: ['SENSITIVE_CHANGE', 'UNKNOWN_EXTENSION'] } } } } },
    { if: { properties: { status: { const: 'BLOCKED' } } }, then: { properties: { reasons: { items: { enum: BLOCKED_REASONS } } } } },
    { if: { properties: { status: { enum: ['PASS', 'REVIEW_REQUIRED'] } } }, then: {
      properties: { identity: { required: requiredIdentity } },
      if: { properties: { reasons: { contains: { const: 'DOCUMENTATION_ONLY' } } } },
      then: { properties: { identity: { properties: { record_blob: false, record_digest: false } } } },
      else: { properties: { identity: { required: Object.keys(identityProperties) } } },
    } },
  ],
});

function plainObject(value) {
  if (!value || typeof value !== 'object' || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  return Reflect.ownKeys(value).every(key => typeof key === 'string'
    && Object.getOwnPropertyDescriptor(value, key).enumerable
    && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'));
}

export function validateResult(result) {
  try {
    if (!plainObject(result)
      || Object.keys(result).length !== RESULT_SCHEMA.required.length
      || RESULT_SCHEMA.required.some(key => !Object.hasOwn(result, key))
      || result.result_version !== 1 || !RESULT_SCHEMA.properties.status.enum.includes(result.status)) return false;
    const allowed = result.status === 'PASS' ? ['BASELINE_PASS', 'DOCUMENTATION_ONLY']
      : result.status === 'REVIEW_REQUIRED' ? ['SENSITIVE_CHANGE', 'UNKNOWN_EXTENSION', 'DOCUMENTATION_ONLY'] : BLOCKED_REASONS;
    if (!Array.isArray(result.reasons) || Object.getPrototypeOf(result.reasons) !== Array.prototype
      || Reflect.ownKeys(result.reasons).length !== result.reasons.length + 1
      || result.reasons.length < 1 || result.reasons.length > allowed.length
      || result.reasons.some(reason => !allowed.includes(reason)) || new Set(result.reasons).size !== result.reasons.length
      || result.reasons.join(',') !== [...result.reasons].sort().join(',')) return false;
    if (result.status === 'PASS' && result.reasons.length !== 1) return false;
    if (result.status === 'REVIEW_REQUIRED' && !result.reasons.some(reason => ['SENSITIVE_CHANGE', 'UNKNOWN_EXTENSION'].includes(reason))) return false;
    const identity = result.identity;
    if (!plainObject(identity)) return false;
    if (result.status !== 'BLOCKED') {
      const required = result.reasons.includes('DOCUMENTATION_ONLY') ? requiredIdentity : Object.keys(identityProperties);
      if (Object.keys(identity).length !== required.length || required.some(key => !Object.hasOwn(identity, key))) return false;
    }
    for (const [key, value] of Object.entries(identity)) {
      if (!Object.hasOwn(identityProperties, key)) return false;
      const rule = identityProperties[key];
      if (rule.type === 'integer') {
        if (!Number.isSafeInteger(value) || value < rule.minimum || value > rule.maximum) return false;
      } else if (typeof value !== 'string' || /[\x00-\x1f\x7f]/.test(value)
        || (rule.maxLength && value.length > rule.maxLength) || (rule.pattern && !new RegExp(rule.pattern).test(value))
        || (rule.enum && !rule.enum.includes(value))) return false;
    }
    return Buffer.byteLength(JSON.stringify(result), 'utf8') <= 4096;
  } catch { return false; }
}

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

// A record is not a second required ledger for narrative documents. Instruction,
// executable and configuration surfaces are deliberately outside this allowlist.
export function isDocumentationPath(path) {
  if (!safePath(path) || /(?:^|\/)(?:AGENTS|CLAUDE|GEMINI|SKILL)\.md$|(?:^|\/)CODEOWNERS$/i.test(path)) return false;
  return /^(?:docs|notes|logs|decisions|continuity|\.jarvis\/continuity)\/.+\.(?:md|txt)$/.test(path)
    || /^(?:README|CHANGELOG|LICENSE)(?:\.(?:md|txt))?$/.test(path);
}

function documentationChange(files) {
  return Array.isArray(files) && files.length > 0 && files.every(file =>
    ['added', 'modified', 'removed', 'renamed'].includes(file?.status)
    && isDocumentationPath(file.filename)
    && (file.status !== 'renamed' || isDocumentationPath(file.previous_filename))
    && (file.previous_filename === undefined || isDocumentationPath(file.previous_filename)));
}

function needsReview(path) {
  // Record identifiers are bookkeeping, not an impact classifier for product code.
  if (RECORD.test(path)) return null;
  if (/^\.github\//i.test(path) || /(?:^|\/)(?:AGENTS|CLAUDE|GEMINI|SKILL)\.md$|(?:^|\/)CODEOWNERS$/i.test(path)
    || (/^\.jarvis\//i.test(path) && !RECORD.test(path)) || /^(?:harness|policy|policies)\//i.test(path)
    || /(?:^|\/)(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock)$/i.test(path)
    || /(?:^|\/)(?:auth(?:entication|orization|z|n)?|oauth|oidc|saml|security|iam|adapters?)(?:[/.\-_]|$)/i.test(path)
    || /(?:guard|pr-baseline|baseline-checker)/i.test(path)) return 'SENSITIVE_CHANGE';
  if (isDocumentationPath(path)) return null;
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
  const documentationOnly = records === 0 && documentationChange(entries);
  if (!documentationOnly && records !== 1) blocked.add('RECORD_COUNT');
  let value;
  if (!documentationOnly) try {
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
  if (documentationOnly) {
    review.add('DOCUMENTATION_ONLY');
    return { status: review.size > 1 ? 'REVIEW_REQUIRED' : 'PASS', reasons: [...review].sort() };
  }
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

async function documentationModes(get, files, head, base) {
  const roots = new Map(), trees = new Map();
  async function root(revision) {
    if (!roots.has(revision)) {
      const commit = await get(`/git/commits/${revision}`);
      requireValue(SHA.test(commit?.tree?.sha ?? ''), 'DOCUMENT_MODE');
      roots.set(revision, commit.tree.sha);
    }
    return roots.get(revision);
  }
  async function fileMode(revision, path) {
    let sha = await root(revision);
    const parts = path.split('/');
    for (let index = 0; index < parts.length; index++) {
      if (!trees.has(sha)) trees.set(sha, await get(`/git/trees/${sha}`));
      const tree = trees.get(sha);
      requireValue(tree?.truncated === false && Array.isArray(tree.tree), 'DOCUMENT_MODE');
      const matches = tree.tree.filter(entry => entry.path === parts[index]);
      if (matches.length === 0) return null;
      const entry = matches[0];
      const last = index === parts.length - 1;
      requireValue(matches.length === 1 && SHA.test(entry?.sha ?? '')
        && entry.type === (last ? 'blob' : 'tree')
        && (last ? typeof entry.mode === 'string' : ['040000', '40000'].includes(entry.mode)), 'DOCUMENT_MODE');
      if (last) return entry.mode;
      sha = entry.sha;
    }
  }
  for (const file of files) {
    const baseMode = await fileMode(base, file.previous_filename ?? file.filename);
    const headMode = await fileMode(head, file.filename);
    if (file.status === 'added') requireValue([null, '100644'].includes(baseMode) && headMode === '100644', 'DOCUMENT_MODE');
    else if (file.status === 'removed') requireValue(baseMode === '100644' && headMode === null, 'DOCUMENT_MODE');
    else requireValue(baseMode === '100644' && headMode === '100644', 'DOCUMENT_MODE');
    if (file.status === 'renamed') {
      requireValue(await fileMode(head, file.previous_filename) === null, 'DOCUMENT_MODE');
      requireValue([null, '100644'].includes(await fileMode(base, file.filename)), 'DOCUMENT_MODE');
    }
  }
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
    if (records.length === 0 && documentationChange(files)) {
      // Verify types without fetching narrative contents. Both sides of a rename
      // and mode changes are checked; a filename alone never proves inert data.
      await documentationModes(get, files, first.head, first.base);
      const last = prMetadata(await get(`/pulls/${identity.pr}`), identity.repository, identity.repository_id, identity.pr);
      requireValue(last.head === first.head && last.base === first.base && last.count === first.count, 'STALE_PR');
      return { result_version: 1, ...metadataResult, identity };
    }
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
    return { result_version: 1, ...result, identity };
  } catch (error) {
    return { result_version: 1, status: 'BLOCKED', reasons: [error instanceof BaselineError ? error.code : 'BASELINE_FAILURE'], identity };
  }
}

function blockedResult(reason, identity = {}) {
  return { result_version: 1, status: 'BLOCKED', reasons: [reason], identity };
}

export function resultPath(env) {
  requireValue(typeof env.RUNNER_TEMP === 'string' && isAbsolute(env.RUNNER_TEMP)
    && !/[\x00-\x1f\x7f]/.test(env.RUNNER_TEMP)
    && NUMBER.test(env.GITHUB_RUN_ID ?? '') && NUMBER.test(env.GITHUB_RUN_ATTEMPT ?? '')
    && !/[\x00-\x1f\x7f]/.test(`${env.GITHUB_RUN_ID}${env.GITHUB_RUN_ATTEMPT}`), 'RESULT_WRITE_FAILED');
  return join(env.RUNNER_TEMP, `jarvis-pr-baseline-${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT}.json`);
}

/** Atomic bounded write in the trusted runner temporary directory; no input path
 * or content from candidate files is accepted and destination links aren't read. */
export async function persistResult(result, env) {
  requireValue(validateResult(result), 'RESULT_SCHEMA');
  const requested = resultPath(env);
  requireValue((result.identity.run === undefined || result.identity.run === env.GITHUB_RUN_ID)
    && (result.identity.attempt === undefined || result.identity.attempt === env.GITHUB_RUN_ATTEMPT), 'RESULT_WRITE_FAILED');
  let destination;
  let temporary;
  let handle;
  try {
    const directory = await realpath(env.RUNNER_TEMP);
    destination = join(directory, basename(requested));
    temporary = `${destination}.${randomUUID()}.tmp`;
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(`${JSON.stringify(result)}\n`, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporary, destination);
  } catch {
    // A prior file for this same run/attempt must not look like a fresh result.
    if (destination) await unlink(destination).catch(() => {});
    throw new BaselineError('RESULT_WRITE_FAILED');
  } finally {
    await handle?.close().catch(() => {});
    if (temporary) await unlink(temporary).catch(() => {});
  }
}

export function resultSummary(result) {
  requireValue(validateResult(result), 'RESULT_SCHEMA');
  return `## JARVIS PR baseline\n\nStatus: ${result.status}\n\nReasons: ${result.reasons.join(', ')}\n\nBound identity (declarations only):\n\n\`\`\`json\n${JSON.stringify(result.identity, null, 2)}\n\`\`\`\n`;
}

export function resultExitCode(result) {
  return validateResult(result) && result.status === 'PASS' ? 0 : 1;
}

/** Only fixed codes escape publication failures. Summary and exit use the saved
 * result; a summary failure replaces that artifact with the final BLOCKED result. */
export async function reportResult({ result, env = process.env, save = persistResult, summarize = appendFile }) {
  result = validateResult(result) ? JSON.parse(JSON.stringify(result)) : blockedResult('RESULT_SCHEMA');
  try { await save(result, env); }
  catch { result = blockedResult('RESULT_WRITE_FAILED', result.identity); }
  if (env.GITHUB_STEP_SUMMARY) {
    try { await summarize(env.GITHUB_STEP_SUMMARY, resultSummary(result)); }
    catch {
      result = blockedResult('SUMMARY_WRITE_FAILED', result.identity);
      try { await save(result, env); }
      catch { result = blockedResult('RESULT_WRITE_FAILED', result.identity); }
    }
  }
  return result;
}

async function main() {
  const result = await reportResult({ result: await runBaseline() });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = resultExitCode(result);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
