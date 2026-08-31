# VERROCCHIO — A Disciplined Team of One

> Submission draft only. Nothing has been submitted to Devpost. Replace every
> `TODO`, verify the frozen public artifacts, and read the actual form back to
> the entrant before publication or submission.

## One-line Summary

VERROCCHIO helps time-constrained solo builders preserve the next action,
missing proof, and human checkpoints across interrupted projects. WebMCP
exposes the browser workshop as four state-aware tools—inspect, stop, propose an unsigned plan, and
return an unverified claim—so the agent acts on structured state instead of
guessing from the DOM. In the judge path, the host inspects `MANCA`, a plan
waits for human `FIRMA`, and a result stays `CLAIMED` until human verification;
tested public release commit `90f5f3f` recorded 111 passing tests and a production
build, while earlier candidate evidence includes a real Chrome WebMCP smoke. The
final tagged clean-clone proof, final deployed-revision readback, and fresh
hosted evaluation remain incomplete.

## Public Demo Link

<https://verrocchio-workshop.honabochi.chatgpt.site/>

Unauthenticated HTTP access returned the expected VERROCCHIO page on
2026-08-31. The final deployed revision marker and WebMCP judge path still need
verification before this URL is frozen for submission.

## Public Repository Link

<https://github.com/honabochi/verrocchio-public>

The source, setup instructions, required assets, and MIT license are readable
without authentication. The final annotated submission tag is still pending.

## Problem

A solo builder working around a full-time job must carry coordination that a
team would normally distribute: rules, next actions, decision history,
interruption recovery, evidence review, and stops before irreversible actions.
An AI answer may sound complete while required proof is still missing.

## Solution

VERROCCHIO turns a mission into a bounded workshop. `MANCA` counts required
proof that remains unverified. The host may inspect state, call `FERMO`, propose
an unsigned plan, or return a structured claim. The human adopts plans with
`FIRMA`, verifies or rejects evidence, resumes held work, and owns publication
and `CONSEGNA`. The core path is:

```text
MANCA → unsigned plan → human FIRMA → bounded work → CLAIMED
      → human VERIFIED or CHANGES_REQUESTED
```

## Why This Matters

The product keeps MANCA, active work, receipts, and the next action together so
an interrupted participant can return to an explicit state instead of trusting
a completion-sounding answer. Hackathons are the first proving ground; reduced
attention cost, fresh-participant usability, and broader generalization remain
unproven.

## Fit to the official judging criteria

- **WebMCP Leverage:** four state-dependent tools form a shared contract; the
  human-only actions are deliberately absent from the tool surface.
- **Execution:** tested public release commit `90f5f3f` recorded 111 passing tests and a
  production build, while earlier candidate evidence includes a real Chrome
  WebMCP smoke; the final tagged clean-clone test/build proof
  and public judge access remain release gates.
- **Potential Impact:** the target is a time-constrained solo builder who needs
  continuity without forming a conventional team. Browser-local state keeps
  MANCA, the active packet, receipts, and the next action together after an
  interruption; fresh usability and adoption remain unproven.
- **Creativity & Ambition:** tool availability changes with workshop state, an
  agent claim cannot reduce MANCA, and approval and verification remain visible
  human actions rather than one generic AI workflow.

The official readback lists these four five-point criteria and no tracks; it
does not establish equal weighting. The deadline is September 3, 2026 at 1:00
PM Pacific Time (`2026-09-03T20:00:00Z`, September 4 at 5:00 AM JST). Submitted
artifacts must remain frozen after the deadline through judging.

## Why WebMCP is a strong fit

The person and host must act on the same live state. A DOM agent may need to
rediscover controls and infer whether visible text is a claim or a decision.
WebMCP gives the page an explicit, state-aware contract and lets the host call a
bounded transition directly:

- `inspect_workshop` — read mission, MANCA, active work, and human boundary;
- `call_fermo` — stop on ambiguous scope, evidence, safety, or intent;
- `propose_workshop_draft` — return a validated but unsigned plan;
- `return_work_result` — return a `CLAIMED` result without closing proof.

The tool surface intentionally omits FIRMA, evidence verification, resume,
publish, deploy, and submission. These remain human-facing workflow actions,
not actor authentication against a separate DOM automation layer.

## What people and agents do together

The agent inspects, drafts, stops, and returns a bounded claim with what changed,
what it checked, an evidence reference, and remaining risk. The human retains
purpose, taste, scope vetoes, approval, evidence judgment, recovery, sensitive
disclosure, publication, and final submission.

## Key Features

- `MANCA`, a proof-based view of what is still missing;
- strict unsigned plans with human FIRMA before adoption;
- `CLAIMED → VERIFIED / CHANGES_REQUESTED` evidence review;
- FERMO as an explicit stop whose release remains in the human UI;
- state-version and idempotency checks for agent mutations;
- deterministic evaluation receipts for adversarial and WebMCP-versus-DOM cases.

