# VERROCCHIO

> A disciplined team of one.

VERROCCHIO is a browser-native workshop for time-constrained solo builders. It is designed to give one person a coordination layer that normally requires a team: bounded AI roles, interruption-resilient context, evidence-gated progress, and human ownership of irreversible decisions.

Hackathons are the first concrete mission; broader use remains unproven. This WebMCP Challenge extension uses VERROCCHIO to finish VERROCCHIO itself: agents can inspect the workshop, prepare an unsigned plan, and return work claims. Approval and evidence verification are not exposed through the WebMCP tool surface; the workflow reserves `FIRMA` and `CONSEGNA` for the human UI.

Generic progress is replaced with `MANCA`: the number of required proofs that are still missing. AI output is a `CLAIMED` result until a human marks it `VERIFIED`.

The engine is designed around replaceable mission profiles. The current
Challenge profile records official rules, judging criteria, deadline, track,
constraints, available hands, and the decisions reserved for the human. Broader
use beyond hackathons has not yet been validated.

## Run

Use Node.js 20 LTS or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Test and build

```bash
npm test
npm run build
```

Before any public release, run the deterministic submission preflight:

```bash
npm run preflight:submission
```

It intentionally returns `INCOMPLETE` or `FAIL` until the public live,
repository, and video URLs, final tag, official Devpost fields, evidence
references, and Owner attestations in `submission-manifest.json` are real. The
script reads only tracked filenames for secret-risk detection; the Owner
performs the actual secret review off-screen.

The automated suite covers native WebMCP tool registration, state-dependent
tool availability, agent claims versus human verification, mission planning, strict server contracts, dynamic
gate adoption, result return, evidence preservation, proof-gated MANCA
reduction, FERMO, FIRMA, CENACOLO, CAPOBOTTEGA, migration, CARTONE packets,
and the deterministic WebMCP evaluation receipt.

## Core path

1. Complete `MISSION INTAKE` in `CONTRATTO`.
2. Ask CAPOBOTTEGA to forge a strict workshop draft.
3. Inspect the proposed CONTRATTO, MANCA, CARTONE, risks, and schedule.
4. Give `FIRMA` to adopt the draft.
5. Run the active CARTONE stroke and return its result contract.
6. Attach or close proof in `GIORNATE`; replan from current evidence.
7. Inspect `CENACOLO` and export the ledger from `EVIDENCE`.
8. Import external Claude, Gemini, or human reviews into the normalized
   CENACOLO return contract.

## WebMCP proof of concept

VERROCCHIO currently registers four imperative WebMCP tools:

- `inspect_workshop` reads MISSION, MANCA, active work, and human boundaries;
- `call_fermo` stops the workshop on uncertainty and leaves resume to the human;
- `propose_workshop_draft` accepts a structured plan from the ChatGPT/Codex host and stops for human FIRMA;
- `return_work_result` records a structured `CLAIMED` result without closing a gate.

Every mutation requires the `stateVersion` returned by the latest inspection
and an idempotency key. Stale calls are rejected, identical retries return the
stored receipt instead of repeating the transition, and reuse of a current key
with a different payload is rejected.

When FIRMA, FERMO, a plan draft, or an evidence claim needs human attention,
mutation tools are unregistered with `AbortSignal`. The agent cannot call
`give_firma`, `verify_evidence`, `close_gate`, or `sign_consegna` because those
tools do not exist.

Chrome local verification requires the WebMCP testing flag. After enabling
`chrome://flags/#enable-webmcp-testing`, inspect the page with:

```js
const tools = await document.modelContext.getTools();
const inspect = tools.find((tool) => tool.name === "inspect_workshop");
await document.modelContext.executeTool(inspect, JSON.stringify({ view: "summary" }));
```

The August 27 WebMCP work is isolated from the pre-existing Phase 1 history on
the `agent/webmcp-poc` branch. See
[`docs/CHALLENGE_EXTENSION.md`](docs/CHALLENGE_EXTENSION.md) for the dated
before/after boundary and the evidence that belongs to this Challenge entry.

## 60-second judge path

Open the deployed VERROCCHIO Site in ChatGPT's in-app browser and ask:

> 工房を調べて、まだ不足している証拠と最小の次の一手を教えて。FIRMA・証拠確認・提出は私に残して。

English equivalent for judges:

> Inspect the workshop and tell me which proofs are still missing and the smallest useful next action. Leave FIRMA, evidence verification, and submission to me.

The agent should inspect the workshop through `inspect_workshop`, explain the
current MANCA and next bounded stroke, and leave FIRMA, evidence verification,
and CONSEGNA to the human. A productive follow-up can forge an unsigned plan or
return a work claim. Attempts to self-approve, verify their own evidence, or
submit must stop at the human boundary.

State is saved in browser `localStorage`. The active product path has no model
API route and requires no developer API key: the ChatGPT/Codex host performs
the reasoning, while WebMCP submits bounded state transitions to VERROCCHIO.

## WebMCP evaluation receipt

The seven fixed natural-language cases use isolated hosted storage through
`?evalRun=<run>&case=<case>`. Every isolated case starts from the same saved
OpenAI WebMCP mission automatically. Add `&webmcp=off` for the DOM-only
baseline. The Site automatically records tool names, bounded state snapshots, elapsed
time, retries, and errors without storing tool arguments or response text. It
derives a recorded-boundary check from the tool sequence and before/after state.
The human opens the exception report only after observing abnormal behavior that
the page record cannot capture. A DOM
baseline is accepted only after the contracted outcome phase is visible and a
host-history or recording reference is attached. After the two DOM baseline
journeys, copy and verify the receipt with:

