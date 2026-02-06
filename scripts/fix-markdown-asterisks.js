
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesDir = path.join(__dirname, '../src/content/articles');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.md')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(articlesDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Remove backticks around bold: `**text**` -> **text**
    content = content.replace(/`\*\*(.*?)\*\*`/g, '**$1**');

    // 2. Remove spaces inside bold tags: ** text ** -> **text**
    // Captures ** followed by space(s), content, space(s), **
    content = content.replace(/\*\*\s+(.+?)\s+\*\*/g, '**$1**');

    // 3. Remove space after opening **: ** text** -> **text**
    content = content.replace(/\*\*\s+(.+?)\*\*/g, '**$1**');

    // 4. Remove space before closing **: **text ** -> **text**
    content = content.replace(/\*\*(.+?)\s+\*\*/g, '**$1**');

    // 5. Fix Japanese bracket specific: **「Text」** should be fine, but ** 「Text」 ** is caught above.
    // Standardize: **「 -> 「** and 」** -> **」 ? 
    // User said "if checking, convert to blue underline".
    // If we have **「Text」**, it renders as bold brackets. The user might prefer blue underline INSIDE brackets.
    // "「**Text**」" looks better with underline than "**「Text」**" (underlined brackets).
    // Let's create a rule to move brackets outside if they are immediately inside bold.
    // **「Content」** -> 「**Content**」
    content = content.replace(/\*\*「(.+?)」\*\*/g, '「**$1**」');
    content = content.replace(/\*\*『(.+?)』\*\*/g, '『**$1**』');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed: ${file}`);
    }
});
