import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  countDraftPlaceholders,
  missingDraftHeadings,
  missingOfficialFields,
  summarizeSubmissionChecks,
} from "./lib/submission-readiness.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(root, "submission-manifest.json"), "utf8"),
);
const draft = await readFile(resolve(root, "devpost-submission.md"), "utf8");
const challenge = await readFile(resolve(root, "docs/CHALLENGE_EXTENSION.md"), "utf8");
const license = await readFile(resolve(root, "LICENSE"), "utf8");

const checks = [];
const add = (id, status, evidence) => checks.push({ id, status, evidence });
const run = (command, args) => spawnSync(command, args, {
  cwd: root,
  encoding: "utf8",
  env: process.env,
});
const git = (...args) => run("git", args);

const requiredFiles = [
  "README.md",
  "LICENSE",
  "package.json",
  "package-lock.json",
  "devpost-submission.md",
  "docs/CHALLENGE_EXTENSION.md",
  "docs/DEMO_SCRIPT_EN.md",
  "submission-manifest.json",
];
const missingFiles = [];
for (const file of requiredFiles) {
  try {
    if ((await stat(resolve(root, file))).size === 0) missingFiles.push(file);
  } catch {
    missingFiles.push(file);
  }
}
add(
  "required-files",
  missingFiles.length ? "FAIL" : "PASS",
  missingFiles.length
    ? `Missing or empty: ${missingFiles.join(", ")}`
    : `${requiredFiles.length} files present`,
);

const hasMitLicense = /MIT License/.test(license);
add(
  "license",
  hasMitLicense ? "PASS" : "FAIL",
  hasMitLicense ? "Top-level MIT license present" : "Recognized top-level license missing",
);

const headingGaps = missingDraftHeadings(draft);
add(
  "draft-sections",
  headingGaps.length ? "FAIL" : "PASS",
  headingGaps.length
    ? `Missing: ${headingGaps.join(", ")}`
    : "Required English draft sections present",
);

const placeholderCount = countDraftPlaceholders(`${draft}\n${challenge}`);
add(
  "publication-placeholders",
  placeholderCount ? "MISSING" : "PASS",
  placeholderCount
    ? `${placeholderCount} unresolved publication markers`
    : "No publication markers remain",
);

const fieldGaps = missingOfficialFields(manifest.officialFields);
add(
  "official-required-fields",
  fieldGaps.length ? "OWNER" : "PASS",
  fieldGaps.length
    ? `Owner confirmation missing: ${fieldGaps.join(", ")}`
    : "All required field booleans confirmed",
);

const dirty = git("status", "--porcelain=v1");
add(
  "clean-worktree",
  dirty.status === 0 && !dirty.stdout.trim() ? "PASS" : "FAIL",
  dirty.status === 0 && !dirty.stdout.trim()
    ? "Worktree clean"
    : "Tracked or untracked changes remain",
);

const headResult = git("rev-parse", "HEAD");
const head = headResult.status === 0 ? headResult.stdout.trim() : "";
for (const [id, commit] of [
  ["challenge-baseline", manifest.challengeBaseline],
  ["challenge-start", manifest.challengeStart],
  ["product-candidate", manifest.productCandidate],
]) {
  const exists = commit && git("cat-file", "-e", `${commit}^{commit}`).status === 0;
  add(
    id,
    exists ? "PASS" : "MISSING",
    exists ? commit : "Commit is unset or missing locally",
  );
}

if (manifest.challengeBaseline && manifest.challengeStart) {
  const ordered = git(
    "merge-base",
    "--is-ancestor",
    manifest.challengeBaseline,
    manifest.challengeStart,
  );
  add(
    "challenge-order",
    ordered.status === 0 ? "PASS" : "FAIL",
    ordered.status === 0
      ? `${manifest.challengeBaseline} precedes ${manifest.challengeStart}`
      : "Challenge boundary order is invalid",
  );
}

const tag = String(manifest.submissionTag || "").trim();
const tagHead = tag ? git("rev-list", "-n", "1", tag) : null;
add(
  "freeze-tag",
  tag && tagHead?.status === 0 && tagHead.stdout.trim() === head ? "PASS" : "MISSING",
  tag
    ? `Configured tag ${tag} does not resolve to current HEAD ${head || "unknown"}`
    : "Submission tag is unset",
);

const tests = run("npm", ["test", "--", "--run"]);
const testOutput = `${tests.stdout || ""}\n${tests.stderr || ""}`;
const testCount = Number(testOutput.match(/Tests\s+(\d+)\s+passed/)?.[1] || 0);
add(
  "automated-tests",
  tests.status === 0 && testCount === manifest.expectedTestCount ? "PASS" : "FAIL",
  tests.status === 0
    ? `${testCount} passed; manifest expects ${manifest.expectedTestCount}`
    : "Automated tests failed",
);

const build = run("npm", ["run", "build"]);
add(
  "production-build",
  build.status === 0 ? "PASS" : "FAIL",
  build.status === 0 ? "Production build completed" : "Production build failed",
);

const trackedRiskNames = git("ls-files");
const riskyFiles = trackedRiskNames.status === 0
  ? trackedRiskNames.stdout
      .split("\n")
      .filter(Boolean)
      .filter((file) =>
        /(^|\/)(\.env($|\.)|.*(secret|token|credential|private[-_]?key).*)/i.test(file),
      )
      .filter((file) => file !== ".env.example")
  : ["could-not-list-tracked-files"];
add(
  "secret-bearing-filenames",
  riskyFiles.length ? "FAIL" : "PASS",
  riskyFiles.length
    ? `Review tracked filenames: ${riskyFiles.join(", ")}`
    : "No tracked secret-bearing filenames; .env.example allowed",
);

async function checkPublicUrl(id, value) {
  if (!value) {
    add(id, "MISSING", "URL is unset");
    return;
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    add(id, "FAIL", "URL is invalid");
    return;
  }
  if (url.protocol !== "https:") {
    add(id, "FAIL", "Public URL must use HTTPS");
    return;
  }
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "VERROCCHIO-submission-preflight" },
    });
    await response.body?.cancel();
    add(
      id,
      response.ok ? "PASS" : "FAIL",
      `Unauthenticated GET returned ${response.status}`,
    );
  } catch (error) {
    add(id, "FAIL", `Unauthenticated GET failed: ${error.message}`);
  }
}

await checkPublicUrl("public-live-url", manifest.urls?.live);
await checkPublicUrl("public-repository-url", manifest.urls?.repository);
await checkPublicUrl("public-video-url", manifest.urls?.video);

for (const [id, value] of Object.entries(manifest.evidenceRefs || {})) {
  const required = id !== "hostedEvaluation";
  add(
    `evidence-${id}`,
    value || !required ? "PASS" : "MISSING",
    value || (
      required
        ? "Evidence reference is unset"
        : "Optional until a numeric performance claim is made"
    ),
  );
}

for (const [id, confirmed] of Object.entries(manifest.ownerAttestations || {})) {
  add(
    `owner-${id}`,
    confirmed === true ? "PASS" : "OWNER",
    confirmed === true ? "Owner confirmed" : "Owner confirmation required",
  );
}

const summary = {
  schema: "verrocchio.submission-preflight.v1",
  generatedAt: new Date().toISOString(),
  head,
  ...summarizeSubmissionChecks(checks),
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
process.exitCode = summary.verdict === "PASS" ? 0 : summary.verdict === "FAIL" ? 1 : 2;
