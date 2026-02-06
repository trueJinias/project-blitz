
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import matter from 'gray-matter';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-flash-latest';

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env');
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
    'hi-in': {
        audience: 'Hindi-speaking Indian tech enthusiasts',
        currency: 'INR',
        rate: '0.55 JPY',
        currencySymbol: '₹',
        context: 'India launch, Global import, or "Grey Market" availability',
        spelling: 'Hindi (Devanagari script), Use English for technical terms where common (e.g. "Smartphone", "Processor")',
        suffix: '-in' // Note: This will result in [slug]-in.md, likely inside hi-in folder
    }
};

// Main execution
const articlePath = process.argv[2];
const specificTarget = process.argv[3]; // Optional: e.g. 'en-us' or 'hi-in'
const LOCALE_LIST = ['en-us', 'hi-in'];

if (!articlePath) {
    console.error('❌ Usage: node scripts/localize.mjs <src/content/articles/path/to/article.md> [target-locale]');
    process.exit(1);
}

(async () => {
    if (specificTarget) {
        // Single target mode
        await localizeArticle(articlePath, specificTarget);
    } else {
        // Bulk mode: Localize to all supported locales (except source 'ja' if implicit)
        console.log(`🌍 Localizing for all targets: ${LOCALE_LIST.join(', ')}`);
        for (const locale of LOCALE_LIST) {
            try {
                await localizeArticle(articlePath, locale);
            } catch (error) {
                console.error(`❌ Global error processing ${locale}:`, error);
                // Continue to next locale even if one fails
            }
        }
    }
})();

// Config check moved inside function


async function localizeArticle(filePathStr, locale) {
    try {
        const filePath = path.resolve(filePathStr);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Get config for this specific locale execution
        const currentConfig = LOCALE_CONFIG[locale];
        if (!currentConfig) {
            console.error(`❌ Unsupported locale: ${locale}`);
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        console.log(`🤖 Localizing article (${locale}): ${frontmatter.title || 'Untitled'}...`);

        const prompt = `
You are a professional tech editor for a popular ${currentConfig.audience} blog.
Your task is to **WRITE A BRAND NEW ARTICLE** for **${currentConfig.audience}** based on the topic and facts from the provided Japanese source text.

**CRITICAL INSTRUCTION: DO NOT TRANSLATE.**
- Use the provided Japanese text ONLY as a source of facts/specs/rumors.
- Write a completely original article tailored to the ${currentConfig.audience} context.
- The structure and flow should be natural for an English speaker in that region.

**Market Adaptation Rules:**
1. **Target Audience**: ${currentConfig.audience}.
2. **Context**: Change "Japan release" context to "**${currentConfig.context}**".
   - **US Market**: Compare with iPhone, Samsung Galaxy, and Google Pixel. Focus on "Is it worth importing?" or "Global release hopes".
   - **India Market**: Compare with OnePlus, iQOO, Realme, and Samsung. Focus on "Value for Money", "Heating issues (hot climate)", and "Service center availability".
3. **Currency**: Convert JPY/CNY prices to **${currentConfig.currency}**.
   - Use approximate market rates.
   - Example (India): "6,999 yuan" -> "~₹85,000" (Estimate based on current rates + tax).
   - Example (US): "6,999 yuan" -> "~$970".
4. **Tone**: Casual, authoritative, engaging. Use **${currentConfig.spelling}**.
5. **Structure**: You may change the H2 headers to better suit the market, but keep the overall length similar (~1500 words).
   - **IMAGES**: You MUST include the exact same image links \`![alt](/path/to/image.jpg)\` from the source text at appropriate places.
6. **Frontmatter**:
   - Keys must be strictly LOWERCASE.
   - **CRITICAL: "genre" MUST be EXACTLY "${frontmatter.genre || 'tech'}".**
   - "image" path must be exactly the same as original.
   - Generate a **NEW Title** and **Description** that clicks with ${currentConfig.audience}. **MUST BE QUOTED**.
   - Keep current date and author.

**Source Information (Japanese):**
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
        const newFileName = `${baseName}${currentConfig.suffix}.md`;

        const outputDir = path.join(process.cwd(), `src/content/articles/${locale}`);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, newFileName);
        fs.writeFileSync(outputPath, cleanText, 'utf-8');

        console.log(`✅ Localization complete! Saved to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Localization failed:', error.message);
        // Do not process.exit(1) here to allow loop to continue in bulk mode
        throw error;
    }
}

// Auto-executed by IIFE above

