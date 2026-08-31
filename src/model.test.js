import { expect, test } from "vitest";
import {
  adoptWorkshopPlan,
  buildWorkPacket,
  exportWorkshop,
  initialState,
  loadWorkshop,
  persistWorkshop,
  remainingTime,
  STORAGE_KEY,
  workshopStorageKey,
} from "./model.js";
import { SOURCE_REVISION } from "./buildIdentity";

const dynamicPlan = {
  contract: {
    objective: "Finish the operational Phase 1 execution loop.",
    track: "Developer Tools",
    deadline: "2026-07-22T09:00:00+09:00",
    humanRule: "Human owns WHY, NO, and FIRMA.",
    irreversibleRule: "External state changes require FIRMA.",
  },
  gates: [
    {
      id: "model-plan",
      title: "Model evidence",
      detail: "A strict workshop plan exists.",
      proofRequired: "Response ID",
    },
    {
      id: "result-loop",
      title: "Result loop",
      detail: "A bounded result returns.",
      proofRequired: "Return contract",
    },
    {
      id: "evidence-loop",
      title: "Evidence loop",
      detail: "Proof is attached.",
      proofRequired: "Evidence path",
    },
    {
      id: "replan-loop",
      title: "Replan loop",
      detail: "Completed proof survives.",
      proofRequired: "Second revision",
    },
  ],
  strokes: [
    {
      id: "forge-plan",
      title: "Forge the plan",
      outcome: "The plan is adopted.",
      gateId: "model-plan",
      role: "prima-mano",
      classification: "SECCO",
      evidenceExpected: "Response ID",
    },
    {
      id: "return-work",
      title: "Return the work",
      outcome: "The result is recorded.",
      gateId: "result-loop",
      role: "prima-mano",
      classification: "GESSO",
      evidenceExpected: "Return contract",
    },
    {
      id: "replan",
      title: "Replan from proof",
      outcome: "The plan preserves evidence.",
      gateId: "replan-loop",
      role: "vasari",
      classification: "SECCO",
      evidenceExpected: "Revision two",
    },
  ],
  schedule: [
    {
      label: "Plan",
      dueAt: "2026-07-19T09:00:00+09:00",
      deliverable: "Revision one",
    },
    {
      label: "Return",
      dueAt: "2026-07-20T09:00:00+09:00",
      deliverable: "Evidence",
    },
    {
      label: "Replan",
      dueAt: "2026-07-21T09:00:00+09:00",
      deliverable: "Revision two",
    },
  ],
  risks: ["Dashboard only", "No proof", "Scope drift"],
  rationale: "Prove the complete control loop.",
  scopeEffect: "PRESERVES",
  humanAction: "FIRMA_REQUIRED",
  model: "gpt-5.6-sol",
  responseId: "resp_dynamic_plan",
  createdAt: "2026-07-18T12:00:00.000Z",
};

test("remainingTime converts the official deadline into a stable countdown", () => {
  const value = remainingTime(
    "2026-07-22T09:00:00+09:00",
    new Date("2026-07-18T09:00:00+09:00"),
  );

  expect(value).toEqual({ days: 4, hours: 0, minutes: 0 });
});

test("exportWorkshop derives MANCA from incomplete gates", () => {
  const exported = JSON.parse(exportWorkshop(initialState));
  expect(exported.manca).toBe(6);
  expect(exported.schema).toBe("verrocchio.workshop.v1");
});

test("buildWorkPacket compiles the contract, next gate, duty, and stop rule", () => {
  const packet = buildWorkPacket(initialState, "prima-mano");

  expect(packet).toContain("CARTONE PACKET · LA PRIMA MANO");
  expect(packet).toContain("Working product");
  expect(packet).toContain("検証可能な最小変更を実装");
  expect(packet).toContain("公開、支払い、個人データ");
});

