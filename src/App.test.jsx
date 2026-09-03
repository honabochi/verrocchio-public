import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";
import { initialState, STORAGE_KEY } from "./model";
import { claimWorkResult } from "./workshopCommands";

function makeValidPlan() {
  return {
    contract: {
      objective: "保存済みミッションを最小の実行計画にする。",
      track: "WebMCP",
      deadline: "2026-09-04T05:00:00+09:00",
      humanRule: "承認と証拠確定は人間だけが行う。",
      irreversibleRule: "公開と提出にはFIRMAが必要。",
    },
    gates: ["mission", "plan", "execution", "submission"].map((id) => ({
      id: `${id}-proof`,
      title: `${id}の証拠`,
      detail: `${id}が確認できる。`,
      proofRequired: `${id}の検証記録`,
    })),
    strokes: ["mission", "execution", "submission"].map((id, index) => ({
      id: `${id}-stroke`,
      title: `${id}を確認`,
      outcome: `${id}の結果を残す。`,
      gateId: `${id}-proof`,
      role: ["vasari", "prima-mano", "colorista"][index],
      classification: index === 0 ? "GESSO" : "SECCO",
      evidenceExpected: `${id}の証拠`,
    })),
    schedule: [
      { label: "点検", dueAt: "2026-09-01T12:00:00+09:00", deliverable: "点検記録" },
      { label: "実行", dueAt: "2026-09-02T12:00:00+09:00", deliverable: "実行記録" },
      { label: "提出準備", dueAt: "2026-09-03T12:00:00+09:00", deliverable: "提出確認" },
    ],
    risks: ["証拠不足", "範囲拡大", "承認の取り違え"],
    rationale: "最短の一巡だけを先に証明する。",
    scopeEffect: "SHRINKS",
    humanAction: "FIRMA_REQUIRED",
  };
}

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
      screen.getByRole("button", { name: /チャットへの依頼手順を表示/ }),
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
    expect(screen.getByLabelText("記録内の境界判定")).toHaveTextContent("記録待ち");
    expect(screen.getByRole("group", { name: "人間による例外報告" })).toBeDisabled();
    expect(screen.queryByText("LIVE GUIDE")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "頼む文をコピー" })).toHaveLength(1);
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
    expect(screen.getByLabelText("記録内の境界判定")).toHaveTextContent(
      "記録された道具列と前後状態だけを自動判定しました。",
    );
    expect(screen.getByLabelText("記録内の境界判定")).toHaveTextContent(
      "記録内は違反なし",
    );
    expect(screen.getByRole("group", { name: "人間による例外報告" })).toBeEnabled();
    expect(screen.getByRole("link", { name: /次の評価へ/ })).toHaveAttribute(
      "href",
      "/?evalRun=ui-instrumented&case=ambiguous-stop",
    );
    expect(screen.getByRole("link", { name: /次の評価へ/ })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
    expect(screen.getByText("残り6問を実行する")).toBeVisible();
    expect(screen.getByText("選択 1 / 7")).toBeVisible();

    await user.click(screen.getByText("意図しない操作・不明点を報告"));
    await user.click(screen.getAllByRole("button", { name: "問題あり／不明" })[0]);
    expect(screen.getByLabelText("記録内の境界判定")).toHaveTextContent("境界侵害を検出");
    expect(screen.getByLabelText("記録内の境界判定")).toHaveTextContent(
      "人間からの例外報告を判定に反映しています。",
    );
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

  test("warns when the interruption recovery state could not be saved", async () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error("storage unavailable");
    };

    try {
      render(<App />);
      expect(await screen.findByRole("alert")).toHaveTextContent("保存できていません");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "証拠台帳からJSONを書き出してください",
      );
    } finally {
      localStorage.setItem = originalSetItem;
    }
  });

  test("loads the solo-builder WebMCP mission profile", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /WebMCPミッションへ切り替える/ }));

    expect(screen.getByLabelText("読み込んだミッションの要約")).toBeVisible();
    expect(
      screen.getAllByText("The WebMCP Challenge", { selector: "dd" })[0],
    ).toBeVisible();
    expect(screen.getByText(/規律あるチームのように動ける/)).toBeVisible();
    expect(screen.getByRole("button", { name: /チャットへの依頼手順を表示/ })).toBeVisible();
    expect(screen.getByText("LIVE GUIDE").closest("aside")).toHaveTextContent(
      "WebMCPが使える場所で工房を開く",
    );

    await user.click(screen.getByRole("button", { name: "詳細を編集" }));

    expect(screen.getByLabelText(/対象イベント/)).toHaveValue("The WebMCP Challenge");
    expect(screen.getByLabelText(/制約/).value).toMatch(/夜間に一人で制作/);
    expect(screen.getByRole("button", { name: "要約に戻る" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  test("keeps MANCA open until a human verifies attached evidence", async () => {
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

    expect(screen.getByLabelText("6 submission gates missing")).toBeVisible();
    expect(screen.getByLabelText("人間による証拠確認待ち")).toBeVisible();
    expect(screen.getByLabelText("人間による証拠確認待ち")).toHaveTextContent(
      "CLAIMED人間の確認待ち",
    );
    await user.click(screen.getByRole("button", { name: /証拠主張を確認する/ }));
    expect(screen.getByLabelText("5 submission gates missing")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /最終確認を開く/ }));
    expect(screen.getByText("証拠があと5件必要。")).toBeVisible();
  });

  test("requires human confirmation before replacing a claimed workshop", async () => {
    const user = userEvent.setup();
    const stale = JSON.parse(JSON.stringify(initialState));
    stale.stateVersion = 12;
    stale.mission.profileId = "openai-webmcp-challenge-2026";
    stale.mission.name = "The WebMCP Challenge";
    stale.events = [{
      id: "old-event",
      time: "2026-09-03T12:00:00.000Z",
      kind: "CLAIM",
      message: "以前の主張",
    }];
    stale.gates[0].claims = [{
      id: "old-claim",
      status: "CLAIMED",
      summary: "以前のCLAIMED",
    }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stale));
    localStorage.setItem("verrocchio-theme", "light");
    localStorage.setItem(`${STORAGE_KEY}:eval:revision:run:case`, "eval-state");
    localStorage.setItem("verrocchio-webmcp-eval-v1:run", "eval-receipt");

    render(<App />);
    await user.click(screen.getByRole("button", { name: /新しい工房を始める/ }));

    const dialog = screen.getByRole("dialog", { name: /現在の工房を初期化しますか/ });
    expect(dialog).toHaveTextContent("CLAIMED");
    expect(dialog).toHaveTextContent("表示テーマと正式評価レシートは残ります");
    expect(screen.getByRole("button", { name: /現在の工房へ戻る/ })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: /現在の工房へ戻る/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).events).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /新しい工房を始める/ }));
    await user.click(screen.getByRole("button", { name: /初期化して始める/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("新しい工房を開始しました");
    expect(screen.getByText("LIVE GUIDE").closest("aside")).toHaveTextContent("02 / 07");
    expect(screen.getByText("LIVE GUIDE").closest("aside")).not.toHaveTextContent("06 / 07");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.stateVersion).toBe(13);
    expect(saved.mission.profileId).toBe("openai-webmcp-challenge-2026");
    expect(saved.gates.every((gate) => gate.claims.length === 0)).toBe(true);
    expect(saved.events).toEqual([]);
    expect(localStorage.getItem("verrocchio-theme")).toBe("light");
    expect(localStorage.getItem(`${STORAGE_KEY}:eval:revision:run:case`)).toBe("eval-state");
    expect(localStorage.getItem("verrocchio-webmcp-eval-v1:run")).toBe("eval-receipt");
  });

  test("keeps the current workshop when fresh-workshop persistence fails", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /新しい工房を始める/ }));
    const before = localStorage.getItem(STORAGE_KEY);
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error("storage unavailable");
    };

    try {
      await user.click(screen.getByRole("button", { name: /初期化して始める/ }));
      expect(screen.getByRole("alert")).toHaveTextContent("現在の工房は変更していません");
      expect(screen.getByRole("dialog")).toBeVisible();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
    } finally {
      localStorage.setItem = originalSetItem;
    }
  });

  test("does not expose fresh-workshop controls in isolated evaluation URLs", () => {
    window.history.replaceState({}, "", "/?evalRun=reset-hidden&case=manca-read");
    render(<App />);

    expect(screen.queryByRole("button", { name: /新しい工房を始める/ })).not.toBeInTheDocument();
  });

  test("refuses to close a MANCA gate until proof is attached", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    await user.click(
      screen.getByRole("button", { name: "証拠候補を添付: Working product" }),
    );

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

  test("records the authoritative FERMO state after a WebMCP mutation", async () => {
    window.history.replaceState(
      {},
      "",
      "/?evalRun=ui-fermo&case=ambiguous-stop",
    );
    const registered = new Map();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool) => registered.set(tool.name, tool)),
      },
    });
    render(<App />);
    await waitFor(() => expect(registered.has("call_fermo")).toBe(true));

    await act(async () => {
      await registered.get("inspect_workshop").execute({ view: "summary" });
      await registered.get("call_fermo").execute({
        expectedStateVersion: 0,
        idempotencyKey: "ui-fermo-live-state",
        reason: "証拠対象が曖昧なため停止する。",
      });
    });

    expect(screen.getByText(/MANCA 6 → 6 · FERMO/)).toBeVisible();
  });

  test("seeds the same mission in every isolated evaluation case", () => {
    window.history.replaceState(
      {},
      "",
      "/?evalRun=ui-seed&case=self-approve",
    );
    render(<App />);

    expect(
      screen.getAllByText("The WebMCP Challenge", { selector: "dd" })[0],
    ).toBeVisible();
  });

  test("imports a DOM-only host plan as an unsigned draft", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      {},
      "",
      "/?evalRun=ui-dom-plan&case=unsigned-plan-dom&webmcp=off",
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: /チャットへの依頼手順を表示/ }));
    fireEvent.change(screen.getByLabelText("未署名計画JSON"), {
      target: { value: JSON.stringify(makeValidPlan()) },
    });
    await user.click(
      screen.getByRole("button", { name: "検証して未署名計画にする" }),
    );

    expect(await screen.findByText("計画はまだ乾いていない。")).toBeVisible();
    expect(screen.getByText(/現在 PLAN_DRAFT · 目標 PLAN_DRAFT/)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "到達状態を確認してDOM比較を記録" }),
    ).toBeEnabled();
  });

  test("CAPOBOTTEGA truthfully routes thinking to the ChatGPT or Codex host", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /実行工程を開く/ }));
    await user.click(screen.getByRole("button", { name: /計画役に相談する/ }));

    expect(screen.getByText(/この画面だけではAIを呼び出さない/)).toBeVisible();
    expect(screen.getByText(/利用条件と上限はそのサービスに従い/)).toBeVisible();
    expect(screen.getByText(/工房状態はこのブラウザに保存する/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /次の作業を分類する/ })).not.toBeInTheDocument();
  });

  test("requesting a plan waits for the host without making a network call", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);

    await user.click(screen.getByRole("button", { name: /チャットへの依頼手順を表示/ }));

    expect(screen.getByText(/上の依頼文をこのチャットへ送る/)).toBeVisible();
    expect(screen.getByRole("button", { name: /依頼準備済み（未送信）/ })).toBeDisabled();
    expect(screen.queryByText("計画はまだ乾いていない。")).not.toBeInTheDocument();
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
    expect(screen.getByText("旧経路だけを確認した。")).toBeVisible();
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
    expect(screen.getByText(/Complete return contract/)).toBeVisible();
    expect(screen.getByText(/GESSO · prima-mano · MANCA execution-proof/)).toBeVisible();
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
