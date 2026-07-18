# Phase 1 completion audit

Audit date: 2026-07-18

This audit treats the original handoff, `CONTRATTO.md`, and `CARTONE.md` as the
requirements and current source, tests, runtime behavior, and deployment state
as evidence. “Complete locally” does not mean “published.”

| Requirement | Status | Authoritative evidence |
| --- | --- | --- |
| One backward-planned path from deadline to submission | Complete locally | Six MANCA gates in `src/model.js`; countdown and gate ledger rendered in GIORNATE |
| Human is a system component, not a generic approver | Complete locally | Editable DI SUA MANO and AFFRESCO rules; OLTREMARE meter; explicit FIRMA action |
| Immediate, deferred, and autonomous decision classes | Complete locally | CAPOBOTTEGA strict schema returns AFFRESCO, SECCO, or GESSO plus human action |
| Irreversible work stops synchronously | Complete locally | AFFRESCO creates `firmaPending`, disables resume, and requires `GIVE FIRMA`; interaction and migration tests |
| Anyone can stop work | Complete locally | CALL FERMO changes the state and writes evidence |
| Scope cannot silently expand | Complete locally | CONTRATTO scope ratchet plus CAPOBOTTEGA `scopeEffect`; work-packet stop rules |
| Proof, not claimed progress, closes a gate | Complete locally | A gate without evidence opens ATTACH PROOF and MANCA remains unchanged |
| GPT-5.6 is meaningful and observable | Complete locally | Server-only `gpt-5.6-sol` Responses API, strict output, stored response ID, verified live response in `docs/CAPOBOTTEGA.md` |
| Codex is the primary implementation hand | Complete locally | Primary task ID in README, initial state, and build log; LA PRIMA MANO packet role |
| Self-reference is product behavior | Complete locally | CAPOBOTTEGA classified VERROCCHIO's own publication, stopped it, changed state, and wrote its response evidence |
| AI work can be handed off without losing boundaries | Complete locally | CARTONE compiles role-specific duty and stop rules into a copyable packet |
| Quiet, small-screen workshop UX | Complete locally | Five workshop views; responsive desktop and 390×844 browser checks |
| Exportable build evidence | Complete locally | EVIDENCE JSON export includes contract, decisions, events, gates, and derived MANCA |
| Phase 1 production includes the GPT runtime | Not yet complete | Sites version 4 is saved, but production has not received `OPENAI_API_KEY` and version 4 is not deployed |
| Separate payload chosen and built under VERROCCHIO | Not started by design | G3 is `AWAITING FIRMA`; payload choice belongs to the human WHY |
| Judge-accessible repository, video, and Devpost receipt | Not yet complete | These remain explicit MANCA gates |

## Verification snapshot

- Automated tests: 14 passed.
- Production build: passed.
- Browser proof guard: passed.
- Browser legacy AFFRESCO migration and FIRMA lock: passed.
- Browser CARTONE work packet: passed on desktop and mobile.
- Real GPT-5.6 server and end-to-end UI response: passed.

## Phase 1 exit condition

The local control loop is finished. Phase 1 exits only after the saved Sites
version is deployed with the production secret and the hosted CAPOBOTTEGA path
returns a judge-usable response. Publication remains an AFFRESCO action and
therefore requires the human's authenticated session and FIRMA.
