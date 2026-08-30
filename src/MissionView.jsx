import { useState } from "react";
import { createHackathonProfile } from "./hackathonProfiles";
import {
  actionAria,
  ActionLabel,
  actions,
  DualLabel,
  fields,
  sections,
  terms,
} from "./uiCopy";

function MissionField({ copy, name, value, onChange, rows = 3 }) {
  return (
    <label>
      <DualLabel className="field-caption" copy={copy} />
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

function MissionSummaryItem({ copy, value, featured = false }) {
  return (
    <article className={featured ? "is-featured" : ""} title={value}>
      <DualLabel className="summary-caption" copy={copy} />
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
        <span><b>OWNER</b> FIRMA・証拠確認・CONSEGNA</span>
        <span><b>保証範囲</b> 役割分離であり、ページ単独の本人認証ではありません</span>
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
          <DualLabel as="h3" copy={terms.contratto} />
          <strong>{plan.contract.objective}</strong>
          <small>{plan.contract.deadline}</small>
        </div>
        <div>
          <DualLabel as="h3" copy={terms.manca} />
          <ol>
            {plan.gates.map((gate) => (
              <li key={gate.id}>
                <strong>{gate.title}</strong>
                <span>{gate.proofRequired}</span>
              </li>
            ))}
          </ol>
        </div>
        <div aria-label="採用前に確認する全作業ストローク">
          <DualLabel as="h3" copy={terms.cartone} />
          <ol>
            {plan.strokes.map((stroke) => (
              <li key={stroke.id}>
                <strong>{stroke.title}</strong>
                <span>
                  {stroke.classification} · {stroke.role} · MANCA {stroke.gateId}
                </span>
                <span>{stroke.outcome}</span>
                <span>必要な証拠: {stroke.evidenceExpected}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <DualLabel as="h3" copy={sections.risks} />
          <ol>
            {plan.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ol>
        </div>
      </div>
      <footer>
        <span>
          {plan.model} · {plan.responseId} · scope {plan.scopeEffect} ·
          計画採用とAFFRESCO実行の承認は別です
        </span>
        <div>
          <button
            aria-label={actionAria(actions.discard)}
            className="dialog-cancel"
            onClick={onDiscard}
            type="button"
          >
            <ActionLabel copy={actions.discard} />
          </button>
          <button
            aria-label={actionAria(actions.adoptPlan)}
            className="plan-adopt"
            onClick={onAdopt}
            type="button"
          >
            <ActionLabel copy={actions.adoptPlan} />
          </button>
        </div>
      </footer>
    </section>
  );
}

export default function MissionView({
  state,
  setState,
  onRequestPlan,
  onImportPlan,
  onAdopt,
  onDiscard,
  webMcpStatus,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [manualPlanText, setManualPlanText] = useState("");
  const [manualPlanError, setManualPlanError] = useState("");
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
    onRequestPlan();
  };

  const importManualPlan = (event) => {
    event.preventDefault();
    try {
      const parsed = JSON.parse(manualPlanText);
      const plan = parsed?.plan || parsed;
      if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
        throw new Error("計画JSONのオブジェクトが必要です。");
      }
      onImportPlan(plan);
      setManualPlanError("");
    } catch (error) {
      setManualPlanError(error?.message || "計画JSONを読み取れませんでした。");
    }
  };

  return (
    <section
      className={`document-view mission-view ${hasLoadedProfile ? "is-profile-loaded" : ""}`}
    >
      <header>
        <span>01</span>
        <DualLabel as="h1" className="document-title" copy={terms.contratto} />
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
            <DualLabel className="section-caption" copy={sections.missionIntake} />
            <h2>CONSEGNAまでに、何を届けるか？</h2>
          </div>
          <p>
            締切、必要な証拠、制約、使える手、そして人間に残す判断を、
            閉じた実行条件として記録する。
          </p>
        </div>

        <div className="profile-switcher" aria-label="Hackathon profile template">
          <div>
            <DualLabel as="strong" className="profile-caption" copy={sections.oneEngine} />
            <span>空の入力票、またはWebMCP用ミッションを読み込む。最終的な正は公式ルール。</span>
          </div>
          <button
            aria-label={actionAria(actions.startBlank)}
            onClick={() => loadProfile("blank")}
            type="button"
          >
            <ActionLabel copy={actions.startBlank} />
          </button>
          <button
            aria-label={actionAria(actions.loadMission)}
            onClick={() => loadProfile("openai-webmcp-challenge-2026")}
            type="button"
          >
            <ActionLabel copy={actions.loadMission} />
          </button>
        </div>

        {hasLoadedProfile && !detailsOpen ? (
          <section className="mission-summary" aria-label="読み込んだミッションの要約">
            <dl className="mission-summary-meta">
              <div>
                <dt><DualLabel copy={fields.hackathon} /></dt>
                <dd title={mission.name}>{mission.name}</dd>
              </div>
              <div>
                <dt><DualLabel copy={fields.track} /></dt>
                <dd title={mission.track}>{mission.track}</dd>
              </div>
              <div>
                <dt><DualLabel copy={fields.deadline} /></dt>
                <dd title={mission.deadline}>{formatDeadline(mission.deadline)}</dd>
              </div>
            </dl>
            <div className="mission-summary-grid">
              <MissionSummaryItem copy={fields.mission} featured value={mission.brief} />
              <MissionSummaryItem copy={fields.requiredProof} value={mission.rules} />
              <MissionSummaryItem copy={fields.judging} value={mission.judgingCriteria} />
              <MissionSummaryItem copy={fields.constraints} value={mission.constraints} />
              <MissionSummaryItem copy={fields.availableHands} value={mission.availableAI} />
              <MissionSummaryItem copy={fields.candidate} value={mission.candidateIdeas} />
              <MissionSummaryItem copy={fields.humanBoundary} value={mission.humanBoundary} />
            </div>
          </section>
        ) : (
          <div className="mission-editor">
            <div className="mission-short-fields">
              <label>
                <DualLabel className="field-caption" copy={fields.hackathon} />
                <input
                  name="name"
                  onChange={(event) => updateMission("name", event.target.value)}
                  value={mission.name}
                />
              </label>
              <label>
                <DualLabel className="field-caption" copy={fields.track} />
                <input
                  name="track"
                  onChange={(event) => updateMission("track", event.target.value)}
                  value={mission.track}
                />
              </label>
              <label>
                <DualLabel className="field-caption" copy={fields.launchWindow} />
                <input
                  name="deadline"
                  onChange={(event) => updateMission("deadline", event.target.value)}
                  value={mission.deadline}
                />
              </label>
            </div>

            <MissionField
              copy={fields.mission}
              name="brief"
              onChange={updateMission}
              rows={5}
              value={mission.brief}
            />
            <div className="mission-two-column">
              <MissionField
                copy={fields.requiredProof}
                name="rules"
                onChange={updateMission}
                value={mission.rules}
              />
              <MissionField
                copy={fields.judging}
                name="judgingCriteria"
                onChange={updateMission}
                value={mission.judgingCriteria}
              />
              <MissionField
                copy={fields.constraints}
                name="constraints"
                onChange={updateMission}
                value={mission.constraints}
              />
              <MissionField
                copy={fields.availableHands}
                name="availableAI"
                onChange={updateMission}
                value={mission.availableAI}
              />
              <MissionField
                copy={fields.candidate}
                name="candidateIdeas"
                onChange={updateMission}
                value={mission.candidateIdeas}
              />
              <MissionField
                copy={fields.humanBoundary}
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
            aria-label={actionAria(
              mission.status === "adopted"
                ? actions.replanWorkshop
                : actions.forgeWorkshop,
            )}
            className="mission-submit"
            disabled={
              mission.planningStatus === "loading" ||
              state.firmaPending !== null
            }
            type="submit"
          >
            <ActionLabel
              copy={
                mission.status === "adopted"
                  ? actions.replanWorkshop
                  : actions.forgeWorkshop
              }
            />
            <small>
              {mission.planningStatus === "awaiting_host"
                ? "このチャットで計画案を依頼してください"
                : state.firmaPending
                  ? "人間の承認を先に完了"
                  : "APIキー不要・計画は未署名で受領"}
            </small>
          </button>
        </div>
      </form>

      {webMcpStatus === "unavailable" &&
        mission.planningStatus === "awaiting_host" &&
        !mission.draftPlan && (
          <form className="manual-plan-import" onSubmit={importManualPlan}>
            <div>
              <span>WEBMCPなしの復旧・比較経路</span>
              <h2>チャットで作った計画JSONを、未署名案として取り込む</h2>
              <p>
                これはFIRMAではありません。検証済みの計画だけを下書き保存し、
                採用・公開・提出は引き続き人間が行います。
              </p>
            </div>
            <label>
              未署名計画JSON
              <textarea
                aria-label="未署名計画JSON"
                onChange={(event) => setManualPlanText(event.target.value)}
                placeholder='{"contract": { ... }, "gates": [ ... ], "strokes": [ ... ]}'
                rows={8}
                value={manualPlanText}
              />
            </label>
            {manualPlanError && (
              <p className="manual-plan-error" role="alert">
                FERMO · {manualPlanError}
              </p>
            )}
            <button disabled={!manualPlanText.trim()} type="submit">
              検証して未署名計画にする
            </button>
          </form>
        )}

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
