# Devpost draft

Status: ready for payload-specific evidence and final links.

## Title

VERROCCHIO — The workshop that paints itself

## Tagline

A self-proving AI execution workshop that governs its own build, then directs
a distinct GPT-5.6 product to submission.

## Category

Developer Tools

## Inspiration

AI coding tools made implementation fast, but they did not make finishing
automatic. Decisions could silently expand scope, human approval could become
constant interruption, and a pile of working code could still miss the
repository, demo, evidence, or final submission required by a hackathon.

VERROCCHIO began with a narrow question: what if the development system knew
the irreversible finish line first and planned backward from the proof judges
must see?

## What it does

VERROCCHIO replaces claimed progress with `MANCA`: the count of submission
proofs still missing. Work is classified by material:

- `GESSO` for autonomous groundwork;
- `SECCO` for reversible decisions that can be reviewed later;
- `AFFRESCO` for irreversible work that stops for human `FIRMA`.

The human owns WHY, NO, and FIRMA. The workshop owns HOW.

GPT-5.6 Sol acts as CAPOBOTTEGA. It receives the contract, proposed work,
current MANCA, and missing gates, then returns a strict decision containing
material, reason, next stroke, human action, scope effect, target gate, and an
evidence note. AFFRESCO disables both resume and further decisions until the
human signs.

CARTONE compiles the decision into a bounded work packet for Codex,
adversarial review, or research and visual synthesis. EVIDENCE records the
actions and model response IDs. CENACOLO prevents final delivery until every
gate has proof.

## The self-reference

VERROCCHIO was used to direct its own construction. In the verified path,
CAPOBOTTEGA classified the act of publishing its own integration as AFFRESCO,
required FIRMA, activated FERMO, changed the GIORNATA, spent human attention,
and wrote its real GPT-5.6 response ID to the evidence ledger.

The second half of the entry is a distinct payload built under the same
contract: Reading Constellation, a two-person reading experience that reveals
connections between different books and uses GPT-5.6 to explain a traceable
bridge to the next book. This section remains provisional until payload FIRMA
and hosted verification.

## How we built it

- Codex was the primary implementation environment for source changes,
  interaction tests, browser verification, build packaging, and the build
  trail.
- GPT-5.6 Sol powers the runtime decision boundary through the Responses API
  with medium reasoning, low verbosity, `store: false`, and strict Structured
  Outputs.
- React and Vite render the local-first workshop.
- A server-only worker owns the OpenAI key and CAPOBOTTEGA route.
- Sites hosts the judge-facing workshop build.

## Challenges

The hardest part was making the Renaissance vocabulary executable rather than
decorative. `AFFRESCO`, `SECCO`, `GESSO`, `FERMO`, and `FIRMA` each had to
compile into a state transition, permission boundary, UI state, and test.

Browser testing exposed two important bypasses: gates could initially be
closed without proof, and old held AFFRESCO decisions could be resumed after a
state migration. Both are now explicit regression tests.

## Accomplishments

- The product used its own GPT-5.6 boundary to stop its publication.
- MANCA cannot decrease without attached proof.
- An unresolved FIRMA cannot be bypassed or overwritten.
- The same state compiles into role-specific work packets.
- The evidence ledger is both a product feature and a submission artifact.

## What we learned

Autonomy is not the absence of human decisions. It is a precise allocation of
which decisions deserve scarce human attention. A model can own the HOW while
the human retains purpose, veto, and irreversible responsibility.

## What's next

- Complete the hosted G3 judge path and record its model evidence.
- Publish the public repository and ≤ 3:00 English demo.
- Attach final links and submission receipt to MANCA.

## Final links

- Live workshop: `TBD`
- Payload: `TBD`
- Public repository: `TBD`
- Demo video: `TBD`
- Primary Codex `/feedback` Session ID: `TBD`
- GPT-5.6 runtime evidence: `docs/CAPOBOTTEGA.md`
