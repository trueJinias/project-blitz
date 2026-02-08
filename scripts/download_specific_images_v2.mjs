
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/61h+nQ+s+IL._AC_SL1500_.jpg', // Amazon JP
        description: 'Panasonic Steamer'
    },
    {
        name: 'hanes-beefy-t.jpg',
        url: 'https://www.t-shirtwholesaler.com/images/products/hanes/5180/5180_white.jpg', // Wholesaler
        description: 'Hanes Beefy-T'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg', // Amazon US
        description: 'Conair Steamer'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg', // Amazon US
        description: 'Conair Shaver'
    },
    {
        name: 'philips-steamer.jpg',
        url: 'https://images.philips.com/is/image/philipsconsumer/GC360_30-IMS-en_IN', // Philips Official
        description: 'Philips Steamer'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://5.imimg.com/data5/SELLER/Default/2021/3/XO/IO/WZ/12431780/nova-lint-remover-500x500.jpg', // Indiamart
        description: 'Nova Lint Remover'
    }
];

const download = (url, filepath) => {
    try {
        console.log(`⬇️  Downloading ${filepath}...`);
        // Use a real browser User-Agent
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        const cmd = `curl -L -A "${ua}" -H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 1000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                return true;
            } else {
                console.log(`⚠️  File too small (blocked): ${filepath}`);
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
        const success = download(img.url, filepath);
        if (!success) {
            console.error(`❌ FAILED for ${img.name} (${img.description})`);
        }
    });
};

main();
