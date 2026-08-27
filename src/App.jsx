import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  actionAria,
  ActionLabel,
  actions,
  DualLabel,
  fields,
  sections,
  statuses,
  terms,
} from "./uiCopy";
import useWebMcp from "./useWebMcp";
import { claimWorkResult, holdWorkshop, verifyEvidenceClaim } from "./workshopCommands";

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
    : new Intl.DateTimeFormat("ja-JP", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(deadline));

  return (
    <div className="deadline" aria-label="締切までの残り時間">
      <span>
        T−{String(value.days).padStart(2, "0")}d {String(value.hours).padStart(2, "0")}h
      </span>
      <small>{deadlineLabel}</small>
    </div>
  );
}

function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar" aria-label="工房の画面">
      <div className="axis-mark" aria-hidden="true" />
      {navItems.map((item) => (
        <button
          className={`nav-item ${active === item.id ? "is-active" : ""}`}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
          aria-current={active === item.id ? "page" : undefined}
          aria-label={`${item.gloss}を開く · ${item.label}`}
        >
          <NavIcon type={item.id} />
          <span aria-hidden="true" className="nav-copy">
            <span className="nav-primary" lang={item.lang}>{item.label}</span>
            <small className="nav-assist" lang="ja">{item.gloss}</small>
          </span>
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
        <DualLabel as="h2" className="rail-term" copy={terms.oltremare} />
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
        <p>人間が使える集中時間</p>
      </section>
      <section className="firma-rule">
        <DualLabel as="h2" className="rail-term" copy={terms.affresco} />
        <DualLabel as="strong" className="firma-term" copy={terms.firma} />
        <SignatureIcon />
        <p>取り消せない作業は、人間が署名するまでここで止まる。</p>
      </section>
      <div className="autosave">
        <span className="autosave-mark" />
        ローカルへ自動保存
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
  const [resumeNotice, setResumeNotice] = useState(false);
  const pendingClaims = state.gates.flatMap((gate) =>
    (gate.claims || [])
      .filter((claim) => claim.status === "CLAIMED")
      .map((claim) => ({ ...claim, gateTitle: gate.title })),
  );
  const primaryActionCopy = state.firmaPending
    ? actions.lockedByFirma
    : state.isRunning
      ? actions.workActive
      : state.isHeld
        ? actions.resumeWork
        : actions.beginWork;
  const capobottegaCopy = state.firmaPending
    ? actions.capobottegaHeld
    : actions.askCapobottega;

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
    const resumedFromFermo = state.isHeld;
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
    setResumeNotice(resumedFromFermo);
  };

  const callFermo = () => {
    setResumeNotice(false);
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
          <h1>何が不足している？</h1>
        </div>
        <div className="manca" aria-label={`${manca} submission gates missing`}>
          <DualLabel className="manca-term" copy={terms.manca} />
          <strong>{String(manca).padStart(2, "0")}</strong>
        </div>
      </header>
      <GateLedger gates={state.gates} onToggle={toggleGate} onEvidence={onEvidence} />
      {pendingClaims.length > 0 && (
        <section className="evidence-claims" aria-label="Evidence awaiting human verification">
          <header>
            <DualLabel className="section-caption" copy={sections.humanCheckpoint} />
            <h2>AIが返したのは主張であり、まだ証拠ではない。</h2>
          </header>
          {pendingClaims.map((claim) => (
            <article key={claim.id}>
              <div>
                <strong>{claim.gateTitle}</strong>
                <p>{claim.summary}</p>
                <small>{claim.evidenceRef} · risk: {claim.remainingRisk}</small>
              </div>
              <button
                aria-label={actionAria(actions.verifyClaim)}
                onClick={() => setState((current) => verifyEvidenceClaim(current, claim.id))}
                type="button"
              >
                <ActionLabel copy={actions.verifyClaim} />
              </button>
            </article>
          ))}
        </section>
      )}
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
          {state.isHeld && (
            <div className="hold-message">
              <DualLabel copy={statuses.fermoActive} />
            </div>
          )}
          {resumeNotice && state.isRunning && !state.isHeld && (
            <div className="resume-confirmation" role="status">
              <strong>再開しました</strong>
              <span>GIORNATA ACTIVE · AIの作業を続けられます</span>
            </div>
          )}
          {state.firmaPending && (
            <div className="firma-pending" role="status">
              <DualLabel as="strong" copy={statuses.firmaRequired} />
              <span>{state.firmaPending.title}</span>
              <small>{state.firmaPending.reason}</small>
            </div>
          )}
          <div className="work-actions">
            <button
              aria-label={actionAria(primaryActionCopy)}
              aria-pressed={state.isRunning}
              className={`primary-action ${state.isRunning ? "is-active" : ""}`}
              disabled={Boolean(state.firmaPending) || state.isRunning}
              onClick={begin}
              type="button"
            >
              <span className="action-mark" aria-hidden="true" />
              <ActionLabel copy={primaryActionCopy} />
            </button>
            <button
              aria-label={actionAria(state.isHeld ? actions.fermoActive : actions.callFermo)}
              className="secondary-action"
              disabled={state.isHeld}
              onClick={callFermo}
              type="button"
            >
              <span className="pause-mark" aria-hidden="true">
                ||
              </span>
              <ActionLabel copy={state.isHeld ? actions.fermoActive : actions.callFermo} />
            </button>
            <button
              aria-label={actionAria(capobottegaCopy)}
              className="capobottega-action"
              disabled={Boolean(state.firmaPending)}
              onClick={onCapobottega}
              type="button"
            >
              <ActionLabel copy={capobottegaCopy} />
            </button>
            {state.firmaPending && (
              <button
                aria-label={actionAria(actions.giveFirma)}
                className="firma-action"
                onClick={onFirma}
                type="button"
              >
                <ActionLabel copy={actions.giveFirma} />
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
        <DualLabel as="h1" className="document-title" copy={terms.cartone} />
        <p>
          Revision {String(state.cartone.revision).padStart(2, "0")} · CONSEGNAへ
          つながる線だけを残す。
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
            <DualLabel
              as="em"
              className="stroke-status"
              copy={statuses[stroke.status] || statuses.queued}
            />
            {stroke.status === "queued" && (
              <button
                aria-label={actionAria(actions.beginStroke)}
                disabled={Boolean(activeStroke || state.firmaPending)}
                onClick={() => onBeginStroke(stroke)}
                type="button"
              >
                <ActionLabel copy={actions.beginStroke} />
              </button>
            )}
            {stroke.status === "active" && (
              <button
                aria-label={actionAria(actions.returnResult)}
                onClick={() => onResult(stroke)}
                type="button"
              >
                <ActionLabel copy={actions.returnResult} />
              </button>
            )}
          </div>
        </div>
      ))}
      {state.cartone.schedule.length > 0 && (
        <section className="cartone-schedule">
          <DualLabel as="h2" className="section-caption" copy={sections.backwardSchedule} />
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
          <DualLabel className="section-caption" copy={sections.handoff} />
          <h2 id="packet-title">境界の決まった、ひとつの作業票</h2>
          <p>役割ごとに責務と停止条件は変わるが、目的は変えない。</p>
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
        <button
          aria-label={actionAria(actions.copyPacket)}
          className="packet-copy"
          onClick={copyPacket}
          type="button"
        >
          {copyStatus === "COPIED" ? "コピーしました" : <ActionLabel copy={actions.copyPacket} />}
        </button>
      </section>
      <footer>
        {state.gates.length}件中{state.gates.filter((gate) => gate.done).length}件のゲートを
        証拠つきで完了 · {state.cartone.strokes.length}件中
        {state.cartone.strokes.filter((stroke) => stroke.status === "done").length}件のストロークが返却済み。
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
        <DualLabel as="h1" className="document-title" copy={terms.cenacolo} />
        <p>最後の円卓。各持ち場は署名するか、停止を宣言する。</p>
      </header>
      <div className={`verdict ${ready ? "is-ready" : ""}`}>
        <DualLabel copy={ready ? terms.firma : terms.fermo} />
        <strong>{ready ? "工房から提出へ進める。" : `証拠があと${manca.length}件必要。`}</strong>
      </div>
      <div className="poll-list">
        {state.gates.map((gate) => (
          <div key={gate.id}>
            <DualLabel
              className={gate.done ? "signed" : ""}
              copy={gate.done ? terms.firma : terms.fermo}
            />
            <strong>{gate.title}</strong>
            <small>{gate.evidence || "証拠はまだ添付されていない"}</small>
          </div>
        ))}
      </div>
      <section className="external-cenacolo" aria-labelledby="external-cenacolo-title">
        <header>
          <DualLabel className="section-caption" copy={sections.externalReview} />
          <h2 id="external-cenacolo-title">異なる目線を、ひとつの返却形式へ。</h2>
          <p>
            Claude、Gemini、その他のモデルも同じ形式で助言を返す。
            レビューだけでゲートを閉じたり、CONSEGNAを許可したりはできない。
          </p>
        </header>
        <form onSubmit={addReview}>
          <div className="review-short-fields">
            <label>
              <DualLabel className="field-caption" copy={fields.reviewer} />
              <input
                onChange={(event) => updateReview("reviewer", event.target.value)}
                required
                value={review.reviewer}
              />
            </label>
            <label>
              <DualLabel className="field-caption" copy={fields.workshopRole} />
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
              <DualLabel className="field-caption" copy={fields.verdict} />
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
            <DualLabel className="field-caption" copy={fields.finding} />
            <textarea
              onChange={(event) => updateReview("summary", event.target.value)}
              placeholder="レビューで最も重要な指摘を貼り付ける。"
              required
              value={review.summary}
            />
          </label>
          <div className="review-two-column">
            <label>
              <DualLabel className="field-caption" copy={fields.risks} />
              <textarea
                onChange={(event) => updateReview("risks", event.target.value)}
                value={review.risks}
              />
            </label>
            <label>
              <DualLabel className="field-caption" copy={fields.nextStroke} />
              <textarea
                onChange={(event) => updateReview("recommendation", event.target.value)}
                required
                value={review.recommendation}
              />
            </label>
          </div>
          <label>
            <DualLabel className="field-caption" copy={fields.evidenceReference} />
            <input
              onChange={(event) => updateReview("evidence", event.target.value)}
              value={review.evidence}
            />
          </label>
          <button aria-label={actionAria(actions.returnReview)} type="submit">
            <ActionLabel copy={actions.returnReview} />
          </button>
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
        aria-label={actionAria(ready ? actions.signConsegna : actions.consegnaLocked)}
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
        <ActionLabel copy={ready ? actions.signConsegna : actions.consegnaLocked} />
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
        <DualLabel as="h1" className="document-title" copy={terms.evidence} />
        <p>台帳に残っていないものは、実行されたとは扱わない。</p>
        <button aria-label={actionAria(actions.exportJson)} onClick={download} type="button">
          <ActionLabel copy={actions.exportJson} />
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
        <DualLabel className="section-caption" copy={sections.attachProof} />
        <h2>{gate.title}</h2>
        <p>{gate.detail}</p>
        <label>
          <DualLabel className="field-caption" copy={fields.evidenceNote} />
          <textarea
            autoFocus
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="証拠を説明するか、URLまたはセッションIDを記録する。"
          />
        </label>
        <div>
          <button
            aria-label={actionAria(actions.cancel)}
            className="dialog-cancel"
            onClick={onClose}
            type="button"
          >
            <ActionLabel copy={actions.cancel} />
          </button>
          <button
            aria-label={actionAria(actions.attachEvidence)}
            className="dialog-save"
            type="submit"
          >
            <ActionLabel copy={actions.attachEvidence} />
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
        <DualLabel className="section-caption" copy={sections.returnWorkshop} />
        <h2>{stroke.title}</h2>
        <p>{stroke.evidenceExpected}</p>
        <label>
          <DualLabel className="field-caption" copy={fields.changed} />
          <textarea
            autoFocus
            onChange={(event) => update("summary", event.target.value)}
            required
            value={result.summary}
          />
        </label>
        <label>
          <DualLabel className="field-caption" copy={fields.verification} />
          <textarea
            onChange={(event) => update("verification", event.target.value)}
            required
            value={result.verification}
          />
        </label>
        <label>
          <DualLabel className="field-caption" copy={fields.resultEvidence} />
          <textarea
            onChange={(event) => update("evidence", event.target.value)}
            required
            value={result.evidence}
          />
        </label>
        <label>
          <DualLabel className="field-caption" copy={fields.remainingRisk} />
          <textarea
            onChange={(event) => update("remainingRisk", event.target.value)}
            required
            value={result.remainingRisk}
          />
        </label>
        <div>
          <button
            aria-label={actionAria(actions.cancel)}
            className="dialog-cancel"
            onClick={onClose}
            type="button"
          >
            <ActionLabel copy={actions.cancel} />
          </button>
          <button
            aria-label={actionAria(actions.attachResult)}
            className="dialog-save"
            type="submit"
          >
            <ActionLabel copy={actions.attachResult} />
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
          <DualLabel className="section-caption" copy={terms.capobottega} />
          <h2 id="capobottega-title">ひとつのストロークに、ひとつの素材。</h2>
          <p>
            設定された計画モデルが、可逆性、範囲、提出価値から次の一手を分類する。
          </p>
        </header>
        <form onSubmit={submit}>
          <label>
            <DualLabel className="field-caption" copy={fields.proposedWork} />
            <textarea
              autoFocus
              maxLength={2000}
              minLength={6}
              onChange={(event) => setWork(event.target.value)}
              value={work}
            />
          </label>
          <button
            aria-label={
              status === "loading"
                ? "計画役が確認中"
                : actionAria(actions.classifyStroke)
            }
            className="capobottega-submit"
            disabled={status === "loading"}
            type="submit"
          >
            {status === "loading"
              ? "計画役が確認中…"
              : <ActionLabel copy={actions.classifyStroke} />}
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
  const stateRef = useRef(null);
  const [state, rawSetState] = useState(() => {
    const loaded = loadWorkshop();
    stateRef.current = loaded;
    return loaded;
  });
  const setState = useCallback((update) => {
    const current = stateRef.current;
    const proposed = typeof update === "function" ? update(current) : update;
    if (!proposed || proposed === current) return current;
    const next = {
      ...proposed,
      stateVersion: (current.stateVersion || 0) + 1,
    };
    stateRef.current = next;
    rawSetState(next);
    return next;
  }, []);
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

  const generateWorkshop = async ({
    signal,
    actor = "human",
    expectedStateVersion,
    idempotencyKey,
  } = {}) => {
    const requestState = stateRef.current;
    const isAgentRequest = actor === "webmcp-agent";
    const normalizedKey = String(idempotencyKey || "").trim();

    if (isAgentRequest) {
      if (!normalizedKey || normalizedKey.length > 64) {
        throw new Error("INVALID_IDEMPOTENCY_KEY: use 1 to 64 characters.");
      }
      const existing = (requestState.toolReceipts || []).find(
        (item) => item.idempotencyKey === normalizedKey,
      );
      if (existing) {
        if (existing.transition !== "PLAN_DRAFTED") {
          throw new Error("IDEMPOTENCY_CONFLICT: the key was used for another transition.");
        }
        return { ...existing, replayed: true };
      }
      if (expectedStateVersion !== requestState.stateVersion) {
        throw new Error(
          `STALE_STATE: expected ${expectedStateVersion}, current ${requestState.stateVersion}. Inspect again.`,
        );
      }
      if (requestState.inFlightToolKeys.includes(normalizedKey)) {
        throw new Error("REQUEST_IN_PROGRESS: wait for the first request to finish.");
      }
    }

    setState((current) => ({
      ...current,
      inFlightToolKeys: isAgentRequest
        ? [normalizedKey, ...current.inFlightToolKeys]
        : current.inFlightToolKeys,
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
        signal,
        body: JSON.stringify({
          mode: requestState.mission.status === "adopted" ? "replan" : "plan",
          mission: requestState.mission,
          current: {
            gates: requestState.gates,
            strokes: requestState.cartone.strokes,
            evidence: requestState.events.map((event) => event.message),
          },
        }),
      });
      const plan = await response.json();
      if (!response.ok) {
        throw new Error(plan.error || "CAPOBOTTEGA could not forge the workshop.");
      }
      const receipt = {
        ok: true,
        receiptId: `receipt-${crypto.randomUUID()}`,
        idempotencyKey: isAgentRequest ? normalizedKey : undefined,
        transition: "PLAN_DRAFTED",
        stateVersion: (stateRef.current.stateVersion || 0) + 1,
        planRevision: (requestState.cartone?.revision || 0) + 1,
        model: plan.model,
        responseId: plan.responseId,
        next: { actor: "human", action: "GIVE_FIRMA_IN_UI" },
        requestedBy: actor,
      };
      setState((current) => ({
        ...current,
        inFlightToolKeys: current.inFlightToolKeys.filter(
          (key) => key !== normalizedKey,
        ),
        toolReceipts: isAgentRequest
          ? [receipt, ...current.toolReceipts].slice(0, 20)
          : current.toolReceipts,
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
      return receipt;
    } catch (error) {
      setState((current) => ({
        ...current,
        inFlightToolKeys: current.inFlightToolKeys.filter(
          (key) => key !== normalizedKey,
        ),
        mission: {
          ...current.mission,
          planningStatus: "error",
          planningError: error.message,
        },
      }));
      if (actor === "webmcp-agent") throw error;
      return { ok: false, error: error.message };
    }
  };

  const returnWebMcpResult = (input) => {
    const result = claimWorkResult(stateRef.current, input);
    setState(result.state);
    return result.receipt;
  };

  const callFermoFromWebMcp = (input) => {
    const result = holdWorkshop(stateRef.current, input);
    setState(result.state);
    return result.receipt;
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
      const modelClaim = {
        id: `claim-${crypto.randomUUID()}`,
        submittedBy: "capobottega-model",
        submittedAt: payload.createdAt,
        status: "CLAIMED",
        summary: payload.evidenceNote,
        verification: "Model runtime response recorded; human review pending.",
        evidenceRef: proof,
        remainingRisk: payload.reason,
      };
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
            ? { ...gate, claims: [modelClaim, ...(gate.claims || [])] }
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
            "CLAIM",
            `Planning-model runtime claim attached: ${payload.model} · ${payload.responseId}; human verification required.`,
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

  const webMcpStatus = useWebMcp(state, {
    forgeDraft: generateWorkshop,
    returnResult: returnWebMcpResult,
    callFermo: callFermoFromWebMcp,
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <WorkshopMark />
          </span>
          <div>
            <strong>VERROCCHIO</strong>
            <small>一人で、規律あるチームになる</small>
          </div>
        </div>
        <div className="topbar-status">
          <span className={`webmcp-status is-${webMcpStatus}`}>
            <DualLabel
              copy={
                webMcpStatus === "ready"
                  ? statuses.webMcpReady
                  : statuses.webMcpUnavailable
              }
            />
          </span>
          <span className="topbar-manca">
            MANCA {String(manca).padStart(2, "0")} <small>未確認の証拠</small>
          </span>
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
            webMcpStatus={webMcpStatus}
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
