// @vitest-environment node
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  handleWorkshopPlan,
  planWorkshop,
} from "./workshop-plan.js";

const modelPlan = {
  contract: {
    objective: "Complete and prove the hackathon execution workshop.",
    track: "Developer Tools",
    deadline: "2026-07-22T09:00:00+09:00",
    humanRule: "The human owns WHY, NO, and FIRMA.",
    irreversibleRule: "Publishing and final submission require FIRMA.",
  },
  gates: [
    {
      id: "mission-proof",
      title: "Mission proof",
      detail: "Mission inputs are complete.",
      proofRequired: "Saved intake and adopted contract.",
    },
    {
      id: "planner-proof",
      title: "GPT-5.6 planner proof",
      detail: "The runtime forges a bounded plan.",
      proofRequired: "Response ID and adopted revision.",
    },
    {
      id: "execution-proof",
      title: "Execution loop proof",
      detail: "A work result returns to the ledger.",
      proofRequired: "Result, verification, evidence, and risk.",
    },
    {
      id: "replan-proof",
      title: "Replan proof",
      detail: "Completed evidence survives replanning.",
      proofRequired: "A second adopted revision.",
    },
  ],
  strokes: [
    {
      id: "adopt-mission",
      title: "Adopt the mission",
      outcome: "The execution contract is signed.",
      gateId: "mission-proof",
      role: "prima-mano",
      classification: "SECCO",
      evidenceExpected: "Saved intake and contract.",
    },
    {
      id: "verify-planner",
      title: "Verify the planner",
      outcome: "The structured plan is observable.",
      gateId: "planner-proof",
      role: "vasari",
      classification: "GESSO",
      evidenceExpected: "Response ID and test result.",
    },
    {
      id: "return-result",
      title: "Return one result",
      outcome: "The workshop records proof and risk.",
      gateId: "execution-proof",
      role: "prima-mano",
      classification: "SECCO",
      evidenceExpected: "A complete return contract.",
    },
  ],
  schedule: [
    {
      label: "Mission",
      dueAt: "2026-07-19T09:00:00+09:00",
      deliverable: "Signed contract",
    },
    {
      label: "Loop",
      dueAt: "2026-07-20T09:00:00+09:00",
      deliverable: "Verified return",
    },
    {
      label: "Replan",
      dueAt: "2026-07-21T09:00:00+09:00",
      deliverable: "Preserved proof",
    },
  ],
  risks: [
    "The system remains a dashboard.",
    "Evidence is claimed but not attached.",
    "Scope expands before Phase 1 exits.",
  ],
  rationale: "Close the operational loop before selecting any workpiece.",
  scopeEffect: "SHRINKS",
  humanAction: "FIRMA_REQUIRED",
};

describe("workshop planner server contract", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-18T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("requests a strict GPT-5.6 plan and validates its graph", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "resp_workshop_plan_test",
          model: "gpt-5.6-sol",
          output_text: JSON.stringify(modelPlan),
          usage: { input_tokens: 600, output_tokens: 500, total_tokens: 1_100 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const plan = await planWorkshop(
      {
        mission: {
          brief:
            "Finish the hackathon execution system before selecting a separate workpiece.",
        },
      },
      { apiKey: "test-only-key", fetchImpl },
    );

    const [, init] = fetchImpl.mock.calls[0];
    const requestBody = JSON.parse(init.body);
    expect(requestBody.model).toBe("gpt-5.6-sol");
    expect(requestBody.reasoning).toEqual({ effort: "medium" });
    expect(requestBody.text.format).toMatchObject({
      type: "json_schema",
      name: "verrocchio_workshop_plan",
      strict: true,
    });
    expect(plan).toMatchObject({
      contract: modelPlan.contract,
      gates: modelPlan.gates,
      strokes: modelPlan.strokes,
      risks: modelPlan.risks,
      rationale: modelPlan.rationale,
      scopeEffect: modelPlan.scopeEffect,
      humanAction: modelPlan.humanAction,
      source: "openai",
      model: "gpt-5.6-sol",
      responseId: "resp_workshop_plan_test",
    });
    expect(plan.schedule.map((item) => item.dueAt)).toEqual([
      "2026-07-19T00:00:00.000Z",
      "2026-07-20T00:00:00.000Z",
      "2026-07-21T00:00:00.000Z",
    ]);
  });

  test("rejects a stroke that targets a nonexistent gate", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "resp_invalid_plan",
          model: "gpt-5.6-sol",
          output_text: JSON.stringify({
            ...modelPlan,
            strokes: [
              { ...modelPlan.strokes[0], gateId: "missing-gate" },
              ...modelPlan.strokes.slice(1),
            ],
          }),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      planWorkshop(
        {
          mission: {
            brief:
              "Finish the hackathon execution system before selecting a separate workpiece.",
          },
        },
        { apiKey: "test-only-key", fetchImpl },
      ),
    ).rejects.toMatchObject({ status: 502, code: "invalid_stroke" });
  });

  test("rejects a backward schedule outside the launch window", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "resp_invalid_schedule",
          model: "gpt-5.6-sol",
          output_text: JSON.stringify({
            ...modelPlan,
            schedule: [
              {
                ...modelPlan.schedule[0],
                dueAt: "2026-07-17T09:00:00+09:00",
              },
              ...modelPlan.schedule.slice(1),
            ],
          }),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      planWorkshop(
        {
          mission: {
            brief:
              "Finish the hackathon execution system before selecting a separate workpiece.",
          },
        },
        { apiKey: "test-only-key", fetchImpl },
      ),
    ).rejects.toMatchObject({ status: 502, code: "invalid_schedule" });
  });

  test("returns a safe configuration error when the secret is missing", async () => {
    const request = new Request("https://example.test/api/workshop-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mission: {
          brief:
            "Finish the hackathon execution system before selecting a separate workpiece.",
        },
      }),
    });

    const response = await handleWorkshopPlan(request, {});
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "missing_openai_api_key",
    });
  });
});
