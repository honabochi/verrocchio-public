# VERROCCHIO

> The workshop that paints itself.

VERROCCHIO is a local-first hackathon execution system. It replaces generic task progress with `MANCA`: the number of submission proofs that are still missing. It classifies decisions by reversibility, protects human attention as `OLTREMARE`, and keeps an exportable evidence ledger.

This repository is VERROCCHIO's first workpiece: the system is being used to
direct and document its own construction before it directs a separate payload.

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

The automated suite covers the submission-count model plus the core UI path:
initial render, GIORNATA start, proof-gated MANCA reduction, FERMO, FIRMA,
CENACOLO, CAPOBOTTEGA, old-state migration, and CARTONE work packets.

## Core path

1. Open `GIORNATE`.
2. Begin the current work session.
3. Attach evidence to a missing gate by selecting its ledger row.
4. Mark a gate complete only when proof exists.
5. Call `FERMO` to hold autonomous work.
6. Inspect `CENACOLO` for the final go/no-go poll.
7. Export the evidence ledger from `EVIDENCE`.

State is saved in browser `localStorage`; no account or backend is required for Phase 1.

## CARTONE work packets

`CARTONE` compiles the current contract, CAPOBOTTEGA decision, first missing
submission proof, role duty, stop rule, and return contract into one copyable
handoff. The packet can be aimed at:

- `LA PRIMA MANO` — Codex implementation;
- `VASARI` — adversarial review;
- `IL COLORISTA` — bounded research and visual synthesis.

Changing the actor changes its duty and stop rule, not the commission. This is
the bridge from the execution system to the separate payload build.

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

Phase 1 implements the visual workshop, local state machine, server-side
CAPOBOTTEGA runtime, strict decision schema, evidence ledger, and responsive
interaction path. Locally, the Phase 1 control loop is complete and verified.
The production secret/deployment, separate payload application, public
repository, demo video, and Devpost submission remain open gates.

See [the CAPOBOTTEGA evidence note](docs/CAPOBOTTEGA.md) for the runtime
contract and verified end-to-end response, and
[the Phase 1 audit](docs/PHASE1_AUDIT.md) for requirement-by-requirement proof.
The recommended G3 workpiece and its human decision boundary are recorded in
[the payload FIRMA](docs/PAYLOAD_FIRMA.md).
