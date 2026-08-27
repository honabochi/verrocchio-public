import { CAPOBOTTEGA_MODEL } from "./capobottega.js";

const classifications = ["AFFRESCO", "SECCO", "GESSO"];
const roles = ["prima-mano", "vasari", "colorista", "human"];
const scopeEffects = ["SHRINKS", "PRESERVES", "EXPANDS"];

const gateSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    detail: { type: "string" },
    proofRequired: { type: "string" },
  },
  required: ["id", "title", "detail", "proofRequired"],
  additionalProperties: false,
};

const strokeSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    outcome: { type: "string" },
    gateId: { type: "string" },
    role: { type: "string", enum: roles },
    classification: { type: "string", enum: classifications },
    evidenceExpected: { type: "string" },
  },
  required: [
    "id",
    "title",
    "outcome",
    "gateId",
    "role",
    "classification",
    "evidenceExpected",
  ],
  additionalProperties: false,
};

const scheduleSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    dueAt: {
      type: "string",
      description:
        "ISO-8601 timestamp between currentTime and the contract deadline.",
    },
    deliverable: { type: "string" },
  },
  required: ["label", "dueAt", "deliverable"],
  additionalProperties: false,
};

const outputSchema = {
  type: "object",
  properties: {
    contract: {
      type: "object",
      properties: {
        objective: { type: "string" },
        track: { type: "string" },
        deadline: { type: "string" },
        humanRule: { type: "string" },
        irreversibleRule: { type: "string" },
      },
      required: [
        "objective",
        "track",
        "deadline",
        "humanRule",
        "irreversibleRule",
      ],
      additionalProperties: false,
    },
    gates: {
      type: "array",
      minItems: 4,
      maxItems: 10,
      items: gateSchema,
    },
    strokes: {
      type: "array",
      minItems: 3,
      maxItems: 12,
      items: strokeSchema,
    },
    schedule: {
      type: "array",
      minItems: 3,
      maxItems: 10,
      items: scheduleSchema,
    },
    risks: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string" },
    },
    rationale: { type: "string" },
    scopeEffect: { type: "string", enum: scopeEffects },
    humanAction: { type: "string", enum: ["FIRMA_REQUIRED"] },
  },
  required: [
    "contract",
    "gates",
    "strokes",
    "schedule",
    "risks",
    "rationale",
    "scopeEffect",
    "humanAction",
  ],
  additionalProperties: false,
};

const instructions = `You are il CAPOBOTTEGA planning a hackathon execution workshop.
Turn the supplied mission into an executable CONTRATTO, evidence gates (MANCA),
bounded work strokes (CARTONE), and a deadline-backward schedule.

Rules:
- This is an execution system, not a generic project-management dashboard.
- Preserve the mission's purpose. Never choose or invent a submission workpiece when
  the mission says the meta-system must be completed first.
- Every gate must name judge-readable or operator-verifiable proof.
- Every stroke must close or materially advance exactly one gate.
- Prefer the smallest plan that can reach submission before the deadline.
- Human owns WHY, NO, and FIRMA. Planning adoption always requires FIRMA.
- AFFRESCO means irreversible, external, costly, publishing, purpose-changing,
  scope-expanding, personal-data, or final-submission work.
- SECCO means reversible product or technical judgment.
- GESSO means safe local groundwork.
- In replan mode, preserve completed proof and avoid expanding scope.
- IDs must be stable lowercase kebab-case.
- Contract deadline and every schedule dueAt must be ISO-8601 timestamps.
- Schedule dueAt values must be strictly ascending, must not precede the
  supplied currentTime, and must not exceed the contract deadline.
- Keep every title under 60 characters and every detail, proof, outcome,
  deliverable, risk, and rationale under 180 characters.
- Write all user-facing titles, details, proofs, outcomes, deliverables, risks,
  rationale, and contract prose in natural Japanese. Keep IDs, enum values,
  model names, and VERROCCHIO vocabulary such as CONTRATTO, MANCA, CARTONE,
  FERMO, and FIRMA unchanged.
- State each instruction once and obey the output schema.`;

