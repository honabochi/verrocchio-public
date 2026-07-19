export const CAPOBOTTEGA_MODEL =
  globalThis.process?.env?.OPENAI_MODEL || "gpt-5.6-sol";

const classifications = ["AFFRESCO", "SECCO", "GESSO"];
const humanActions = ["FIRMA_REQUIRED", "REVIEW_LATER", "NONE"];
const scopeEffects = ["SHRINKS", "PRESERVES", "EXPANDS"];
const outputSchema = {
  type: "object",
  properties: {
    classification: { type: "string", enum: classifications },
    reason: {
      type: "string",
      description: "One concise, evidence-based reason for the classification.",
    },
    nextStroke: {
      type: "string",
      description: "The smallest concrete next action that moves toward submission.",
    },
    humanAction: { type: "string", enum: humanActions },
    scopeEffect: { type: "string", enum: scopeEffects },
    submissionGate: {
      type: "string",
      description: "One supplied missing gate ID, or NONE.",
    },
    evidenceNote: {
      type: "string",
      description: "A short ledger entry describing what this decision proves.",
    },
  },
  required: [
    "classification",
    "reason",
    "nextStroke",
    "humanAction",
    "scopeEffect",
    "submissionGate",
    "evidenceNote",
  ],
  additionalProperties: false,
};

const instructions = `You are il CAPOBOTTEGA, the decision steward inside VERROCCHIO.
Classify one proposed stroke without executing it.

Decision materials:
- AFFRESCO: irreversible, external, costly, destructive, privacy-sensitive, purpose-changing, scope-expanding, publishing, or final-submission work. Stop for human FIRMA.
- SECCO: reversible product, design, or technical judgment. Proceed and record it for later human review.
- GESSO: safe local groundwork such as tests, formatting, logs, file organization, or a small reversible bug fix. Proceed autonomously.

The human owns WHY, NO, and FIRMA. The workshop owns HOW.
Prefer the smallest next stroke that closes a submission gate. Never expand scope silently.
State every instruction once, keep the answer concise, and obey the output schema.`;

class CapobottegaError extends Error {
  constructor(message, status = 500, code = "capobottega_error") {
    super(message);
    this.name = "CapobottegaError";
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

  throw new CapobottegaError(
    "CAPOBOTTEGA returned no readable decision.",
    502,
    "empty_model_output",
  );
}

function validateDecision(value) {
  const isString = (field) => typeof value?.[field] === "string" && value[field].trim();

  if (
    !classifications.includes(value?.classification) ||
    !humanActions.includes(value?.humanAction) ||
    !scopeEffects.includes(value?.scopeEffect) ||
    !isString("submissionGate") ||
    !/^(?:NONE|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(value.submissionGate) ||
    !isString("reason") ||
    !isString("nextStroke") ||
    !isString("evidenceNote")
  ) {
    throw new CapobottegaError(
      "CAPOBOTTEGA returned an invalid decision contract.",
      502,
      "invalid_model_output",
    );
  }

  return {
    classification: value.classification,
    reason: value.reason.trim(),
    nextStroke: value.nextStroke.trim(),
    humanAction: value.humanAction,
    scopeEffect: value.scopeEffect,
    submissionGate: value.submissionGate,
    evidenceNote: value.evidenceNote.trim(),
  };
}

function normalizePayload(payload) {
  const work = typeof payload?.work === "string" ? payload.work.trim() : "";
  if (work.length < 6 || work.length > 2_000) {
    throw new CapobottegaError(
      "Describe the proposed work in 6–2,000 characters.",
      400,
      "invalid_work",
    );
  }

  return {
    work,
    objective: String(payload?.objective || "").slice(0, 1_000),
    manca: Number.isFinite(payload?.manca) ? payload.manca : null,
    missingGates: Array.isArray(payload?.missingGates)
      ? payload.missingGates.map(String).slice(0, 10)
      : [],
    irreversibleRule: String(payload?.irreversibleRule || "").slice(0, 800),
  };
}

function publicUpstreamError(status) {
  if (status === 401 || status === 403) {
    return new CapobottegaError(
      "The workshop API key is not authorized.",
      503,
      "openai_auth_error",
    );
  }
  if (status === 429) {
    return new CapobottegaError(
      "CAPOBOTTEGA is temporarily at its usage limit.",
      503,
      "openai_rate_limit",
    );
  }
  return new CapobottegaError(
    "CAPOBOTTEGA could not complete the decision.",
    502,
    "openai_upstream_error",
  );
}

export async function classifyWork(payload, { apiKey, fetchImpl = fetch } = {}) {
  if (!apiKey) {
    throw new CapobottegaError(
      "OPENAI_API_KEY is not configured.",
      503,
      "missing_openai_api_key",
    );
  }

  const input = normalizePayload(payload);
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
      max_output_tokens: 1_200,
      instructions,
      input: JSON.stringify(input),
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "capobottega_decision",
          strict: true,
          schema: outputSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw publicUpstreamError(response.status);
  }

  const modelResponse = await response.json();
  let parsed;
  try {
    parsed = JSON.parse(extractOutputText(modelResponse));
  } catch (error) {
    if (error instanceof CapobottegaError) throw error;
    throw new CapobottegaError(
      "CAPOBOTTEGA returned unreadable structured output.",
      502,
      "invalid_model_json",
    );
  }

  const decision = validateDecision(parsed);
  return {
    ...decision,
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

export async function handleCapobottega(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed.", code: "method_not_allowed" }, 405);
  }

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_000) {
      throw new CapobottegaError("Request is too large.", 413, "request_too_large");
    }
    const payload = await request.json();
    return jsonResponse(await classifyWork(payload, { apiKey: env.OPENAI_API_KEY }));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Request must be valid JSON.", code: "invalid_json" }, 400);
    }
    const status = Number(error?.status) || 500;
    return jsonResponse(
      {
        error: status >= 500 ? error?.message || "CAPOBOTTEGA is unavailable." : error.message,
        code: error?.code || "capobottega_error",
      },
      status,
    );
  }
}
