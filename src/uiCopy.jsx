export const terms = {
  contratto: { primary: "CONTRATTO", assist: "実行条件", lang: "it" },
  cartone: { primary: "CARTONE", assist: "作業計画", lang: "it" },
  giornate: { primary: "GIORNATE", assist: "実行工程", lang: "it" },
  cenacolo: { primary: "CENACOLO", assist: "最終確認", lang: "it" },
  evidence: { primary: "EVIDENCE", assist: "証拠台帳", lang: "en" },
  manca: { primary: "MANCA", assist: "未確認の証拠", lang: "it" },
  firma: { primary: "FIRMA", assist: "人間の承認", lang: "it" },
  fermo: { primary: "FERMO", assist: "停止", lang: "it" },
  consegna: { primary: "CONSEGNA", assist: "提出承認", lang: "it" },
  capobottega: { primary: "CAPOBOTTEGA", assist: "計画役", lang: "it" },
  oltremare: { primary: "OLTREMARE", assist: "集中時間", lang: "it" },
  affresco: { primary: "AFFRESCO", assist: "不可逆作業", lang: "it" },
};

export const sections = {
  missionIntake: { primary: "MISSION INTAKE", assist: "ミッション入力", lang: "en" },
  oneEngine: { primary: "ONE ENGINE · MANY HACKATHONS", assist: "共通の実行工房", lang: "en" },
  humanCheckpoint: { primary: "HUMAN CHECKPOINT", assist: "人間が証拠を確認", lang: "en" },
  handoff: { primary: "HANDOFF", assist: "作業の引き継ぎ", lang: "en" },
  externalReview: { primary: "EXTERNAL REVIEW", assist: "外部レビュー", lang: "en" },
  backwardSchedule: { primary: "BACKWARD SCHEDULE", assist: "締切から逆算", lang: "en" },
  risks: { primary: "RISKS", assist: "残るリスク", lang: "en" },
  attachProof: { primary: "ATTACH PROOF", assist: "証拠を添付", lang: "en" },
  returnWorkshop: { primary: "RETURN TO THE WORKSHOP", assist: "工房へ結果を返す", lang: "en" },
};

export const fields = {
  hackathon: { primary: "HACKATHON", assist: "対象イベント", lang: "en" },
  track: { primary: "TRACK", assist: "応募枠", lang: "en" },
  deadline: { primary: "DEADLINE", assist: "締切", lang: "en" },
  launchWindow: { primary: "LAUNCH WINDOW", assist: "締切", lang: "en" },
  mission: { primary: "MISSION", assist: "目的", lang: "en" },
  requiredProof: { primary: "REQUIRED PROOF", assist: "必要な成果物", lang: "en" },
  judging: { primary: "JUDGING", assist: "審査基準", lang: "en" },
  constraints: { primary: "CONSTRAINTS", assist: "制約", lang: "en" },
  availableHands: { primary: "AVAILABLE HANDS", assist: "使える手", lang: "en" },
  candidate: { primary: "CANDIDATE", assist: "提出候補", lang: "en" },
  humanBoundary: { primary: "DI SUA MANO · HUMAN BOUNDARY", assist: "人間だけが行う判断", lang: "it" },
  reviewer: { primary: "REVIEWER", assist: "レビュー担当", lang: "en" },
  workshopRole: { primary: "WORKSHOP ROLE", assist: "工房での役割", lang: "en" },
  verdict: { primary: "VERDICT", assist: "判定", lang: "en" },
  finding: { primary: "FINDING", assist: "重要な指摘", lang: "en" },
  risks: { primary: "RISKS", assist: "リスク", lang: "en" },
  nextStroke: { primary: "RECOMMENDED NEXT STROKE", assist: "次に行う作業", lang: "en" },
  evidenceReference: { primary: "EVIDENCE OR CONVERSATION URL", assist: "証拠または会話URL", lang: "en" },
  evidenceNote: { primary: "EVIDENCE NOTE OR URL", assist: "証拠メモまたはURL", lang: "en" },
  changed: { primary: "WHAT CHANGED", assist: "変更内容", lang: "en" },
  verification: { primary: "VERIFICATION PERFORMED", assist: "確認したこと", lang: "en" },
  resultEvidence: { primary: "EVIDENCE PATH, URL, OR RESPONSE ID", assist: "証拠の場所", lang: "en" },
  remainingRisk: { primary: "REMAINING RISK", assist: "残るリスク", lang: "en" },
  proposedWork: { primary: "PROPOSED WORK", assist: "検討する作業", lang: "en" },
  changesReason: { primary: "WHY THIS NEEDS CHANGES", assist: "差し戻す理由", lang: "en" },
};

