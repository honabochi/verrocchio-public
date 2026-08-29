import { describe, expect, test } from "vitest";
import { initialState } from "./model";
import {
  claimAttachedEvidence,
  claimWorkResult,
  holdWorkshop,
  proposeWorkshopDraft,
  requestEvidenceChanges,
  verifyEvidenceClaim,
} from "./workshopCommands";

const resultInput = {
  expectedStateVersion: 0,
  idempotencyKey: "return-result-1",
  summary: "Registered the first WebMCP tool.",
  verification: "Five deterministic tests passed.",
  evidenceRef: "src/webmcp.test.js",
  remainingRisk: "Real browser discovery is not yet verified.",
};

const hostPlanInput = {
  expectedStateVersion: 0,
  idempotencyKey: "host-plan-1",
  plan: {
    contract: {
      objective: "APIキーなしで一人チームの実行ループを完成させる。",
      track: "WebMCP",
      deadline: "2026-09-04T05:00:00+09:00",
      humanRule: "FIRMAと証拠確定は人間だけが行う。",
      irreversibleRule: "公開と提出にはFIRMAが必要。",
    },
    gates: ["mission", "plan", "execution", "submission"].map((id) => ({
      id: `${id}-proof`,
      title: `${id}の証拠`,
      detail: `${id}が実行可能である。`,
      proofRequired: `${id}の検証記録`,
    })),
    strokes: [
      { id: "inspect-mission", title: "ミッション点検", outcome: "制約を確認する。", gateId: "mission-proof", role: "vasari", classification: "GESSO", evidenceExpected: "点検記録" },
      { id: "run-loop", title: "一巡を実行", outcome: "結果を返す。", gateId: "execution-proof", role: "prima-mano", classification: "SECCO", evidenceExpected: "結果控え" },
      { id: "prepare-proof", title: "提出証拠を整える", outcome: "審査可能にする。", gateId: "submission-proof", role: "colorista", classification: "SECCO", evidenceExpected: "提出チェック" },
    ],
    schedule: [
      { label: "点検", dueAt: "2026-08-28T12:00:00+09:00", deliverable: "点検記録" },
      { label: "一巡", dueAt: "2026-09-01T12:00:00+09:00", deliverable: "結果控え" },
      { label: "提出", dueAt: "2026-09-03T12:00:00+09:00", deliverable: "提出チェック" },
    ],
    risks: ["証拠不足", "範囲拡大", "人間承認の取り違え"],
    rationale: "最小の一巡を先に証明する。",
    scopeEffect: "SHRINKS",
    humanAction: "FIRMA_REQUIRED",
  },
};

