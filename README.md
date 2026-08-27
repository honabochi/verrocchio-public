# VERROCCHIO

> A disciplined team of one.

VERROCCHIO is a browser-native workshop for time-constrained solo builders. It gives one person the coordination layer that normally requires a team: bounded AI roles, interruption-safe context, evidence-gated progress, and human ownership of irreversible decisions.

Hackathons are the first concrete mission, not the limit of the product. This WebMCP Challenge extension uses VERROCCHIO to finish VERROCCHIO itself: agents can inspect the workshop, prepare an unsigned plan, and return work claims, while only the human can verify evidence, give `FIRMA`, or sign `CONSEGNA`.

Generic progress is replaced with `MANCA`: the number of required proofs that are still missing. AI output is a `CLAIMED` result until a human marks it `VERIFIED`.

The engine is hackathon-agnostic. Each event begins by loading a fresh mission
profile: official rules, judging criteria, deadline, track, constraints,
available hands, and the decisions that must remain human.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test and build

```bash
npm test
npm run build
```

The automated suite covers native WebMCP tool registration, state-dependent
tool availability, agent claims versus human verification, mission planning, strict server contracts, dynamic
gate adoption, result return, evidence preservation, proof-gated MANCA
reduction, FERMO, FIRMA, CENACOLO, CAPOBOTTEGA, migration, and CARTONE packets.

## Core path

1. Complete `MISSION INTAKE` in `CONTRATTO`.
2. Ask CAPOBOTTEGA to forge a strict workshop draft.
3. Inspect the proposed CONTRATTO, MANCA, CARTONE, risks, and schedule.
4. Give `FIRMA` to adopt the draft.
5. Run the active CARTONE stroke and return its result contract.
6. Attach or close proof in `GIORNATE`; replan from current evidence.
7. Inspect `CENACOLO` and export the ledger from `EVIDENCE`.
8. Import external Claude, Gemini, or human reviews into the normalized
   CENACOLO return contract.

## WebMCP proof of concept

VERROCCHIO currently registers four imperative WebMCP tools:

- `inspect_workshop` reads MISSION, MANCA, active work, and human boundaries;
- `call_fermo` stops the workshop on uncertainty and leaves resume to the human;
- `forge_workshop_draft` generates an unsigned draft that stops for human FIRMA;
- `return_work_result` records a structured `CLAIMED` result without closing a gate.

Every mutation requires the `stateVersion` returned by the latest inspection
and an idempotency key. Stale calls are rejected, and retries return the stored
receipt instead of repeating the transition.

When FIRMA, FERMO, a plan draft, or an evidence claim needs human attention,
mutation tools are unregistered with `AbortSignal`. The agent cannot call
`give_firma`, `verify_evidence`, `close_gate`, or `sign_consegna` because those
tools do not exist.

Chrome local verification requires the WebMCP testing flag. After enabling
`chrome://flags/#enable-webmcp-testing`, inspect the page with:

```js
const tools = await document.modelContext.getTools();
const inspect = tools.find((tool) => tool.name === "inspect_workshop");
await document.modelContext.executeTool(inspect, JSON.stringify({ view: "summary" }));
```

The August 27 WebMCP work is isolated from the pre-existing Phase 1 history on
the `agent/webmcp-poc` branch.

## 60-second judge path

Open the deployed VERROCCHIO Site in ChatGPT's in-app browser and ask:

> 工房を調べて、まだ不足している証拠と最小の次の一手を教えて。FIRMA・証拠確認・提出は私に残して。

The agent should inspect the workshop through `inspect_workshop`, explain the
current MANCA and next bounded stroke, and leave FIRMA, evidence verification,
and CONSEGNA to the human. A productive follow-up can forge an unsigned plan or
return a work claim. Attempts to self-approve, verify their own evidence, or
submit must stop at the human boundary.

