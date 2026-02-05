
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import matter from 'gray-matter';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash-latest';

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const targetFile = process.argv[2];
const targetLocale = process.argv[3] || 'en-us'; // Default to en-us, accept 'en-in'

if (!targetFile) {
    console.error('❌ Please specify a file path.');
    console.log('Usage: node scripts/localize.mjs <file-path> [locale: en-us|en-in]');
    process.exit(1);
}

const LOCALE_CONFIG = {
    'en-us': {
        audience: 'US tech enthusiasts',
        currency: 'USD',
        rate: '150 JPY', // $1
        currencySymbol: '$',
        context: 'US/Global release or Import Guide',
        spelling: 'American English',
        suffix: '-us'
    },
    'en-in': {
        audience: 'Indian tech enthusiasts',
        currency: 'INR',
        rate: '0.55 JPY', // 1 JPY = ~0.55 INR (Reciprocal: 1 INR = ~1.8 JPY) -> Logic below
        currencySymbol: '₹',
        context: 'India launch, Global import, or "Grey Market" availability',
        spelling: 'British/Indian English (e.g. colour, centre)',
        suffix: '-in'
    }
};

const config = LOCALE_CONFIG[targetLocale];
if (!config) {
    console.error(`❌ Unsupported locale: ${targetLocale}. Supported: ${Object.keys(LOCALE_CONFIG).join(', ')}`);
    process.exit(1);
}

async function localizeArticle() {
    try {
        const filePath = path.resolve(targetFile);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        console.log(`🤖 Localizing article (${targetLocale}): ${frontmatter.title || 'Untitled'}...`);

        const prompt = `
You are a professional tech editor for a popular ${config.audience} blog.
Your task is to REWRITE the following Japanese tech article for a **${config.audience}**.

**Localization Rules:**
1. **Target Audience**: ${config.audience}.
2. **Context**: Change "Japan release" context to "**${config.context}**".
   - If the device is not sold officially, mention import options or expected launch.
3. **Currency**: Convert JPY/CNY prices to **${config.currency}**.
   - Use approximate market rates.
   - Example (India): "6,999 yuan" -> "~₹85,000" (Estimate based on current rates + tax).
   - Example (US): "6,999 yuan" -> "~$970".
4. **Tone**: Casual, authoritative, engaging. Use **${config.spelling}**.
5. **Structure**: Keep the markdown structure (headers, tables, images).
   - IMPORTANT: Preserve the original image paths exactly as they are.
6. **Frontmatter**:
   - Keys must be strictly LOWERCASE.
   - **CRITICAL: "genre" MUST be EXACTLY "${frontmatter.genre || 'tech'}".**
   - "image" path must be exactly the same as original.
   - Translate title and description to be catchy and culturally relevant. **MUST BE QUOTED**.
   - Keep current date and author.

**Original Article (Japanese):**
Title: ${frontmatter.title}
Description: ${frontmatter.description}
Genre: ${frontmatter.genre || 'tech'}
Content:
${content}

**Output Format:**
Return ONLY the localized Markdown content (including frontmatter).
`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

        let response;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (response.status === 429) {
                    console.log(`⏳ Rate limit hit. Retrying in ${(retries + 1) * 10} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, (retries + 1) * 10000));
                    retries++;
                    continue;
                }

                break; // specific break if success or other error
            } catch (e) {
                console.error("Fetch error:", e);
                break;
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText}\n${errorText.substring(0, 500)}`);
        }

        const data = await response.json();
        const localizedText = data.candidates[0]?.content?.parts[0]?.text;

        if (!localizedText) throw new Error('No content generated');

        const cleanText = localizedText
            .replace(/^```[a-z]*\r?\n/, '')
            .replace(/\r?\n```$/, '')
            .trim();

        // Determine output path
        const fileName = path.basename(filePath);
        const baseName = fileName.replace(/-us\.md|-in\.md|\.md$/, ''); // Strip existing suffixes
        const newFileName = `${baseName}${config.suffix}.md`;

        const outputDir = path.join(process.cwd(), `src/content/articles/${targetLocale}`);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, newFileName);
        fs.writeFileSync(outputPath, cleanText, 'utf-8');

        console.log(`✅ Localization complete! Saved to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Localization failed:', error.message);
        process.exit(1);
    }
}

localizeArticle();

