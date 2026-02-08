
import fs from 'fs';
import https from 'https';
import path from 'path';

const jpFile = 'src/content/articles/old-money-fashion-cheap-brands.md';
const imageUrl = 'https://m.media-amazon.com/images/I/61iP-H1sJBL._AC_SL1500_.jpg';
const imagePath = 'public/images/products/panasonic-steamer.jpg';

// 1. Download Image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('Image downloaded.');
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            console.error('Error downloading image:', err.message);
            reject(err);
        });
    });
};

// 2. Fix Asterisks in JP File
const fixAsterisks = () => {
    let content = fs.readFileSync(jpFile, 'utf8');

    // Replace product image link first
    content = content.replace(
        'https://m.media-amazon.com/images/I/61iP-H1sJBL._AC_SL1500_.jpg',
        '/images/products/panasonic-steamer.jpg'
    );

    // Replace **text** with <strong>text</strong>
    // Regex matches ** followed by non-asterisk chars followed by **
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    fs.writeFileSync(jpFile, content);
    console.log('JP file fixed.');
};

async function main() {
    // Ensure dir exists
    const dir = path.dirname(imagePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        await downloadImage(imageUrl, imagePath);
        fixAsterisks();
    } catch (error) {
        console.error('Script failed:', error);
    }
}

main();
