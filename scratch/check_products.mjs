import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query('SELECT id, user_id, title, category, image_urls FROM products ORDER BY created_at DESC LIMIT 10');
    console.log(`TOTAL PRODUCTS: ${res.rows.length}`);
    for (const r of res.rows) {
      console.log(`- [${r.id}] ${r.title} (Category: ${r.category}) -> image_urls: ${JSON.stringify(r.image_urls)}`);
    }
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
