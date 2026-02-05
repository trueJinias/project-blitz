
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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

export async function downloadImage(url, filename) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);

        const buffer = Buffer.from(await res.arrayBuffer());

        const contentType = res.headers.get('content-type');
        let ext = '.jpg';
        if (contentType && contentType.includes('png')) ext = '.png';
        if (contentType && contentType.includes('webp')) ext = '.webp';

        if (!filename.endsWith(ext)) filename += ext;

        const outputPath = path.join('public/images/articles', filename);
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ Image saved to: ${outputPath}`);
        return `/images/articles/${filename}`; // Return relative path for markdown
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

    // Find first organic item link (starts with item.rakuten.co.jp)
    // We look for href="https://item.rakuten.co.jp/..." inside an anchor tag
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
