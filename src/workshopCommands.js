import { createEvent } from "./model";

function receipt(transition, state, idempotencyKey, extra = {}) {
  return {
    ok: true,
    receiptId: `receipt-${crypto.randomUUID()}`,
    idempotencyKey,
    transition,
    stateVersion: (state.stateVersion || 0) + 1,
    manca: state.gates.filter((gate) => !gate.done).length,
    ...extra,
  };
}

function validateMutationMeta(state, input, transition) {
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  if (!idempotencyKey || idempotencyKey.length > 64) {
    throw new Error("INVALID_IDEMPOTENCY_KEY: use 1 to 64 characters.");
  }

  const existing = (state.toolReceipts || []).find(
    (item) => item.idempotencyKey === idempotencyKey,
  );
  if (existing) {
    if (existing.transition !== transition) {
      throw new Error("IDEMPOTENCY_CONFLICT: the key was used for another transition.");
    }
    return { existing: { ...existing, replayed: true }, idempotencyKey };
  }

  if (input.expectedStateVersion !== state.stateVersion) {
    throw new Error(
      `STALE_STATE: expected ${input.expectedStateVersion}, current ${state.stateVersion}. Inspect again.`,
    );
  }

  return { existing: null, idempotencyKey };
}

export function claimWorkResult(state, input, actor = "webmcp-agent") {
  const meta = validateMutationMeta(state, input, "RESULT_CLAIMED");
  if (meta.existing) return { state, receipt: meta.existing };
  if (state.firmaPending) {
    throw new Error("FIRMA_REQUIRED: a human must resolve the pending signature in the UI.");
  }
  if (state.isHeld) {
    throw new Error("FERMO_ACTIVE: only a human can resume the workshop.");
  }

  const stroke = input.strokeId
    ? state.cartone.strokes.find((item) => item.id === input.strokeId)
    : state.cartone.strokes.find((item) => item.status === "active");
  if (!stroke || stroke.status !== "active") {
    throw new Error("NO_ACTIVE_STROKE: inspect the workshop before returning work.");
  }

  const limits = { summary: 800, verification: 500, evidenceRef: 500, remainingRisk: 500 };
  const normalized = {};
  for (const [field, maxLength] of Object.entries(limits)) {
    normalized[field] = String(input[field] || "").trim();
    if (!normalized[field]) {
      throw new Error(`INVALID_RESULT: ${field} is required.`);
    }
    if (normalized[field].length > maxLength) {
      throw new Error(`INVALID_RESULT: ${field} exceeds ${maxLength} characters.`);
    }
  }

  const claim = {
    id: `claim-${crypto.randomUUID()}`,
    strokeId: stroke.id,
    submittedBy: actor,
    submittedAt: new Date().toISOString(),
    status: "CLAIMED",
    ...normalized,
  };

  const resultReceipt = receipt("RESULT_CLAIMED", state, meta.idempotencyKey, {
    claimId: claim.id,
    phase: "EVIDENCE_REVIEW",
    next: { actor: "human", action: "VERIFY_EVIDENCE_IN_UI" },
  });
  const nextState = {
    ...state,
    isRunning: false,
    activeView: "giornate",
    cartone: {
      ...state.cartone,
      strokes: state.cartone.strokes.map((item) =>
        item.id === stroke.id ? { ...item, status: "claimed", result: claim } : item,
      ),
    },
    gates: state.gates.map((gate) =>
      gate.id === stroke.gateId
        ? { ...gate, claims: [claim, ...(gate.claims || [])] }
        : gate,
    ),
    toolReceipts: [resultReceipt, ...(state.toolReceipts || [])].slice(0, 20),
    events: [
      createEvent(
        "CLAIM",
        `${actor} returned ${stroke.title}; human verification is required.`,
      ),
      ...state.events,
    ],
  };

  return {
    state: nextState,
    receipt: resultReceipt,
  };
}

export function holdWorkshop(state, input, actor = "webmcp-agent") {
  const meta = validateMutationMeta(state, input, "FERMO_CALLED");
  if (meta.existing) return { state, receipt: meta.existing };
  if (state.firmaPending) {
    throw new Error("FIRMA_REQUIRED: the workshop is already held for a human signature.");
  }
  if (state.isHeld) {
    throw new Error("FERMO_ACTIVE: only a human can resume the workshop.");
  }

  const reason = String(input.reason || "").trim();
  if (!reason || reason.length > 200) {
    throw new Error("INVALID_FERMO_REASON: use 1 to 200 characters.");
  }

  const fermoReceipt = receipt("FERMO_CALLED", state, meta.idempotencyKey, {
    phase: "FERMO",
    next: { actor: "human", action: "RESUME_IN_UI" },
  });
  const nextState = {
    ...state,
    isRunning: false,
    isHeld: true,
    activeView: "giornate",
    toolReceipts: [fermoReceipt, ...(state.toolReceipts || [])].slice(0, 20),
    events: [
      createEvent("FERMO", `${actor} held the workshop: ${reason}`),
      ...state.events,
    ],
  };

  return { state: nextState, receipt: fermoReceipt };
}

export function verifyEvidenceClaim(state, claimId) {
  let verifiedClaim = null;
  let verifiedGate = null;

  const gates = state.gates.map((gate) => {
    const claim = (gate.claims || []).find((item) => item.id === claimId);
    if (!claim || claim.status !== "CLAIMED") return gate;
    verifiedClaim = claim;
    verifiedGate = gate;
    return {
      ...gate,
      done: true,
      evidence: [gate.evidence, claim.evidenceRef].filter(Boolean).join("\n"),
      claims: gate.claims.map((item) =>
        item.id === claimId
          ? { ...item, status: "VERIFIED", verifiedAt: new Date().toISOString() }
          : item,
      ),
    };
  });

  if (!verifiedClaim || !verifiedGate) return state;

  const completedStrokes = state.cartone.strokes.map((stroke) =>
    stroke.id === verifiedClaim.strokeId ? { ...stroke, status: "done" } : stroke,
  );
  const nextIndex = completedStrokes.findIndex((stroke) => stroke.status === "queued");
  const nextStroke = nextIndex >= 0 ? completedStrokes[nextIndex] : null;
  const strokes = completedStrokes.map((stroke) =>
    nextStroke && stroke.id === nextStroke.id ? { ...stroke, status: "active" } : stroke,
  );

  return {
    ...state,
    gates,
    isRunning: Boolean(nextStroke),
    cartone: { ...state.cartone, strokes },
    giornata: nextStroke
      ? {
          ...state.giornata,
          id: String(nextIndex + 1).padStart(2, "0"),
          title: nextStroke.title,
          classification: nextStroke.classification,
          classificationNote: nextStroke.outcome,
        }
      : state.giornata,
    events: [
      createEvent(
        "VERIFIED",
        `Human verified ${verifiedClaim.id}; ${verifiedGate.title} closed with proof.`,
      ),
      ...state.events,
    ],
  };
}