test("buildWorkPacket gives the blindspot explorer a bounded discovery contract", () => {
  const packet = buildWorkPacket(initialState, "colorista");

  expect(packet).toContain("CARTONE PACKET · 周辺探索・視覚説明");
  expect(packet).toContain("Owner・Codex・Claudeが共有している前提");
  expect(packet).toContain("最大3件または20分で止まる");
  expect(packet).toContain("探索経路と、意図的にずらした軸");
  expect(packet).toContain("根拠URL・日付・一次／二次情報の区別");
  expect(packet).toContain("未探索の範囲、次に確かめる最小の一手");
});

test("loadWorkshop migrates an old held AFFRESCO into a pending FIRMA", () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isHeld: true,
      capobottega: {
        latest: {
          humanAction: "FIRMA_REQUIRED",
          responseId: "resp_old_affresco",
          nextStroke: "Publish the build.",
          reason: "Publishing changes external state.",
        },
      },
    }),
  );

  expect(loadWorkshop().firmaPending).toEqual({
    responseId: "resp_old_affresco",
    title: "Publish the build.",
    reason: "Publishing changes external state.",
  });
});

test("isolates each hosted evaluation case without changing normal storage", () => {
  const evalKey = workshopStorageKey("?evalRun=run-01&case=ambiguous-stop");

  expect(evalKey).toBe(
    `${STORAGE_KEY}:eval:${SOURCE_REVISION}:run-01:ambiguous-stop`,
  );
  expect(workshopStorageKey("?case=ambiguous-stop")).toBe(STORAGE_KEY);
  expect(
    workshopStorageKey("?evalRun=run/a&case=ambiguous-stop"),
  ).toBe(STORAGE_KEY);
  expect(
    workshopStorageKey("?evalRun=%20run-01%20&case=ambiguous-stop"),
  ).toBe(STORAGE_KEY);
  expect(
    workshopStorageKey(
      "?evalRun=run-01&case=ambiguous-stop",
      "f".repeat(40),
    ),
  ).not.toBe(evalKey);

  localStorage.setItem(evalKey, JSON.stringify({ attentionMinutes: 7 }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ attentionMinutes: 42 }));
  expect(loadWorkshop(evalKey).attentionMinutes).toBe(7);
  expect(loadWorkshop().attentionMinutes).toBe(42);
});

test("persistWorkshop reports a failed save instead of claiming continuity", () => {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error("quota exceeded");
  };

  expect(persistWorkshop(initialState)).toBe(false);

  localStorage.setItem = originalSetItem;
  expect(persistWorkshop(initialState)).toBe(true);
});

test("adoptWorkshopPlan replaces static gates and records model proof", () => {
  const next = adoptWorkshopPlan(initialState, dynamicPlan);

  expect(next.contract.objective).toBe(
    "Finish the operational Phase 1 execution loop.",
  );
  expect(next.cartone.revision).toBe(1);
  expect(next.cartone.strokes[0]).toMatchObject({
    id: "forge-plan",
    status: "active",
  });
  expect(next.gates).toHaveLength(4);
  expect(next.gates[0].evidence).toContain("resp_dynamic_plan");
  expect(next.mission.status).toBe("adopted");
  expect(next.events[0].kind).toBe("FIRMA");
});

test("adoptWorkshopPlan preserves completed proof during replanning", () => {
  const adopted = adoptWorkshopPlan(initialState, dynamicPlan);
  const state = {
    ...adopted,
    gates: adopted.gates.map((gate) =>
      gate.id === "result-loop"
        ? { ...gate, done: true, evidence: "verified result" }
        : gate,
    ),
  };
  const next = adoptWorkshopPlan(state, dynamicPlan);
  const preserved = next.gates.find((gate) => gate.id === "result-loop");

  expect(preserved).toMatchObject({
    done: true,
    evidence: "verified result",
  });
});

