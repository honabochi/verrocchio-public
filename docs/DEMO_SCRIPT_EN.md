# VERROCCHIO — final demo edit record

Status: **local final edit complete; public YouTube URL pending**

- Final video: `VERROCCHIO-WebMCP-demo-v1.mov`
- Runtime: **70.12 seconds**
- Resolution: **1440×900**
- Audio: Japanese synthetic narration, one audible track
- Captions: `docs/DEMO_CAPTIONS_EN.srt`, 10 timed English cues
- Public upload and Devpost submission: not performed

This record supersedes the earlier 2:10 four-clip recording plan. The original
three host prompts and the intended causal route remain below for judge-path
traceability.

## What the final video shows

```text
inspect_workshop
  → propose_workshop_draft (unsigned)
  → human FIRMA
  → return_work_result (CLAIMED)
  → visible human review boundary
```

The edit shows the corresponding product states in causal order. Direct WebMCP
execution is also supported by the local capture log and source instrumentation;
host tool history is not fully legible in every video frame. The video does not
claim that AI approved evidence, published the project, or submitted the entry.

## Final timeline and English translation

### 0:01–0:10 — Inspect

> VERROCCHIO keeps proof and the next step visible after an interruption.
> `inspect_workshop` reads the current MANCA.

### 0:10–0:20 — Unsigned plan

> Next, `propose_workshop_draft` checks the smallest plan's state, evidence
> gates, and scope. The plan stops unsigned.

### 0:38–0:48 — Human FIRMA

> Only a human who has read the scope and risks gives FIRMA. Approval, evidence
> verification, publication, and submission remain human.

### 0:49–1:01 — Return a claim

> After adoption, `return_work_result` reports the change, check, evidence
> reference, and remaining risk. An AI response alone is not proof.

### 1:01–1:08 — Human review

> The result is CLAIMED, and MANCA stays open. The human verifies it or sends it
> back.

## Host prompts used for the route

### Inspect

```text
Inspect the workshop. Tell me what proof is missing and the smallest next step. Leave approval, proof checks, and submission to me.
```

### Propose an unsigned plan

```text
Using the current mission, create the smallest valid plan in Japanese. Do not publish. Leave FIRMA to me.
```

### Return a claimed result

```text
Inspect the active work. Do the smallest local task. Return the result with what changed, the check performed, an evidence reference, and the remaining risk. Do not approve it, publish it, or submit it.
```

## Narration provenance

The Japanese narration was generated locally with Kokoro 0.9.4,
`hexgrad/Kokoro-82M`, the built-in `jf_alpha` voice, Japanese language code
`j`, speed 0.92, 24 kHz mono PCM. The model repository declares Apache-2.0.
Final rights confirmation and YouTube's synthetic-content answer remain Owner
decisions based on the actual uploaded media.

## Final local acceptance

- [x] Functioning product appears within the first 10–15 seconds.
- [x] The causal flow reaches unsigned plan, human FIRMA, CLAIMED, and review.
- [x] Runtime is under three minutes.
- [x] One video track and one audible Japanese narration track are present.
- [x] Timed English captions end before the video ends.
- [x] Owner accepted normal-speed playback and caption alignment.
- [ ] Owner confirms all assets and generated-audio rights.
- [ ] Public YouTube playback is verified signed out with captions enabled.
