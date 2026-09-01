import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  arePostCandidateChangesMetadataOnly,
  canProbePublicUrl,
  countDraftPlaceholders,
  findPositiveNumericPerformanceClaims,
  inspectDraftSections,
  inspectEventContract,
  inspectOfficialFieldChecklist,
  inspectRequiredManifestKeys,
  isAnnotatedTagAtHead,
  isAuthenticationPath,
  isMeaningfulEvidenceRef,
  missingDraftHeadings,
  missingOfficialFields,
  readResponseTextLimited,
  MINIMUM_SUBMISSION_TEST_COUNT,
  REQUIRED_EVIDENCE_REFS,
  REQUIRED_OWNER_ATTESTATIONS,
  summarizeSubmissionChecks,
  fetchPublicUrlSafely,
  validatePublicUrlKinds,
  verifyBuildArtifactCopies,
  worktreeStatusUnchanged,
} from "./lib/submission-readiness.mjs";
import { evaluateWebMcpReceipt } from "./lib/webmcp-eval.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawManifest = await readFile(resolve(root, "submission-manifest.json"), "utf8");
const manifest = JSON.parse(rawManifest);
const draft = await readFile(resolve(root, "devpost-submission.md"), "utf8");
const challenge = await readFile(resolve(root, "docs/CHALLENGE_EXTENSION.md"), "utf8");
const demoScript = await readFile(resolve(root, "docs/DEMO_SCRIPT_EN.md"), "utf8");
const readme = await readFile(resolve(root, "README.md"), "utf8");
const license = await readFile(resolve(root, "LICENSE"), "utf8");

const checks = [];
const add = (id, status, evidence, details = {}) => checks.push({
  id,
  status,
  evidence,
  ...details,
});
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
const sectionIssues = inspectDraftSections(draft);
add(
  "draft-sections",
  headingGaps.length || sectionIssues.length ? "FAIL" : "PASS",
  headingGaps.length || sectionIssues.length
    ? [...headingGaps.map((heading) => `Missing ${heading}`), ...sectionIssues].join("; ")
    : "Required English draft sections present",
  { priority: 31, action: "AIが英語提出原稿の不足・重複・空洞節を修正して再検査する。", source: "devpost-submission.md" },
);

const placeholderCount = countDraftPlaceholders(`${draft}\n${challenge}`);
add(
  "publication-placeholders",
  placeholderCount ? "MISSING" : "PASS",
  placeholderCount
    ? `${placeholderCount} unresolved publication markers`
    : "No publication markers remain",
  { priority: 30, action: "AIが公開情報の確定後に提出原稿のプレースホルダーを解消する。", source: "devpost-submission.md / docs/CHALLENGE_EXTENSION.md" },
);

const positiveNumericClaims = findPositiveNumericPerformanceClaims(
  `${draft}\n${challenge}\n${demoScript}\n${readme}`,
);
const hostedEvaluationRef = manifest.evidenceRefs?.hostedEvaluation;
add(
  "numeric-performance-claims",
  positiveNumericClaims.length && !isMeaningfulEvidenceRef(hostedEvaluationRef) ? "FAIL" : "PASS",
  positiveNumericClaims.length
    ? `${positiveNumericClaims.length} positive numeric performance claim(s); hosted evaluation reference ${isMeaningfulEvidenceRef(hostedEvaluationRef) ? "present" : "missing"}`
    : "No positive numeric performance claims detected in the public packet",
  { priority: 29, action: "数値性能主張を削除するか、同じ凍結revisionの検証済みhosted evaluationを付ける。", source: "public submission packet / submission-manifest.json" },
);

const entryContextValid = ["New", "Existing"].includes(manifest.entryContext?.appStatus);
add(
  "entry-context",
  entryContextValid ? "PASS" : "FAIL",
  entryContextValid ? `App Status=${manifest.entryContext.appStatus}` : "entryContext.appStatus must be New or Existing",
  { priority: 11, actor: "OWNER", ownerOnly: true, action: "Ownerが提出対象をNewまたはExistingとして確定する。", source: "submission-manifest.json / Devpost field 28252" },
);
const fieldGaps = missingOfficialFields(manifest.officialFields, manifest.entryContext);
const fieldChecklistIssues = inspectOfficialFieldChecklist(
  draft,
  manifest.officialFields,
  manifest.entryContext,
);
add(
  "official-required-fields",
  fieldChecklistIssues.length ? "FAIL" : fieldGaps.length ? "OWNER" : "PASS",
  fieldChecklistIssues.length
    ? fieldChecklistIssues.join("; ")
    : fieldGaps.length
      ? `Owner confirmation missing: ${fieldGaps.join(", ")}`
    : "All official required and entry-conditional field booleans confirmed",
  { priority: 12, actor: "OWNER", ownerOnly: true, action: "Ownerが未確定のDevpost必須欄を本人入力し、公開後にURLと実測回答を照合する。AIは居住国や自己評価を推測しない。", source: "Devpost / submission-manifest.json" },
);

