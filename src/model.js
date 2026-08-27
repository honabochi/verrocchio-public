import { createHackathonProfile } from "./hackathonProfiles";

export const STORAGE_KEY = "verrocchio-workshop-v2";

function compactStoragePart(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 48);
}

export function workshopStorageKey(search = globalThis.location?.search || "") {
  const params = new URLSearchParams(search);
  const evalRun = compactStoragePart(params.get("evalRun"));
  const evalCase = compactStoragePart(params.get("case"));
  return evalRun && evalCase
    ? `${STORAGE_KEY}:eval:${evalRun}:${evalCase}`
    : STORAGE_KEY;
}

const DEFAULT_MISSION = createHackathonProfile();

const legacyJapaneseText = new Map([
  ["Help a time-constrained solo builder operate like a disciplined team: browser agents inspect the workshop, stop on uncertainty, return claims, and leave approval and proof closure to the human.", "時間に制約のある個人が、規律あるチームのように動けるようにする。ブラウザエージェントは工房を点検し、不確実なら止まり、成果を主張として返す。承認と証拠の確定は人間に残す。"],
  ["Build a meaningful WebMCP extension during the submission period beginning August 25, 2026, and clearly distinguish it from prior work. Submit a judge-accessible live URL; a public repository with source, setup instructions, and a visible open-source license; an English project description covering WebMCP fit, user experience, human-agent collaboration, and implementation; and a public YouTube demo under three minutes with audio. Freeze the submitted Devpost entry, repository, and live site after the deadline. Official rules remain the source of truth.", "2026年8月25日開始の提出期間中に、既存成果との差分が明確なWebMCP拡張を実装する。審査員が使えるライブURL、ソース・導入手順・明示的なOSSライセンスを含む公開リポジトリ、WebMCPとの適合性・利用体験・人間とエージェントの協働・実装方法を説明する英語文、音声付き3分未満の公開YouTubeデモを提出する。締切後はDevpost提出物、リポジトリ、ライブサイトを変更しない。最終判断は公式ルールを正とする。"],
  ["Stage one is pass/fail for theme fit and meaningful WebMCP use. Stage two is equal-weight judging: WebMCP Leverage, Execution, Potential Impact, and Creativity & Ambition.", "第1段階はテーマ適合と実質的なWebMCP利用の合否判定。第2段階はWebMCP Leverage、Execution、Potential Impact、Creativity & Ambitionの4項目を同じ比重で評価する。"],
  ["Solo build in evenings around a full-time job. Optimize for short recoverable sessions, low coordination overhead, and a judge-usable demo. Use the stricter Devpost official-rule deadline: September 3 at 1:00 PM PDT, which is September 4 at 5:00 AM JST. Publishing, deployment, repository visibility, and final submission require human FIRMA.", "フルタイム勤務の合間、夜間に一人で制作する。短時間で中断・復帰でき、調整負荷が小さく、審査員が実際に使えるデモを優先する。締切は厳しい方のDevpost公式ルールを採用し、9月3日13:00 PDT＝9月4日05:00 JSTとする。公開、デプロイ、リポジトリ公開、最終提出には人間のFIRMAが必要。"],
  ["Codex as implementation lead; native WebMCP agents as bounded workshop hands; CAPOBOTTEGA for planning; optional Claude and Gemini as independent reviewers.", "Codexが実装責任者、WebMCPエージェントが範囲を限定した作業者、CAPOBOTTEGAが計画役を担う。必要に応じてClaudeとGeminiを独立レビュー役にする。"],
  ["VERROCCHIO: a human-governed workshop that turns one overloaded participant into a disciplined team of one across research, build, verification, and submission.", "VERROCCHIO：忙しい一人の参加者が、調査・実装・検証・提出を通じて『規律ある一人チーム』として動くための、人間統治つき工房。"],
  ["Agents may inspect, draft, stop, and return evidence claims. Only the human may resume FERMO, give FIRMA, verify evidence, publish, deploy, expose data, or submit.", "エージェントは点検、下書き、停止、証拠主張の返却まで行える。FERMOからの再開、FIRMA、証拠確定、公開、デプロイ、データ開示、提出は人間だけが行う。"],
  ["Convert one hackathon profile into a verified, judge-ready submission.", "一つのハッカソン要綱を、検証済みで審査可能な提出物へ変える。"],
  ["Publishing, payment, personal data, scope changes, and final submission require FIRMA.", "公開、支払い、個人データ、範囲変更、最終提出にはFIRMAが必要。"],
  ["The human owns WHY and NO. The workshop owns HOW.", "人間がWHYとNOを担い、工房がHOWを担う。"],
  ["Make VERROCCHIO control its own build", "VERROCCHIO自身の制作を統治する"],
  ["proceed, review later", "進行可能・後で人間が確認"],
  ["Seed strokes keep the workshop focused on completing Phase 1.", "初期ストロークは、工房がPhase 1の完了へ集中するための足場。"],
  ["Mistaking a working dashboard for a complete execution system.", "動くダッシュボードを、完成した実行システムと誤認すること。"],
  ["Selecting a submission workpiece before the meta-system can direct it.", "メタシステムが指揮できる前に、提出作品を先に決めること。"],
  ["Spending the launch window on vocabulary instead of verified execution.", "検証可能な実行より、用語づくりに制作期間を費やすこと。"],
  ["Make the mission executable", "ミッションを実行可能にする"],
  ["Rules, deadline, criteria, constraints, and human boundaries are captured.", "ルール、締切、評価基準、制約、人間の境界が記録されている。"],
  ["A saved mission that can generate a workshop plan.", "工房計画を生成できる保存済みミッション。"],
  ["Forge dynamic CONTRATTO, MANCA, and CARTONE", "動的なCONTRATTO、MANCA、CARTONEを鍛造する"],
  ["CAPOBOTTEGA produces a bounded plan that remains a draft until FIRMA.", "CAPOBOTTEGAが範囲を限定した計画を作り、FIRMAまでは下書きに留める。"],
  ["A structured model response and adopted plan revision.", "構造化されたモデル応答と、採用済み計画リビジョン。"],
  ["Close the execution and replanning loop", "実行と再計画のループを閉じる"],
  ["Work results attach proof, update the next stroke, and support replanning.", "作業結果に証拠を付け、次のストロークを更新し、再計画へつなげる。"],
  ["A browser-verified mission-to-result cycle.", "ブラウザで検証された、ミッションから成果返却までの一巡。"],
  ["Live demo or test path that judges can use without rebuilding", "審査員が再ビルドせず利用できるライブデモまたはテスト経路"],
  ["Meaningful AI use, key decisions, and runtime evidence documented", "実質的なAI利用、重要判断、実行時証拠が記録されている"],
  ["Primary implementation history, decisions, and verification recorded", "主要な実装履歴、判断、検証結果が記録されている"],
  ["Required visibility, license, README, setup, sample data, and tests", "必要な公開範囲、ライセンス、README、導入手順、サンプルデータ、テストが揃っている"],
  ["Match the current hackathon's format, duration, language, and access rules", "対象ハッカソンの形式、長さ、言語、アクセス条件に合っている"],
  ["All required fields, category, links, declarations, and receipt", "必須項目、カテゴリ、リンク、申告、提出控えが揃っている"],
]);

