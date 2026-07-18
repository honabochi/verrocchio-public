# VERROCCHIO

> The workshop that paints itself.

VERROCCHIO is a local-first hackathon execution system. It replaces generic task progress with `MANCA`: the number of submission proofs that are still missing. It classifies decisions by reversibility, protects human attention as `OLTREMARE`, and keeps an exportable evidence ledger.

This repository is Phase 1 only: the execution system is being used to direct
and document its own construction. No separate submission workpiece belongs
here until the operational loop passes its exit check.

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

The automated suite covers mission planning, strict server contracts, dynamic
gate adoption, result return, evidence preservation, proof-gated MANCA
reduction, FERMO, FIRMA, CENACOLO, CAPOBOTTEGA, migration, and CARTONE packets.

## Core path

1. Complete `MISSION INTAKE` in `CONTRATTO`.
2. Ask GPT-5.6 Sol to forge a strict workshop draft.
3. Inspect the proposed CONTRATTO, MANCA, CARTONE, risks, and schedule.
4. Give `FIRMA` to adopt the draft.
5. Run the active CARTONE stroke and return its result contract.
6. Attach or close proof in `GIORNATE`; replan from current evidence.
7. Inspect `CENACOLO` and export the ledger from `EVIDENCE`.

State is saved in browser `localStorage`. `OPENAI_API_KEY` is required only by
the server-side planning and decision routes.

## MISSION and replanning

`/api/workshop-plan` uses `gpt-5.6-sol` with a strict schema to compile the
mission into a contract, evidence gates, bounded strokes, a backward schedule,
and risks. A plan is always an unsigned draft until FIRMA. Replanning receives
the current gates, strokes, and evidence; the client preserves completed proof
when adopting a revision.

## CARTONE work packets

`CARTONE` compiles the current contract, CAPOBOTTEGA decision, first missing
submission proof, role duty, stop rule, and return contract into one copyable
handoff. The packet can be aimed at:

- `LA PRIMA MANO` — Codex implementation;
- `VASARI` — adversarial review;
- `IL COLORISTA` — bounded research and visual synthesis.

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

A successful decision is written to the evidence ledger with its OpenAI
response ID and closes the GPT-5.6 evidence gate. An `AFFRESCO` decision with
`FIRMA_REQUIRED` hard-locks the GIORNATA; resume is unavailable until the human
explicitly gives FIRMA. `OPENAI_API_KEY` is required in the local or hosted
server environment and is never sent to the browser.

## Supported platform

- Current desktop browsers
- Responsive mobile layout for monitoring and approvals

## Build Week source of truth

Submission gates were compiled from the OpenAI Build Week Devpost overview, FAQ, and official rules on 2026-07-18. Those official pages remain authoritative.

See [the build log](docs/BUILD_LOG.md) for the first self-referential evidence record.

## Codex and GPT-5.6

- Codex is the primary implementation environment and keeps the principal build thread.
- The initial build thread is `019f74f3-dd34-7403-b286-8f56efb37ad1`.
- GPT-5.6 is used for high-level synthesis, scope decisions, and the self-referential execution design.
- CAPOBOTTEGA uses GPT-5.6 Sol at runtime and records the model, response ID, classification, reason, next stroke, and token usage as evidence.

## Current phase

Phase 1 implements the visual workshop, MISSION intake, dynamic strict planning,
human adoption boundary, bounded execution packets, structured result return,
evidence ledger, replanning, deadline-bounded schedules, and CAPOBOTTEGA
classification. The local Phase 1 exit path is verified. Phase 2 selection,
public repository preparation, video, and submission now begin as a separate
commission under the workshop.

See [the CAPOBOTTEGA evidence note](docs/CAPOBOTTEGA.md) for the runtime
contract and [the Phase 1 audit](docs/PHASE1_AUDIT.md) for the current evidence.
