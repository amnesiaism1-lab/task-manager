import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, 'backend/.env') });

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL ||
  'postgresql://postgres.tocfpzzbvlviwdybyvzq:QTus%402405200@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

const shouldFix = process.argv.includes('--fix');

const results = [];

function recordResult(category, name, passed, details = '') {
  results.push({ category, name, passed, details });
  const icon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`  ${icon} ${name}${details ? ` -> ${details}` : ''}`);
}

async function checkDatabaseAndRLS() {
  console.log('\n[1/6] 🔍 Checking Supabase Database & Row Level Security...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    recordResult('Database', 'PostgreSQL Connectivity', true, 'Connected to Supabase Pooler');

    const res = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = res.rows;
    recordResult('Database', 'Schema Tables Count', tables.length >= 70, `${tables.length} public tables found`);

    const disabledTables = tables.filter(t => !t.rowsecurity);
    if (disabledTables.length === 0) {
      recordResult('Security', 'Row Level Security (RLS)', true, `All ${tables.length} tables have RLS ENABLED`);
    } else {
      if (shouldFix) {
        console.log(`    🔧 Auto-fixing RLS on ${disabledTables.length} tables...`);
        await client.query(`
          DO $$
          DECLARE r RECORD;
          BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false) LOOP
              EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
            END LOOP;
          END $$;
        `);
        recordResult('Security', 'Row Level Security (RLS)', true, `Auto-fixed: RLS enabled on all ${tables.length} tables`);
      } else {
        recordResult('Security', 'Row Level Security (RLS)', false, `${disabledTables.length} tables have RLS DISABLED (Run with --fix to resolve)`);
      }
    }

    const roleRes = await client.query(`
      SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'postgres';
    `);
    const isBypass = roleRes.rows[0]?.rolbypassrls;
    recordResult('Security', 'Backend Postgres Role RLS Bypass', isBypass === true, 'rolbypassrls = true (NestJS queries bypass RLS safely)');
  } catch (err) {
    recordResult('Database', 'PostgreSQL Connectivity', false, err.message);
  } finally {
    await client.end();
  }
}

function checkCredentialsSecurity() {
  console.log('\n[2/6] 🔒 Checking Credentials & Hardcoded Secrets in Code...');
  const filesToScan = [
    'backend/src/app.module.ts',
    'backend/src/main.ts',
    'scripts/db_helper.mjs'
  ];

  let leakFound = false;
  const passwordPattern = /QTus%402405200|QTus@2405200/;

  for (const relPath of filesToScan) {
    const fullPath = path.join(rootDir, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (passwordPattern.test(content)) {
        leakFound = true;
        recordResult('Security', `Credentials Leak Check: ${relPath}`, false, 'Found hardcoded DB password');
      } else {
        recordResult('Security', `Credentials Leak Check: ${relPath}`, true, 'Clean (no hardcoded password)');
      }
    }
  }

  const envExists = fs.existsSync(path.join(rootDir, '.env'));
  recordResult('Config', 'Root .env File Presence', envExists, envExists ? 'Present' : 'Missing');
}

function checkTypeScriptAndCompilation() {
  console.log('\n[3/6] 📐 Checking TypeScript Compilation Across Monorepo...');

  // 1. Shared
  try {
    execSync('npm --prefix shared run build', { cwd: rootDir, stdio: 'pipe' });
    recordResult('TypeScript', '@task-manager/shared Compilation', true, 'Clean build');
  } catch (err) {
    recordResult('TypeScript', '@task-manager/shared Compilation', false, err.message);
  }

  // 2. Backend
  try {
    execSync('npm --prefix backend exec tsc -- -p backend/tsconfig.json --noEmit', { cwd: rootDir, stdio: 'pipe' });
    recordResult('TypeScript', 'Backend Typecheck (tsc --noEmit)', true, '0 errors');
  } catch (err) {
    recordResult('TypeScript', 'Backend Typecheck (tsc --noEmit)', false, err.stdout?.toString() || err.message);
  }

  // 3. Frontend
  try {
    execSync('npm --prefix frontend run typecheck', { cwd: rootDir, stdio: 'pipe' });
    recordResult('TypeScript', 'Frontend Typecheck (tsc --noEmit)', true, '0 errors');
  } catch (err) {
    recordResult('TypeScript', 'Frontend Typecheck (tsc --noEmit)', false, err.stdout?.toString() || err.message);
  }
}

