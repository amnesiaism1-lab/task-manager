import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, 'backend/.env') });

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL ||
  'postgresql://postgres.tocfpzzbvlviwdybyvzq:QTus%402405200@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function initCatalogTables() {
  console.log('📦 Initializing Priorities & Resolutions in Supabase DB...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(' Connected to Supabase DB.');

    // 1. Create priorities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.priorities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
        key VARCHAR(64) NOT NULL,
        name VARCHAR(120) NOT NULL,
        color VARCHAR(32) NOT NULL DEFAULT '#6366f1',
        order_num INT NOT NULL DEFAULT 0,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_priorities_org_key UNIQUE (org_id, key)
      );
    `);
    console.log('✅ Table `priorities` created/verified.');

    // 2. Create resolutions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.resolutions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
        key VARCHAR(64) NOT NULL,
        name VARCHAR(120) NOT NULL,
        description TEXT,
        order_num INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_resolutions_org_key UNIQUE (org_id, key)
      );
    `);
    console.log('✅ Table `resolutions` created/verified.');

    // 3. Enable RLS on both tables
    await client.query(`
      ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
    `);
    console.log('🛡️  Row Level Security ENABLED on `priorities` and `resolutions`.');

    // 4. Seed default priorities and resolutions for existing organizations
    const orgRes = await client.query(`SELECT id, name FROM public.organizations;`);
    for (const org of orgRes.rows) {
      // Default Priorities
      const defaultPriorities = [
        { key: 'highest', name: 'Highest (P0)', color: '#ef4444', orderNum: 1, isDefault: false },
        { key: 'high', name: 'High (P1)', color: '#f97316', orderNum: 2, isDefault: false },
        { key: 'medium', name: 'Medium (P2)', color: '#eab308', orderNum: 3, isDefault: true },
        { key: 'low', name: 'Low (P3)', color: '#3b82f6', orderNum: 4, isDefault: false },
        { key: 'lowest', name: 'Lowest (P4)', color: '#64748b', orderNum: 5, isDefault: false },
      ];

      for (const p of defaultPriorities) {
        await client.query(`
          INSERT INTO public.priorities (org_id, key, name, color, order_num, is_default)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (org_id, key) DO NOTHING;
        `, [org.id, p.key, p.name, p.color, p.orderNum, p.isDefault]);
      }

      // Default Resolutions
      const defaultResolutions = [
        { key: 'fixed', name: 'Fixed', description: 'A fix for this issue is checked into the repository and tested.', orderNum: 1 },
        { key: 'wont_fix', name: "Won't Fix", description: 'The problem described is an issue which will never be fixed.', orderNum: 2 },
        { key: 'duplicate', name: 'Duplicate', description: 'The problem is a duplicate of an existing issue.', orderNum: 3 },
        { key: 'incomplete', name: 'Incomplete', description: 'The problem is not completely described.', orderNum: 4 },
        { key: 'cannot_reproduce', name: 'Cannot Reproduce', description: 'Attempts to reproduce this issue have failed.', orderNum: 5 },
        { key: 'done', name: 'Done', description: 'Work has been completed.', orderNum: 6 },
      ];

      for (const r of defaultResolutions) {
        await client.query(`
          INSERT INTO public.resolutions (org_id, key, name, description, order_num)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (org_id, key) DO NOTHING;
        `, [org.id, r.key, r.name, r.description, r.orderNum]);
      }
    }

    console.log(`🌱 Default priorities and resolutions seeded for ${orgRes.rows.length} organization(s).`);
  } catch (err) {
    console.error('❌ Error initializing catalog tables:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

initCatalogTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
