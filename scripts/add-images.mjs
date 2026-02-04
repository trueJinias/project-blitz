#!/usr/bin/env node
/**
 * AI Image Auto-insertion Script
 * 
 * 記事ファイルを読み込み、自動で画像を検索・挿入する
 * 
 * Usage: node scripts/add-images.mjs <article-path>
 * Example: node scripts/add-images.mjs src/content/articles/desk-setup-gadgets.md
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================
// Configuration
// ============================================

const CONFIG = {
    maxInlineImages: 3,
    imageWidth: 800,
    downloadDir: 'public/images/articles',
};

// ============================================
// Image Search APIs (with fallback)
// ============================================

/**
 * Search images using Unsplash API
 */
async function searchUnsplash(query) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
        console.log('⚠️  UNSPLASH_ACCESS_KEY not set, skipping...');
        return null;
    }

    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
        const response = await fetch(url, {
            headers: { Authorization: `Client-ID ${accessKey}` }
        });

        if (response.status === 403) {
            console.log('⚠️  Unsplash rate limit exceeded');
            return null;
        }

        if (!response.ok) return null;

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            return {
                url: photo.urls.regular,
                alt: photo.alt_description || query,
                credit: `Photo by ${photo.user.name} on Unsplash`,
                source: 'unsplash'
            };
        }
    } catch (error) {
        console.log('⚠️  Unsplash API error:', error.message);
    }
    return null;
}

/**
 * Search images using Pexels API
 */
async function searchPexels(query) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        console.log('⚠️  PEXELS_API_KEY not set, skipping...');
        return null;
    }

    try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
        const response = await fetch(url, {
            headers: { Authorization: apiKey }
        });

        if (response.status === 429) {
            console.log('⚠️  Pexels rate limit exceeded');
            return null;
        }

        if (!response.ok) return null;

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            const photo = data.photos[0];
            return {
                url: photo.src.large,
                alt: photo.alt || query,
                credit: `Photo by ${photo.photographer} on Pexels`,
                source: 'pexels'
            };
        }
    } catch (error) {
        console.log('⚠️  Pexels API error:', error.message);
    }
    return null;
}

/**
 * Search images using Pixabay API
 */