function localizeLegacyContent(value) {
  if (typeof value === "string") return legacyJapaneseText.get(value) || value;
  if (Array.isArray(value)) return value.map(localizeLegacyContent);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, localizeLegacyContent(item)]),
  );
}

export const navItems = [
  { id: "contratto", label: "CONTRATTO", gloss: "実行条件", lang: "it" },
  { id: "cartone", label: "CARTONE", gloss: "作業計画", lang: "it" },
  { id: "giornate", label: "GIORNATE", gloss: "実行工程", lang: "it" },
  { id: "cenacolo", label: "CENACOLO", gloss: "最終確認", lang: "it" },
  { id: "evidence", label: "EVIDENCE", gloss: "証拠台帳", lang: "en" },
];

export const initialState = {
  contentLocale: "ja-JP",
  stateVersion: 0,
  toolReceipts: [],
  inFlightToolKeys: [],
  activeView: "contratto",
  attentionMinutes: 42,
  attentionCeiling: 120,
  isRunning: false,
  isHeld: false,
  startedAt: null,
  deadline: DEFAULT_MISSION.deadline,
  contract: {
    objective:
      "一つのハッカソン要綱を、検証済みで審査可能な提出物へ変える。",
    track: DEFAULT_MISSION.track,
    irreversibleRule:
      "公開、支払い、個人データ、範囲変更、最終提出にはFIRMAが必要。",
    humanRule: "人間がWHYとNOを担い、工房がHOWを担う。",
  },
  giornata: {
    id: "01",
    title: "VERROCCHIO自身の制作を統治する",
    classification: "SECCO",
    classificationNote: "進行可能・後で人間が確認",
    wetUntil: "23:40",
  },
  capobottega: {
    lastInput: "",
    latest: null,
  },
  mission: {
    status: "seed",
    planningStatus: "idle",
    draftPlan: null,
    ...DEFAULT_MISSION,
  },
  cartone: {
    revision: 0,
    rationale: "初期ストロークは、工房がPhase 1の完了へ集中するための足場。",
    risks: [
      "動くダッシュボードを、完成した実行システムと誤認すること。",
      "メタシステムが指揮できる前に、提出作品を先に決めること。",
      "検証可能な実行より、用語づくりに制作期間を費やすこと。",
    ],
    schedule: [],
    strokes: [
      {
        id: "mission-intake",
        title: "ミッションを実行可能にする",
        outcome: "ルール、締切、評価基準、制約、人間の境界が記録されている。",
        gateId: "working-product",
        role: "prima-mano",
        classification: "SECCO",
        evidenceExpected: "工房計画を生成できる保存済みミッション。",
        status: "active",
        result: null,
      },
      {
        id: "dynamic-plan",
        title: "動的なCONTRATTO、MANCA、CARTONEを鍛造する",
        outcome: "CAPOBOTTEGAが範囲を限定した計画を作り、FIRMAまでは下書きに留める。",
        gateId: "model-evidence",
        role: "prima-mano",
        classification: "SECCO",
        evidenceExpected: "構造化されたモデル応答と、採用済み計画リビジョン。",
        status: "queued",
        result: null,
      },
      {
        id: "execution-loop",
        title: "実行と再計画のループを閉じる",
        outcome: "作業結果に証拠を付け、次のストロークを更新し、再計画へつなげる。",
        gateId: "working-product",
        role: "prima-mano",
        classification: "SECCO",
        evidenceExpected: "ブラウザで検証された、ミッションから成果返却までの一巡。",
        status: "queued",
        result: null,
      },
    ],
  },
  firmaPending: null,
  packetRole: "prima-mano",
  gates: [
    {
      id: "working-product",
      title: "Working product",
      detail: "審査員が再ビルドせず利用できるライブデモまたはテスト経路",
      done: false,
      evidence: "",
      claims: [],
    },
    {
      id: "model-evidence",
      title: "Model evidence",
      detail: "実質的なAI利用、重要判断、実行時証拠が記録されている",
      done: false,
      evidence: "",
      claims: [],
    },
    {
      id: "build-evidence",
      title: "Build trail",
      detail: "主要な実装履歴、判断、検証結果が記録されている",
      done: false,
      evidence: "",
      claims: [],
    },
    {
      id: "repository",
      title: "Judge-accessible repository",
      detail: "必要な公開範囲、ライセンス、README、導入手順、サンプルデータ、テストが揃っている",
      done: false,
      evidence: "",
      claims: [],
    },
    {
      id: "demo",
      title: "Demo artifact",
      detail: "対象ハッカソンの形式、長さ、言語、アクセス条件に合っている",
      done: false,
      evidence: "",
      claims: [],
    },
    {
      id: "submission",
      title: "Final submission",
      detail: "必須項目、カテゴリ、リンク、申告、提出控えが揃っている",
      done: false,
      evidence: "",
      claims: [],
    },
  ],
  reviews: [],
  decisions: [],
  events: [],
};

