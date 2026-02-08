
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        id: 'YxDfU-07CCb' // Extracted from search snippet
    },
    {
        name: 'conair-steamer.jpg',
        id: 'zwMmxaegO5S'
    },
    {
        name: 'conair-shaver.jpg',
        id: 'W4L5Ty_DY4c'
    },
    {
        name: 'nova-shaver.jpg',
        id: 'PyyxOTi1MKc'
    }
];

const download = (url, filepath) => {
    try {
        const cmd = `curl -L -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' });
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 3000) { // Standard placeholder is ~1KB
            console.log(`✅ Success: ${filepath} (${fs.statSync(filepath).size} bytes)`);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

const main = () => {
    images.forEach(img => {
        const filepath = `public/images/products/${img.name}`;

        console.log(`⬇️  Processing ${img.name}...`);

        // Try MaxRes
        let success = download(`https://img.youtube.com/vi/${img.id}/maxresdefault.jpg`, filepath);

        // Try HQ if MaxRes failed
        if (!success) {
            console.log(`⚠️  MaxRes failed, trying HQ...`);
            success = download(`https://img.youtube.com/vi/${img.id}/hqdefault.jpg`, filepath);
        }

        if (!success) {
            console.log(`❌ ALL FAILED for ${img.name}. Keeping previous version if exists.`);
            // Ensure we don't leave a 1KB file
            if (fs.existsSync(filepath) && fs.statSync(filepath).size < 2000) {
                fs.unlinkSync(filepath);
                // Fallback to Unsplash if Panasonic?
                if (img.name.includes('panasonic')) {
                    console.log(`🔄 Downloading Unsplash fallback for Panasonic...`);
                    const cmd = `curl -L -o "${filepath}" "https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=600&auto=format&fit=crop"`;
                    execSync(cmd);
                }
                // Others: Manual upload required or previous file remains?
            }
        }
    });
};

main();
