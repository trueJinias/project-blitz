import fs from 'fs';
import path from 'path';

const files = [
    "src/content/articles/xiaomi-laptop-2026-rumors.md",
    "src/content/articles/old-money-hairstyle-men-guide.md",
    "src/content/articles/xiaomi-17t-pro-release-date.md",
    "src/content/articles/xiaomi-17t-6500mah-battery.md",
    "src/content/articles/xiaomi-17-ultra-global-rom-import-guide.md",
    "src/content/articles/xiaomi-17-release-date-global.md",
    "src/content/articles/xiaomi-17-leica-edition-review.md",
    "src/content/articles/xiaomi-17-pro-vs-iphone-17-pro-max.md",
    "src/content/articles/xiaomi-17-battery-life-test.md",
    "src/content/articles/redmi-note-15-5g-price-history.md",
    "src/content/articles/xiaomi-17-ultra-price-japan-2026.md"
];

// Map of original tags (approximated from history or content context)
const tagMap = {
    "xiaomi-laptop-2026-rumors": ["Xiaomi", "ノートPC", "RedmiBook", "2026"],
    "old-money-hairstyle-men-guide": ["オールドマネー", "髪型", "メンズ", "セット"],
    "xiaomi-17t-pro-release-date": ["Xiaomi 17T Pro", "発売日", "リーク"],
    "xiaomi-17t-6500mah-battery": ["Xiaomi 17T", "バッテリー", "6500mAh"],
    "xiaomi-17-ultra-global-rom-import-guide": ["Xiaomi 17", "個人輸入", "Global ROM"],
    "xiaomi-17-release-date-global": ["Xiaomi 17", "発売日", "グローバル版"],
    "xiaomi-17-leica-edition-review": ["Xiaomi 17", "Leica", "カメラ"],
    "xiaomi-17-pro-vs-iphone-17-pro-max": ["Xiaomi 17", "iPhone 17", "比較"],
    "xiaomi-17-battery-life-test": ["Xiaomi 17", "バッテリー", "検証"],
    "redmi-note-15-5g-price-history": ["Redmi Note 15", "価格", "コスパ"],
    "xiaomi-17-ultra-price-japan-2026": ["Xiaomi 17 Ultra", "価格", "日本発売"]
};

files.forEach(file => {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const basename = path.basename(file, '.md');
    const imagePath = `/images/articles/${basename}-thumbnail.jpg`;

    // Restore Image if empty
    if (content.match(/image:\s*""/)) {
        console.log(`Restoring image for ${basename}`);
        content = content.replace(/image:\s*""/, `image: "${imagePath}"`);
    }

    // Restore Tags if empty
    if (content.match(/tags:\s*\[\]/)) {
        console.log(`Restoring tags for ${basename}`);
        const tags = tagMap[basename] || ["Tech", "Xiaomi"];
        const tagsString = `tags: [${tags.map(t => `"${t}"`).join(', ')}]`;
        content = content.replace(/tags:\s*\[\]/, tagsString);
    }

    fs.writeFileSync(filePath, content);
});

console.log("Restoration complete.");
