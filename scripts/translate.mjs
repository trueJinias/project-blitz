import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

async function translateText(text) {
    if (!text || !text.trim()) return text;
    const result = await translator.translateText(text, null, 'EN-US');
    return result.text;
}

async function main() {
    const filePath = process.argv[2];

    if (!filePath) {
        console.log('使用方法: npm run translate <ファイルパス>');
        process.exit(1);
    }

    console.log(`\n🌐 翻訳開始: ${path.basename(filePath)}`);

    const content = fs.readFileSync(filePath, 'utf-8');

    // frontmatterと本文の分離
    const parts = content.split(/---[\r\n]+/);
    const frontmatter = parts[1];
    const body = parts.slice(2).join('---\n');

    // titleとdescriptionを翻訳
    const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
    const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);

    console.log('🔄 タイトル翻訳中...');
    const translatedTitle = titleMatch ? await translateText(titleMatch[1]) : '';
    console.log(`✅ タイトル: ${translatedTitle}`);

    console.log('🔄 説明文翻訳中...');
    const translatedDesc = descMatch ? await translateText(descMatch[1]) : '';
    console.log(`✅ 説明: ${translatedDesc.substring(0, 50)}...`);

    // frontmatterを更新
    let newFrontmatter = frontmatter
        .replace(/title:\s*"([^"]+)"/, `title: "${translatedTitle}"`)
        .replace(/description:\s*"([^"]+)"/, `description: "${translatedDesc}"`);

    // 本文を翻訳
    console.log('🔄 本文翻訳中（これには時間がかかります）...');
    const translatedBody = await translateText(body);
    console.log('✅ 本文翻訳完了');

    // ファイルを保存
    const enPath = filePath.replace(/\\articles\\/g, '\\articles\\en-us\\').replace(/\/articles\//g, '/articles/en-us/');
    const enDir = path.dirname(enPath);

    if (!fs.existsSync(enDir)) {
        fs.mkdirSync(enDir, { recursive: true });
    }

    const output = `---\n${newFrontmatter}---\n\n${translatedBody}`;
    fs.writeFileSync(enPath, output, 'utf-8');

    console.log(`\n✨ 翻訳完了！`);
    console.log(`📁 保存先: ${enPath}`);
}

main().catch(err => {
    console.error('❌ エラー:', err.message);
    process.exit(1);
});