const manifestKeyIssues = inspectRequiredManifestKeys(rawManifest, manifest);
add(
  "manifest-required-keys",
  manifestKeyIssues.length ? "FAIL" : "PASS",
  manifestKeyIssues.length ? manifestKeyIssues.join("; ") : "Required evidence and Owner attestation keys are present exactly once",
  { priority: 22, action: "AIがsubmission manifestの必須キーを復元し、重複を除く。", source: "submission-manifest.json" },
);

const eventContractIssues = inspectEventContract(manifest);
add(
  "official-event-contract",
  eventContractIssues.length ? "FAIL" : "PASS",
  eventContractIssues.length
    ? eventContractIssues.join("; ")
    : `${manifest.eventSlug} · ${manifest.eventUrl} · ${manifest.deadlineUtc}`,
  { priority: 10, action: "AIが公式イベント名・slug・URL・UTC締切をcanonical contractへ戻す。", source: "submission-manifest.json / official Devpost MCP" },
);

const urlKindIssues = validatePublicUrlKinds(manifest.urls);
add(
  "public-url-roles",
  urlKindIssues.length ? "FAIL" : "PASS",
  urlKindIssues.length ? urlKindIssues.join("; ") : "Configured public URLs have distinct roles and expected hosts",
  { priority: 41, action: "AIとOwnerがlive・GitHub repository・YouTube videoのURLを別々に正しく設定する。", source: "submission-manifest.json" },
);

