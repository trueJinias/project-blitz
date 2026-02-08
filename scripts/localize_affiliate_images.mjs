
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Files
const jpFile = 'src/content/articles/old-money-fashion-cheap-brands.md';
const usFile = 'src/content/articles/en-us/old-money-fashion-cheap-brands.md';
const inFile = 'src/content/articles/hi-in/old-money-fashion-cheap-brands.md';

// Image definitions
// We need to extract the URLs currently in the files or use known ones.
// Current contents have:
// JP Hanes: https://m.media-amazon.com/images/I/71N-w+c+oDL._AC_SY879_.jpg
// JP Panasonic: (We need a good URL) -> Let's try https://m.media-amazon.com/images/I/61h+nQ+s+IL._AC_SL1500_.jpg
// US Conair Steamer: https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg
// US Conair Shaver: https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg
// IN Philips: https://m.media-amazon.com/images/I/61kRk-yl-WL._SL1000_.jpg
// IN Nova: https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg (Same as Conair Shaver? Maybe generic image used)

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/61h+nQ+s+IL._AC_SL1500_.jpg', // New candidate
        file: jpFile
    },
    {
        name: 'hanes-beefy-t.jpg',
        url: 'https://m.media-amazon.com/images/I/71N-w+c+oDL._AC_SY879_.jpg',
        file: jpFile,
        find: 'https://m.media-amazon.com/images/I/71N-w+c+oDL._AC_SY879_.jpg'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg',
        file: usFile,
        find: 'https://m.media-amazon.com/images/I/71r+tW+gOJL._AC_SL1500_.jpg'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg',
        file: usFile,
        find: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg'
    },
    {
        name: 'philips-steamer.jpg',
        url: 'https://m.media-amazon.com/images/I/61kRk-yl-WL._SL1000_.jpg',
        file: inFile,
        find: 'https://m.media-amazon.com/images/I/61kRk-yl-WL._SL1000_.jpg'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg',
        file: inFile,
        find: 'https://m.media-amazon.com/images/I/61+9+8+0+0L._AC_SL1000_.jpg'
    }
];

const downloadImage = (url, filename) => {
    const filepath = `public/images/products/${filename}`;
    try {
        console.log(`⬇️  Downloading ${filename}...`);
        // Use User-Agent to avoid 403
        execSync(`curl -L -A "Mozilla/5.0" -o "${filepath}" "${url}"`, { stdio: 'inherit' });

        const stats = fs.statSync(filepath);
        if (stats.size < 1000) {
            console.warn(`⚠️  Warning: ${filename} is very small (${stats.size} bytes). Might be broken.`);
        } else {
            console.log(`✅ ${filename} downloaded (${stats.size} bytes).`);
        }
    } catch (e) {
        console.error(`❌ Failed to download ${filename}:`, e.message);
    }
};

const localizeLinks = () => {
    images.forEach(img => {
        downloadImage(img.url, img.name);

        if (img.find && fs.existsSync(img.file)) {
            let content = fs.readFileSync(img.file, 'utf8');
            if (content.includes(img.find)) {
                content = content.replace(img.find, `/images/products/${img.name}`);
                fs.writeFileSync(img.file, content);
                console.log(`✅ Updated ${img.file} -> /images/products/${img.name}`);
            }
        }
    });

    // Special verification for panasonic in JP (it uses local path already, but file might be broken)
    // We already re-downloaded it above as 'panasonic-steamer.jpg'.
};

localizeLinks();
