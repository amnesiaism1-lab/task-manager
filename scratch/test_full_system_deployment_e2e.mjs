/**
 * Full System Deployment & Integration Verification E2E Script
 * Validates production readiness across all layers:
 * 1. Health & Environment Validation
 * 2. Auth, OAuth 2.0 & Session Management (UC-AUTH)
 * 3. Multi-Tenant Organization & Onboarding Lifecycle (UC-ORG)
 * 4. System Admin & Global Platform Controls (UC-SYS)
 * 5. Project, Workflow & Catalogs (UC-PRJ, UC-WF)
 * 6. Agile Sprints & Backlog Planning (UC-SPR, UC-BRD)
 * 7. Kanban Boards, Columns & WIP Limits (UC-BRD)
 * 8. Issue Lifecycle, Optimistic Locking & Audit (UC-ISS)
 * 9. Advanced Filters & AST Querying (UC-FLT)
 * 10. Dashboards & Metric Gadgets (UC-DSH)
 * 11. Developer Ecosystem: PAT & Webhooks (UC-INT)
 * 12. Transactional Outbox, Notifications & Worker Event Loop (UC-JOB, UC-NOTIF)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const API_BASE = 'http://localhost:3001/api';
let passCount = 0;
let failCount = 0;
const report = [];

function check(title, condition, extra = '') {
  if (condition) {
    passCount++;
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${title} ${extra ? `\x1b[90m(${extra})\x1b[0m` : ''}`);
    report.push({ title, status: 'PASS', extra });
  } else {
    failCount++;
    console.error(`  \x1b[31m✘ [FAIL]\x1b[0m ${title} ${extra ? `\x1b[90m(${extra})\x1b[0m` : ''}`);
    report.push({ title, status: 'FAIL', extra });
  }
}

function db(sql) {
  const sanitized = sql.replace(/"/g, '\\"');
  try {
    const output = execSync(
      `docker exec -i tm_postgres psql -U dev -d task_manager -t -A -c "${sanitized}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const lines = output.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('INSERT ') && !l.startsWith('UPDATE ') && !l.startsWith('DELETE '));
    return lines[0] || '';
  } catch (err) {
    throw new Error(`Postgres query error: ${err.stderr || err.message}`);
  }
}

async function request(path, opts = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers });
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m       TASK MANAGER — PRODUCTION DEPLOYMENT & FULL SYSTEM E2E SUITE     \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  // 1. Container & Deployment Files Check
  console.log('\x1b[33m▶ [1/12] Deployment Manifests & Container Files Validation\x1b[0m');
  check('backend/Dockerfile exists and has multi-stage build', existsSync('backend/Dockerfile') && readFileSync('backend/Dockerfile', 'utf8').includes('runner'));
  check('frontend/Dockerfile exists and uses nginx', existsSync('frontend/Dockerfile') && readFileSync('frontend/Dockerfile', 'utf8').includes('nginx'));
  check('frontend/nginx.conf contains SPA fallback and API proxy', existsSync('frontend/nginx.conf') && readFileSync('frontend/nginx.conf', 'utf8').includes('try_files') && readFileSync('frontend/nginx.conf', 'utf8').includes('proxy_pass http://backend:3001'));
  check('docker-compose.prod.yml contains all 5 services', existsSync('docker-compose.prod.yml') && ['postgres:', 'redis:', 'backend:', 'worker:', 'frontend:'].every(s => readFileSync('docker-compose.prod.yml', 'utf8').includes(s)));
  check('.env.production.example contains all required vars', existsSync('.env.production.example') && ['DATABASE_NAME', 'JWT_SECRET', 'RUN_WORKERS'].every(v => readFileSync('.env.production.example', 'utf8').includes(v)));
  check('DEPLOYMENT.md guide is documented', existsSync('DEPLOYMENT.md') && readFileSync('DEPLOYMENT.md', 'utf8').includes('Production Deployment Guide'));

  // 2. Healthcheck & Database Connection
  console.log('\n\x1b[33m▶ [2/12] System Health & Database Connectivity\x1b[0m');
  const healthRes = await request('/health');
  check('GET /api/health returns HTTP 200 OK', healthRes.status === 200 && healthRes.data?.status === 'ok', JSON.stringify(healthRes.data));
  const pgVer = db('SELECT version();');
  check('PostgreSQL 16 container tm_postgres reachable', pgVer.toLowerCase().includes('postgresql 16'), pgVer.slice(0, 30));

  // 3. Auth, OAuth 2.0 & Session Management (UC-AUTH)
  console.log('\n\x1b[33m▶ [3/12] UC-AUTH: Authentication, Sessions & Google OAuth 2.0\x1b[0m');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' }),
  });
  check('Admin login succeeds with JWT', adminLogin.ok && !!adminLogin.data?.accessToken);
  const adminToken = adminLogin.data?.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Google OAuth 2.0 API Test
  const googleEmail = `deploy_google_${Date.now()}@gmail.com`;
  const googleRes = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      email: googleEmail,
      fullName: 'Deploy Tester Google',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default',
    }),
  });
  check('POST /api/auth/google registers & issues JWT', googleRes.ok && !!googleRes.data?.accessToken, googleEmail);
  const googleUserInDb = db(`SELECT email, email_verified_at IS NOT NULL FROM users WHERE email = '${googleEmail}';`);
  check('Google user created with auto-verified email in PostgreSQL', googleUserInDb.includes('t'), googleUserInDb);

  // 4. System Admin & User Management Controls (UC-SYS)
  console.log('\n\x1b[33m▶ [4/12] UC-SYS: Platform Admin Controls & User Management\x1b[0m');
  const testUserEmail = `managed_user_${Date.now()}@taskmanager.dev`;
  const createUserRes = await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      email: testUserEmail,
      fullName: 'Managed User',
      password: 'User@123456',
      status: 'active',
      isSystemAdmin: false,
    }),
  });
  check('POST /api/admin/users creates user directly', createUserRes.ok && createUserRes.data?.email === testUserEmail);
  const createdUserId = createUserRes.data?.id;

  const patchUserRes = await request(`/admin/users/${createdUserId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ fullName: 'Managed User Updated' }),
  });
  check('PATCH /api/admin/users/:id updates user properties', patchUserRes.ok && patchUserRes.data?.fullName === 'Managed User Updated');

  const deleteUserRes = await request(`/admin/users/${createdUserId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  check('DELETE /api/admin/users/:id safely soft-deletes user', deleteUserRes.ok && deleteUserRes.data?.success === true);

  // 5. Multi-Tenant Organization & Onboarding (UC-ORG)
  console.log('\n\x1b[33m▶ [5/12] UC-ORG: Organization & Member Lifecycle\x1b[0m');
  const orgKey = `DPL${Math.floor(100 + Math.random() * 899)}`;
  const createOrgRes = await request('/organizations', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: `Deploy Org ${orgKey}`, key: orgKey }),
  });
  check('POST /organizations creates new tenant', createOrgRes.ok && (createOrgRes.data?.id || createOrgRes.data?.organization?.id));
  const orgId = createOrgRes.data?.id || createOrgRes.data?.organization?.id;

  // Fetch roles
  const rolesRes = await request(`/organizations/${orgId}/roles`, { headers: adminHeaders });
  const roleId = rolesRes.data?.[0]?.id;

  // Invite Member
  const inviteEmail = `invitee_${Date.now()}@taskmanager.dev`;
  const inviteRes = await request(`/organizations/${orgId}/invitations`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ email: inviteEmail, roleId }),
  });
  check('POST /organizations/:id/invitations creates pending invite', inviteRes.ok && inviteRes.data?.id);
  const invitationId = inviteRes.data?.id;

  // Create invitee user verified
  await request('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ email: inviteEmail, fullName: 'Deploy Invitee', password: 'Password@123', status: 'active' }),
  });
  const inviteeLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: inviteEmail, password: 'Password@123' }),
  });
  const inviteeToken = inviteeLogin.data?.accessToken;
  const inviteeHeaders = { Authorization: `Bearer ${inviteeToken}` };

  const myInvitesRes = await request('/organizations/invitations/me', { headers: inviteeHeaders });
  check('GET /organizations/invitations/me returns invite', myInvitesRes.ok && Array.isArray(myInvitesRes.data) && myInvitesRes.data.some(i => i.id === invitationId));

  // Accept in-app
  const acceptRes = await request('/organizations/invitations/accept', {
    method: 'POST',
    headers: inviteeHeaders,
    body: JSON.stringify({ invitationId }),
  });
  check('POST /organizations/invitations/accept adds member', acceptRes.ok && (acceptRes.data?.organization?.id === orgId || acceptRes.data?.member?.orgId === orgId));

  // 6. Project, Catalogs & Workflows (UC-PRJ, UC-WF)
  console.log('\n\x1b[33m▶ [6/12] UC-PRJ & UC-WF: Project Workspace & Catalogs\x1b[0m');
  const prjKey = `PRJ${Date.now().toString().slice(-3)}`;
  const prjRes = await request(`/organizations/${orgId}/projects`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      key: prjKey,
      name: `Deploy Project ${prjKey}`,
      description: 'End to end testing project workspace',
      visibility: 'private',
    }),
  });
  check('POST /organizations/:id/projects creates project', prjRes.ok && (prjRes.data?.id || prjRes.data?.project?.id));
  const prjId = prjRes.data?.id || prjRes.data?.project?.id;

  // 7. Agile Sprints & Backlog Lifecycle (UC-SPR, UC-BRD)
  console.log('\n\x1b[33m▶ [7/12] UC-BRD & UC-SPR: Boards, WIP Limits & Sprints\x1b[0m');
  const boardRes = await request(`/organizations/${orgId}/projects/${prjId}/boards`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'Production Kanban', boardType: 'kanban' }),
  });
  check('POST /organizations/:id/projects/:prjId/boards creates board', boardRes.ok && boardRes.data?.id);
  const boardId = boardRes.data?.id;

  const columnRes = await request(`/organizations/${orgId}/projects/${prjId}/boards/${boardId}/columns`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'In Review', wipLimit: 4 }),
  });
  check('POST /columns sets WIP limit = 4', columnRes.ok && columnRes.data?.wipLimit === 4);

  // Scrum board & sprint
  const scrumRes = await request(`/organizations/${orgId}/projects/${prjId}/boards`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'Production Scrum', boardType: 'scrum' }),
  });
  const scrumBoardId = scrumRes.data?.id;

  const sprintRes = await request(`/organizations/${orgId}/projects/${prjId}/boards/${scrumBoardId}/sprints`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'Sprint Alpha', goal: 'Deploy verification' }),
  });
  check('POST /sprints creates planned sprint', sprintRes.ok && sprintRes.data?.state === 'planned');
  const sprintId = sprintRes.data?.id;

  const startSprintRes = await request(`/organizations/${orgId}/projects/${prjId}/sprints/${sprintId}/start`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({}),
  });
  check('PATCH /sprints/:id/start activates sprint', startSprintRes.ok && startSprintRes.data?.state === 'active');

  // 8. Issue Lifecycle, Optimistic Locking & Audit (UC-ISS)
  console.log('\n\x1b[33m▶ [8/12] UC-ISS: Issue Management & Optimistic Locking Guard\x1b[0m');
  const issueRes = await request(`/organizations/${orgId}/projects/${prjId}/issues`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      sprintId: sprintId,
      issueTypeKey: 'task',
      summary: 'Deployment Test Issue',
      description: 'Verifying end-to-end flow before production release',
      priority: 'High',
    }),
  });
  check('POST /issues creates issue with version 1', issueRes.ok && (issueRes.data?.version === 1 || issueRes.data?.version === '1'));
  const issueId = issueRes.data?.id;

  // Optimistic concurrency conflict test
  const staleUpdate = await request(`/organizations/${orgId}/issues/${issueId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ summary: 'Stale attempt', expectedVersion: '999' }),
  });
  check('Optimistic locking rejects stale version with HTTP 409', staleUpdate.status === 409);

  const validUpdate = await request(`/organizations/${orgId}/issues/${issueId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ summary: 'Valid updated Deployment summary', expectedVersion: '1' }),
  });
  check('Valid update increments version to 2', validUpdate.ok && (validUpdate.data?.version === 2 || validUpdate.data?.version === '2'));

  // Worklog & Comments
  const commentRes = await request(`/organizations/${orgId}/issues/${issueId}/comments`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ body: 'Deployment verification passing cleanly.' }),
  });
  check('POST /comments records comment', commentRes.ok);

  const worklogRes = await request(`/organizations/${orgId}/issues/${issueId}/work-logs`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ timeSpentSeconds: 3600, startedAt: new Date().toISOString() }),
  });
  check('POST /work-logs records 1 hour time spent', worklogRes.ok);

  // 9. Search & AST Filters (UC-FLT)
  console.log('\n\x1b[33m▶ [9/12] UC-FLT: JQL & AST Filters\x1b[0m');
  const searchRes = await request(`/organizations/${orgId}/issues/search?q=Deployment&projectId=${prjId}`, { headers: adminHeaders });
  const items = searchRes.data?.data || searchRes.data?.items || (Array.isArray(searchRes.data) ? searchRes.data : []);
  check('GET /issues/search returns matched issue', searchRes.ok && items.length > 0, `Items found: ${items.length}`);

  const filterRes = await request(`/organizations/${orgId}/filters`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'Active Deployment Filter', queryText: JSON.stringify({ field: 'summary', op: 'contains', value: 'Deployment' }) }),
  });
  check('POST /filters saves AST filter', filterRes.ok && filterRes.data?.id);

  // 10. Dashboards & Integrations (UC-DSH, UC-INT)
  console.log('\n\x1b[33m▶ [10/12] UC-DSH & UC-INT: Dashboards, PAT & Webhooks\x1b[0m');
  const dshRes = await request(`/organizations/${orgId}/dashboards`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'Deployment Metrics Dashboard' }),
  });
  check('POST /dashboards creates analytics board', dshRes.ok && dshRes.data?.id);

  const patRes = await request(`/organizations/${orgId}/api-tokens`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ name: 'CI/CD Pipeline PAT', scopes: ['read', 'write'] }),
  });
  check('POST /api-tokens returns unhashed PAT key once', patRes.ok && !!(patRes.data?.token || patRes.data?.plainTextToken || patRes.data?.secret));

  // 11. Transactional Outbox, Notifications & Worker Event Loop
  console.log('\n\x1b[33m▶ [11/12] UC-JOB & UC-NOTIF: Outbox Events & Worker Processing\x1b[0m');
  const outboxCount = db(`SELECT count(*) FROM outbox_events WHERE org_id = '${orgId}';`);
  check('Transactional outbox events created in PostgreSQL', parseInt(outboxCount, 10) > 0, `Events count: ${outboxCount}`);

  // Test Mail Outbox Inspection
  const mailOutbox = await request('/admin/mail/outbox', { headers: adminHeaders });
  check('GET /admin/mail/outbox returns logged emails', mailOutbox.ok && Array.isArray(mailOutbox.data));

  // 12. Final Health & Consistency Check
  console.log('\n\x1b[33m▶ [12/12] Final PostgreSQL Referential Consistency\x1b[0m');
  const orgCount = db(`SELECT count(*) FROM organizations WHERE id = '${orgId}';`);
  check('PostgreSQL verifies active tenant record', orgCount === '1');
  const memberCount = db(`SELECT count(*) FROM organization_members WHERE org_id = '${orgId}';`);
  check('PostgreSQL verifies active members count >= 2', parseInt(memberCount, 10) >= 2, `Count: ${memberCount}`);

  // Final Summary
  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log(`\x1b[1m\x1b[35m   FINAL DEPLOYMENT READINESS RESULT: ${passCount} PASSED, ${failCount} FAILED (${passCount + failCount} TOTAL)   \x1b[0m`);
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error in deployment suite:', err);
  process.exit(1);
});