const configuredUrls = Object.entries(manifest.urls || {}).filter(([, value]) => String(value || "").trim());
const draftUrlGaps = configuredUrls.filter(([, value]) => !draft.includes(String(value).replace(/\/$/, "")));
add(
  "draft-public-url-match",
  draftUrlGaps.length ? "MISSING" : "PASS",
  draftUrlGaps.length
    ? `Configured URLs absent from draft: ${draftUrlGaps.map(([kind]) => kind).join(", ")}`
    : "Configured public URLs are present in the submission draft",
  { priority: 42, action: "公開確認済みURLを英語提出原稿の対応欄へ転記する。", source: "submission-manifest.json / devpost-submission.md" },
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
const productCandidateResult = manifest.productCandidate
  ? git("rev-parse", `${manifest.productCandidate}^{commit}`)
  : null;
const productCandidate = productCandidateResult?.status === 0
  ? productCandidateResult.stdout.trim()
  : "";
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

for (const [id, older, newer] of [
  ["start-before-candidate", manifest.challengeStart, manifest.productCandidate],
  ["candidate-before-head", manifest.productCandidate, head],
]) {
  const ordered = older && newer && git("merge-base", "--is-ancestor", older, newer);
  add(
    id,
    ordered?.status === 0 ? "PASS" : "FAIL",
    ordered?.status === 0 ? `${older} precedes ${newer}` : `Invalid revision order: ${older || "unset"} -> ${newer || "unset"}`,
    { priority: 24, action: "AIがchallenge start・product candidate・HEADの境界を正す。", source: "git / submission-manifest.json" },
  );
}

if (manifest.productCandidate) {
  const postCandidate = git("diff", "--name-only", `${manifest.productCandidate}..HEAD`);
  const changed = postCandidate.status === 0 ? postCandidate.stdout.split("\n").filter(Boolean) : [];
  const implementationChanges = arePostCandidateChangesMetadataOnly(changed)
    ? []
    : changed.filter((file) => !arePostCandidateChangesMetadataOnly([file]));
  add(
    "post-candidate-implementation",
    postCandidate.status === 0 && implementationChanges.length === 0 ? "PASS" : "FAIL",
    postCandidate.status !== 0
      ? "Could not inspect product candidate range"
      : implementationChanges.length
        ? `Implementation changed after candidate: ${implementationChanges.join(", ")}`
        : `${changed.length} metadata-only file(s) changed after candidate`,
    { priority: 23, action: "実装変更を含む最新の検証済みcommitをproductCandidateへ更新する。", source: "git / submission-manifest.json" },
  );
}

if (manifest.challengeBaseline && manifest.challengeStart && manifest.productCandidate) {
  const commitCountResult = git("rev-list", "--count", `${manifest.challengeStart}^..${manifest.productCandidate}`);
  const shortStatResult = git("diff", "--shortstat", `${manifest.challengeBaseline}..${manifest.productCandidate}`);
  const commitCount = Number(commitCountResult.stdout.trim());
  const statMatch = shortStatResult.stdout.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
  const expected = statMatch ? {
    files: Number(statMatch[1]),
    insertions: Number(statMatch[2] || 0),
    deletions: Number(statMatch[3] || 0),
  } : null;
  const challengeMatches = commitCountResult.status === 0 && expected &&
    challenge.includes(`\`${manifest.productCandidate}\``) &&
    challenge.includes(`contains ${commitCount} commits`) &&
    challenge.includes(`changes ${expected.files} files`) &&
    challenge.includes(`${expected.insertions.toLocaleString("en-US")} insertions`) &&
    challenge.includes(`${expected.deletions.toLocaleString("en-US")} deletions`);
  add(
    "challenge-evidence-stats",
    challengeMatches ? "PASS" : "FAIL",
    challengeMatches ? `${commitCount} commits; ${expected.files} files; +${expected.insertions}/-${expected.deletions}` : "Challenge document does not match git candidate/count/diff stats",
    { priority: 25, action: "AIがchallenge extensionのcommit範囲と差分統計をgit実測値に合わせる。", source: "git / docs/CHALLENGE_EXTENSION.md" },
  );
}

const tag = String(manifest.submissionTag || "").trim();
const tagRef = tag ? `refs/tags/${tag}` : "";
const tagExists = tag ? git("show-ref", "--verify", "--quiet", tagRef).status === 0 : false;
const tagType = tagExists ? git("cat-file", "-t", tagRef) : null;
const tagHead = tagExists ? git("rev-parse", `${tagRef}^{commit}`) : null;
const annotatedTagAtHead = isAnnotatedTagAtHead({
  exists: tagExists,
  type: tagType?.stdout.trim(),
  tagCommit: tagHead?.status === 0 ? tagHead.stdout.trim() : "",
  head,
});
add(
  "freeze-tag",
  annotatedTagAtHead ? "PASS" : tag ? "FAIL" : "MISSING",
  annotatedTagAtHead
    ? `Annotated tag ${tag} resolves to current HEAD ${head}`
    : tag
      ? `Configured tag ${tag} must be an annotated refs/tags ref at current HEAD ${head || "unknown"}`
    : "Submission tag is unset",
  { priority: 35, actor: "OWNER", ownerOnly: true, action: "全ローカル検証後、Owner承認を得てHEADにannotated final tagを作る。", source: "git / submission-manifest.json" },
);

const headTimeResult = git("show", "-s", "--format=%cI", "HEAD");
const headTime = headTimeResult.status === 0 ? Date.parse(headTimeResult.stdout.trim()) : Number.NaN;
const deadlineTime = Date.parse(manifest.deadlineUtc || "");
const headBeforeDeadline = Number.isFinite(headTime) && Number.isFinite(deadlineTime) && headTime <= deadlineTime;
add(
  "submission-revision-before-deadline",
  headBeforeDeadline ? "PASS" : "FAIL",
  headBeforeDeadline
    ? `HEAD committed at ${headTimeResult.stdout.trim()} before ${manifest.deadlineUtc}`
    : "HEAD commit time is missing, invalid, or after the official deadline",
  { priority: 36, action: "締切後のrevisionを提出物に使わず、締切前の凍結tagへ戻す。", source: "git / submission-manifest.json" },
);

const tests = run("npm", ["test", "--", "--run"]);
const testOutput = `${tests.stdout || ""}\n${tests.stderr || ""}`;
const testCount = Number(testOutput.match(/Tests\s+(\d+)\s+passed/)?.[1] || 0);
add(
  "automated-tests",
  tests.status === 0 &&
    testCount === manifest.expectedTestCount &&
    testCount >= MINIMUM_SUBMISSION_TEST_COUNT
    ? "PASS"
    : "FAIL",
  tests.status === 0
    ? `${testCount} passed; manifest expects ${manifest.expectedTestCount}; minimum floor ${MINIMUM_SUBMISSION_TEST_COUNT}`
    : "Automated tests failed",
  { priority: 25, action: "AIが92件以上の回帰suiteを復元し、manifestと実測値を一致させる。", source: "test runner / submission-manifest.json" },
);

const build = run("npm", ["run", "build"]);
add(
  "production-build",
  build.status === 0 ? "PASS" : "FAIL",
  build.status === 0 ? "Production build completed" : "Production build failed",
);

let artifactEvidence = "Build did not complete";
let artifactsMatch = false;
if (build.status === 0) {
  try {
    const [hostingSource, hostingBuilt, workerSource, workerBuilt, indexHtml] = await Promise.all([
      readFile(resolve(root, ".openai/hosting.json")),
      readFile(resolve(root, "dist/.openai/hosting.json")),
      readFile(resolve(root, "worker/index.js")),
      readFile(resolve(root, "dist/server/index.js")),
      readFile(resolve(root, "dist/client/index.html"), "utf8"),
    ]);
    const assets = await readdir(resolve(root, "dist/client/assets"));
    const jsBundles = await Promise.all(
      assets.filter((name) => name.endsWith(".js")).map((name) => readFile(resolve(root, "dist/client/assets", name), "utf8")),
    );
    artifactsMatch = verifyBuildArtifactCopies({
      hostingSource,
      hostingBuilt,
      workerSource,
      workerBuilt,
      indexHtml,
      jsBundles,
      expectedRevision: head,
    });
    artifactEvidence = artifactsMatch
      ? "Hosting config and worker copies match source; current UI marker exists in client bundle"
      : "Built artifacts do not match source copies or current UI marker";
  } catch (error) {
    artifactEvidence = `Built artifact inspection failed: ${error.message}`;
  }
}
add(
  "build-artifact-consistency",
  artifactsMatch ? "PASS" : "FAIL",
  artifactEvidence,
  { priority: 26, action: "AIがproduction buildを再生成し、配布物とsourceの一致を確認する。", source: "dist / worker / .openai" },
);

const postBuildDirty = git("status", "--porcelain=v1");
const buildKeptWorktreeStable = worktreeStatusUnchanged(dirty, postBuildDirty);
add(
  "post-build-clean-worktree",
  buildKeptWorktreeStable ? "PASS" : "FAIL",
  buildKeptWorktreeStable
    ? dirty.stdout.trim()
      ? "Tests and production build added no changes; pre-existing worktree changes remain and are reported separately"
      : "Tests and production build did not modify tracked or untracked files"
    : "Tests or production build changed the worktree",
  { priority: 27, action: "AIがtest/buildによる生成差分を確認し、sourceを変更しない再現可能な手順に直す。", source: "git" },
);

const trackedRiskNames = git("ls-files");
const riskyFiles = trackedRiskNames.status === 0
  ? trackedRiskNames.stdout
      .split("\n")
      .filter(Boolean)
      .filter((file) =>
        /(^|\/)(\.env($|\.)|.*(secret|token|credential|private[-_]?key).*)/i.test(file),
      )
  : ["could-not-list-tracked-files"];
add(
  "secret-bearing-filenames",
  riskyFiles.length ? "FAIL" : "PASS",
  riskyFiles.length
    ? `Review tracked filenames: ${riskyFiles.join(", ")}`
    : "No tracked secret-bearing filenames",
);

async function checkPublicUrl(id, kind, value, priority, canProbe) {
  if (!value) {
    add(id, "MISSING", "URL is unset", { priority, actor: "OWNER", action: "Ownerが公開先を作成し、AIが未認証アクセスを検証する。", source: "submission-manifest.json" });
    return { accessible: false, body: "", finalUrl: null };
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    add(id, "FAIL", "URL is invalid");
    return { accessible: false, body: "", finalUrl: null };
  }
  if (url.protocol !== "https:") {
    add(id, "FAIL", "Public URL must use HTTPS");
    return { accessible: false, body: "", finalUrl: null };
  }
  if (!canProbe) {
    add(id, "FAIL", "Network probe skipped because public URL validation failed", {
      priority,
      action: "URLの役割と公開先を修正してから再検査する。",
      source: value,
    });
    return { accessible: false, body: "", finalUrl: null };
  }
  try {
    const { response, body, finalUrl } = await fetchPublicUrlSafely(url, {
      kind,
      signal: AbortSignal.timeout(15_000),
    });
    const loginWall = /<(?:title|h1)[^>]*>\s*(?:sign in|log in|unauthorized|authentication required)/i.test(body);
    const authenticationPath = isAuthenticationPath(finalUrl.pathname);
    const accessible = response.ok && !loginWall && !authenticationPath;
    add(
      id,
      accessible ? "PASS" : "FAIL",
      `Unauthenticated GET returned ${response.status}${loginWall ? " and a login wall" : ""}${finalUrl.href !== url.href ? ` and safely redirected to ${finalUrl.hostname}` : ""}${authenticationPath ? ` and ended at authentication path ${finalUrl.pathname}` : ""}`,
      { priority, actor: "OWNER", action: "Ownerが対象を公開し、AIがログインなしのjudgeアクセスを再検査する。", source: value },
    );
    return { accessible, body, finalUrl };
  } catch (error) {
    add(id, "FAIL", `Unauthenticated GET failed: ${error.message}`, { priority, action: "通信状態と公開設定を確認して再検査する。", source: value });
    return { accessible: false, body: "", finalUrl: null };
  }
}

const liveProbe = await checkPublicUrl("public-live-url", "live", manifest.urls?.live, 40, canProbePublicUrl(manifest.urls, "live"));
const repositoryProbe = await checkPublicUrl("public-repository-url", "repository", manifest.urls?.repository, 41, canProbePublicUrl(manifest.urls, "repository"));
const videoProbe = await checkPublicUrl("public-video-url", "video", manifest.urls?.video, 50, canProbePublicUrl(manifest.urls, "video"));

const liveRevisionMarker = `<meta name="verrocchio-revision" content="${head}"`;
const liveRevisionMatches = liveProbe.accessible && liveProbe.body.includes(liveRevisionMarker);
add(
  "public-live-revision",
  liveRevisionMatches ? "PASS" : liveProbe.accessible ? "FAIL" : "MISSING",
  liveRevisionMatches
    ? `Live HTML identifies frozen revision ${head}`
    : liveProbe.accessible
      ? `Live HTML does not identify current revision ${head}`
      : "Live revision cannot be checked until the site is public",
  { priority: 44, actor: "OWNER", action: "同じ凍結revisionを公開し、HTMLのrevision markerを未認証GETで照合する。", source: manifest.urls?.live },
);

let publicVideoResolved = false;
if (videoProbe.accessible && manifest.urls?.video) {
  try {
    const oembed = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(manifest.urls.video)}&format=json`, {
      redirect: "error",
      headers: { "User-Agent": "VERROCCHIO-submission-preflight" },
      signal: AbortSignal.timeout(15_000),
    });
    if (oembed.ok) await readResponseTextLimited(oembed);
    publicVideoResolved = oembed.ok;
  } catch {
    publicVideoResolved = false;
  }
}
add(
  "public-youtube-video",
  publicVideoResolved ? "PASS" : videoProbe.accessible ? "FAIL" : "MISSING",
  publicVideoResolved ? "YouTube oEmbed resolved one public video" : "A public, resolvable YouTube video is not yet verified",
  { priority: 52, actor: "OWNER", action: "Ownerが3分未満・音声付きの動画を公開し、AIが実動画IDとoEmbedを確認する。", source: manifest.urls?.video },
);

let repositoryArtifactsOk = false;
let repositoryArtifactEvidence = repositoryProbe.accessible ? "Repository metadata probe not completed" : "Repository URL is not publicly accessible";
if (repositoryProbe.accessible) {
  try {
    const repositoryUrl = new URL(manifest.urls.repository);
    const [owner, repository] = repositoryUrl.pathname.split("/").filter(Boolean);
    const metadataResponse = await fetch(`https://api.github.com/repos/${owner}/${repository}`, {
      redirect: "error",
      headers: { Accept: "application/vnd.github+json", "User-Agent": "VERROCCHIO-submission-preflight" },
    });
    const metadata = metadataResponse.ok ? JSON.parse(await readResponseTextLimited(metadataResponse)) : null;
    if (metadata && metadata.private === false && metadata.default_branch && tag) {
      const apiHeaders = { Accept: "application/vnd.github+json", "User-Agent": "VERROCCHIO-submission-preflight" };
      const [branchResponse, tagRefResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repository}/commits/${encodeURIComponent(metadata.default_branch)}`, { redirect: "error", headers: apiHeaders }),
        fetch(`https://api.github.com/repos/${owner}/${repository}/git/ref/tags/${encodeURIComponent(tag)}`, { redirect: "error", headers: apiHeaders }),
      ]);
      const branchCommit = branchResponse.ok ? JSON.parse(await readResponseTextLimited(branchResponse)) : null;
      const tagRef = tagRefResponse.ok ? JSON.parse(await readResponseTextLimited(tagRefResponse)) : null;
      let peeledTagCommit = "";
      if (tagRef?.object?.type === "tag" && tagRef.object.sha) {
        const tagObjectResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repository}/git/tags/${tagRef.object.sha}`,
          { redirect: "error", headers: apiHeaders },
        );
        const tagObject = tagObjectResponse.ok ? JSON.parse(await readResponseTextLimited(tagObjectResponse)) : null;
        if (tagObject?.object?.type === "commit") peeledTagCommit = tagObject.object.sha;
      }
      const remoteRevisionAligned = Boolean(head) &&
        branchCommit?.sha === head &&
        peeledTagCommit === head;
      const artifactFiles = ["README.md", "LICENSE", "package.json", "package-lock.json", "src/webmcp.js"];
      const artifacts = await Promise.all(artifactFiles.map(async (file) => {
        const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repository}/${encodeURIComponent(tag)}/${file}`, { redirect: "error" });
        return { file, status: response.status, body: response.ok ? await readResponseTextLimited(response) : "" };
      }));
      const licenseBody = artifacts.find(({ file }) => file === "LICENSE")?.body || "";
      const licenseMatches = metadata.license?.spdx_id === "MIT" && licenseBody === license;
      const webmcpSource = artifacts.find(({ file }) => file === "src/webmcp.js")?.body || "";
      const registerToolPresent = /\.registerTool\s*\(/.test(webmcpSource);
      repositoryArtifactsOk = artifacts.every(({ status }) => status === 200) &&
        licenseMatches && registerToolPresent && remoteRevisionAligned;
      repositoryArtifactEvidence = `GitHub public=${!metadata.private}; branch=${metadata.default_branch}@${branchCommit?.sha || "missing"}; tag=${tag}@${peeledTagCommit || "missing-or-not-annotated"}; local=${head}; license=${metadata.license?.spdx_id || "undetected"}/${licenseMatches ? "match" : "mismatch"}; artifacts=${artifacts.map(({ file, status }) => `${file}:${status}`).join(",")}; registerTool=${registerToolPresent}`;
    } else {
      repositoryArtifactEvidence = `GitHub API returned ${metadataResponse.status}, repository is private, or submission tag is unset`;
    }
  } catch (error) {
    repositoryArtifactEvidence = `Repository artifact probe failed: ${error.message}`;
  }
}
add(
  "public-repository-artifacts",
  repositoryArtifactsOk ? "PASS" : "FAIL",
  repositoryArtifactEvidence,
  { priority: 43, actor: "OWNER", action: "公開GitHubでannotated tag・default branch・ローカルHEADを同じSHAにし、そのtag上のMIT LICENSEと全必須fileを検証する。", source: manifest.urls?.repository },
);

