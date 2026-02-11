import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash-lite-001';

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    process.exit(1);
}

console.log(`🤖 Testing Gemini API with model: ${MODEL}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 5)}...`);

async function testGemini() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, confirm you are working." }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            console.error(`📝 Error Details:`, errorText);
            return;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('✅ Success! Response:', text);

    } catch (error) {
        console.error('❌ Network/Script Error:', error);
    }
}

testGemini();
