import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const apiKey = process.env.PEXELS_API_KEY;
    const url = `https://api.pexels.com/v1/search?query=mens%20loafers%20fashion&per_page=3&orientation=landscape`;
    try {
        const res = await fetch(url, { headers: { Authorization: apiKey } });
        const data = await res.json();
        if (data.photos) {
            data.photos.forEach(p => console.log(p.src.medium));
        }
    } catch (e) {
        console.error(e);
    }
}
run();
