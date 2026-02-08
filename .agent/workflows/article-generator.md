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
- **文字装飾**: 重要な箇所（青の下線を引きたい箇所）は `**` で囲むこと（例: `**重要ポイント**`）。
  - **注意1: コードブロック（`）で囲まないこと。囲むとアスタリスクが表示されてしまいます。**
  - **注意2: 鍵括弧「」の中身だけを太字にしない。** 
    - ❌ NG: `**「人手不足対策」**として`（括弧がアスタリスクの内側）
    - ✅ OK: `**人手不足対策**として`（括弧なしで太字）
    - ✅ OK: `「人手不足対策」として`（太字なしで括弧）
- **アフィリエイトタブ**: 記事内で具体的な商品（CIO充電器など）を紹介した場合は、必ず `.product-links` 形式のHTMLブロックを挿入し、OGP画像とASINリンクを設定すること。

### 5. 画像自動挿入
生成した記事に画像を自動挿入：
```powershell
node scripts/add-images.mjs src/content/articles/{生成したファイル名}.md
```

### 6. 米国・インド向けローカライズ（内製作成）
**APIスクリプトは使用せず**、Agent自身が内部でローカライズ記事を作成する：
- アイデア（キーワード）を元に、その国（米国・インド）の事情に合わせた独自の構成で記事を作成する。
- 日本語記事の直訳ではなく、カルチャライズ・再構成を行う。
- ファイル作成先：
    - 米国版: `src/content/articles/en-us/{slug}.md`
    - インド版: `src/content/articles/hi-in/{slug}.md`

### 7. 画像自動挿入（全言語）
日本語版同様、作成した米国・インド版記事にも画像を挿入する：
```powershell
node scripts/add-images.mjs src/content/articles/en-us/{生成したファイル名}.md
node scripts/add-images.mjs src/content/articles/hi-in/{生成したファイル名}.md
```

### 8. デプロイ（公開）
最後にデプロイコマンドを実行して公開完了：
```powershell
npm run deploy
```

### 7. 確認
ブラウザで記事を確認：
- ローカル: http://localhost:4321/articles/{slug}
- 本番: https://project-blitz.vercel.app/articles/{slug}

### 8. SNS投稿 (X)
記事がデプロイされたら、Xに自動投稿します。
※ Vercelのビルド完了まで数分待ってから実行することをお勧めします。

```powershell
node scripts/post-to-x.mjs src/content/articles/{生成したファイル名}.md
```
```powershell
node scripts/post-to-x.mjs src/content/articles/{生成したファイル名}.md
```
※ 米国版、インド版（ヒンディー語）の記事も同様に、それぞれのファイルパスを指定して実行すれば、自動的に対象国のアカウントで投稿されます。

### 9. キーワード整理
最後に、使用したキーワードをリストから削除して整理します：
```powershell
node scripts/manage-keywords.mjs remove "{今回のキーワード}"
```

### 10. 完了報告（必須）
ワークフロー完了時には、以下の形式でSNS投稿用のリンクを必ず出力する：
- **公開記事URL**: `https://project-blitz.vercel.app/articles/{slug}`
- **X投稿推奨文**: 記事のタイトル + URL
- **(推奨) AI要約付き投稿リンク生成**:
    以下のコマンドを実行すると、「読みたくなる一文」を含んだX投稿リンク（Intent URL）が生成されます。
    ```powershell
    node scripts/post-to-x.mjs src/content/articles/{生成したファイル名}.md
    ```