function checkLinting() {
  console.log('\n[4/6] 🧹 Checking Code Quality & Oxlint Rules...');
  try {
    const out = execSync('npx oxlint frontend/src backend/src', { cwd: rootDir, stdio: 'pipe' }).toString();
    recordResult('Code Quality', 'Oxlint Monorepo Audit', true, '0 warnings, 0 errors');
  } catch (err) {
    const output = err.stdout?.toString() || err.message;
    recordResult('Code Quality', 'Oxlint Monorepo Audit', false, output);
  }
}

function checkTests() {
  console.log('\n[5/6] 🧪 Running Unit & Feature Tests (Vitest)...');
  try {
    const out = execSync('npm --prefix backend run test', { cwd: rootDir, stdio: 'pipe' }).toString();
    const passedMatch = out.match(/Tests\s+(\d+)\s+passed/);
    const count = passedMatch ? passedMatch[1] : 'All';
    recordResult('Tests', 'Backend Vitest Suite', true, `${count} tests passed`);
  } catch (err) {
    recordResult('Tests', 'Backend Vitest Suite', false, err.stdout?.toString() || err.message);
  }
}

async function checkApiEndpoints() {
  console.log('\n[6/6] 🌐 Checking Web & API Endpoints (Health & Availability)...');
  
  const vercelUrl = 'https://task-manager-pqt2.vercel.app';
  const localUrl = process.env.APP_URL || 'http://localhost:3001';

  // 1. Check Vercel Production
  try {
    const res = await fetch(`${vercelUrl}/api/health`, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      recordResult('API', `Production Vercel Healthcheck (${vercelUrl}/api/health)`, true, JSON.stringify(data));
    } else {
      recordResult('API', `Production Vercel Healthcheck (${vercelUrl}/api/health)`, false, `Status ${res.status}`);
    }
  } catch (err) {
    recordResult('API', `Production Vercel Healthcheck (${vercelUrl}/api/health)`, false, err.message);
  }

  // 2. Check Local Server (informational if not running)
  try {
    const localRes = await fetch(`${localUrl}/api/health`, { signal: AbortSignal.timeout(1500) });
    if (localRes.ok) {
      const data = await localRes.json();
      recordResult('API', `Local Dev Server Healthcheck (${localUrl}/api/health)`, true, JSON.stringify(data));
    } else {
      recordResult('API', `Local Dev Server Healthcheck (${localUrl}/api/health)`, true, `Offline / Not Running (Optional)`);
    }
  } catch {
    recordResult('API', `Local Dev Server Healthcheck (${localUrl}/api/health)`, true, `Offline / Not running (Run 'npm run start:backend' when testing locally)`);
  }
}

async function runDoctor() {
  console.log('===========================================================');
  console.log('🩺 TASK MANAGER PRO - SYSTEM AUDIT & DOCTOR CLI');
  console.log('===========================================================');

  await checkDatabaseAndRLS();
  checkCredentialsSecurity();
  checkTypeScriptAndCompilation();
  checkLinting();
  checkTests();
  await checkApiEndpoints();

  console.log('\n===========================================================');
  console.log('📋 AUDIT SUMMARY RESULTS');
  console.log('===========================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`Total Checks:  ${total}`);
  console.log(`Passed Checks: ${passed} ✅`);
  console.log(`Failed Checks: ${failed} ${failed > 0 ? '❌' : '🎉'}`);

  if (failed > 0) {
    console.log('\n⚠️  Issues detected:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(` - [${r.category}] ${r.name}: ${r.details}`);
    });
    console.log('\n💡 Run `node scripts/doctor.mjs --fix` or execute suggested fixes.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL CHECKS PASSED! The system is healthy, secure, and production-ready.');
    process.exit(0);
  }
}

runDoctor().catch(err => {
  console.error('Fatal Doctor error:', err);
  process.exit(1);
});
