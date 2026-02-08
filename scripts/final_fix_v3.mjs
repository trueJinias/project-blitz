
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const jpFile = 'src/content/articles/old-money-fashion-cheap-brands.md';
const usFile = 'src/content/articles/en-us/old-money-fashion-cheap-brands.md';
const inFile = 'src/content/articles/hi-in/old-money-fashion-cheap-brands.md';

// 1. Download Image (Using curl via execSync for robustness)
const imageUrl = 'https://m.media-amazon.com/images/I/71k420H+HnL._AC_SL1500_.jpg'; // Reliable Amazon image
const imagePath = 'public/images/products/panasonic-steamer.jpg';

try {
    console.log('⬇️  Downloading image...');
    // Use curl -L to follow redirects, -o to output
    execSync(`curl -L -o "${imagePath}" "${imageUrl}"`, { stdio: 'inherit' });
    console.log('✅ Image downloaded.');
} catch (e) {
    console.error('❌ Failed to download image:', e.message);
}

// 2. Fix Links
const replacements = [
    // JP: Hanes Fix
    { file: jpFile, find: 'dp/B002KNI640', replace: 'dp/B01M3Q8Q8A' },
    // US: Conair Fix
    { file: usFile, find: 'dp/B0BNK9862S', replace: 'dp/B0935BS6DZ' },
    // IN: Philips Fix
    { file: inFile, find: 'dp/B08D9K58J2', replace: 'dp/B0CXHMXYGR' }
];

replacements.forEach(item => {
    if (fs.existsSync(item.file)) {
        let content = fs.readFileSync(item.file, 'utf8');
        // Simple string replace (global if multiple)
        const parts = content.split(item.find);
        if (parts.length > 1) {
            content = parts.join(item.replace);
            fs.writeFileSync(item.file, content);
            console.log(`✅ Fixed ${item.file}: replaced ${item.find} with ${item.replace}`);
        } else {
            console.log(`ℹ️  No instances of ${item.find} in ${item.file} (maybe already fixed?)`);
        }
    } else {
        console.error(`❌ File not found: ${item.file}`);
    }
});
