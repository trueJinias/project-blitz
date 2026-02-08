
import https from 'https';

const urls = [
    // Philips (IN)
    'https://images.philips.com/is/image/philipsconsumer/GC360_30-IMS-en_IN',
    // Hanes (JP) - S&S Activewear 
    'https://cdn.ssactivewear.com/Images/Color/1183_f_fl.jpg',
    // Conair (US) - Need to confirm
    'https://i5.walmartimages.com/asr/7a68e0d9-7622-4a56-857e-7a6015560565.jpeg',
    // Panasonic (JP) - BicCamera
    'https://image.biccamera.com/img/00000007954932_A01.jpg'
];

const checkUrl = (url) => {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            console.log(`${res.statusCode} : ${url}`);
            resolve();
        });
        req.on('error', (e) => {
            console.log(`ERR : ${url} (${e.message})`);
            resolve();
        });
        req.end();
    });
};

async function main() {
    for (const url of urls) {
        await checkUrl(url);
    }
}

main();
