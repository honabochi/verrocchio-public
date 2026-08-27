import { workshopPlanInputSchema } from "./workshopPlanContract";

const EMPTY_INPUT_SCHEMA = {
  type: "object",
  properties: {
    view: {
      type: "string",
      enum: ["summary", "manca", "active_work"],
      description: "The workshop slice to inspect.",
    },
  },
  additionalProperties: false,
};

function compactText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

export function inferWorkshopPhase(state) {
  if (state.firmaPending) return "AWAITING_HUMAN_FIRMA";
  if (state.isHeld) return "FERMO";
  if (state.mission?.draftPlan) return "PLAN_DRAFT";
  if (state.gates?.some((gate) =>
    gate.claims?.some((claim) => claim.status === "CLAIMED"),
  )) {
    return "EVIDENCE_REVIEW";
  }
  if (state.cartone?.strokes?.some((stroke) => stroke.status === "active")) {
    return "ACTIVE_STROKE";
  }
  if (state.mission?.status !== "adopted") return "MISSION_DRAFT";
  if (state.gates?.every((gate) => gate.done)) return "READY_FOR_CONSEGNA";
  return "EVIDENCE_REVIEW";
}

function activeStroke(state) {
  return (
    state.cartone?.strokes?.find((stroke) => stroke.status === "active") ||
    state.cartone?.strokes?.find((stroke) => stroke.status === "claimed") ||
    state.cartone?.strokes?.find((stroke) => stroke.status === "queued") ||
    null
  );
}

function gateSummary(gate) {
  const hasClaim = gate.claims?.some((claim) => claim.status === "CLAIMED");
  return {
    id: gate.id,
    title: compactText(gate.title, 80),
    proofRequired: compactText(gate.detail, 160),
    status: gate.done ? "VERIFIED" : gate.evidence || hasClaim ? "CLAIMED" : "MISSING",
  };
}

export function inspectWorkshop(state, view = "summary") {
  const phase = inferWorkshopPhase(state);
  const missingGates = (state.gates || []).filter((gate) => !gate.done);
  const stroke = activeStroke(state);
  const pendingClaim = state.gates
    ?.flatMap((gate) => gate.claims || [])
    .find((claim) => claim.status === "CLAIMED");
  const common = {
    schema: "verrocchio.webmcp.inspect.v1",
    stateVersion: state.stateVersion || 0,
    phase,
    manca: missingGates.length,
    next: state.firmaPending
      ? { actor: "human", action: "GIVE_FIRMA_IN_UI" }
      : pendingClaim
        ? { actor: "human", action: "VERIFY_EVIDENCE_IN_UI" }
        : { actor: "agent_or_human", action: stroke?.title || "REVIEW_EVIDENCE" },
    humanOnly: ["FIRMA", "VERIFY_EVIDENCE", "CONSEGNA"],
  };

  if (view === "manca") {
    return {
      ...common,
      missingGates: missingGates.slice(0, 5).map(gateSummary),
      omittedGates: Math.max(0, missingGates.length - 5),
    };
  }

  if (view === "active_work") {
    return {
      ...common,
      activeWork: stroke
        ? {
            id: stroke.id,
            title: compactText(stroke.title, 100),
            outcome: compactText(stroke.outcome, 280),
            gateId: stroke.gateId,
            classification: stroke.classification,
            evidenceExpected: compactText(stroke.evidenceExpected, 220),
          }
        : null,
    };
  }

  return {
    ...common,
    mission: {
      objective: compactText(state.contract?.objective, 320),
      deadline: state.deadline,
      status: state.mission?.status,
    },
    activeWork: stroke ? { id: stroke.id, title: compactText(stroke.title, 100) } : null,
    firmaPending: state.firmaPending
      ? {
          title: compactText(state.firmaPending.title, 100),
          reason: compactText(state.firmaPending.reason, 240),
        }
      : null,
  };
}

