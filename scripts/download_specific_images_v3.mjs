
import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const images = [
    {
        name: 'philips-steamer.jpg',
        url: 'https://images.philips.com/is/image/philipsconsumer/GC360_30-IMS-en_IN?wid=1000'
    },
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg'
    },
    {
        name: 'conair-steamer.jpg',
        // Try Walmart image ID found in typical listings or alternative source
        // Using a general high-res image found for GS237
        url: 'https://i5.walmartimages.com/asr/7a68e0d9-7622-4a56-857e-7a6015560565.jpeg'
        // If this fails, I'll fallback to a known reliable placeholder or user manual cover
    },
    {
        name: 'conair-shaver.jpg',
        // Conair CLS1
        url: 'https://i5.walmartimages.com/asr/3db2c7a0-0062-4467-9662-7f2d5c345973_1.26620593441584488358485265438883.jpeg'
        // Need to verify this URL
    },
    {
        name: 'nova-shaver.jpg',
        // Nova 208 from a generic CDN or Indiamart proxy if possible. 
        // Using a publicly available image for similar item
        url: 'https://5.imimg.com/data5/SELLER/Default/2021/3/XO/IO/WZ/12431780/nova-lint-remover-500x500.jpg'
    }
];

const download = (url, filepath) => {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(filepath);
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': parsedUrl.origin
            }
        };

        https.get(options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) {
                        console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                        resolve(true);
                    } else {
                        console.log(`⚠️  File too small: ${filepath}`);
                        resolve(false);
                    }
                });
            } else {
                console.log(`❌ Failed: ${url} (${res.statusCode})`);
                fs.unlink(filepath, () => resolve(false)); // Delete empty file
            }
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            fs.unlink(filepath, () => resolve(false));
        });
    });
};

async function main() {
    for (const img of images) {
        if (img.name.includes('conair') && img.url.includes('example')) continue; // Skip placeholders
        await download(img.url, `public/images/products/${img.name}`);
    }
}

main();
