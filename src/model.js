import { createHackathonProfile } from "./hackathonProfiles";

export const STORAGE_KEY = "verrocchio-workshop-v2";

const DEFAULT_MISSION = createHackathonProfile();

export const navItems = [
  { id: "contratto", label: "CONTRATTO", gloss: "contract" },
  { id: "cartone", label: "CARTONE", gloss: "plan" },
  { id: "giornate", label: "GIORNATE", gloss: "work" },
  { id: "cenacolo", label: "CENACOLO", gloss: "final poll" },
  { id: "evidence", label: "EVIDENCE", gloss: "proof" },
];

export const initialState = {
  activeView: "contratto",
  attentionMinutes: 42,
  attentionCeiling: 120,
  isRunning: false,
  isHeld: false,
  startedAt: null,
  deadline: DEFAULT_MISSION.deadline,
  contract: {
    objective:
      "Convert one hackathon profile into a verified, judge-ready submission.",
    track: DEFAULT_MISSION.track,
    irreversibleRule:
      "Publishing, payment, personal data, scope changes, and final submission require FIRMA.",
    humanRule: "The human owns WHY and NO. The workshop owns HOW.",
  },
  giornata: {
    id: "01",
    title: "Make VERROCCHIO control its own build",
    classification: "SECCO",
    classificationNote: "proceed, review later",
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
    rationale: "Seed strokes keep the workshop focused on completing Phase 1.",
    risks: [
      "Mistaking a working dashboard for a complete execution system.",
      "Selecting a submission workpiece before the meta-system can direct it.",
      "Spending the launch window on vocabulary instead of verified execution.",
    ],
    schedule: [],
    strokes: [
      {
        id: "mission-intake",
        title: "Make the mission executable",
        outcome: "Rules, deadline, criteria, constraints, and human boundaries are captured.",
        gateId: "working-product",
        role: "prima-mano",
        classification: "SECCO",
        evidenceExpected: "A saved mission that can generate a workshop plan.",
        status: "active",
        result: null,
      },
      {
        id: "dynamic-plan",
        title: "Forge dynamic CONTRATTO, MANCA, and CARTONE",
        outcome: "CAPOBOTTEGA produces a bounded plan that remains a draft until FIRMA.",
        gateId: "model-evidence",
        role: "prima-mano",
        classification: "SECCO",
        evidenceExpected: "A structured model response and adopted plan revision.",
        status: "queued",
        result: null,
      },
      {
        id: "execution-loop",
        title: "Close the execution and replanning loop",
        outcome: "Work results attach proof, update the next stroke, and support replanning.",
        gateId: "working-product",
        role: "prima-mano",
        classification: "SECCO",
        evidenceExpected: "A browser-verified mission-to-result cycle.",
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
      detail: "Live demo or test path that judges can use without rebuilding",
      done: false,
      evidence: "",
    },
    {
      id: "model-evidence",
      title: "Model evidence",
      detail: "Meaningful AI use, key decisions, and runtime evidence documented",
      done: false,
      evidence: "",
    },
    {
      id: "build-evidence",
      title: "Build trail",
      detail: "Primary implementation history, decisions, and verification recorded",
      done: false,
      evidence: "",
    },
    {
      id: "repository",
      title: "Judge-accessible repository",
      detail: "Required visibility, license, README, setup, sample data, and tests",
      done: false,
      evidence: "",
    },
    {
      id: "demo",
      title: "Demo artifact",
      detail: "Match the current hackathon's format, duration, language, and access rules",
      done: false,
      evidence: "",
    },
    {
      id: "submission",
      title: "Final submission",
      detail: "All required fields, category, links, declarations, and receipt",
      done: false,
      evidence: "",
    },
  ],
  reviews: [],
  decisions: [],
  events: [],
};

export function loadWorkshop() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored);
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
          }))
        : initialState.gates,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return initialState;
  }
}

export function persistWorkshop(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    model: "Primary implementation agent",
    duty: "Implement the smallest verified change and leave a reviewable diff.",
    stop: "Stop before publishing, payment, personal data, scope expansion, or final submission.",
  },
  vasari: {
    label: "VASARI",
    model: "Claude Fable, Gemini, or another critical reviewer",
    duty: "Attack the claim, identify the likeliest failure, and require evidence for every conclusion.",
    stop: "Do not rewrite the product purpose or approve your own findings.",
  },
  colorista: {
    label: "IL COLORISTA",
    model: "Gemini, Claude Fable, or another research and visual model",
    duty: "Gather bounded source material and return a concrete visual or research artifact.",
    stop: "Do not make product decisions or expand the commission.",
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
    `Model role: ${role.model}`,
    `Commission: ${state.contract.objective}`,
    `Stroke: ${brief}`,
    `Material: ${material}`,
    `Human boundary: ${humanAction.replaceAll("_", " ")}`,
    `MANCA target: ${nextGate ? `${nextGate.id} · ${nextGate.title}` : "NONE · all gates have proof"}`,
    "",
    "## Duty",
    role.duty,
    "",
    "## Required evidence",
    nextGate?.detail || "Return a final, judge-readable proof record.",
    "",
    "## Stop rule",
    role.stop,
    "",
    "## Return contract",
    "- What changed",
    "- Verification performed",
    "- Evidence path or URL",
    "- Remaining risk",
    "- Whether FIRMA is required next",
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