export const actions = {
  startBlank: { primary: "START BLANK", assist: "空で始める", lang: "en" },
  loadMission: { primary: "LOAD WEBMCP MISSION", assist: "ミッションを読み込む", lang: "en" },
  forgeWorkshop: { primary: "ASK HOST AI", assist: "GPT/Codexに計画を頼む", lang: "en" },
  replanWorkshop: { primary: "ASK HOST TO REPLAN", assist: "GPT/Codexに再計画を頼む", lang: "en" },
  discard: { primary: "DISCARD", assist: "下書きを破棄", lang: "en" },
  adoptPlan: { primary: "GIVE FIRMA & ADOPT", assist: "署名して計画を採用", lang: "en" },
  beginWork: { primary: "BEGIN GIORNATA", assist: "作業を開始する", lang: "en" },
  beginStroke: { primary: "BEGIN", assist: "この作業を開始", lang: "en" },
  resumeWork: { primary: "RESUME GIORNATA", assist: "作業を再開する", lang: "en" },
  workActive: { primary: "GIORNATA ACTIVE", assist: "作業中", lang: "en" },
  callFermo: { primary: "CALL FERMO", assist: "停止する", lang: "en" },
  fermoActive: { primary: "FERMO ACTIVE", assist: "停止中", lang: "en" },
  askCapobottega: { primary: "ASK CAPOBOTTEGA", assist: "計画役に相談する", lang: "en" },
  giveFirma: { primary: "GIVE FIRMA", assist: "人間が承認する", lang: "en" },
  lockedByFirma: { primary: "LOCKED BY FIRMA", assist: "人間の承認待ち", lang: "en" },
  capobottegaHeld: { primary: "CAPOBOTTEGA HELD", assist: "計画役も停止中", lang: "en" },
  returnResult: { primary: "RETURN RESULT", assist: "結果を返す", lang: "en" },
  verifyClaim: { primary: "VERIFY CLAIM", assist: "証拠主張を確認する", lang: "en" },
  requestChanges: { primary: "REQUEST CHANGES", assist: "差し戻す", lang: "en" },
  confirmChanges: { primary: "RETURN FOR REVISION", assist: "理由を付けて差し戻す", lang: "en" },
  copyPacket: { primary: "COPY PACKET", assist: "作業票をコピー", lang: "en" },
  exportJson: { primary: "EXPORT JSON", assist: "台帳を書き出す", lang: "en" },
  signConsegna: { primary: "SIGN CONSEGNA", assist: "提出を承認する", lang: "en" },
  consegnaLocked: { primary: "CONSEGNA LOCKED", assist: "証拠がまだ不足", lang: "en" },
  classifyStroke: { primary: "CLASSIFY THE STROKE", assist: "次の作業を分類する", lang: "en" },
  attachEvidence: { primary: "ATTACH EVIDENCE", assist: "証拠を添付する", lang: "en" },
  attachResult: { primary: "ATTACH RESULT", assist: "結果を記録する", lang: "en" },
  returnReview: { primary: "RETURN REVIEW TO CENACOLO", assist: "レビューを円卓へ返す", lang: "en" },
  cancel: { primary: "CANCEL", assist: "キャンセル", lang: "en" },
};

export const statuses = {
  webMcpReady: { primary: "WEBMCP READY", assist: "AI操作可能", lang: "en" },
  webMcpUnavailable: { primary: "WEBMCP UNAVAILABLE", assist: "通常操作", lang: "en" },
  firmaRequired: { primary: "FIRMA REQUIRED", assist: "人間の承認待ち", lang: "en" },
  fermoActive: { primary: "FERMO ACTIVE", assist: "停止中", lang: "en" },
  active: { primary: "ACTIVE", assist: "実行中", lang: "en" },
  queued: { primary: "QUEUED", assist: "待機", lang: "en" },
  done: { primary: "DONE", assist: "完了", lang: "en" },
};

export function DualLabel({ as: Tag = "span", className = "", copy }) {
  return (
    <Tag className={`dual-label ${className}`.trim()}>
      <span className="dual-label-primary" lang={copy.lang}>
        {copy.primary}
      </span>
      <small className="dual-label-assist" lang="ja">
        {copy.assist}
      </small>
    </Tag>
  );
}

export function ActionLabel({ copy }) {
  return (
    <span aria-hidden="true" className="action-copy">
      <span className="action-copy-ja" lang="ja">
        {copy.assist}
      </span>
      <small className="action-copy-primary" lang={copy.lang}>
        {copy.primary}
      </small>
    </span>
  );
}

export function actionAria(copy) {
  return `${copy.assist} · ${copy.primary}`;
}
