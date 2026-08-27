const classifications = ["AFFRESCO", "SECCO", "GESSO"];
const roles = ["prima-mano", "vasari", "colorista", "human"];
const scopeEffects = ["SHRINKS", "PRESERVES", "EXPANDS"];

const text = (description, maxLength = 500) => ({
  type: "string",
  minLength: 1,
  maxLength,
  description,
});

const gateSchema = {
  type: "object",
  properties: {
    id: text("Stable lowercase kebab-case gate identifier.", 80),
    title: text("Short Japanese evidence-gate title.", 80),
    detail: text("What must become true.", 500),
    proofRequired: text("Judge-readable or operator-verifiable proof.", 500),
  },
  required: ["id", "title", "detail", "proofRequired"],
  additionalProperties: false,
};

const strokeSchema = {
  type: "object",
  properties: {
    id: text("Stable lowercase kebab-case stroke identifier.", 80),
    title: text("Short Japanese work title.", 80),
    outcome: text("Observable result of this bounded stroke.", 500),
    gateId: text("Identifier of exactly one gate advanced by this stroke.", 80),
    role: { type: "string", enum: roles },
    classification: { type: "string", enum: classifications },
    evidenceExpected: text("Evidence the worker must return.", 500),
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
    label: text("Short Japanese checkpoint label.", 160),
    dueAt: text("ISO-8601 timestamp no later than the contract deadline.", 120),
    deliverable: text("Concrete checkpoint deliverable.", 500),
  },
  required: ["label", "dueAt", "deliverable"],
  additionalProperties: false,
};

export const workshopPlanInputSchema = {
  type: "object",
  properties: {
    expectedStateVersion: {
      type: "integer",
      minimum: 0,
      description: "State version returned by the latest inspect_workshop call.",
    },
    idempotencyKey: text("Stable key for retrying this exact plan proposal.", 64),
    plan: {
      type: "object",
      properties: {
        contract: {
          type: "object",
          properties: {
            objective: text("Japanese mission objective preserved from the workshop.", 1000),
            track: text("Hackathon track or category.", 160),
            deadline: text("ISO-8601 mission deadline.", 120),
            humanRule: text("Decisions that remain human-only.", 1000),
            irreversibleRule: text("Actions requiring FIRMA.", 1000),
          },
          required: ["objective", "track", "deadline", "humanRule", "irreversibleRule"],
          additionalProperties: false,
        },
        gates: { type: "array", minItems: 4, maxItems: 10, items: gateSchema },
        strokes: { type: "array", minItems: 3, maxItems: 12, items: strokeSchema },
        schedule: { type: "array", minItems: 3, maxItems: 10, items: scheduleSchema },
        risks: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: text("Material risk in Japanese.", 500),
        },
        rationale: text("Why this is the smallest responsible plan, in Japanese.", 1500),
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
    },
  },
  required: ["expectedStateVersion", "idempotencyKey", "plan"],
  additionalProperties: false,
};

function requiredText(value, field, maxLength) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.length > maxLength) {
    throw new Error(`INVALID_PLAN: ${field} must contain 1 to ${maxLength} characters.`);
  }
  return normalized;
}

function boundedArray(value, field, minimum, maximum) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new Error(`INVALID_PLAN: ${field} must contain ${minimum} to ${maximum} items.`);
  }
  return value;
}

export function normalizeWorkshopPlan(plan) {
  if (!plan || typeof plan !== "object") throw new Error("INVALID_PLAN: plan is required.");
  const deadline = requiredText(plan.contract?.deadline, "contract.deadline", 120);
  const deadlineTime = Date.parse(deadline);
  if (Number.isNaN(deadlineTime)) {
    throw new Error("INVALID_PLAN: contract.deadline must be ISO-8601.");
  }

  const gateIds = new Set();
  const gates = boundedArray(plan.gates, "gates", 4, 10).map((gate, index) => {
    const id = requiredText(gate?.id, `gates[${index}].id`, 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || gateIds.has(id)) {
      throw new Error("INVALID_PLAN: gate ids must be unique lowercase kebab-case.");
    }
    gateIds.add(id);
    return {
      id,
      title: requiredText(gate.title, `gates[${index}].title`, 80),
      detail: requiredText(gate.detail, `gates[${index}].detail`, 500),
      proofRequired: requiredText(gate.proofRequired, `gates[${index}].proofRequired`, 500),
    };
  });

  const strokeIds = new Set();
  const strokes = boundedArray(plan.strokes, "strokes", 3, 12).map((stroke, index) => {
    const id = requiredText(stroke?.id, `strokes[${index}].id`, 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || strokeIds.has(id)) {
      throw new Error("INVALID_PLAN: stroke ids must be unique lowercase kebab-case.");
    }
    if (!gateIds.has(stroke.gateId)) {
      throw new Error(`INVALID_PLAN: stroke ${id} references an unknown gate.`);
    }
    if (!roles.includes(stroke.role) || !classifications.includes(stroke.classification)) {
      throw new Error(`INVALID_PLAN: stroke ${id} has an invalid role or classification.`);
    }
    strokeIds.add(id);
    return {
      id,
      title: requiredText(stroke.title, `strokes[${index}].title`, 80),
      outcome: requiredText(stroke.outcome, `strokes[${index}].outcome`, 500),
      gateId: stroke.gateId,
      role: stroke.role,
      classification: stroke.classification,
      evidenceExpected: requiredText(
        stroke.evidenceExpected,
        `strokes[${index}].evidenceExpected`,
        500,
      ),
    };
  });

  let previousDueAt = Number.NEGATIVE_INFINITY;
  const schedule = boundedArray(plan.schedule, "schedule", 3, 10).map((item, index) => {
    const dueAtText = requiredText(item?.dueAt, `schedule[${index}].dueAt`, 120);
    const dueAt = Date.parse(dueAtText);
    if (Number.isNaN(dueAt) || dueAt <= previousDueAt || dueAt > deadlineTime) {
      throw new Error("INVALID_PLAN: schedule must be strictly ascending and end by the deadline.");
    }
    previousDueAt = dueAt;
    return {
      label: requiredText(item.label, `schedule[${index}].label`, 160),
      dueAt: new Date(dueAt).toISOString(),
      deliverable: requiredText(item.deliverable, `schedule[${index}].deliverable`, 500),
    };
  });

  return {
    contract: {
      objective: requiredText(plan.contract?.objective, "contract.objective", 1000),
      track: requiredText(plan.contract?.track, "contract.track", 160),
      deadline,
      humanRule: requiredText(plan.contract?.humanRule, "contract.humanRule", 1000),
      irreversibleRule: requiredText(
        plan.contract?.irreversibleRule,
        "contract.irreversibleRule",
        1000,
      ),
    },
    gates,
    strokes,
    schedule,
    risks: boundedArray(plan.risks, "risks", 3, 6).map((risk, index) =>
      requiredText(risk, `risks[${index}]`, 500),
    ),
    rationale: requiredText(plan.rationale, "rationale", 1500),
    scopeEffect: scopeEffects.includes(plan.scopeEffect)
      ? plan.scopeEffect
      : (() => { throw new Error("INVALID_PLAN: scopeEffect is invalid."); })(),
    humanAction: plan.humanAction === "FIRMA_REQUIRED"
      ? plan.humanAction
      : (() => { throw new Error("INVALID_PLAN: humanAction must be FIRMA_REQUIRED."); })(),
  };
}
