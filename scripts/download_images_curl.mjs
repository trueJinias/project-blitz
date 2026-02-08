
import fs from 'fs';
import { execSync } from 'child_process';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        // Try Rakuten first with referer, then a generic fallback if needed
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg',
        referer: 'https://item.rakuten.co.jp/',
        fallback: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=600&auto=format&fit=crop'
    },
    {
        name: 'conair-steamer.jpg',
        // BedBathBeyond failed? Try YouTube High Res
        url: 'https://img.youtube.com/vi/zwMmxaegO5S/maxresdefault.jpg',
        fallback: 'https://img.youtube.com/vi/zwMmxaegO5S/hqdefault.jpg'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://img.youtube.com/vi/W4L5Ty_DY4c/maxresdefault.jpg',
        fallback: 'https://img.youtube.com/vi/W4L5Ty_DY4c/hqdefault.jpg'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://img.youtube.com/vi/PyyxOTi1MKc/maxresdefault.jpg',
        fallback: 'https://img.youtube.com/vi/PyyxOTi1MKc/hqdefault.jpg'
    }
];

const download = (url, referer, filepath) => {
    try {
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`✅ Skipping good file: ${filepath}`);
            return true;
        }

        console.log(`⬇️  Downloading ${filepath}...`);
        // -L follows redirects. -H for referer. -A for user agent.
        const cmd = `curl -L -A "Mozilla/5.0" -H "Referer: ${referer || ''}" -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 2000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                return true;
            } else {
                console.log(`⚠️  File too small: ${filepath} (${stats.size} bytes)`);
                fs.unlinkSync(filepath);
                return false;
            }
        }
        return false;
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
        return false;
    }
};

const main = () => {
    targets.forEach(img => {
        let success = download(img.url, img.referer, `public/images/products/${img.name}`);
        if (!success && img.fallback) {
            console.log(`🔄 Trying fallback for ${img.name}...`);
            download(img.fallback, '', `public/images/products/${img.name}`);
        }
    });
};

main();
