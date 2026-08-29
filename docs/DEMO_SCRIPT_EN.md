# VERROCCHIO Public Demo Script

Target runtime: **2:35–2:45**  
Primary target: public YouTube demo  
Format: screen recording with English narration, restrained captions, and no background music

## Truth boundary

- Record the WebMCP calls and resulting UI states from the deployed hosted app. Do not recreate tool receipts in an editor.
- Scenes marked **HOSTED EVIDENCE REQUIRED** are not complete until the recorded host visibly performs the stated call and the app shows the resulting state.
- Do not claim that WebMCP is 30% faster or requires 30% fewer actions until a passing hosted WebMCP-versus-DOM receipt exists.
- Do not show secrets, private task names, personal notifications, account details, browser history, or unrelated tabs.
- Use no third-party music, logos, stock media, or trademarked visual lockups. Crop incidental host chrome to the minimum needed to establish the functional WebMCP interaction.

## Storyboard and narration

### 0:00–0:15 — Real inspection: user, WebMCP, and human boundary

**Shot**

- Open on the deployed VERROCCHIO workshop with the caption:
  `For solo builders working in interrupted sessions`.
- By 0:02, send `What evidence is still missing?` in the host conversation.
- Show the real `inspect_workshop` call by 0:05, with a restrained caption:
  `Structured live state — not DOM guessing`.
- By 0:08, show readable `MANCA`, `NEXT`, and the returned human-only decisions
  together. Keep the real host result and corresponding app state in causal
  order.
- At 0:12, send `Create the smallest valid plan. Do not publish.` from the same
  mission state. Do not show FIRMA or CLAIMED before the actions that create
  those states.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> For solo builders working through interruptions, VERROCCHIO exposes live work as structured WebMCP state, not DOM guessing. The agent sees missing proof and the next action; approval and verification have no agent tool and remain in the human-facing workflow.

**Production note / 制作メモ**

- 最初の8秒以内に、静止画ではなく実際の送信、tool call、MANCA/NEXTを見せる。
- Keep the cursor visible and avoid a title card before the functioning product.
- All product states must appear in causal order from one clean mission.
  Straight cuts may remove latency only; never insert a later FIRMA or CLAIMED
  state before the action that created it.

### 0:15–0:28 — Create an unsigned plan through WebMCP

**Shot**

- Continue the request sent at 0:12 and show the real
  `propose_workshop_draft` call. If the host performs a fresh inspection first,
  keep that call in sequence; do not recreate or skip it deceptively.
- Leave one genuine pending moment, then use a visible straight cut if latency
  would make the result unreadable within the segment.
- Show the validated draft and hold on `FIRMA REQUIRED` by 0:28. The stroke
  bodies must not appear in CARTONE before human adoption.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> The host sends a bounded plan through WebMCP. VERROCCHIO checks the live state, gate references, plan size, and retry key. The result is deliberately unsigned; no agent approval tool exists.

### 0:28–0:49 — The problem, while FIRMA is visibly pending

**Shot**

- Keep the unsigned draft and `FIRMA REQUIRED` state visible.
- Reveal only the mission, risks, and first evidence gate. Do not read every
  rule or dashboard field.
- Do not click the human control during this segment.

**Narration**

> An interrupted solo builder must track rules, handoffs, and unfinished proof. VERROCCHIO preserves the next bounded action, but a confident AI answer is still not verified progress. That is why this plan waits for me.

### 0:49–1:08 — Human FIRMA

**Shot**

- Pause long enough to show that the draft is waiting for a human.
- Briefly reveal the risks and first evidence gate.
- Click the large Japanese `署名して計画を採用` control with its smaller `GIVE FIRMA & ADOPT` label.
- Show the adopted plan and active CARTONE stroke.

**Narration**

> I inspect the scope and risks, and only then give FIRMA. Approval is not a hidden prompt instruction and there is no approval tool for the agent to call. This governed decision stays visible in the human interface.

**Production note / 制作メモ**

- FIRMA前に0.5〜1秒止め、AIが自動承認していないことを視覚的に伝える。
- For a deterministic take, request exactly four gates and three short strokes;
  make the first stroke `SECCO`, keep every action local, and forbid publishing.
- After FIRMA, move to CARTONE explicitly. Adoption does not navigate there by
  itself.

### 1:08–1:34 — Return work as a CLAIMED result

**Shot**

- Start or select the active stroke.
- In the host, ask it to inspect the active work, perform the bounded task, and return its result without approving it.
- Show `return_work_result` execute.
- In VERROCCHIO, show the returned summary, verification performed, evidence reference, remaining risk, and `CLAIMED / 人間の確認待ち` badge.
- Keep `MANCA` unchanged.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> The active work packet says what to change, what evidence to return, and when to stop. The agent returns a structured claim with verification, an evidence reference, and remaining risk. MANCA does not decrease, because an AI claim is still not proof.

### 1:34–1:56 — Human verification or return for changes

**Shot**

