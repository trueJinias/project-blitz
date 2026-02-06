import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadDir = path.join(__dirname, '../public/images/products');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

const downloads = [
    { url: 'https://m.media-amazon.com/images/I/613xaVYln0L._AC_SX679_.jpg', filename: 'cio-novaport-duo-ii.jpg' },
    { url: 'https://m.media-amazon.com/images/I/51NtiIcRJLL._AC_SY879_.jpg', filename: 'anker-usb-c-reel.jpg' },
    { url: 'https://m.media-amazon.com/images/I/81iCRxLtzLL._AC_SY450_.jpg', filename: 'alpaka-elements-tech-case.jpg' },
    { url: 'https://m.media-amazon.com/images/I/51TAJBYi-oL._AC_SX679_.jpg', filename: 'shargeek-140w.jpg' },
    { url: 'https://m.media-amazon.com/images/I/81LplHil3eL._AC_SX679_.jpg', filename: 'bellroy-desk-caddy.jpg' }
];

downloads.forEach(dl => {
    const filePath = path.join(downloadDir, dl.filename);

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
    };

    https.get(dl.url, options, (res) => {
        if (res.statusCode !== 200) {
            console.error(`Failed to download ${dl.url}: ${res.statusCode}`);
            res.resume();
            return;
        }
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${dl.filename}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${dl.url}: ${err.message}`);
    });
});
