import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-flash-latest';

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const TARGET_DIRS = [
    path.join(process.cwd(), 'src/content/articles/en-us'),
    path.join(process.cwd(), 'src/content/articles/hi-in')
];

function hasJapanese(text) {
    if (!text) return false;
    // Range for Hiragana, Katakana, Kanji
    const jpRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;
    return jpRegex.test(text);
}

async function translateProduct(productName, locale) {
    const prompt = `
    Translate/Adapt the following product name for Amazon search in ${locale}.
    Remove any "prediction" (予想) labels, Japanese characters, or unnecessary descriptive text. 
    It should be the clean product keyword.
    
    Input: "${productName}"
    
    Output (Text only, no markdown):
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text?.trim();
        return text || productName;
    } catch (e) {
        console.error("Translation failed:", e);
        return productName;
    }
}

async function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const locale = path.basename(dir);

    console.log(`Checking ${locale} (${files.length} files)...`);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileMatter = matter(content);

        const currentProduct = fileMatter.data.product;

        if (currentProduct && hasJapanese(currentProduct)) {
            console.log(`  🇯🇵 Found JP chars in product: "${currentProduct}" (${file})`);
            const translated = await translateProduct(currentProduct, locale);

            if (translated !== currentProduct) {
                fileMatter.data.product = translated;
                const newContent = matter.stringify(fileMatter.content, fileMatter.data);
                fs.writeFileSync(filePath, newContent);
                console.log(`  ✅ Updated to: "${translated}"`);

                // Rate limit buffer
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }
}

(async () => {
    for (const dir of TARGET_DIRS) {
        await processDirectory(dir);
    }
    console.log("Done.");
})();
