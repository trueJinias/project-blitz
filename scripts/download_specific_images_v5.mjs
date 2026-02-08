
import fs from 'fs';
import https from 'https';
import { URL } from 'url';

const targets = [
    {
        name: 'panasonic-steamer.jpg',
        sources: [
            { url: 'https://image.biccamera.com/img/00000007954932_A01.jpg', referer: 'https://www.biccamera.com/' },
            { url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg', referer: 'https://item.rakuten.co.jp/' },
            { url: 'https://m.media-amazon.com/images/I/61h+nQ+s+IL._AC_SL1500_.jpg', referer: 'https://www.amazon.co.jp/' }
        ]
    },
    {
        name: 'conair-steamer.jpg',
        sources: [
            { url: 'https://b3h2.scene7.com/is/image/BedBathandBeyond/32185542845607p', referer: 'https://www.bedbathandbeyond.com/' },
            { url: 'https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg', referer: 'https://www.amazon.com/' }
        ]
    },
    {
        name: 'conair-shaver.jpg',
        sources: [
            { url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg', referer: 'https://www.amazon.com/' }
        ]
    },
    {
        name: 'nova-shaver.jpg',
        sources: [
            { url: 'https://5.imimg.com/data5/SELLER/Default/2021/3/XO/IO/WZ/12431780/nova-lint-remover-500x500.jpg', referer: 'https://www.indiamart.com/' },
            { url: 'https://m.media-amazon.com/images/I/41D+w+s+IL.jpg', referer: 'https://www.amazon.in/' }
        ]
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

        https.get(options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) {
                        console.log(`✅ Success: ${filepath} (${stats.size} bytes) from ${parsedUrl.hostname}`);
                        resolve(true);
                    } else {
                        console.log(`⚠️  File too small: ${filepath} from ${parsedUrl.hostname}`);
                        fs.unlinkSync(filepath);
                        resolve(false);
                    }
                });
            } else {
                console.log(`❌ Failed: ${res.statusCode} from ${parsedUrl.hostname}`);
                fs.unlink(filepath, () => resolve(false));
            }
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message} from ${parsedUrl.hostname}`);
            fs.unlink(filepath, () => resolve(false));
        });
    });
};

async function main() {
    for (const target of targets) {
        console.log(`\n⬇️  Processing ${target.name}...`);
        let success = false;
        for (const source of target.sources) {
            success = await download(source.url, source.referer, `public/images/products/${target.name}`);
            if (success) break;
        }
        if (!success) {
            console.error(`🔥 ALL SOURCES FAILED for ${target.name}`);
        }
    }
}

main();
