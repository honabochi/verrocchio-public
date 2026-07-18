# Phase 1 completion audit

Audit date: 2026-07-18

This audit treats the original handoff, `CONTRATTO.md`, and `CARTONE.md` as the
requirements and current source, tests, runtime behavior, and deployment state
as evidence. “Complete locally” does not mean “published.”

| Requirement | Status | Authoritative evidence |
| --- | --- | --- |
| Mission input is a closed operational world | Complete locally | `MissionView.jsx` captures rules, criteria, deadline, constraints, available hands, deferrals, and human boundary; live browser plan generated |
| One backward-planned path from deadline to submission | Complete locally | `/api/workshop-plan` returns a strict contract, dynamic gates, strokes, risks, and ISO schedule bounded between request time and deadline |
| Planning is not silently self-authorizing | Complete locally | Live generated plans remained drafts until `GIVE FIRMA & ADOPT`; revisions 01–03 recorded |
| Human is a system component, not a generic approver | Complete locally | Editable DI SUA MANO and AFFRESCO rules; OLTREMARE meter; explicit FIRMA action |
| Immediate, deferred, and autonomous decision classes | Complete locally | CAPOBOTTEGA strict schema returns AFFRESCO, SECCO, or GESSO plus human action |
| Irreversible work stops synchronously | Complete locally | AFFRESCO creates `firmaPending`, disables resume and further CAPOBOTTEGA decisions, and requires `GIVE FIRMA`; interaction and migration tests |
| Anyone can stop work | Complete locally | CALL FERMO changes the state and writes evidence |
| Scope cannot silently expand | Complete locally | CONTRATTO scope ratchet plus CAPOBOTTEGA `scopeEffect`; work-packet stop rules |
| Proof, not claimed progress, closes a gate | Complete locally | A gate without evidence opens ATTACH PROOF and MANCA remains unchanged |
| GPT-5.6 is meaningful and observable | Complete locally | Server-only `gpt-5.6-sol` Responses API, strict output, stored response ID, verified live response in `docs/CAPOBOTTEGA.md` |
| Codex is the primary implementation hand | Complete locally | Primary task ID in README, initial state, and build log; LA PRIMA MANO packet role |
| Self-reference is product behavior | Complete locally | CAPOBOTTEGA classified VERROCCHIO's own publication, stopped it, changed state, and wrote its response evidence |
| AI work can be handed off without losing boundaries | Complete locally | CARTONE compiles role-specific duty and stop rules into a copyable packet |
| Results return to the target proof gate | Complete locally | Live CARTONE result required change, verification, evidence, and remaining risk; target evidence dialog retained the return |
| Replanning preserves completed proof | Complete locally | Live revision 02 retained the revision 01 response evidence; unit tests preserve both evidence and done state |
| Quiet, small-screen workshop UX | Complete locally | Five workshop views; responsive desktop and 390×844 browser checks |
| Exportable build evidence | Complete locally | EVIDENCE JSON export includes contract, decisions, events, gates, and derived MANCA |
| Hosted rollout includes the GPT runtime | Pending AFFRESCO | Local runtime is proven; Sites secret and production deployment still require authenticated human action |
| Separate workpiece selected | Out of Phase 1 by design | Selection is explicitly deferred until the operational exit path passes |
| Judge-accessible repository, video, and final receipt | Phase 2 | These are later execution targets, not evidence that Phase 1 itself works |

## Verification snapshot

- Automated contracts and interactions: 22 passed.
- Production build: passed.
- Real GPT-5.6 plan and replan responses:
  `[public-response-id-removed]`,
  `[public-response-id-removed]`,
  and the schedule-bounded
  `[public-response-id-removed]`.
- Browser exit path passed: MISSION, DRAFT, FIRMA, CARTONE, RESULT, EVIDENCE,
  REPLAN, preserved proof, and MANCA 06 → 05.
- Browser console warnings and errors: zero.
- Visual proof: `docs/phase1-browser-proof.png` and
  `docs/phase1-final-viewport.png`.

## Phase 1 exit condition

The real browser path passed:

`MISSION → DRAFT → FIRMA → CARTONE → RESULT → EVIDENCE → REPLAN`

The production build and automated contracts are green. Phase 1 is therefore
complete locally. Publishing remains an AFFRESCO action and is intentionally
outside this local exit condition.
