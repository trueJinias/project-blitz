
import fs from 'fs';

const jpFile = 'src/content/articles/old-money-fashion-cheap-brands.md';
const usFile = 'src/content/articles/en-us/old-money-fashion-cheap-brands.md';
const inFile = 'src/content/articles/hi-in/old-money-fashion-cheap-brands.md';

const replacements = [
    // JP: Panasonic Steamer
    {
        file: jpFile,
        find: 'https://www.amazon.co.jp/dp/B0BWLD2N5M?tag=blitz011-22',
        replace: 'https://www.amazon.co.jp/s?k=%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF+%E8%A1%A3%E9%A1%9E%E3%82%B9%E3%83%81%E3%83%BC%E3%83%9E%E3%83%BC&tag=blitz011-22' // Panasonic 衣類スチーマー
    },
    // JP: Hanes Beefy-T
    {
        file: jpFile,
        find: 'https://www.amazon.co.jp/dp/B01M3Q8Q8A?tag=blitz011-22',
        replace: 'https://www.amazon.co.jp/s?k=Hanes+BEEFY-T&tag=blitz011-22'
    },
    // US: Conair Steamer
    {
        file: usFile,
        find: 'https://www.amazon.com/dp/B0935BS6DZ?tag=blitz011-20',
        replace: 'https://www.amazon.com/s?k=Conair+Handheld+Garment+Steamer&tag=blitz011-20'
    },
    // US: Conair Shaver
    {
        file: usFile,
        find: 'https://www.amazon.com/dp/B008I25368?tag=blitz011-20',
        replace: 'https://www.amazon.com/s?k=Conair+Fabric+Shaver&tag=blitz011-20'
    },
    // IN: Philips Steamer
    {
        file: inFile,
        find: 'https://www.amazon.in/dp/B0CXHMXYGR?tag=blitz011-21',
        replace: 'https://www.amazon.in/s?k=Philips+Handheld+Garment+Steamer&tag=blitz011-21'
    },
    // IN: Nova Shaver
    {
        file: inFile,
        find: 'https://www.amazon.in/dp/B0CJQ6ZMC2?tag=blitz011-21',
        replace: 'https://www.amazon.in/s?k=Nova+Lint+Remover&tag=blitz011-21'
    }
];

replacements.forEach(item => {
    if (fs.existsSync(item.file)) {
        let content = fs.readFileSync(item.file, 'utf8');
        if (content.includes(item.find)) {
            content = content.replace(item.find, item.replace);
            fs.writeFileSync(item.file, content);
            console.log(`✅ Fixed link in ${item.file}`);
        } else {
            console.warn(`⚠️ Link not found in ${item.file}: ${item.find}`);
        }
    } else {
        console.error(`❌ File not found: ${item.file}`);
    }
});
