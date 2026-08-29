# Release Roundtable Decision

Date: 2026-08-30 JST  
Scope: public, non-sensitive submission preflight for The WebMCP Challenge

This is a compact decision receipt, not a transcript. External reviews were
asked to judge only the public product description and release gates. No
credentials, private fixtures, or protected data were included.

## Participation

| Seat | Status | Independent finding |
| --- | --- | --- |
| Gemini | participated | Gemini 3.1 Pro independently reviewed the minimal v2 share packet and returned direction GO / current submission NO-GO; it found that the planned first 60 seconds did not state why WebMCP matters clearly enough |
| Claude | participated | Claude independently reviewed the same minimal v2 packet and returned direction GO / current submission NO-GO; it found WebMCP central to the state contract but challenged impact evidence and release readiness |
| Architecture audit | participated | Local code, MIT license, build definition, and README are viable; the branch upstream was unsafe and external freeze/publication evidence is missing |
| Evidence audit | participated | Public URLs, official fields, final tag, clean judge smoke, and video are hard gates; numeric performance claims remain prohibited without a fresh verified receipt |
| Product/UX audit | participated | The demo should use desktop capture and show the real host call, MANCA, unsigned FIRMA stop, and the visible CLAIMED human-review state |

## Dissent

- Claude's strongest objection is that the human-only boundary is a WebMCP
  workflow boundary, not actor authentication against separate DOM automation.
- Internal evidence review treats registration as an independent early gate
  because registration may close separately from the artifact deadline.
- An earlier draft attributed a prioritization and agreement to Gemini without a
  durable review receipt in this repository. That attribution is withdrawn. The
  prioritization was Mission Control synthesis, not a verified Gemini statement.

## Mission Control decision

The product direction remains **GO**. The current submission remains **NO-GO**.
Use this order:

1. Register for the Challenge and complete the Owner-only eligibility and terms
   gate immediately.
2. Perform the real secret review off-screen; do not expose secret contents to
   the agent.
3. Remove publication placeholders, create one final annotated tag, and use that
   exact revision everywhere.
4. Make the repository and live app judge-accessible, then verify both without
   authentication.
5. From a clean clone of the tag, run `npm ci`, tests, and the production build;
   run a clean hosted WebMCP smoke. A full numeric evaluation is optional only if
   all numeric improvement claims are removed.
6. Record and publish the shorter-than-three-minute English-audio/captioned demo
   from the same frozen public build.
7. Read back every Devpost field, give final FIRMA, submit, and freeze the public
   artifacts.

## Hardened-preflight follow-up

After the first decision, the internal architecture, evidence, and product/UX
seats independently attacked the preflight for false passes. The implementation
now rejects missing or duplicated manifest gates, unchecked/duplicated Devpost
fields, hollow draft sections, placeholder variants, role-mismatched or local
URLs, login redirects, unannotated or wrong-revision tags, implementation drift
after the candidate, stale build copies, test-count regression below the frozen
floor, and unevidenced numeric performance claims.

Claude participated after those changes. It kept the direction at GO and the
current submission at NO-GO, and identified residual URL-login, non-percent
numeric-claim, and test-count regression routes; those checks were tightened in
the next candidate. A Gemini follow-up returned no review through the current
permission boundary, so no Gemini finding or agreement is claimed.

## Official MCP refresh

The authenticated Devpost MCP readback on 2026-08-30 JST confirmed the selected
event as `webmcp` / **The WebMCP Challenge**, with submissions open and no
tracks. It also exposed a dangerous fuzzy-match route: looking up only "OpenAI
WebMCP Challenge" first returned the unrelated, closed **OpenAI Build Week**
event. Selection and registration must therefore use the canonical
`https://webmcp.devpost.com/` URL or the exact `webmcp` slug.

The live submission requirements and the latest announcement both require a
public YouTube demo under three minutes with audio, despite one contradictory
FAQ sentence suggesting there is no video. The mandatory submission-requirement
record and official rules control: video remains a hard gate. Field `28253` is
not globally required by the form, but it is required for this entry because
VERROCCHIO declares App Status `Existing` and the rules require a clear dated
before/after WebMCP extension.

## Strongest claim to preserve

VERROCCHIO exposes a small, state-aware WebMCP contract for inspection, bounded
stopping, unsigned planning, and unverified result claims. Approval, evidence
verification, resume, publishing, and final submission are absent from the
WebMCP tool surface and remain reserved for the human-facing workflow.

Do not upgrade this to actor authentication, tamper-proof evidence, or a measured
speed/reliability result. Those claims are not proven by the current artifact.

## Re-audit after official-rule reconciliation

Three bounded internal seats independently re-read the current packet: official
rules, judge story, and demo readiness. They did not replace Gemini or Claude
and are not counted as either. The result stayed **direction GO / current
submission NO-GO**.