class WorkshopPlanError extends Error {
  constructor(message, status = 500, code = "workshop_plan_error") {
    super(message);
    this.name = "WorkshopPlanError";
    this.status = status;
    this.code = code;
  }
}

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text) {
    return response.output_text;
  }
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  throw new WorkshopPlanError(
    "CAPOBOTTEGA returned no readable workshop plan.",
    502,
    "empty_model_output",
  );
}

function boundedText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeInput(payload) {
  const mission = payload?.mission || {};
  const brief = boundedText(mission.brief, 4_000);
  if (brief.length < 20) {
    throw new WorkshopPlanError(
      "Describe the mission in at least 20 characters.",
      400,
      "invalid_mission",
    );
  }

  return {
    currentTime: new Date().toISOString(),
    mode: payload?.mode === "replan" ? "replan" : "plan",
    mission: {
      name: boundedText(mission.name, 200),
      brief,
      rules: boundedText(mission.rules, 8_000),
      judgingCriteria: boundedText(mission.judgingCriteria, 4_000),
      deadline: boundedText(mission.deadline, 120),
      track: boundedText(mission.track, 160),
      constraints: boundedText(mission.constraints, 4_000),
      availableAI: boundedText(mission.availableAI, 500),
      candidateIdeas: boundedText(mission.candidateIdeas, 2_000),
      humanBoundary: boundedText(mission.humanBoundary, 1_000),
    },
    current: {
      gates: Array.isArray(payload?.current?.gates)
        ? payload.current.gates.slice(0, 10)
        : [],
      strokes: Array.isArray(payload?.current?.strokes)
        ? payload.current.strokes.slice(0, 12)
        : [],
      evidence: Array.isArray(payload?.current?.evidence)
        ? payload.current.evidence.map(String).slice(0, 30)
        : [],
    },
  };
}

function validatePlan(plan, currentTime) {
  const string = (value) => typeof value === "string" && value.trim();
  const gateIds = new Set();
  const deadlineTime = Date.parse(plan?.contract?.deadline);
  const currentTimeValue = Date.parse(currentTime);
  if (
    !plan?.contract ||
    !string(plan.contract.objective) ||
    !string(plan.contract.deadline) ||
    Number.isNaN(deadlineTime) ||
    !Array.isArray(plan.gates) ||
    plan.gates.length < 4 ||
    plan.gates.length > 10 ||
    !Array.isArray(plan.strokes) ||
    plan.strokes.length < 3 ||
    plan.strokes.length > 12 ||
    !Array.isArray(plan.schedule) ||
    plan.schedule.length < 3 ||
    !Array.isArray(plan.risks) ||
    plan.risks.length < 3 ||
    !scopeEffects.includes(plan.scopeEffect) ||
    plan.humanAction !== "FIRMA_REQUIRED"
  ) {
    throw new WorkshopPlanError(
      "CAPOBOTTEGA returned an invalid workshop plan.",
      502,
      "invalid_model_output",
    );
  }

  const gates = plan.gates.map((gate) => {
    if (
      !string(gate.id) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(gate.id) ||
      gateIds.has(gate.id) ||
      !string(gate.title) ||
      !string(gate.detail) ||
      !string(gate.proofRequired)
    ) {
      throw new WorkshopPlanError(
        "CAPOBOTTEGA returned an invalid gate.",
        502,
        "invalid_gate",
      );
    }
    gateIds.add(gate.id);
    return {
      id: gate.id,
      title: gate.title.trim(),
      detail: gate.detail.trim(),
      proofRequired: gate.proofRequired.trim(),
    };
  });

  const strokeIds = new Set();
  const strokes = plan.strokes.map((stroke) => {
    if (
      !string(stroke.id) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stroke.id) ||
      strokeIds.has(stroke.id) ||
      !gateIds.has(stroke.gateId) ||
      !roles.includes(stroke.role) ||
      !classifications.includes(stroke.classification) ||
      !string(stroke.title) ||
      !string(stroke.outcome) ||
      !string(stroke.evidenceExpected)
    ) {
      throw new WorkshopPlanError(
        "CAPOBOTTEGA returned an invalid work stroke.",
        502,
        "invalid_stroke",
      );
    }
    strokeIds.add(stroke.id);
    return {
      id: stroke.id,
      title: stroke.title.trim(),
      outcome: stroke.outcome.trim(),
      gateId: stroke.gateId,
      role: stroke.role,
      classification: stroke.classification,
      evidenceExpected: stroke.evidenceExpected.trim(),
    };
  });

  let previousDueAt = currentTimeValue - 10 * 60_000;
  const schedule = plan.schedule.map((item) => {
    const dueAt = Date.parse(item?.dueAt);
    if (
      !string(item?.label) ||
      !string(item?.dueAt) ||
      !string(item?.deliverable) ||
      Number.isNaN(dueAt) ||
      dueAt <= previousDueAt ||
      dueAt > deadlineTime
    ) {
      throw new WorkshopPlanError(
        "CAPOBOTTEGA returned an invalid backward schedule.",
        502,
        "invalid_schedule",
      );
    }
    previousDueAt = dueAt;
    return {
      label: boundedText(item.label, 160),
      dueAt: new Date(dueAt).toISOString(),
      deliverable: boundedText(item.deliverable, 500),
    };
  });

  return {
    contract: {
      objective: plan.contract.objective.trim(),
      track: boundedText(plan.contract.track, 160),
      deadline: plan.contract.deadline.trim(),
      humanRule: boundedText(plan.contract.humanRule, 1_000),
      irreversibleRule: boundedText(plan.contract.irreversibleRule, 1_000),
    },
    gates,
    strokes,
    schedule,
    risks: plan.risks.map((risk) => boundedText(risk, 500)),
    rationale: boundedText(plan.rationale, 1_500),
    scopeEffect: plan.scopeEffect,
    humanAction: "FIRMA_REQUIRED",
  };
}

