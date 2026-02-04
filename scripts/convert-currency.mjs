import fs from 'fs';
import path from 'path';

// JPY to USD conversion rate (approximate)
const JPY_TO_USD = 0.0067; // 1 JPY ≈ 0.0067 USD (1 USD ≈ 150 JPY)

function convertCurrency(content) {
    // Convert ¥XXX,XXX patterns
    let result = content.replace(/¥([\d,]+)/g, (match, amount) => {
        const jpy = parseInt(amount.replace(/,/g, ''), 10);
        const usd = Math.round(jpy * JPY_TO_USD);
        return `$${usd.toLocaleString()}`;
    });

    // Convert XX万円 patterns (万 = 10,000)
    result = result.replace(/(\d+)万円/g, (match, num) => {
        const jpy = parseInt(num, 10) * 10000;
        const usd = Math.round(jpy * JPY_TO_USD);
        return `$${usd.toLocaleString()}`;
    });

    // Convert XX〜XX万円 patterns
    result = result.replace(/(\d+)〜(\d+)万円/g, (match, num1, num2) => {
        const jpy1 = parseInt(num1, 10) * 10000;
        const jpy2 = parseInt(num2, 10) * 10000;
        const usd1 = Math.round(jpy1 * JPY_TO_USD);
        const usd2 = Math.round(jpy2 * JPY_TO_USD);
        return `$${usd1.toLocaleString()}-$${usd2.toLocaleString()}`;
    });

    // Convert 約XX円 patterns
    result = result.replace(/約([\d,]+)円/g, (match, amount) => {
        const jpy = parseInt(amount.replace(/,/g, ''), 10);
        const usd = Math.round(jpy * JPY_TO_USD);
        return `approximately $${usd.toLocaleString()}`;
    });

    return result;
}

// Process all English articles
const enUsDir = path.join(process.cwd(), 'src/content/articles/en-us');
const files = fs.readdirSync(enUsDir).filter(f => f.endsWith('.md'));

console.log('🔄 通貨変換を開始します...\n');

for (const file of files) {
    const filePath = path.join(enUsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const converted = convertCurrency(content);

    if (content !== converted) {
        fs.writeFileSync(filePath, converted, 'utf-8');
        console.log(`✅ ${file}: 通貨変換完了`);
    } else {
        console.log(`⏭️ ${file}: 変換なし`);
    }
}

console.log('\n✨ 完了しました！');
