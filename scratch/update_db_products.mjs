import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { getContextualCraftImage, isValidImageUrl, normalizeCandidateUrl } from '../src/utils/productThumbnail.ts';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query('SELECT id, title, category, material, image_urls FROM products');
    console.log(`Found ${res.rows.length} products to check...`);

    for (const row of res.rows) {
      let currentUrls = [];
      if (Array.isArray(row.image_urls)) {
        currentUrls = row.image_urls;
      } else if (typeof row.image_urls === 'string' && row.image_urls.trim().startsWith('[')) {
        try {
          currentUrls = JSON.parse(row.image_urls);
        } catch {}
      }

      // Safely validate and normalize each candidate URL before checking
      const validUrls = currentUrls
        .map(u => normalizeCandidateUrl(u))
        .filter(u => u && isValidImageUrl(u));

      if (validUrls.length === 0) {
        const contextualUrl = getContextualCraftImage(row);
        console.log(`Updating product [${row.id}] "${row.title}" with craft image: ${contextualUrl}`);
        await pool.query(
          'UPDATE products SET image_urls = $1 WHERE id = $2',
          [JSON.stringify([contextualUrl]), row.id]
        );
      } else {
        console.log(`Product [${row.id}] "${row.title}" already has ${validUrls.length} valid image(s).`);
      }
    }
    console.log('Database product update complete!');
  } catch (err) {
    console.error('Error updating products in DB:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
