#!/usr/bin/env node
/**
 * Keyword Management Script
 * 
 * Helper script to manage keywords in keywords.csv.
 * Can remove a specific keyword or clean up empty lines.
 * 
 * Usage: 
 *   node scripts/manage-keywords.mjs remove "exact keyword to remove"
 *   node scripts/manage-keywords.mjs clean
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const KEYWORDS_FILE = path.join(ROOT_DIR, 'keywords.csv');

async function main() {
    const command = process.argv[2];
    const targetKeyword = process.argv[3];

    if (!command) {
        console.error('Usage: node scripts/manage-keywords.mjs <remove|clean> [keyword]');
        process.exit(1);
    }

    try {
        const fileContent = await fs.readFile(KEYWORDS_FILE, 'utf-8');
        let lines = fileContent.split(/\r?\n/);

        // Remove header if present just for processing, might need to keep it
        // The current file has a header "keyword"
        const hasHeader = lines[0].trim() === 'keyword';

        if (command === 'remove') {
            if (!targetKeyword) {
                console.error('Error: Please provide a keyword to remove.');
                process.exit(1);
            }

            const initialCount = lines.length;
            // Filter out the exact keyword (trimming whitespace)
            lines = lines.filter(line => line.trim() !== targetKeyword.trim());

            if (lines.length < initialCount) {
                console.log(`✅ Removed keyword: "${targetKeyword}"`);
            } else {
                console.warn(`⚠️ Keyword not found: "${targetKeyword}"`);
            }
        }
        else if (command === 'clean') {
            // Remove empty lines
            lines = lines.filter(line => line.trim() !== '');
            console.log('✅ Removed empty lines.');
        }

        // Reconstruct file
        const newContent = lines.join('\n');
        await fs.writeFile(KEYWORDS_FILE, newContent, 'utf-8');

    } catch (error) {
        // If file doesn't exist, just warn
        if (error.code === 'ENOENT') {
            console.error('keywords.csv not found.');
            process.exit(1);
        }
        console.error('Failed to process keywords.csv:', error.message);
        process.exit(1);
    }
}

main();
