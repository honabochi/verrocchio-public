export const REQUIRED_OFFICIAL_FIELDS = [
  "28249",
  "28250",
  "28252",
  "28254",
  "28256",
  "28257",
  "28258",
  "28259",
  "28260",
];

export const REQUIRED_DRAFT_HEADINGS = [
  "## One-line Summary",
  "## Problem",
  "## Solution",
  "## Why This Matters",
  "## How We Used AI",
  "## How We Used Codex",
  "## Key Features",
  "## Architecture",
  "## Testing Instructions",
  "## Public Demo Link",
  "## Public Repository Link",
  "## Language and judge accessibility",
  "## Demo Video",
  "## Screenshot Shot List",
  "## Submission Readiness Notes",
  "## Known Limitations",
  "## TODO Official Form Fields",
];

export const REQUIRED_EVIDENCE_REFS = [
  "cleanJudgeSmoke",
  "demoRecording",
  "hostedEvaluation",
];

export const REQUIRED_OWNER_ATTESTATIONS = [
  "registered",
  "rulesAndTermsAccepted",
  "secretsReviewedOffScreen",
  "cleanCloneCiTestBuildPassed",
  "videoUnderThreeMinutesWithAudibleEnglishNarration",
  "englishSubmissionMaterialsOrTranslationsVerified",
  "videoAssetsAndRightsConfirmed",
  "numericClaimsVerifiedOrRemoved",
  "frozenRevisionMatchesAllPublicArtifacts",
  "finalEntryReadBack",
  "projectOwnershipThirdPartyRightsAndNoConflictConfirmed",
  "postDeadlineFreezePlanConfirmed",
];

export const MINIMUM_SUBMISSION_TEST_COUNT = 92;

export const EXPECTED_EVENT_CONTRACT = {
  name: "The WebMCP Challenge",
  slug: "webmcp",
  url: "https://webmcp.devpost.com/",
  deadlineUtc: "2026-09-03T20:00:00Z",
};

export const URL_KIND_HOSTS = {
  live: new Set(["verrocchio-workshop.honabochi.chatgpt.site"]),
  repository: new Set(["github.com"]),
  video: new Set(["youtube.com", "www.youtube.com", "youtu.be"]),
};

export const MAX_PUBLIC_RESPONSE_BYTES = 2 * 1024 * 1024;
export const MAX_PUBLIC_REDIRECTS = 3;

function validateProbeUrl(value, kind) {
  const url = value instanceof URL ? value : new URL(value);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:") throw new Error("Public URL must use HTTPS");
  if (url.username || url.password) throw new Error("Public URL cannot contain credentials");
  if (url.port && url.port !== "443") throw new Error("Public URL cannot use a nonstandard port");
  if (!URL_KIND_HOSTS[kind]?.has(host)) {
    throw new Error(`Public ${kind} URL uses an unexpected host`);
  }
  return url;
}

