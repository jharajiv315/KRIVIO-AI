import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM products');
    const totalProducts = countRes.rows[0].total;
    console.log(`[Inventory Metrics] Total Products in Database: ${totalProducts}`);

    const sampleLimit = 10;
    const res = await pool.query(
      'SELECT id, user_id, title, category, image_urls FROM products ORDER BY created_at DESC LIMIT $1',
      [sampleLimit]
    );
    console.log(`[Inventory Inspection] Sample Checked: ${res.rows.length} of ${totalProducts} total products`);
    for (const r of res.rows) {
      console.log(` - [${r.id}] "${r.title}" (Category: ${r.category}) -> image_urls: ${JSON.stringify(r.image_urls)}`);
    }
  } catch (err) {
    console.error('[Database Inspection Error]: Failed to query products table:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
