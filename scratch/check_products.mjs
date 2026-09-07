import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = countRes.rows[0].count;
    console.log(`Total products: ${totalProducts}`);

    const res = await pool.query('SELECT id, user_id, title, category, image_urls FROM products ORDER BY created_at DESC LIMIT 10');
    console.log(`Sample checked: ${res.rows.length}`);
    for (const r of res.rows) {
      console.log(`- [${r.id}] ${r.title} (Category: ${r.category}) -> image_urls: ${JSON.stringify(r.image_urls)}`);
    }
  } catch (err) {
    console.error('Database Error:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
