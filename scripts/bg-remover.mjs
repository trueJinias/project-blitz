import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs/promises';

// Usage: node scripts/bg-remover.mjs <input-path> <output-path>

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/bg-remover.mjs <input-path> <output-path>");
    process.exit(1);
}

async function main() {
    try {
        const buffer = await fs.readFile(inputPath);
        // Determine type based on extension or just default to jpeg (most inputs)
        const blob = new Blob([buffer], { type: 'image/jpeg' });

        // Config to reduce memory/issue probability
        const config = {
            debug: false,
            model: 'small', // Use smaller model for speed/stability if available (defaults to medium-ish)
            output: {
                format: 'image/png',
                quality: 0.8
            }
        };

        const resultBlob = await removeBackground(blob, config);
        const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

        await fs.writeFile(outputPath, resultBuffer);
        console.log("✅ Background removed successfully");
    } catch (e) {
        console.error("❌ Background removal error:", e);
        process.exit(1);
    }
}

main();
