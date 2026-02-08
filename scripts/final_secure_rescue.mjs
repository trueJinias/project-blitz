
import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/jism/cabinet/1888/4549980753086.jpg', // Joshin/Rakuten
        referer: 'https://item.rakuten.co.jp/',
        fallback: 'https://image.yodobashi.com/product/100000001008276707/100000001008276707_10204.jpg'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://img.youtube.com/vi/zwMmxaegO5S/hqdefault.jpg' // High Quality (Standard)
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

const downloadFile = (url, referer, filepath) => {
    return new Promise((resolve, reject) => {
        const makeRequest = (currentUrl, redirectCount = 0) => {
            if (redirectCount > 10) {
                reject(new Error('Too many redirects'));
                return;
            }

            const parsedUrl = new URL(currentUrl);
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Referer': referer || parsedUrl.origin
                }
            };

            const req = https.request(options, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const newUrl = new URL(res.headers.location, currentUrl).toString();
                    makeRequest(newUrl, redirectCount + 1);
                    return;
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`Status ${res.statusCode}`));
                    return;
                }

                const file = fs.createWriteStream(filepath);
                res.pipe(file);

                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 2000) {
                        console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                        resolve(true);
                    } else {
                        console.log(`⚠️  Too small: ${filepath} (${stats.size} bytes)`);
                        fs.unlinkSync(filepath);
                        resolve(false);
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.end();
        };

        makeRequest(url);
    });
};

const main = async () => {
    for (const img of targets) {
        const filepath = `public/images/products/${img.name}`;

        // Skip if exists and good
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`🆗 Exists: ${img.name}`);
            continue;
        }

        console.log(`⬇️  Downloading ${img.name}...`);
        try {
            await downloadFile(img.url, img.referer, filepath);
        } catch (e) {
            console.log(`❌ Primary failed: ${e.message}`);
            if (img.fallback) {
                console.log(`🔄 Trying fallback...`);
                try {
                    await downloadFile(img.fallback, '', filepath);
                } catch (e2) {
                    console.log(`❌ Fallback failed: ${e2.message}`);
                }
            }
        }
    }
};

main();