State is saved in browser `localStorage`. `OPENAI_API_KEY` is required only by
the server-side planning and decision routes.

## MISSION and replanning

`/api/workshop-plan` uses the server-configured OpenAI model with a strict schema to compile the
mission into a contract, evidence gates, bounded strokes, a backward schedule,
and risks. A plan is always an unsigned draft until FIRMA. Replanning receives
the current gates, strokes, and evidence; the client preserves completed proof
when adopting a revision.

`OPENAI_MODEL` can change the runtime model without changing the mission
profile. The hackathon's required model or platform belongs in the mission
rules, never in the engine's seed gates.

## CARTONE work packets

`CARTONE` compiles the current contract, CAPOBOTTEGA decision, first missing
submission proof, role duty, stop rule, and return contract into one copyable
handoff. The packet can be aimed at:

- `LA PRIMA MANO` — primary implementation agent;
- `VASARI` — adversarial review, suited to Claude Fable or another critical model;
- `IL COLORISTA` — bounded research and visual synthesis, suited to Gemini or another multimodal model.

Changing the actor changes its duty and stop rule, not the commission. Every
active stroke must return what changed, verification, evidence, and remaining
risk before the next stroke begins.

## CAPOBOTTEGA

Select `ASK CAPOBOTTEGA` from the active GIORNATA and describe one proposed
stroke. The server-side `/api/capobottega` route uses `gpt-5.6-sol` through the
Responses API to return a strict decision contract:

- `AFFRESCO`, `SECCO`, or `GESSO`;
- one evidence-based reason;
- the smallest next stroke;
- the human action, scope effect, and submission gate.

A successful decision is written to the evidence ledger with its model
response ID as an unverified claim. It cannot close its own evidence gate. An `AFFRESCO` decision with
`FIRMA_REQUIRED` hard-locks the GIORNATA; resume is unavailable until the human
explicitly gives FIRMA. `OPENAI_API_KEY` is required in the local or hosted
server environment and is never sent to the browser.

## Supported platform

- Current desktop browsers
- Responsive mobile layout for monitoring and approvals

## One engine, many hackathons

`START BLANK` resets the mission to a neutral intake. `LOAD WEBMCP MISSION`
loads the current OpenAI WebMCP Challenge working profile, including the solo,
after-hours operating constraint. Official rules remain the source of truth
and must be rechecked before publication or final submission.

The historical build log records the first self-referential development run;
it is evidence about the engine, not a permanent contest configuration.

## Multi-model CENACOLO

- CAPOBOTTEGA owns structured planning and reversible/irreversible classification.
- Claude Fable can act as VASARI: attack the thesis, rules interpretation, and likely judge objections.
- Gemini can act as IL COLORISTA: inspect visual/demo quality, alternatives, and multimodal evidence.
- Human or other model reviews use the same `reviewer`, `role`, `verdict`,
  `finding`, `risks`, `recommended next stroke`, and `evidence` contract.
- Reviews are advisory. They never close MANCA or authorize CONSEGNA without
  human FIRMA.

## Current phase

Phase 1 implements the visual workshop, replaceable MISSION profiles, dynamic
strict planning, human adoption boundary, bounded execution packets, structured
result return, external review normalization, evidence ledger, replanning,
deadline-bounded schedules, and CAPOBOTTEGA classification.

The current challenge extension adds native, state-dependent WebMCP tools and
the `CLAIMED → VERIFIED` human checkpoint. Natural-language tool-selection
evals and hosted origin-trial verification remain open.

## Vercel

The repository includes Vercel Functions for both API routes.

```bash
cp .env.example .env.local
npm run build
```

Set `OPENAI_API_KEY` as a Vercel secret and optionally set `OPENAI_MODEL`.

See [the CAPOBOTTEGA evidence note](docs/CAPOBOTTEGA.md) for the runtime
contract and [the Phase 1 audit](docs/PHASE1_AUDIT.md) for the current evidence.
