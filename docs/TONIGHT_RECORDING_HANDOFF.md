# VERROCCHIO 撮影ハンドオフ — 完了記録

この撮影工程は完了しました。以前の「4本を撮る」手順は再実行しません。

## 完成したもの

- `VERROCCHIO-WebMCP-demo-v1.mov` — 70.12秒、1440×900、日本語音声付き
- `VERROCCHIO-WebMCP-demo-v1.en.srt` — 英語字幕10キュー
- `VERROCCHIO-narration-ja.wav` — Kokoroによる日本語合成音声
- `docs/DEMO_CAPTIONS_EN.srt` — 公開用SRTと同じ追跡版
- `evidence/demo-recording-2026-09-03.json` — 非秘密のローカル証跡

## 確認済み

- 3分未満で、映像と音声の両トラックがある。
- `inspect → 未署名計画 → 人間のFIRMA → CLAIMED → 人間レビュー` の順で進む。
- `CLAIMED`でもMANCAが開いたままで、レビュー用の2ボタンは押されていない。
- 英語字幕は00:01.000から01:08.000までで、動画の終端より前に終わる。
- Ownerは通常速度で日本語音声と字幕の対応を確認済み。

## まだ行わないこと

- 撮影の見栄えだけを理由に、正式7ケース評価・DOM比較・Deep Security Scanを再実行しない。
- 動画、リポジトリ、サイトを公開しない。
- annotated tagを作らない。
- Devpostへ最終提出しない。

## 次の外部ゲート

ローカル整合が終わった後、Ownerが別途明示的に許可した場合のみ、同じrevisionを
tag、GitHub、公開サイトへ反映します。その後にYouTubeを非公開でアップロードし、
Owner確認を経て公開します。最後にDevpostのOwner専用項目を読み戻し、FIRMA後に
手動提出します。
