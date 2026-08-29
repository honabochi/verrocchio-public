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
| 8 | AI + Owner | Replace publication placeholders, complete the English Devpost fields, and read back every URL, answer, limitation, and before/after link | Draft, manifest, public artifacts, and official form agree | Any field is inferred, stale, missing, or points to another revision |
| 9 | Owner | Give final FIRMA and manually submit before `2026-09-03T20:00:00Z` | Devpost shows the submitted entry and the Owner reads it back | Deadline, eligibility, ownership, or final content is uncertain |
| 10 | Owner + AI | Freeze the submitted entry, repository, live build, and video through judging; continue later work elsewhere | Periodic read-only checks show unchanged public revision and accessibility | A submitted artifact changed or judge access broke |

## Current exact next action

Only gate 1 is actionable now. Before any registration call, Mission Control
must show the Owner an exact summary of the selected form answers and receive an
explicit `登録して`. A general `GO` does not authorize registration, agreement,
publication, tag creation, deployment, video upload, or final submission.
