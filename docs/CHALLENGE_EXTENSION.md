# WebMCP Challenge Extension Boundary

This document separates the pre-existing VERROCCHIO project from the work built
for the OpenAI WebMCP Challenge. It is intended to make the eligible challenge
work inspectable without attributing earlier product work to the submission
period.

Official rules remain authoritative:
<https://webmcp.devpost.com/rules>.

## Commit boundary

| Boundary | Commit | Date | Meaning |
| --- | --- | --- | --- |
| Pre-existing baseline | `3be515d` | 2026-07-19 JST | Last commit before the WebMCP Challenge extension |
| First challenge commit | `f12214b` | 2026-08-27 JST | First native WebMCP-governed workshop flow |
| Audited product candidate | `031b380` | 2026-08-30 JST | Tested endpoint for the implementation evidence below |

The audited implementation range, including the first Challenge commit, is:

```text
f12214b^..031b380
```

This range contains 24 commits. Against the July baseline, it changes 47 files
with 8,919 insertions and 1,017 deletions. The final metadata-only documentation
commit must also be included in the final public submission tag; that tag is not
yet assigned in this draft.

For a complete comparison against the pre-existing baseline, use:

```bash
git diff --stat 3be515d..031b380
git log --format='%h %aI %s' f12214b^..031b380
```

Only the work added after the Challenge submission period opened is presented as
Challenge work. The underlying VERROCCHIO concept and July implementation are
pre-existing work.

## Truthful before and after

| Area | At baseline `3be515d` | Added during the Challenge range |
| --- | --- | --- |
| Product core | A local-first hackathon workshop with MISSION intake, MANCA proof gates, CARTONE work packets, FERMO/FIRMA controls, an evidence ledger, CENACOLO review, and replanning | The same core is exposed as an agent-usable web application through native WebMCP tools |
| Planning | Server-side planning and CAPOBOTTEGA routes required an application-owned OpenAI API key | The active path is host-driven and keyless: ChatGPT or Codex reasons in the host and submits a validated, unsigned plan through WebMCP |
| Agent interaction | Agents used copied prompts, API routes, or ordinary page controls; the site did not register WebMCP tools | The page registers state-dependent tools through `document.modelContext.registerTool` |
| State mutation | UI actions changed workshop state | WebMCP mutations require the inspected `stateVersion` and an idempotency key; stale calls fail and retries replay a stored receipt |
| Human boundary | FIRMA and FERMO were visible product concepts | No WebMCP tool exists for FIRMA, evidence verification, FERMO resume, publishing, or final submission; mutation tools are removed while human review is pending |
| Work results | A result could be entered through the human-facing workflow | `return_work_result` creates a structured `CLAIMED` result and cannot reduce MANCA; a human must verify it or return it for changes |
| Evaluation | Local product tests and historical browser receipts | Isolated natural-language cases, bounded evaluation receipts, deterministic verification, and outcome-checked DOM comparison routes |
| Judge path | General local/Vercel setup | A no-key 60-second WebMCP path, a Challenge mission fixture, ChatGPT in-app-browser support, and Chrome WebMCP testing instructions |

The Challenge submission should be judged on the right-hand column and its
implementation, not on the July workshop shell by itself.

## Challenge-period capabilities and primary files

### Native WebMCP surface

- `src/webmcp.js` defines and registers four tools:
  `inspect_workshop`, `call_fermo`, `propose_workshop_draft`, and
  `return_work_result`.
- `src/useWebMcp.js` manages state-dependent registration and disposal.
- `src/workshopPlanContract.js` validates the bounded host-authored plan.
- `src/workshopCommands.js` implements stale-state rejection, idempotent
  mutations, unsigned plan storage, FERMO, result claims, human verification,
  and change requests.

### Human-agent product experience

- `src/MissionView.jsx` provides the host-driven planning on-ramp and a DOM-only
  recovery/comparison import that still stops before FIRMA.
- `src/App.jsx` keeps human-only controls visible, derives the current guide from
  workshop state, and displays evaluation evidence without exposing tool inputs
  or model reasoning.
- `src/hackathonProfiles.js` adds the current Challenge mission as a replaceable
  profile rather than hard-coding the engine to one event.
- `src/uiCopy.jsx` and the Challenge-period UI work add Japanese assistance,
  responsive hierarchy, visible transition feedback, and a dark-first theme.

### Falsifiable verification

