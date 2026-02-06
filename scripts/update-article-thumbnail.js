
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadPath = path.join(__dirname, '../public/images/articles/old-money-hairstyle-men-guide-thumbnail.jpg');
const imageUrl = 'https://images.pexels.com/photos/6888596/pexels-photo-6888596.jpeg?auto=compress&cs=tinysrgb&w=2560';

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
};

const file = fs.createWriteStream(downloadPath);

https.get(imageUrl, options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to download image: ${res.statusCode}`);
        res.resume();
        return;
    }
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log(`Downloaded image to ${downloadPath}`);
    });
}).on('error', (err) => {
    console.error(`Error downloading image: ${err.message}`);
});
