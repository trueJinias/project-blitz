
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash-exp';

async function testImageGen() {
    console.log('Testing Image Generation with Gemini...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const prompt = "Generate an image of a futuristic smartphone concept.";

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ part: [{ text: prompt }] }],
                // explicit request for image? 
                // generationConfig? 
            })
        });

        // Usually standard generateContent is text-only unless configured.
        // Let's check if it fails or returns text.

        if (!response.ok) {
            console.log('Response not OK:', await response.text());
            return;
        }

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error(error);
    }
}

testImageGen();
