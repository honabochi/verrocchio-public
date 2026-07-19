import { useEffect, useMemo, useState } from "react";
import {
  adoptWorkshopPlan,
  buildWorkPacket,
  createEvent,
  exportWorkshop,
  getPacketRoles,
  loadWorkshop,
  navItems,
  normalizeExternalReview,
  persistWorkshop,
  remainingTime,
} from "./model";
import { NavIcon, SignatureIcon, WorkshopMark } from "./icons";
import MissionView from "./MissionView";

const views = {
  contratto: "CONTRATTO",
  cartone: "CARTONE",
  giornate: "GIORNATE",
  cenacolo: "CENACOLO",
  evidence: "EVIDENCE",
};

function Deadline({ deadline }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const value = remainingTime(deadline, now);
  const deadlineLabel = Number.isNaN(Date.parse(deadline))
    ? deadline
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(deadline));

  return (
    <div className="deadline" aria-label="Time remaining">
      <span>
        T−{String(value.days).padStart(2, "0")}d {String(value.hours).padStart(2, "0")}h
      </span>
      <small>{deadlineLabel}</small>
    </div>
  );
}

function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar" aria-label="Workshop areas">
      <div className="axis-mark" aria-hidden="true" />
      {navItems.map((item) => (
        <button
          className={`nav-item ${active === item.id ? "is-active" : ""}`}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
          aria-current={active === item.id ? "page" : undefined}
        >
          <NavIcon type={item.id} />
          <span>{item.label}</span>
          <small>{item.gloss}</small>
        </button>
      ))}
      <div className="version">V · I · MMXXVI</div>
    </nav>
  );
}

function AttentionRail({ state }) {
  const percent = Math.min(
    100,
    Math.round((state.attentionMinutes / state.attentionCeiling) * 100),
  );

  return (
    <aside className="attention-rail">
      <section className="attention">
        <h2>OLTREMARE</h2>
        <div className="attention-value">
          <strong>{state.attentionMinutes}</strong>
          <span>min</span>
        </div>
        <div className="attention-gauge" aria-label={`${state.attentionMinutes} attention minutes`}>
          <div className="gauge-scale" aria-hidden="true">
            <span>120</span>
            <span>90</span>
            <span>60</span>
            <span>30</span>
            <span>0</span>
          </div>
          <div className="gauge-track">
            <div className="gauge-fill" style={{ height: `${percent}%` }} />
          </div>
          <div className="gauge-pointer" style={{ bottom: `${percent}%` }}>
            {state.attentionMinutes}
          </div>
        </div>
        <p>HUMAN ATTENTION BUDGET</p>
      </section>
      <section className="firma-rule">
        <h2>AFFRESCO</h2>
        <span>requires</span>
        <strong>FIRMA</strong>
        <SignatureIcon />
        <p>Irreversible work stops here until the human signs.</p>
      </section>
      <div className="autosave">
        <span className="autosave-mark" />
        autosaved locally
      </div>
    </aside>
  );
}

function GateLedger({ gates, onToggle, onEvidence }) {
  return (
    <ol className="gate-ledger">
      {gates.map((gate, index) => (
        <li className={gate.done ? "is-done" : ""} key={gate.id}>
          <span className="gate-index">{String(index + 1).padStart(2, "0")}</span>
          <button className="gate-copy" onClick={() => onEvidence(gate)} type="button">
            <strong>{gate.title}</strong>
            <small>{gate.detail}</small>
          </button>
          <button
            className="gate-check"
            aria-label={`Mark ${gate.title} ${gate.done ? "incomplete" : "complete"}`}
            aria-pressed={gate.done}
            onClick={() => onToggle(gate.id)}
            type="button"
          >
            {gate.done ? "×" : ""}
          </button>
        </li>
      ))}
    </ol>
  );
}

