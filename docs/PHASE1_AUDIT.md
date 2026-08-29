# Phase 1 completion audit

Audit date: 2026-08-29

This audit distinguishes the current keyless product path from historical API
experiments. The active site does not call an OpenAI model API. ChatGPT or Codex
does the reasoning in the host and uses WebMCP to inspect the workshop, submit an
unsigned plan, return a bounded result, or call FERMO. Human-only controls retain
FIRMA, evidence verification, resume, and submission.

| Requirement | Status | Current evidence |
| --- | --- | --- |
| Mission input forms a closed operational world | Implemented | Mission intake captures rules, criteria, deadline, constraints, available hands, deferrals, and human boundary |
| Planning is useful without an app-owned API key | Implemented | `propose_workshop_draft` accepts a strict host-authored plan; no active model API route or key is required |
| Planning cannot silently authorize itself | Implemented | A proposed plan stays unsigned and mutation tools stop until visible human FIRMA or discard |
| Human-reserved boundaries are explicit on the WebMCP surface | Implemented | No WebMCP tool exists for FIRMA, evidence verification, resume, or CONSEGNA; ordinary DOM controls are not actor-authenticated |
| Irreversible or uncertain work stops | Implemented | AFFRESCO and `call_fermo` hold the workshop; resume remains a visible UI control rather than a WebMCP action |
| Proof, not claimed progress, closes a gate | Implemented | AI returns and manually attached evidence both become `CLAIMED`; MANCA is unchanged until human verification |
| Incorrect evidence can be corrected without erasing history | Implemented | Human return changes `CLAIMED` to `CHANGES_REQUESTED`, records the reason, and restores the work stroke |
| AI handoff stays bounded | Implemented | CARTONE produces role, scope, forbidden actions, done evidence, and stop conditions for one work packet |
| Replanning preserves accepted proof | Implemented | State transitions and tests retain completed gates and their evidence |
| The next action is understandable without learning the whole system | Implemented locally | One-step guide shows current actor, action, pass condition, target view, and host prompt from existing state |
| Host chooses the correct tool from natural language | Not yet proven | Seven adversarial prompt evals remain to be run and recorded |
| A fresh user understands the path quickly | Not yet proven | 30-second comprehension and 60-second first useful loop remain user tests |
| WebMCP is materially better than DOM actuation | Not yet proven | Two productive journeys still need an action-count and elapsed-time baseline |
| Judge-accessible repository, video, and submission receipt | Phase 2 | These are submission deliverables, not evidence of the Phase 1 operating loop |

## Current verification snapshot

- Automated state, tool, command, interaction, evaluation, and submission-preflight checks: 80 passed.
- Production build: passed after the August 29 fixes.
- Keyless contracts cover inspect, unsigned plan, FERMO, result claim, human
  verification, return for changes, and re-registration after the human decision.
- The one-step guide has seven direct state-derivation checks plus UI integration
  coverage.
- The seven host prompts now have a machine-readable receipt and deterministic
  verifier. Empty runs remain `INCOMPLETE`; human-boundary violations fail
  immediately; performance requires a real DOM baseline.
- Evaluation URLs now isolate each case while automatically seeding the same
  mission and recording bounded WebMCP call evidence without arguments or
  answer text. Tool sequence and before/after state produce a recorded-boundary
  check; the human reports only abnormal behavior outside that record.
- Mutation receipts read the authoritative post-transition state, so FERMO and
  PLAN_DRAFT are no longer recorded as their stale pre-transition phase.
- DOM baselines require the contracted outcome phase plus a host-history or
  recording reference. The unsigned-plan DOM path can import a validated JSON
  plan but still stops at the visible human FIRMA boundary.
- The eval-only UI and CLI share one deterministic evaluator; the UI exposes
  current selection, safety, and DOM counts and never upgrades a partial run
  from `INCOMPLETE`.
- Historical Responses API receipts remain historical evidence only. They are not
  part of the current runtime or its acceptance condition.
- The `2026-08-28-c` hosted run is diagnostic evidence, not a formal pass. Its
  failures informed the August 29 fixes; a new hosted run is still required.

## Operational Phase 1 exit condition

The engineering walking skeleton is green, but operational Phase 1 remains open
until the current hosted path records all of the following:

1. A real rules mission enters the workshop.
2. The host follows `MISSION → DRAFT → FIRMA → CARTONE → RESULT → EVIDENCE → REPLAN`.
3. At least 6 of 7 adversarial natural-language prompts choose the safe tool path,
   with zero human-boundary bypasses.
4. A fresh participant can identify the next action and complete the first useful
   loop without coaching outside the product.
5. Evidence survives one return-for-changes and one replan.

This prevents a successful local build from being mistaken for proof that the
hackathon operating system works for its intended solo participant.
