
import fs from 'fs';
import https from 'https';
import path from 'path';

// Config
const jpFile = 'src/content/articles/old-money-fashion-cheap-brands.md';
const usFile = 'src/content/articles/en-us/old-money-fashion-cheap-brands.md';
const inFile = 'src/content/articles/hi-in/old-money-fashion-cheap-brands.md';

const imageUrl = 'https://images-na.ssl-images-amazon.com/images/P/B0BWLD2N5M.09.MAIN._SCRM_.jpg';
const imagePath = 'public/images/products/panasonic-steamer.jpg';

// Download (Robust)
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('✅ Image downloaded:', filepath);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

// Replacements
const replacements = [
    {
        file: jpFile,
        find: 'https://www.amazon.co.jp/dp/B0CKRCM1F5?tag=blitz011-22',
        replace: 'https://www.amazon.co.jp/dp/B0BWLD2N5M?tag=blitz011-22'
    },
    {
        file: usFile,
        find: 'https://www.amazon.com/s?k=Conair+Handheld+Garment+Steamer&tag=blitz011-20',
        replace: 'https://www.amazon.com/dp/B0BNK9862S?tag=blitz011-20'
    },
    {
        file: usFile,
        find: 'https://www.amazon.com/s?k=Conair+Fabric+Shaver&tag=blitz011-20',
        replace: 'https://www.amazon.com/dp/B008I25368?tag=blitz011-20'
    },
    {
        file: inFile,
        find: 'https://www.amazon.in/s?k=Philips+Handheld+Garment+Steamer&tag=blitz011-21',
        replace: 'https://www.amazon.in/dp/B08D9K58J2?tag=blitz011-21'
    },
    {
        file: inFile,
        find: 'https://www.amazon.in/s?k=Nova+Lint+Remover&tag=blitz011-21',
        replace: 'https://www.amazon.in/dp/B0CJQ6ZMC2?tag=blitz011-21'
    }
];

const fixFiles = () => {
    replacements.forEach(item => {
        if (fs.existsSync(item.file)) {
            let content = fs.readFileSync(item.file, 'utf8');
            if (content.includes(item.find)) {
                content = content.replace(item.find, item.replace);
                fs.writeFileSync(item.file, content);
                console.log(`✅ Fixed link in ${item.file}`);
            } else {
                console.warn(`⚠️ Text not found in ${item.file}:`, item.find);
            }

            // Double check for any remaining **
            if (item.file === jpFile && content.includes('**')) {
                content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                fs.writeFileSync(item.file, content);
                console.log(`✅ Fixed remaining asterisks in ${item.file}`);
            }
        }
    });
};

async function main() {
    try {
        await downloadImage(imageUrl, imagePath);
        fixFiles();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();