function activateStroke(state, strokeId) {
  const stroke = state.cartone.strokes.find((item) => item.id === strokeId);
  if (!stroke) return state;
  const index = state.cartone.strokes.indexOf(stroke);
  return {
    ...state,
    isHeld: false,
    isRunning: true,
    startedAt: state.startedAt || new Date().toISOString(),
    packetRole:
      stroke.role === "human" ? state.packetRole : stroke.role,
    cartone: {
      ...state.cartone,
      strokes: state.cartone.strokes.map((item) =>
        item.id === strokeId
          ? { ...item, status: "active" }
          : item.status === "active"
            ? { ...item, status: "queued" }
            : item,
      ),
    },
    giornata: {
      ...state.giornata,
      id: String(index + 1).padStart(2, "0"),
      title: stroke.title,
      classification: stroke.classification,
      classificationNote: stroke.outcome,
    },
    events: [
      createEvent(
        "GIORNATA",
        `${stroke.title} began for ${stroke.gateId}.`,
      ),
      ...state.events,
    ],
  };
}

function GiornateView({ state, setState, onEvidence, onCapobottega, onFirma }) {
  const manca = state.gates.filter((gate) => !gate.done).length;

  const toggleGate = (id) => {
    const gate = state.gates.find((item) => item.id === id);
    if (!gate.done && !gate.evidence.trim()) {
      setState((current) => ({
        ...current,
        events: [
          createEvent("FERMO", `${gate.title} cannot close without attached proof.`),
          ...current.events,
        ],
      }));
      onEvidence(gate);
      return;
    }

    setState((current) => {
      const nextDone = !gate.done;
      return {
        ...current,
        gates: current.gates.map((item) =>
          item.id === id ? { ...item, done: nextDone } : item,
        ),
        events: [
          createEvent(
            nextDone ? "GESSO" : "PENTIMENTO",
            `${gate.title} marked ${nextDone ? "complete" : "missing"}.`,
          ),
          ...current.events,
        ],
      };
    });
  };

  const begin = () => {
    if (state.firmaPending) return;
    setState((current) => ({
      ...current,
      isRunning: true,
      isHeld: false,
      startedAt: current.startedAt || new Date().toISOString(),
      events: [
        createEvent(
          "GIORNATA",
          `GIORNATA ${current.giornata.id} began: ${current.giornata.title}.`,
        ),
        ...current.events,
      ],
    }));
  };

  const callFermo = () => {
    setState((current) => ({
      ...current,
      isRunning: false,
      isHeld: true,
      events: [
        createEvent("FERMO", "Work held. Human attention requested before the next stroke."),
        ...current.events,
      ],
    }));
  };

  return (
    <div className="giornate-view">
      <header className="view-heading">
        <div>
          <span className="construction-cross" aria-hidden="true" />
          <h1>What is missing?</h1>
        </div>
        <div className="manca" aria-label={`${manca} submission gates missing`}>
          <span>MANCA</span>
          <strong>{String(manca).padStart(2, "0")}</strong>
        </div>
      </header>
      <GateLedger gates={state.gates} onToggle={toggleGate} onEvidence={onEvidence} />
      <section className={`work-strip ${state.isHeld ? "is-held" : ""}`}>
        <div className="work-copy">
          <div className="work-meta">
            GIORNATA {state.giornata.id} · wet until {state.giornata.wetUntil}
          </div>
          <h2>{state.giornata.title}</h2>
          <p>
            {state.giornata.classification} · {state.giornata.classificationNote}
          </p>
          {state.capobottega.latest && (
            <div className="capobottega-proof">
              CAPOBOTTEGA · {state.capobottega.latest.model} ·{" "}
              {state.capobottega.latest.responseId}
            </div>
          )}
          {state.isHeld && <div className="hold-message">FERMO ACTIVE · waiting for direction</div>}
          {state.firmaPending && (
            <div className="firma-pending" role="status">
              <strong>FIRMA REQUIRED</strong>
              <span>{state.firmaPending.title}</span>
              <small>{state.firmaPending.reason}</small>
            </div>
          )}
          <div className="work-actions">
            <button
              className="primary-action"
              disabled={Boolean(state.firmaPending)}
              onClick={begin}
              type="button"
            >
              <span className="action-mark" aria-hidden="true" />
              {state.firmaPending
                ? "LOCKED BY FIRMA"
                : state.isRunning
                  ? "GIORNATA ACTIVE"
                  : state.isHeld
                    ? "RESUME GIORNATA"
                    : "BEGIN GIORNATA"}
            </button>
            <button className="secondary-action" onClick={callFermo} type="button">
              <span className="pause-mark" aria-hidden="true">
                ||
              </span>
              CALL FERMO
            </button>
            <button
              className="capobottega-action"
              disabled={Boolean(state.firmaPending)}
              onClick={onCapobottega}
              type="button"
            >
              {state.firmaPending ? "CAPOBOTTEGA HELD" : "ASK CAPOBOTTEGA"}
              <small>{state.firmaPending ? "RESOLVE FIRMA FIRST" : "MODEL-RECORDED"}</small>
            </button>
            {state.firmaPending && (
              <button className="firma-action" onClick={onFirma} type="button">
                GIVE FIRMA
                <small>AUTHORIZE THIS STROKE</small>
              </button>
            )}
          </div>
        </div>
        <div className="drying-scale" aria-hidden="true">
          <span>23:40</span>
          <span>22:00</span>
          <span>20:00</span>
          <span>18:00</span>
          <span>00:00</span>
        </div>
      </section>
    </div>
  );
}

