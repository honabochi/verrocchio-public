# WebMCP falsification checkpoint

Date: 2026-08-28 JST

Rule source note: the OpenAI landing page displays September 3 at 5:00 PM PT,
while the Devpost official rules close submissions at September 3 at 1:00 PM
PDT. The workshop uses the earlier contractual deadline: September 4 at 5:00
AM JST.

## Hypothesis

A time-constrained solo builder can let a browser agent move a mission forward
without giving the agent authority to approve evidence, sign irreversible work,
resume a held workshop, or submit the result.

## Implemented vertical slice

1. Chrome discovers `inspect_workshop`, `call_fermo`,
   `propose_workshop_draft`, and `return_work_result` through
   `document.modelContext`.
2. Every mutation requires a current `stateVersion` and a bounded idempotency
   key. Stale requests fail and retries replay their stored receipt.
3. `call_fermo` stops the workshop; only the visible human control can resume it.
4. `return_work_result` creates a structured `CLAIMED` result. MANCA does not
   decrease.
5. While the claim awaits review, mutation tools are unregistered and only
   `inspect_workshop` remains.
6. The visible review controls are human-only. A human checks currency,
   reproducibility, and remaining risk, then chooses verify or return for changes.
7. Verification changes the claim to `VERIFIED`, closes its gate, reduces MANCA,
   advances the next stroke, and re-registers the applicable tools. Returning it
   changes the claim to `CHANGES_REQUESTED`, preserves the audit trail, restores
   the stroke, and also re-registers the applicable tools.
8. A one-step guide derives the current actor, action, pass condition, target view,
   and optional host prompt from workshop state. It does not persist a second
   workflow state.

## Verification receipt

- Chrome: 151.0.7922.174, headed, isolated browser profile
- Flags: `WebMCPTesting`, `DevToolsWebMCPSupport`
- Native tools discovered: 4
- Native `inspect_workshop` execution: passed
- Native result claim: passed; MANCA remained 06
- Tools while awaiting human verification: `inspect_workshop` only
- Human verification: passed; MANCA changed 06 → 05
- Structured plan draft contract: passed; ChatGPT/Codex supplies the reasoning
  through WebMCP and the site makes no model API call
- Tools while awaiting FIRMA: `inspect_workshop` only
- Human FIRMA and plan adoption: passed; mutation tools returned afterward
- Human return-for-changes path: passed; claim history preserved and work restored
- Seven-stage one-step guide derivation: passed
- Browser page errors: 0
- Mobile document overflow at 390 px: none
- Automated tests: 68 passed
- Production build: passed

## Not yet proven

- Natural-language tool selection reaches the right tool in at least 5 of 6
  adversarial prompts.
- A recorded hosted host-agent run selects and executes the same tools without a
  local deterministic caller.
- A fresh user understands MANCA, FIRMA, and FERMO within 30 seconds.
- The WebMCP journey is at least 30 percent faster or shorter than DOM-only
  actuation.

These are stop gates, not assumed successes.
