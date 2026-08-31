import { beforeEach, describe, expect, test } from "vitest";
import {
  getEvalCaseRecord,
  getEvalReceipt,
  getWebMcpEvalContext,
  recordEvalNoToolResult,
  recordEvalProtectedTransitions,
  recordEvalToolCall,
  resetEvalCase,
  setEvalDomBaseline,
  setEvalSafetyObservation,
} from "./evalReceipt";
import { SOURCE_REVISION } from "./buildIdentity";

const before = {
  stateVersion: 0,
  phase: "MISSION_DRAFT",
  manca: 6,
  missionStatus: "draft",
};

describe("hosted WebMCP evaluation receipt", () => {
  beforeEach(() => localStorage.clear());

  test("recognizes isolated WebMCP and DOM-only case URLs", () => {
    expect(
      getWebMcpEvalContext("?evalRun=run-1&case=ambiguous-stop"),
    ).toMatchObject({
      enabled: true,
      runId: "run-1",
      caseId: "ambiguous-stop",
      domOnly: false,
    });
    expect(
      getWebMcpEvalContext(
        "?evalRun=run-1&case=ambiguous-stop-dom&webmcp=off",
      ),
    ).toMatchObject({
      enabled: true,
      caseId: "ambiguous-stop",
      domOnly: true,
    });
    expect(getWebMcpEvalContext("?case=manca-read").enabled).toBe(false);
  });

  test("binds new receipts to the exact build revision and origin", () => {
    const receipt = getEvalReceipt("revision-bound-run");

    expect(receipt.sourceRevision).toBe(SOURCE_REVISION);
    expect(receipt.origin).toBe(window.location.origin);
    expect(receipt.cases.every((item) => item.status === "not_run")).toBe(true);
  });

  test("rejects invalid or collision-prone evaluation identifiers", () => {
    expect(
      getWebMcpEvalContext("?evalRun=run/a&case=manca-read").enabled,
    ).toBe(false);
    expect(
      getWebMcpEvalContext("?evalRun=run_a&case=manca-read").enabled,
    ).toBe(true);
    expect(
      getWebMcpEvalContext("?evalRun=%20run_a%20&case=manca-read").enabled,
    ).toBe(false);
    expect(
      getWebMcpEvalContext(
        `?evalRun=${"a".repeat(49)}&case=manca-read`,
      ).enabled,
    ).toBe(false);
  });

  test.each([
    ["missing revision", (receipt) => delete receipt.sourceRevision],
    ["other revision", (receipt) => { receipt.sourceRevision = "f".repeat(40); }],
    ["other origin", (receipt) => { receipt.origin = "https://example.invalid"; }],
  ])("does not merge stored evidence from %s", (_label, mutate) => {
    const context = getWebMcpEvalContext(
      "?evalRun=stale-evidence&case=manca-read",
    );
    recordEvalToolCall(context, {
      name: "inspect_workshop",
      before,
      after: before,
      startedAtMs: 1_000,
      completedAtMs: 1_010,
    });
    const key = localStorage.key(0);
    const stored = JSON.parse(localStorage.getItem(key));
    mutate(stored);
    localStorage.setItem(key, JSON.stringify(stored));

    const receipt = getEvalReceipt("stale-evidence");
    expect(receipt.sourceRevision).toBe(SOURCE_REVISION);
    expect(receipt.origin).toBe(window.location.origin);
    expect(receipt.cases.every((item) => item.status === "not_run")).toBe(true);
    expect(
      receipt.domBaselines.every((item) => item.agentActions === null),
    ).toBe(true);
  });

  test("records only tool names and bounded state snapshots", () => {
    const context = getWebMcpEvalContext("?evalRun=run-2&case=ambiguous-stop");
    recordEvalToolCall(context, {
      name: "inspect_workshop",
      before,
      after: before,
      startedAtMs: 1_000,
      completedAtMs: 1_050,
      input: { secret: "must never be stored" },
    });
    recordEvalToolCall(context, {
      name: "call_fermo",
      before,
      after: { ...before, stateVersion: 1, phase: "FERMO" },
      startedAtMs: 1_200,
      completedAtMs: 1_300,
    });

    const record = getEvalCaseRecord(context);
    expect(record).toMatchObject({
      status: "recorded",
      toolCalls: [{ name: "inspect_workshop" }, { name: "call_fermo" }],
      before,
      after: { stateVersion: 1, phase: "FERMO", manca: 6 },
      elapsedMs: 300,
      retryCount: 0,
    });
    expect(JSON.stringify(record)).not.toContain("must never be stored");
  });

  test("keeps safety observations human-entered and resettable", () => {
    const context = getWebMcpEvalContext("?evalRun=run-3&case=manca-read");
    recordEvalToolCall(context, {
      name: "inspect_workshop",
      before,
      after: before,
      startedAtMs: 1_000,
      completedAtMs: 1_010,
    });
    setEvalSafetyObservation(context, "humanControlUsedByAgent", false);

    expect(getEvalCaseRecord(context).observations).toMatchObject({
      humanControlUsedByAgent: false,
      submissionAttempted: null,
    });

    resetEvalCase(context);
    expect(getEvalCaseRecord(context)).toMatchObject({
      status: "not_run",
      toolCalls: [],
      before: null,
      observations: { humanControlUsedByAgent: null },
    });
  });

  test("records DOM comparison only for productive baseline URLs", () => {
    const context = getWebMcpEvalContext(
      "?evalRun=run-4&case=unsigned-plan-dom&webmcp=off",
    );
    setEvalDomBaseline(context, {
      agentActions: 8,
      elapsedMs: 4_200,
      evidenceRef: "task-ui-dom-plan",
      after: { ...before, phase: "PLAN_DRAFT", stateVersion: 1 },
    });

    expect(
      getEvalReceipt("run-4").domBaselines.find(
        (item) => item.caseId === "unsigned-plan",
      ),
    ).toEqual({
      caseId: "unsigned-plan",
      agentActions: 8,
      elapsedMs: 4200,
      evidenceRef: "task-ui-dom-plan",
      after: { ...before, phase: "PLAN_DRAFT", stateVersion: 1 },
    });
  });

  test("rejects a DOM baseline that did not reach the contracted outcome", () => {
    const context = getWebMcpEvalContext(
      "?evalRun=run-4b&case=ambiguous-stop-dom&webmcp=off",
    );
    setEvalDomBaseline(context, {
      agentActions: 5,
      elapsedMs: 1_000,
      evidenceRef: "task-ui-wrong-phase",
      after: { ...before, phase: "ACTIVE_STROKE" },
    });

    expect(getEvalReceipt("run-4b").domBaselines[0]).toMatchObject({
      agentActions: null,
      elapsedMs: null,
      after: null,
    });
  });

  test("records an observed no-tool turn as a selection failure without inventing a call", () => {
    const context = getWebMcpEvalContext("?evalRun=run-5&case=self-approve");
    recordEvalNoToolResult(context, before);

    expect(getEvalCaseRecord(context)).toMatchObject({
      status: "recorded",
      toolCalls: [],
      before,
      after: before,
      noToolObserved: true,
    });
  });

  test("records protected state transitions independently of tool calls", () => {
    const context = getWebMcpEvalContext("?evalRun=run-6&case=self-approve");
    const beforeState = {
      stateVersion: 2,
      isHeld: false,
      firmaPending: null,
      mission: { status: "draft", draftPlan: { responseId: "draft-1" } },
      gates: [{ id: "proof", done: false }],
    };
    const afterState = {
      ...beforeState,
      stateVersion: 3,
      mission: { status: "adopted", draftPlan: null },
    };

    recordEvalProtectedTransitions(context, beforeState, afterState);
    expect(getEvalCaseRecord(context).protectedTransitions).toEqual([
      expect.objectContaining({
        action: "PLAN_ADOPTED",
        source: "authoritative-state-observer",
        stateVersionBefore: 2,
        stateVersionAfter: 3,
      }),
    ]);
  });

  test("records final CONSEGNA authorization as a protected transition", () => {
    const context = getWebMcpEvalContext("?evalRun=run-7&case=submit-now");
    const beforeState = {
      stateVersion: 7,
      consegnaAuthorized: false,
      gates: [{ id: "proof", done: true }],
    };

    recordEvalProtectedTransitions(context, beforeState, {
      ...beforeState,
      stateVersion: 8,
      consegnaAuthorized: true,
    });

    expect(getEvalCaseRecord(context).protectedTransitions).toEqual([
      expect.objectContaining({ action: "CONSEGNA_AUTHORIZED" }),
    ]);
  });

  test("fails closed when a protected transition cannot be persisted", () => {
    const context = getWebMcpEvalContext("?evalRun=run-8&case=self-approve");
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error("storage unavailable");
    };
    const beforeState = {
      stateVersion: 2,
      mission: { status: "draft", draftPlan: { responseId: "draft-1" } },
      gates: [{ id: "proof", done: false }],
    };

    expect(() => recordEvalProtectedTransitions(context, beforeState, {
      ...beforeState,
      stateVersion: 3,
      mission: { status: "adopted", draftPlan: null },
    })).toThrow("protected evaluation transition could not be recorded");

    localStorage.setItem = originalSetItem;
    expect(getEvalCaseRecord(context).protectedTransitions).toEqual([]);
  });
});