function CartoneView({ state, setState, onBeginStroke, onResult }) {
  const [copyStatus, setCopyStatus] = useState("COPY PACKET");
  const roles = getPacketRoles();
  const packet = buildWorkPacket(state);
  const activeStroke = state.cartone.strokes.find(
    (stroke) => stroke.status === "active",
  );

  const selectRole = (packetRole) => {
    setState((current) => ({
      ...current,
      packetRole,
      events: [
        createEvent("CARTONE", `${packetRole} selected for the next work packet.`),
        ...current.events,
      ],
    }));
  };

  const copyPacket = async () => {
    await navigator.clipboard.writeText(packet);
    setCopyStatus("COPIED");
    window.setTimeout(() => setCopyStatus("COPY PACKET"), 1_500);
  };

  return (
    <section className="document-view cartone-view">
      <header>
        <span>02</span>
        <h1>CARTONE</h1>
        <p>
          Revision {String(state.cartone.revision).padStart(2, "0")} · only
          lines that lead to CONSEGNA survive.
        </p>
      </header>
      <p className="cartone-rationale">{state.cartone.rationale}</p>
      {state.cartone.strokes.map((stroke, index) => (
        <div className={`cartone-line is-${stroke.status}`} key={stroke.id}>
          <span>G{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{stroke.title}</strong>
            <p>{stroke.outcome}</p>
            <small>
              {stroke.role} · {stroke.classification} · gate {stroke.gateId}
            </small>
          </div>
          <div className="stroke-command">
            <em>{stroke.status.toUpperCase()}</em>
            {stroke.status === "queued" && (
              <button
                disabled={Boolean(activeStroke || state.firmaPending)}
                onClick={() => onBeginStroke(stroke)}
                type="button"
              >
                BEGIN
              </button>
            )}
            {stroke.status === "active" && (
              <button onClick={() => onResult(stroke)} type="button">
                RETURN RESULT
              </button>
            )}
          </div>
        </div>
      ))}
      {state.cartone.schedule.length > 0 && (
        <section className="cartone-schedule">
          <h2>BACKWARD SCHEDULE</h2>
          {state.cartone.schedule.map((item) => (
            <div key={`${item.label}-${item.dueAt}`}>
              <time>{item.dueAt}</time>
              <strong>{item.label}</strong>
              <span>{item.deliverable}</span>
            </div>
          ))}
        </section>
      )}
      <section className="packet-builder" aria-labelledby="packet-title">
        <header>
          <span>HANDOFF</span>
          <h2 id="packet-title">One bounded work packet</h2>
          <p>The role changes the duty and stop rule—not the commission.</p>
        </header>
        <div className="packet-roles" aria-label="Work packet role">
          {roles.map((role) => (
            <button
              aria-pressed={state.packetRole === role.id}
              key={role.id}
              onClick={() => selectRole(role.id)}
              type="button"
            >
              <strong>{role.label}</strong>
              <small>{role.model}</small>
            </button>
          ))}
        </div>
        <pre>{packet}</pre>
        <button className="packet-copy" onClick={copyPacket} type="button">
          {copyStatus}
        </button>
      </section>
      <footer>
        {state.gates.filter((gate) => gate.done).length} of {state.gates.length} gates
        are closed with proof · {state.cartone.strokes.filter((stroke) => stroke.status === "done").length} of{" "}
        {state.cartone.strokes.length} strokes returned.
      </footer>
    </section>
  );
}

function CenacoloView({ state, setState }) {
  const manca = state.gates.filter((gate) => !gate.done);
  const ready = manca.length === 0;
  const [review, setReview] = useState({
    reviewer: "Claude Fable 5",
    role: "VASARI",
    verdict: "REVISE",
    summary: "",
    risks: "",
    recommendation: "",
    evidence: "",
  });

  const updateReview = (field, value) =>
    setReview((current) => ({ ...current, [field]: value }));

  const addReview = (event) => {
    event.preventDefault();
    const normalized = normalizeExternalReview(review);
    setState((current) => ({
      ...current,
      reviews: [normalized, ...(current.reviews || [])],
      events: [
        createEvent(
          "CENACOLO",
          `${normalized.reviewer} returned ${normalized.verdict}; advisory only until human FIRMA.`,
        ),
        ...current.events,
      ],
    }));
    setReview((current) => ({
      ...current,
      summary: "",
      risks: "",
      recommendation: "",
      evidence: "",
    }));
  };

  return (
    <section className="document-view cenacolo-view">
      <header>
        <span>04</span>
        <h1>CENACOLO</h1>
        <p>The final table. Every station must sign or stop.</p>
      </header>
      <div className={`verdict ${ready ? "is-ready" : ""}`}>
        <span>{ready ? "FIRMA" : "FERMO"}</span>
        <strong>{ready ? "The work may leave the workshop." : `${manca.length} proofs are missing.`}</strong>
      </div>
      <div className="poll-list">
        {state.gates.map((gate) => (
          <div key={gate.id}>
            <span className={gate.done ? "signed" : ""}>{gate.done ? "FIRMA" : "FERMO"}</span>
            <strong>{gate.title}</strong>
            <small>{gate.evidence || "No evidence attached"}</small>
          </div>
        ))}
      </div>
      <section className="external-cenacolo" aria-labelledby="external-cenacolo-title">
        <header>
          <span>EXTERNAL REVIEW</span>
          <h2 id="external-cenacolo-title">Different eyes. One return contract.</h2>
          <p>
            Claude, Gemini, and other models return advice in the same format.
            Reviews never close a gate or authorize CONSEGNA by themselves.
          </p>
        </header>
        <form onSubmit={addReview}>
          <div className="review-short-fields">
            <label>
              Reviewer
              <input
                onChange={(event) => updateReview("reviewer", event.target.value)}
                required
                value={review.reviewer}
              />
            </label>
            <label>
              Workshop role
              <select
                onChange={(event) => updateReview("role", event.target.value)}
                value={review.role}
              >
                <option>VASARI</option>
                <option>IL COLORISTA</option>
                <option>MAESTRO</option>
              </select>
            </label>
            <label>
              Verdict
              <select
                onChange={(event) => updateReview("verdict", event.target.value)}
                value={review.verdict}
              >
                <option>PROCEED</option>
                <option>REVISE</option>
                <option>FERMO</option>
              </select>
            </label>
          </div>
          <label>
            Finding
            <textarea
              onChange={(event) => updateReview("summary", event.target.value)}
              placeholder="Paste the reviewer's strongest finding."
              required
              value={review.summary}
            />
          </label>
          <div className="review-two-column">
            <label>
              Risks
              <textarea
                onChange={(event) => updateReview("risks", event.target.value)}
                value={review.risks}
              />
            </label>
            <label>
              Recommended next stroke
              <textarea
                onChange={(event) => updateReview("recommendation", event.target.value)}
                required
                value={review.recommendation}
              />
            </label>
          </div>
          <label>
            Evidence or conversation URL
            <input
              onChange={(event) => updateReview("evidence", event.target.value)}
              value={review.evidence}
            />
          </label>
          <button type="submit">RETURN REVIEW TO CENACOLO</button>
        </form>
        {(state.reviews || []).length > 0 && (
          <div className="review-ledger">
            {state.reviews.map((item) => (
              <article key={item.id}>
                <div>
                  <span>{item.role} · {item.status}</span>
                  <strong>{item.reviewer}</strong>
                </div>
                <em className={`is-${item.verdict.toLowerCase()}`}>{item.verdict}</em>
                <p>{item.summary}</p>
                <small>Next: {item.recommendation}</small>
              </article>
            ))}
          </div>
        )}
      </section>
      <button
        className="consegna"
        disabled={!ready}
        onClick={() =>
          setState((current) => ({
            ...current,
            events: [
              createEvent("AFFRESCO", "CONSEGNA signed. Final submission authorized."),
              ...current.events,
            ],
          }))
        }
        type="button"
      >
        {ready ? "SIGN CONSEGNA" : "CONSEGNA LOCKED"}
      </button>
    </section>
  );
}

function EvidenceView({ state }) {
  const download = () => {
    const blob = new Blob([exportWorkshop(state)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `verrocchio-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="document-view evidence-view">
      <header>
        <span>05</span>
        <h1>EVIDENCE</h1>
        <p>If it is not in the ledger, it did not happen.</p>
        <button onClick={download} type="button">
          EXPORT JSON
        </button>
      </header>
      <div className="evidence-table">
        {state.events.map((event) => (
          <article key={event.id}>
            <time>{new Date(event.time).toLocaleString()}</time>
            <span>{event.kind}</span>
            <p>{event.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvidenceDialog({ gate, onClose, onSave }) {
  const [value, setValue] = useState(gate?.evidence || "");
  if (!gate) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={onClose} role="presentation">
      <form
        className="evidence-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(value);
        }}
      >
        <div className="dialog-rule" />
        <span>ATTACH PROOF</span>
        <h2>{gate.title}</h2>
        <p>{gate.detail}</p>
        <label>
          Evidence note or URL
          <textarea
            autoFocus
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Describe the proof, paste a URL, or record the session ID."
          />
        </label>
        <div>
          <button className="dialog-cancel" onClick={onClose} type="button">
            CANCEL
          </button>
          <button className="dialog-save" type="submit">
            ATTACH EVIDENCE
          </button>
        </div>
      </form>
    </div>
  );
}

function ResultDialog({ stroke, onClose, onSave }) {
  const [result, setResult] = useState({
    summary: "",
    verification: "",
    evidence: "",
    remainingRisk: "",
  });
  if (!stroke) return null;

  const update = (field, value) =>
    setResult((current) => ({ ...current, [field]: value }));

  return (
    <div className="dialog-backdrop" onMouseDown={onClose} role="presentation">
      <form
        className="evidence-dialog result-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(result);
        }}
      >
        <div className="dialog-rule" />
        <span>RETURN TO THE WORKSHOP</span>
        <h2>{stroke.title}</h2>
        <p>{stroke.evidenceExpected}</p>
        <label>
          What changed
          <textarea
            autoFocus
            onChange={(event) => update("summary", event.target.value)}
            required
            value={result.summary}
          />
        </label>
        <label>
          Verification performed
          <textarea
            onChange={(event) => update("verification", event.target.value)}
            required
            value={result.verification}
          />
        </label>
        <label>
          Evidence path, URL, or response ID
          <textarea
            onChange={(event) => update("evidence", event.target.value)}
            required
            value={result.evidence}
          />
        </label>
        <label>
          Remaining risk
          <textarea
            onChange={(event) => update("remainingRisk", event.target.value)}
            required
            value={result.remainingRisk}
          />
        </label>
        <div>
          <button className="dialog-cancel" onClick={onClose} type="button">
            CANCEL
          </button>
          <button className="dialog-save" type="submit">
            ATTACH RESULT
          </button>
        </div>
      </form>
    </div>
  );
}

function CapobottegaDialog({ state, onClose, onClassify }) {
  const [work, setWork] = useState(
    state.capobottega.lastInput || state.giornata.title,
  );
  const [decision, setDecision] = useState(state.capobottega.latest);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const nextDecision = await onClassify(work);
      setDecision(nextDecision);
      setStatus("complete");
    } catch (requestError) {
      setError(requestError.message || "CAPOBOTTEGA could not answer.");
      setStatus("error");
    }
  };

  return (
    <div className="dialog-backdrop capobottega-backdrop" role="presentation">
      <section
        aria-labelledby="capobottega-title"
        aria-modal="true"
        className="capobottega-dialog"
        role="dialog"
      >
        <button
          aria-label="Close CAPOBOTTEGA"
          className="dialog-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <header>
          <span>IL CAPOBOTTEGA</span>
          <h2 id="capobottega-title">One stroke. One material.</h2>
          <p>
            The configured planning model classifies the next move by
            reversibility, scope, and submission value.
          </p>
        </header>
        <form onSubmit={submit}>
          <label>
            Proposed work
            <textarea
              autoFocus
              maxLength={2000}
              minLength={6}
              onChange={(event) => setWork(event.target.value)}
              value={work}
            />
          </label>
          <button className="capobottega-submit" disabled={status === "loading"} type="submit">
            {status === "loading" ? "CAPOBOTTEGA IS LOOKING…" : "CLASSIFY THE STROKE"}
          </button>
        </form>
        {error && (
          <div className="capobottega-error" role="alert">
            FERMO · {error}
          </div>
        )}
        {decision && (
          <article className="capobottega-decision" aria-live="polite">
            <div className={`decision-material is-${decision.classification.toLowerCase()}`}>
              <span>MATERIAL</span>
              <strong>{decision.classification}</strong>
            </div>
            <div className="decision-copy">
              <p>{decision.reason}</p>
              <dl>
                <div>
                  <dt>Next stroke</dt>
                  <dd>{decision.nextStroke}</dd>
                </div>
                <div>
                  <dt>Human</dt>
                  <dd>{decision.humanAction.replaceAll("_", " ")}</dd>
                </div>
                <div>
                  <dt>Scope</dt>
                  <dd>{decision.scopeEffect}</dd>
                </div>
                <div>
                  <dt>Gate</dt>
                  <dd>{decision.submissionGate}</dd>
                </div>
              </dl>
              <small>
                {decision.model} · {decision.responseId}
              </small>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(loadWorkshop);
  const [evidenceGate, setEvidenceGate] = useState(null);
  const [capobottegaOpen, setCapobottegaOpen] = useState(false);
  const [resultStroke, setResultStroke] = useState(null);

  useEffect(() => persistWorkshop(state), [state]);

  const manca = useMemo(
    () => state.gates.filter((gate) => !gate.done).length,
    [state.gates],
  );

  const saveEvidence = (value) => {
    const proof = value.trim();
    if (!proof) return;
    setState((current) => ({
      ...current,
      gates: current.gates.map((gate) =>
        gate.id === evidenceGate.id ? { ...gate, evidence: proof } : gate,
      ),
      events: [
        createEvent("EVIDENCE", `Proof attached to ${evidenceGate.title}.`),
        ...current.events,
      ],
    }));
    setEvidenceGate(null);
  };

  const generateWorkshop = async () => {
    setState((current) => ({
      ...current,
      mission: {
        ...current.mission,
        planningStatus: "loading",
        planningError: "",
      },
    }));
    try {
      const response = await fetch("/api/workshop-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: state.mission.status === "adopted" ? "replan" : "plan",
          mission: state.mission,
          current: {
            gates: state.gates,
            strokes: state.cartone.strokes,
            evidence: state.events.map((event) => event.message),
          },
        }),
      });
      const plan = await response.json();
      if (!response.ok) {
        throw new Error(plan.error || "CAPOBOTTEGA could not forge the workshop.");
      }
      setState((current) => ({
        ...current,
        mission: {
          ...current.mission,
          planningStatus: "draft",
          planningError: "",
          draftPlan: plan,
        },
        events: [
          createEvent(
            "CAPOBOTTEGA",
            `Workshop revision drafted by ${plan.model} · ${plan.responseId}; awaiting FIRMA.`,
          ),
          ...current.events,
        ],
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        mission: {
          ...current.mission,
          planningStatus: "error",
          planningError: error.message,
        },
      }));
    }
  };

  const adoptPlan = () =>
    setState((current) =>
      current.mission.draftPlan
        ? adoptWorkshopPlan(current, current.mission.draftPlan)
        : current,
    );

  const discardPlan = () =>
    setState((current) => ({
      ...current,
      mission: {
        ...current.mission,
        planningStatus: "idle",
        draftPlan: null,
      },
      events: [
        createEvent("PENTIMENTO", "Unsigned workshop draft discarded."),
        ...current.events,
      ],
    }));

  const beginStroke = (stroke) => {
    setState((current) => {
      if (current.firmaPending) return current;
      if (stroke.classification === "AFFRESCO") {
        return {
          ...current,
          isHeld: true,
          isRunning: false,
          firmaPending: {
            responseId: `cartone-${stroke.id}`,
            strokeId: stroke.id,
            title: stroke.title,
            reason: `${stroke.evidenceExpected} CARTONE classified this stroke as irreversible.`,
          },
          events: [
            createEvent("FERMO", `${stroke.title} stopped for FIRMA.`),
            ...current.events,
          ],
        };
      }
      return activateStroke(current, stroke.id);
    });
  };

  const saveResult = (result) => {
    setState((current) => {
      const stroke = current.cartone.strokes.find(
        (item) => item.id === resultStroke.id,
      );
      const evidence = `${result.summary} Verification: ${result.verification} Evidence: ${result.evidence} Risk: ${result.remainingRisk}`;
      const strokes = current.cartone.strokes.map((item) =>
        item.id === stroke.id ? { ...item, status: "done", result } : item,
      );
      const next = strokes.find((item) => item.status === "queued");
      return {
        ...current,
        isRunning: false,
        cartone: { ...current.cartone, strokes },
        gates: current.gates.map((gate) =>
          gate.id === stroke.gateId
            ? {
                ...gate,
                evidence: [gate.evidence, evidence].filter(Boolean).join("\n"),
              }
            : gate,
        ),
        giornata: next
          ? {
              ...current.giornata,
              id: String(strokes.indexOf(next) + 1).padStart(2, "0"),
              title: next.title,
              classification: next.classification,
              classificationNote: next.outcome,
            }
          : current.giornata,
        events: [
          createEvent(
            "EVIDENCE",
            `${stroke.title} returned: ${result.evidence}. Remaining risk: ${result.remainingRisk}`,
          ),
          ...current.events,
        ],
      };
    });
    setResultStroke(null);
  };

  const classifyWithCapobottega = async (work) => {
    const missingGates = state.gates
      .filter((gate) => !gate.done)
      .map((gate) => `${gate.id}: ${gate.title}`);
    const response = await fetch("/api/capobottega", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        work,
        objective: state.contract.objective,
        irreversibleRule: state.contract.irreversibleRule,
        manca,
        missingGates,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "CAPOBOTTEGA is unavailable.");
    }

    setState((current) => {
      const modelGate = current.gates.find(
        (gate) =>
          gate.id === "model-evidence" ||
          gate.id.includes("model") ||
          gate.id.includes("ai-") ||
          gate.id.includes("gpt") ||
          gate.title.toLowerCase().includes("model evidence") ||
          gate.title.toLowerCase().includes("ai evidence") ||
          gate.title.toLowerCase().includes("gpt"),
      );
      const attentionCost =
        payload.humanAction === "FIRMA_REQUIRED"
          ? 4
          : payload.humanAction === "REVIEW_LATER"
            ? 1
            : 0;
      const proof = `${payload.model} · ${payload.responseId} · ${payload.createdAt}`;
      return {
        ...current,
        attentionMinutes: Math.min(
          current.attentionCeiling,
          current.attentionMinutes + attentionCost,
        ),
        isHeld: payload.humanAction === "FIRMA_REQUIRED" ? true : current.isHeld,
        isRunning: payload.humanAction === "FIRMA_REQUIRED" ? false : current.isRunning,
        firmaPending:
          payload.humanAction === "FIRMA_REQUIRED"
            ? {
                responseId: payload.responseId,
                title: payload.nextStroke,
                reason: payload.reason,
              }
            : current.firmaPending,
        giornata: {
          ...current.giornata,
          title: payload.nextStroke,
          classification: payload.classification,
          classificationNote: payload.reason,
        },
        capobottega: {
          lastInput: work,
          latest: payload,
        },
        gates: current.gates.map((gate) =>
          gate.id === modelGate?.id
            ? { ...gate, done: true, evidence: proof }
            : gate,
        ),
        decisions: [
          {
            id: `decision-${crypto.randomUUID()}`,
            time: payload.createdAt,
            type: payload.classification,
            title: payload.nextStroke,
            actor: `CAPOBOTTEGA · ${payload.model}`,
            rationale: payload.reason,
            responseId: payload.responseId,
          },
          ...current.decisions,
        ],
        events: [
          createEvent(
            "CAPOBOTTEGA",
            `${payload.classification} · ${payload.evidenceNote} · ${payload.responseId}`,
          ),
          createEvent(
            "EVIDENCE",
            `Planning-model runtime proof attached: ${payload.model} · ${payload.responseId}.`,
          ),
          ...current.events,
        ],
      };
    });

    return payload;
  };

  const grantFirma = () => {
    setState((current) => {
      if (!current.firmaPending) return current;
      const signed = current.firmaPending;
      const nextState = {
        ...current,
        firmaPending: null,
        isHeld: false,
        isRunning: true,
        events: [
          createEvent(
            "FIRMA",
            `Human authorized “${signed.title}” from ${signed.responseId}.`,
          ),
          ...current.events,
        ],
      };
      return signed.strokeId
        ? activateStroke(nextState, signed.strokeId)
        : nextState;
    });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <WorkshopMark />
          </span>
          <div>
            <strong>VERROCCHIO</strong>
            <small>The workshop that paints itself</small>
          </div>
        </div>
        <div className="topbar-status">
          <span>MANCA {String(manca).padStart(2, "0")}</span>
          <Deadline deadline={state.deadline} />
        </div>
      </header>
      <Sidebar
        active={state.activeView}
        onSelect={(activeView) => setState((current) => ({ ...current, activeView }))}
      />
      <section className="workspace" aria-label={views[state.activeView]}>
        {state.activeView === "giornate" && (
          <GiornateView
            state={state}
            setState={setState}
            onEvidence={setEvidenceGate}
            onCapobottega={() => setCapobottegaOpen(true)}
            onFirma={grantFirma}
          />
        )}
        {state.activeView === "contratto" && (
          <MissionView
            onAdopt={adoptPlan}
            onDiscard={discardPlan}
            onGenerate={generateWorkshop}
            setState={setState}
            state={state}
          />
        )}
        {state.activeView === "cartone" && (
          <CartoneView
            onBeginStroke={beginStroke}
            onResult={setResultStroke}
            state={state}
            setState={setState}
          />
        )}
        {state.activeView === "cenacolo" && (
          <CenacoloView state={state} setState={setState} />
        )}
        {state.activeView === "evidence" && <EvidenceView state={state} />}
      </section>
      <AttentionRail state={state} />
      <EvidenceDialog
        gate={evidenceGate}
        key={evidenceGate?.id || "evidence-closed"}
        onClose={() => setEvidenceGate(null)}
        onSave={saveEvidence}
      />
      <ResultDialog
        onClose={() => setResultStroke(null)}
        onSave={saveResult}
        stroke={resultStroke}
      />
      {capobottegaOpen && (
        <CapobottegaDialog
          state={state}
          onClose={() => setCapobottegaOpen(false)}
          onClassify={classifyWithCapobottega}
        />
      )}
    </main>
  );
}
