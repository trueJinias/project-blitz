
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Files to update
const jpFile = 'src/content/articles/old-money-fashion-cheap-brands.md';
const usFile = 'src/content/articles/en-us/old-money-fashion-cheap-brands.md';
const inFile = 'src/content/articles/hi-in/old-money-fashion-cheap-brands.md';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/71k420H+HnL._AC_SL1500_.jpg',
        fallback: 'https://images.pexels.com/photos/5202956/pexels-photo-5202956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Steaming
        file: jpFile
    },
    {
        name: 'hanes-beefy-t.jpg',
        url: 'https://m.media-amazon.com/images/I/71N-w+c+oDL._AC_SY879_.jpg',
        fallback: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // White T-shirt
        file: jpFile,
        find: 'https://m.media-amazon.com/images/I/71N-w+c+oDL._AC_SY879_.jpg'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg',
        fallback: 'https://images.pexels.com/photos/5202956/pexels-photo-5202956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Steaming (reuse)
        file: usFile,
        find: 'https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg',
        fallback: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Wool/Texture
        file: usFile,
        find: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg'
    },
    {
        name: 'philips-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/61kRk-yl-WL._SL1000_.jpg',
        fallback: 'https://images.pexels.com/photos/5202956/pexels-photo-5202956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Steaming (reuse)
        file: inFile,
        find: 'https://m.media-amazon.com/images/I/61kRk-yl-WL._SL1000_.jpg'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg',
        fallback: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Wool/Texture (reuse)
        file: inFile,
        find: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg'
    }
];

const download = (url, filepath, isFallback = false) => {
    try {
        console.log(`⬇️  Downloading ${isFallback ? 'FALLBACK' : 'PRIMARY'} to ${filepath}...`);
        const cmd = `curl -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" -H "Referer: https://www.amazon.com/" -o "${filepath}" "${url}"`;
        execSync(cmd, { stdio: 'pipe' }); // Pipe stdio to avoid clutter, check size manually

        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 1000) {
                console.log(`✅ Success: ${filepath} (${stats.size} bytes)`);
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
};

const main = () => {
    images.forEach(img => {
        const filepath = `public/images/products/${img.name}`;

        // Try Primary
        let success = download(img.url, filepath);

        // Try Fallback if Primary failed
        if (!success) {
            console.warn(`⚠️  Primary failed for ${img.name}. Trying fallback...`);
            success = download(img.fallback, filepath, true);
        }

        if (success && img.find && fs.existsSync(img.file)) {
            let content = fs.readFileSync(img.file, 'utf8');
            // Replace ALL instances
            if (content.includes(img.find)) {
                content = content.split(img.find).join(`/images/products/${img.name}`);
                fs.writeFileSync(img.file, content);
                console.log(`✅ Updated Markdown: ${img.file}`);
            }
        } else if (!success) {
            console.error(`❌ FAILED to download ${img.name} (Primary & Fallback).`);
        }
    });
};

main();