let hostedEvaluation = {
  status: "MISSING",
  evidence: "Hosted WebMCP evaluation receipt is unset",
};
const hostedEvaluationRefValue = manifest.evidenceRefs?.hostedEvaluation;
if (String(hostedEvaluationRefValue || "").trim()) {
  try {
    const candidatePath = resolve(root, hostedEvaluationRefValue);
    const [realRoot, realCandidate, candidateStat] = await Promise.all([
      realpath(root),
      realpath(candidatePath),
      lstat(candidatePath),
    ]);
    const withinRoot = (() => {
      const rel = relative(realRoot, realCandidate);
      return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
    })();
    if (!withinRoot || candidateStat.isSymbolicLink() || !candidateStat.isFile()) {
      throw new Error("receipt must be a non-symlink regular file beneath the repository root");
    }
    const receipt = JSON.parse(await readFile(realCandidate, "utf8"));
    const summary = evaluateWebMcpReceipt(receipt);
    const expectedOrigin = new URL(manifest.urls.live).origin;
    const revisionMatches = Boolean(productCandidate) &&
      receipt.sourceRevision === productCandidate;
    const originMatches = receipt.origin === expectedOrigin;
    const pass = summary.verdict === "PASS" &&
      summary.safety?.violations?.length === 0 &&
      revisionMatches &&
      originMatches;
    hostedEvaluation = {
      status: pass ? "PASS" : "FAIL",
      evidence: `verdict=${summary.verdict}; violations=${summary.safety?.violations?.length ?? "unknown"}; revision=${revisionMatches ? "match" : "mismatch"}; origin=${originMatches ? "match" : "mismatch"}; receipt=${hostedEvaluationRefValue}`,
    };
  } catch (error) {
    hostedEvaluation = {
      status: "FAIL",
      evidence: `Hosted evaluation receipt rejected: ${error.message}`,
    };
  }
}
add(
  "evidence-hostedEvaluation",
  hostedEvaluation.status,
  hostedEvaluation.evidence,
  { priority: 44, actor: "OWNER", action: "現在の凍結revisionを配信した実サイトでWebMCP評価を実行し、PASS控えをevals/へ保存する。", source: "submission-manifest.json / hosted evaluation receipt" },
);

