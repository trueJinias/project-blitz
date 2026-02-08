
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0BWLD2N5M&Format=_SL1500_&ID=AsinImage&MarketPlace=JP',
        backup: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg'
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
        console.log(`⬇️  Downloading ${filepath} from Widget...`);
        // -L for redirects, -f to fail on 404/server errors
        execSync(`curl -L -f -o "${filepath}" "${url}"`, { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 2000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                return true;
            } else {
                console.log(`⚠️  File too small (likely pixel/error): ${filepath} (${stats.size} bytes)`);
                fs.unlinkSync(filepath);
                return false;
            }
        }
    } catch (e) {
        console.log(`❌ Error downloading: ${e.message}`);
    }
    return false;
};

const main = () => {
    // 1. Check existing
    console.log("--- Checking Existing Files ---");
    images.forEach(img => {
        const filepath = `public/images/products/${img.name}`;
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            console.log(`📄 ${img.name}: ${stats.size} bytes`);
            if (stats.size < 2000) {
                console.log(`   -> Too small, deleting.`);
                fs.unlinkSync(filepath);
            }
        } else {
            console.log(`❌ ${img.name}: Missing`);
        }
    });

    // 2. Download missing
    console.log("\n--- Downloading Missing Files ---");
    images.forEach(img => {
        const filepath = `public/images/products/${img.name}`;
        if (!fs.existsSync(filepath)) {
            let success = download(img.url, filepath);
            if (!success && img.backup) {
                console.log(`🔄 Trying backup for ${img.name}...`);
                download(img.backup, filepath);
            }
        }
    });
};

main();
