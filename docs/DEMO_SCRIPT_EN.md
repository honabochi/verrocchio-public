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

### 0:00–0:15 — Cold open: user, WebMCP, and human boundary

**Shot**

- Open on the deployed VERROCCHIO workshop with the caption:
  `For solo builders working in interrupted sessions`.
- By 0:02, send `What evidence is still missing?` in the host conversation.
- Show the real `inspect_workshop` call by 0:05, with a restrained caption:
  `Structured live state — not DOM guessing`.
- Cut to readable `MANCA` and `NEXT` by 0:08.
- End the cold open with two brief shots captured from the same hosted build:
  `FIRMA REQUIRED / HUMAN ONLY`, then `CLAIMED / 人間の確認待ち` with MANCA
  still open. Do not imply that these later states came from the read-only call.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> For solo builders working in interrupted sessions, VERROCCHIO exposes missing proof as structured WebMCP state. AI can inspect, stop, propose, and return claims; only the human-facing workflow can approve or verify them.

**Production note / 制作メモ**

- 最初の8秒以内に、静止画ではなく実際の送信、tool call、MANCA/NEXTを見せる。
- Keep the cursor visible and avoid a title card before the functioning product.
- FIRMAとCLAIMEDの短い先出しは同じ凍結buildの実録だけを使い、
  `inspect_workshop` が状態を変えたように編集しない。

### 0:15–0:29 — The problem, in one sentence

**Shot**

- Hold on the mission summary and the one-step guide. Do not read every rule or
  dashboard field.

**Narration**

> A solo builder has to remember every rule, handoff, and unfinished proof. AI can produce work, but a confident answer is not the same as verified progress.

### 0:29–0:49 — MANCA and the bounded next action

**Shot**

- Show the inspection result: missing proof gates, `MANCA`, the active work item, and the human-only boundary.
- Highlight only two fields with restrained callouts: `MANCA / 未確認の証拠` and `NEXT / 次の一手`.
- Do not scroll through every dashboard section.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> VERROCCHIO replaces vague percentages with MANCA: the number of required proofs that remain unverified. The inspection returns the next bounded stroke and also says which decisions belong only to the human.

### 0:49–1:13 — Create an unsigned plan through WebMCP

**Shot**

- Send: `Turn the saved mission into the smallest valid plan. Do not publish anything.`
- Show the host call `inspect_workshop`, then `propose_workshop_draft`.
- Show the validated draft appear in the app with its contract, gates, risks,
  stroke count, and `FIRMA REQUIRED` state. The stroke bodies become visible in
  CARTONE only after human adoption.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> The host model turns the saved mission into a strict plan, then submits it through WebMCP. VERROCCHIO validates the structure, state version, gate references, and retry key. The result is deliberately unsigned. The agent can propose this plan, but it cannot approve it.

### 1:13–1:32 — Human FIRMA

**Shot**

- Pause long enough to show that the draft is waiting for a human.
- Briefly reveal the risks and first evidence gate.
- Click the large Japanese `署名して計画を採用` control with its smaller `GIVE FIRMA & ADOPT` label.
- Show the adopted plan and active CARTONE stroke.

**Narration**

> I inspect the scope and risks, and only then give FIRMA. Approval is not a hidden prompt instruction and there is no approval tool for the agent to call. This irreversible decision stays in the interface, with the human.

**Production note / 制作メモ**

- FIRMA前に0.5〜1秒止め、AIが自動承認していないことを視覚的に伝える。
- For a deterministic take, request exactly four gates and three short strokes;
  make the first stroke `SECCO`, keep every action local, and forbid publishing.
- After FIRMA, move to CARTONE explicitly. Adoption does not navigate there by
  itself.

### 1:32–1:58 — Return work as a CLAIMED result

**Shot**

- Start or select the active stroke.
- In the host, ask it to inspect the active work, perform the bounded task, and return its result without approving it.
- Show `return_work_result` execute.
- In VERROCCHIO, show the returned summary, verification performed, evidence reference, remaining risk, and `CLAIMED / 人間の確認待ち` badge.
- Keep `MANCA` unchanged.
- **HOSTED EVIDENCE REQUIRED**

**Narration**

> The active work packet says what to change, what evidence to return, and when to stop. The agent returns a structured claim with verification, an evidence reference, and remaining risk. MANCA does not decrease, because an AI claim is still not proof.

### 1:58–2:20 — Human verification or return for changes

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

### 2:20–2:42 — Why WebMCP, and close

**Shot**

- Use a clean editing card built from the real host output; this comparison is not a product UI screen:
  - left: `DOM — find controls, read labels, click fields`
  - right: `WebMCP — inspect state, call a bounded transition, receive a bounded tool result`
- End on VERROCCHIO with the next action and human boundary visible.
- Caption: `A disciplined team of one. Evidence before completion.`

**Narration**

> A DOM agent may need to rediscover controls and infer their meaning on every screen. WebMCP gives the host a small, state-aware contract: inspect, stop, propose, and return a claim. VERROCCHIO uses that leverage to reduce fragile coordination while keeping approval, evidence verification, and final submission in the human-facing workflow. It is a disciplined workshop for a team of one.

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