## Architecture

VERROCCHIO is a React and Vite application with browser-local persistence. The
page registers tools through `document.modelContext.registerTool`; availability
changes with the workshop phase. The active path uses reasoning from the
ChatGPT or Codex host and requires no application-owned OpenAI API key.

Every mutation requires the state version returned by inspection and an
idempotency key. Stale state is rejected; identical retries return the existing
receipt; reused keys with different payloads fail. Schemas bound plan size,
identifiers, deadlines, gate references, roles, evidence fields, and result size.

```text
ChatGPT / Codex host
  → WebMCP: inspect | stop | propose | return claim
  → VERROCCHIO state: MANCA | CARTONE | receipts
  → Human UI: FIRMA | verify/reject | resume | publish | submit
```

## How We Used AI

The ChatGPT or Codex host supplies reasoning without an application-owned API
key, while WebMCP carries bounded inspections and state transitions into the
workshop. Claude provided an independent architecture and rule-fit critique.
Gemini 3.1 Pro reviewed product experience and the demo's first sixty seconds.
Their outputs were treated as review candidates, not as approval or proof.

## How We Used Codex

Codex helped design schemas and state transitions, implement the React and
WebMCP paths, add tests, investigate hosted evaluation failures, and harden the
release checks. Codex also produced bounded test and build evidence, while
source inspection, browser behavior, independent review, and entrant approval
remained separate acceptance signals.

## New work added during the submission period

VERROCCHIO is an `Existing` project. The July 19 baseline `91315a1` already
contained the local-first workshop, MANCA proof gates, work packets, and human
FIRMA/FERMO controls, but it did not register WebMCP tools.

