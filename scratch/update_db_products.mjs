import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { getContextualCraftImage } from '../src/utils/productThumbnail.ts';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query('SELECT id, title, category, material, image_urls FROM products');
    console.log(`Found ${res.rows.length} products to check...`);

    for (const row of res.rows) {
      let currentUrls = [];
      if (Array.isArray(row.image_urls)) currentUrls = row.image_urls;
      else if (typeof row.image_urls === 'string' && row.image_urls.startsWith('[')) {
        try { currentUrls = JSON.parse(row.image_urls); } catch {}
      }

      // Check if currentUrls has valid, accessible URLs (filter out example.com or empty)
      const validUrls = currentUrls.filter(u => u && !u.includes('example.com') && !u.includes('placeholder'));

      if (validUrls.length === 0) {
        const contextualUrl = getContextualCraftImage(row);
        console.log(`Updating product [${row.id}] "${row.title}" with craft image: ${contextualUrl}`);
        await pool.query(
          'UPDATE products SET image_urls = $1 WHERE id = $2',
          [JSON.stringify([contextualUrl]), row.id]
        );
      } else {
        console.log(`Product [${row.id}] "${row.title}" already has valid image.`);
      }
    }
    console.log('Database product update complete!');
  } catch (err) {
    console.error('Error updating products in DB:', err);
  } finally {
    await pool.end();
  }
}

run();