async function searchPixabay(query) {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
        console.log('⚠️  PIXABAY_API_KEY not set, skipping...');
        return null;
    }

    try {
        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=3&orientation=horizontal&image_type=photo`;
        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
            const photo = data.hits[0];
            return {
                url: photo.largeImageURL,
                alt: query,
                credit: `Image from Pixabay`,
                source: 'pixabay'
            };
        }
    } catch (error) {
        console.log('⚠️  Pixabay API error:', error.message);
    }
    return null;
}

/**
 * Search image with fallback strategy
 */
async function searchImage(query) {
    console.log(`🔍 Searching image for: "${query}"`);

    // Try Unsplash first
    let result = await searchUnsplash(query);
    if (result) {
        console.log(`✅ Found on Unsplash`);
        return result;
    }

    // Fallback to Pexels
    result = await searchPexels(query);
    if (result) {
        console.log(`✅ Found on Pexels`);
        return result;
    }

    // Fallback to Pixabay
    result = await searchPixabay(query);
    if (result) {
        console.log(`✅ Found on Pixabay`);
        return result;
    }

    console.log(`❌ No image found for: "${query}"`);
    return null;
}

// ============================================
// Article Processing
// ============================================

/**
 * Parse frontmatter and content from markdown
 */
function parseMarkdown(content) {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!frontmatterMatch) {
        throw new Error('Invalid markdown: no frontmatter found');
    }

    const frontmatterStr = frontmatterMatch[1];
    const body = frontmatterMatch[2];

    // Parse frontmatter (simple YAML parser)
    const frontmatter = {};
    frontmatterStr.split(/\r?\n/).forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();

            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Parse arrays
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(s =>
                    s.trim().replace(/^["']|["']$/g, '')
                );
            }

            frontmatter[key] = value;
        }
    });

    return { frontmatter, body, frontmatterStr };
}

/**
 * Extract H2 sections from markdown body
 */
function extractH2Sections(body) {
    const sections = [];
    const lines = body.split(/\r?\n/);
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
        if (line.startsWith('## ')) {
            if (currentSection) {
                sections.push({
                    heading: currentSection,
                    content: currentContent.join('\n'),
                    startLine: currentSection
                });
            }
            currentSection = line.substring(3).trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }

    if (currentSection) {
        sections.push({
            heading: currentSection,
            content: currentContent.join('\n'),
            startLine: currentSection
        });
    }

    return sections;
}

// Japanese to English keyword mapping for better image search
const KEYWORD_MAP = {
    // Devices
    'スマートフォン': 'smartphone',
    'スマホ': 'smartphone',
    '携帯': 'mobile phone',
    'タブレット': 'tablet',
    'パソコン': 'computer',
    'ノートPC': 'laptop',
    'ヘッドホン': 'headphones',
    'イヤホン': 'earbuds',
    'キーボード': 'keyboard',
    'マウス': 'mouse',
    'モニター': 'monitor',
    'カメラ': 'camera',
    'レンズ': 'lens',
    'ガジェット': 'gadget technology',
    // Brands
    'Xiaomi': 'Xiaomi smartphone',
    'シャオミ': 'Xiaomi smartphone',
    'iPhone': 'iPhone',
    'Samsung': 'Samsung phone',
    'Sony': 'Sony electronics',
    'Apple': 'Apple device',
    // Topics
    '価格': 'price tag money',
    'レビュー': 'review hands-on',
    '比較': 'comparison versus',
    'スペック': 'specifications tech',
    'バッテリー': 'battery charging',
    '充電': 'charging cable',
    'デスク': 'desk workspace',
    'リモートワーク': 'work from home office',
    '生産性': 'productivity workspace',
    // Actions
    '購入': 'shopping buy',
    'おすすめ': 'recommendation best',
    '方法': 'how to guide',
    '使い方': 'how to use tutorial',
    // General
    '日本': 'Japan',
    '2026': 'technology 2026',
    '最新': 'latest new',
    'プロ': 'professional pro',
    'Ultra': 'flagship premium',
};

/**
 * Translate Japanese keywords to English for better image search
 */
function translateToEnglish(text) {
    let result = text;
    for (const [ja, en] of Object.entries(KEYWORD_MAP)) {
        if (result.includes(ja)) {
            result = result.replace(ja, en);
        }
    }
    // Remove remaining Japanese characters for cleaner search
    result = result.replace(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g, ' ');
    return result.trim().replace(/\s+/g, ' ');
}

/**
 * Generate search query from article metadata
 */
function generateThumbnailQuery(frontmatter) {
    const parts = [];

    // Use first tag as primary search term
    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
        parts.push(frontmatter.tags[0]);
        if (frontmatter.tags[1]) {
            parts.push(frontmatter.tags[1]);
        }
    }

    const query = parts.join(' ') || 'technology';
    return translateToEnglish(query);
}

/**
 * Generate search query for inline images based on section and article context
 */
function generateSectionQuery(heading, frontmatter) {
    const parts = [];

    // Add main topic from tags
    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
        parts.push(frontmatter.tags[0]);
    }

    // Add section-specific context
    parts.push(heading);

    const query = parts.join(' ');
    const translated = translateToEnglish(query);

    // If translation is too short, add generic tech context
    if (translated.split(' ').length < 2) {
        return translated + ' technology';
    }

    return translated;
}

/**
 * Download image and save to public folder
 */
async function downloadImage(imageData, filename) {
    const downloadDir = path.join(PROJECT_ROOT, CONFIG.downloadDir);

    // Ensure directory exists
    await fs.mkdir(downloadDir, { recursive: true });

    const ext = imageData.url.includes('.png') ? '.png' : '.jpg';
    const filepath = path.join(downloadDir, `${filename}${ext}`);

    try {
        const response = await fetch(imageData.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(filepath, buffer);

        console.log(`💾 Saved: ${filepath}`);
        return `/images/articles/${filename}${ext}`;
    } catch (error) {
        console.log(`⚠️  Failed to download image: ${error.message}`);
        return imageData.url; // Use direct URL as fallback
    }
}

/**
 * Insert images into markdown content
 */
function insertImagesIntoMarkdown(frontmatterStr, body, thumbnailPath, inlineImages) {
    // Update frontmatter with thumbnail
    let newFrontmatter = frontmatterStr;
    if (thumbnailPath) {
        newFrontmatter = newFrontmatter.replace(
            /image:\s*"?[^"\n]*"?/,
            `image: "${thumbnailPath}"`
        );
    }

    // Insert inline images after H2 headings
    let newBody = body;
    for (const { heading, imagePath, alt, credit } of inlineImages) {
        const h2Pattern = new RegExp(`(## ${escapeRegex(heading)}\r?\n\r?\n)([^\n]+)`);
        const imageMarkdown = `\n\n![${alt}](${imagePath})\n*${credit}*\n\n`;

        newBody = newBody.replace(h2Pattern, (match, h2, firstPara) => {
            return `${h2}${firstPara}${imageMarkdown}`;
        });
    }

    return `---\n${newFrontmatter}\n---\n${newBody}`;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// Main
// ============================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node scripts/add-images.mjs <article-path>');
        console.log('Example: node scripts/add-images.mjs src/content/articles/desk-setup-gadgets.md');
        process.exit(1);
    }

    const articlePath = path.resolve(PROJECT_ROOT, args[0]);
    console.log(`\n📄 Processing: ${articlePath}\n`);

    // Read article
    const content = await fs.readFile(articlePath, 'utf-8');
    const { frontmatter, body, frontmatterStr } = parseMarkdown(content);

    console.log(`📝 Title: ${frontmatter.title}`);
    console.log(`🏷️  Tags: ${frontmatter.tags?.join(', ') || 'none'}\n`);

    // Get article slug for image filenames
    const slug = path.basename(articlePath, '.md');

    // 1. Get thumbnail image
    let thumbnailPath = null;
    if (!frontmatter.image || frontmatter.image === '') {
        console.log('🖼️  Searching for thumbnail...');
        const query = generateThumbnailQuery(frontmatter);
        const imageData = await searchImage(query);

        if (imageData) {
            thumbnailPath = await downloadImage(imageData, `${slug}-thumbnail`);
        }
    } else {
        console.log('ℹ️  Thumbnail already set, skipping...');
    }

    // 2. Get inline images for H2 sections
    const sections = extractH2Sections(body);
    const inlineImages = [];

    console.log(`\n📑 Found ${sections.length} H2 sections`);

    // Skip first (intro) and last (summary) sections, limit to max images
    const sectionsToProcess = sections
        .slice(1, -1)
        .slice(0, CONFIG.maxInlineImages);

    for (const section of sectionsToProcess) {
        console.log(`\n📌 Section: "${section.heading}"`);

        // Check if section already has an image
        if (section.content.includes('![')) {
            console.log('ℹ️  Section already has image, skipping...');
            continue;
        }

        const query = generateSectionQuery(section.heading, frontmatter);
        const imageData = await searchImage(query);

        if (imageData) {
            const filename = `${slug}-${inlineImages.length + 1}`;
            const imagePath = await downloadImage(imageData, filename);

            inlineImages.push({
                heading: section.heading,
                imagePath,
                alt: imageData.alt,
                credit: imageData.credit
            });
        }
    }

    // 3. Write updated content
    if (thumbnailPath || inlineImages.length > 0) {
        const newContent = insertImagesIntoMarkdown(
            frontmatterStr,
            body,
            thumbnailPath,
            inlineImages
        );

        await fs.writeFile(articlePath, newContent, 'utf-8');
        console.log(`\n✅ Updated: ${articlePath}`);
        console.log(`   - Thumbnail: ${thumbnailPath ? 'Added' : 'Unchanged'}`);
        console.log(`   - Inline images: ${inlineImages.length} added`);
    } else {
        console.log('\n⚠️  No images added (no API keys or no results)');
    }
}

main().catch(console.error);
