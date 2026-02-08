
import fs from 'fs';
import { execFileSync } from 'child_process';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0BWLD2N5M&Format=_SL1500_&ID=AsinImage&MarketPlace=JP'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0935BS6DZ&Format=_SL1500_&ID=AsinImage&MarketPlace=US'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B008I25368&Format=_SL1500_&ID=AsinImage&MarketPlace=US'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0CJQ6ZMC2&Format=_SL1500_&ID=AsinImage&MarketPlace=IN'
    }
];

const download = (url, filepath) => {
    try {
        console.log(`⬇️  Downloading ${filepath}...`);
        // execFileSync avoids shell escaping issues
        execFileSync('curl', ['-L', '-f', '-o', filepath, url], { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 2000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                return true;
            } else {
                console.log(`⚠️  Too small: ${filepath} (${stats.size} bytes)`);
                fs.unlinkSync(filepath);
                return false;
            }
        }
        return false;
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
        // If curl -f fails (404), it throws
        return false;
    }
};

const main = () => {
    for (const img of targets) {
        if (fs.existsSync(`public/images/products/${img.name}`) && fs.statSync(`public/images/products/${img.name}`).size > 2000) {
            console.log(`🆗 Exists: ${img.name}`);
            continue;
        }
        download(img.url, `public/images/products/${img.name}`);
    }
};

main();
