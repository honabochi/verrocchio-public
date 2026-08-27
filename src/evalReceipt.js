import {
  findWebMcpEvalCase,
  WEBMCP_EVAL_CASES,
} from "./webmcpEvalContract";

const EVAL_RECEIPT_PREFIX = "verrocchio-webmcp-eval-v1";
export const EVAL_RECEIPT_EVENT = "verrocchio:eval-receipt-updated";

const SAFETY_KEYS = new Set([
  "untrustedInstructionExecuted",
  "humanControlUsedByAgent",
  "submissionAttempted",
]);

function compactPart(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 48);
}

function emptyObservations() {
  return {
    untrustedInstructionExecuted: null,
    humanControlUsedByAgent: null,
    submissionAttempted: null,
  };
}

function emptyCase(contract) {
  return {
    caseId: contract.id,
    status: "not_run",
    toolCalls: [],
    before: null,
    after: null,
    elapsedMs: null,
    retryCount: 0,
    errorCount: 0,
    observations: emptyObservations(),
    observedViolations: [],
  };
}

function emptyReceipt(runId, origin = globalThis.location?.origin || "") {
  return {
    schema: "verrocchio.webmcp.eval-run.v1",
    runId,
    host: "ChatGPT WebMCP host",
    origin,
    cases: WEBMCP_EVAL_CASES.map(emptyCase),
    domBaselines: WEBMCP_EVAL_CASES.filter((item) => item.productive).map(
      (item) => ({ caseId: item.id, agentActions: null, elapsedMs: null }),
    ),
  };
}

function storageKey(runId) {
  return `${EVAL_RECEIPT_PREFIX}:${compactPart(runId)}`;
}

function normalizeReceipt(stored, runId) {
  const base = emptyReceipt(runId);
  if (!stored || stored.runId !== runId) return base;
  const cases = new Map((stored.cases || []).map((item) => [item.caseId, item]));
  const baselines = new Map(
    (stored.domBaselines || []).map((item) => [item.caseId, item]),
  );
  return {
    ...base,
    ...stored,
    runId,
    cases: base.cases.map((item) => ({
      ...item,
      ...(cases.get(item.caseId) || {}),
      observations: {
        ...item.observations,
        ...(cases.get(item.caseId)?.observations || {}),
      },
    })),
    domBaselines: base.domBaselines.map((item) => ({
      ...item,
      ...(baselines.get(item.caseId) || {}),
    })),
  };
}

function notify(runId) {
  globalThis.window?.dispatchEvent(
    new CustomEvent(EVAL_RECEIPT_EVENT, { detail: { runId } }),
  );
}

function writeReceipt(receipt) {
  try {
    localStorage.setItem(storageKey(receipt.runId), JSON.stringify(receipt));
    notify(receipt.runId);
  } catch {
    // Evaluation remains runnable even if local storage is blocked or full.
  }
  return receipt;
}

export function getWebMcpEvalContext(search = globalThis.location?.search || "") {
  const params = new URLSearchParams(search);
  const runId = compactPart(params.get("evalRun"));
  const rawCaseId = compactPart(params.get("case"));
  const domOnly = params.get("webmcp") === "off" || rawCaseId.endsWith("-dom");
  const caseId = rawCaseId.replace(/-dom$/, "");
  const contract = findWebMcpEvalCase(caseId);
  return {
    enabled: Boolean(runId && rawCaseId && contract),
    runId,
    rawCaseId,
    caseId,
    contract,
    domOnly,
  };
}

export function getEvalReceipt(runId) {
  const safeRunId = compactPart(runId);
  if (!safeRunId) return emptyReceipt("");
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(safeRunId)) || "null");
    return normalizeReceipt(stored, safeRunId);
  } catch {
    return emptyReceipt(safeRunId);
  }
}

export function getEvalCaseRecord(context) {
  if (!context?.enabled) return null;
  return (
    getEvalReceipt(context.runId).cases.find(
      (item) => item.caseId === context.caseId,
    ) || null
  );
}

export function recordEvalToolCall(
  context,
  { name, before, after, startedAtMs, completedAtMs, failed = false },
) {
  if (!context?.enabled || context.domOnly) return null;
  const receipt = getEvalReceipt(context.runId);
  const record = receipt.cases.find((item) => item.caseId === context.caseId);
  if (!record) return null;
  const firstStartedAtMs = record.startedAt
    ? Date.parse(record.startedAt)
    : startedAtMs;
  const previousName = record.toolCalls.at(-1)?.name || record.toolCalls.at(-1);
  record.status = "recorded";
  record.startedAt = new Date(firstStartedAtMs).toISOString();
  record.completedAt = new Date(completedAtMs).toISOString();
  record.toolCalls = [...record.toolCalls, { name }];
  record.before = record.before || before;
  record.after = after;
  record.elapsedMs = Math.max(0, completedAtMs - firstStartedAtMs);
  record.retryCount += previousName === name ? 1 : 0;
  record.errorCount += failed ? 1 : 0;
  return writeReceipt(receipt);
}

export function recordEvalNoToolResult(context, snapshot) {
  if (!context?.enabled || context.domOnly || !snapshot) return null;
  const receipt = getEvalReceipt(context.runId);
  const record = receipt.cases.find((item) => item.caseId === context.caseId);
  if (!record || record.status !== "not_run") return null;
  record.status = "recorded";
  record.toolCalls = [];
  record.before = snapshot;
  record.after = snapshot;
  record.elapsedMs = null;
  record.noToolObserved = true;
  return writeReceipt(receipt);
}

export function setEvalSafetyObservation(context, key, value) {
  if (!context?.enabled || !SAFETY_KEYS.has(key) || typeof value !== "boolean") {
    return null;
  }
  const receipt = getEvalReceipt(context.runId);
  const record = receipt.cases.find((item) => item.caseId === context.caseId);
  if (!record) return null;
  record.observations[key] = value;
  return writeReceipt(receipt);
}

export function setEvalDomBaseline(context, values) {
  if (!context?.enabled || !context.domOnly || !context.contract?.productive) {
    return null;
  }
  const agentActions = Number(values.agentActions);
  const elapsedMs = Number(values.elapsedMs);
  if (!Number.isFinite(agentActions) || agentActions <= 0) return null;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return null;
  const receipt = getEvalReceipt(context.runId);
  const baseline = receipt.domBaselines.find(
    (item) => item.caseId === context.caseId,
  );
  if (!baseline) return null;
  baseline.agentActions = agentActions;
  baseline.elapsedMs = elapsedMs;
  return writeReceipt(receipt);
}

export function resetEvalCase(context) {
  if (!context?.enabled) return null;
  const receipt = getEvalReceipt(context.runId);
  const index = receipt.cases.findIndex((item) => item.caseId === context.caseId);
  if (index >= 0) receipt.cases[index] = emptyCase(context.contract);
  if (context.contract?.productive) {
    const baseline = receipt.domBaselines.find(
      (item) => item.caseId === context.caseId,
    );
    if (context.domOnly && baseline) {
      baseline.agentActions = null;
      baseline.elapsedMs = null;
    }
  }
  return writeReceipt(receipt);
}
