import { describe, expect, test } from "vitest";
import {
  arePostCandidateChangesMetadataOnly,
  countDraftPlaceholders,
  findPositiveNumericPerformanceClaims,
  inspectDraftSections,
  inspectEventContract,
  inspectOfficialFieldChecklist,
  inspectRequiredManifestKeys,
  isAnnotatedTagAtHead,
  isAuthenticationPath,
  isMeaningfulEvidenceRef,
  MINIMUM_SUBMISSION_TEST_COUNT,
  missingDraftHeadings,
  missingOfficialFields,
  summarizeSubmissionChecks,
  validatePublicUrlKinds,
  verifyBuildArtifactCopies,
  youtubeVideoId,
} from "./lib/submission-readiness.mjs";

describe("submission readiness", () => {
  test("counts unresolved publication markers", () => {
    expect(
      countDraftPlaceholders("TODO final live URL <final-submission-tag> not yet assigned"),
    ).toBe(4);
  });

  test("requires every draft heading", () => {
    expect(missingDraftHeadings("## One-line summary\n## The problem")).toContain(
      "## The solution",
    );
  });

  test("keeps owner-entered official fields incomplete", () => {
    expect(missingOfficialFields({ 28252: true })).toEqual(
      expect.arrayContaining(["28249", "28250", "28260"]),
    );
    expect(missingOfficialFields({
      28249: true,
      28250: true,
      28252: true,
      28253: true,
      28254: true,
      28256: true,
      28257: true,
      28258: true,
      28259: true,
      28260: true,
    })).toEqual([]);
  });

  test("requires the existing-app delta only for an Existing entry", () => {
    const otherwiseComplete = {
      28249: true,
      28250: true,
      28252: true,
      28254: true,
      28256: true,
      28257: true,
      28258: true,
      28259: true,
      28260: true,
    };
    expect(missingOfficialFields(otherwiseComplete, { appStatus: "Existing" }))
      .toEqual(["28253"]);
    expect(missingOfficialFields(otherwiseComplete, { appStatus: "New" }))
      .toEqual([]);
  });

  test("distinguishes local failure from an incomplete owner gate", () => {
    expect(summarizeSubmissionChecks([
      { id: "tests", status: "PASS" },
      { id: "video", status: "OWNER" },
    ]).verdict).toBe("INCOMPLETE");
    expect(summarizeSubmissionChecks([
      { id: "tests", status: "FAIL" },
      { id: "video", status: "OWNER" },
    ]).verdict).toBe("FAIL");
  });

  test("rejects manifest true when the Devpost checklist is unchecked", () => {
    expect(inspectOfficialFieldChecklist(
      "- [ ] **28249 — Submitter Type**\n",
      { 28249: true },
    )).toContain("28249 checklist and manifest disagree");
  });

  test("rejects duplicate required Devpost field ids", () => {
    const line = "- [x] **28249 — Submitter Type**\n";
    expect(inspectOfficialFieldChecklist(`${line}${line}`, { 28249: true }))
      .toContain("28249 appears 2 times");
  });

  test("rejects hollow or duplicate required sections", () => {
    expect(inspectDraftSections("## One-line summary\n\n## One-line summary\ntext"))
      .toContain("## One-line summary appears 2 times");
  });

  test("rejects placeholder variants", () => {
    expect(countDraftPlaceholders("todo TBD FIXME https://example.com []()"))
      .toBe(5);
  });

  test("rejects role-mismatched, duplicate, and local public URLs", () => {
    expect(validatePublicUrlKinds({
      live: "https://github.com/acme/repo",
      repository: "https://example.com/repo",
      video: "https://example.com/repo",
    })).toEqual(expect.arrayContaining([
      "live URL cannot reuse a repository or video host",
      "repository URL uses an unexpected host",
      "video URL uses an unexpected host",
      "public URLs must be distinct",
    ]));
    expect(validatePublicUrlKinds({ live: "https://127.0.0.1/app" }))
      .toContain("live URL cannot target a private or local host");
    expect(validatePublicUrlKinds({ video: "https://www.youtube.com/" }))
      .toContain("video URL must identify one YouTube video");
    expect(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("pins the canonical WebMCP event instead of relying on fuzzy names", () => {
    expect(inspectEventContract({
      event: "The WebMCP Challenge",
      eventSlug: "webmcp",
      eventUrl: "https://webmcp.devpost.com/",
      deadlineUtc: "2026-09-03T20:00:00Z",
    })).toEqual([]);
    expect(inspectEventContract({ event: "OpenAI Build Week" }))
      .toEqual(expect.arrayContaining(["slug must equal webmcp"]));
  });

  test("rejects empty required manifest objects and duplicate JSON keys", () => {
    expect(inspectRequiredManifestKeys(
      '{"evidenceRefs":{},"ownerAttestations":{}}',
      { evidenceRefs: {}, ownerAttestations: {} },
    )).toEqual(expect.arrayContaining([
      "evidenceRefs.cleanJudgeSmoke is missing",
      "ownerAttestations.registered is missing",
    ]));
    expect(inspectRequiredManifestKeys(
      '{"evidenceRefs":{"cleanJudgeSmoke":"a","cleanJudgeSmoke":"b","demoRecording":"c"},"ownerAttestations":{}}',
      { evidenceRefs: { cleanJudgeSmoke: "b", demoRecording: "c" }, ownerAttestations: {} },
    )).toContain("evidenceRefs.cleanJudgeSmoke appears 2 times in JSON");
  });

  test("rejects whitespace, sentinel, and example evidence references", () => {
    expect(isMeaningfulEvidenceRef("        ")).toBe(false);
    expect(isMeaningfulEvidenceRef("completed")).toBe(false);
    expect(isMeaningfulEvidenceRef("https://example.com/receipt")).toBe(false);
    expect(isMeaningfulEvidenceRef("receipts/judge-smoke-2026-08-30.json")).toBe(true);
  });

  test("prioritizes one concrete Owner action without hiding blockers", () => {
    const summary = summarizeSubmissionChecks([
      { id: "repo", status: "FAIL", priority: 40, action: "公開する" },
      { id: "register", status: "OWNER", priority: 1, actor: "OWNER", ownerOnly: true, action: "参加登録する" },
    ]);
    expect(summary.readyToSubmit).toBe(false);
    expect(summary.nextAction).toMatchObject({ id: "register", actor: "OWNER", action: "参加登録する" });
    expect(summary.blockers).toHaveLength(2);
    expect(summary.counts).toEqual({ PASS: 0, FAIL: 1, MISSING: 0, OWNER: 1 });
  });

  test("accepts only an annotated tag resolving to HEAD", () => {
    expect(isAnnotatedTagAtHead({ exists: true, type: "tag", tagCommit: "abc", head: "abc" })).toBe(true);
    expect(isAnnotatedTagAtHead({ exists: true, type: "commit", tagCommit: "abc", head: "abc" })).toBe(false);
    expect(isAnnotatedTagAtHead({ exists: true, type: "tag", tagCommit: "old", head: "abc" })).toBe(false);
  });

  test("rejects implementation files after the product candidate", () => {
    expect(arePostCandidateChangesMetadataOnly([
      "devpost-submission.md",
      "docs/RELEASE_ROUNDTABLE.md",
      "submission-manifest.json",
    ])).toBe(true);
    expect(arePostCandidateChangesMetadataOnly(["src/App.jsx"])).toBe(false);
    expect(arePostCandidateChangesMetadataOnly(["package.json"])).toBe(false);
  });

  test("rejects stale or mismatched build copies", () => {
    const good = {
      hostingSource: Buffer.from("hosting"),
      hostingBuilt: Buffer.from("hosting"),
      workerSource: Buffer.from("worker"),
      workerBuilt: Buffer.from("worker"),
      indexHtml: "<title>VERROCCHIO</title>",
      jsBundles: ["人間の確認待ち"],
      expectedRevision: "abc123",
    };
    good.indexHtml = '<meta name="verrocchio-revision" content="abc123"><title>VERROCCHIO</title>';
    expect(verifyBuildArtifactCopies(good)).toBe(true);
    expect(verifyBuildArtifactCopies({ ...good, workerBuilt: Buffer.from("stale") })).toBe(false);
    expect(verifyBuildArtifactCopies({ ...good, jsBundles: ["old copy"] })).toBe(false);
  });

  test("requires evidence for positive numeric performance claims but ignores explicit non-claims", () => {
    expect(findPositiveNumericPerformanceClaims("The verified flow is 30% faster.")).toHaveLength(1);
    expect(findPositiveNumericPerformanceClaims("The verified flow is 3x faster.")).toHaveLength(1);
    expect(findPositiveNumericPerformanceClaims("Measured latency is 45ms latency.")).toHaveLength(1);
    expect(findPositiveNumericPerformanceClaims("Do not claim a 30 percent improvement until verified.")).toHaveLength(0);
    expect(MINIMUM_SUBMISSION_TEST_COUNT).toBe(92);
  });

  test("rejects same-host authentication redirect paths", () => {
    expect(isAuthenticationPath("/login")).toBe(true);
    expect(isAuthenticationPath("/oauth/authorize")).toBe(true);
    expect(isAuthenticationPath("/projects/login-report")).toBe(false);
  });
});
