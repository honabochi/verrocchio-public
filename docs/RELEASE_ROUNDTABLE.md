# Release Roundtable Decision

Date: 2026-08-30 JST  
Scope: public, non-sensitive submission preflight for the OpenAI WebMCP Challenge

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
