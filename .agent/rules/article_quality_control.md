
# Article Quality Control Rules

To prevent recurring issues with affiliate links, images, and formatting.

## 1. Affiliate Images
- **Source**: Images MUST be downloaded to `public/images/products/` before use.
- **Verification**: Check verification that the downloaded file is a valid image (size > 1KB).
- **Format**: Use local paths in markdown: `/images/products/filename.jpg`.
- **Prohibited**: Do NOT use direct hotlinks to Amazon (e.g., `m.media-amazon.com...`) as they may expire or break.

## 2. Affiliate Links
- **Format**: ALWAYS use direct product links: `https://[domain]/dp/[ASIN]?tag=[tag]`.
- **Prohibited**: Search result links (`/s?k=...`) are NOT allowed for specific product recommendations.
- **ASIN Search**: Explicitly search for the ASIN of prominent products in the target region (US/IN) instead of guessing or using generic searches.

## 3. Formatting
- **Bold Text**: Do NOT use `**bold**` in the final output. Use `<strong>bold</strong>` tags to ensure consistent styling without markdown artifacts.
- **HTML Blocks**: Ensure all HTML blocks (like `.product-links`) are properly closed and formatted.

## 4. SNS Posts
- **Method**: Use the "Semi-Automatic" intent URL method (`https://twitter.com/intent/tweet?...`).
- **Output**: When reporting completion, explicitly provide the full Intent URL for the user to click.
