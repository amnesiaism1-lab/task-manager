import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root and backend
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const { Client } = pg;

const dbUrl = process.env.DATABASE_URL ||
  'postgresql://postgres.tocfpzzbvlviwdybyvzq:QTus%402405200@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

export async function enableRLSOnAllTables() {
  console.log('====================================================');
  console.log('🛡️  SUPABASE ROW LEVEL SECURITY (RLS) AUTO-FIX TOOL');
  console.log('====================================================');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(' Connected to Supabase PostgreSQL successfully.');

    // 1. Fetch current RLS status on all public tables
    const tableRes = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = tableRes.rows;
    const disabledTables = tables.filter(t => !t.rowsecurity);
    console.log(`📊 Total public tables: ${tables.length}`);
    console.log(`⚠️  Tables with RLS DISABLED: ${disabledTables.length}`);

    if (disabledTables.length === 0) {
      console.log('✅ All public tables already have Row Level Security ENABLED!');
      return { success: true, count: tables.length, enabled: 0 };
    }

    console.log('\n🔧 Enabling Row Level Security on all tables...');

    // 2. Enable RLS on all tables in public schema in a single DO block
    const enableQuery = `
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false) LOOP
              EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
          END LOOP;
      END $$;
    `;

    await client.query(enableQuery);

    // 3. Verify status after execution
    const verifyRes = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const remainingDisabled = verifyRes.rows.filter(t => !t.rowsecurity);

    if (remainingDisabled.length === 0) {
      console.log(`\n🎉 SUCCESS! Row Level Security has been ENABLED on all ${verifyRes.rows.length} public tables!`);
      console.log('🛡️  Supabase Security Advisor CRITICAL warnings are now cleared.');
      console.log('💡 Note: NestJS Backend continues to operate smoothly as the postgres role has "rolbypassrls = true".');
      return { success: true, count: verifyRes.rows.length, fixed: disabledTables.length };
    } else {
      console.error(`\n❌ Warning: ${remainingDisabled.length} tables still have RLS disabled:`, remainingDisabled.map(t => t.tablename));
      return { success: false, remaining: remainingDisabled };
    }
  } catch (err) {
    console.error('❌ Failed to enable RLS:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  enableRLSOnAllTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
