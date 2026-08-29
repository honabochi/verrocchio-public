import { describe, expect, test } from "vitest";
import {
  countDraftPlaceholders,
  missingDraftHeadings,
  missingOfficialFields,
  summarizeSubmissionChecks,
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
});
