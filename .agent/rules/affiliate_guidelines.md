
# Affiliate & Image Guidelines

## 1. Product Images
- **NO HOTLINKING:** Amazon images (m.media-amazon.com) must NEVER be hotlinked. They will break.
- **Download Locally:** Always download the image to `public/images/products/[product-name].jpg`.
- **Verification:** Check file size after download. If < 1KB, the download failed (anti-bot). Use a fallback source (Pexels, Unsplash, or manual upload).

## 2. Affiliate Links
- **Search Links ONLY:** Do NOT use direct `dp/[ASIN]` links. They break if the product OOS or region changes.
- **Format:** Use search query links:
  - **JP:** `https://www.amazon.co.jp/s?k=[KEYWORDS]&tag=blitz011-22`
  - **US:** `https://www.amazon.com/s?k=[KEYWORDS]&tag=blitz011-20`
  - **IN:** `https://www.amazon.in/s?k=[KEYWORDS]&tag=blitz011-21`
- **Rakuten:** Use `https://search.rakuten.co.jp/search/mall/[KEYWORDS]/`

## 3. SNS Generation
- **Full Text:** Always verify the generated tweet text is complete.
- **Intent URL:** Ensure the intent URL is clickable and includes the text.