describe("agent claims and human verification", () => {
  test("manually attached evidence uses the same claimed-to-verified boundary", () => {
    const claimed = claimAttachedEvidence(
      initialState,
      "working-product",
      "browser-run-01",
    );

    expect(claimed.gates[0].done).toBe(false);
    expect(claimed.gates[0].claims[0]).toMatchObject({
      status: "CLAIMED",
      submittedBy: "human-attached",
      evidenceRef: "browser-run-01",
    });
    const verified = verifyEvidenceClaim(
      claimed,
      claimed.gates[0].claims[0].id,
    );
    expect(verified.gates[0].done).toBe(true);
    expect(verified.gates[0].claims[0].status).toBe("VERIFIED");
  });

  test("a host model can submit a plan but cannot approve it", () => {
    const result = proposeWorkshopDraft(initialState, hostPlanInput);

    expect(result.state.mission.draftPlan).toMatchObject({
      source: "host-webmcp",
      model: "ChatGPT/Codex host",
      humanAction: "FIRMA_REQUIRED",
    });
    expect(result.state.mission.status).toBe("seed");
    expect(result.receipt.next).toEqual({ actor: "human", action: "GIVE_FIRMA_IN_UI" });
  });

  test("a host plan is retry-safe and rejects broken gate references", () => {
    const first = proposeWorkshopDraft(initialState, hostPlanInput);
    const committed = { ...first.state, stateVersion: first.receipt.stateVersion };
    const replay = proposeWorkshopDraft(committed, {
      ...hostPlanInput,
      expectedStateVersion: 999,
    });
    expect(replay.receipt).toMatchObject({ receiptId: first.receipt.receiptId, replayed: true });

    expect(() => proposeWorkshopDraft(initialState, {
      ...hostPlanInput,
      idempotencyKey: "broken-plan",
      plan: {
        ...hostPlanInput.plan,
        strokes: hostPlanInput.plan.strokes.map((stroke, index) =>
          index === 0 ? { ...stroke, gateId: "missing-gate" } : stroke,
        ),
      },
    })).toThrow("unknown gate");
  });

  test("an agent result remains claimed and does not close its gate", () => {
    const result = claimWorkResult(initialState, resultInput);
    const gate = result.state.gates.find((item) => item.id === "working-product");

    expect(gate.done).toBe(false);
    expect(gate.claims[0]).toMatchObject({
      status: "CLAIMED",
      submittedBy: "webmcp-agent",
      evidenceRef: "src/webmcp.test.js",
    });
    expect(result.receipt.next).toEqual({
      actor: "human",
      action: "VERIFY_EVIDENCE_IN_UI",
    });
  });

  test("only the human verification command closes the gate and advances work", () => {
    const claimed = claimWorkResult(initialState, resultInput).state;
    const claimId = claimed.gates[0].claims[0].id;
    const verified = verifyEvidenceClaim(claimed, claimId);

    expect(verified.gates[0].done).toBe(true);
    expect(verified.gates[0].claims[0].status).toBe("VERIFIED");
    expect(verified.cartone.strokes[0].status).toBe("done");
    expect(verified.cartone.strokes[1].status).toBe("active");
  });

  test("a human can request changes without deleting the rejected claim", () => {
    const claimed = claimWorkResult(initialState, resultInput).state;
    const claimId = claimed.gates[0].claims[0].id;
    const returned = requestEvidenceChanges(
      claimed,
      claimId,
      "情報が古く、現在の実行経路を表していない。",
    );

    expect(returned.gates[0]).toMatchObject({ done: false });
    expect(returned.gates[0].claims[0]).toMatchObject({
      id: claimId,
      status: "CHANGES_REQUESTED",
      changesRequestedReason: "情報が古く、現在の実行経路を表していない。",
    });
    expect(returned.cartone.strokes[0]).toMatchObject({
      status: "active",
      result: null,
    });
    expect(returned.events[0].kind).toBe("CHANGES_REQUESTED");
  });

  test("requesting changes requires a reason and clears the human checkpoint", () => {
    const claimed = claimWorkResult(initialState, resultInput).state;
    const claimId = claimed.gates[0].claims[0].id;

    expect(() => requestEvidenceChanges(claimed, claimId, " ")).toThrow(
      "INVALID_CHANGES_REASON",
    );
    const returned = requestEvidenceChanges(claimed, claimId, "証拠が再現できない。");
    expect(
      returned.gates.flatMap((gate) => gate.claims || []).some(
        (claim) => claim.status === "CLAIMED",
      ),
    ).toBe(false);
  });

  test("FERMO and FIRMA both reject agent result mutation", () => {
    expect(() => claimWorkResult({ ...initialState, isHeld: true }, resultInput)).toThrow(
      "FERMO_ACTIVE",
    );
    expect(() =>
      claimWorkResult(
        { ...initialState, firmaPending: { title: "Publish", reason: "External" } },
        resultInput,
      ),
    ).toThrow("FIRMA_REQUIRED");
  });

  test("rejects oversized agent output before it reaches local state", () => {
    expect(() =>
      claimWorkResult(initialState, { ...resultInput, summary: "x".repeat(801) }),
    ).toThrow("summary exceeds 800 characters");
  });

  test("rejects a mutation based on stale inspected state", () => {
    expect(() =>
      claimWorkResult(
        { ...initialState, stateVersion: 4 },
        { ...resultInput, expectedStateVersion: 3 },
      ),
    ).toThrow("STALE_STATE");
  });

  test("replays an idempotent result without creating a second claim", () => {
    const first = claimWorkResult(initialState, resultInput);
    const committed = { ...first.state, stateVersion: first.receipt.stateVersion };
    const replay = claimWorkResult(committed, {
      ...resultInput,
      expectedStateVersion: 999,
    });

    expect(replay.receipt).toMatchObject({
      receiptId: first.receipt.receiptId,
      replayed: true,
    });
    expect(replay.state.gates[0].claims).toHaveLength(1);
  });

  test("an agent can call FERMO but cannot resume it", () => {
    const held = holdWorkshop(initialState, {
      reason: "The evidence target is ambiguous.",
      expectedStateVersion: 0,
      idempotencyKey: "fermo-1",
    });

    expect(held.state).toMatchObject({ isHeld: true, isRunning: false });
    expect(held.receipt.next).toEqual({ actor: "human", action: "RESUME_IN_UI" });
    expect(() =>
      holdWorkshop(held.state, {
        reason: "Hold again.",
        expectedStateVersion: 0,
        idempotencyKey: "fermo-2",
      }),
    ).toThrow("FERMO_ACTIVE");
  });
});
