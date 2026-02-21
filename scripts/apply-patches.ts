
import { Pool } from 'pg';
import 'dotenv/config';

async function applyPatches() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  try {
    console.log('🚀 Applying custom database constraints and indexes...');
    
    // 1. Partial Unique Index for Request
    await pool.query(`
      DROP INDEX IF EXISTS one_active_request_per_item;
      CREATE UNIQUE INDEX one_active_request_per_item 
      ON requests (item_id) 
      WHERE status IN ('PENDING', 'APPROVED', 'BORROWED');
    `);
    console.log('✅ Created partial unique index on requests(item_id).');

    // 2. CHECK constraint for Item
    await pool.query(`
      ALTER TABLE items DROP CONSTRAINT IF EXISTS check_item_ownership;
      ALTER TABLE items ADD CONSTRAINT check_item_ownership CHECK (
          (owner_id IS NOT NULL AND group_id IS NULL) OR 
          (owner_id IS NULL AND group_id IS NOT NULL)
      );
    `);
    console.log('✅ Created check constraint for item ownership.');

    console.log('✨ All patches applied successfully.');
  } catch (err) {
    console.error('❌ Error applying patches:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyPatches();
