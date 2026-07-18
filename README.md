# VERROCCHIO

> The workshop that paints itself.

VERROCCHIO is a local-first hackathon execution system. It replaces generic task progress with `MANCA`: the number of submission proofs that are still missing. It classifies decisions by reversibility, protects human attention as `OLTREMARE`, and keeps an exportable evidence ledger.

This repository is the first payload of VERROCCHIO: the system is being used to direct and document its own construction.

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

## Core path

1. Open `GIORNATE`.
2. Begin the current work session.
3. Attach evidence to a missing gate by selecting its ledger row.
4. Mark a gate complete only when proof exists.
5. Call `FERMO` to hold autonomous work.
6. Inspect `CENACOLO` for the final go/no-go poll.
7. Export the evidence ledger from `EVIDENCE`.

State is saved in browser `localStorage`; no account or backend is required for Phase 1.

## Supported platform

- Current desktop browsers
- Responsive mobile layout for monitoring and approvals

## Build Week source of truth

Submission gates were compiled from the OpenAI Build Week Devpost overview, FAQ, and official rules on 2026-07-18. Those official pages remain authoritative.

See [the build log](docs/BUILD_LOG.md) for the first self-referential evidence record.

## Codex and GPT-5.6

- Codex is the primary implementation environment and keeps the principal build thread.
- The initial build thread is `019f74f3-dd34-7403-b286-8f56efb37ad1`.
- GPT-5.6 is used for high-level synthesis, scope decisions, and the self-referential execution design. Runtime integration is planned for the CAPOBOTTEGA decision packet in the next phase and must be evidenced before submission.

## Current phase

Phase 1 implements the local state machine and visual workshop. The payload application, production deployment, runtime GPT-5.6 integration, public repository, demo video, and Devpost submission remain open gates.
