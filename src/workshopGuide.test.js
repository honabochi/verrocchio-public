import { describe, expect, test } from "vitest";
import { initialState } from "./model";
import { deriveWorkshopGuide } from "./workshopGuide";

function withMission(state = initialState) {
  return {
    ...state,
    mission: { ...state.mission, profileId: "openai-webmcp-challenge-2026" },
  };
}

describe("one-step workshop guide", () => {
  test("starts with mission intake instead of exposing the whole process", () => {
    expect(deriveWorkshopGuide(initialState, "ready")).toMatchObject({
      step: 1,
      actor: "HUMAN",
      view: "contratto",
    });
  });

  test("requires a WebMCP-capable host before asking the agent to work", () => {
    expect(deriveWorkshopGuide(withMission(), "unavailable")).toMatchObject({
      step: 2,
      actor: "SYSTEM",
    });
  });

  test("asks the host for an unsigned draft and leaves FIRMA to the human", () => {
    const result = deriveWorkshopGuide(withMission(), "ready");
    expect(result).toMatchObject({ step: 3, actor: "AI", view: "contratto" });
    expect(result.prompt).toMatch(/FIRMAは私に残して/);
  });

  test("prioritizes plan review over agent work", () => {
    const state = withMission();
    state.mission = { ...state.mission, draftPlan: { contract: {} } };
    expect(deriveWorkshopGuide(state, "ready")).toMatchObject({
      step: 4,
      actor: "HUMAN",
      title: expect.stringMatching(/FIRMAか破棄/),
    });
  });

  test("prioritizes a claimed result for human review", () => {
    const state = withMission();
    state.mission = { ...state.mission, status: "adopted" };
    state.gates = state.gates.map((gate, index) =>
      index === 0 ? { ...gate, claims: [{ id: "claim-1", status: "CLAIMED" }] } : gate,
    );
    expect(deriveWorkshopGuide(state, "ready")).toMatchObject({
      step: 6,
      actor: "HUMAN",
      view: "giornate",
    });
  });

  test("routes adopted work to the active bounded stroke", () => {
    const state = withMission();
    state.mission = { ...state.mission, status: "adopted" };
    expect(deriveWorkshopGuide(state, "ready")).toMatchObject({
      step: 5,
      actor: "AI",
      view: "cartone",
    });
  });

  test("reserves final submission review for the human", () => {
    const state = withMission();
    state.mission = { ...state.mission, status: "adopted" };
    state.gates = state.gates.map((gate) => ({ ...gate, done: true }));
    expect(deriveWorkshopGuide(state, "ready")).toMatchObject({
      step: 7,
      actor: "HUMAN",
      view: "cenacolo",
    });
  });
});
