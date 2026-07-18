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

function PlanDraft({ plan, onAdopt, onDiscard }) {
  return (
    <section className="plan-draft" aria-labelledby="plan-draft-title">
      <header>
        <div>
          <span>AFFRESCO · {plan.humanAction.replaceAll("_", " ")}</span>
          <h2 id="plan-draft-title">The plan is still wet.</h2>
        </div>
        <div className="plan-counts">
          <strong>{String(plan.gates.length).padStart(2, "0")}</strong>
          <span>MANCA gates</span>
          <strong>{String(plan.strokes.length).padStart(2, "0")}</strong>
          <span>work strokes</span>
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
}) {
  const { mission } = state;
  const updateMission = (field, value) =>
    setState((current) => ({
      ...current,
      mission: { ...current.mission, [field]: value },
    }));

  const submit = (event) => {
    event.preventDefault();
    onGenerate();
  };

  return (
    <section className="document-view mission-view">
      <header>
        <span>01</span>
        <h1>CONTRATTO</h1>
        <p>
          Rules enter here. A signed execution workshop leaves here.
        </p>
      </header>

      <form className="mission-form" onSubmit={submit}>
        <div className="mission-form-heading">
          <div>
            <span>MISSION INTAKE</span>
            <h2>What must reach CONSEGNA?</h2>
          </div>
          <p>
            Capture the closed world: deadline, proof, constraints, available
            hands, and the decisions that remain human.
          </p>
        </div>

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

        {mission.planningStatus === "error" && (
          <div className="mission-error" role="alert">
            FERMO · {mission.planningError}
          </div>
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
                : "GPT-5.6 SOL · STRICT PLAN"}
          </small>
        </button>
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
