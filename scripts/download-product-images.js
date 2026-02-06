import fs from 'fs';
import https from 'https';
import path from 'path';

const downloadDir = 'public/images/products';
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

const downloads = [
    { url: 'https://m.media-amazon.com/images/I/61K-q-v7lTL._AC_SX679_.jpg', filename: 'cio-novaport-duo-ii.jpg' },
    { url: 'https://m.media-amazon.com/images/I/61+9fK3N1ZL._AC_SX679_.jpg', filename: 'anker-usb-c-reel.jpg' },
    { url: 'https://m.media-amazon.com/images/I/71R2o58-9jL._AC_SX679_.jpg', filename: 'alpaka-elements-tech-case.jpg' },
    { url: 'https://m.media-amazon.com/images/I/61B+X+U8KKL._AC_SX679_.jpg', filename: 'shargeek-140w.jpg' },
    { url: 'https://m.media-amazon.com/images/I/71Y-Vv-8M0L._AC_SX679_.jpg', filename: 'bellroy-desk-caddy.jpg' }
];

downloads.forEach(dl => {
    const filePath = path.join(downloadDir, dl.filename);
    https.get(dl.url, (res) => {
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
