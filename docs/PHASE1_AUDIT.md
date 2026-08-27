# Phase 1 completion audit

Audit date: 2026-08-28

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
| Human-only boundaries are enforceable | Implemented | No WebMCP tool exists for FIRMA, evidence verification, resume, or CONSEGNA |
| Irreversible or uncertain work stops | Implemented | AFFRESCO and `call_fermo` hold the workshop; only a human-visible control can resume it |
| Proof, not claimed progress, closes a gate | Implemented | Returned work becomes `CLAIMED`; MANCA is unchanged until human verification |
| Incorrect evidence can be corrected without erasing history | Implemented | Human return changes `CLAIMED` to `CHANGES_REQUESTED`, records the reason, and restores the work stroke |
| AI handoff stays bounded | Implemented | CARTONE produces role, scope, forbidden actions, done evidence, and stop conditions for one work packet |
| Replanning preserves accepted proof | Implemented | State transitions and tests retain completed gates and their evidence |
| The next action is understandable without learning the whole system | Implemented locally | One-step guide shows current actor, action, pass condition, target view, and host prompt from existing state |
| Host chooses the correct tool from natural language | Not yet proven | Seven adversarial prompt evals remain to be run and recorded |
| A fresh user understands the path quickly | Not yet proven | 30-second comprehension and 60-second first useful loop remain user tests |
| WebMCP is materially better than DOM actuation | Not yet proven | Two productive journeys still need an action-count and elapsed-time baseline |
| Judge-accessible repository, video, and submission receipt | Phase 2 | These are submission deliverables, not evidence of the Phase 1 operating loop |

## Current verification snapshot

- Automated state, tool, command, and interaction checks: 53 passed.
- Production build: passed.
- Keyless contracts cover inspect, unsigned plan, FERMO, result claim, human
  verification, return for changes, and re-registration after the human decision.
- The one-step guide has seven direct state-derivation checks plus UI integration
  coverage.
- Historical Responses API receipts remain historical evidence only. They are not
  part of the current runtime or its acceptance condition.

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
