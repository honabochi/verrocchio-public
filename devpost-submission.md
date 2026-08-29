# VERROCCHIO — A Disciplined Team of One

> Submission draft only. Nothing has been submitted to Devpost. Replace every
> `TODO` before publication, then verify the final entry against the current
> official rules and the actual Devpost form.

## One-line summary

VERROCCHIO is a WebMCP-enabled workshop that helps a time-constrained solo
builder work like a disciplined team while keeping approval, evidence
verification, publishing, and final submission under human control.

## Project URLs

- **Working live project:** TODO — insert the public, judge-accessible URL after
  verifying the current submission build in ChatGPT's in-app browser or a
  supported WebMCP-enabled browser.
- **Public source repository:** TODO — insert the public repository URL after
  confirming that it contains the submission commit, complete source and assets,
  setup instructions, and a visibly detected open-source license.
- **Public YouTube demo:** TODO — insert the public video URL after recording a
  clear, audible demo shorter than three minutes.

## The problem

Solo builders rarely fail because they cannot produce ideas or code. They fail
because the coordination work normally carried by a team accumulates around
them: interpreting rules, choosing the next task, remembering why a decision
was made, recovering after an interruption, distinguishing a claim from proof,
and stopping before an irreversible action.

This is especially visible in short hackathons and after-hours projects. An AI
assistant can generate work quickly, but speed alone does not answer four
questions: What is still missing? What is the smallest responsible next step?
What evidence supports completion? Which decisions must remain human?

## The solution

VERROCCHIO turns a mission into a bounded workshop. It records the objective,
deadline, rules, judging criteria, constraints, available hands, and explicit
human boundaries. The workshop represents progress as `MANCA`: the required
proof that is still missing, rather than a generic percentage.

An agent can inspect the workshop, stop work when the target is ambiguous,
propose an unsigned plan, and return a structured result claim. The human keeps
`FIRMA` for approval, verifies or rejects evidence, resumes held work, and owns
publishing and `CONSEGNA`, the final submission decision.

AI output is therefore not treated as completion. A returned result remains
`CLAIMED` until a human marks its evidence `VERIFIED`; rejected evidence becomes
`CHANGES_REQUESTED` and returns to the work loop.

## Why this matters

VERROCCHIO is designed for people who want the leverage of an agent without
giving up authorship or judgment. It aims to reduce the attention cost of
working alone, preserve an exact return point after interruption, and make the
evidence behind progress visible to both the builder and a reviewer.

Hackathons are the first demanding use case, not the product's limit. Their
fixed deadlines, explicit requirements, and judge-visible deliverables make
them a useful proving ground for a broader human-governed execution system.

## Why WebMCP is a strong fit

The value of VERROCCHIO depends on a person and an agent acting on the same live
workshop state. Without structured tools, an agent has to infer state from a
visual interface, click through multiple panels, and risk confusing a visible
claim with a verified decision.

WebMCP gives the page an explicit agent-facing contract. The host can discover
bounded tools, inspect the current state, and perform only the transitions the
workshop exposes. The page retains the authoritative state and the human-only
boundaries. This makes the collaboration more direct and testable while avoiding
an application-owned model API key in the active path.

The current implementation exposes four WebMCP tools:

1. `inspect_workshop` — reads the mission, current phase, missing proof, active
   work, and human-only boundary.
2. `call_fermo` — stops the workshop when scope, evidence, safety, or intent is
   uncertain; only a human can resume it.
3. `propose_workshop_draft` — returns a validated, unsigned plan and stops for
   human review and FIRMA.
4. `return_work_result` — records a bounded `CLAIMED` result without closing its
   evidence gate.

## What people and agents do together

### The agent can

- inspect the current mission and missing evidence;
- propose the smallest structured plan that addresses the mission;
- call FERMO when the target or evidence is ambiguous;
- return what changed, what was checked, where the evidence is, and what risk
  remains;
- explain the next bounded step from the current workshop state.

### The human retains

- purpose, taste, scope vetoes, and changes to the contract;
- FIRMA for irreversible or externally consequential actions;
- evidence verification and rejection;
- recovery from FERMO;
- publishing, deployment, sensitive-data disclosure, and final submission.

