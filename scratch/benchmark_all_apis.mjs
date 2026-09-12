import { performance } from 'perf_hooks';

const BASE_URL = 'https://task-manager-pqt2.vercel.app';

async function timedFetch(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const duration = performance.now() - start;
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return {
      status: res.status,
      ok: res.ok,
      duration: Math.round(duration),
      data,
      sizeBytes: Buffer.byteLength(text, 'utf8')
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      status: 0,
      ok: false,
      duration: Math.round(duration),
      error: err.message,
      sizeBytes: 0
    };
  }
}

async function runBenchmark() {
  console.log('=== STARTING ENTERPRISE API BENCHMARK ON PRODUCTION VERCEL ===\n');
  
  // 1. Health Check
  const healthRes = await timedFetch(`${BASE_URL}/api/health`);
  console.log(`[HEALTH] /api/health -> Status: ${healthRes.status}, Latency: ${healthRes.duration}ms`);

  // 2. Auth Login
  const loginRes = await timedFetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' })
  });
  console.log(`[AUTH] /api/auth/login -> Status: ${loginRes.status}, Latency: ${loginRes.duration}ms`);

  if (!loginRes.ok) {
    console.error('Login failed! Stopping benchmark.', loginRes.data);
    return;
  }

  const token = loginRes.data.data?.token || loginRes.data.token;
  const user = loginRes.data.data?.user || loginRes.data.user;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 3. Workspace Bootstrap
  const bootstrapRes = await timedFetch(`${BASE_URL}/api/workspace/bootstrap`, { headers: authHeaders });
  console.log(`[WORKSPACE] /api/workspace/bootstrap -> Status: ${bootstrapRes.status}, Latency: ${bootstrapRes.duration}ms`);

  const orgs = bootstrapRes.data?.data?.organizations || [];
  const currentOrg = orgs[0] || {};
  const orgId = currentOrg.id;
  const projects = bootstrapRes.data?.data?.projects || [];
  const currentProject = projects[0] || {};
  const projectId = currentProject.id;
  const issues = bootstrapRes.data?.data?.issues || [];
  const currentIssue = issues[0] || {};
  const issueId = currentIssue.id;

  console.log(`\nIdentified Context: Org=${orgId} (${currentOrg.name}), Project=${projectId} (${currentProject.key}), Issue=${issueId} (${currentIssue.key})\n`);

  const benchmarkSuites = [
    { module: 'Authentication', name: 'GET /api/auth/me', path: `/api/auth/me` },
    { module: 'Workspace', name: 'GET /api/workspace/bootstrap', path: `/api/workspace/bootstrap` },
    { module: 'Organizations', name: 'GET /api/organizations', path: `/api/organizations` },
    { module: 'Organizations', name: 'GET /api/organizations/:orgId/members', path: `/api/organizations/${orgId}/members` },
    { module: 'Organizations', name: 'GET /api/organizations/:orgId/invitations', path: `/api/organizations/${orgId}/invitations` },
    { module: 'Catalog', name: 'GET /api/organizations/:orgId/catalog', path: `/api/organizations/${orgId}/catalog` },
    { module: 'Workflows', name: 'GET /api/organizations/:orgId/workflows', path: `/api/organizations/${orgId}/workflows` },
    { module: 'Projects', name: 'GET /api/organizations/:orgId/projects', path: `/api/organizations/${orgId}/projects` },
    { module: 'Projects', name: 'GET /api/organizations/:orgId/projects/:projectId', path: `/api/organizations/${orgId}/projects/${projectId}` },
    { module: 'Projects', name: 'GET /api/organizations/:orgId/projects/:projectId/components', path: `/api/organizations/${orgId}/projects/${projectId}/components` },
    { module: 'Projects', name: 'GET /api/organizations/:orgId/projects/:projectId/versions', path: `/api/organizations/${orgId}/projects/${projectId}/versions` },
    { module: 'Boards', name: 'GET /api/organizations/:orgId/projects/:projectId/boards', path: `/api/organizations/${orgId}/projects/${projectId}/boards` },
    { module: 'Sprints', name: 'GET /api/organizations/:orgId/projects/:projectId/sprints', path: `/api/organizations/${orgId}/projects/${projectId}/sprints` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues', path: `/api/organizations/${orgId}/issues?projectId=${projectId}` },
    { module: 'Issues (Detail SLA)', name: 'GET /api/organizations/:orgId/issues/:issueId', path: `/api/organizations/${orgId}/issues/${issueId}` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues/:issueId/transitions', path: `/api/organizations/${orgId}/issues/${issueId}/transitions` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues/:issueId/comments', path: `/api/organizations/${orgId}/issues/${issueId}/comments` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues/:issueId/worklogs', path: `/api/organizations/${orgId}/issues/${issueId}/worklogs` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues/:issueId/links', path: `/api/organizations/${orgId}/issues/${issueId}/links` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues/:issueId/watchers', path: `/api/organizations/${orgId}/issues/${issueId}/watchers` },
    { module: 'Issues', name: 'GET /api/organizations/:orgId/issues/:issueId/attachments', path: `/api/organizations/${orgId}/issues/${issueId}/attachments` },
    { module: 'Custom Fields', name: 'GET /api/organizations/:orgId/custom-fields', path: `/api/organizations/${orgId}/custom-fields` },
    { module: 'Saved Filters', name: 'GET /api/organizations/:orgId/filters', path: `/api/organizations/${orgId}/filters` },
    { module: 'Search & JQL', name: 'GET /api/organizations/:orgId/issues?jql=...', path: `/api/organizations/${orgId}/issues?jql=${encodeURIComponent('priority = high')}` },
    { module: 'Dashboards', name: 'GET /api/organizations/:orgId/dashboards/summary', path: `/api/organizations/${orgId}/dashboards/summary` },
    { module: 'Notifications', name: 'GET /api/organizations/:orgId/notifications', path: `/api/organizations/${orgId}/notifications` },
    { module: 'Webhooks', name: 'GET /api/organizations/:orgId/webhooks', path: `/api/organizations/${orgId}/webhooks` },
    { module: 'API Tokens', name: 'GET /api/organizations/:orgId/api-tokens', path: `/api/organizations/${orgId}/api-tokens` },
    { module: 'Audit & Outbox', name: 'GET /api/organizations/:orgId/audit', path: `/api/organizations/${orgId}/audit` },
    { module: 'Admin Engine', name: 'GET /api/admin/metrics', path: `/api/admin/metrics` },
    { module: 'Admin Engine', name: 'GET /api/admin/users', path: `/api/admin/users` },
    { module: 'Admin Engine', name: 'GET /api/admin/organizations', path: `/api/admin/organizations` },
    { module: 'Admin Engine', name: 'GET /api/admin/mail-outbox', path: `/api/admin/mail-outbox` },
    { module: 'Admin Engine', name: 'GET /api/admin/logs', path: `/api/admin/logs` }
  ];

  const results = [];

  for (const item of benchmarkSuites) {
    // Run 3 iterations to get average latency
    const runs = [];
    let lastResult = null;
    for (let i = 0; i < 3; i++) {
      const res = await timedFetch(`${BASE_URL}${item.path}`, { headers: authHeaders });
      runs.push(res.duration);
      lastResult = res;
    }
    const avgLatency = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);
    const minLatency = Math.min(...runs);
    const maxLatency = Math.max(...runs);

    results.push({
      module: item.module,
      endpoint: item.name,
      status: lastResult.status,
      ok: lastResult.ok,
      avgLatency,
      minLatency,
      maxLatency,
      sizeBytes: lastResult.sizeBytes
    });

    console.log(`[${item.module}] ${item.name} -> Status: ${lastResult.status}, Avg: ${avgLatency}ms (Min: ${minLatency}ms, Max: ${maxLatency}ms), Size: ${lastResult.sizeBytes}B`);
  }

  console.log('\n=== COMPLETE BENCHMARK RESULTS SUMMARY ===\n');
  console.log('| Module | Endpoint | Status | Avg Latency | Min / Max | Payload Size | SLA Status |');
  console.log('| :--- | :--- | :---: | :---: | :---: | :---: | :---: |');
  for (const r of results) {
    const sla = r.avgLatency <= 200 ? '✅ SLA Pass' : (r.avgLatency <= 400 ? '⚠️ Acceptable' : '❌ Slow');
    console.log(`| **${r.module}** | \`${r.endpoint}\` | \`${r.status}\` | **${r.avgLatency} ms** | ${r.minLatency} / ${r.maxLatency} ms | ${(r.sizeBytes / 1024).toFixed(1)} KB | ${sla} |`);
  }
}

runBenchmark();