- **Pre-existing baseline:** [`91315a1`](https://github.com/honabochi/verrocchio-public/commit/91315a120059cae3b9eb68566c81d5c8d87fd903) (July 19, 2026).
- **Challenge start:** [`0176211`](https://github.com/honabochi/verrocchio-public/commit/0176211fe5a1c62ba366c1379710864a5bb2db17) (August 27, 2026).
- **Tested public release commit:** [`90f5f3f`](https://github.com/honabochi/verrocchio-public/commit/90f5f3fff38a298989eeccc364a711b801256aef); final annotated tag pending.
- **Current public comparison:** [`91315a1...main`](https://github.com/honabochi/verrocchio-public/compare/91315a120059cae3b9eb68566c81d5c8d87fd903...main); replace `main` with the final tag before submission.

Beginning with `0176211` on August 27, the eligible extension added four native,
state-aware WebMCP tools; host-driven keyless planning; phase-dependent tool
availability; versioned and idempotent mutations; unsigned plans; and
`CLAIMED` results that require human verification before MANCA can decrease. It
also added bounded evaluation receipts and a local Chrome WebMCP smoke path.
Full statistics, limitations, and dated evidence are in
`docs/CHALLENGE_EXTENSION.md`.

## Testing Instructions

> TODO — rehearse these instructions against the frozen public build.

1. Open the final live URL in ChatGPT's in-app browser or a supported WebMCP
   host and load **The WebMCP Challenge** mission.
2. Ask: `What evidence is still missing?` Confirm `inspect_workshop` returns
   MANCA, the next bounded step, and human-only decisions without changing state.
3. Ask: `Create the smallest valid plan. Do not publish.` Confirm the returned
   draft is unsigned and waits for human FIRMA.
4. After the entrant gives FIRMA, inspect active work and return one bounded
   result. Confirm it appears as `CLAIMED` and MANCA does not decrease.
5. Ask the agent to approve, verify, resume, publish, or submit. Confirm those
   tools are absent; use request-changes unless the evidence is inspectable.

Use a fresh, isolated mission URL. No credentials should be needed. If final
hosting unexpectedly requires credentials, put judge-safe instructions only in
Devpost—never in the repository.

## Verification and evaluation status

- Earlier candidate evidence includes a real Chrome WebMCP smoke; the remapped
  public product boundary is `f13d687`.
- Untagged public release commit `90f5f3f` passed a clean dependency install, all
  111 tests, and a production build on 2026-08-31. This does not
  replace the required repeat on the final annotated submission tag.
- Judge-accessible unauthenticated HTTP smoke: **PASS** on 2026-08-31 for the
  current deployment; final revision identity and WebMCP judge smoke remain
  **INCOMPLETE**.
- Fresh hosted seven-case evaluation: **INCOMPLETE**; publish no pass claim.
- WebMCP-versus-DOM comparison: **TODO**; publish no improvement percentage.

## Language and judge accessibility

The submission description, testing instructions, demo narration, and captions
will be in English. The product keeps its Japanese visual identity, while core
actions and states use visible English labels such as `WEBMCP READY`, `MANCA`,
`NEXT`, `FIRMA REQUIRED`, `CLAIMED`, `VERIFY CLAIM`, and `REQUEST CHANGES`.

A full application language switch is not part of the submission scope. Before
submission, the Owner must verify that every non-English item a judge needs to
understand is translated by the visible interface, these testing instructions,
or the demo narration/captions. Decorative or nonessential Japanese text may
remain only when it does not block the documented judge path.

## Screenshot Shot List

1. Real hosted `inspect_workshop` cold open with MANCA and NEXT readable.
2. Unsigned plan stopped at `FIRMA REQUIRED`.
3. `CLAIMED` card showing verification, evidence reference, risk, and review.
4. Final receipt or limitations view from the frozen public build.

TODO — capture only from the final public revision and remove personal browser
data, credentials, unrelated tabs, and unsupported pass claims.

## Demo Video

Public YouTube URL: TODO — insert one public video under three minutes with
audible English narration.

The final English narration and timed subtitle file are prepared in
`docs/DEMO_SCRIPT_EN.md` and `docs/DEMO_CAPTIONS_EN.srt`.

### 2:40 outline

- **0:00–0:15 — Real inspection:** identify the interrupted solo builder, send
  the real request, show `inspect_workshop`, MANCA, NEXT, and the human-only
  boundary, then begin the plan request. No later-state montage.
- **0:15–0:49 — Unsigned plan:** show the real proposal in causal order, stop at
  `FIRMA REQUIRED` by 0:28, and explain the problem while the human gate remains
  visibly pending.
- **0:49–1:34 — FIRMA and CLAIMED:** show the human adoption click, active
  CARTONE work, and a returned claim that leaves MANCA open.
- **1:34–2:18 — Human review and return point:** request changes unless evidence
  is inspectable, then show the preserved history, open gate, and exact next
  action.
- **2:18–2:40 — Why WebMCP:** close with the qualitative difference between DOM
  inference and bounded state-aware calls. Use no unverified performance
  numbers.

The public video must be under three minutes, include audible English narration,
show the functioning product in the first 10–15 seconds, and use authorized
assets only. The detailed capture script is `docs/DEMO_SCRIPT_EN.md`.

## Known Limitations

- Persistence is browser-local rather than synchronized across devices.
- Human-only DOM controls are a workflow boundary, not actor authentication.
- The keyless path depends on a WebMCP-capable host.
- Automated rule provenance, the fresh hosted evaluation, and broad usability
  evidence remain incomplete.

## Submission Readiness Notes

Local tests are not submission readiness. Registration is complete; the entrant
must still review secrets off-screen, freeze one revision, publish the same
repository and live build, verify judge access, record the video, read back
every form field, and manually submit. The exact sequence is in
`docs/OWNER_RELEASE_GATE.md`.

## Registration Status

Registration was confirmed live through the authenticated Devpost flow on
2026-08-30. The entrant explicitly agreed to the official rules, Devpost terms,
and eligibility statement before registration. Personal registration answers
remain off-repository.

## TODO Official Form Fields

Labels were read from the official form on 2026-08-30 JST and must be re-read
before submission. Identity and self-assessment answers remain Owner-only.

- [ ] **28249 — Submitter Type** (required): Owner selects the actual status;
  proposed value is `Individual`, pending readback.
- [ ] **28250 — Country of residence** (required): Owner enters it in Devpost.
- [ ] **28251 — Organization name** (optional): blank unless applicable.
- [x] **28252 — App Status** (required draft answer): `Existing`.
- [ ] **28253 — Submission-period updates** (required for this Existing entry):
  use the dated summary in **New work added during the submission period** and
  add the public comparison link after publication.
- [ ] **28254 — Judge-accessible live URL** (required): TODO verified URL.
- [ ] **28255 — Testing instructions / credentials** (optional): use the tested
  path above; keep any judge-only credentials only in the official form.
- [ ] **28256 — Public code repository URL** (required): use
  `https://github.com/honabochi/verrocchio-public`; final tag and Devpost
  readback remain pending.
- [ ] **28257 — Agents or clients used to test WebMCP** (required draft):
  `Google Chrome 151 with WebMCP testing enabled`; add ChatGPT's in-app browser
  only after the final hosted judge-path verification.
- [ ] **28258 — AI tools leveraged** (required draft): `Codex, Claude, and
  Gemini`; Owner reads back the final field against retained review evidence.
- [ ] **28259 — Learning level** (required): Owner selects `None`, `Moderate`,
  or `Significant`.
- [ ] **28260 — Career-reusable AI value** (required): Owner selects `Yes` or
  `No`.

## Final pre-submission gate

All public artifacts must resolve to one frozen revision, every required field
and limitation must be read back to the entrant, and the entrant must give final
FIRMA and manually submit before the deadline. Afterward, the entry, repository,
live build, and video remain frozen according to the official rules.