export async function readResponseTextLimited(
  response,
  maxBytes = MAX_PUBLIC_RESPONSE_BYTES,
) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    await response.body?.cancel();
    throw new Error(`Response exceeds the ${maxBytes}-byte limit`);
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Response exceeds the ${maxBytes}-byte limit`);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function fetchPublicUrlSafely(
  value,
  {
    kind,
    fetchImpl = fetch,
    signal,
    maxBytes = MAX_PUBLIC_RESPONSE_BYTES,
    maxRedirects = MAX_PUBLIC_REDIRECTS,
  } = {},
) {
  let current = validateProbeUrl(value, kind);
  const seen = new Set();

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    const key = current.href;
    if (seen.has(key)) throw new Error("Public URL redirect loop detected");
    seen.add(key);

    const response = await fetchImpl(current, {
      redirect: "manual",
      headers: { "User-Agent": "VERROCCHIO-submission-preflight" },
      signal,
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      if (redirects === maxRedirects) {
        throw new Error(`Public URL exceeded ${maxRedirects} redirects`);
      }
      current = validateProbeUrl(new URL(location, current), kind);
      continue;
    }

    return {
      response,
      body: await readResponseTextLimited(response, maxBytes),
      finalUrl: current,
    };
  }
  throw new Error("Public URL redirect validation failed");
}

export function inspectEventContract(manifest = {}) {
  const actual = {
    name: manifest.event,
    slug: manifest.eventSlug,
    url: manifest.eventUrl,
    deadlineUtc: manifest.deadlineUtc,
  };
  return Object.entries(EXPECTED_EVENT_CONTRACT)
    .filter(([key, value]) => actual[key] !== value)
    .map(([key, value]) => `${key} must equal ${value}`);
}

export function youtubeVideoId(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    return "";
  }
  const host = url.hostname.toLowerCase();
  let id = "";
  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] || "";
  } else if (host === "youtube.com" || host === "www.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
    if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] || "";
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
}

export function countDraftPlaceholders(text) {
  const publicationText = String(text || "").replace(
    /^## TODO Official Form Fields\s*$/gmi,
    "## Official Form Fields",
  );
  const markers = [
    /\b(?:TODO|TBD|TK|FIXME|XXX)\b/gi,
    /<final-submission-tag>/g,
    /final live URL/gi,
    /not yet assigned/gi,
    /insert (?:the )?(?:final )?(?:url|link)/gi,
    /https?:\/\/(?:www\.)?example\.com/gi,
    /\]\(\s*\)/g,
  ];
  return markers.reduce(
    (count, pattern) => count + (publicationText.match(pattern)?.length || 0),
    0,
  );
}

export function missingDraftHeadings(text) {
  return REQUIRED_DRAFT_HEADINGS.filter((heading) => !text.includes(heading));
}

export function inspectDraftSections(text) {
  const headings = [...text.matchAll(/^##\s+(.+)$/gm)];
  const issues = [];
  for (const required of REQUIRED_DRAFT_HEADINGS) {
    const title = required.replace(/^##\s+/, "");
    const matches = headings.filter((match) => match[1].trim() === title);
    if (matches.length !== 1) {
      issues.push(`${required} appears ${matches.length} times`);
      continue;
    }
    const start = matches[0].index + matches[0][0].length;
    const next = headings.find((heading) => heading.index > matches[0].index);
    const body = text.slice(start, next?.index ?? text.length).trim();
    if (body.length < 12) issues.push(`${required} has no substantive body`);
  }
  return issues;
}

export function requiredSubmissionFieldsForEntry(entryContext = {}) {
  return entryContext.appStatus === "Existing"
    ? [...REQUIRED_OFFICIAL_FIELDS, "28253"]
    : [...REQUIRED_OFFICIAL_FIELDS];
}

export function missingOfficialFields(fields = {}, entryContext = {}) {
  return requiredSubmissionFieldsForEntry(entryContext)
    .filter((id) => fields[id] !== true);
}

export function inspectOfficialFieldChecklist(text, manifestFields = {}, entryContext = {}) {
  const matches = [...text.matchAll(/^- \[([ xX])\] \*\*(282\d+)\b/gm)];
  const byId = new Map();
  for (const match of matches) {
    const entries = byId.get(match[2]) || [];
    entries.push(match[1].toLowerCase() === "x");
    byId.set(match[2], entries);
  }
  const issues = [];
  const requiredForEntry = requiredSubmissionFieldsForEntry(entryContext);
  for (const id of requiredForEntry) {
    const entries = byId.get(id) || [];
    if (entries.length !== 1) {
      issues.push(`${id} appears ${entries.length} times`);
      continue;
    }
    if (entries[0] !== (manifestFields[id] === true)) {
      issues.push(`${id} checklist and manifest disagree`);
    }
  }
  for (const optionalId of ["28251", "28253", "28255"].filter(
    (id) => !requiredForEntry.includes(id),
  )) {
    const entries = byId.get(optionalId) || [];
    if (entries.length > 1) issues.push(`${optionalId} appears ${entries.length} times`);
  }
  return issues;
}

export function validatePublicUrlKinds(urls = {}) {
  const issues = [];
  const normalized = [];
  for (const kind of ["live", "repository", "video"]) {
    const value = String(urls[kind] || "").trim();
    if (!value) continue;
    let url;
    try {
      url = new URL(value);
    } catch {
      issues.push(`${kind} URL is invalid`);
      continue;
    }
    if (url.protocol !== "https:") issues.push(`${kind} URL must use HTTPS`);
    if (url.username || url.password) issues.push(`${kind} URL cannot contain credentials`);
    if (url.port && url.port !== "443") issues.push(`${kind} URL cannot use a nonstandard port`);
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      /^(?:127\.|10\.|192\.168\.|169\.254\.)/.test(host) ||
      /^172\.(?:1[6-9]|2\d|3[01])\./.test(host) ||
      host === "::1"
    ) {
      issues.push(`${kind} URL cannot target a private or local host`);
    }
    const expectedHosts = URL_KIND_HOSTS[kind];
    if (expectedHosts && !expectedHosts.has(host)) {
      issues.push(`${kind} URL uses an unexpected host`);
    }
    if (kind === "repository" && url.pathname.split("/").filter(Boolean).length !== 2) {
      issues.push("repository URL must identify exactly one GitHub repository");
    }
    if (kind === "video" && !youtubeVideoId(value)) {
      issues.push("video URL must identify one YouTube video");
    }
    if (kind === "live" && (
      URL_KIND_HOSTS.repository.has(host) ||
      URL_KIND_HOSTS.video.has(host)
    )) {
      issues.push("live URL cannot reuse a repository or video host");
    }
    normalized.push([kind, url.href.replace(/\/$/, "")]);
  }
  const values = normalized.map(([, value]) => value);
  if (new Set(values).size !== values.length) issues.push("public URLs must be distinct");
  return issues;
}

export function canProbePublicUrl(urls = {}, kind) {
  return validatePublicUrlKinds({ [kind]: urls[kind] }).length === 0;
}

export function isMeaningfulEvidenceRef(value) {
  const normalized = String(value || "").trim();
  if (normalized.length < 8 ||
    /^(?:todo|tbd|pending|none|n\/a|done|complete|completed|coming soon|will add later)$/i.test(normalized) ||
    /example\.(?:com|org|net)/i.test(normalized)) return false;
  try {
    const url = new URL(normalized);
    return url.protocol === "https:" &&
      !url.username && !url.password &&
      !/^(?:localhost|127\.|10\.|192\.168\.)/i.test(url.hostname);
  } catch {
    return /^(?:docs|receipts|evidence|artifacts)\/[A-Za-z0-9._/-]+\.(?:json|md|txt|png|jpe?g|webm|mp4)$/i.test(normalized);
  }
}

export function findPositiveNumericPerformanceClaims(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => (
      /\b\d+(?:\.\d+)?\s*(?:%|percent\b|x\b)/i.test(line) &&
      /\b(?:faster|slower|fewer|less|improv(?:e|ed|ement)|reduc(?:e|ed|tion)|sav(?:e|ed|ing)|throughput|latency|response time)\b/i.test(line)
    ) || /\b\d+(?:\.\d+)?\s*(?:ms|req(?:uests)?\/s)\b.*\b(?:latency|throughput|response time)\b/i.test(line))
    .filter((line) => !/\b(?:no claim|do not claim|must not|until|unproven|not yet proven)\b/i.test(line));
}

export function isAnnotatedTagAtHead({ exists, type, tagCommit, head }) {
  return exists === true && type === "tag" && Boolean(head) && tagCommit === head;
}

export function isAuthenticationPath(pathname) {
  return /\/(?:login|sign-?in|auth|oauth|consent)(?:\/|$)/i.test(String(pathname || ""));
}

export function worktreeStatusUnchanged(before, after) {
  return before?.status === 0 &&
    after?.status === 0 &&
    String(before.stdout || "") === String(after.stdout || "");
}

export function arePostCandidateChangesMetadataOnly(files = []) {
  const allowed = new Set([
    "submission-manifest.json",
    "devpost-submission.md",
    "docs/CHALLENGE_EXTENSION.md",
    "docs/DEMO_SCRIPT_EN.md",
    "docs/OWNER_RELEASE_GATE.md",
    "docs/RELEASE_ROUNDTABLE.md",
  ]);
  return files.every((file) => allowed.has(file));
}

export function verifyBuildArtifactCopies({
  hostingSource,
  hostingBuilt,
  workerSource,
  workerBuilt,
  indexHtml,
  jsBundles = [],
  expectedRevision,
}) {
  return Buffer.isBuffer(hostingSource) && Buffer.isBuffer(hostingBuilt) &&
    Buffer.isBuffer(workerSource) && Buffer.isBuffer(workerBuilt) &&
    hostingSource.equals(hostingBuilt) && workerSource.equals(workerBuilt) &&
    String(indexHtml || "").includes("VERROCCHIO") &&
    String(indexHtml || "").includes(
      `<meta name="verrocchio-revision" content="${expectedRevision}"`,
    ) &&
    jsBundles.some((bundle) => String(bundle).includes("人間の確認待ち"));
}

export function inspectRequiredManifestKeys(rawManifest, manifest) {
  const issues = [];
  const groups = [
    ["evidenceRefs", REQUIRED_EVIDENCE_REFS],
    ["ownerAttestations", REQUIRED_OWNER_ATTESTATIONS],
  ];
  for (const [group, keys] of groups) {
    if (!manifest[group] || typeof manifest[group] !== "object" || Array.isArray(manifest[group])) {
      issues.push(`${group} must be an object`);
      continue;
    }
    for (const key of keys) {
      if (!Object.hasOwn(manifest[group], key)) issues.push(`${group}.${key} is missing`);
      const occurrences = [...rawManifest.matchAll(new RegExp(`"${key}"\\s*:`, "g"))].length;
      if (occurrences !== 1) issues.push(`${group}.${key} appears ${occurrences} times in JSON`);
    }
  }
  return issues;
}

export function summarizeSubmissionChecks(checks) {
  const counts = checks.reduce(
    (result, check) => ({
      ...result,
      [check.status]: (result[check.status] || 0) + 1,
    }),
    { PASS: 0, FAIL: 0, MISSING: 0, OWNER: 0 },
  );
  const verdict = checks.some((check) => check.status === "FAIL")
    ? "FAIL"
    : checks.every((check) => check.status === "PASS")
      ? "PASS"
      : "INCOMPLETE";
  const order = { FAIL: 0, MISSING: 1, OWNER: 2, PASS: 3 };
  const blockers = checks
    .filter((check) => check.status !== "PASS")
    .sort((left, right) => (
      (left.priority ?? 100) - (right.priority ?? 100) ||
      order[left.status] - order[right.status]
    ))
    .map(({ id, status, actor = "AGENT", action, evidence, source, ownerOnly = false }) => ({
      id,
      status,
      actor,
      action: action || evidence,
      source,
      ownerOnly,
    }));
  const nextActions = blockers.slice(0, 7);
  const nextAction = nextActions[0] || null;
  const readyToSubmit = verdict === "PASS";
  const headlineJa = readyToSubmit
    ? "提出前検査に合格しました。最終FIRMAの後にOwnerが提出します。"
    : nextAction?.action || "提出条件が未完了です。";
  return {
    verdict,
    readyToSubmit,
    headlineJa,
    counts,
    nextAction,
    nextActions,
    blockers,
    checks,
  };
}
