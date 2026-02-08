
import fs from 'fs';
import { execFileSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        // Try Rakuten again with standard UA, otherwise fallback
        url: 'https://tshop.r10s.jp/biccamera/cabinet/product/7954/00000007954932_a01.jpg',
        fallback: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'conair-steamer.jpg',
        // Should exist, but ensure fallback
        url: 'https://img.youtube.com/vi/zwMmxaegO5S/maxresdefault.jpg',
        fallback: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'conair-shaver.jpg',
        // Fallback for shaver
        url: 'https://img.youtube.com/vi/W4L5Ty_DY4c/hqdefault.jpg',
        fallback: 'https://images.unsplash.com/photo-1620799140408-ed5341cd24d9?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'nova-shaver.jpg',
        // Fallback for shaver
        url: 'https://img.youtube.com/vi/PyyxOTi1MKc/hqdefault.jpg',
        fallback: 'https://images.unsplash.com/photo-1620799140408-ed5341cd24d9?q=80&w=800&auto=format&fit=crop'
    }
];

const download = (url, filepath) => {
    try {
        execFileSync('curl', ['-L', '-A', 'Mozilla/5.0', '-o', filepath, url], { stdio: 'pipe' });
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) return true;
        fs.unlinkSync(filepath);
        return false;
    } catch (e) {
        return false;
    }
};

const main = () => {
    images.forEach(img => {
        const filepath = `public/images/products/${img.name}`;
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`✅ Skipping: ${img.name}`);
            return;
        }

        console.log(`⬇️  Downloading ${img.name}...`);
        if (!download(img.url, filepath)) {
            console.log(`⚠️  Primary failed, using fallback...`);
            download(img.fallback, filepath);
        }

        if (fs.existsSync(filepath)) {
            console.log(`✅ Final: ${img.name} (${fs.statSync(filepath).size} bytes)`);
        } else {
            console.log(`❌ Failed all for ${img.name}`);
        }
    });
};

main();