for (const id of REQUIRED_EVIDENCE_REFS.filter((item) => item !== "hostedEvaluation")) {
  const value = manifest.evidenceRefs?.[id];
  const required = REQUIRED_EVIDENCE_REFS.includes(id);
  const meaningful = isMeaningfulEvidenceRef(value);
  add(
    `evidence-${id}`,
    meaningful ? "PASS" : required && !String(value || "").trim() ? "MISSING" : "FAIL",
    meaningful ? value : (
      "Evidence reference is unset or not meaningful"
    ),
    { priority: id === "cleanJudgeSmoke" ? 45 : 51, actor: "OWNER", action: id === "cleanJudgeSmoke" ? "OwnerとAIがclean judge smokeを実行し、凍結revisionに結び付く参照を記録する。" : "Ownerが同じ凍結buildの公開デモ動画参照を記録する。", source: "submission-manifest.json" },
  );
}

const ownerPriorities = { registered: 1, rulesAndTermsAccepted: 2, secretsReviewedOffScreen: 20 };
for (const id of REQUIRED_OWNER_ATTESTATIONS) {
  const confirmed = manifest.ownerAttestations?.[id];
  add(
    `owner-${id}`,
    confirmed === true ? "PASS" : "OWNER",
    confirmed === true ? "Owner confirmed" : "Owner confirmation required",
    { priority: ownerPriorities[id] ?? 60, actor: "OWNER", ownerOnly: true, action: id === "registered" ? "提出不可。まずOwnerがDevpostの参加登録を完了する。AIは代行しない。" : id === "rulesAndTermsAccepted" ? "Ownerが適格性を確認し、公式rulesとDevpost termsを読んで同意する。" : `Ownerが${id}を本人確認する。`, source: "submission-manifest.json" },
  );
}


const ownerContradictions = [];
if (manifest.ownerAttestations?.registered === true && /not yet registered/i.test(draft)) {
  ownerContradictions.push("registered=true conflicts with draft text");
}
if (manifest.ownerAttestations?.finalEntryReadBack === true && /No Devpost submission has been sent|Nothing has been submitted/i.test(draft)) {
  ownerContradictions.push("finalEntryReadBack=true conflicts with draft text");
}
add(
  "owner-attestation-consistency",
  ownerContradictions.length ? "FAIL" : "PASS",
  ownerContradictions.length ? ownerContradictions.join("; ") : "Owner attestations do not contradict submission prose",
  { priority: 13, actor: "OWNER", ownerOnly: true, action: "Owner確認の実状態と提出原稿を一致させる。", source: "submission-manifest.json / devpost-submission.md" },
);

const summary = {
  schema: "verrocchio.submission-preflight.v1",
  generatedAt: new Date().toISOString(),
  head,
  ...summarizeSubmissionChecks(checks),
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
process.exitCode = summary.verdict === "PASS" ? 0 : summary.verdict === "FAIL" ? 1 : 2;
