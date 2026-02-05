
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { exec } from 'child_process';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ==========================================
// Settings
// ==========================================
const SETTINGS = {
    // Elegant, calm background colors (Soft Grays/Beiges)
    bgColors: [
        '#F5F5F7', // Apple Light Gray
        '#EBEBEB', // Neutral Gray
        '#F2F0EB', // Soft Beige
        '#E8E8ED', // Cool White
    ],
    width: 1200,
    height: 630, // OGP Ratio
    padding: 0.8, // Product occupies 80% of height
};

async function fetchHtml(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        return await res.text();
    } catch (e) {
        // console.error(`❌ Network error: ${e.message}`);
        return null;
    }
}

function extractImage(html, url) {
    // 1. Try OGP (Standard)
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) return ogMatch[1];

    // 2. Amazon Specific
    if (url.includes('amazon')) {
        const landingMatch = html.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/i);
        if (landingMatch && landingMatch[1]) return landingMatch[1];

        const blkMatch = html.match(/id=["']imgBlkFront["'][^>]*src=["']([^"']+)["']/i);
        if (blkMatch && blkMatch[1]) return blkMatch[1];

        const dynMatch = html.match(/"large":"(https:\/\/[^"]+\.jpg)"/i);
        if (dynMatch && dynMatch[1]) return dynMatch[1];
    }

    return null;
}

/**
 * Process the image buffer:
 * 1. Save temp file
 * 2. Run isolated bg-remover.mjs
 * 3. Read result or fallback
 * 4. Composite
 */
async function processAndCompositeImage(imageBuffer) {
    console.log('🤖 Removing background (via isolated process)...');

    // Create temp paths
    const tmpDir = os.tmpdir();
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const inputTmp = path.join(tmpDir, `input-${uniqueId}.jpg`);
    const outputTmp = path.join(tmpDir, `output-${uniqueId}.png`);

    let processedBuffer = imageBuffer; // Default to original

    try {
        await fs.writeFileSync(inputTmp, imageBuffer);

        // Call the isolated script
        const scriptPath = path.join(fileURLToPath(import.meta.url), '../../scripts/bg-remover.mjs');

        // Run with timeout (2 mins for potential model download)
        await execPromise(`node "${scriptPath}" "${inputTmp}" "${outputTmp}"`, { timeout: 120000 });

        if (fs.existsSync(outputTmp)) {
            processedBuffer = fs.readFileSync(outputTmp);
            console.log('✨ Background removed. Compositing...');
        } else {
            throw new Error("Output file not created");
        }

    } catch (e) {
        console.error('⚠️ Background removal failed:', e.message);
        if (e.stderr) console.error(e.stderr);
        console.log('↩️  Falling back to original image.');
        // processedBuffer remains raw image
    } finally {
        // Cleanup
        try {
            if (fs.existsSync(inputTmp)) fs.unlinkSync(inputTmp);
            if (fs.existsSync(outputTmp)) fs.unlinkSync(outputTmp);
        } catch (cleanupErr) { /* ignore */ }
    }

    try {
        // 2. Prepare Product Image (Resize to fit)
        const product = sharp(processedBuffer);
        const metadata = await product.metadata();

        // Calculate resize dimensions to fit within padding
        const targetHeight = Math.floor(SETTINGS.height * SETTINGS.padding);
        const targetWidth = Math.floor(SETTINGS.width * SETTINGS.padding);

        const resizedProduct = await product
            .resize({
                height: targetHeight,
                width: targetWidth,
                fit: 'inside', // Maintain Aspect Ratio
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();

        // 3. Create Background
        // Pick a random calm color
        const bgColor = SETTINGS.bgColors[Math.floor(Math.random() * SETTINGS.bgColors.length)];

        const finalImage = await sharp({
            create: {
                width: SETTINGS.width,
                height: SETTINGS.height,
                channels: 4,
                background: bgColor
            }
        })
            .composite([
                {
                    input: resizedProduct,
                    gravity: 'center'
                }
            ])
            .jpeg({ quality: 90 })
            .toBuffer();

        return finalImage;

    } catch (e) {
        console.error('⚠️ Composition failed:', e);
        return imageBuffer;
    }
}

export async function downloadImage(url, filename) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);

        const initialBuffer = Buffer.from(await res.arrayBuffer());

        // Process the image (Background Removal + Composite)
        const finalBuffer = await processAndCompositeImage(initialBuffer);

        // Always save as JPG for consistency now
        const ext = '.jpg';
        if (!filename.endsWith(ext)) filename += ext;

        const outputPath = path.join('public/images/articles', filename);
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, finalBuffer);
        console.log(`✅ Image processed & saved to: ${outputPath}`);
        return `/images/articles/${filename}`;
    } catch (e) {
        console.error(`❌ Download error: ${e.message}`);
        return null;
    }
}

export async function searchRakuten(keyword) {
    console.log(`🔍 Searching Rakuten for: "${keyword}"`);
    const url = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
    const html = await fetchHtml(url);
    if (!html) return null;

    const match = html.match(/href="(https:\/\/item\.rakuten\.co\.jp\/[^"]+)"/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

export async function fetchProductImage(targetUrl, filename) {
    console.log(`🔍 Fetching product page: ${targetUrl}`);
    const html = await fetchHtml(targetUrl);

    if (!html) {
        console.error("❌ Could not retrieve HTML.");
        return null;
    }

    const imageUrl = extractImage(html, targetUrl);

    if (imageUrl) {
        console.log(`🖼 Found Image: ${imageUrl}`);
        return await downloadImage(imageUrl, filename);
    } else {
        console.error("❌ No suitable image found.");
        return null;
    }
}

export async function searchAndFetchProductImage(keyword, filename) {
    const productUrl = await searchRakuten(keyword);
    if (productUrl) {
        return await fetchProductImage(productUrl, filename);
    }
    console.log(`❌ Product not found on Rakuten: ${keyword}`);
    return null;
}

// Main execution if running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    async function main() {
        const targetUrl = process.argv[2];
        const outputName = process.argv[3] || 'product-image';

        if (!targetUrl) {
            console.log("Usage: node scripts/fetch-product-image.mjs <URL> [output-filename]");
            return;
        }

        await fetchProductImage(targetUrl, outputName);
    }
    main();
}
