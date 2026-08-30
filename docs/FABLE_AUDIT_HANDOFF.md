# VASARI audit handoff · Claude Fable 5

## Commission

Audit VERROCCHIO as a reusable hackathon execution system.

VERROCCHIO is not an OpenAI-hackathon submission idea. It is the Phase 1
meta-system that receives a different hackathon's official rules, judging
criteria, deadline, constraints, and available AI roles, then directs the team
from mission intake to a verified submission.

Do not redesign the product from first principles. First determine whether the
current implementation can genuinely perform that commission. Then propose the
few creative changes with the highest probability of improving hackathon
outcomes.

## Live and source references

- Production: https://verrocchio.vercel.app
- GitHub: https://github.com/honabochi/verrocchio
- Production commit: `70136207ec200741ad15d08abf3905c51c6a3eb3`
- Repository visibility: private; use the supplied audit archive if direct
  GitHub access is unavailable.

Never request, inspect, reproduce, or infer API keys, environment-variable
values, authentication material, browser storage, or other secrets.

## Read in this order

### 1. Understand the contract

1. `README.md`
2. `CONTRATTO.md`
3. `CARTONE.md`

Confirm the intended control loop:

`MISSION → DRAFT → FIRMA → CARTONE → RESULT → EVIDENCE → REPLAN → CONSEGNA`

### 2. Inspect the neutral mission boundary

1. `src/hackathonProfiles.js`
2. `src/MissionView.jsx`
3. `src/model.js`

Determine whether a new hackathon can replace the complete mission profile
without inheriting OpenAI Build Week assumptions.

### 3. Inspect planning and decision contracts

1. `worker/workshop-plan.js`
2. `worker/capobottega.js`
3. `src/App.jsx`

Check strict-output validation, plan adoption, evidence preservation,
AFFRESCO/SECCO/GESSO classification, FERMO, and human FIRMA boundaries.

### 4. Inspect multi-model review

In `src/App.jsx`, locate `CenacoloView` and `normalizeExternalReview`.

Check that Claude, Gemini, and human reviews can return through one normalized
contract while remaining advisory. No external model opinion may close MANCA,
authorize publishing, or sign CONSEGNA by itself.

### 5. Inspect deployment and proof

1. `vercel.json` — confirm no legacy model function is publicly wired
2. `worker/index.js` — confirm the Sites runtime serves static assets only
3. `worker/capobottega.js` and `worker/workshop-plan.js` — historical contracts,
   retained for local evidence rather than deployment
4. `src/App.test.jsx`
5. `src/model.test.js`
6. `worker/capobottega.test.js`
7. `worker/workshop-plan.test.js`

Use the tests as claims to challenge, not as proof to trust automatically.

## Required audit questions

1. Is the engine actually hackathon-agnostic, or merely relabeled?
2. Can official rules be converted into complete, evidence-backed submission
   gates without silently inventing requirements?
3. Can replanning preserve completed proof while correcting bad assumptions?
4. Are irreversible actions reliably stopped for human FIRMA?
5. Can external AI reviews influence the plan without becoming unaccountable
   decision-makers?
6. What breaks when rules are incomplete, contradictory, changed late, or
   supplied in another language?
7. What would prevent a first-time solo hacker from reaching a real submission?
8. Which existing feature looks impressive but does not increase the chance of
   passing judging?

## Creative challenge

After the audit, propose exactly three high-leverage moves:

1. one move that improves rule ingestion and compliance;
2. one move that improves execution speed under a short deadline;
3. one move that makes the system visibly compelling to judges.

Each move must reuse the existing workshop metaphor and control loop. Do not
propose a generic project-management dashboard, autonomous multi-agent swarm,
or broad rewrite.

## Return contract

Return one Markdown report with this exact structure:

```markdown
# VASARI verdict

Verdict: PROCEED | REVISE | FERMO
Confidence: HIGH | MEDIUM | LOW

## Executive finding
Three to six sentences.

## Blocking findings
For each P0/P1 finding:
- Severity
- Claim being challenged
- File and precise code location
- Reproduction or evidence
- Smallest corrective stroke
- Proof required to close it

## Non-blocking findings
P2 findings only. Do not list taste preferences as defects.

## Control-loop assessment
Assess each stage:
MISSION / DRAFT / FIRMA / CARTONE / RESULT / EVIDENCE / REPLAN / CONSEGNA

## Hackathon-agnostic assessment
Name every remaining event-, provider-, model-, or platform-specific assumption.

## Three creative moves
Exactly three, ranked by submission leverage divided by implementation cost.

## Recommended next stroke
One bounded action only.

## What not to change
Protect the parts that already carry the product's identity or safety boundary.
```

## Stop rules

- Do not edit code during the first audit.
- Do not expand the product into submission-idea generation yet.
- Do not recommend closing a gate without concrete proof.
- Do not treat model confidence as evidence.
- Do not request secrets or private user data.
- Stop at the first P0 that invalidates later conclusions and mark the verdict
  `FERMO`.
