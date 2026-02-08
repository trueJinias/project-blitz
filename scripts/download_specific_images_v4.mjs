
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0BWLD2N5M&Format=_SL1500_&ID=AsinImage&MarketPlace=JP',
        description: 'Panasonic Steamer'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0935BS6DZ&Format=_SL1500_&ID=AsinImage&MarketPlace=US',
        description: 'Conair Steamer'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B008I25368&Format=_SL1500_&ID=AsinImage&MarketPlace=US',
        description: 'Conair Shaver'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0CJQ6ZMC2&Format=_SL1500_&ID=AsinImage&MarketPlace=IN',
        description: 'Nova Lint Remover'
    }
];

const download = (url, filepath) => {
    try {
        console.log(`⬇️  Downloading ${filepath} from Widget...`);
        // Follow redirects (-L) is crucial here
        const cmd = `curl -L -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            // Check if it's a valid image (custom check, Amazon error is usually small)
            if (stats.size > 1000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                return true;
            } else {
                console.log(`⚠️  File too small: ${filepath}`);
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
    images.forEach(img => {
        const filepath = `public/images/products/${img.name}`;
        download(img.url, filepath);
    });
};

main();