function upstreamError(status) {
  if (status === 401 || status === 403) {
    return new WorkshopPlanError(
      "The workshop API key is not authorized.",
      503,
      "openai_auth_error",
    );
  }
  if (status === 429) {
    return new WorkshopPlanError(
      "The workshop planner is temporarily at its usage limit.",
      503,
      "openai_rate_limit",
    );
  }
  return new WorkshopPlanError(
    "CAPOBOTTEGA could not forge the workshop plan.",
    502,
    "openai_upstream_error",
  );
}

export async function planWorkshop(payload, { apiKey, fetchImpl = fetch } = {}) {
  if (!apiKey) {
    throw new WorkshopPlanError(
      "OPENAI_API_KEY is not configured.",
      503,
      "missing_openai_api_key",
    );
  }
  const input = normalizeInput(payload);
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CAPOBOTTEGA_MODEL,
      store: false,
      reasoning: { effort: "medium" },
      max_output_tokens: 6_000,
      instructions,
      input: JSON.stringify(input),
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "verrocchio_workshop_plan",
          strict: true,
          schema: outputSchema,
        },
      },
    }),
  });

  if (!response.ok) throw upstreamError(response.status);
  const modelResponse = await response.json();
  if (modelResponse.status === "incomplete") {
    throw new WorkshopPlanError(
      "CAPOBOTTEGA's workshop plan was incomplete. Please forge it again.",
      502,
      "incomplete_model_output",
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(extractOutputText(modelResponse));
  } catch (error) {
    if (error instanceof WorkshopPlanError) throw error;
    throw new WorkshopPlanError(
      "CAPOBOTTEGA returned unreadable workshop JSON.",
      502,
      "invalid_model_json",
    );
  }

  return {
    ...validatePlan(parsed, input.currentTime),
    source: "openai",
    model: modelResponse.model || CAPOBOTTEGA_MODEL,
    responseId: modelResponse.id || "unavailable",
    createdAt: new Date().toISOString(),
    usage: {
      inputTokens: modelResponse.usage?.input_tokens ?? null,
      outputTokens: modelResponse.usage?.output_tokens ?? null,
      totalTokens: modelResponse.usage?.total_tokens ?? null,
    },
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function handleWorkshopPlan(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed.", code: "method_not_allowed" }, 405);
  }
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 32_000) {
      throw new WorkshopPlanError("Request is too large.", 413, "request_too_large");
    }
    return jsonResponse(
      await planWorkshop(await request.json(), { apiKey: env.OPENAI_API_KEY }),
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Request must be valid JSON.", code: "invalid_json" }, 400);
    }
    return jsonResponse(
      {
        error: error?.message || "The workshop planner is unavailable.",
        code: error?.code || "workshop_plan_error",
      },
      Number(error?.status) || 500,
    );
  }
}