- The judge-story seat estimated the current local story at 13.8/20 and found
  that new features would not repair the weak evidence for Execution and
  Potential Impact. It recommended one 60-second judge path and the explicit
  subject: a time-constrained solo builder, not a generic hackathon system.
- The official-rules seat found false-pass routes around fuzzy event names,
  video audio, public repository revision identity, live-build identity,
  deadline cutoff, and unsupported equal weighting of the four criteria.
- The demo seat found four storyboard/UI mismatches: conflicting cold opens,
  hidden stroke bodies before FIRMA, invisible returned verification text, and
  claim history visible only from EVIDENCE after a return for changes.

The local candidate was tightened accordingly: the canonical `webmcp` slug,
event URL, and UTC deadline are now machine checked; a public YouTube URL must
resolve to one video; audible English narration is a separate Owner attestation;
the public repository must bind an annotated tag, its default branch, required
files, and MIT license to the same local SHA; the live HTML carries a revision
marker; and a commit after the deadline fails preflight. The CLAIMED card now
shows the verification returned by the agent, and both demo outlines begin with
the functioning tool call in the first twelve seconds.

A clean temporary clone of candidate `7c5e712` completed `npm ci`, all 94 tests,
and the production build before these re-audit changes. Because the re-audit
changes include implementation and preflight code, the next final candidate
must repeat that clean-clone proof; the earlier result is not carried forward as
final acceptance.

## Fresh external-seat status after the re-audit

Claude was actually re-invited after the hardened candidate was committed. It
performed a new read-only review of the named public packet and source files and
returned **direction GO / current submission NO-GO**. Gemini was also requested
as a required roundtable seat. A callable Gemini runtime was discovered later,
but its first attempt returned no review because file reading was denied; the
subsequent public-packet attempt was stopped by the host sharing gate before
execution. Gemini is therefore `attempted-unavailable`, not a participant, and
no Gemini agreement is claimed for this round.

Claude's strongest dissent was that the human boundary is a WebMCP workflow
boundary, not actor authentication: separate DOM automation could still click a
human-facing control. It also found two remaining local false-pass routes. A
generic sentence such as `coming soon` could satisfy an evidence-reference
field, and every file under `docs/` was treated as harmless metadata after the
product candidate. The implementation now accepts only HTTPS evidence URLs or
recognized receipt paths, rejects deferred prose, and limits post-candidate
metadata to the explicit release packet. Numeric-claim detection also covers
`fewer` and `less` wording.

## External-model share packet v2 — sent to both named seats

Only the text in this section was sent to Claude and Gemini 3.1 Pro after the
Owner explicitly required both seats to participate. It contains no
credentials, personal answers, protected data, private fixtures, repository
contents, or raw conversation history.

### Public challenge facts

These facts were read back from the official challenge surfaces on 2026-08-30
and must be rechecked before submission.

- Event: **The WebMCP Challenge** (`webmcp`).
- Deadline: `2026-09-03T20:00:00Z`.
- Required product: a WebMCP-powered web app in which humans and agents
  interact, collaborate, or create together.
- Existing projects must document a meaningful WebMCP extension created after
  the submission period opened on 2026-08-25.
- Required submission artifacts: judge-accessible live URL, public source
  repository with a visible open-source license, English materials or English
  translations, and a public YouTube demo under three minutes with audio.
- Judging: WebMCP Leverage, Execution, Potential Impact, and Creativity &
  Ambition. No equal weighting is claimed.

### Product claim under review

VERROCCHIO is a browser-native workshop for time-constrained solo builders. It
exposes four state-aware WebMCP actions: inspect the workshop, stop on
uncertainty, propose a validated but unsigned plan, and return an unverified
work claim. Approval, evidence verification, resume, publishing, deployment,
and final submission are not WebMCP tools; they remain in the human-facing
workflow. This is a workflow boundary, not actor authentication or tamper-proof
security.

The React/Vite app registers its tools with
`document.modelContext.registerTool`. Tool availability changes with workflow
state. Mutating calls require the latest `stateVersion` and an idempotency key,
and return machine-readable reasons when held or rejected. The app itself owns
the bounded state transitions and does not require an app-owned model API key.

The intended judge journey is:

```text
inspect MANCA -> propose unsigned plan -> human FIRMA -> return CLAIMED result
              -> human VERIFY or REQUEST CHANGES
```

### Current evidence and limits

Locally verified:

- A dated before/after challenge boundary exists, and the current product
  candidate has been locally audited.
- The candidate passed 95 automated tests and a real Chrome WebMCP smoke.
- The Chrome smoke registered four initial tools, reduced the tool surface to
  inspection during FERMO and evidence review, restored it after human action,
  kept MANCA at 06 for a claim, and reduced it to 05 only after human VERIFY.
- No measured speed, reliability, security, or 30 percent improvement is
  claimed. Fresh-participant comprehension and general use beyond hackathons
  remain unproven.

