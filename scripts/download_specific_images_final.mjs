
import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg',
        referer: 'https://item.rakuten.co.jp/'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://b3h2.scene7.com/is/image/BedBathandBeyond/32185542845607p',
        referer: 'https://www.bedbathandbeyond.com/'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://target.scene7.com/is/image/Target/GUEST_41776997-8557-4107-9577-622915856461?wid=1000&fmt=pjpeg',
        referer: 'https://www.target.com/'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/41D+w+s+IL.jpg',
        referer: 'https://www.amazon.in/'
    }
];

const download = (url, referer, filepath) => {
    return new Promise((resolve) => {
        // Don't overwrite if it exists and is big enough (Hanes/Philips)
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 1000) {
            console.log(`✅ Skipping existing: ${filepath}`);
            resolve(true);
            return;
        }

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

        https.get(options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    if (fs.existsSync(filepath)) {
                        const stats = fs.statSync(filepath);
                        if (stats.size > 1000) {
                            console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                            resolve(true);
                        } else {
                            console.log(`⚠️  File too small: ${filepath}`);
                            fs.unlinkSync(filepath);
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });
            } else {
                console.log(`❌ Failed: ${res.statusCode} for ${filepath}`);
                fs.unlink(filepath, () => resolve(false));
            }
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            fs.unlink(filepath, () => resolve(false));
        });
    });
};

async function main() {
    for (const target of targets) {
        await download(target.url, target.referer, `public/images/products/${target.name}`);
    }
}

main();
