
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import matter from 'gray-matter';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-exp-1206' });

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
   - Translate the title to be catchy.
   - Translate the description.
   - Keep other fields (date, genre, tags, image, author).

**Original Article (Japanese):**
Title: ${frontmatter.title}
Description: ${frontmatter.description}
Content:
${content}

**Output Format:**
Return ONLY the localized Markdown content (including frontmatter). Do not include colloquial introductions like "Here is the article".
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const localizedText = response.text();

        // Clean up response if it contains markdown code blocks
        const cleanText = localizedText.replace(/^```markdown\n/, '').replace(/\n```$/, '');

        // Determine output path
        const fileName = path.basename(filePath);
        // Add -us suffix if not present
        const newFileName = fileName.replace('.md', '-us.md').replace('-us-us', '-us');
        const outputDir = path.join(process.cwd(), 'src/content/articles/en-us');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, newFileName);

        fs.writeFileSync(outputPath, cleanText, 'utf-8');

        console.log(`✅ Localization complete! Saved to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Localization failed:', error);
        process.exit(1);
    }
}

localizeArticle();
