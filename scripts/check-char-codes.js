
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/content/articles/face-auth-payment-convenience-stores-2026.md');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const targetLine = lines.find(l => l.includes('2026年度（2026年4月〜）'));

if (targetLine) {
    console.log('Line found:');
    console.log(targetLine);
    console.log('Character codes:');
    for (let i = 0; i < targetLine.length; i++) {
        console.log(`${targetLine[i]}: ${targetLine.charCodeAt(i)} 0x${targetLine.charCodeAt(i).toString(16)}`);
    }
} else {
    console.log('Target line not found');
}
