# Release Roundtable Decision

Date: 2026-08-30 JST  
Scope: public, non-sensitive submission preflight for The WebMCP Challenge

This is a compact decision receipt, not a transcript. External reviews were
asked to judge only the public product description and release gates. No
credentials, private fixtures, or protected data were included.

## Participation

| Seat | Status | Independent finding |
| --- | --- | --- |
| Gemini | participated | The concept is differentiated, but the current artifact is not judge-accessible while the live URL returns 401, the repository returns 404, and no video or tag exists |
| Claude | participated | The WebMCP-specific structural claim is strong; the current candidate must not be submitted before public access, clean frozen-revision verification, and video |
| Architecture audit | participated | Local code, MIT license, build definition, and README are viable; the branch upstream was unsafe and external freeze/publication evidence is missing |
| Evidence audit | participated | Public URLs, official fields, final tag, clean judge smoke, and video are hard gates; numeric performance claims remain prohibited without a fresh verified receipt |
| Product/UX audit | participated | The demo should use desktop capture and show the real host call, MANCA, unsigned FIRMA stop, and the visible CLAIMED human-review state |

## Dissent

- Gemini prioritized repository, video, registration, live access, then tag.
- Claude prioritized repository, live access, frozen clean verification, video,
  then Devpost completion.
- Internal evidence review treated registration as an independent early gate
  because registration may close separately from the artifact deadline.

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

Claude participated again after those changes. It kept the direction at GO and
the current submission at NO-GO, and identified residual URL-login, non-percent
numeric-claim, and test-count regression routes; those checks were tightened in
the next candidate. A fresh Gemini follow-up was attempted but unavailable in
the current execution boundary, so no new Gemini finding or agreement is
claimed here. The earlier Gemini finding in the table above remains the last
actual Gemini contribution.

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
as a required roundtable seat, but no callable Gemini runtime was present in the
current environment. Gemini is therefore `attempted-unavailable`, not a
participant, and no Gemini agreement is claimed for this round.

Claude's strongest dissent was that the human boundary is a WebMCP workflow
boundary, not actor authentication: separate DOM automation could still click a
human-facing control. It also found two remaining local false-pass routes. A
generic sentence such as `coming soon` could satisfy an evidence-reference
field, and every file under `docs/` was treated as harmless metadata after the
product candidate. The implementation now accepts only HTTPS evidence URLs or
recognized receipt paths, rejects deferred prose, and limits post-candidate
metadata to the explicit release packet. Numeric-claim detection also covers
`fewer` and `less` wording.
