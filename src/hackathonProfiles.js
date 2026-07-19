const oneWeekFromNow = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const blankHackathonProfile = {
  profileId: "blank",
  name: "New hackathon",
  brief:
    "Turn the official rules into a verified, judge-ready submission before the deadline.",
  rules:
    "Paste the official eligibility rules, required deliverables, submission fields, and disallowed work here.",
  judgingCriteria:
    "Paste the official judging criteria and weights here.",
  deadline: oneWeekFromNow(),
  track: "Unselected",
  constraints:
    "Record team size, time, budget, data, platform, and publishing constraints here.",
  availableAI:
    "Codex for implementation; CAPOBOTTEGA for planning; optional Claude and Gemini review.",
  candidateIdeas:
    "List candidate submission ideas, or explicitly defer selection until the mission profile is complete.",
  humanBoundary:
    "The human owns WHY, NO, taste, scope changes, payment, publishing, personal data, and final submission. The workshop owns HOW.",
};

export const openAIBuildWeekExample = {
  profileId: "openai-build-week-example",
  name: "OpenAI Build Week · example profile",
  brief:
    "Build and submit a working project while preserving a verified trail from rules to final submission.",
  rules:
    "Example only: replace this text with the current official rules, eligibility, required deliverables, repository access, demo, and submission requirements.",
  judgingCriteria:
    "Example only: replace with the current official criteria and weights.",
  deadline: oneWeekFromNow(),
  track: "Developer Tools",
  constraints:
    "Verify all current requirements from official sources. External publication and final submission require FIRMA.",
  availableAI:
    "Codex; OpenAI planning runtime; optional Claude Fable and Gemini review roles.",
  candidateIdeas:
    "Evaluate ideas only after the current rules and judging criteria have been captured.",
  humanBoundary:
    "The human owns WHY, NO, taste, scope changes, payment, publishing, personal data, and final submission. The workshop owns HOW.",
};

export const hackathonProfiles = {
  blank: blankHackathonProfile,
  "openai-build-week-example": openAIBuildWeekExample,
};

export function createHackathonProfile(profileId = "blank") {
  const profile = hackathonProfiles[profileId] || blankHackathonProfile;
  return { ...profile, deadline: profile.deadline || oneWeekFromNow() };
}