This division was difficult to express safely through a conventional visual UI
alone. WebMCP makes the allowed agent actions explicit, while the absence of
approval, verification, resume, publish, deploy, and submission tools preserves
the human boundary.

## Key features

- Mission intake for rules, criteria, deadline, constraints, available roles,
  deferrals, and human-only decisions.
- `MANCA`, a proof-based view of what is still missing.
- Strict unsigned-plan validation with evidence gates, bounded work strokes,
  schedule checks, risks, and scope classification.
- Human FIRMA before a proposed plan or irreversible action is adopted.
- State-version checks and idempotency keys for agent mutations.
- `CLAIMED → VERIFIED / CHANGES_REQUESTED` evidence control.
- FERMO as an explicit stop that only a human can release.
- Replanning that is designed to preserve accepted proof.
- A bilingual, dark-first workshop UI with a state-derived next-action guide.
- A deterministic evaluation receipt for fixed adversarial tool-selection cases
  and WebMCP-versus-DOM comparison journeys.

## Implementation

VERROCCHIO is a React and Vite web application. The browser-local workshop state
is persisted in `localStorage`. The active product path performs reasoning in
the ChatGPT or Codex host and does not require a developer to provide an OpenAI
API key to the site.

The page registers tools through `document.modelContext.registerTool`. Tool
availability changes with the workshop phase. When a plan, evidence claim,
FIRMA, or FERMO requires human attention, mutation tools are removed and the
next action points back to the person.

Every mutation requires the `stateVersion` returned by the latest inspection
and an idempotency key. Stale state is rejected, and a retry with the same key
returns the existing receipt instead of repeating the transition. Structured
schemas bound plan and result size, identifiers, deadlines, gate references,
roles, classifications, and required evidence fields.

### Architecture

```text
ChatGPT / Codex host
        │
        │ natural-language request + WebMCP tool call
        ▼
document.modelContext.registerTool
        │
        ├── inspect_workshop          (read-only)
        ├── call_fermo                (bounded stop)
        ├── propose_workshop_draft    (unsigned plan)
        └── return_work_result        (unverified claim)
        │
        ▼
VERROCCHIO state and transition contracts
        │
        ├── MANCA evidence gates
        ├── CARTONE bounded work strokes
        ├── stateVersion + idempotency receipts
        └── local browser persistence
        │
        ▼
Human-only UI: FIRMA · verify/reject · resume · publish · deploy · CONSEGNA
```

## How Codex and other AI assistance were used

Codex was used as an implementation and verification collaborator: translating
the product boundary into state transitions and tool schemas, implementing the
React and WebMCP paths, adding deterministic tests, and investigating failures
found during a hosted evaluation run. AI assistance also helped draft and
challenge plans, usability copy, and evaluation cases.

AI output was treated as a candidate rather than final evidence. Tests, source
inspection, browser behavior, human observations, and explicit approval gates
remain separate. The project name, product direction, human boundaries, and
final submission decisions remain the entrant's responsibility.

## New work added during the submission period

VERROCCHIO existed before the WebMCP Challenge. Only the work added during the
eligible submission period should be evaluated as the challenge extension.

- **Pre-existing baseline:** `3be515d` (July 19, 2026). Add its public commit
  link after the repository is made public.
- **Challenge extension start:** `f12214b` (August 27, 2026). Add its public
  commit link after the repository is made public.
- **Submission commit:** TODO — link the final public submission commit or tag.
- **Public diff:** TODO — link `3be515d...<final-submission-tag>`.

The new extension includes the native WebMCP tool surface, host-driven keyless
planning path, state-dependent tool registration, state-version and idempotency
contracts, human-reviewed result claims, hosted evaluation mode, deterministic
receipt verifier, WebMCP-versus-DOM comparison routes, and the WebMCP-specific
onboarding and evaluation UI.

The dated file-and-capability evidence table is in
[`docs/CHALLENGE_EXTENSION.md`](docs/CHALLENGE_EXTENSION.md). Do not rely only
on commit dates; pair the public diff with the live demo and hosted evaluation
evidence.

## Testing instructions for judges

> TODO — verify these instructions against the final public deployment and
> replace all placeholders before submission.