Judge-visible evidence and release gates still unresolved:

- Registration is incomplete.
- Anonymous judge access to the live URL is not verified.
- Public repository reachability and visible license are not verified.
- The final annotated tag and its final clean-clone install, test, and build
  receipt remain TODO.
- No public demo-video URL is recorded or verified.

The planned opening of that demo is: show the target-user caption at 0:00,
send `What evidence is still missing?` at 0:02, show the real
`inspect_workshop` call by 0:05, and show readable MANCA and NEXT by 0:08. End
the first fifteen seconds with a clearly marked later-state montage of real
FIRMA REQUIRED and CLAIMED shots captured from the same hosted build; do not
imply that the inspection caused those states. Then show the one-sentence
problem from 0:15 to 0:29, MANCA, NEXT, and the human-only boundary from 0:29
to 0:49, and begin `propose_workshop_draft` from 0:49. By 1:00, show that the
result is unsigned and held at FIRMA REQUIRED.

### Independent questions

Claude role — architecture and rules critic:

1. Is the direction genuinely aligned with the official theme and judging
   criteria, or is WebMCP incidental?
2. Identify up to three supported counterarguments or overclaims. Say `none`
   when this packet does not support one. Then identify the highest-risk rule
   or submission gap.
3. Recommend `DIRECTION_GO` or `PIVOT`, separately from
   `SUBMISSION_GO` or `SUBMISSION_NO_GO`.

Gemini role — product experience and demo critic:

1. At fifteen seconds and again at sixty seconds, state whether a judge can
   identify all five facts: target user, product action, why WebMCP matters,
   the human-only boundary, and visible evidence that the product works.
2. Identify up to three supported points of confusion. Say `none` when this
   packet does not support one. Recommend the minimum repair to the planned
   demonstration sequence.
3. Recommend `DIRECTION_GO` or `PIVOT`, separately from
   `SUBMISSION_GO` or `SUBMISSION_NO_GO`.

Each model must answer independently in Japanese, cite only facts in this
packet, and avoid guessing another model's opinion. Use this common return
schema: facts used; unsupported assumptions; fifteen-second verdict;
sixty-second verdict; direction verdict; submission verdict; confidence; and
participation status. Mission Control, not either reviewer, owns the final
synthesis.

## Fresh external round v2 receipt

Date: 2026-08-30 JST

Both external seats independently returned a review from the packet above. No
finding was attributed to a model before its response arrived.

| Seat | Participation | Direction | Submission | Strongest finding |
| --- | --- | --- | --- | --- |
| Gemini 3.1 Pro (High) | completed-success | `DIRECTION_GO` | `SUBMISSION_NO_GO` | At fifteen seconds the target user, product action, and working UI are visible, but why WebMCP matters and the human-only boundary are not. At sixty seconds, why WebMCP matters remains too implicit. Remove the later-state cold-open montage and show the actual state sequence earlier. |
| Claude | completed-success | `DIRECTION_GO` | `SUBMISSION_NO_GO` | WebMCP is central because tool registration, state-dependent availability, versioned mutations, and machine-readable holds form the workflow contract. Potential Impact and Creativity evidence are thin, the dated existing-project extension needs clearer proof, and mandatory public artifacts remain unresolved. |

### Bounded synthesis

The shared verdict is evidence, not automatic authority. The reasons are
independent and complementary:

- Preserve the product direction: a time-constrained solo builder delegates
  inspection, stopping, unsigned planning, and claims through structured
  browser-native actions while approval and verification remain human-facing.
- Do not add another feature before submission. Repair the demonstration and
  public proof instead.
- Change the first minute from an explanatory montage to a chronological
  working path. State the WebMCP advantage explicitly: structured live state
  and state-aware tool availability, rather than DOM guessing.
- Strengthen the dated post-2026-08-25 extension receipt and the concrete impact
  story without inventing speed, reliability, security, or adoption metrics.
- Keep the submission at NO-GO until registration, anonymous live access,
  public repository/license identity, final tagged clean-clone proof, and the
  public audio demo are all verified.

## Applied roundtable decision

The next local revision applied the shared decision without adding product
features:

- The demo now keeps every product state in causal order. It shows a real
  inspection, structured MANCA/NEXT and the human boundary, then reaches an
  unsigned `FIRMA REQUIRED` plan before explaining the problem. Later FIRMA and
  CLAIMED states are no longer inserted into the cold open.
- The first fifteen seconds now carry the target user, working product action,
  WebMCP reason, human boundary, and real evidence in one chronological path.
- The Existing-project explanation now names the pre-Challenge shell and the
  post-2026-08-25 WebMCP capability delta directly, while separating local
  candidate evidence from incomplete public proof.
- Potential Impact and Execution wording is limited to visible return-point
  behavior and recorded candidate evidence. No attention, speed, reliability,
  usability, adoption, or generalization improvement is claimed as proven.
