import { useState } from "react";
import { createHackathonProfile } from "./hackathonProfiles";

function MissionField({ label, name, value, onChange, rows = 3 }) {
  return (
    <label>
      {label}
      <textarea
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function formatDeadline(deadline) {
  if (Number.isNaN(Date.parse(deadline))) return deadline;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
    timeZoneName: "short",
  }).format(new Date(deadline));
}

function MissionSummaryItem({ label, value, featured = false }) {
  return (
    <article className={featured ? "is-featured" : ""} title={value}>
      <span>{label}</span>
      <p>{value}</p>
    </article>
  );
}

const webMcpStatusCopy = {
  detecting: "AI向けの道具を確認中",
  ready: "AIが使える4つの道具を公開中",
  unavailable: "通常表示中。ChatGPT内ブラウザかWebMCP対応ChromeでAI操作できます",
  error: "AI向けの道具を登録できませんでした",
};

function WebMcpOnramp({ status }) {
  return (
    <aside className={`webmcp-onramp is-${status}`} aria-label="WebMCPの使い方">
      <div className="webmcp-onramp-heading">
        <span>WEBMCP · HUMAN + AGENT</span>
        <strong>{webMcpStatusCopy[status] || webMcpStatusCopy.detecting}</strong>
      </div>
      <div className="webmcp-prompt">
        <small>CHATGPTにこう頼む</small>
        <p>
          工房を調べて、まだ不足している証拠と最小の次の一手を教えて。
          FIRMA・証拠確認・提出は私に残して。
        </p>
      </div>
      <div className="webmcp-boundary">
        <span><b>AI</b> 調査・下書き・作業結果の返却</span>
        <span><b>人間</b> FIRMA・証拠確認・CONSEGNA</span>
      </div>
    </aside>
  );
}

