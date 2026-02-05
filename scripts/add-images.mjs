#!/usr/bin/env node
/**
 * AI Image Auto-insertion Script (AI-Powered)
 * 
 * 記事ファイルを読み込み、Gemini APIを使って内容を分析し、
 * 最適なタグと画像検索キーワードを生成して画像を挿入する。
 * 
 * Usage: node scripts/add-images.mjs <article-path>
 */


import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { searchAndFetchProductImage } from './fetch-product-image.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================
// Configuration
// ============================================

const CONFIG = {
    maxInlineImages: 3,
    imageWidth: 800,
    downloadDir: 'public/images/articles',
    model: 'gemini-flash-latest',
};

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not set in .env');
    process.exit(1);
}

// ============================================
// AI Analysis
// ============================================

/**
 * Analyze article content using Gemini API to generate tags and image queries
 */
async function analyzeContent(title, content) {
    console.log('🤖 Analyzing content with AI...');

    const prompt = `
You are an expert editor for a tech/lifestyle/economics blog.
Analyze the following article content and extract:
1. **5 Relevant Tags** (Japanese): Keywords that best describe the article content.
2. **Product Identification**:
   - Is this primarily a **Product Review** or **Product Introduction**? (true/false)
   - If YES, what is the **Exact Product Name**? (e.g., "Xiaomi 14 Ultra", "Anker Nano II 65W")
3. **Image Search Queries** (English):
   - One for the **Thumbnail** (Catchy, representative).
   - One for each **H2 Section** (Contextually relevant).

**Article Title**: ${title}
**Content Snippet**:
${content.substring(0, 2000)}... (truncated)

**H2 Headers**:
${(content.match(/^##\s+(.+)$/gm) || []).join('\n')}

**Output Format (JSON Only):**
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "is_product_review": true,
  "product_name": "Xiaomi 14 Ultra", /* null if not a review */
  "thumbnail_query": "english search query for thumbnail",
  "section_queries": {
    "Header Text 1": "english search query 1",
    "Header Text 2": "english search query 2"
  }
}
Return ONLY valid JSON.
`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.model}:generateContent?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('❌ AI Analysis Failed:', error.message);
        return null;
    }
}

// ============================================
// Image Search APIs
// ============================================

async function searchUnsplash(query) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) return null;
    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
        const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.results?.[0]) {
            return {
                url: data.results[0].urls.regular,
                alt: data.results[0].alt_description || query,
                credit: `Photo by ${data.results[0].user.name} on Unsplash`
            };
        }
    } catch (e) { console.error('Unsplash Error:', e.message); }
    return null;
}

async function searchPexels(query) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return null;
    try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
        const res = await fetch(url, { headers: { Authorization: apiKey } });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.photos?.[0]) {
            return {
                url: data.photos[0].src.large,
                alt: data.photos[0].alt || query,
                credit: `Photo by ${data.photos[0].photographer} on Pexels`
            };
        }
    } catch (e) { console.error('Pexels Error:', e.message); }
    return null;
}

async function searchPixabay(query) {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) return null;
    try {
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=3&orientation=horizontal&image_type=photo`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.hits?.[0]) {
            return {
                url: data.hits[0].largeImageURL,
                alt: query,
                credit: 'Image from Pixabay'
            };
        }
    } catch (e) { console.error('Pixabay Error:', e.message); }
    return null;
}

async function searchImage(query) {
    console.log(`🔍 Searching Stock Photos: "${query}"`);
    let res = await searchUnsplash(query) || await searchPexels(query) || await searchPixabay(query);

    if (!res) {
        console.log('🤖 Generating fallback image...');
        return {
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=600&nologo=true`,
            alt: `${query} (AI Generated)`,
            credit: 'AI Generated'
        };
    }
    return res;
}

// ============================================
// File Operations
// ============================================

async function downloadStockImage(imageData, filename) {
    const downloadDir = path.join(PROJECT_ROOT, CONFIG.downloadDir);
    await fs.mkdir(downloadDir, { recursive: true });

    const ext = imageData.url.includes('.png') ? '.png' : '.jpg';
    const filepath = path.join(downloadDir, `${filename}${ext}`);

    try {
        const res = await fetch(imageData.url);
        const buffer = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(filepath, buffer);
        console.log(`💾 Saved: ${filepath}`);
        return `/images/articles/${filename}${ext}`;
    } catch (e) {
        console.error('Download failed:', e.message);
        return imageData.url;
    }
}

// ============================================
// Main Logic
// ============================================

async function main() {
    const targetFile = process.argv[2];
    if (!targetFile) {
        console.error('Usage: node scripts/add-images.mjs <article-path>');
        process.exit(1);
    }

    const filePath = path.resolve(PROJECT_ROOT, targetFile);
    const contentRaw = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(contentRaw);

    // 1. Analyze Content with AI
    const analysis = await analyzeContent(frontmatter.title, content);
    if (!analysis) return;

    console.log('💡 AI Suggestions:', analysis);

    // 2. Update Tags
    if (analysis.tags) {
        frontmatter.tags = analysis.tags;
    }

    const slug = path.basename(filePath, '.md');
    let modifiedContent = content;

    // 3. Thumbnail
    if (!frontmatter.image) {
        let savedPath = null;

        // Try Product Image if it's a review
        if (analysis.is_product_review && analysis.product_name) {
            console.log(`🛒 Detected Product Review: ${analysis.product_name}`);
            try {
                // Try to search and fetch from Rakuten
                savedPath = await searchAndFetchProductImage(analysis.product_name, `${slug}-thumbnail`);
            } catch (e) {
                console.error('Product fetch failed:', e);
            }
        }

        // Fallback to stock photo
        if (!savedPath) {
            const img = await searchImage(analysis.thumbnail_query);
            savedPath = await downloadStockImage(img, `${slug}-thumbnail`);
        }

        if (savedPath) {
            frontmatter.image = savedPath;
        }
    }

    // 4. Inline Images
    let sectionCount = 0;

    for (const [headerText, query] of Object.entries(analysis.section_queries)) {
        if (sectionCount >= CONFIG.maxInlineImages) break;

        const cleanHeader = headerText.replace(/^##\s*/, '').trim();
        const headerRegex = new RegExp(`^##\\s+${cleanHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`, 'm');

        if (headerRegex.test(modifiedContent) && !modifiedContent.includes(query)) {
            // For inline images, we usually stick to stock photos as product shots might be repetitive
            // unless the section is about a specific feature that stock photos cover well.
            const img = await searchImage(query);
            const savedPath = await downloadStockImage(img, `${slug}-${sectionCount + 1}`);

            modifiedContent = modifiedContent.replace(
                headerRegex,
                `$& \n\n![${img.alt}](${savedPath})\n*${img.credit}*`
            );
            sectionCount++;
        }
    }

    // 5. Write back
    const newFileContent = matter.stringify(modifiedContent, frontmatter);
    await fs.writeFile(filePath, newFileContent);
    console.log(`✅ Article updated: ${filePath}`);
}

main().catch(console.error);

