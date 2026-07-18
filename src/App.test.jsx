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
    expect(screen.getByRole("heading", { name: "What is missing?" })).toBeVisible();
    expect(screen.getByLabelText("6 submission gates missing")).toBeVisible();
    expect(screen.getByRole("button", { name: "BEGIN GIORNATA" })).toBeEnabled();
  });

  test("begins a giornata, attaches proof, and reduces MANCA", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "BEGIN GIORNATA" }));
    expect(screen.getByRole("button", { name: "GIORNATA ACTIVE" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Working product Live demo or test path that judges can use without rebuilding" }));
    const evidence = screen.getByLabelText("Evidence note or URL");
    await user.type(evidence, "Private Sites deployment v1");
    await user.click(screen.getByRole("button", { name: "ATTACH EVIDENCE" }));

    await user.click(screen.getByRole("button", { name: "Mark Working product complete" }));
    expect(screen.getByLabelText("5 submission gates missing")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "CENACOLO final poll" }));
    expect(screen.getByText("5 proofs are missing.")).toBeVisible();
  });

  test("refuses to close a MANCA gate until proof is attached", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Mark Working product complete" }));

    expect(screen.getByRole("heading", { name: "Working product" })).toBeVisible();
    expect(screen.getByLabelText("6 submission gates missing")).toBeVisible();
  });

  test("FERMO holds autonomous work and records the state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "CALL FERMO" }));
    expect(screen.getByText("FERMO ACTIVE · waiting for direction")).toBeVisible();
    expect(screen.getByRole("button", { name: "RESUME GIORNATA" })).toBeVisible();
  });

  test("CAPOBOTTEGA records a GPT-5.6 decision and closes its evidence gate", async () => {
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
    await user.click(screen.getByRole("button", { name: "ASK CAPOBOTTEGA GPT-5.6 SOL" }));
    await user.click(screen.getByRole("button", { name: "CLASSIFY THE STROKE" }));

    expect(await screen.findByText("This is safe local test work.")).toBeVisible();
    expect(screen.getAllByText(/resp_test_capobottega/)).toHaveLength(2);
    expect(screen.getByLabelText("5 submission gates missing")).toBeVisible();
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
    await user.click(screen.getByRole("button", { name: "ASK CAPOBOTTEGA GPT-5.6 SOL" }));
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

    expect(screen.getByRole("heading", { name: "One bounded work packet" })).toBeVisible();
    expect(screen.getByText(/CARTONE PACKET · LA PRIMA MANO/)).toBeVisible();
    expect(screen.getByText(/Stop before publishing/)).toBeVisible();
  });
});
