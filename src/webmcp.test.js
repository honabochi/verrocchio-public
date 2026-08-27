import { describe, expect, test, vi } from "vitest";
import { initialState } from "./model";
import {
  createInspectWorkshopTool,
  inferWorkshopPhase,
  inspectWorkshop,
  isWebMcpDisabled,
  registerWorkshopTools,
} from "./webmcp";
import { requestEvidenceChanges } from "./workshopCommands";

describe("VERROCCHIO WebMCP read path", () => {
  test("supports an explicit DOM-only baseline without changing normal mode", () => {
    expect(isWebMcpDisabled("?evalRun=run-01&webmcp=off")).toBe(true);
    expect(isWebMcpDisabled("?evalRun=run-01")).toBe(false);
  });

  test("reports the current mission and missing proof without exposing approvals", () => {
    const result = inspectWorkshop(initialState);

    expect(result).toMatchObject({
      schema: "verrocchio.webmcp.inspect.v1",
      phase: "ACTIVE_STROKE",
      manca: 6,
      humanOnly: ["FIRMA", "VERIFY_EVIDENCE", "CONSEGNA"],
    });
    expect(result).not.toHaveProperty("giveFirma");
  });

  test("makes a pending FIRMA explicitly human-only", () => {
    const state = {
      ...initialState,
      isHeld: true,
      firmaPending: { title: "Publish", reason: "External state change" },
    };

    expect(inferWorkshopPhase(state)).toBe("AWAITING_HUMAN_FIRMA");
    expect(inspectWorkshop(state).next).toEqual({
      actor: "human",
      action: "GIVE_FIRMA_IN_UI",
    });
  });

  test("marks attached but unclosed evidence as a claim", () => {
    const state = {
      ...initialState,
      gates: [{ ...initialState.gates[0], evidence: "agent assertion" }],
    };

    expect(inspectWorkshop(state, "manca").missingGates[0].status).toBe("CLAIMED");
  });

  test("reports structured agent claims without echoing unbounded text", () => {
    const state = {
      ...initialState,
      gates: [
        {
          ...initialState.gates[0],
          detail: "x".repeat(500),
          claims: [{ id: "claim-1", status: "CLAIMED" }],
        },
      ],
    };
    const result = inspectWorkshop(state, "manca");

    expect(result.missingGates[0].status).toBe("CLAIMED");
    expect(result.missingGates[0].proofRequired.length).toBe(160);
  });

  test("registers one read-only tool and unregisters it with AbortSignal", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const registration = registerWorkshopTools({
      getState: () => initialState,
      modelContext: { registerTool },
    });

    await registration.registration;
    expect(registerTool).toHaveBeenCalledTimes(4);
    expect(registration.toolNames).toEqual([
      "inspect_workshop",
      "call_fermo",
      "propose_workshop_draft",
      "return_work_result",
    ]);
    const [tool, options] = registerTool.mock.calls[0];
    expect(tool.name).toBe("inspect_workshop");
    expect(tool.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
    expect(options.signal.aborted).toBe(false);

    registration.dispose();
    expect(options.signal.aborted).toBe(true);
  });

  test("removes mutation tools while waiting for human FIRMA", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const state = {
      ...initialState,
      isHeld: true,
      firmaPending: { title: "Publish", reason: "External state" },
    };
    const registration = registerWorkshopTools({
      getState: () => state,
      modelContext: { registerTool },
    });

    await registration.registration;
    expect(registration.toolNames).toEqual(["inspect_workshop"]);
  });

  test("removes mutation tools while an agent claim awaits human verification", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const state = {
      ...initialState,
      gates: [
        {
          ...initialState.gates[0],
          claims: [{ id: "claim-1", status: "CLAIMED" }],
        },
      ],
    };
    const registration = registerWorkshopTools({
      getState: () => state,
      modelContext: { registerTool },
    });

    await registration.registration;
    expect(registration.toolNames).toEqual(["inspect_workshop"]);
    expect(inspectWorkshop(state).next).toEqual({
      actor: "human",
      action: "VERIFY_EVIDENCE_IN_UI",
    });
  });

  test("restores mutation tools after the human requests changes", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    const claimed = {
      ...initialState,
      gates: [
        {
          ...initialState.gates[0],
          claims: [{
            id: "claim-returned",
            strokeId: "mission-intake",
            status: "CLAIMED",
          }],
        },
        ...initialState.gates.slice(1),
      ],
      cartone: {
        ...initialState.cartone,
        strokes: initialState.cartone.strokes.map((stroke, index) =>
          index === 0 ? { ...stroke, status: "claimed" } : stroke,
        ),
      },
    };
    const returned = requestEvidenceChanges(
      claimed,
      "claim-returned",
      "新しい実行記録が必要。",
    );
    const registration = registerWorkshopTools({
      getState: () => returned,
      modelContext: { registerTool },
    });

    await registration.registration;
    expect(registration.toolNames).toEqual([
      "inspect_workshop",
      "call_fermo",
      "propose_workshop_draft",
      "return_work_result",
    ]);
  });

  test("returns live state at execution time", async () => {
    let state = initialState;
    const tool = createInspectWorkshopTool(() => state);
    state = { ...state, gates: state.gates.slice(0, 2) };

    await expect(tool.execute({ view: "summary" })).resolves.toMatchObject({
      manca: 2,
    });
  });
});