export function loadWorkshop(storageKey = workshopStorageKey()) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return initialState;
    const parsed = localizeLegacyContent(JSON.parse(stored));
    const latestDecision = parsed.capobottega?.latest;
    const latestWasSigned = (parsed.events || []).some(
      (event) =>
        event.kind === "FIRMA" &&
        latestDecision?.responseId &&
        event.message?.includes(latestDecision.responseId),
    );
    const firmaPending =
      parsed.isHeld &&
      latestDecision?.humanAction === "FIRMA_REQUIRED" &&
      !latestWasSigned
        ? {
            responseId: latestDecision.responseId,
            title: latestDecision.nextStroke,
            reason: latestDecision.reason,
          }
        : parsed.firmaPending || null;
    return {
      ...initialState,
      ...parsed,
      contentLocale: "ja-JP",
      stateVersion: Number.isInteger(parsed.stateVersion) ? parsed.stateVersion : 0,
      toolReceipts: Array.isArray(parsed.toolReceipts)
        ? parsed.toolReceipts.slice(0, 20)
        : [],
      inFlightToolKeys: [],
      contract: { ...initialState.contract, ...parsed.contract },
      giornata: { ...initialState.giornata, ...parsed.giornata },
      capobottega: { ...initialState.capobottega, ...parsed.capobottega },
      mission: {
        ...initialState.mission,
        ...parsed.mission,
        draftPlan: parsed.mission?.draftPlan || null,
      },
      cartone: {
        ...initialState.cartone,
        ...parsed.cartone,
        strokes: Array.isArray(parsed.cartone?.strokes)
          ? parsed.cartone.strokes
          : initialState.cartone.strokes,
        risks: Array.isArray(parsed.cartone?.risks)
          ? parsed.cartone.risks
          : initialState.cartone.risks,
        schedule: Array.isArray(parsed.cartone?.schedule)
          ? parsed.cartone.schedule
          : initialState.cartone.schedule,
      },
      firmaPending,
      packetRole: parsed.packetRole || initialState.packetRole,
      gates: Array.isArray(parsed.gates)
        ? parsed.gates.map((gate) => ({
            ...(initialState.gates.find((seed) => seed.id === gate.id) || {}),
            ...gate,
            claims: Array.isArray(gate.claims) ? gate.claims : [],
          }))
        : initialState.gates,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return initialState;
  }
}

