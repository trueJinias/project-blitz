#!/usr/bin/env node
/**
 * Git Auto Deploy Script
 * 新しい記事を自動でGitHubにプッシュし、Vercelにデプロイ
 * 
 * Usage: node scripts/deploy.mjs
 */

import { execSync } from 'child_process';

const timestamp = new Date().toISOString().split('T')[0];

try {
    console.log('📦 Staging changes...');
    execSync('git add .', { stdio: 'inherit' });

    console.log('💾 Committing...');
    execSync(`git commit -m "Add new article - ${timestamp}"`, { stdio: 'inherit' });

    console.log('🚀 Pushing to GitHub...');
    execSync('git push', { stdio: 'inherit' });

    console.log('\n✅ Deploy triggered! Vercel will automatically build.');
    console.log('📊 Check status: https://vercel.com/dashboard');
} catch (error) {
    if (error.message.includes('nothing to commit')) {
        console.log('ℹ️  No changes to deploy.');
    } else {
        console.error('❌ Deploy failed:', error.message);
        process.exit(1);
    }
}
