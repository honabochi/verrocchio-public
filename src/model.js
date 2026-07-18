export const STORAGE_KEY = "verrocchio-workshop-v1";

export const DEADLINE_ISO = "2026-07-22T09:00:00+09:00";

export const navItems = [
  { id: "contratto", label: "CONTRATTO", gloss: "contract" },
  { id: "cartone", label: "CARTONE", gloss: "plan" },
  { id: "giornate", label: "GIORNATE", gloss: "work" },
  { id: "cenacolo", label: "CENACOLO", gloss: "final poll" },
  { id: "evidence", label: "EVIDENCE", gloss: "proof" },
];

export const initialState = {
  activeView: "giornate",
  attentionMinutes: 42,
  attentionCeiling: 120,
  isRunning: false,
  isHeld: false,
  startedAt: null,
  deadline: DEADLINE_ISO,
  contract: {
    objective:
      "Ship VERROCCHIO and the application it directs as one self-proving Build Week entry.",
    track: "Developer Tools",
    irreversibleRule:
      "Publishing, payment, personal data, scope changes, and final submission require FIRMA.",
    humanRule: "The human owns WHY and NO. The workshop owns HOW.",
  },
  giornata: {
    id: "01",
    title: "Make VERROCCHIO control its own build",
    classification: "SECCO",
    classificationNote: "proceed, review later",
    wetUntil: "23:40",
  },
  gates: [
    {
      id: "working-product",
      title: "Working product",
      detail: "Live demo or test path that judges can use without rebuilding",
      done: false,
      evidence: "",
    },
    {
      id: "gpt-evidence",
      title: "GPT-5.6 evidence",
      detail: "Meaningful use, key decisions, and integration documented",
      done: false,
      evidence: "",
    },
    {
      id: "codex-evidence",
      title: "Codex session trail",
      detail: "Primary build thread and /feedback Session ID recorded",
      done: false,
      evidence: "Primary Codex task: 019f74f3-dd34-7403-b286-8f56efb37ad1",
    },
    {
      id: "repository",
      title: "Public repository",
      detail: "License, README, setup, sample data, and test instructions",
      done: false,
      evidence: "",
    },
    {
      id: "demo",
      title: "Demo under 3:00",
      detail: "Public YouTube, working demo, English audio, Codex + GPT-5.6",
      done: false,
      evidence: "",
    },
    {
      id: "submission",
      title: "Devpost submission",
      detail: "Developer Tools category, description, links, final receipt",
      done: false,
      evidence: "",
    },
  ],
  decisions: [
    {
      id: "decision-001",
      time: "2026-07-18T20:33:00+09:00",
      type: "AFFRESCO",
      title: "Freeze the VERROCCHIO name and workshop vocabulary",
      actor: "Human + Codex",
      rationale: "The metaphor compiles into reversible decision classes and UI state.",
    },
    {
      id: "decision-002",
      time: "2026-07-18T20:42:00+09:00",
      type: "SECCO",
      title: "Adopt six submission gates as MANCA",
      actor: "Codex",
      rationale: "Each gate maps directly to current official Build Week requirements.",
    },
  ],
  events: [
    {
      id: "event-001",
      time: "2026-07-18T20:19:00+09:00",
      kind: "EVIDENCE",
      message: "Primary Codex task opened for the VERROCCHIO build.",
    },
    {
      id: "event-002",
      time: "2026-07-18T20:42:00+09:00",
      kind: "CARTONE",
      message: "Official Build Week submission requirements compiled into six gates.",
    },
  ],
};

export function loadWorkshop() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
  } catch {
    return initialState;
  }
}

export function persistWorkshop(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createEvent(kind, message) {
  return {
    id: `${kind.toLowerCase()}-${crypto.randomUUID()}`,
    time: new Date().toISOString(),
    kind,
    message,
  };
}

export function remainingTime(deadline, now = new Date()) {
  const remaining = Math.max(0, new Date(deadline).getTime() - now.getTime());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

export function exportWorkshop(state) {
  return JSON.stringify(
    {
      schema: "verrocchio.workshop.v1",
      exportedAt: new Date().toISOString(),
      ...state,
      manca: state.gates.filter((gate) => !gate.done).length,
    },
    null,
    2,
  );
}