1. Open **TODO — final live URL** in ChatGPT's in-app browser or a supported
   WebMCP-enabled browser.
2. Confirm that the page reports that agent tools are ready.
3. Load the WebMCP mission.
4. Ask the host:

   > Inspect the workshop and tell me which evidence is still missing. Leave
   > FIRMA, evidence verification, resume, publishing, deployment, and final
   > submission to me.

5. Confirm that the host uses `inspect_workshop` and reports the current MANCA.
6. Ask the host to propose the smallest valid plan without publishing it.
7. Confirm that the page displays an unsigned plan and waits for human FIRMA.
   Do not approve the plan unless you want to continue the demo.
8. Optional safety check: ask the host to approve and submit the plan by itself.
   Confirm that no FIRMA or submission tool exists and that the human boundary
   remains visible.

No credentials should be included in this document. If the final live project
requires authentication, TODO — add judge-safe access instructions only in the
official submission form after confirming the event rules and access policy.

## Verification and evaluation status

- Local automated tests: 75 passing on the current local candidate. Re-run and
  record the final count on the frozen submission revision.
- Production build: TODO — record the final build result for the frozen
  submission revision.
- Judge-accessible live smoke test: TODO.
- Fresh hosted seven-case WebMCP evaluation: **incomplete at the time of this
  draft**. Do not claim a passing selection or safety result until a new receipt
  and its independent verifier output exist.
- WebMCP-versus-DOM comparison: TODO — complete both equivalent journeys and
  attach their evidence references before publishing any improvement percentage.
- Full mission-to-evidence-and-replan walkthrough: TODO.

## Suggested screenshots

1. Mission intake with the event, deadline, constraints, and human boundary.
2. `WEBMCP READY` with the human-versus-agent responsibility summary.
3. MANCA showing the proof still missing.
4. An unsigned plan waiting for human FIRMA.
5. A `CLAIMED` result with verify and request-changes controls.
6. FERMO with a visible human-only resume action.
7. The evaluation receipt summary after the fresh hosted run is complete.

TODO — capture screenshots from the frozen public submission build. Remove
private browser data, personal information, credentials, unrelated tabs, and
unsupported pass claims before uploading them.

## 2:40 demo video outline

### 0:00–0:20 — The coordination problem

Introduce the target user: a solo builder working in short, interruptible
sessions. Show that ordinary progress percentages do not answer what proof is
still missing or who owns the next decision.

### 0:20–0:45 — Mission and boundary

Load the challenge mission. Point out the deadline, constraints, MANCA gates,
and the visible division between agent work and human-only decisions.

### 0:45–1:10 — WebMCP inspection

Ask the host what evidence is missing. Show `inspect_workshop` reading structured
state directly and returning the next bounded step.

### 1:10–1:40 — Unsigned plan and FIRMA

Ask for the smallest plan. Show `propose_workshop_draft`, the validated plan,
and the deliberate stop before human FIRMA. Briefly contrast this with an agent
clicking through the visual UI.

### 1:40–2:05 — Claim is not proof

Show a returned result entering `CLAIMED` without reducing MANCA. Demonstrate a
human verification or request-changes decision, using only non-sensitive demo
data.

### 2:05–2:25 — Boundary challenge

Ask the agent to approve or submit by itself. Show that approval, resume,
publishing, deployment, and final submission are unavailable as agent tools.

### 2:25–2:40 — Outcome

Return to the central promise: WebMCP lets one person gain structured agent
leverage while keeping authorship, evidence judgment, and irreversible actions
in human hands. Display only evaluation numbers that have been verified on the
frozen public build.

## Known limitations

- The fresh hosted evaluation receipt for the current submission candidate is
  not complete at the time of this draft.
- The current workshop uses browser-local persistence rather than synchronized
  multi-device storage.
- Mission rule text is entered or loaded as a profile; automatic provenance and
  clause-level rule coverage are not yet complete.
- The active keyless path depends on a WebMCP-capable host such as ChatGPT's
  in-app browser or a supported browser configuration.
- The product has not yet established broad generalization across multiple
  independent hackathons or a statistically meaningful usability sample.
- A human must still verify official rules, judge access, evidence, publication,
  and final submission.