- `src/evalReceipt.js`, `src/webmcpEvalContract.js`, and
  `scripts/lib/webmcp-eval.mjs` define a bounded receipt and deterministic
  evaluator.
- `scripts/verify-webmcp-browser.mjs` exercises native WebMCP discovery and the
  human checkpoint in Chrome.
- `scripts/verify-webmcp-evals.mjs` recalculates an exported evaluation result.
- `docs/WEBMCP_EVALS.md` documents the hosted protocol and stop conditions.
- `docs/WEBMCP_POC.md` records the falsification checkpoint and explicitly lists
  unproven claims.
- `submission-manifest.json` and `scripts/verify-submission-readiness.mjs`
  convert public URLs, official fields, freeze state, test/build evidence, and
  Owner attestations into a deterministic final preflight.

## Verification status at `031b380`

Confirmed in the repository:

- The automated suite passes: 93 tests across state, commands, WebMCP tools,
  planning contracts, UI interaction, and evaluation logic.
- Mutation evaluation reads the authoritative committed state, preventing FERMO
  or PLAN_DRAFT from being recorded as the stale pre-transition phase.
- The DOM-only unsigned-plan route can reach `PLAN_DRAFT` through the same plan
  validation contract and still requires visible human FIRMA for adoption.
- DOM baseline records require the contracted final phase and a host-history,
  recording, or verification reference.
- The active WebMCP product route does not require an application-owned model API
  key. Historical server-planner modules remain in the repository as pre-existing
  evidence but are not the active Challenge path.
- `docs/PHASE1_AUDIT.md` records a successful production build after the August
  29 fixes. This statement does not substitute for a fresh judge-side build.

## Not yet proven

The following must not be presented as completed evidence:

- A new post-fix hosted run has not yet produced a formal passing seven-case
  evaluation receipt. The earlier `2026-08-28-c` run was diagnostic.
- Fresh-participant comprehension and the first useful loop without external
  coaching have not yet passed a user test.
- Judge access to the final submitted live URL has not yet been proven from a
  clean judge-equivalent session.
- The final public repository, visible repository license metadata, English
  submission description, testing instructions, public YouTube demo, and Devpost
  receipt are submission deliverables, not completed evidence in this commit.
- End-to-end WebMCP and DOM timing still require a common start boundary and
  recorded host evidence.

**No claim of a 30 percent action or time improvement should be made until both
productive journeys reach the same contracted outcome under a fair measurement
boundary and the exported receipt passes deterministic verification.**

## Judge reproduction pointers

### Local code and tests

```bash
npm ci
npm test
npm run build
```

### WebMCP tool inspection

Use ChatGPT's in-app browser, or Chrome with WebMCP testing enabled. In Chrome,
open DevTools and inspect the tools registered on `document.modelContext`. The
expected initial surface is:

```text
inspect_workshop
call_fermo
propose_workshop_draft
return_work_result
```

The exact available set changes with workshop state. While a plan awaits FIRMA,
the workshop is in FERMO, or an evidence claim awaits review, only inspection
remains available.

### Short product journey

1. Open the submitted live URL in a WebMCP-capable browser.
2. Ask the agent to inspect the workshop and identify missing proof.
3. Ask it to propose the smallest valid unsigned plan.
4. Confirm that the page displays `PLAN_DRAFT` and that the agent cannot adopt it.
5. Let the human give FIRMA in the page.
6. Return one structured work result and confirm that MANCA does not decrease.
7. Let the human verify or return the claim and inspect the preserved receipt.

The fixed adversarial prompts, isolated evaluation URLs, DOM comparison protocol,
and CLI verification command are documented in `docs/WEBMCP_EVALS.md`.

## Submission and freeze boundary

Before submission, the entrant must separately verify the public repository,
license visibility, live judge access, English materials, video requirements,
and Devpost fields against the current official rules. At the deadline, the
submitted Devpost entry, repository, and live site should be frozen. Continued
development should occur in a separate fork or branch that is not the submitted
artifact.

---

日本語要約：2026年7月19日までのVERROCCHIO本体は既存成果です。Challenge
対象は、2026年8月27日以後に追加したWebMCP道具、状態遷移契約、人間専用境界、
CLAIMED証拠フロー、実地評価基盤です。修正版hosted run、審査員アクセス、公開
リポジトリ、英語提出物、動画、そして公平な30%改善証拠は未完了として扱います。
