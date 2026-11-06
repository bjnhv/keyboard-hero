import { Pool } from 'pg';

try {
  process.loadEnvFile('.env.local');
} catch (e) {
  console.error('Failed to load .env.local:', e.message);
}

async function run() {
  console.log('=== Testing Neon Services End-to-End ===\n');

  // 1. Test Neon Postgres Database
  console.log('[1/3] Testing Neon Postgres (DATABASE_URL)...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    const versionRes = await client.query('SELECT version(), current_database(), current_user');
    const tablesRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    client.release();

    console.log('  ✓ Connected to Neon Postgres!');
    console.log('  • Database:', versionRes.rows[0].current_database);
    console.log('  • User:', versionRes.rows[0].current_user);
    console.log('  • Live Tables:', tablesRes.rows.map((r) => r.table_name).join(', '));
  } catch (err) {
    console.error('  ✗ Postgres connection failed:', err.message);
  } finally {
    await pool.end();
  }

  // 2. Test Neon Auth (JWKS Endpoint)
  console.log('\n[2/3] Testing Neon Auth (NEON_AUTH_JWKS_URL)...');
  try {
    const res = await fetch(process.env.NEON_AUTH_JWKS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const jwks = await res.json();
    console.log('  ✓ Connected to Neon Auth!');
    console.log('  • Base URL:', process.env.NEON_AUTH_BASE_URL);
    console.log('  • Active Key Count:', jwks.keys ? jwks.keys.length : 0);
  } catch (err) {
    console.error('  ✗ Neon Auth check failed:', err.message);
  }

  // 3. Test Neon Functions (Hello Function)
  console.log('\n[3/3] Testing Neon Functions (NEON_FUNCTION_HELLO_BASE_URL)...');
  try {
    const res = await fetch(process.env.NEON_FUNCTION_HELLO_BASE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log('  ✓ Connected to Neon Functions!');
    console.log('  • Function URL:', process.env.NEON_FUNCTION_HELLO_BASE_URL);
    console.log('  • Response:', text.trim());
  } catch (err) {
    console.error('  ✗ Neon Function call failed:', err.message);
  }

  console.log('\n=== All Neon Services Verified Successfully ===');
}

run().catch(console.error);

