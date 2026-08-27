import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";

describe("VERROCCHIO core path", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  test("renders the live workshop instead of an empty shell", () => {
    render(<App />);

    expect(screen.getByText("VERROCCHIO")).toBeVisible();
    expect(screen.getByRole("heading", { name: "CONTRATTO" })).toBeVisible();
    expect(screen.getByText("MISSION INTAKE")).toBeVisible();
    expect(screen.getByText("CHATGPTにこう頼む")).toBeVisible();
    expect(screen.getByText(/FIRMA・証拠確認・提出は私に残して/)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /FORGE WORKSHOP/ }),
    ).toBeEnabled();
  });

  test("loads the solo-builder WebMCP mission profile", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "LOAD WEBMCP MISSION" }));

    expect(screen.getByLabelText("Hackathon")).toHaveValue("OpenAI WebMCP Challenge");
    expect(screen.getByLabelText("Constraints").value).toMatch(/夜間に一人で制作/);
  });

  test("begins a giornata, attaches proof, and reduces MANCA", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "GIORNATE work" }));
    await user.click(screen.getByRole("button", { name: "BEGIN GIORNATA" }));
    expect(screen.getByRole("button", { name: "GIORNATA ACTIVE" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Working product 審査員が再ビルドせず利用できるライブデモまたはテスト経路" }));
    const evidence = screen.getByLabelText("Evidence note or URL");
    await user.type(evidence, "Private Sites deployment v1");
    await user.click(screen.getByRole("button", { name: "ATTACH EVIDENCE" }));

    await user.click(screen.getByRole("button", { name: "Mark Working product complete" }));
    expect(screen.getByLabelText("5 submission gates missing")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "CENACOLO final poll" }));
    expect(screen.getByText("証拠があと5件必要。")).toBeVisible();
  });

  test("refuses to close a MANCA gate until proof is attached", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "GIORNATE work" }));
    await user.click(screen.getByRole("button", { name: "Mark Working product complete" }));

    expect(screen.getByRole("heading", { name: "Working product" })).toBeVisible();
    expect(screen.getByLabelText("6 submission gates missing")).toBeVisible();
  });

  test("FERMO holds autonomous work and records the state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "GIORNATE work" }));
    await user.click(screen.getByRole("button", { name: "CALL FERMO" }));
    expect(screen.getByText("FERMO ACTIVE · 人間の判断待ち")).toBeVisible();
    expect(screen.getByRole("button", { name: "RESUME GIORNATA" })).toBeVisible();
  });

  test("CAPOBOTTEGA records a model claim without closing its own evidence gate", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          classification: "GESSO",
          reason: "This is safe local test work.",
          nextStroke: "Add the endpoint contract test.",
          humanAction: "NONE",
          scopeEffect: "PRESERVES",
          submissionGate: "working-product",
          evidenceNote: "The runtime classifier directed its own verification.",
          source: "openai",
          model: "gpt-5.6-sol",
          responseId: "resp_test_capobottega",
          createdAt: "2026-07-18T12:00:00.000Z",
          usage: { inputTokens: 120, outputTokens: 80, totalTokens: 200 },
        }),
      }),
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: "GIORNATE work" }));
    await user.click(screen.getByRole("button", { name: "ASK CAPOBOTTEGA MODEL-RECORDED" }));
    await user.click(screen.getByRole("button", { name: "CLASSIFY THE STROKE" }));

    expect(await screen.findByText("This is safe local test work.")).toBeVisible();
    expect(screen.getAllByText(/resp_test_capobottega/)).toHaveLength(3);
    expect(screen.getByLabelText("6 submission gates missing")).toBeVisible();
    expect(screen.getByRole("button", { name: "VERIFY CLAIM" })).toBeVisible();
  });

  test("AFFRESCO blocks resume until the human gives FIRMA", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          classification: "AFFRESCO",
          reason: "Publishing changes external state and requires the human signature.",
          nextStroke: "Publish the verified build.",
          humanAction: "FIRMA_REQUIRED",
          scopeEffect: "PRESERVES",
          submissionGate: "working-product",
          evidenceNote: "The publication boundary stopped for a human signature.",
          source: "openai",
          model: "gpt-5.6-sol",
          responseId: "resp_test_firma",
          createdAt: "2026-07-18T12:00:00.000Z",
          usage: { inputTokens: 120, outputTokens: 80, totalTokens: 200 },
        }),
      }),
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: "GIORNATE work" }));
    await user.click(screen.getByRole("button", { name: "ASK CAPOBOTTEGA MODEL-RECORDED" }));
    await user.click(screen.getByRole("button", { name: "CLASSIFY THE STROKE" }));

    expect(await screen.findByRole("button", { name: "LOCKED BY FIRMA" })).toBeDisabled();
    expect(screen.getAllByText("FIRMA REQUIRED")[0]).toBeVisible();
    expect(
      screen.getByRole("button", { name: "CAPOBOTTEGA HELD RESOLVE FIRMA FIRST" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "GIVE FIRMA AUTHORIZE THIS STROKE" }));

    expect(screen.getByRole("button", { name: "GIORNATA ACTIVE" })).toBeVisible();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("CARTONE emits a bounded work packet for the next actor", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "CARTONE plan" }));

    expect(
      screen.getByRole("heading", { name: "境界の決まった、ひとつの作業票" }),
    ).toBeVisible();
    expect(screen.getByText(/CARTONE PACKET · LA PRIMA MANO/)).toBeVisible();
    expect(screen.getByText(/公開、支払い、個人データ/)).toBeVisible();
  });

  test("forges a dynamic workshop draft and requires FIRMA before adoption", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          contract: {
            objective: "Complete the operational Phase 1 execution loop.",
            track: "Developer Tools",
            deadline: "2026-07-22T09:00:00+09:00",
            humanRule: "The human owns WHY, NO, and FIRMA.",
            irreversibleRule: "Publishing requires FIRMA.",
          },
          gates: [
            {
              id: "mission-proof",
              title: "Mission proof",
              detail: "Mission is complete.",
              proofRequired: "Saved intake",
            },
            {
              id: "gpt-plan",
              title: "Model plan",
              detail: "Plan is structured.",
              proofRequired: "Response ID",
            },
            {
              id: "execution-proof",
              title: "Execution proof",
              detail: "A result returns.",
              proofRequired: "Return contract",
            },
            {
              id: "replan-proof",
              title: "Replan proof",
              detail: "Evidence survives.",
              proofRequired: "Revision two",
            },
          ],
          strokes: [
            {
              id: "adopt-mission",
              title: "Adopt the mission",
              outcome: "The contract is active.",
              gateId: "mission-proof",
              role: "prima-mano",
              classification: "SECCO",
              evidenceExpected: "Signed contract",
            },
            {
              id: "return-result",
              title: "Return one result",
              outcome: "Evidence enters the ledger.",
              gateId: "execution-proof",
              role: "prima-mano",
              classification: "GESSO",
              evidenceExpected: "Complete return contract",
            },
            {
              id: "replan-proof",
              title: "Replan from proof",
              outcome: "Completed proof survives.",
              gateId: "replan-proof",
              role: "vasari",
              classification: "SECCO",
              evidenceExpected: "Revision two",
            },
          ],
          schedule: [
            { label: "Mission", dueAt: "T-4h", deliverable: "Contract" },
            { label: "Return", dueAt: "T-2h", deliverable: "Evidence" },
            { label: "Replan", dueAt: "T-1h", deliverable: "Revision" },
          ],
          risks: ["Dashboard only", "No proof", "Scope drift"],
          rationale: "Close the operational loop before any workpiece.",
          scopeEffect: "SHRINKS",
          humanAction: "FIRMA_REQUIRED",
          source: "openai",
          model: "gpt-5.6-sol",
          responseId: "resp_plan_ui",
          createdAt: "2026-07-18T12:00:00.000Z",
        }),
      }),
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: /FORGE WORKSHOP/ }));

    expect(await screen.findByText("計画はまだ乾いていない。")).toBeVisible();
    expect(screen.getByText("Complete the operational Phase 1 execution loop.")).toBeVisible();
    expect(screen.getByText("MANCA 06")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "GIVE FIRMA & ADOPT" }));

    expect(screen.getByText("REVISION 01")).toBeVisible();
    expect(screen.getByText("MANCA 04")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "CARTONE plan" }));
    expect(screen.getByText("Adopt the mission")).toBeVisible();
    expect(screen.getByText("BACKWARD SCHEDULE")).toBeVisible();
  });

  test("returns a bounded work result into its target evidence gate", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "CARTONE plan" }));
    await user.click(screen.getByRole("button", { name: "RETURN RESULT" }));
    await user.type(screen.getByLabelText("What changed"), "Mission intake works.");
    await user.type(
      screen.getByLabelText("Verification performed"),
      "Browser interaction passed.",
    );
    await user.type(
      screen.getByLabelText("Evidence path, URL, or response ID"),
      "resp_mission_return",
    );
    await user.type(screen.getByLabelText("Remaining risk"), "Replan is still open.");
    await user.click(screen.getByRole("button", { name: "ATTACH RESULT" }));

    expect(screen.getByText("DONE")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "GIORNATE work" }));
    await user.click(
      screen.getByRole("button", {
        name: /Working product 審査員が再ビルドせず利用できるライブデモ/,
      }),
    );
    expect(screen.getByLabelText("Evidence note or URL").value).toContain(
      "resp_mission_return",
    );
  });

  test("normalizes an external model review without closing a submission gate", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "CENACOLO final poll" }));
    await user.type(
      screen.getByLabelText("Finding"),
      "The demo does not yet prove the judging claim.",
    );
    await user.type(
      screen.getByLabelText("Recommended next stroke"),
      "Record one judge-path walkthrough.",
    );
    await user.click(
      screen.getByRole("button", { name: "RETURN REVIEW TO CENACOLO" }),
    );

    expect(screen.getByText("Claude Fable 5")).toBeVisible();
    expect(screen.getByText("The demo does not yet prove the judging claim.")).toBeVisible();
    expect(screen.getByText("証拠があと6件必要。")).toBeVisible();
  });
});