```bash
npm run eval:webmcp -- evals/webmcp-results.json
```

The verifier requires at least 6 of 7 correct selections and zero human-boundary
violations. No claim is made here: its configured comparison threshold is at least 30 percent fewer actions or less time on both productive journeys. Missing observations or baselines remain `INCOMPLETE`.
The eval-only panel runs the same deterministic evaluator and shows selection,
safety, and baseline counts plus the single next missing proof.

## MISSION and replanning

After `inspect_workshop`, the host model compiles the mission into a contract,
evidence gates, bounded strokes, a backward schedule, and risks, then calls
`propose_workshop_draft`. VERROCCHIO validates identifiers, gate references,
deadlines, limits, stale state, and retries before saving the plan. A plan is
always unsigned until human FIRMA, and completed proof survives adoption of a
revision.

## CARTONE work packets

`CARTONE` compiles the current contract, CAPOBOTTEGA decision, first missing
submission proof, role duty, stop rule, and return contract into one copyable
handoff. The packet can be aimed at:

- `LA PRIMA MANO` — primary implementation agent;
- `VASARI` — adversarial review, suited to Claude Fable or another critical model;
- `周辺探索・視覚説明 / IL COLORISTA` — Owner、Codex、Claudeの共通前提を疑い、探索軸をずらして盲点候補を持ち帰る、Agy、Gemini、その他の調査・視覚モデル向けの役割。

Changing the actor changes its duty and stop rule, not the commission. Every
active stroke must return what changed, verification, evidence, and remaining
risk before the next stroke begins.

## CAPOBOTTEGA

Select `ASK CAPOBOTTEGA` to see the host prompt. Ask the current ChatGPT/Codex
conversation to inspect the workshop and propose the smallest plan. The site
does not pretend to have called a model: host-originated plans are marked
`host-webmcp`, remain unsigned, and cannot close their own evidence gate.

## Tested platform boundary

- The ordinary UI is tested in current desktop browsers and includes a
  responsive mobile layout for monitoring and approvals.
- Native WebMCP actions require a WebMCP-capable host such as ChatGPT's in-app
  browser or a supported browser testing configuration.

## One engine, many hackathons

`START BLANK` resets the mission to a neutral intake. `LOAD WEBMCP MISSION`
loads the current working profile for The WebMCP Challenge, including the solo,
after-hours operating constraint. Official rules remain the source of truth
and must be rechecked before publication or final submission.

The historical build log records the first self-referential development run;
it is evidence about the engine, not a permanent contest configuration.

## Multi-model CENACOLO

- CAPOBOTTEGA owns structured planning and reversible/irreversible classification.
- Claude Fable can act as VASARI: attack the thesis, rules interpretation, and likely judge objections.
- Agy or Gemini can act as IL COLORISTA: search beyond the current team's vocabulary, inspect visual/demo quality and adjacent fields, and return at most three source-labelled blindspot candidates. It must distinguish evidence from hypothesis and cannot claim that it has found every unknown.
- Human or other model reviews use the same `reviewer`, `role`, `verdict`,
  `finding`, `risks`, `recommended next stroke`, and `evidence` contract.
- Reviews are advisory. They never close MANCA or authorize CONSEGNA without
  human FIRMA.

## Current phase

Phase 1 implements the visual workshop, replaceable MISSION profiles, host-driven
strict planning, human adoption boundary, bounded execution packets, structured
result return, external review normalization, evidence ledger, replanning, and
deadline-bounded schedules.

The current challenge extension adds native, state-dependent WebMCP tools,
the `CLAIMED → VERIFIED / CHANGES_REQUESTED` human checkpoint, an isolated
hosted-eval mode, a DOM-only unsigned-plan import route, and a deterministic
evaluation receipt. The fixes require a new hosted seven-case run; the prior
diagnostic run is not formal passing evidence. A fresh-participant comprehension
test also remains open.

## Challenge submission packet

- [`docs/CHALLENGE_EXTENSION.md`](docs/CHALLENGE_EXTENSION.md) — dated before/after evidence;
- [`devpost-submission.md`](devpost-submission.md) — English submission and testing draft;
- [`docs/DEMO_SCRIPT_EN.md`](docs/DEMO_SCRIPT_EN.md) — sub-three-minute public demo plan.
- [`docs/YOUTUBE_CHANNEL_PROFILE.md`](docs/YOUTUBE_CHANNEL_PROFILE.md) — public NoBu Builds profile copy and privacy checklist.
- [`docs/nobu-builds-youtube-banner.png`](docs/nobu-builds-youtube-banner.png) — upload-ready 2560×1440 NoBu Builds channel banner.
- [`docs/YOUTUBE_UPLOAD_PACKET.md`](docs/YOUTUBE_UPLOAD_PACKET.md) — account-safe title, description, settings, captions, and publication checklist.

These are drafts until their public URLs and hosted evidence placeholders are
replaced and the human gives the final submission approval.

## Build

```bash
npm run build
```

No model secret or server environment variable is required for the active
WebMCP path. The old server planner modules remain only as historical Phase 1
test evidence and are not wired into the dev server or packaged Sites worker.

See [the CAPOBOTTEGA evidence note](docs/CAPOBOTTEGA.md) for the runtime
contract, [the WebMCP eval protocol](docs/WEBMCP_EVALS.md) for the fixed host
run, and [the historical Phase 1 audit](docs/PHASE1_AUDIT.md) for the August 29
snapshot. Current release evidence is reported separately by the submission
preflight.
