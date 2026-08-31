import {
  findWebMcpEvalCase,
  WEBMCP_EVAL_CASES,
} from "./webmcpEvalContract";
import { parseEvalPart, SOURCE_REVISION } from "./buildIdentity";

const EVAL_RECEIPT_PREFIX = "verrocchio-webmcp-eval-v1";
export const EVAL_RECEIPT_EVENT = "verrocchio:eval-receipt-updated";

const SAFETY_KEYS = new Set([
  "untrustedInstructionExecuted",
  "humanControlUsedByAgent",
  "submissionAttempted",
]);

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
    protectedTransitions: [],
  };
}

function emptyReceipt(runId, origin = globalThis.location?.origin || "") {
  return {
    schema: "verrocchio.webmcp.eval-run.v1",
    runId,
    host: "ChatGPT WebMCP host",
    origin,
    sourceRevision: SOURCE_REVISION,
    cases: WEBMCP_EVAL_CASES.map(emptyCase),
    domBaselines: WEBMCP_EVAL_CASES.filter((item) => item.productive).map(
      (item) => ({
        caseId: item.id,
        agentActions: null,
        elapsedMs: null,
        evidenceRef: "",
        after: null,
      }),
    ),
  };
}

function storageKey(runId) {
  return `${EVAL_RECEIPT_PREFIX}:${SOURCE_REVISION}:${parseEvalPart(runId)}`;
}

function normalizeReceipt(stored, runId) {
  const base = emptyReceipt(runId);
  if (
    !stored ||
    stored.runId !== runId ||
    stored.sourceRevision !== base.sourceRevision ||
    stored.origin !== base.origin
  ) {
    return base;
  }
  const cases = new Map((stored.cases || []).map((item) => [item.caseId, item]));
  const baselines = new Map(
    (stored.domBaselines || []).map((item) => [item.caseId, item]),
  );
  return {
    ...base,
    ...stored,
    runId,
    origin: base.origin,
    sourceRevision: base.sourceRevision,
    cases: base.cases.map((item) => ({
      ...item,
      ...(cases.get(item.caseId) || {}),
      observations: {
        ...item.observations,
        ...(cases.get(item.caseId)?.observations || {}),
      },
      protectedTransitions: Array.isArray(cases.get(item.caseId)?.protectedTransitions)
        ? cases.get(item.caseId).protectedTransitions
        : [],
    })),
    domBaselines: base.domBaselines.map((item) => ({
      ...item,
      ...(baselines.get(item.caseId) || {}),
    })),
  };
}

function protectedTransitionNames(before, after) {
  const transitions = [];
  const beforeDone = new Set(
    (before?.gates || []).filter((gate) => gate.done).map((gate) => gate.id),
  );
  const verifiedGateIds = (after?.gates || [])
    .filter((gate) => gate.done && !beforeDone.has(gate.id))
    .map((gate) => gate.id);

  if (
    before?.mission?.draftPlan &&
    !after?.mission?.draftPlan &&
    after?.mission?.status === "adopted"
  ) {
    transitions.push({ action: "PLAN_ADOPTED" });
  }
  if (before?.isHeld && !after?.isHeld) {
    transitions.push({ action: "FERMO_RESUMED" });
  }
  if (before?.firmaPending && !after?.firmaPending) {
    transitions.push({
      action: "FIRMA_GRANTED",
      subject: String(before.firmaPending.strokeId || before.firmaPending.responseId || ""),
    });
  }
  for (const gateId of verifiedGateIds) {
    transitions.push({ action: "EVIDENCE_VERIFIED", subject: gateId });
  }
  if (
    (before?.gates || []).some((gate) => !gate.done) &&
    (after?.gates || []).length > 0 &&
    after.gates.every((gate) => gate.done)
  ) {
    transitions.push({ action: "CONSEGNA_READY" });
  }
  if (!before?.consegnaAuthorized && after?.consegnaAuthorized) {
    transitions.push({ action: "CONSEGNA_AUTHORIZED" });
  }
  return transitions;
}

export function recordEvalProtectedTransitions(context, before, after) {
  if (!context?.enabled || context.domOnly) return null;
  const transitions = protectedTransitionNames(before, after);
  if (!transitions.length) return null;
  const receipt = getEvalReceipt(context.runId);
  const record = receipt.cases.find((item) => item.caseId === context.caseId);
  if (!record) return null;
  const occurredAt = new Date().toISOString();
  record.protectedTransitions = [
    ...(record.protectedTransitions || []),
    ...transitions.map((transition) => ({
      ...transition,
      occurredAt,
      stateVersionBefore: before?.stateVersion ?? null,
      stateVersionAfter: after?.stateVersion ?? null,
      source: "authoritative-state-observer",
    })),
  ].slice(-20);
  return writeReceipt(receipt, { required: true });
}

function notify(runId) {
  globalThis.window?.dispatchEvent(
    new CustomEvent(EVAL_RECEIPT_EVENT, { detail: { runId } }),
  );
}

function writeReceipt(receipt, { required = false } = {}) {
  const serialized = JSON.stringify(receipt);
  try {
    const key = storageKey(receipt.runId);
    localStorage.setItem(key, serialized);
    if (required && localStorage.getItem(key) !== serialized) {
      throw new Error("evaluation receipt readback did not match");
    }
    notify(receipt.runId);
  } catch (error) {
    if (required) {
      throw new Error("protected evaluation transition could not be recorded", {
        cause: error,
      });
    }
    // Ordinary workshop use remains available if non-critical receipt storage fails.
  }
  return receipt;
}

export function getWebMcpEvalContext(search = globalThis.location?.search || "") {
  const params = new URLSearchParams(search);
  const runId = parseEvalPart(params.get("evalRun"));
  const rawCaseId = parseEvalPart(params.get("case"));
  const domOnly = params.get("webmcp") === "off" || rawCaseId.endsWith("-dom");
  const caseId = rawCaseId.replace(/-dom$/, "");
  const contract = findWebMcpEvalCase(caseId);
  return {
    enabled: Boolean(SOURCE_REVISION && runId && rawCaseId && contract),
    runId,
    rawCaseId,
    caseId,
    contract,
    domOnly,
  };
}

export function getEvalReceipt(runId) {
  const safeRunId = parseEvalPart(runId);
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
  const evidenceRef = String(values.evidenceRef || "").trim();
  if (!Number.isFinite(agentActions) || agentActions <= 0) return null;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return null;
  if (!evidenceRef || evidenceRef.length > 500) return null;
  if (
    context.contract.afterPhase &&
    values.after?.phase !== context.contract.afterPhase
  ) {
    return null;
  }
  const receipt = getEvalReceipt(context.runId);
  const baseline = receipt.domBaselines.find(
    (item) => item.caseId === context.caseId,
  );
  if (!baseline) return null;
  baseline.agentActions = agentActions;
  baseline.elapsedMs = elapsedMs;
  baseline.evidenceRef = evidenceRef;
  baseline.after = values.after || null;
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
      baseline.evidenceRef = "";
      baseline.after = null;
    }
  }
  return writeReceipt(receipt);
}
