import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.DEEPL_API_KEY;

console.log('テスト開始...');
console.log('APIキー長:', apiKey?.length);
console.log('最初の10文字:', apiKey?.substring(0, 10));

// DeepL無料アカウントはキーの最後に :fx が必要
const finalKey = apiKey?.endsWith(':fx') ? apiKey : `${apiKey}:fx`;

try {
    const translator = new deepl.Translator(finalKey);
    const result = await translator.translateText('こんにちは', null, 'EN-US');
    console.log('✅ 翻訳成功:', result.text);
} catch (error) {
    console.error('❌ エラー:', error.message);
    console.error('詳細:', error);
}
