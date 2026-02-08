
import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg',
        referer: 'https://item.rakuten.co.jp/',
        fallback: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=600&auto=format&fit=crop'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://b3h2.scene7.com/is/image/BedBathandBeyond/32185542845607p',
        referer: 'https://www.bedbathandbeyond.com/',
        fallback: 'https://img.youtube.com/vi/zwMmxaegO5S/hqdefault.jpg'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://target.scene7.com/is/image/Target/GUEST_41776997-8557-4107-9577-622915856461?wid=1000&fmt=pjpeg',
        referer: 'https://www.target.com/',
        fallback: 'https://img.youtube.com/vi/W4L5Ty_DY4c/hqdefault.jpg'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/41D+w+s+IL.jpg',
        referer: 'https://www.amazon.in/',
        fallback: 'https://img.youtube.com/vi/PyyxOTi1MKc/hqdefault.jpg'
    }
];

const download = (url, referer, filepath) => {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(filepath);
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': referer
            }
        };

        const req = https.get(options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    if (fs.existsSync(filepath)) {
                        const stats = fs.statSync(filepath);
                        if (stats.size > 2000) {
                            console.log(`✅ Success: ${filepath} (${stats.size} bytes) from ${parsedUrl.hostname}`);
                            resolve(true);
                        } else {
                            console.log(`⚠️  File too small: ${filepath} (${stats.size} bytes)`);
                            fs.unlinkSync(filepath);
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });
            } else {
                console.log(`❌ Failed: ${res.statusCode} from ${parsedUrl.hostname}`);
                fs.unlink(filepath, () => resolve(false));
            }
        });

        req.on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            fs.unlink(filepath, () => resolve(false));
        });
    });
};

const main = async () => {
    for (const img of targets) {
        const filepath = `public/images/products/${img.name}`;

        // Force re-check
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`🆗 Exists: ${img.name}`);
            continue;
        }

        console.log(`Downloading ${img.name}...`);
        let success = await download(img.url, img.referer, filepath);

        if (!success && img.fallback) {
            console.log(`🔄 Trying fallback for ${img.name}...`);
            success = await download(img.fallback, '', filepath);
        }

        if (!success) {
            console.log(`🔥 ALL FAILED for ${img.name}`);
        }
    }
};

main();