## Readiness notes

The local implementation and tests are not the same as a submission-ready
artifact. Before submission, the entrant must verify the exact frozen revision,
public repository, visible license, live judge access, video, English materials,
required form fields, ownership and asset permissions, and the post-deadline
freeze plan.

No Devpost submission has been sent. Publishing the repository, deploying the
final build, uploading the video, changing visibility, entering credentials,
and signing the final submission are owner-only actions.

## Registration gate — owner action required

The official Devpost readback on 2026-08-30 JST reports that registration is
still open, but this account is **not yet registered** for the WebMCP Challenge.
Registration is a separate external action and has not been performed by this
drafting work.

Before registration, the Owner must:

- choose `Working solo`, `Looking for teammates`, or `Already have a team`;
- answer **How would you describe what you do for work?**;
- answer **How often do you use Codex?**;
- answer **How familiar were you with WebMCP before this challenge?**;
- answer **Have you used ChatGPT's in-app browser?**;
- confirm eligibility;
- read and explicitly agree to the [official rules](https://webmcp.devpost.com/rules)
  and [Devpost terms](https://info.devpost.com/terms).

Do not infer or prefill these personal answers. The optional source survey may
be skipped.

## Official Devpost form field checklist

The labels below were read from the official Devpost requirements on
2026-08-30 JST. Re-read them before final entry. Owner-only identity,
residency, organization, and self-assessment answers remain intentionally blank.

- [ ] **28249 — Submitter Type** (required): Owner selects `Individual`, `Team
  of Individuals`, or `Organization`.
- [ ] **28250 — Country of residence of yourself and team members if
  applicable** (required): Owner enters this directly in Devpost.
- [ ] **28251 — Organization name** (optional): leave blank unless submitting
  for an organization.
- [x] **28252 — App Status** (required draft answer): `Existing`.
- [ ] **28253 — What was updated during the submission period?** Draft answer:
  link `docs/CHALLENGE_EXTENSION.md` and summarize the native tools,
  host-driven keyless path, state-dependent registration, mutation contracts,
  human-reviewed claims, and evaluation receipts added after August 25.
- [ ] **28254 — Judge-accessible live URL** (required): TODO — final verified
  URL.
- [ ] **28255 — Testing instructions / credentials if applicable** (optional):
  use the judge instructions above after a clean-session rehearsal. Put any
  judge-only credentials only in the official form, never in this repository.
- [ ] **28256 — Public code repository URL** (required): TODO — public URL at
  the frozen submission tag with the detected MIT license.
- [ ] **28257 — Agents or clients used to test WebMCP** (required): TODO — list
  only final verified clients, expected to include ChatGPT's in-app browser and
  any supported Chrome build actually used for the frozen revision.
- [ ] **28258 — AI tools leveraged** (required): draft candidates are Codex for
  implementation and verification, Claude for a bounded rules critique, and
  Gemini for an independent public-rules critique. Owner confirms the final
  truthful list.
- [ ] **28259 — Learning level** (required): Owner selects `None`, `Moderate`,
  or `Significant`.
- [ ] **28260 — Career-reusable AI value** (required): Owner selects `Yes` or
  `No`.

## Final pre-submission gate

- [ ] The public live URL serves the frozen submission revision and is usable by
  judges without unsupported assumptions.
- [ ] The public repository contains the same revision, complete source and
  assets, setup/testing instructions, and a visibly detected open-source license.
- [ ] The before/after extension evidence clearly separates pre-existing work
  from WebMCP work added during the eligible period.
- [ ] The public YouTube demo is shorter than three minutes, includes clear
  audio, and uses only authorized material.
- [ ] The English description answers all four required WebMCP questions.
- [ ] Testing instructions have been executed from a fresh judge-like session.
- [ ] Every claimed evaluation result is backed by the fresh hosted receipt,
  host history or recording reference, and deterministic verifier output.
- [ ] All current official Devpost fields and eligibility declarations have been
  read back and approved by the entrant.
- [ ] The entrant gives final FIRMA and manually submits before the deadline.
- [ ] The submitted Devpost entry, repository, and live site remain frozen after
  the deadline according to the official rules.
