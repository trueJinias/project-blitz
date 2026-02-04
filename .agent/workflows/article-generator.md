---
description: キーワードから記事を自動生成し、画像を自動挿入するワークフロー
---

# アフィリエイト記事自動生成ワークフロー

// turbo-all

## 前提条件
- `.env` ファイルに画像APIキーが設定済み
- `npm run dev` でサーバーが起動中

## 手順

### 1. キーワード選択
`keywords.csv` から未作成のキーワードを1つ選ぶ。
- 既存の記事と重複しないか `src/content/articles/` を確認

### 2. 競合分析
Browser Agentを使用して、選択したキーワードの上位3サイトを分析：
- 記事構成（見出し、セクション）
- 強調しているポイント
- 不足している視点

### 3. 記事構成作成
競合にない「独自の視点」を1つ追加した記事構成を作成：
- H2見出し5-7個
- 各セクションの要点

### 4. 記事生成
`.agent/rules/writer_policy.md` の形式に従って記事を生成：
- ファイル名: `src/content/articles/{slug}.md`
- 文字数: 約1,500文字
- frontmatter含む

### 5. 画像自動挿入
生成した記事に画像を自動挿入：
```powershell
node scripts/add-images.mjs src/content/articles/{生成したファイル名}.md
```

### 6. 米国向けローカライズ
生成した日本語記事を米国向けに自動変換：
```powershell
node scripts/localize.mjs src/content/articles/{生成したファイル名}.md
```
※ これで `src/content/articles/en-us/` に英語記事も生成されます。

### 7. デプロイ（公開）
最後にデプロイコマンドを実行して公開完了：
```powershell
npm run deploy
```

### 7. 確認
ブラウザで記事を確認：
- ローカル: http://localhost:4321/articles/{slug}
- 本番: https://project-blitz.vercel.app/articles/{slug}
