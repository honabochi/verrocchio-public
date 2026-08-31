const SOURCE_REVISION_PATTERN = /^[a-f0-9]{40}$/i;
const EVAL_PART_PATTERN = /^[a-zA-Z0-9_-]{1,48}$/;

const injectedRevision =
  typeof __VERROCCHIO_SOURCE_REVISION__ === "string"
    ? __VERROCCHIO_SOURCE_REVISION__
    : "";

export const SOURCE_REVISION = SOURCE_REVISION_PATTERN.test(injectedRevision)
  ? injectedRevision
  : "";

export function parseEvalPart(value) {
  const candidate = String(value || "");
  return EVAL_PART_PATTERN.test(candidate) ? candidate : "";
}
