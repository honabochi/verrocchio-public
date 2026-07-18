// @vitest-environment node
import { describe, expect, test, vi } from "vitest";
import {
  CAPOBOTTEGA_MODEL,
  classifyWork,
  handleCapobottega,
} from "./capobottega.js";

const modelDecision = {
  classification: "SECCO",
  reason: "The change is reversible and should be reviewed later.",
  nextStroke: "Implement the smallest reversible UI change.",
  humanAction: "REVIEW_LATER",
  scopeEffect: "PRESERVES",
  submissionGate: "working-product",
  evidenceNote: "CAPOBOTTEGA selected a reversible path to the live-product gate.",
};

describe("CAPOBOTTEGA server contract", () => {
  test("sends a strict GPT-5.6 Responses request and validates the decision", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "resp_capobottega_test",
          model: CAPOBOTTEGA_MODEL,
          output_text: JSON.stringify(modelDecision),
          usage: { input_tokens: 240, output_tokens: 90, total_tokens: 330 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const decision = await classifyWork(
      {
        work: "Add the CAPOBOTTEGA decision surface.",
        objective: "Complete and prove the hackathon execution workshop.",
        manca: 6,
        missingGates: ["working-product"],
      },
      { apiKey: "test-only-key", fetchImpl },
    );

    const [, init] = fetchImpl.mock.calls[0];
    const requestBody = JSON.parse(init.body);
    expect(requestBody.model).toBe("gpt-5.6-sol");
    expect(requestBody.reasoning).toEqual({ effort: "medium" });
    expect(requestBody.text.format).toMatchObject({
      type: "json_schema",
      name: "capobottega_decision",
      strict: true,
    });
    expect(requestBody.text.format.schema.required).toContain("classification");
    expect(decision).toMatchObject({
      ...modelDecision,
      responseId: "resp_capobottega_test",
      model: "gpt-5.6-sol",
      source: "openai",
    });
  });

  test("rejects unsafe input before calling OpenAI", async () => {
    const fetchImpl = vi.fn();
    await expect(
      classifyWork({ work: "tiny" }, { apiKey: "test-only-key", fetchImpl }),
    ).rejects.toMatchObject({ status: 400, code: "invalid_work" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("returns a safe configuration error when the deployed secret is missing", async () => {
    const request = new Request("https://example.test/api/capobottega", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ work: "Run the complete local verification suite." }),
    });

    const response = await handleCapobottega(request, {});
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "missing_openai_api_key",
    });
  });
});
