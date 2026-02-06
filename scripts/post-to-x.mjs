import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Load environment variables
dotenv.config();

/**
 * Determine the region and load appropriate credentials
 * @param {string} filePath 
 */
function getRegionConfig(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');

    if (normalizedPath.includes('/en-us/')) {
        return {
            region: 'US',
            appKey: process.env.X_API_KEY_US,
            appSecret: process.env.X_API_SECRET_US,
            accessToken: process.env.X_ACCESS_TOKEN_US,
            accessSecret: process.env.X_ACCESS_SECRET_US,
            urlPrefix: 'https://project-blitz.vercel.app/en-us/articles/'
        };
    } else if (normalizedPath.includes('/en-in/') || normalizedPath.includes('/hi-in/')) {
        return {
            region: 'IN',
            appKey: process.env.X_API_KEY_IN,
            appSecret: process.env.X_API_SECRET_IN,
            accessToken: process.env.X_ACCESS_TOKEN_IN,
            accessSecret: process.env.X_ACCESS_SECRET_IN,
            // Adjust URL prefix based on detected path
            urlPrefix: normalizedPath.includes('/hi-in/')
                ? 'https://project-blitz.vercel.app/hi-in/articles/'
                : 'https://project-blitz.vercel.app/en-in/articles/'
        };
    } else {
        // Default to Japan
        return {
            region: 'JP',
            appKey: process.env.X_API_KEY_JP,
            appSecret: process.env.X_API_SECRET_JP,
            accessToken: process.env.X_ACCESS_TOKEN_JP,
            accessSecret: process.env.X_ACCESS_SECRET_JP,
            urlPrefix: 'https://project-blitz.vercel.app/articles/'
        };
    }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-flash-latest';

async function generateSocialPost(title, content, region) {
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not found. Skipping AI summary generation.');
        return null;
    }

    const language = region === 'JP' ? 'Japanese' : (region === 'IN' ? 'Hindi' : 'English');
    const audience = region === 'JP' ? 'Japan' : (region === 'IN' ? 'India' : 'global/US');

    // Truncate content to avoid token limits
    const truncatedContent = content.substring(0, 3000);

    const prompt = `
You are a social media manager for a tech blog targeting ${audience}.
Your task is to write an engaging X (Twitter) post in **${language}** to promote the following article.

**Article Title:** ${title}
**Article Content (Snippet):**
${truncatedContent}

**Requirements:**
1.  **Hook:** Start with a catchy line or question that grabs attention.
2.  **Summary:** Briefly tease the most interesting finding or conclusion (don't give everything away, make them click).
3.  **Tone:** Enthusiastic, professional, yet accessible (like a tech influencer).
4.  **Length:** Keep the text under 200 characters (excluding URL).
5.  **Format:** Return ONLY the post text. Do NOT include the URL or title in your output (I will add them). Do NOT use hashtags unless they are extremely relevant (max 1).
6.  **Language:** Strictly write in **${language}**.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text;

        return text ? text.trim() : null;
    } catch (error) {
        console.error('⚠️ Failed to generate AI summary:', error.message);
        return null;
    }
}

async function postToX() {
    // 1. Get file path from args
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('❌ Usage: node scripts/post-to-x.mjs <article-file-path>');
        process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`\n📢 Preparing to post article to X: ${filePath}`);

    // 2. Determine region and config
    const config = getRegionConfig(filePath);
    console.log(`🌍 Target Region: ${config.region}`);

    // Check credentials
    if (!config.appKey || !config.appSecret || !config.accessToken || !config.accessSecret) {
        console.error(`❌ Missing X API credentials for region ${config.region}. Please check your .env file.`);
        // Don't crash the workflow, just exit gracefully if credentials aren't set up yet
        process.exit(0);
    }

    // 3. Read article metadata
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    const slug = path.basename(filePath, path.extname(filePath));

    // Construct URL and content
    const articleUrl = `${config.urlPrefix}${slug}`;
    const cleanTitle = frontmatter.title.replace(/['"]/g, '');

    // Generate AI Summary
    console.log('🤖 Generating AI summary...');
    const aiSummary = await generateSocialPost(cleanTitle, content, config.region);

    let tweetText;
    if (aiSummary) {
        tweetText = `【${cleanTitle}】\n\n${aiSummary}\n\n👉 Read more: ${articleUrl}`;
        // Adjust "Read more" based on language
        if (config.region === 'JP') tweetText = `【${cleanTitle}】\n\n${aiSummary}\n\n⬇️ 記事を読む\n${articleUrl}`;
        if (config.region === 'IN') tweetText = `【${cleanTitle}】\n\n${aiSummary}\n\n👉 देखें: ${articleUrl}`;
    } else {
        // Fallback
        tweetText = `${cleanTitle}\n\n${articleUrl}`;
    }

    console.log('📝 Tweet Content:\n' + '-'.repeat(20) + '\n' + tweetText + '\n' + '-'.repeat(20));

    // Image handling
    let mediaId = null;
    let imagePath = frontmatter.image;

    // Resolve relative image path if necessary
    // Assuming frontmatter.image is like "/images/articles/..." (public folder)
    // or relative to the file.
    // In Astro, images in 'src/content' often use relative paths or imports, but here we likely have strings from generation.
    // If it starts with '/', it is likely in 'public/' or 'src/assets/'. 
    // Let's assume standard project structure where public/ is at root.

    // Try to find the image file
    let localImagePath = null;
    if (imagePath) {
        if (imagePath.startsWith('/')) {
            localImagePath = path.join(process.cwd(), 'public', imagePath);
            if (!fs.existsSync(localImagePath)) {
                // Try src/assets if not in public (common in Astro)
                localImagePath = path.join(process.cwd(), 'src', imagePath);
            }
        } else {
            // Relative path
            localImagePath = path.join(path.dirname(filePath), imagePath);
        }
    }

    // Initialize client
    const client = new TwitterApi({
        appKey: config.appKey,
        appSecret: config.appSecret,
        accessToken: config.accessToken,
        accessSecret: config.accessSecret,
    });

    const rwClient = client.readWrite;

    try {
        // 4. Upload Media if exists
        if (localImagePath && fs.existsSync(localImagePath)) {
            console.log(`📷 Uploading media: ${localImagePath}`);
            try {
                mediaId = await client.v1.uploadMedia(localImagePath);
                console.log('✅ Media uploaded successfully.');
            } catch (err) {
                console.error('⚠️ Failed to upload media:', err.message);
            }
        } else {
            console.log('⚠️ No image found or image path invalid, posting text only.');
        }

        // 5. Post Tweet
        console.log('🐦 Posting tweet...');
        const tweetPayload = { text: tweetText };
        if (mediaId) {
            tweetPayload.media = { media_ids: [mediaId] };
        }

        const tweet = await rwClient.v2.tweet(tweetPayload);
        console.log(`✅ Posted successfully! ID: ${tweet.data.id}`);
        console.log(`🔗 https://x.com/user/status/${tweet.data.id}`);

    } catch (error) {
        console.error('❌ Failed to post to X:', error);
        process.exit(1);
    }
}

postToX();
