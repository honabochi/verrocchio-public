# Build log

## 2026-07-18 — GIORNATA 01

### Commission

Build the Phase 1 walking skeleton of VERROCCHIO, then use it to control the creation of a separate payload application for the OpenAI Build Week submission.

### Codex evidence

- Primary Codex task: `[public-id-removed]`
- Codex read the original handoff and converted it into the six-gate state machine.
- Codex verified current OpenAI Build Week requirements against the official OpenAI page, Devpost overview, FAQ, and rules.
- Codex generated the primary screen concept, extracted the design system, wrote the React implementation, authored the contract and plan, added tests, and produced the deployment build.

### GPT-5.6 evidence

GPT-5.6 was used in the primary task for:

- synthesizing the self-referential product promise;
- deciding that progress should be represented as missing submission proof;
- compressing official requirements into six product gates;
- resolving the boundary between human `WHY/NO/FIRMA` and machine `HOW`;
- selecting the Phase 1 walking-skeleton scope.

Runtime GPT-5.6 integration remains a missing gate. The intended CAPOBOTTEGA integration will classify new work as `AFFRESCO`, `SECCO`, or `GESSO` and must return evidence-backed reasoning.

### Checks

- Model and interaction tests: 5 passed.
- Production build: passed.
- Local browser interaction: not verified because the active browser policy rejected the localhost URL. No alternate browser workaround was used.
- Sites v1 rendered as an empty shell. The deployment screenshot exposed a JSX transform defect: production code referenced an undefined `React` global before mounting.
- Codex enabled the React JSX transform, added DOM interaction coverage, and rebuilt v2. The tests now cover initial mount, GIORNATA start, evidence attachment, MANCA reduction, FERMO, and CENACOLO.

### Official sources checked

- OpenAI Build Week: https://openai.com/build-week/
- Devpost overview: https://openai.devpost.com/
- Devpost FAQ: https://openai.devpost.com/details/faqs
- Official rules: https://openai.devpost.com/rules

The official pages remain authoritative and must be checked again before final submission.

## 2026-07-18 — GIORNATA 02

### CAPOBOTTEGA runtime

- Added a server-only `/api/capobottega` route using the Responses API.
- Pinned the runtime to `gpt-5.6-sol` with medium reasoning effort.
- Constrained output with a strict JSON Schema covering material,
  evidence-based reason, next stroke, human action, scope effect, submission
  gate, and ledger note.
- Kept `OPENAI_API_KEY` out of the browser bundle.
- A successful model response automatically records evidence and closes the
  GPT-5.6 MANCA gate.

### Live proof

The end-to-end browser flow asked CAPOBOTTEGA to classify publishing the
verified integration to the public demo site.

- Classification: `AFFRESCO`
- Human action: `FIRMA_REQUIRED`
- Scope effect: `PRESERVES`
- Gate: `working-product`
- Model: `gpt-5.6-sol`
- Response ID:
  `[public-response-id-removed]`

The UI then moved MANCA from 06 to 05, increased OLTREMARE from 42 to 46,
activated FERMO, updated the GIORNATA, and wrote both the decision and model
response ID to EVIDENCE.

### Checks

- Automated model, server-contract, and interaction tests: 9 passed.
- Production build: passed.
- Desktop browser: CAPOBOTTEGA dialog, real GPT-5.6 response, FERMO state, and
  evidence ledger verified with no console warnings or errors.
- Mobile browser: 390×844 viewport, no horizontal overflow, decision surface
  collapsed to one readable column.

## 2026-07-18 — GIORNATA 03

### Control invariants

- MANCA gates can no longer be closed without attached proof. An attempted
  proofless close opens the evidence sheet and records FERMO.
- `AFFRESCO` plus `FIRMA_REQUIRED` now creates a hard GIORNATA lock. The normal
  resume path is disabled until the human explicitly gives FIRMA.
- Previously saved held AFFRESCO decisions migrate into the same lock unless a
  matching FIRMA event proves that the human already signed.

### Payload bridge

- CARTONE now emits bounded, copyable work packets for LA PRIMA MANO, VASARI,
  or IL COLORISTA.
- Every packet carries the unchanged commission, current stroke, material,
  human boundary, first missing proof, role duty, stop rule, and return
  contract.
- G3 remains `AWAITING FIRMA`: selecting what the payload should be belongs to
  the human's WHY, while implementation remains the workshop's HOW.

### Checks

- Automated model, server-contract, migration, and interaction tests: 14
  passed.
- Production build: passed.
- Browser: proofless completion opened ATTACH PROOF and left MANCA unchanged.
- Browser: an old saved AFFRESCO state migrated to `LOCKED BY FIRMA`, with the
  explicit `GIVE FIRMA` action as the only resume path.
- Browser: desktop and 390×844 CARTONE layouts rendered the complete packet
  builder and all three role choices.
