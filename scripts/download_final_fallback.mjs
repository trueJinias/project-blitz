
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=600&auto=format&fit=crop' // Kept
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://img.youtube.com/vi/zwMmxaegO5S/hqdefault.jpg', // YouTube HQ
        fallback: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop' // Laundry/Ironing fallback
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://img.youtube.com/vi/W4L5Ty_DY4c/hqdefault.jpg', // YouTube HQ
        fallback: 'https://images.unsplash.com/photo-1620799140408-ed5341cd24d9?q=80&w=600&auto=format&fit=crop' // Wool texture fallback
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://img.youtube.com/vi/PyyxOTi1MKc/hqdefault.jpg', // YouTube HQ
        fallback: 'https://images.unsplash.com/photo-1620799140408-ed5341cd24d9?q=80&w=600&auto=format&fit=crop' // Wool texture fallback
    }
];

const download = (url, fallback, filepath) => {
    try {
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`✅ Skipping good file: ${filepath}`);
            return;
        }

        console.log(`⬇️  Downloading ${filepath}...`);
        execSync(`curl -L -o "${filepath}" "${url}"`, { stdio: 'pipe' });

        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`✅ Success (Primary): ${filepath}`);
        } else {
            if (fallback) {
                console.log(`⚠️  Primary failed, trying fallback: ${filepath}`);
                execSync(`curl -L -o "${filepath}" "${fallback}"`, { stdio: 'pipe' });
                if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
                    console.log(`✅ Success (Fallback): ${filepath}`);
                } else {
                    console.log(`❌ Failed (Fallback): ${filepath}`);
                }
            } else {
                console.log(`❌ Failed (Primary): ${filepath}`);
            }
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
};

const main = () => {
    images.forEach(img => {
        download(img.url, img.fallback, `public/images/products/${img.name}`);
    });
};

main();
