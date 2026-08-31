# Owner release gate

This is the shortest safe path from the current local candidate to a submitted
entry. It is a checklist, not permission to publish or submit. Identity,
residency, eligibility answers, credentials, and secrets stay in the Owner's
browser and are never copied into this repository or an AI transcript.

| # | Actor | Action | Evidence | Stop if |
| --- | --- | --- | --- | --- |
| 1 | Owner | Register for `webmcp`, answer the four personal usage questions, confirm eligibility, and accept the official rules and Devpost terms | Devpost reports registered; only the boolean is recorded locally | Any answer, eligibility clause, event slug, or agreement is uncertain |
| 2 | Owner | Review tracked/public files for secrets and private data off-screen | Owner confirms the review without showing values, paths, or screenshots | Any secret or protected data may be present |
| 3 | AI | Run tests, production build, clean-clone reproduction, numeric-claim scan, and local preflight on one candidate | Clean worktree, expected test count, build marker, and candidate SHA agree | Tests/build fail, files change, or the candidate moves |
| 4 | Owner | Approve one annotated submission tag at the verified HEAD | Local annotated tag peels to the exact verified HEAD | The tag name or SHA is not read back exactly |
| 5 | Owner | Publish the repository/tag and deploy the exact tagged build; change no billing, permissions, or unrelated resources | Public GitHub and live URLs exist | The operation would expose unrelated history/data or require an unapproved paid change |
| 6 | AI | From an unauthenticated session, verify HTTP access, MIT detection, required tag files, remote/default/tag/local SHA identity, live revision marker, and the 60-second WebMCP judge path | Preflight and clean judge smoke reference the same tagged SHA | Login is required, a SHA differs, or the tool/UI state disagrees |
| 7 | Owner | Record and publish the under-three-minute YouTube demo with audible English narration, using only the verified tagged build and authorized assets | Public video ID resolves; runtime, audio, rights, and shown revision are read back | Private browser chrome, unsupported claims, or third-party rights are uncertain |
| 8 | AI + Owner | Replace publication placeholders, complete the English Devpost fields, verify English or an English translation for every judge-required material, and read back every URL, answer, limitation, and before/after link | Draft, manifest, public artifacts, translation coverage, and official form agree | Any field is inferred, stale, missing, untranslated, or points to another revision |
| 9 | Owner | Give final FIRMA and manually submit before `2026-09-03T20:00:00Z` | Devpost shows the submitted entry and the Owner reads it back | Deadline, eligibility, ownership, or final content is uncertain |
| 10 | Owner + AI | Freeze the submitted entry, repository, live build, and video through judging; continue later work elsewhere | Periodic read-only checks show unchanged public revision and accessibility | A submitted artifact changed or judge access broke |

## Current exact next action

Gate 1 completed through the authenticated Devpost flow on 2026-08-30. The
public repository is also reachable without authentication, and the current
public working copy passed 117 automated tests and a production build.
These facts do not complete the release: the repository remains untagged, the
Site access is now public and an unauthenticated HTTP request returned the
expected VERROCCHIO page on 2026-08-31. The exact final deployed revision and
WebMCP judge path remain unverified, and no public video is recorded.

Public Site Version 25 is now anonymously reachable and identifies deployed
source `cbca8ad`. The exact return action is to run the seven hosted WebMCP cases
and two DOM baselines against a new evaluation run, then record the clean judge
path used for the demo. Stop before any credential value or protected browser
data is shown to AI.

Gate 2 still requires the Owner's separate off-screen confirmation that the
public-bound files contain no secret or protected data. Gate 4 remains deferred
until Site evidence and video metadata are stable; a general `GO` does not
authorize the final tag, video upload, or Devpost submission.

## Registration readback template — completed; answers stay off-repository

These public option labels were read from the official registration flow on
2026-08-30 JST. Re-read the live form immediately before registration because
the organizer may change it. Do not write the Owner's selected values, country,
eligibility response, or agreement state into this repository.

1. **Team state** — `Working solo`, `Looking for teammates`, or
   `Already have a team`.
2. **Work category** — `Founder`, `Developer at a startup`,
   `Developer at a mid-large company`, `Independent developer or freelancer`,
   `Student`, `Non-technical builder or creator`, or `Other`.
3. **Codex frequency** — `Never`, `Occasionally`, or `Regularly`.
4. **Prior WebMCP familiarity** — from never having heard of it through already
   having built something with it; use the exact live label.
5. **ChatGPT in-app-browser usage** — `Never`, `Once or twice`, `Occasionally`,
   or `Regularly`.
6. **Eligibility** — Owner confirms the actual country/residency and that the
   legal-age and excluded-territory conditions are satisfied.
7. **Agreements** — Owner opens and accepts the official Challenge rules and
   Devpost terms only after reading them.

This sequence was completed through the live form. The selected personal
answers remain off-repository. If registration must ever be repeated, re-read
the live form, show all seven items in one compact summary, require the exact
phrase `登録して`, and record only the resulting boolean status.
