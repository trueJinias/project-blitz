
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import matter from 'gray-matter';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-flash-latest'; // Fallback to latest stable flash

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const targetFile = process.argv[2];

if (!targetFile) {
    console.error('❌ Please specify a file path.');
    console.log('Usage: node scripts/localize.mjs src/content/articles/my-article.md');
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

        console.log(`🤖 Localizing article: ${frontmatter.title || 'Untitled'}...`);
        console.log(`Using model: ${MODEL}`);

        const prompt = `
You are a professional tech editor for a popular US tech blog (like The Verge or Android Authority).
Your task is to REWRITE the following Japanese tech article for a US audience.

**Localization Rules:**
1. **Target Audience**: US tech enthusiasts.
2. **Context**: Change "Japan release" context to "US/Global release" or "Import Guide".
   - If the device is not sold in the US (like many Xiaomi phones), frame it as "Is it worth importing?" or "Global Version Review".
3. **Currency**: Convert all JPY prices to USD. Use approximate market rates ($1 = 150 JPY) BUT prioritize actual US/Global MSRP if known.
   - Example: "6,999 yuan" -> "~$970" (not just direct conversion, consider import markup).
4. **Tone**: Casual, authoritative, engaging. Use American English spelling (flavor, color).
5. **Structure**: Keep the markdown structure (headers, tables, images).
   - IMPORTANT: Preserve the original image paths exactly as they are.
   - You can change headers to be more punchy.
6. **Frontmatter**:
   - Keys must be strictly LOWERCASE (title, description, genre, etc.).
   - "genre" must be one of: "tech", "lifestyle", "review", "news".
   - "image" path must be exactly the same as original.
   - Translate the title to be catchy. **MUST BE QUOTED**.
   - Translate the description. **MUST BE QUOTED**.
   - Keep current date and author.
   - **IMPORTANT**: If values contain colons (:), they MUST be enclosed in double quotes.

**Original Article (Japanese):**
Title: ${frontmatter.title}
Description: ${frontmatter.description}
Content:
${content}

**Output Format:**
Return ONLY the localized Markdown content (including frontmatter). Do not include colloquial introductions like "Here is the article".
`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Log only first 200 chars to avoid buffer overflow/crash
            const shortError = errorText.substring(0, 500);
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText}\n${shortError}...`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            throw new Error('No content generated from Gemini API');
        }

        const localizedText = data.candidates[0].content.parts[0].text;

        // Clean up response if it contains markdown code blocks
        // Clean up response if it contains markdown code blocks
        // Remove ```markdown\n ... \n``` or just ``` ... ```
        const cleanText = localizedText
            .replace(/^```[a-z]*\r?\n/, '') // Remove opening fence
            .replace(/\r?\n```$/, '')        // Remove closing fence
            .trim();                         // Remove extra whitespace

        // Determine output path
        const fileName = path.basename(filePath);
        // Add -us suffix if not present, preventing double suffix
        const baseName = fileName.replace('.md', '');
        const newBaseName = baseName.endsWith('-us') ? baseName : `${baseName}-us`;
        const newFileName = `${newBaseName}.md`;

        // Ensure we are outputting to the correct directory
        // If input is in src/content/articles, output to src/content/articles/en-us
        // If input is already in en-us, just overwrite or save alongside (logic here assumes input is source)

        let outputDir;
        if (filePath.includes('en-us')) {
            // If running on already localized file, save in same dir
            outputDir = path.dirname(filePath);
        } else {
            // Default to src/content/articles/en-us
            outputDir = path.join(process.cwd(), 'src/content/articles/en-us');
        }

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
