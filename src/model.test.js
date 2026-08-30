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
    `${STORAGE_KEY}:eval:run-01:ambiguous-stop`,
  );
  expect(workshopStorageKey("?case=ambiguous-stop")).toBe(STORAGE_KEY);

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
  const state = {
    ...initialState,
    gates: [
      {
        id: "result-loop",
        title: "Old result loop",
        detail: "Old detail",
        done: true,
        evidence: "verified result",
      },
    ],
  };
  const next = adoptWorkshopPlan(state, dynamicPlan);
  const preserved = next.gates.find((gate) => gate.id === "result-loop");

  expect(preserved).toMatchObject({
    done: true,
    evidence: "verified result",
  });
});