export function persistWorkshop(state, storageKey = workshopStorageKey()) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The workshop remains usable when storage is unavailable or full.
  }
}

export function createEvent(kind, message) {
  return {
    id: `${kind.toLowerCase()}-${crypto.randomUUID()}`,
    time: new Date().toISOString(),
    kind,
    message,
  };
}

export function remainingTime(deadline, now = new Date()) {
  const parsedDeadline = new Date(deadline).getTime();
  if (Number.isNaN(parsedDeadline)) return { days: 0, hours: 0, minutes: 0 };
  const remaining = Math.max(0, parsedDeadline - now.getTime());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

export function exportWorkshop(state) {
  return JSON.stringify(
    {
      schema: "verrocchio.workshop.v1",
      exportedAt: new Date().toISOString(),
      ...state,
      manca: state.gates.filter((gate) => !gate.done).length,
    },
    null,
    2,
  );
}

export function normalizeExternalReview(input) {
  const reviewer = String(input?.reviewer || "").trim();
  const summary = String(input?.summary || "").trim();
  const recommendation = String(input?.recommendation || "").trim();
  if (!reviewer || !summary || !recommendation) {
    throw new Error("Reviewer, finding, and recommended next stroke are required.");
  }

  const verdicts = ["PROCEED", "REVISE", "FERMO"];
  const verdict = verdicts.includes(input?.verdict) ? input.verdict : "REVISE";
  return {
    id: `review-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    reviewer,
    role: String(input?.role || "VASARI").trim(),
    verdict,
    summary,
    risks: String(input?.risks || "").trim(),
    recommendation,
    evidence: String(input?.evidence || "").trim(),
    status: "ADVISORY",
  };
}

const packetRoles = {
  "prima-mano": {
    label: "LA PRIMA MANO",
    model: "主実装エージェント",
    duty: "検証可能な最小変更を実装し、レビューできる差分を残す。",
    stop: "公開、支払い、個人データ、範囲拡大、最終提出の前で止まる。",
  },
  vasari: {
    label: "VASARI",
    model: "Claude Fable、Gemini、その他の批判的レビュー役",
    duty: "主張を反証し、最も起こりやすい失敗を特定し、結論ごとに証拠を求める。",
    stop: "プロダクトの目的を書き換えず、自分の指摘を自分で承認しない。",
  },
  colorista: {
    label: "IL COLORISTA",
    model: "Gemini、Claude Fable、その他の調査・視覚モデル",
    duty: "範囲を限定して資料を集め、具体的なビジュアルまたは調査成果を返す。",
    stop: "プロダクト判断を行わず、依頼範囲を広げない。",
  },
};

export function getPacketRoles() {
  return Object.entries(packetRoles).map(([id, role]) => ({ id, ...role }));
}

export function buildWorkPacket(state, roleId = state.packetRole) {
  const role = packetRoles[roleId] || packetRoles["prima-mano"];
  const activeStroke =
    state.cartone?.strokes?.find((stroke) => stroke.status === "active") ||
    state.cartone?.strokes?.find((stroke) => stroke.status === "queued");
  const nextGate =
    state.gates.find((gate) => gate.id === activeStroke?.gateId) ||
    state.gates.find((gate) => !gate.done);
  const decision = state.capobottega.latest;
  const material =
    decision?.classification ||
    activeStroke?.classification ||
    state.giornata.classification;
  const humanAction = decision?.humanAction || "REVIEW_LATER";
  const brief =
    decision?.nextStroke || activeStroke?.title || state.giornata.title;

  return [
    `# CARTONE PACKET · ${role.label}`,
    "",
    `モデル役割: ${role.model}`,
    `目的: ${state.contract.objective}`,
    `ストローク: ${brief}`,
    `素材分類: ${material}`,
    `人間の境界: ${humanAction.replaceAll("_", " ")}`,
    `MANCA対象: ${nextGate ? `${nextGate.id} · ${nextGate.title}` : "NONE · すべて証拠確認済み"}`,
    "",
    "## 責務",
    role.duty,
    "",
    "## 必要な証拠",
    nextGate?.detail || "審査員が読める最終証拠記録を返す。",
    "",
    "## 停止条件",
    role.stop,
    "",
    "## 返却契約",
    "- 何を変更したか",
    "- 実施した検証",
    "- 証拠のパスまたはURL",
    "- 残るリスク",
    "- 次にFIRMAが必要か",
  ].join("\n");
}

export function adoptWorkshopPlan(state, plan) {
  const previousGates = new Map(state.gates.map((gate) => [gate.id, gate]));
  const previousStrokes = new Map(
    (state.cartone?.strokes || []).map((stroke) => [stroke.id, stroke]),
  );
  const planProof = `${plan.model} · ${plan.responseId} · ${plan.createdAt}`;
  const plannedGates = plan.gates.map((gate) => {
    const previous = previousGates.get(gate.id);
    const normalizedTitle = gate.title.toLowerCase();
    const isModelGate =
      gate.id.includes("model") ||
      gate.id.includes("ai-") ||
      gate.id.includes("gpt") ||
      normalizedTitle.includes("model evidence") ||
      normalizedTitle.includes("ai evidence") ||
      normalizedTitle.includes("gpt");
    return {
      ...gate,
      detail: `${gate.detail} Proof: ${gate.proofRequired}`,
      done: previous?.done || false,
      evidence: previous?.evidence || (isModelGate ? planProof : ""),
    };
  });
  const plannedGateIds = new Set(plannedGates.map((gate) => gate.id));
  const gates = [
    ...plannedGates,
    ...state.gates.filter(
      (gate) => gate.done && !plannedGateIds.has(gate.id),
    ),
  ];
  const strokes = plan.strokes.map((stroke, index) => {
    const previous = previousStrokes.get(stroke.id);
    return {
      ...stroke,
      status: previous?.status || (index === 0 ? "active" : "queued"),
      result: previous?.result || null,
    };
  });
  const firstOpen =
    strokes.find((stroke) => stroke.status === "active") ||
    strokes.find((stroke) => stroke.status === "queued");

  return {
    ...state,
    deadline: Number.isNaN(Date.parse(plan.contract.deadline))
      ? state.deadline
      : plan.contract.deadline,
    contract: {
      objective: plan.contract.objective,
      track: plan.contract.track,
      humanRule: plan.contract.humanRule,
      irreversibleRule: plan.contract.irreversibleRule,
    },
    mission: {
      ...state.mission,
      status: "adopted",
      planningStatus: "complete",
      draftPlan: null,
    },
    cartone: {
      revision: (state.cartone?.revision || 0) + 1,
      rationale: plan.rationale,
      risks: plan.risks,
      schedule: plan.schedule,
      strokes,
    },
    gates,
    giornata: firstOpen
      ? {
          ...state.giornata,
          id: String(strokes.indexOf(firstOpen) + 1).padStart(2, "0"),
          title: firstOpen.title,
          classification: firstOpen.classification,
          classificationNote: firstOpen.outcome,
        }
      : state.giornata,
    isHeld: false,
    isRunning: Boolean(firstOpen),
    events: [
      createEvent(
        "FIRMA",
        `Human adopted workshop revision ${(state.cartone?.revision || 0) + 1} from ${plan.responseId}.`,
      ),
      createEvent(
        "CARTONE",
        `${plan.gates.length} MANCA gates and ${plan.strokes.length} strokes forged by ${plan.model}.`,
      ),
      ...state.events,
    ],
  };
}
