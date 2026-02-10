
// using native fetch

async function testGenerate() {
    console.log('🚀 Testing /api/generate on port 4322 (Mode: Analysis + Article)...');
    const PORT = 4322;
    const BASE_URL = `http://localhost:${PORT}/api/generate`;

    try {
        // 1. Analysis
        console.log('\n--- Step 1: Analysis ---');
        const resAnalysis = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'analysis',
                keyword: 'MacBook Air M3 review',
                genre: 'tech'
            })
        });

        if (!resAnalysis.ok) {
            console.error(`❌ Analysis Failed: ${resAnalysis.status}`);
            console.error(await resAnalysis.text());
            return;
        }

        const context = await resAnalysis.json();
        console.log('✅ Analysis Success!');
        console.log('Intent:', context.intent);
        console.log('Angle:', context.unique_angle);
        console.log('Headings:', context.headings);
        console.log('Keywords:', context.suggested_keywords); // Check for keywords

        if (!context.suggested_keywords || context.suggested_keywords.length === 0) {
            console.warn('⚠️ No suggested keywords returned');
        }

        // 2. Article (JP)
        console.log('\n--- Step 2: Article (JP) ---');
        const resJp = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'article',
                lang: 'jp',
                keyword: 'MacBook Air M3 review',
                genre: 'tech',
                context: context
            })
        });

        if (!resJp.ok) {
            console.error(`❌ JP Generation Failed: ${resJp.status}`);
            console.error(await resJp.text());
            return;
        }

        const jpData = await resJp.json();
        console.log('✅ JP Generation Success!');
        console.log('Content Length:', jpData.content.length);
        console.log('Preview:', jpData.content.substring(0, 200));

        // Check for images
        const imgCount = (jpData.content.match(/!\[.*?\]/g) || []).length;
        console.log(`📸 Images found: ${imgCount}`);

    } catch (e) {
        console.error('❌ Request Failed:', e.message);
    }
}

testGenerate();