- Show the three review checks: current, reproducible, and acceptable remaining risk.
- Show both human choices with their current Japanese-first labels: `証拠主張を確認する / VERIFY CLAIM` and `差し戻す / REQUEST CHANGES`.
- Primary take: verify only if the evidence shown in the recording is genuinely inspectable.
- Safe fallback take: choose `Request changes`, enter a short concrete reason,
  show the work return to the queue, then open EVIDENCE briefly to show the
  preserved return reason and claim history.

**Narration — verification take**

> The human checks whether the result is current, reproducible, and honest about risk. Only this verification closes the evidence gate and reduces MANCA.

**Narration — request-changes take**

> If the evidence is stale or incomplete, the human sends it back with a reason. The claim stays in the history, the gate stays open, and the next attempt starts from an explicit return point.

### 1:56–2:18 — Preserved evidence and exact return point

**Shot**

- For the primary public take, use `REQUEST CHANGES` unless the returned
  evidence is genuinely inspectable on camera.
- Open EVIDENCE and show the preserved return reason, claim history, open gate,
  and next action. Keep the text readable; do not scroll through the full log.

**Narration**

> A rejected claim is not erased or called complete. Its reason remains in history, the proof gate stays open, and the next attempt starts from an explicit return point after interruption.

### 2:18–2:40 — Why WebMCP, and close

**Shot**

- Use a clean editing card built from the real host output; this comparison is not a product UI screen:
  - left: `DOM — find controls, read labels, click fields`
  - right: `WebMCP — inspect state, call a bounded transition, receive a bounded tool result`
- End on VERROCCHIO with the next action and human boundary visible.
- Caption: `A disciplined team of one. Evidence before completion.`

**Narration**

> A DOM agent may rediscover controls and guess whether text is a claim or a decision. WebMCP replaces that guess with bounded, state-aware calls: inspect, stop, propose, and return a claim. Approval and verification remain in the human-facing workflow. A disciplined workshop for a team of one.

**Production note / 制作メモ**

- The comparison card may be edited for legibility, but every value must come from the real recorded host interaction.
- Record at 2560×1440 and export at 1920×1080. Keep the app at least 1280px wide and show the host and app as separate full-width cuts rather than a narrow split screen.

## Shot checklist

### Product and evidence

- [ ] The functioning deployed app appears within the first 10 seconds.
- [ ] `inspect_workshop` is visible in a real hosted call.
- [ ] The returned `MANCA` and next action are readable at normal playback speed.
- [ ] `inspect_workshop → propose_workshop_draft` is captured from one clean mission state.
- [ ] The unsigned draft visibly waits for human FIRMA.
- [ ] The human FIRMA click and adopted state are both visible.
- [ ] `return_work_result` is captured from a genuinely active stroke.
- [ ] The result is visibly `CLAIMED`, with MANCA unchanged before human review.
- [ ] Verification is shown only with inspectable evidence; otherwise use the honest request-changes take.
- [ ] The final frame states the WebMCP-versus-DOM difference without an unproven numeric improvement.

### Legibility and privacy

- [ ] Use 1080p or higher capture and verify text at 100% YouTube playback size.
- [ ] Crop unrelated host chrome, tabs, notifications, profile images, and account identifiers.
- [ ] Use a clean seeded mission with no private repository names or personal data.
- [ ] Keep zoom and cursor movement steady; do not scroll while the narration explains a key state.
- [ ] English captions match the final narration exactly.
- [ ] Japanese UI terms may remain visible, but important English meaning is supplied once in narration or caption.

### Rights and audio

- [ ] No third-party music, logos, stock footage, or decorative trademark assets.
- [ ] Use narration and native interface sound only; mute notification and system sounds.
- [ ] Confirm the final runtime is between 2:35 and 2:45.

## Retake and fallback plan

1. **WebMCP tool does not register**  
   Stop the take. Confirm the deployed app shows WebMCP ready, reopen a clean mission, and record again. Do not substitute a fabricated tool list.

2. **The host chooses the wrong tool or adds an unsafe action**  
   Preserve the failed run as internal diagnostic evidence, reset to a new isolated run, and retry once. For the public edit, use a complete successful hosted take only if its receipt and UI state agree.

3. **Latency makes the take too long**  
   Use a visible straight cut after the request and before the result. Do not speed up the footage or describe the cut as evidence of performance. Keep at least one moment showing the genuine pending state.

4. **The draft or result text is unreadable**  
   Retake with a tighter crop or browser zoom. Do not replace the live UI with a designed mockup.

5. **The evidence cannot be independently inspected on camera**  
   Use the request-changes branch. This demonstrates the product boundary more truthfully than approving a weak claim.

6. **The hosted comparison receipt is not yet passing**  
   Keep the qualitative closing line about structured, state-aware calls. Remove any numeric speed, action-count, or reliability claim.

7. **Runtime exceeds 2:45**  
   First remove pauses from the mission summary and the final comparison frame. Do not cut the functioning first call, FIRMA boundary, or CLAIMED-to-human-review sequence.
