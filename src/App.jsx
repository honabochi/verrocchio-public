import { useEffect, useMemo, useState } from "react";
import {
  createEvent,
  exportWorkshop,
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

function GiornateView({ state, setState, onEvidence }) {
  const manca = state.gates.filter((gate) => !gate.done).length;

  const toggleGate = (id) => {
    setState((current) => {
      const gate = current.gates.find((item) => item.id === id);
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
          {state.isHeld && <div className="hold-message">FERMO ACTIVE · waiting for direction</div>}
          <div className="work-actions">
            <button className="primary-action" onClick={begin} type="button">
              <span className="action-mark" aria-hidden="true" />
              {state.isRunning ? "GIORNATA ACTIVE" : state.isHeld ? "RESUME GIORNATA" : "BEGIN GIORNATA"}
            </button>
            <button className="secondary-action" onClick={callFermo} type="button">
              <span className="pause-mark" aria-hidden="true">
                ||
              </span>
              CALL FERMO
            </button>
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

function CartoneView({ state }) {
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
        <em>NOW</em>
      </div>
      <div className="cartone-line">
        <span>G2</span>
        <div>
          <strong>Self-proof</strong>
          <p>Use VERROCCHIO to direct and document its own implementation.</p>
        </div>
        <em>NEXT</em>
      </div>
      <div className="cartone-line">
        <span>G3</span>
        <div>
          <strong>Payload application</strong>
          <p>Build one app under the same contract and submit the pair.</p>
        </div>
        <em>QUEUED</em>
      </div>
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

export default function App() {
  const [state, setState] = useState(loadWorkshop);
  const [evidenceGate, setEvidenceGate] = useState(null);

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
          <GiornateView state={state} setState={setState} onEvidence={setEvidenceGate} />
        )}
        {state.activeView === "contratto" && (
          <ContrattoView state={state} setState={setState} />
        )}
        {state.activeView === "cartone" && <CartoneView state={state} />}
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
    </main>
  );
}