function PlanDraft({ plan, onAdopt, onDiscard }) {
  return (
    <section className="plan-draft" aria-labelledby="plan-draft-title">
      <header>
        <div>
          <span>AFFRESCO · {plan.humanAction.replaceAll("_", " ")}</span>
          <h2 id="plan-draft-title">計画はまだ乾いていない。</h2>
        </div>
        <div className="plan-counts">
          <strong>{String(plan.gates.length).padStart(2, "0")}</strong>
          <span>不足している証拠</span>
          <strong>{String(plan.strokes.length).padStart(2, "0")}</strong>
          <span>作業ストローク</span>
        </div>
      </header>
      <p className="plan-rationale">{plan.rationale}</p>
      <div className="plan-preview-grid">
        <div>
          <h3>CONTRATTO</h3>
          <strong>{plan.contract.objective}</strong>
          <small>{plan.contract.deadline}</small>
        </div>
        <div>
          <h3>MANCA</h3>
          <ol>
            {plan.gates.map((gate) => (
              <li key={gate.id}>
                <strong>{gate.title}</strong>
                <span>{gate.proofRequired}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>RISKS</h3>
          <ol>
            {plan.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ol>
        </div>
      </div>
      <footer>
        <span>
          {plan.model} · {plan.responseId} · scope {plan.scopeEffect}
        </span>
        <div>
          <button className="dialog-cancel" onClick={onDiscard} type="button">
            DISCARD
          </button>
          <button className="plan-adopt" onClick={onAdopt} type="button">
            GIVE FIRMA &amp; ADOPT
          </button>
        </div>
      </footer>
    </section>
  );
}

export default function MissionView({
  state,
  setState,
  onGenerate,
  onAdopt,
  onDiscard,
  webMcpStatus,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { mission } = state;
  const hasLoadedProfile =
    mission.profileId && mission.profileId !== "blank";
  const updateMission = (field, value) =>
    setState((current) => ({
      ...current,
      mission: { ...current.mission, [field]: value },
    }));

  const loadProfile = (profileId) => {
    setDetailsOpen(false);
    setState((current) => ({
      ...current,
      deadline: createHackathonProfile(profileId).deadline,
      mission: {
        ...current.mission,
        ...createHackathonProfile(profileId),
        status: "seed",
        planningStatus: "idle",
        planningError: "",
        draftPlan: null,
      },
      events: [
        {
          id: `profile-${crypto.randomUUID()}`,
          time: new Date().toISOString(),
          kind: "CONTRATTO",
          message: `${profileId} のミッションを読み込みました。公式ルールは引き続き人間が確認します。`,
        },
        ...current.events,
      ],
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onGenerate();
  };

  return (
    <section
      className={`document-view mission-view ${hasLoadedProfile ? "is-profile-loaded" : ""}`}
    >
      <header>
        <span>01</span>
        <h1>CONTRATTO</h1>
        <p>
          ここにルールを入れ、署名済みの実行工房へ変える。
        </p>
      </header>

      <WebMcpOnramp status={webMcpStatus} />

      <form
        className={`mission-form ${hasLoadedProfile ? "is-summary" : ""}`}
        onSubmit={submit}
      >
        <div className="mission-form-heading">
          <div>
            <span>MISSION INTAKE</span>
            <h2>CONSEGNAまでに、何を届けるか？</h2>
          </div>
          <p>
            締切、必要な証拠、制約、使える手、そして人間に残す判断を、
            閉じた実行条件として記録する。
          </p>
        </div>

        <div className="profile-switcher" aria-label="Hackathon profile template">
          <div>
            <strong>ONE ENGINE · MANY HACKATHONS</strong>
            <span>空の入力票、またはWebMCP用ミッションを読み込む。最終的な正は公式ルール。</span>
          </div>
          <button onClick={() => loadProfile("blank")} type="button">
            START BLANK
          </button>
          <button onClick={() => loadProfile("openai-webmcp-challenge-2026")} type="button">
            LOAD WEBMCP MISSION
          </button>
        </div>

        {hasLoadedProfile && !detailsOpen ? (
          <section className="mission-summary" aria-label="読み込んだミッションの要約">
            <dl className="mission-summary-meta">
              <div>
                <dt>HACKATHON</dt>
                <dd title={mission.name}>{mission.name}</dd>
              </div>
              <div>
                <dt>TRACK</dt>
                <dd title={mission.track}>{mission.track}</dd>
              </div>
              <div>
                <dt>DEADLINE</dt>
                <dd title={mission.deadline}>{formatDeadline(mission.deadline)}</dd>
              </div>
            </dl>
            <div className="mission-summary-grid">
              <MissionSummaryItem featured label="MISSION" value={mission.brief} />
              <MissionSummaryItem label="REQUIRED PROOF" value={mission.rules} />
              <MissionSummaryItem label="JUDGING" value={mission.judgingCriteria} />
              <MissionSummaryItem label="CONSTRAINTS" value={mission.constraints} />
              <MissionSummaryItem label="AVAILABLE HANDS" value={mission.availableAI} />
              <MissionSummaryItem label="CANDIDATE" value={mission.candidateIdeas} />
              <MissionSummaryItem label="DI SUA MANO · HUMAN BOUNDARY" value={mission.humanBoundary} />
            </div>
          </section>
        ) : (
          <div className="mission-editor">
            <div className="mission-short-fields">
              <label>
                Hackathon
                <input
                  name="name"
                  onChange={(event) => updateMission("name", event.target.value)}
                  value={mission.name}
                />
              </label>
              <label>
                Track
                <input
                  name="track"
                  onChange={(event) => updateMission("track", event.target.value)}
                  value={mission.track}
                />
              </label>
              <label>
                Launch window
                <input
                  name="deadline"
                  onChange={(event) => updateMission("deadline", event.target.value)}
                  value={mission.deadline}
                />
              </label>
            </div>

            <MissionField
              label="Mission"
              name="brief"
              onChange={updateMission}
              rows={5}
              value={mission.brief}
            />
            <div className="mission-two-column">
              <MissionField
                label="Rules and required deliverables"
                name="rules"
                onChange={updateMission}
                value={mission.rules}
              />
              <MissionField
                label="Judging criteria"
                name="judgingCriteria"
                onChange={updateMission}
                value={mission.judgingCriteria}
              />
              <MissionField
                label="Constraints"
                name="constraints"
                onChange={updateMission}
                value={mission.constraints}
              />
              <MissionField
                label="Available hands"
                name="availableAI"
                onChange={updateMission}
                value={mission.availableAI}
              />
              <MissionField
                label="Candidate ideas or explicit deferral"
                name="candidateIdeas"
                onChange={updateMission}
                value={mission.candidateIdeas}
              />
              <MissionField
                label="DI SUA MANO · human boundary"
                name="humanBoundary"
                onChange={updateMission}
                value={mission.humanBoundary}
              />
            </div>
          </div>
        )}

        {mission.planningStatus === "error" && (
          <div className="mission-error" role="alert">
            FERMO · {mission.planningError}
          </div>
        )}

        <div className="mission-actions">
          {hasLoadedProfile && (
            <button
              aria-expanded={detailsOpen}
              className="mission-detail-toggle"
              onClick={() => setDetailsOpen((open) => !open)}
              type="button"
            >
              {detailsOpen ? "要約に戻る" : "詳細を編集"}
            </button>
          )}
          <button
            className="mission-submit"
            disabled={
              mission.planningStatus === "loading" ||
              state.firmaPending !== null
            }
            type="submit"
          >
            <span>
              {mission.status === "adopted" ? "REPLAN WORKSHOP" : "FORGE WORKSHOP"}
            </span>
            <small>
              {mission.planningStatus === "loading"
                ? "CAPOBOTTEGA IS DRAWING…"
                : state.firmaPending
                  ? "RESOLVE FIRMA FIRST"
                  : "CAPOBOTTEGA · STRICT PLAN"}
            </small>
          </button>
        </div>
      </form>

      {mission.draftPlan && (
        <PlanDraft
          onAdopt={onAdopt}
          onDiscard={onDiscard}
          plan={mission.draftPlan}
        />
      )}

      {mission.status === "adopted" && !mission.draftPlan && (
        <section className="adopted-contract">
          <span>REVISION {String(state.cartone.revision).padStart(2, "0")}</span>
          <h2>{state.contract.objective}</h2>
          <dl>
            <div>
              <dt>Track</dt>
              <dd>{state.contract.track}</dd>
            </div>
            <div>
              <dt>Human hand</dt>
              <dd>{state.contract.humanRule}</dd>
            </div>
            <div>
              <dt>Affresco rule</dt>
              <dd>{state.contract.irreversibleRule}</dd>
            </div>
          </dl>
        </section>
      )}
    </section>
  );
}
