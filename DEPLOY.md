# デプロイ手順ガイド

このガイドでは、Astroブログサイトを**Vercel**または**Netlify**にGitHub経由でデプロイする方法を説明します。

---

## 事前準備

プロジェクトをGitHubにプッシュします：

```powershell
cd "c:\Users\sanad\OneDrive\Desktop\Project Blitz"

# Gitリポジトリを初期化（まだの場合）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Astro blog site"

# GitHubリポジトリを作成後、リモートを追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# プッシュ
git branch -M main
git push -u origin main
```

---

## 方法1: Vercel（推奨）

### 手順

1. **Vercelにアクセス**
   - https://vercel.com にアクセス
   - GitHubアカウントでログイン

2. **新規プロジェクト作成**
   - 「Add New」→「Project」をクリック
   - GitHubリポジトリをインポート

3. **自動検出**
   - Vercelは自動的にAstroを検出
   - 設定はそのままでOK（`vercel.json`が適用されます）

4. **デプロイ**
   - 「Deploy」をクリック
   - 数分でデプロイ完了

### デプロイ後

`astro.config.mjs`の`site`を実際のURLに更新：
```javascript
site: 'https://your-project-name.vercel.app'
```

---

## 方法2: Netlify

### 手順

1. **Netlifyにアクセス**
   - https://app.netlify.com にアクセス
   - GitHubアカウントでログイン

2. **新規サイト作成**
   - 「Add new site」→「Import an existing project」
   - GitHubを選択してリポジトリを選ぶ

3. **ビルド設定**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - （`netlify.toml`が自動適用されます）

4. **デプロイ**
   - 「Deploy site」をクリック

---

## 自動デプロイ

GitHubにプッシュするたびに自動でデプロイされます：

```powershell
# 変更を加えた後
git add .
git commit -m "Add new article"
git push
```

---

## 作成済みの設定ファイル

| ファイル | 用途 |
|----------|------|
| `vercel.json` | Vercel用設定 |
| `netlify.toml` | Netlify用設定 |
| `.gitignore` | Vercel/Netlifyキャッシュ除外済み |
