const TOTAL_STEPS = 7;

function hasPendingClaim(state) {
  return state.gates?.some((gate) =>
    gate.claims?.some((claim) => claim.status === "CLAIMED"),
  );
}

function allProofVerified(state) {
  return Boolean(state.gates?.length) && state.gates.every((gate) => gate.done);
}

function guide(step, actor, title, detail, success, view, prompt = "") {
  return { step, total: TOTAL_STEPS, actor, title, detail, success, view, prompt };
}

export function deriveWorkshopGuide(state, webMcpStatus = "unavailable") {
  if (!state.mission?.profileId || state.mission.profileId === "blank") {
    return guide(
      1,
      "HUMAN",
      "まず、対象ハッカソンを工房へ入れる。",
      "WebMCP用ミッションを読み込むか、公式ルール・締切・人間境界を入力します。",
      "対象イベント、締切、目的、人間だけの判断が読める。",
      "contratto",
    );
  }

  if (webMcpStatus !== "ready") {
    return guide(
      2,
      "SYSTEM",
      "WebMCPが使える場所で工房を開く。",
      "ChatGPT内ブラウザまたはWebMCP対応ブラウザで開き、上部がREADYになるまで待ちます。",
      "上部に WEBMCP READY と表示される。",
      "contratto",
    );
  }

  if (state.firmaPending) {
    return guide(
      4,
      "HUMAN",
      "不可逆な一手を、承認するか止める。",
      `「${state.firmaPending.title}」の目的、影響、戻せなさを確認します。`,
      "納得した場合だけFIRMAし、違和感があれば停止を維持する。",
      "giornate",
    );
  }

  if (state.mission?.draftPlan) {
    return guide(
      4,
      "HUMAN",
      "未署名計画を読んで、FIRMAか破棄を選ぶ。",
      "目的、MANCA、リスク、範囲変化を読み、AIの案をそのまま承認しません。",
      "FIRMAまでは mission.status が adopted にならない。",
      "contratto",
    );
  }

  if (hasPendingClaim(state)) {
    return guide(
      6,
      "HUMAN",
      "返ってきた主張を、確認か差し戻しに分ける。",
      "内容が今も正しい、証拠から再現できる、残るリスクを許容できる——3点を見ます。",
      "VERIFIED または CHANGES_REQUESTED になり、CLAIMEDが残らない。",
      "giornate",
    );
  }

  if (state.isHeld) {
    return guide(
      4,
      "HUMAN",
      "FERMOの理由を解消してから再開する。",
      "不確実性が残るなら再開せず、目的・証拠・範囲を修正します。",
      "停止理由が解消したと説明できる場合だけRESUMEする。",
      "giornate",
    );
  }

  if (allProofVerified(state)) {
    return guide(
      7,
      "HUMAN",
      "提出前の最終確認を行う。",
      "必須項目、リンク、公開範囲、動画、提出控えをCENACOLOで確認します。",
      "すべてのMANCAが閉じ、提出内容を人間が読み返している。",
      "cenacolo",
    );
  }

  if (state.mission?.status !== "adopted") {
    return guide(
      3,
      "AI",
      "ChatGPT/Codexから、未署名の最小計画を返す。",
      "AIは工房を点検し、証拠ゲートと作業を組み立てます。FIRMAは人間に残します。",
      "画面に『計画はまだ乾いていない』と表示される。",
      "contratto",
      "工房を点検して、次の最小計画を日本語で作り、未署名案として提出して。FIRMAは私に残して。",
    );
  }

  const activeStroke = state.cartone?.strokes?.find(
    (stroke) => stroke.status === "active",
  );
  if (activeStroke) {
    return guide(
      5,
      "AI",
      `次の一手「${activeStroke.title}」を実行して結果を返す。`,
      "AIは変更内容、確認、証拠の場所、残るリスクをCLAIMEDとして返します。",
      "MANCAは減らず、人間の証拠確認待ちになる。",
      "cartone",
      "工房の次の作業を点検して、境界内で実行し、結果を証拠主張として返して。承認はしないで。",
    );
  }

  return guide(
    5,
    "AI",
    "次の作業を再計画する。",
    "完了済みの証拠を保持したまま、残るMANCAだけを閉じる計画を作ります。",
    "完了証拠が消えず、新しい未署名計画が表示される。",
    "contratto",
    "完了済みの証拠を保持して、残るMANCAだけを閉じる最小の再計画を未署名案として提出して。",
  );
}
