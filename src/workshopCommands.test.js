import { describe, expect, test } from "vitest";
import { initialState } from "./model";
import { claimWorkResult, holdWorkshop, verifyEvidenceClaim } from "./workshopCommands";

const resultInput = {
  expectedStateVersion: 0,
  idempotencyKey: "return-result-1",
  summary: "Registered the first WebMCP tool.",
  verification: "Five deterministic tests passed.",
  evidenceRef: "src/webmcp.test.js",
  remainingRisk: "Real browser discovery is not yet verified.",
};

describe("agent claims and human verification", () => {
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
