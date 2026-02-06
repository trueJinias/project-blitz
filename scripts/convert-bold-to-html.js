
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

    // Use a regex to capture text between ** and replace with <strong> tags
    // This handles multiple lines within bold if . matches newline? No, usually bold is inline.
    // We use [^]*? or similar to match content. But standard bold doesn't span paragraphs (double newline).
    // Safest: match non-greedy characters or newlines?
    // CommonMark bold allows newlines.
    // But let's stick to inline first: `\*\*(.+?)\*\*`

    // Note: We need to be careful not to match across files if we read all files (we don't, we loop).

    // Regex: 
    // \*\* : Literal **
    // ([\s\S]+?) : Capture group for content, non-greedy, including newlines ([\s\S]).
    // \*\* : Literal **

    content = content.replace(/\*\*((?:(?!\*\*).)+?)\*\*/g, '<strong>$1</strong>');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Converted: ${file}`);
    }
});
