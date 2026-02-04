# アフィリエイト記事作成スキル

1. keywords.csv から未作成のキーワードを1つ選ぶ。
2. Browser Agentを使用して、そのキーワードの上位3サイトを分析。
3. 競合にない「独自の視点」を1つ追加した記事構成を作成。
4. `.agent/rules/writer_policy.md` に従って、1,500文字程度の記事（Markdown形式）を `src/content/articles/` フォルダに生成。
5. 生成した記事に画像を自動挿入：
   // turbo
   ```
   node scripts/add-images.mjs src/content/articles/{記事ファイル名}.md
   ```