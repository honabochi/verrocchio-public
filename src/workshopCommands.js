import { createEvent } from "./model";
import { normalizeWorkshopPlan } from "./workshopPlanContract";

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function requestFingerprint(input, actor) {
  const payload = Object.fromEntries(
    Object.entries(input).filter(
      ([key]) => key !== "expectedStateVersion" && key !== "idempotencyKey",
    ),
  );
  const source = stableSerialize({ actor, payload });
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function receipt(transition, state, idempotencyKey, fingerprint, extra = {}) {
  return {
    ok: true,
    receiptId: `receipt-${crypto.randomUUID()}`,
    idempotencyKey,
    requestFingerprint: fingerprint,
    transition,
    stateVersion: (state.stateVersion || 0) + 1,
    manca: state.gates.filter((gate) => !gate.done).length,
    ...extra,
  };
}

function validateMutationMeta(state, input, transition, actor) {
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  if (!idempotencyKey || idempotencyKey.length > 64) {
    throw new Error("INVALID_IDEMPOTENCY_KEY: use 1 to 64 characters.");
  }

  const existing = (state.toolReceipts || []).find(
    (item) => item.idempotencyKey === idempotencyKey,
  );
  const fingerprint = requestFingerprint(input, actor);
  if (existing) {
    if (existing.transition !== transition) {
      throw new Error("IDEMPOTENCY_CONFLICT: the key was used for another transition.");
    }
    if (
      existing.requestFingerprint &&
      existing.requestFingerprint !== fingerprint
    ) {
      throw new Error("IDEMPOTENCY_CONFLICT: the key was reused with another payload.");
    }
    return { existing: { ...existing, replayed: true }, idempotencyKey };
  }

  if (input.expectedStateVersion !== state.stateVersion) {
    throw new Error(
      `STALE_STATE: expected ${input.expectedStateVersion}, current ${state.stateVersion}. Inspect again.`,
    );
  }

  return { existing: null, idempotencyKey, fingerprint };
}

export function proposeWorkshopDraft(state, input, actor = "webmcp-agent") {
  const meta = validateMutationMeta(state, input, "PLAN_DRAFTED", actor);
  if (meta.existing) return { state, receipt: meta.existing };
  if (state.firmaPending) {
    throw new Error("FIRMA_REQUIRED: a human must resolve the pending signature in the UI.");
  }
  if (state.isHeld) {
    throw new Error("FERMO_ACTIVE: only a human can resume the workshop.");
  }
  if (state.mission?.draftPlan) {
    throw new Error("PLAN_DRAFT_ACTIVE: the human must adopt or discard the current draft.");
  }

  const now = new Date().toISOString();
  const planId = `host-plan-${crypto.randomUUID()}`;
  const plan = {
    ...normalizeWorkshopPlan(input.plan),
    source: actor === "webmcp-agent" ? "host-webmcp" : "host-dom-import",
    model: "ChatGPT/Codex host",
    responseId: planId,
    createdAt: now,
    usage: null,
  };
  const planReceipt = receipt("PLAN_DRAFTED", state, meta.idempotencyKey, meta.fingerprint, {
    planRevision: (state.cartone?.revision || 0) + 1,
    planId,
    phase: "PLAN_DRAFT",
    requestedBy: actor,
    next: { actor: "human", action: "GIVE_FIRMA_IN_UI" },
  });
  const nextState = {
    ...state,
    activeView: "contratto",
    mission: {
      ...state.mission,
      planningStatus: "draft",
      planningError: "",
      draftPlan: plan,
    },
    toolReceipts: [planReceipt, ...(state.toolReceipts || [])].slice(0, 20),
    events: [
      createEvent(
        "CAPOBOTTEGA",
        `${actor} proposed ${planId}; the plan remains unsigned until human FIRMA.`,
      ),
      ...state.events,
    ],
  };

  return { state: nextState, receipt: planReceipt };
}

export function claimWorkResult(state, input, actor = "webmcp-agent") {
  const meta = validateMutationMeta(state, input, "RESULT_CLAIMED", actor);
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

  const resultReceipt = receipt("RESULT_CLAIMED", state, meta.idempotencyKey, meta.fingerprint, {
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

export function claimAttachedEvidence(state, gateId, evidenceRef) {
  const proof = String(evidenceRef || "").trim();
  if (!proof || proof.length > 500) {
    throw new Error("INVALID_EVIDENCE_REF: use 1 to 500 characters.");
  }

  const gate = state.gates.find((item) => item.id === gateId);
  if (!gate || gate.done) return state;
  if ((gate.claims || []).some((claim) => claim.status === "CLAIMED")) {
    return state;
  }

  const stroke = state.cartone.strokes.find(
    (item) => item.gateId === gateId && item.status === "active",
  );
  const claim = {
    id: `claim-${crypto.randomUUID()}`,
    strokeId: stroke?.id || null,
    submittedBy: "human-attached",
    submittedAt: new Date().toISOString(),
    status: "CLAIMED",
    summary: `${gate.title}に証拠候補が添付されました。`,
    verification: "未確認。人間による現在性と再現性の確認が必要です。",
    evidenceRef: proof,
    remainingRisk: "証拠の現在性、再現性、対象範囲がまだ確認されていません。",
  };

  return {
    ...state,
    isRunning: stroke ? false : state.isRunning,
    cartone: stroke
      ? {
          ...state.cartone,
          strokes: state.cartone.strokes.map((item) =>
            item.id === stroke.id
              ? { ...item, status: "claimed", result: claim }
              : item,
          ),
        }
      : state.cartone,
    gates: state.gates.map((item) =>
      item.id === gateId
        ? { ...item, claims: [claim, ...(item.claims || [])] }
        : item,
    ),
    events: [
      createEvent(
        "CLAIM",
        `Human attached evidence for ${gate.title}; verification is still required.`,
      ),
      ...state.events,
    ],
  };
}

export function holdWorkshop(state, input, actor = "webmcp-agent") {
  const meta = validateMutationMeta(state, input, "FERMO_CALLED", actor);
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

  const fermoReceipt = receipt("FERMO_CALLED", state, meta.idempotencyKey, meta.fingerprint, {
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

  const claimedStroke = state.cartone.strokes.find(
    (stroke) =>
      stroke.id === verifiedClaim.strokeId && stroke.status === "claimed",
  );
  const completedStrokes = claimedStroke
    ? state.cartone.strokes.map((stroke) =>
        stroke.id === claimedStroke.id ? { ...stroke, status: "done" } : stroke,
      )
    : state.cartone.strokes;
  const nextIndex = claimedStroke
    ? completedStrokes.findIndex((stroke) => stroke.status === "queued")
    : -1;
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

export function requestEvidenceChanges(state, claimId, reason) {
  const normalizedReason = String(reason || "").trim();
  if (!normalizedReason || normalizedReason.length > 500) {
    throw new Error("INVALID_CHANGES_REASON: use 1 to 500 characters.");
  }

  let returnedClaim = null;
  let returnedGate = null;
  const requestedAt = new Date().toISOString();
  const gates = state.gates.map((gate) => {
    const claim = (gate.claims || []).find((item) => item.id === claimId);
    if (!claim || claim.status !== "CLAIMED") return gate;
    returnedClaim = claim;
    returnedGate = gate;
    return {
      ...gate,
      claims: gate.claims.map((item) =>
        item.id === claimId
          ? {
              ...item,
              status: "CHANGES_REQUESTED",
              changesRequestedAt: requestedAt,
              changesRequestedReason: normalizedReason,
            }
          : item,
      ),
    };
  });

  if (!returnedClaim || !returnedGate) return state;

  const strokes = state.cartone.strokes.map((stroke) =>
    stroke.id === returnedClaim.strokeId && stroke.status === "claimed"
      ? { ...stroke, status: "active", result: null }
      : stroke,
  );
  const returnedStroke = strokes.find((stroke) => stroke.id === returnedClaim.strokeId);

  return {
    ...state,
    gates,
    isRunning: false,
    cartone: { ...state.cartone, strokes },
    giornata: returnedStroke
      ? { ...state.giornata, title: returnedStroke.title }
      : state.giornata,
    events: [
      createEvent(
        "CHANGES_REQUESTED",
        `Human returned ${returnedClaim.id} for ${returnedGate.title}: ${normalizedReason}`,
      ),
      ...state.events,
    ],
  };
}
