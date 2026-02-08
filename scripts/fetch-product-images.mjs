import dotenv from 'dotenv';
dotenv.config();

const queries = [
    "KableCARD product white background",
    "Leatherman Style PS multi-tool white background",
    "NexTool Flagship Mini multi-tool white background",
    "Titanium Pry Bar EDC tool white background",
    "Orbitkey Key Organiser active white background"
];

async function run() {
    const apiKey = process.env.PEXELS_API_KEY;
    for (const q of queries) {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`; // Landscape or square? Product photos are often square.
        try {
            const res = await fetch(url, { headers: { Authorization: apiKey } });
            const data = await res.json();
            if (data.photos && data.photos.length > 0) {
                console.log(`Query: ${q} -> ${data.photos[0].src.medium}`);
            } else {
                console.log(`Query: ${q} -> NO IMAGE`);
            }
        } catch (e) {
            console.error(e);
        }
    }
}
run();
