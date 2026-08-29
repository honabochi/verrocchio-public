const oneWeekFromNow = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const blankHackathonProfile = {
  profileId: "blank",
  name: "新しいハッカソン",
  brief:
    "公式ルールを、締切までに検証済みで審査可能な提出物へ変える。",
  rules:
    "参加資格、必須成果物、提出項目、禁止事項を公式ルールから転記する。",
  judgingCriteria:
    "公式の審査基準と配点を記録する。",
  deadline: oneWeekFromNow(),
  track: "未選択",
  constraints:
    "チーム人数、時間、予算、データ、プラットフォーム、公開条件を記録する。",
  availableAI:
    "Codexが実装、CAPOBOTTEGAが計画を担当し、必要に応じてClaudeとGeminiがレビューする。",
  candidateIdeas:
    "提出候補を列挙する。ミッションが固まるまで選定を保留する場合は、その旨を明記する。",
  humanBoundary:
    "人間がWHY、NO、好み、範囲変更、支払い、公開、個人データ、最終提出を担う。工房はHOWを担う。",
};

export const openAIBuildWeekExample = {
  profileId: "openai-build-week-example",
  name: "OpenAI Build Week · example profile",
  brief:
    "ルールから最終提出までの検証可能な履歴を残しながら、動くプロジェクトを完成させる。",
  rules:
    "サンプル。最新の公式ルール、参加資格、必須成果物、リポジトリアクセス、デモ、提出条件へ置き換える。",
  judgingCriteria:
    "サンプル。最新の公式審査基準と配点へ置き換える。",
  deadline: oneWeekFromNow(),
  track: "Developer Tools",
  constraints:
    "すべての要件を公式情報で確認する。外部公開と最終提出にはFIRMAが必要。",
  availableAI:
    "Codex、OpenAI計画ランタイム、必要に応じてClaude FableとGeminiのレビュー役。",
  candidateIdeas:
    "最新のルールと審査基準を記録してからアイデアを評価する。",
  humanBoundary:
    "人間がWHY、NO、好み、範囲変更、支払い、公開、個人データ、最終提出を担う。工房はHOWを担う。",
};

export const webMcpChallengeProfile = {
  profileId: "openai-webmcp-challenge-2026",
  name: "The WebMCP Challenge",
  brief:
    "時間に制約のある個人が、規律あるチームのように動けるようにする。ブラウザエージェントは工房を点検し、不確実なら止まり、成果を主張として返す。承認と証拠の確定は人間に残す。",
  rules:
    "2026年8月25日開始の提出期間中に、既存成果との差分が明確なWebMCP拡張を実装する。審査員が使えるライブURL、ソース・導入手順・明示的なOSSライセンスを含む公開リポジトリ、WebMCPとの適合性・利用体験・人間とエージェントの協働・実装方法を説明する英語文、音声付き3分未満の公開YouTubeデモを提出する。締切後はDevpost提出物、リポジトリ、ライブサイトを変更しない。最終判断は公式ルールを正とする。",
  judgingCriteria:
    "第1段階はテーマ適合と実質的なWebMCP利用の合否判定。第2段階はWebMCP Leverage、Execution、Potential Impact、Creativity & Ambitionの4項目で評価する。公式readbackで比重は確認できていないため、同じ重みとは断定しない。",
  deadline: "2026-09-04T05:00:00+09:00",
  track: "トラックなし",
  constraints:
    "フルタイム勤務の合間、夜間に一人で制作する。短時間で中断・復帰でき、調整負荷が小さく、審査員が実際に使えるデモを優先する。締切は厳しい方のDevpost公式ルールを採用し、9月3日13:00 PDT＝9月4日05:00 JSTとする。公開、デプロイ、リポジトリ公開、最終提出には人間のFIRMAが必要。",
  availableAI:
    "Codexが実装責任者、WebMCPエージェントが範囲を限定した作業者、CAPOBOTTEGAが計画役を担う。必要に応じてClaudeとGeminiを独立レビュー役にする。",
  candidateIdeas:
    "VERROCCHIO：忙しい一人の参加者が、調査・実装・検証・提出を通じて『規律ある一人チーム』として動くための、人間統治つき工房。",
  humanBoundary:
    "エージェントは点検、下書き、停止、証拠主張の返却まで行える。FERMOからの再開、FIRMA、証拠確定、公開、デプロイ、データ開示、提出は人間だけが行う。",
};

export const hackathonProfiles = {
  blank: blankHackathonProfile,
  "openai-build-week-example": openAIBuildWeekExample,
  "openai-webmcp-challenge-2026": webMcpChallengeProfile,
};

export function createHackathonProfile(profileId = "blank") {
  const profile = hackathonProfiles[profileId] || blankHackathonProfile;
  return { ...profile, deadline: profile.deadline || oneWeekFromNow() };
}