test("adoptWorkshopPlan invalidates proof when a reused gate id changes meaning", () => {
  const adopted = adoptWorkshopPlan(initialState, dynamicPlan);
  const state = {
    ...adopted,
    gates: adopted.gates.map((gate) =>
      gate.id === "result-loop"
        ? { ...gate, done: true, evidence: "verified old result" }
        : gate,
    ),
  };
  const changedPlan = {
    ...dynamicPlan,
    gates: dynamicPlan.gates.map((gate) =>
      gate.id === "result-loop"
        ? { ...gate, proofRequired: "A different security-relevant proof" }
        : gate,
    ),
  };

  const next = adoptWorkshopPlan(state, changedPlan);
  expect(next.gates.find((gate) => gate.id === "result-loop")).toMatchObject({
    done: false,
    evidence: "",
    claims: [],
  });
});

test("adoptWorkshopPlan invalidates work state when a reused stroke id changes meaning", () => {
  const adopted = adoptWorkshopPlan(initialState, dynamicPlan);
  const completed = {
    ...adopted,
    cartone: {
      ...adopted.cartone,
      strokes: adopted.cartone.strokes.map((stroke) =>
        stroke.id === "forge-plan"
          ? { ...stroke, status: "done", result: { evidence: "old result" } }
          : stroke,
      ),
    },
  };
  const changedPlan = {
    ...dynamicPlan,
    strokes: dynamicPlan.strokes.map((stroke) =>
      stroke.id === "forge-plan"
        ? { ...stroke, outcome: "A materially different result is required." }
        : stroke,
    ),
  };

  const next = adoptWorkshopPlan(completed, changedPlan);
  expect(next.cartone.strokes.find((stroke) => stroke.id === "forge-plan"))
    .toMatchObject({ status: "active", result: null });
});

test("adoptWorkshopPlan invalidates carried proof when only the mission contract changes", () => {
  const adopted = adoptWorkshopPlan(initialState, dynamicPlan);
  const completed = {
    ...adopted,
    gates: adopted.gates.map((gate) =>
      gate.id === "result-loop"
        ? { ...gate, done: true, evidence: "verified old mission" }
        : gate,
    ),
    cartone: {
      ...adopted.cartone,
      strokes: adopted.cartone.strokes.map((stroke) =>
        stroke.id === "forge-plan"
          ? { ...stroke, status: "done", result: { evidence: "old mission result" } }
          : stroke,
      ),
    },
  };
  const changedPlan = {
    ...dynamicPlan,
    contract: {
      ...dynamicPlan.contract,
      objective: "A materially different mission objective.",
    },
  };

  const next = adoptWorkshopPlan(completed, changedPlan);
  expect(next.gates.find((gate) => gate.id === "result-loop")).toMatchObject({
    done: false,
    evidence: "",
    claims: [],
  });
  expect(next.cartone.strokes.find((stroke) => stroke.id === "forge-plan"))
    .toMatchObject({ status: "active", result: null });
});

test("adoptWorkshopPlan excludes completed gates omitted by the new plan", () => {
  const state = {
    ...initialState,
    gates: [
      ...initialState.gates,
      { id: "retired-gate", title: "Retired", detail: "Old", done: true, evidence: "old" },
    ],
  };

  const next = adoptWorkshopPlan(state, dynamicPlan);
  expect(next.gates.some((gate) => gate.id === "retired-gate")).toBe(false);
});

test("adoptWorkshopPlan holds an AFFRESCO first stroke for a separate FIRMA", () => {
  const affrescoPlan = {
    ...dynamicPlan,
    strokes: dynamicPlan.strokes.map((stroke, index) =>
      index === 0 ? { ...stroke, classification: "AFFRESCO" } : stroke,
    ),
  };

  const next = adoptWorkshopPlan(initialState, affrescoPlan);
  expect(next.cartone.strokes[0]).toMatchObject({ status: "queued" });
  expect(next).toMatchObject({ isHeld: true, isRunning: false });
  expect(next.firmaPending).toMatchObject({
    strokeId: "forge-plan",
    title: "Forge the plan",
  });
});
