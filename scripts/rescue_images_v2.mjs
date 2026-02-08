
import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/jism/cabinet/1888/4549980753086.jpg', // Rakuten/Joshin image (usually reliable)
        fallback: 'https://image.yodobashi.com/product/100000001008276707/100000001008276707_10204.jpg'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://img.youtube.com/vi/W4L5Ty_DY4c/hqdefault.jpg'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://img.youtube.com/vi/PyyxOTi1MKc/hqdefault.jpg'
    }
];

const download = (url, filepath) => {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
                        console.log(`✅ Success: ${filepath}`);
                        resolve(true);
                    } else {
                        console.log(`⚠️  Too small: ${filepath}`);
                        fs.unlinkSync(filepath);
                        resolve(false);
                    }
                });
            } else {
                console.log(`❌ Failed: ${res.statusCode} ${url}`);
                fs.unlink(filepath, () => resolve(false));
            }
        }).on('error', (e) => {
            console.log(`❌ Error: ${e.message}`);
            resolve(false);
        });
    });
};

const main = async () => {
    for (const img of targets) {
        let success = await download(img.url, `public/images/products/${img.name}`);
        if (!success && img.fallback) {
            console.log(`🔄 Trying fallback...`);
            await download(img.fallback, `public/images/products/${img.name}`);
        }
    }
};

main();
