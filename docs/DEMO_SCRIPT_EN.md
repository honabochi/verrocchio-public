# VERROCCHIO — final demo script

Target runtime: **2:05–2:15**

Recording route: **four short screen clips with live Owner narration**

Final format: public YouTube, 1080p, audible English, no background music

Timed captions: `docs/DEMO_CAPTIONS_EN.srt`

Tonight's exact handoff: `docs/TONIGHT_RECORDING_HANDOFF.md`

## What this video proves

The video follows one real hosted journey:

```text
inspect_workshop
  → propose_workshop_draft (unsigned)
  → human FIRMA
  → return_work_result (CLAIMED)
  → visible human review boundary
```

The WebMCP calls and resulting UI states must be real. A later-state screenshot,
designed receipt, or generated reenactment cannot replace the hosted interaction.
Approval, evidence verification, publishing, and final submission are not
performed by the agent.

## Prepare these three prompts

Paste the relevant prompt into the host composer **before** starting each clip.
During recording, only click Send; do not type the prompt live.

### Prompt 1 — inspect

```text
Inspect the workshop. Tell me what proof is missing and the smallest next step. Leave approval, proof checks, and submission to me.
```

Expected real call: `inspect_workshop`. The result must show `MANCA`, `NEXT`,
and the human-only boundary.

### Prompt 2 — unsigned plan

```text
Using the current mission, create the smallest valid plan in Japanese. Do not publish. Leave FIRMA to me.
```

Expected real path: `inspect_workshop` if needed, then
`propose_workshop_draft`. The plan must stop at `FIRMA REQUIRED`.

### Prompt 3 — claimed result

```text
Inspect the active work. Do the smallest local task. Return the result with what changed, the check performed, an evidence reference, and the remaining risk. Do not approve it, publish it, or submit it.
```

Expected real path: `inspect_workshop`, then `return_work_result`. The result
must be `CLAIMED`, and `MANCA` must not decrease before human review.

## Four-clip storyboard and exact narration

Speak naturally. A short pause while a real tool runs is fine. If a run takes
too long, stop the clip after confirming the real result and trim only the idle
wait; never cut between the visible tool call and its resulting state.

### Clip 1 — 0:00–0:30 — Real inspection

**Before recording**

- Public workshop is open in a WebMCP-capable host.
- The page says `WEBMCP READY`.
- Prompt 1 is already in the composer but not sent.
- No notifications, unrelated tabs, profile details, or private task names are visible.

**Screen action**

1. Start recording on the working product, not a title card.
2. Click Send within two seconds.
3. Keep the real `inspect_workshop` call visible.
4. Show the returned `MANCA`, `NEXT`, and human-only actions at readable size.

**Say**

> VERROCCHIO helps a solo builder return after an interruption. The host uses
> WebMCP to inspect live workshop state, not guess from the page layout. It
> finds missing proof, the smallest next step, and the decisions that must stay
> with me.

### Clip 2 — 0:30–1:15 — Unsigned plan and human FIRMA

**Before recording**

- Continue from Clip 1's same mission state.
- Prompt 2 is already in the composer but not sent.

**Screen action**

1. Click Send immediately.
2. Show the real `propose_workshop_draft` call and the resulting plan.
3. Hold on `FIRMA REQUIRED` for at least one second.
4. Briefly show scope and risks.
5. Click `署名して計画を採用 / GIVE FIRMA & ADOPT` yourself.
6. Show the adopted plan and active CARTONE work packet.

**Say**

> Now the host proposes the smallest valid plan through WebMCP. VERROCCHIO
> checks the live version, proof gates, plan size, and retry key. The plan is
> still unsigned. A good AI answer is not approval, and the agent has no tool
> to adopt it. I read the scope and risks, then give FIRMA in the human
> interface. This is a visible decision, not a hidden prompt.

### Clip 3 — 1:15–1:50 — Return a claim without closing proof

**Before recording**

- The adopted plan has an active work packet.
- Prompt 3 is already in the composer but not sent.

**Screen action**

1. Click Send immediately.
2. Keep the real call sequence visible.
3. Show the returned summary, check performed, evidence reference, and risk.
4. Show `CLAIMED / 人間の確認待ち` and confirm that `MANCA` remains open.

**Say**

> The active packet says what to do, what to check, and when to stop. The agent
> returns a structured claim with an evidence reference and remaining risk.
> MANCA stays open. The result is CLAIMED, not VERIFIED, because an agent
> response is not proof.

### Clip 4 — 1:50–2:10 — Human review and close

**Screen action**

1. Show the three human review checks.
2. Show `VERIFY CLAIM` and `REQUEST CHANGES`, but click neither in the primary take.
3. End on the workshop with the open proof gate and next action visible.

**Say**

> I can verify the evidence or send the work back. WebMCP gives the host four
> bounded, state-aware calls: inspect, stop, propose, and return a claim.
> Approval, proof checks, publishing, and submission stay human. VERROCCHIO is
> a disciplined team of one.

## Maximum two takes

1. Record Clips 1–4 once from one clean mission in causal order.
2. Retake only a clip that meets a retake condition below. If the mission state
   changed, restart from a new clean mission and do not splice incompatible states.
3. Join the accepted clips in QuickTime in the same order.
4. Trim only dead air at clip edges. Do not reorder causal states.

## Retake conditions

Retake if any of these is true:

- the functioning product or real call is not visible in the first 10–15 seconds;
- a WebMCP tool name, returned state, `FIRMA REQUIRED`, or `CLAIMED` is unreadable;
- the host chooses another action or the app and host results disagree;
- a cut obscures whether the tool call caused the result;
- FIRMA appears to be performed by the agent;
- `MANCA` decreases before genuine human evidence verification;
- the narration claims a state that the screen does not show;
- any personal information, secret, notification, unrelated tab, private URL,
  file path, account identifier, browser history, or developer storage is visible;
- final runtime is three minutes or longer, audio is missing, or captions do not match.

## Safe fallback

If Prompt 3 cannot produce a genuine, readable `CLAIMED` result after one
clean retry, do not fabricate it. End after the human FIRMA and active work
packet, use this truthful closing line, and keep the final video under three
minutes:

> The next bounded packet is now ready. An agent may return a claim, but it
> cannot verify its own evidence, publish, or submit. Those decisions stay with
> the human.

## Final Owner check

- [ ] Real product is working within the first 10–15 seconds.
- [ ] Real WebMCP use is the center of the video.
- [ ] The screen and narration explain both what was built and how WebMCP is used.
- [ ] FIRMA and the evidence-review boundary are visibly human.
- [ ] No unsupported speed or broad impact claim appears.
- [ ] No secret, personal data, unrelated browser UI, or private material appears.
- [ ] Audio is clear, captions match, and runtime is under three minutes.
- [ ] The final public YouTube video is watched once while signed out.
