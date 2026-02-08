
import fs from 'fs';
import https from 'https';
import { URL } from 'url';
import path from 'path';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg',
        referer: 'https://item.rakuten.co.jp/',
        fallback: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'conair-steamer.jpg',
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

const downloadFile = (url, referer, filepath) => {
    return new Promise((resolve, reject) => {
        const makeRequest = (currentUrl, redirectCount = 0) => {
            if (redirectCount > 5) {
                reject(new Error('Too many redirects'));
                return;
            }

            const parsedUrl = new URL(currentUrl);
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Referer': referer || parsedUrl.origin
                }
            };

            const req = https.request(options, (res) => {
                // Handle Redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const newUrl = new URL(res.headers.location, currentUrl).toString();
                    // console.log(`Create redirect to: ${newUrl}`);
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
            console.log(`⏭️  Skipping existing: ${img.name}`);
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
