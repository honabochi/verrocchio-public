import { useEffect, useMemo, useState } from "react";
import {
  buildWorkPacket,
  createEvent,
  exportWorkshop,
  getPacketRoles,
  loadWorkshop,
  navItems,
  persistWorkshop,
  remainingTime,
} from "./model";
import { NavIcon, SignatureIcon, WorkshopMark } from "./icons";

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

  return (
    <div className="deadline" aria-label="Time remaining">
      <span>
        T−{String(value.days).padStart(2, "0")}d {String(value.hours).padStart(2, "0")}h
      </span>
      <small>Jul 21 · 17:00 PDT</small>
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
        createEvent("GIORNATA", "GIORNATA 01 began: VERROCCHIO is controlling its own build."),
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
            <button className="capobottega-action" onClick={onCapobottega} type="button">
              ASK CAPOBOTTEGA
              <small>GPT-5.6 SOL</small>
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

function ContrattoView({ state, setState }) {
  const update = (field, value) =>
    setState((current) => ({
      ...current,
      contract: { ...current.contract, [field]: value },
      events: [
        createEvent("SECCO", `CONTRATTO field “${field}” updated for later review.`),
        ...current.events,
      ],
    }));

  return (
    <section className="document-view">
      <header>
        <span>01</span>
        <h1>CONTRATTO</h1>
        <p>The commission that every stroke must answer to.</p>
      </header>
      <label>
        Objective
        <textarea
          value={state.contract.objective}
          onChange={(event) => update("objective", event.target.value)}
        />
      </label>
      <div className="contract-grid">
        <label>
          Track
          <input
            value={state.contract.track}
            onChange={(event) => update("track", event.target.value)}
          />
        </label>
        <label>
          Launch window
          <input readOnly value="2026-07-21 · 17:00 PDT / 2026-07-22 · 09:00 JST" />
        </label>
      </div>
      <label>
        DI SUA MANO · the human hand
        <textarea
          value={state.contract.humanRule}
          onChange={(event) => update("humanRule", event.target.value)}
        />
      </label>
      <label>
        AFFRESCO rule
        <textarea
          value={state.contract.irreversibleRule}
          onChange={(event) => update("irreversibleRule", event.target.value)}
        />
      </label>
    </section>
  );
}

function CartoneView({ state, setState }) {
  const [copyStatus, setCopyStatus] = useState("COPY PACKET");
  const roles = getPacketRoles();
  const packet = buildWorkPacket(state);

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
        <p>Only lines that lead to CONSEGNA survive.</p>
      </header>
      <div className="cartone-line">
        <span>G1</span>
        <div>
          <strong>Walking skeleton</strong>
          <p>Contract → gates → giornata → evidence → final poll.</p>
        </div>
        <em>PROVEN</em>
      </div>
      <div className="cartone-line">
        <span>G2</span>
        <div>
          <strong>Self-proof</strong>
          <p>Use VERROCCHIO to direct and document its own implementation.</p>
        </div>
        <em>PROVEN</em>
      </div>
      <div className="cartone-line">
        <span>G3</span>
        <div>
          <strong>Payload application</strong>
          <p>Build one app under the same contract and submit the pair.</p>
        </div>
        <em>AWAITING FIRMA</em>
      </div>
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
        {state.gates.filter((gate) => gate.done).length} of {state.gates.length} submission gates
        have proof.
      </footer>
    </section>
  );
}

function CenacoloView({ state, setState }) {
  const manca = state.gates.filter((gate) => !gate.done);
  const ready = manca.length === 0;
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
            GPT-5.6 Sol classifies the next move by reversibility, scope, and
            submission value.
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

  useEffect(() => persistWorkshop(state), [state]);

  const manca = useMemo(
    () => state.gates.filter((gate) => !gate.done).length,
    [state.gates],
  );

  const saveEvidence = (value) => {
    setState((current) => ({
      ...current,
      gates: current.gates.map((gate) =>
        gate.id === evidenceGate.id ? { ...gate, evidence: value } : gate,
      ),
      events: [
        createEvent("EVIDENCE", `Proof attached to ${evidenceGate.title}.`),
        ...current.events,
      ],
    }));
    setEvidenceGate(null);
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
          gate.id === "gpt-evidence"
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
            `GPT-5.6 runtime proof attached: ${payload.model} · ${payload.responseId}.`,
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
      return {
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
          <ContrattoView state={state} setState={setState} />
        )}
        {state.activeView === "cartone" && (
          <CartoneView state={state} setState={setState} />
        )}
        {state.activeView === "cenacolo" && (
          <CenacoloView state={state} setState={setState} />
        )}
        {state.activeView === "evidence" && <EvidenceView state={state} />}
      </section>
      <AttentionRail state={state} />
      <EvidenceDialog
        gate={evidenceGate}
        onClose={() => setEvidenceGate(null)}
        onSave={saveEvidence}
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
