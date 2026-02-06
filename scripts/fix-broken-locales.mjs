import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Sources
const SRC_DIR = path.join(process.cwd(), 'src/content/articles');
const EN_DIR = path.join(SRC_DIR, 'en-us');
const IN_DIR = path.join(SRC_DIR, 'hi-in');

// 1. Get List of JA source files to map slug -> image
const jaFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md'));
const slugMap = {};

jaFiles.forEach(file => {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf-8');
    const { data } = matter(content);
    slugMap[slug] = {
        image: data.image,
        genre: data.genre,
        date: data.date
    };
});

console.log(`Loaded ${Object.keys(slugMap).length} source articles.`);

// Function to fix a directory
function fixDirectory(targetDir, suffixRef) {
    if (!fs.existsSync(targetDir)) return;

    const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md'));
    console.log(`\nChecking ${targetDir} (${files.length} files)...`);

    files.forEach(file => {
        let slug = file.replace('.md', '');
        let needsRename = false;

        // Remove suffix if exists
        if (slug.endsWith(suffixRef)) {
            slug = slug.substring(0, slug.length - suffixRef.length);
            needsRename = true;
        }

        // Check if we have source data
        const sourceData = slugMap[slug];
        if (!sourceData) {
            console.warn(`⚠️ No source found for slug: ${slug} (File: ${file})`);
            return;
        }

        const filePath = path.join(targetDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const fileMatter = matter(fileContent);

        let modified = false;

        // Fix Image
        if (!fileMatter.data.image || fileMatter.data.image === '/path/to/image.jpg') {
            // Only update if source has valid image
            if (sourceData.image) {
                fileMatter.data.image = sourceData.image;
                modified = true;
                console.log(`  🖼️ Fixed image for ${slug}`);
            }
        }

        // Fix Genre
        if (!fileMatter.data.genre || fileMatter.data.genre !== sourceData.genre) {
            fileMatter.data.genre = sourceData.genre;
            modified = true;
            console.log(`  🏷️ Fixed genre for ${slug}`);
        }

        // Save if modified
        if (modified) {
            const newContent = matter.stringify(fileMatter.content, fileMatter.data);
            fs.writeFileSync(filePath, newContent);
        }

        // Rename if needed
        if (needsRename) {
            const newPath = path.join(targetDir, `${slug}.md`);
            fs.renameSync(filePath, newPath);
            console.log(`  📝 Renamed: ${file} -> ${slug}.md`);
        }
    });
}

// Run fixes
fixDirectory(EN_DIR, '-us');
fixDirectory(IN_DIR, '-in'); // Check if -in suffix was used there strictly, localize.mjs said '-in' suffix
fixDirectory(IN_DIR, '-in'); // Just in case logic was [slug]-in.md

console.log('\n✅ Bulk fix complete.');
