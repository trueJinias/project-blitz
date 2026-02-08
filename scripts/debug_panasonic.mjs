
import { execSync } from 'child_process';
import fs from 'fs';

const url = 'https://ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=B0BWLD2N5M&Format=_SL1500_&ID=AsinImage&MarketPlace=JP';
const filepath = 'public/images/products/panasonic-steamer-debug.jpg';

try {
    console.log(`Downloading ${url}...`);
    // -v for verbose to see headers/redirects in output
    execSync(`curl -L -v -o "${filepath}" "${url}"`, { stdio: 'inherit' });

    if (fs.existsSync(filepath)) {
        console.log(`Size: ${fs.statSync(filepath).size}`);
    }
} catch (e) {
    console.log(e.message);
}
