
import fs from 'fs';
import { execSync } from 'child_process';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Steam_ironing.jpg/640px-Steam_ironing.jpg' // Generic steaming
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Steam_ironing.jpg/640px-Steam_ironing.jpg' // Keep existing if good, fallback to generic
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lint_roller.jpg/640px-Lint_roller.jpg' // Lint roller generic
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lint_roller.jpg/640px-Lint_roller.jpg' // Lint roller generic
    }
];

const download = (url, filepath) => {
    try {
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`Skipping: ${filepath}`);
            return;
        }

        console.log(`Downloading ${filepath} from Wiki...`);
        execSync(`curl -L -o "${filepath}" "${url}"`, { stdio: 'inherit' });
    } catch (e) {
        console.log(e.message);
    }
};

const main = () => {
    images.forEach(img => {
        download(img.url, `public/images/products/${img.name}`);
    });
};

main();
