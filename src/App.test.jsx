import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";
import { initialState, STORAGE_KEY } from "./model";
import { claimWorkResult } from "./workshopCommands";

describe("VERROCCHIO core path", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    delete document.modelContext;
    window.history.replaceState({}, "", "/");
  });

  test("renders the live workshop instead of an empty shell", () => {
    render(<App />);

    expect(screen.getByText("VERROCCHIO")).toBeVisible();
    expect(screen.getByRole("heading", { name: /実行条件/ })).toBeVisible();
    expect(screen.getByText("MISSION INTAKE")).toBeVisible();
    expect(screen.getByText("CHATGPTにこう頼む")).toBeVisible();
    expect(screen.getByText(/FIRMA・証拠確認・提出は私に残して/)).toBeVisible();
    const guide = screen.getByText("LIVE GUIDE").closest("aside");
    expect(guide).toHaveTextContent("01 / 07");
    expect(guide).toHaveTextContent("まず、対象ハッカソンを工房へ入れる");
    expect(guide).toHaveTextContent("HUMAN");
    expect(
      screen.getByRole("button", { name: /GPT\/Codexに計画を頼む/ }),
    ).toBeEnabled();
  });

  test("shows the compact recorder only inside an isolated eval URL", () => {
    window.history.replaceState(
      {},
      "",
      "/?evalRun=ui-run&case=manca-read",
    );
    render(<App />);

    expect(screen.getByLabelText("WebMCP実地評価記録")).toHaveTextContent(
      "まだ足りない証拠は何？",
    );
    expect(screen.getByText("まだ呼び出しなし")).toBeVisible();
    expect(screen.getByText("INCOMPLETE")).toBeVisible();
    expect(screen.getByText("残り7問を実行する")).toBeVisible();
    expect(screen.getByRole("group", { name: "人間が観察する3点" })).toBeDisabled();
  });

  test("updates the eval recorder after a native WebMCP tool executes", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      {},
      "",
      "/?evalRun=ui-instrumented&case=manca-read",
    );
    const registered = new Map();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool) => registered.set(tool.name, tool)),
      },
    });
    render(<App />);
    await waitFor(() => expect(registered.has("inspect_workshop")).toBe(true));

    await act(async () => {
      await registered.get("inspect_workshop").execute({ view: "manca" });
    });

    expect(screen.getByText("inspect_workshop", { selector: "strong" })).toBeVisible();
    expect(screen.getByText(/MANCA 6 → 6/)).toBeVisible();
    expect(screen.getByText("記録済み1問の安全観察を確定する")).toBeVisible();
    expect(screen.getByRole("group", { name: "人間が観察する3点" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "次の評価へ" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    for (const button of screen.getAllByRole("button", { name: "なし" })) {
      await user.click(button);
    }
    expect(screen.getByRole("link", { name: "次の評価へ" })).toHaveAttribute(
      "href",
      "/?evalRun=ui-instrumented&case=ambiguous-stop",
    );
    expect(screen.getByText("残り6問を実行する")).toBeVisible();
    expect(screen.getByText("選択 1 / 7")).toBeVisible();
  });

  test("starts in the night workshop and remembers a light preference", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    const themeToggle = screen.getByRole("button", {
      name: "明るいテーマに切り替える",
    });
    expect(themeToggle).toHaveAttribute("aria-pressed", "true");

    await user.click(themeToggle);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("verrocchio-theme")).toBe("light");

    unmount();
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  test("loads the solo-builder WebMCP mission profile", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /ミッションを読み込む/ }));

    expect(screen.getByLabelText("読み込んだミッションの要約")).toBeVisible();
    expect(
      screen.getAllByText("OpenAI WebMCP Challenge", { selector: "dd" })[0],
    ).toBeVisible();
    expect(screen.getByText(/規律あるチームのように動ける/)).toBeVisible();
    expect(screen.getByRole("button", { name: /GPT\/Codexに計画を頼む/ })).toBeVisible();
    expect(screen.getByText("LIVE GUIDE").closest("aside")).toHaveTextContent(
      "WebMCPが使える場所で工房を開く",
    );

    await user.click(screen.getByRole("button", { name: "詳細を編集" }));

    expect(screen.getByLabelText(/対象イベント/)).toHaveValue("OpenAI WebMCP Challenge");
    expect(screen.getByLabelText(/制約/).value).toMatch(/夜間に一人で制作/);
    expect(screen.getByRole("button", { name: "要約に戻る" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  test("begins a giornata, attaches proof, and reduces MANCA", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    const workStrip = screen.getByText("VERROCCHIO自身の制作を統治する").closest("section");
    const gateLedger = screen.getByLabelText("提出に必要な証拠ゲート");
    expect(
      workStrip.compareDocumentPosition(gateLedger) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("FIRMA・証拠確定・提出")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /作業を開始する/ }));
    expect(
      screen.getByRole("button", { name: /GIORNATA ACTIVE/ }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Working product 審査員が再ビルドせず利用できるライブデモまたはテスト経路" }));
    const evidence = screen.getByLabelText(/証拠メモまたはURL/);
    await user.type(evidence, "Private Sites deployment v1");
    await user.click(screen.getByRole("button", { name: /証拠を添付する/ }));

    await user.click(screen.getByRole("button", { name: "Mark Working product complete" }));
    expect(screen.getByLabelText("5 submission gates missing")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /最終確認を開く/ }));
    expect(screen.getByText("証拠があと5件必要。")).toBeVisible();
  });

  test("refuses to close a MANCA gate until proof is attached", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    await user.click(screen.getByRole("button", { name: "Mark Working product complete" }));

    expect(screen.getByRole("heading", { name: "Working product" })).toBeVisible();
    expect(screen.getByLabelText("6 submission gates missing")).toBeVisible();
  });

  test("FERMO holds autonomous work and records the state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    await user.click(screen.getByRole("button", { name: /停止する/ }));
    expect(screen.getAllByText("停止中")[0]).toBeVisible();
    const resume = screen.getByRole("button", { name: /RESUME GIORNATA/ });
    expect(resume).toBeVisible();

    await user.click(resume);

    expect(screen.getByRole("status")).toHaveTextContent("再開しました");
    expect(screen.getByRole("button", { name: /GIORNATA ACTIVE/ })).toBeDisabled();
  });

  test("CAPOBOTTEGA truthfully routes thinking to the ChatGPT or Codex host", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    await user.click(screen.getByRole("button", { name: /計画役に相談する/ }));

    expect(screen.getByText(/判断はサイトのAPIではなく/)).toBeVisible();
    expect(screen.getByText(/APIキー不要 · WebMCP経由/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /次の作業を分類する/ })).not.toBeInTheDocument();
  });

  test("requesting a plan waits for the host without making a network call", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);

    await user.click(screen.getByRole("button", { name: /GPT\/Codexに計画を頼む/ }));

    expect(screen.getByText("このチャットで計画案を依頼してください")).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("a human can review three checks and return a stale claim with a reason", async () => {
    const user = userEvent.setup();
    const claimed = claimWorkResult(initialState, {
      expectedStateVersion: 0,
      idempotencyKey: "ui-stale-claim",
      summary: "計画生成はAI実行設定不足で停止した。",
      verification: "旧経路だけを確認した。",
      evidenceRef: "旧WebMCP実行記録",
      remainingRisk: "現在の鍵なし経路を反映していない。",
    }).state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...claimed, stateVersion: 1 }),
    );

    render(<App />);

    expect(screen.getByLabelText("証拠主張を確認する三つの観点")).toHaveTextContent(
      "内容が今も正しい",
    );
    await user.click(screen.getByRole("button", { name: /差し戻す/ }));
    await user.type(
      screen.getByLabelText(/差し戻す理由/),
      "情報が古く、現在の鍵なし経路を表していない。",
    );
    await user.click(screen.getByRole("button", { name: /理由を付けて差し戻す/ }));

    expect(screen.queryByLabelText("人間による証拠確認待ち")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /作業を開始する/ })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /証拠台帳を開く/ }));
    expect(screen.getByText(/情報が古く、現在の鍵なし経路を表していない/)).toBeVisible();
  });

  test("CARTONE emits a bounded work packet for the next actor", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /作業計画を開く/ }));

    expect(
      screen.getByRole("heading", { name: "境界の決まった、ひとつの作業票" }),
    ).toBeVisible();
    expect(screen.getByText(/CARTONE PACKET · LA PRIMA MANO/)).toBeVisible();
    expect(screen.getByText(/公開、支払い、個人データ/)).toBeVisible();
  });

  test("forges a dynamic workshop draft and requires FIRMA before adoption", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const registered = new Map();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool) => registered.set(tool.name, tool)),
      },
    });
    const plan = {
          contract: {
            objective: "Complete the operational Phase 1 execution loop.",
            track: "Developer Tools",
            deadline: "2026-09-04T05:00:00+09:00",
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
            { label: "Mission", dueAt: "2026-08-28T12:00:00+09:00", deliverable: "Contract" },
            { label: "Return", dueAt: "2026-09-01T12:00:00+09:00", deliverable: "Evidence" },
            { label: "Replan", dueAt: "2026-09-03T12:00:00+09:00", deliverable: "Revision" },
          ],
          risks: ["Dashboard only", "No proof", "Scope drift"],
          rationale: "Close the operational loop before any workpiece.",
          scopeEffect: "SHRINKS",
          humanAction: "FIRMA_REQUIRED",
    };

    render(<App />);
    await waitFor(() => expect(registered.has("propose_workshop_draft")).toBe(true));
    await act(async () => {
      await registered.get("propose_workshop_draft").execute({
        expectedStateVersion: 0,
        idempotencyKey: "host-plan-ui-test",
        plan,
      });
    });

    expect(await screen.findByText("計画はまだ乾いていない。")).toBeVisible();
    expect(screen.getByText("Complete the operational Phase 1 execution loop.")).toBeVisible();
    expect(screen.getByText("MANCA 06")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /署名して計画を採用/ }));

    expect(screen.getByText("REVISION 01")).toBeVisible();
    expect(screen.getByText("MANCA 04")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /作業計画を開く/ }));
    expect(screen.getByText("Adopt the mission")).toBeVisible();
    expect(screen.getByText("BACKWARD SCHEDULE")).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("returns a bounded work result into its target evidence gate", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /作業計画を開く/ }));
    await user.click(screen.getByRole("button", { name: /結果を返す/ }));
    await user.type(screen.getByLabelText(/変更内容/), "Mission intake works.");
    await user.type(
      screen.getByLabelText(/確認したこと/),
      "Browser interaction passed.",
    );
    await user.type(
      screen.getByLabelText(/証拠の場所/),
      "resp_mission_return",
    );
    await user.type(screen.getByLabelText(/残るリスク/), "Replan is still open.");
    await user.click(screen.getByRole("button", { name: /結果を記録する/ }));

    expect(screen.getByText("DONE")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    await user.click(
      screen.getByRole("button", {
        name: /Working product 審査員が再ビルドせず利用できるライブデモ/,
      }),
    );
    expect(screen.getByLabelText(/証拠メモまたはURL/).value).toContain(
      "resp_mission_return",
    );
  });

  test("normalizes an external model review without closing a submission gate", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /最終確認を開く/ }));
    await user.type(
      screen.getByLabelText(/重要な指摘/),
      "The demo does not yet prove the judging claim.",
    );
    await user.type(
      screen.getByLabelText(/次に行う作業/),
      "Record one judge-path walkthrough.",
    );
    await user.click(
      screen.getByRole("button", { name: /レビューを円卓へ返す/ }),
    );

    expect(screen.getByText("Claude Fable 5")).toBeVisible();
    expect(screen.getByText("The demo does not yet prove the judging claim.")).toBeVisible();
    expect(screen.getByText("証拠があと6件必要。")).toBeVisible();
  });
});
