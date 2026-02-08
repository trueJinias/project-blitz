
import fs from 'fs';
import https from 'https';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=1000&auto=format&fit=crop', // Fallback: High quality steamer/iron image. Detailed product shot.
        type: 'fallback'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://img.youtube.com/vi/zwMmxaegO5S/maxresdefault.jpg', // YouTube Thumbnail
        type: 'youtube'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://img.youtube.com/vi/W4L5Ty_DY4c/maxresdefault.jpg', // YouTube Thumbnail
        type: 'youtube'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://img.youtube.com/vi/PyyxOTi1MKc/maxresdefault.jpg', // YouTube Thumbnail
        type: 'youtube'
    }
];

const download = (url, filepath) => {
    try {
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            // check if it's the broken googlebot one (small)
            if (fs.statSync(filepath).size < 10000 && filepath.includes('steamer')) {
                console.log(`⚠️  Replacing small/broken file: ${filepath}`);
            } else {
                console.log(`✅ Skipping good file: ${filepath}`);
                return;
            }
        }

        console.log(`⬇️  Downloading ${filepath}...`);
        const cmd = `curl -L -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' });

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 1000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
            } else {
                console.log(`❌ Failed (small): ${filepath}`);
            }
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
};

const main = () => {
    images.forEach(img => {
        download(img.url, `public/images/products/${img.name}`);
    });
};

main();