export function createInspectWorkshopTool(getState) {
  return {
    name: "inspect_workshop",
    title: "Inspect VERROCCHIO workshop",
    description:
      "Read the current mission, missing proof gates, active work, and human approval boundary. Use before proposing or continuing work.",
    inputSchema: EMPTY_INPUT_SCHEMA,
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async ({ view = "summary" } = {}) => inspectWorkshop(getState(), view),
  };
}

export function createProposeWorkshopDraftTool(getActions) {
  return {
    name: "propose_workshop_draft",
    title: "Propose an unsigned workshop plan",
    description:
      "Use this after inspect_workshop to submit the smallest structured Japanese plan that can close the mission's evidence gates. The plan stays unsigned; only the human can give FIRMA in the page.",
    inputSchema: workshopPlanInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      untrustedContentHint: true,
    },
    execute: async (input) => getActions().proposeDraft(input),
  };
}

export function createCallFermoTool(getActions) {
  return {
    name: "call_fermo",
    title: "Hold the VERROCCHIO workshop",
    description:
      "Stop execution when scope, evidence, safety, or intent is uncertain. Only the human can resume the workshop in the page.",
    inputSchema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          minLength: 1,
          maxLength: 200,
          description: "Why execution must pause for human review.",
        },
        expectedStateVersion: {
          type: "integer",
          minimum: 0,
          description: "State version returned by the latest inspection.",
        },
        idempotencyKey: {
          type: "string",
          minLength: 1,
          maxLength: 64,
          description: "Stable key for retrying this exact hold request.",
        },
      },
      required: ["reason", "expectedStateVersion", "idempotencyKey"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: true,
    },
    execute: async (input) => getActions().callFermo(input),
  };
}

export function createReturnWorkResultTool(getState, getActions) {
  return {
    name: "return_work_result",
    title: "Return a work result claim",
    description:
      "Return the active stroke's result, verification performed, evidence reference, and remaining risk. Creates an unverified claim and never closes a gate.",
    inputSchema: {
      type: "object",
      properties: {
        strokeId: { type: "string", description: "Active stroke identifier." },
        summary: { type: "string", maxLength: 800, description: "What changed." },
        verification: { type: "string", maxLength: 500, description: "Check that was performed." },
        evidenceRef: { type: "string", maxLength: 500, description: "Evidence path or URL." },
        remainingRisk: { type: "string", maxLength: 500, description: "Known remaining risk." },
        expectedStateVersion: {
          type: "integer",
          minimum: 0,
          description: "State version returned by the latest inspection.",
        },
        idempotencyKey: {
          type: "string",
          minLength: 1,
          maxLength: 64,
          description: "Stable key for retrying this exact result claim.",
        },
      },
      required: [
        "summary",
        "verification",
        "evidenceRef",
        "remainingRisk",
        "expectedStateVersion",
        "idempotencyKey",
      ],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: true,
    },
    execute: async (input) => getActions().returnResult(input),
  };
}

export function registerWorkshopTools({ getState, getActions = () => ({}), modelContext }) {
  const context = modelContext || globalThis.document?.modelContext;
  if (!context?.registerTool) {
    return {
      supported: false,
      registration: Promise.resolve(),
      dispose() {},
    };
  }

  const controller = new AbortController();
  const state = getState();
  const phase = inferWorkshopPhase(state);
  const tools = [createInspectWorkshopTool(getState)];
  if (!["AWAITING_HUMAN_FIRMA", "FERMO", "PLAN_DRAFT", "EVIDENCE_REVIEW"].includes(phase)) {
    tools.push(createCallFermoTool(getActions));
    tools.push(createProposeWorkshopDraftTool(getActions));
    if (state.cartone?.strokes?.some((stroke) => stroke.status === "active")) {
      tools.push(createReturnWorkResultTool(getState, getActions));
    }
  }
  const registration = Promise.all(
    tools.map((tool) =>
      context.registerTool(tool, {
        signal: controller.signal,
      }),
    ),
  );

  return {
    supported: true,
    toolNames: tools.map((tool) => tool.name),
    registration,
    dispose() {
      controller.abort();
    },
  };
}
