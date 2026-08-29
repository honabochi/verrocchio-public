export const REQUIRED_OFFICIAL_FIELDS = [
  "28249",
  "28250",
  "28252",
  "28253",
  "28254",
  "28256",
  "28257",
  "28258",
  "28259",
  "28260",
];

export const REQUIRED_DRAFT_HEADINGS = [
  "## One-line summary",
  "## The problem",
  "## The solution",
  "## Why this matters",
  "## How Codex and other AI assistance were used",
  "## Key features",
  "## Implementation",
  "## Testing instructions for judges",
  "## Suggested screenshots",
  "## 2:40 demo video outline",
  "## Known limitations",
  "## Official Devpost form field checklist",
];

export function countDraftPlaceholders(text) {
  const markers = [
    /\bTODO\b/g,
    /<final-submission-tag>/g,
    /final live URL/gi,
    /not yet assigned/gi,
  ];
  return markers.reduce(
    (count, pattern) => count + (text.match(pattern)?.length || 0),
    0,
  );
}

export function missingDraftHeadings(text) {
  return REQUIRED_DRAFT_HEADINGS.filter((heading) => !text.includes(heading));
}

export function missingOfficialFields(fields = {}) {
  return REQUIRED_OFFICIAL_FIELDS.filter((id) => fields[id] !== true);
}

export function summarizeSubmissionChecks(checks) {
  const counts = checks.reduce(
    (result, check) => ({
      ...result,
      [check.status]: (result[check.status] || 0) + 1,
    }),
    {},
  );
  const verdict = checks.some((check) => check.status === "FAIL")
    ? "FAIL"
    : checks.every((check) => check.status === "PASS")
      ? "PASS"
      : "INCOMPLETE";
  return { verdict, counts, checks };
}
