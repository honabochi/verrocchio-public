# 今夜の撮影ハンドオフ

このファイルが、帰宅後の開始地点です。上から順に進めてください。
公開・YouTubeアップロード・Devpost提出は、この撮影では行いません。

## 今の到達点

- 公開サイトと公開リポジトリは到達可能です。
- 正式評価ランは、固定7問とDOM比較2件を記録済みです。
- Devpostには `VERROCCHIO` の**下書き**がありますが、最終提出はされていません。
- 動画台本、3つの貼付プロンプト、英語字幕、YouTube説明文案は準備済みです。
- 今夜のOwner作業は、実WebMCP画面を4本の短いクリップとして撮ることです。

## 帰宅後、最初にやること

まず水分を取って、この文だけ実行します。

> Macで集中モードをオンにし、VERROCCHIOを使う新しい空のChatGPT/Codex会話を開く。

古い評価をやり直したり、コードを直したり、Devpostを開いたりしないでください。

## 0. 撮影前チェック（約8分）

1. Macの**集中モード**をオンにする。
2. メール、Slack、LINE、カレンダー、1Password、ターミナル、DevToolsを閉じる。
3. ブラウザの不要なタブとブックマークバーを隠す。
4. 新しい空のChatGPT/Codex会話を使う。サイドバーとタスク名は録画範囲に入れない。
5. 公開サイトを開く。
   `https://verrocchio-workshop.honabochi.chatgpt.site/`
6. Challenge missionを読み込み、画面上部の `WEBMCP READY` を確認する。
7. 画面の文字が読める大きさにする。細い左右分割にせず、必要に応じて
   hostとproductを全幅で切り替える。
8. `Shift + Command + 5` →「オプション」→ 使用するマイクを選び、5秒だけ
   テスト録画する。再生して声が聞こえれば削除してよい。
9. 録画範囲は、必要なhost結果とVERROCCHIOだけに絞る。メニューバー、
   Dock、プロフィール画像、他タブ、アカウント名を入れない。

**開始してよい状態**

- [ ] `WEBMCP READY` が見える
- [ ] 合成・デモ用ミッションであり、個人情報がない
- [ ] マイク音声が聞こえる
- [ ] 画面に秘密、通知、他タブ、個人名、メールアドレスがない

1つでもNoなら、録画を始めず直します。秘密らしき値は私へ見せないでください。

## 1. Clip 1を撮る（目安30秒）

録画開始前に、次をhostの入力欄へ貼り、**未送信**にします。

```text
Inspect the workshop. Tell me what proof is missing and the smallest next step. Leave approval, proof checks, and submission to me.
```

1. `Shift + Command + 5`で録画開始。
2. 2秒以内に送信。
3. 実際の `inspect_workshop` と、返った `MANCA` / `NEXT` を見せる。
4. 次を話す。

> VERROCCHIO helps a solo builder return after an interruption. The host uses
> WebMCP to inspect live workshop state, not guess from the page layout. It
> finds missing proof, the smallest next step, and the decisions that must stay
> with me.

5. 結果が読める状態で録画停止。`clip-1-inspect.mov` として保存。

## 2. Clip 2を撮る（目安45秒）

Clip 1と同じミッション状態のまま、次を入力欄へ貼り、未送信にします。

```text
Using the current mission, create the smallest valid plan in Japanese. Do not publish. Leave FIRMA to me.
```

1. 録画開始後、すぐ送信。
2. 実際の `propose_workshop_draft` と `FIRMA REQUIRED` を見せる。
3. 未署名で止まっている状態を1秒見せる。
4. 次を話す。

> Now the host proposes the smallest valid plan through WebMCP. VERROCCHIO
> checks the live version, proof gates, plan size, and retry key. The plan is
> still unsigned. A good AI answer is not approval, and the agent has no tool
> to adopt it.

5. 自分で `署名して計画を採用 / GIVE FIRMA & ADOPT` を押す。
6. 採用済み計画とactive work packetを見せながら、次を話す。

