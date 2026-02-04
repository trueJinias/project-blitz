
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.resolve(__dirname, '../src/content/articles');

// Function to recursively get all files
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(articlesDir);

files.forEach(file => {
    if (path.extname(file) === '.md') {
        const content = fs.readFileSync(file, 'utf8');
        // Replace **text** with text (remove double asterisks)
        const newContent = content.replace(/\*\*(.*?)\*\*/g, '$1');

        if (content !== newContent) {
            console.log(`Processing: ${path.basename(file)}`);
            fs.writeFileSync(file, newContent, 'utf8');
        }
    }
});

console.log('Finished removing bold formatting.');
