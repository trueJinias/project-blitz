import * as dotenv from 'dotenv';
dotenv.config();

console.log('DeepL APIキー:', process.env.DEEPL_API_KEY ? '設定済み（' + process.env.DEEPL_API_KEY.substring(0, 10) + '...)' : '未設定');
console.log('Unsplash:', process.env.UNSPLASH_ACCESS_KEY ? '設定済み' : '未設定');
