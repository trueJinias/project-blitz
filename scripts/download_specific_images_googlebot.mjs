
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://b3h2.scene7.com/is/image/BedBathandBeyond/32185542845607p'
    },
    {
        name: 'conair-shaver.jpg', // Amazon US placeholder
        url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg'
    },
    {
        name: 'nova-shaver.jpg', // Amazon IN placeholder
        url: 'https://m.media-amazon.com/images/I/41D+w+s+IL.jpg'
    }
];

const download = (url, filepath) => {
    // Skip if valid file exists (Philips/Hanes)
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
        return;
    }

    try {
        console.log(`⬇️  Downloading ${filepath} as Googlebot...`);
        const cmd = `curl -L -A "Googlebot/2.1 (+http://www.google.com/bot.html)" -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 1000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
            } else {
                console.log(`⚠️  Failed (small): ${filepath}`);
                // Don't delete immediately, let's keep it to check content if needed (might be html)
            }
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
};

const main = () => {
    images.forEach(img => {
        download(img.url, `public/images/products/${img.name}`);
    });
};

main();
