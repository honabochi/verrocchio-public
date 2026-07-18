import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "./App";

describe("VERROCCHIO core path", () => {
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

  test("FERMO holds autonomous work and records the state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "CALL FERMO" }));
    expect(screen.getByText("FERMO ACTIVE · waiting for direction")).toBeVisible();
    expect(screen.getByRole("button", { name: "RESUME GIORNATA" })).toBeVisible();
  });
});