> I read the scope and risks, then give FIRMA in the human interface. This is a
> visible decision, not a hidden prompt.

7. `clip-2-firma.mov` として保存。

## 3. Clip 3を撮る（目安35秒）

active work packetがあることを確認し、次を入力欄へ貼り、未送信にします。

```text
Inspect the active work. Do the smallest local task. Return the result with what changed, the check performed, an evidence reference, and the remaining risk. Do not approve it, publish it, or submit it.
```

1. 録画開始後、すぐ送信。
2. 実際のtool callと返却結果を見せる。
3. `CLAIMED / 人間の確認待ち` と、`MANCA`がまだ開いている状態を見せる。
4. 次を話す。

> The active packet says what to do, what to check, and when to stop. The agent
> returns a structured claim with an evidence reference and remaining risk.
> MANCA stays open. The result is CLAIMED, not VERIFIED, because an agent
> response is not proof.

5. `clip-3-claimed.mov` として保存。

**ここで失敗した場合**

1回だけクリーンなミッションから再試行します。それでも本物の`CLAIMED`が出なければ、
Clip 3は採用せず、台本の「Safe fallback」で終えます。偽の結果は作りません。

## 4. Clip 4を撮る（目安20秒）

1. `CLAIMED`の人間レビュー画面を開く。
2. `VERIFY CLAIM` と `REQUEST CHANGES` を見せるが、どちらも押さない。
3. 次を話す。

> I can verify the evidence or send the work back. WebMCP gives the host four
> bounded, state-aware calls: inspect, stop, propose, and return a claim.
> Approval, proof checks, publishing, and submission stay human. VERROCCHIO is
> a disciplined team of one.

4. `clip-4-close.mov` として保存。

## 5. 4本をつなぐ（Mac標準QuickTime）

1. `clip-1-inspect.mov` をQuickTime Playerで開く。
2. メニューの「編集」→「クリップを末尾に追加」を選ぶ。
3. Clip 2、Clip 3、Clip 4の順に追加する。
4. 待ち時間だけが長いクリップ端は短くする。tool callと結果の因果は切らない。
5. `VERROCCHIO-WebMCP-demo-v1.mov` として保存。
6. 必要なら「ファイル」→「書き出す」→「1080p」を選ぶ。
7. 最初から最後まで通常速度で一度見る。

## 撮り直し判定

次のどれかがあれば、そのクリップだけ撮り直します。

- 最初の10〜15秒に動く製品と実WebMCP callが出ない
- tool名、結果、`FIRMA REQUIRED`、`CLAIMED`が読めない
- 画面と話した内容が違う
- AIがFIRMAや証拠確認をしたように見える
- 個人情報、秘密、通知、他タブ、履歴、アカウント情報が映る
- 3分以上、無音、または重要な字幕が読めない

発音の小さな揺れ、短い言い直し、少しの待ちは撮り直し理由にしません。明瞭さを優先します。

## 完成したら、ここへ戻る

YouTubeへ自分でアップロードする前に、このタスクへ次の一文を送ってください。

> 動画4本を撮って結合した。YouTube前チェックGO

可能なら完成動画のローカルファイルを添付してください。私は内容、長さ、字幕、
公開説明文、次のOwner操作を確認します。Googleアカウント画面、YouTube Studioの
個人情報、秘密、Cookie、メールアドレスは添付しないでください。

## Do not redo

- 117テスト、正式7ケース評価、DOM比較、Deep Security Scanを撮影のために再実行しない。
- コード、公開サイト、公開リポジトリを見栄え目的で変更しない。
- Devpostの最終提出、YouTube公開、最終tagはまだ行わない。
- 合格クリップ取得後は、見栄えだけを理由に実WebMCP flowを繰り返さない。

## 現在の停止地点

準備物は完成。次のOwner actionは、帰宅後に集中モードをオンにしてClip 1を始めること。
再開トリガーは「動画4本を撮って結合した。YouTube前チェックGO」です。
