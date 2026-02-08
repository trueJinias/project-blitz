
import { execSync } from 'child_process';
import fs from 'fs';

const images = [
    {
        name: 'panasonic-steamer.jpg',
        url: 'https://images.unsplash.com/photo-1569388330292-7a6a8411030e?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'conair-steamer.jpg',
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'conair-shaver.jpg',
        url: 'https://images.unsplash.com/photo-1620799140408-ed5341cd24d9?q=80&w=800&auto=format&fit=crop'
    },
    {
        name: 'nova-shaver.jpg',
        url: 'https://images.unsplash.com/photo-1620799140408-ed5341cd24d9?q=80&w=800&auto=format&fit=crop'
    }
];

const download = (url, filepath) => {
    try {
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 2000) {
            console.log(`Skipping: ${filepath}`);
            return;
        }

        console.log(`Downloading ${filepath}...`);
        // PowerShell command
        const cmd = `powershell -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${filepath}'"`;
        execSync(cmd, { stdio: 'inherit' });

        if (fs.existsSync(filepath)) {
            console.log(`Success: ${filepath} (${fs.statSync(filepath).size} bytes)`);
        } else {
            console.log(`Failed: ${filepath}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
};

const main = () => {
    images.forEach(img => {
        download(img.url, `public/images/products/${img.name}`);
    });
};

main();
