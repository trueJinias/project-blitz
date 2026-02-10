// API: Client-Side Orchestration for AI Article Generation
import type { APIRoute } from 'astro';

export const prerender = false;

// Types
interface AnalysisResult {
    intent: string;
    unique_angle: string;
    headings: string[];
    suggested_keywords: string[];
}

interface ImageResult {
    url: string;
    alt: string;
    photographer: string;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { mode, keyword, genre } = body;

        const GEMINI_KEY = import.meta.env.GEMINI_API_KEY;
        if (!GEMINI_KEY) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY未設定' }), { status: 500 });
        }

        // --- Mode 1: Analysis ---
        if (mode === 'analysis') {
            const prompt = `
Analyze the keyword "${keyword}" for a high-quality tech/lifestyle blog.

1. **Search Intent**: What are users looking for?
2. **Competitor Gaps**: What unique value can we add?
3. **Structure**: Create a detailed outline with 5-7 H2 headings.
4. **Next Steps**: Suggest 5 related long-tail keywords for future articles to build topical authority.
5. **Output**: ONE VALID JSON object.

Output strictly as ONE VALID JSON object:
{
  "intent": "string",
  "unique_angle": "string",
  "headings": ["H2 1", "H2 2", ...],
  "suggested_keywords": ["Keyword 1", "Keyword 2", ...]
}
`;
            const result = await callGeminiJSON(prompt, GEMINI_KEY);
            return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // --- Mode 2: Generate Article (Per Language) ---
        if (mode === 'article') {
            const { lang, context } = body; // context = { intent, unique_angle, headings }
            if (!context) return new Response(JSON.stringify({ error: 'Context required' }), { status: 400 });

            const today = new Date().toISOString().split('T')[0];
            const headingsList = context.headings.map((h: string) => `- ${h}`).join('\n');
            const uniqueAngle = context.unique_angle;

            // Common Rules
            const commonRules = `
- **Markdown Only**: No code blocks.
- **Bold Rules**: ✅ \`**Text**\` OK, ❌ \`**「Text」**\` NG.
- **Affiliate Integration**:
  Use valid HTML for product links:
  \`\`\`html
  <div class="product-links">
    <div class="product-header">
      <div class="product-info">
        <div class="product-label"><span class="label-icon">🛍️</span><span class="label-text">値段を確認:</span></div>
        <div class="product-name">PRODUCT_NAME</div>
      </div>
    </div>
    <div class="buttons">
      <a href="https://www.amazon.co.jp/s?k=PRODUCT_NAME&tag=blitz011-22" target="_blank" class="btn amazon">
        <img src="/images/amazon-logo.png" alt="Amazon" class="logo-img amazon-img" />
      </a>
      ${lang === 'jp' ? `<a href="https://hb.afl.rakuten.co.jp/hgc/50b8fe39.c32fe89a.50b8fe3a.60c7ccae/?pc=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPRODUCT_NAME%2F" target="_blank" class="btn rakuten"><img src="/images/rakuten-logo.png" alt="Rakuten" class="logo-img rakuten-img" /></a>` : ''}
    </div>
  </div>
  \`\`\`
- **Images**: After EVERY H2, insert: \`<!-- IMAGE_QUERY: english query -->\`
`;

            // Language specifics
            let prompt = '';
            let author = '';
            if (lang === 'jp') {
                prompt = `Write a Japanese blog article for "${keyword}" (${genre}). Target: 30s Tech Enthusiast. Tone: Friendly, expert. Use PREP. 1500+ chars. Structure:\n${headingsList}\nAngle: ${uniqueAngle}\nRules:\n${commonRules}`;
                author = 'なも兄';
            } else if (lang === 'us') {
                prompt = `Write a US English blog article for "${keyword}" (${genre}). Tone: Native, engaging. 1200+ words. Structure:\n${headingsList}\nAngle: ${uniqueAngle}\nRules:\n${commonRules}`;
                author = 'John Smith';
            } else if (lang === 'in') {
                prompt = `Write an Indian English blog article for "${keyword}" (${genre}). Tone: Native, Indian market focus (₹). 1200+ words. Structure:\n${headingsList}\nAngle: ${uniqueAngle}\nRules:\n${commonRules}`;
                author = 'Raj Patel';
            }

            prompt += `\nFrontmatter:\n---\ntitle: "Title"\ndescription: "Desc"\ngenre: ${genre}\ndate: ${today}T00:00:00.000Z\nimage: ""\ntags: []\nauthor: "${author}"\ndraft: false\n---`;

            // Generate
            const rawContent = await callGemini(prompt, GEMINI_KEY);

            // Enhance with Images
            const refinedContent = cleanArticleOutput(rawContent);
            const outputContent = await enhanceWithImages(refinedContent);

            return new Response(JSON.stringify({ content: outputContent }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // --- Mode 3: Thumbnail (Optional) ---
        if (mode === 'thumbnail') {
            const { query } = body;
            const img = await searchImage(query + ' wallpaper', 'landscape');
            return new Response(JSON.stringify({ url: img ? img.url : '' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Internal error';
        return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

// --- Helpers ---

async function callGemini(prompt: string, apiKey: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
        })
    });

    if (!res.ok) {
        if (res.status === 429) {
            if (import.meta.env.DEV) {
                console.warn('Gemini 429: Using Mock Data (Dev Mode)');
                return "MOCK CONTENT: This is a generated article for testing purposes because the API rate limit was exceeded. \n\n## Introduction\nMock introduction.\n\n## Section 1\nMock content.\n<!-- IMAGE_QUERY: mock query -->\n\n## Conclusion\nMock conclusion.";
            }
            throw new Error('Rate Limit (429)');
        }
        const err = await res.text();
        console.error('Gemini Error Text:', err);
        throw new Error(`Gemini Error: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiJSON(prompt: string, apiKey: string): Promise<AnalysisResult> {
    const text = await callGemini(prompt + "\nResponse must be valid JSON.", apiKey);

    // If mock data
    if (text.startsWith("MOCK CONTENT")) {
        return {
            intent: "Mock Review",
            unique_angle: "Mock Angle",
            headings: ["Mock H2 1", "Mock H2 2"],
            suggested_keywords: ["Mock Keyword 1", "Mock Keyword 2", "Mock Long Tail 3"]
        };
    }

    const jsonStr = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    try {
        const parsed = JSON.parse(jsonStr);
        // Ensure suggested_keywords exists
        if (!parsed.suggested_keywords) parsed.suggested_keywords = [];
        return parsed as AnalysisResult;
    } catch (e) {
        return {
            intent: "Review",
            unique_angle: "Deep Dive",
            headings: ["Overview", "Specs", "Review", "Conclusion"],
            suggested_keywords: ["Review", "Specs", "Price"]
        };
    }
}

async function enhanceWithImages(markdown: string): Promise<string> {
    const regex = /<!-- IMAGE_QUERY: (.*?) -->/g;
    let match;
    const queries: { placeholder: string, query: string }[] = [];
    while ((match = regex.exec(markdown)) !== null) {
        queries.push({ placeholder: match[0], query: match[1] });
    }

    const uniqueQueries = [...new Set(queries.map(q => q.query))];
    const imageMap = new Map<string, string>();

    await Promise.all(uniqueQueries.map(async (q) => {
        const img = await searchImage(q);
        if (img) imageMap.set(q, `\n![${img.alt}](${img.url})\n*Photo by ${img.photographer}*`);
        else imageMap.set(q, '');
    }));

    let newMarkdown = markdown;
    for (const q of queries) {
        newMarkdown = newMarkdown.replace(q.placeholder, imageMap.get(q.query) || '');
    }
    return newMarkdown;
}

async function searchImage(query: string, orientation = 'landscape'): Promise<ImageResult | null> {
    const PEXELS_KEY = import.meta.env.PEXELS_API_KEY;
    const UNSPLASH_KEY = import.meta.env.UNSPLASH_ACCESS_KEY;
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    if (!cleanQuery) return null;

    if (UNSPLASH_KEY) {
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(cleanQuery)}&per_page=1&orientation=${orientation}`, {
                headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.results?.[0]) return {
                    url: data.results[0].urls.regular,
                    alt: data.results[0].alt_description || query,
                    photographer: `${data.results[0].user.name} on Unsplash`
                };
            }
        } catch (e) { }
    }

    if (PEXELS_KEY) {
        try {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanQuery)}&per_page=1&orientation=${orientation}`, {
                headers: { Authorization: PEXELS_KEY }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.photos?.[0]) return {
                    url: data.photos[0].src.large,
                    alt: data.photos[0].alt || query,
                    photographer: `${data.photos[0].photographer} on Pexels`
                };
            }
        } catch (e) { }
    }
    return null;
}

function cleanArticleOutput(text: string): string {
    return text.replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}
