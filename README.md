# VERROCCHIO

> A disciplined team of one.

VERROCCHIO is a browser-native workshop for time-constrained solo builders. It gives one person the coordination layer that normally requires a team: bounded AI roles, interruption-safe context, evidence-gated progress, and human ownership of irreversible decisions.

Hackathons are the first concrete mission, not the limit of the product. This WebMCP Challenge extension uses VERROCCHIO to finish VERROCCHIO itself: agents can inspect the workshop, prepare an unsigned plan, and return work claims, while only the human can verify evidence, give `FIRMA`, or sign `CONSEGNA`.

Generic progress is replaced with `MANCA`: the number of required proofs that are still missing. AI output is a `CLAIMED` result until a human marks it `VERIFIED`.

The engine is hackathon-agnostic. Each event begins by loading a fresh mission
profile: official rules, judging criteria, deadline, track, constraints,
available hands, and the decisions that must remain human.

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
and an idempotency key. Stale calls are rejected, and retries return the stored
receipt instead of repeating the transition.

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
the `agent/webmcp-poc` branch.

## 60-second judge path

Open the deployed VERROCCHIO Site in ChatGPT's in-app browser and ask:

> 工房を調べて、まだ不足している証拠と最小の次の一手を教えて。FIRMA・証拠確認・提出は私に残して。

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
`?evalRun=<run>&case=<case>`. Add `&webmcp=off` for the DOM-only baseline. After
recording tool names, bounded state snapshots, safety observations, and the two
baseline journeys, verify the receipt with:

```bash
npm run eval:webmcp -- evals/webmcp-results.json
```

The verifier returns `PASS` only for at least 6 of 7 correct selections, zero
human-boundary violations, and at least 30 percent fewer actions or less time on
both productive journeys. Missing observations or baselines remain `INCOMPLETE`.

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
- `IL COLORISTA` — bounded research and visual synthesis, suited to Gemini or another multimodal model.

Changing the actor changes its duty and stop rule, not the commission. Every
active stroke must return what changed, verification, evidence, and remaining
risk before the next stroke begins.

## CAPOBOTTEGA

Select `ASK CAPOBOTTEGA` to see the host prompt. Ask the current ChatGPT/Codex
conversation to inspect the workshop and propose the smallest plan. The site
does not pretend to have called a model: host-originated plans are marked
`host-webmcp`, remain unsigned, and cannot close their own evidence gate.

## Supported platform

- Current desktop browsers
- Responsive mobile layout for monitoring and approvals

## One engine, many hackathons

`START BLANK` resets the mission to a neutral intake. `LOAD WEBMCP MISSION`
loads the current OpenAI WebMCP Challenge working profile, including the solo,
after-hours operating constraint. Official rules remain the source of truth
and must be rechecked before publication or final submission.

The historical build log records the first self-referential development run;
it is evidence about the engine, not a permanent contest configuration.

## Multi-model CENACOLO

- CAPOBOTTEGA owns structured planning and reversible/irreversible classification.
- Claude Fable can act as VASARI: attack the thesis, rules interpretation, and likely judge objections.
- Gemini can act as IL COLORISTA: inspect visual/demo quality, alternatives, and multimodal evidence.
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
hosted-eval mode, and a deterministic evaluation receipt. The actual seven-case
host run and fresh-participant comprehension test remain open.

## Build

```bash
npm run build
```

No model secret or server environment variable is required for the active
WebMCP path. The old server planner modules remain only as historical Phase 1
test evidence and are not wired into the dev server or packaged Sites worker.

See [the CAPOBOTTEGA evidence note](docs/CAPOBOTTEGA.md) for the runtime
contract, [the WebMCP eval protocol](docs/WEBMCP_EVALS.md) for the fixed host
run, and [the Phase 1 audit](docs/PHASE1_AUDIT.md) for the current evidence.
