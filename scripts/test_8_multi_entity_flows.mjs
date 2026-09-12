import { performance } from 'perf_hooks';

const BASE_URL = process.env.BASE_URL || 'https://task-manager-pqt2.vercel.app';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const duration = Math.round(performance.now() - start);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { status: 0, ok: false, error: err.message, duration };
  }
}

function assert(condition, name, details = '', errData = null) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${name} ${details ? `(${details})` : ''}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${name} ${details ? `(${details})` : ''}`, errData ? JSON.stringify(errData) : '');
  }
}

async function runAllFlows() {
  console.log(`========================================================================`);
  console.log(`🚀 RUNNING 8 MULTI-ENTITY INTERACTION INTEGRATION FLOWS ON LIVE VERCEL`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`========================================================================\n`);

  // ─── 0. Authenticate ───────────────────────────────────────────────────────
  console.log(`[AUTH] Authenticating system administrator account...`);
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' }),
  });

  assert(loginRes.ok && (loginRes.data?.accessToken || loginRes.data?.token), 'Admin Login', `${loginRes.duration}ms`, loginRes.data);
  if (!loginRes.ok) {
    console.error('Fatal: Cannot authenticate. Halting execution.');
    process.exit(1);
  }

  const token = loginRes.data?.accessToken || loginRes.data?.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Fetch Workspace Bootstrap
  const bootstrapRes = await request('/api/workspace/bootstrap', { headers: authHeaders });
  assert(bootstrapRes.ok, 'Workspace Bootstrap Loaded', `${bootstrapRes.duration}ms`);
  const org = bootstrapRes.data?.organizations?.[0] || {};
  const orgId = org.id || org.orgId;
  const project = bootstrapRes.data?.projects?.[0] || {};
  const projectId = project.id;
  console.log(`Context: Org ID = ${orgId} (${org.name}), Project ID = ${projectId} (${project.key})\n`);

  // ─── FLOW 1: Tenant & Org Hierarchy (Org -> Dept -> Group -> Invite -> Resend)
  console.log(`------------------------------------------------------------------------`);
  console.log(`▶ FLOW 1: Multi-Tenant & Org Hierarchy Lifecycle`);
  console.log(`------------------------------------------------------------------------`);
  
  const deptName = `Core Platform ${Date.now().toString().slice(-4)}`;
  const createDeptRes = await request(`/api/organizations/${orgId}/departments`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: deptName }),
  });
  assert(createDeptRes.ok && createDeptRes.data?.id, 'Create Department in Org', `${createDeptRes.duration}ms`, createDeptRes.data);

  const groupName = `Security Ops ${Date.now().toString().slice(-4)}`;
  const createGroupRes = await request(`/api/organizations/${orgId}/groups`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: groupName, description: 'Security and Compliance Operations' }),
  });
  assert(createGroupRes.ok && createGroupRes.data?.id, 'Create User Group in Org', `${createGroupRes.duration}ms`, createGroupRes.data);

  const inviteEmail = `member_${Date.now().toString().slice(-4)}@cloudcorp.dev`;
  const inviteRes = await request(`/api/organizations/${orgId}/invitations`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ email: inviteEmail }),
  });
  assert(inviteRes.ok && inviteRes.data?.id, 'Send Org Invitation Ticket', `${inviteRes.duration}ms`, inviteRes.data);
  const inviteId = inviteRes.data?.id;

  if (inviteId) {
    const resendRes = await request(`/api/organizations/${orgId}/invitations/${inviteId}/resend`, {
      method: 'POST',
      headers: authHeaders,
    });
    assert(resendRes.ok, 'Resend Org Invitation Ticket', `${resendRes.duration}ms`, resendRes.data);
  }

  const membersRes = await request(`/api/organizations/${orgId}/members`, { headers: authHeaders });
  assert(membersRes.ok && Array.isArray(membersRes.data), 'Query Organization Members', `Found ${membersRes.data?.length} members, ${membersRes.duration}ms`);

  // ─── FLOW 2: Project Provisioning & Component/Version Lifecycle ─────────────
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 2: Project Provisioning & Component/Version Lifecycle`);
  console.log(`------------------------------------------------------------------------`);

  const projKey = `UAT${Date.now().toString().slice(-3)}`;
  const createProjRes = await request(`/api/organizations/${orgId}/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ key: projKey, name: `Automated Test Project ${projKey}`, visibility: 'org', boardType: 'scrum' }),
  });
  const createdProject = createProjRes.data?.project || createProjRes.data;
  assert(createProjRes.ok && createdProject?.id, `Create Project [${projKey}]`, `${createProjRes.duration}ms`, createProjRes.data);
  const activeProjId = createdProject?.id || projectId;

  const compRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/components`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Auth-Service', description: 'Authentication Subsystem' }),
  });
  assert(compRes.ok && compRes.data?.id, 'Create Project Component', `${compRes.duration}ms`, compRes.data);

  const verRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/versions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: `v1.0.0-${Date.now().toString().slice(-4)}`, description: 'Initial Production Milestone' }),
  });
  assert(verRes.ok && verRes.data?.id, 'Create Project Version / Milestone', `${verRes.duration}ms`, verRes.data);
  const verId = verRes.data?.id;

  if (verId) {
    const releaseRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/versions/${verId}/release`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(releaseRes.ok, 'Release Project Version', `${releaseRes.duration}ms`, releaseRes.data);
  }

  const projDetailRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}`, { headers: authHeaders });
  assert(projDetailRes.ok, 'Query Project Detail Hierarchy', `${projDetailRes.duration}ms`, projDetailRes.data);

  // ─── FLOW 3: Workflow Schemes, FSM States, Transitions & Guards ─────────────
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 3: Workflow Schemes, FSM States, Transitions & Guards`);
  console.log(`------------------------------------------------------------------------`);

  const wfKey = `wf_${Date.now().toString().slice(-4)}`;
  const createWfRes = await request(`/api/organizations/${orgId}/workflows`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ key: wfKey, name: `Lifecycle Scheme ${wfKey}` }),
  });
  assert(createWfRes.ok && createWfRes.data?.id, `Create Custom Workflow [${wfKey}]`, `${createWfRes.duration}ms`, createWfRes.data);
  const wfId = createWfRes.data?.id;

  const wfListRes = await request(`/api/organizations/${orgId}/workflows`, { headers: authHeaders });
  assert(wfListRes.ok && Array.isArray(wfListRes.data), 'Query Organization Workflows List', `Found ${wfListRes.data?.length} workflows, ${wfListRes.duration}ms`);
  
  const targetWfId = wfListRes.data?.[0]?.id || wfId;
  const wfDetailRes = await request(`/api/organizations/${orgId}/workflows/${targetWfId}`, { headers: authHeaders });
  assert(wfDetailRes.ok && wfDetailRes.data?.workflow, 'Query Workflow FSM States & Transitions', `${wfDetailRes.duration}ms`);

  const transitions = wfDetailRes.data?.transitions || [];
  if (transitions.length > 0) {
    const targetTrans = transitions[0];
    const guardRes = await request(`/api/organizations/${orgId}/workflows/guards`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        transitionId: targetTrans.id,
        guardType: 'requires_fields',
        configJson: { requiredFields: ['resolution'] },
      }),
    });
    assert(guardRes.ok, `Attach Transition Guard Rule to [${targetTrans.name || targetTrans.id}]`, `${guardRes.duration}ms`, guardRes.data);
  }

  // ─── FLOW 4: Issue Lifecycle, Custom Fields, Transitions, Worklogs & Links ───
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 4: Issue Lifecycle, Custom Fields, Worklog, Comments & Links`);
  console.log(`------------------------------------------------------------------------`);

  // Create Custom Field (with clean schema)
  const cfKey = `cf_${Date.now().toString().slice(-4)}`;
  const cfRes = await request(`/api/organizations/${orgId}/custom-fields`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: `Tier Attribute ${cfKey}`, key: cfKey, fieldType: 'select' }),
  });
  assert(cfRes.ok && cfRes.data?.id, `Create Custom Field [${cfKey}]`, `${cfRes.duration}ms`, cfRes.data);
  const cfId = cfRes.data?.id;

  if (cfId) {
    const optRes = await request(`/api/organizations/${orgId}/custom-fields/${cfId}/options`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ value: 'CRITICAL_P0', label: 'Critical Tier 0' }),
    });
    assert(optRes.ok, 'Add Option Choice to Custom Field', `${optRes.duration}ms`, optRes.data);
  }

  // Create Epic Issue
  const epicRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/issues`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      summary: `Epic Deliverable: Enterprise Core v${Date.now().toString().slice(-4)}`,
      description: 'Parent epic covering foundational business deliverables',
      issueTypeKey: 'epic',
      priority: 'High',
    }),
  });
  const epic = epicRes.data?.issue || epicRes.data;
  assert(epicRes.ok && epic?.id, `Create Epic Issue [${epic?.key || 'EPIC'}]`, `${epicRes.duration}ms`, epicRes.data);
  const epicId = epic?.id;

  // Create Story Issue
  const storyRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/issues`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      summary: `Story: Implement Multi-Entity Orchestration Flow`,
      description: 'End-to-end integration and state transition verification',
      issueTypeKey: 'story',
      priority: 'Medium',
      originalEstimateSeconds: 14400,
    }),
  });
  const story = storyRes.data?.issue || storyRes.data;
  assert(storyRes.ok && story?.id, `Create Story Issue [${story?.key || 'STORY'}]`, `${storyRes.duration}ms`, storyRes.data);
  const storyId = story?.id;

  // Create Link between Story and Epic using linkedIssueId
  const linkTypesRes = await request(`/api/organizations/${orgId}/catalog/link-types`, { headers: authHeaders });
  const linkType = linkTypesRes.data?.[0];
  if (linkType && storyId && epicId) {
    const linkRes = await request(`/api/organizations/${orgId}/issues/${storyId}/links`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        linkedIssueId: epicId,
        linkTypeId: linkType.id,
      }),
    });
    assert(linkRes.ok, `Link Story [${story?.key}] ➔ Epic [${epic?.key}]`, `${linkRes.duration}ms`, linkRes.data);
  }

  if (storyId) {
    // Post Comment on Story
    const commentRes = await request(`/api/organizations/${orgId}/issues/${storyId}/comments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ body: 'Automated UAT suite: verification comment posted.' }),
    });
    assert(commentRes.ok, 'Post Rich Comment on Issue', `${commentRes.duration}ms`, commentRes.data);

    // Log Work Time with startedAt
    const worklogRes = await request(`/api/organizations/${orgId}/issues/${storyId}/work-logs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        timeSpentSeconds: 7200,
        startedAt: new Date().toISOString(),
        comment: 'Investigated architecture and validated transitions',
      }),
    });
    assert(worklogRes.ok, 'Log Work Time (2h / 7200s)', `${worklogRes.duration}ms`, worklogRes.data);

    // Query Permitted Transitions
    const transRes = await request(`/api/organizations/${orgId}/issues/${storyId}/transitions`, { headers: authHeaders });
    assert(transRes.ok && Array.isArray(transRes.data), 'Query Issue Permitted Transitions', `Found ${transRes.data?.length} transitions, ${transRes.duration}ms`, transRes.data);

    // Issue Detail SLA Payload
    const detailRes = await request(`/api/organizations/${orgId}/issues/${storyId}`, { headers: authHeaders });
    assert(detailRes.ok && detailRes.data?.id, 'Verify Issue Detail Aggregate Payload SLA', `${detailRes.duration}ms`, detailRes.data);
  }

  // ─── FLOW 5: Agile Sprint Lifecycle & Lexorank Kanban Move ─────────────────
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 5: Agile Sprint Lifecycle & Lexorank Kanban Reorder`);
  console.log(`------------------------------------------------------------------------`);

  // Query Boards or Create Scrum Board
  const boardsRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/boards`, { headers: authHeaders });
  let scrumBoard = boardsRes.data?.find(b => b.boardType === 'scrum');

  if (!scrumBoard) {
    const createBoardRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/boards`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Agile Scrum Board', boardType: 'scrum' }),
    });
    scrumBoard = createBoardRes.data;
  }

  assert(scrumBoard?.id !== undefined, 'Active Scrum Sprint Board Acquired', `Board ID = ${scrumBoard?.id}`, scrumBoard);
  const boardId = scrumBoard?.id;

  // Create Sprint on Scrum Board
  const sprintName = `Sprint ${Date.now().toString().slice(-4)}`;
  const createSprintRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/boards/${boardId}/sprints`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: sprintName, goal: 'Deliver MVP release milestones' }),
  });
  assert(createSprintRes.ok && createSprintRes.data?.id, `Create Agile Sprint [${sprintName}]`, `${createSprintRes.duration}ms`, createSprintRes.data);
  const sprintId = createSprintRes.data?.id;

  if (sprintId && storyId) {
    // Assign Issue to Sprint
    const assignRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/sprints/${sprintId}/issues`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ issueId: storyId }),
    });
    assert(assignRes.ok, `Assign Issue [${story?.key}] to Sprint`, `${assignRes.duration}ms`, assignRes.data);

    // Start Sprint
    const startSprintRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/sprints/${sprintId}/start`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(startSprintRes.ok, `Start Sprint [${sprintName}] (Status: ACTIVE)`, `${startSprintRes.duration}ms`, startSprintRes.data);

    // Reorder Card on Board
    const reorderRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/boards/${boardId}/issues/reorder`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ issueId: storyId, previousRank: '0|hzzzzz:' }),
    });
    assert(reorderRes.ok, 'Reorder Issue Card via Lexorank Algorithm', `${reorderRes.duration}ms`, reorderRes.data);

    // Complete / Close Sprint
    const closeSprintRes = await request(`/api/organizations/${orgId}/projects/${activeProjId}/sprints/${sprintId}/close`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(closeSprintRes.ok, `Complete Sprint [${sprintName}] (Rollover / Closed)`, `${closeSprintRes.duration}ms`, closeSprintRes.data);
  }

  // ─── FLOW 6: Webhooks, Outbox & Async Dispatch Engine ──────────────────────
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 6: Webhooks & Transactional Outbox Event Engine`);
  console.log(`------------------------------------------------------------------------`);

  const webhookRes = await request(`/api/organizations/${orgId}/webhooks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ url: 'https://webhook.site/test-endpoint', events: ['issue.created', 'issue.updated'] }),
  });
  assert(webhookRes.ok && webhookRes.data?.id, 'Register Webhook Endpoint with HMAC Signing', `${webhookRes.duration}ms`, webhookRes.data);
  const webhookId = webhookRes.data?.id;

  if (webhookId) {
    const pauseRes = await request(`/api/organizations/${orgId}/webhooks/${webhookId}/pause`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(pauseRes.ok, 'Pause / Mute Webhook Subscription', `${pauseRes.duration}ms`, pauseRes.data);
  }

  const outboxRes = await request('/api/admin/mail/outbox', { headers: authHeaders });
  assert(outboxRes.ok && Array.isArray(outboxRes.data), 'Query Transactional Mail Outbox Buffer', `Buffered: ${outboxRes.data?.length} emails, ${outboxRes.duration}ms`);

  const testMailRes = await request('/api/admin/mail/test', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ to: 'admin@taskmanager.dev', subject: 'Automated Multi-Entity Flow SMTP Check' }),
  });
  assert(testMailRes.ok, 'Dispatch Diagnostic SMTP Test Email', `${testMailRes.duration}ms`, testMailRes.data);

  // ─── FLOW 7: JQL AST Search & Saved Filters ────────────────────────────────
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 7: Advanced JQL AST Search & Saved Filters Integration`);
  console.log(`------------------------------------------------------------------------`);

  // JQL Search via GET
  const jqlSearchRes = await request(`/api/organizations/${orgId}/issues/search?projectId=${activeProjId}&limit=10`, {
    headers: authHeaders,
  });
  assert(jqlSearchRes.ok, 'Execute Advanced JQL Search Query', `Returned ${jqlSearchRes.data?.total || 0} issues, ${jqlSearchRes.duration}ms`, jqlSearchRes.data);

  const filterName = `High Priority Watch ${Date.now().toString().slice(-4)}`;
  const createFilterRes = await request(`/api/organizations/${orgId}/filters`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: filterName,
      description: 'Filtered view for critical and high issues',
      queryText: JSON.stringify({ type: 'comparison', field: 'priority', operator: '=', value: 'High' }),
    }),
  });
  assert(createFilterRes.ok && createFilterRes.data?.id, `Create Saved Filter [${filterName}]`, `${createFilterRes.duration}ms`, createFilterRes.data);
  const filterId = createFilterRes.data?.id;

  const filtersListRes = await request(`/api/organizations/${orgId}/filters`, { headers: authHeaders });
  assert(filtersListRes.ok && Array.isArray(filtersListRes.data), 'Query Organization Saved Filters', `Found ${filtersListRes.data?.length} filters, ${filtersListRes.duration}ms`);

  // Dashboards creation and widgets with valid widgetType 'issue-count'
  const dashboardName = `Executive KPI ${Date.now().toString().slice(-4)}`;
  const createDashRes = await request(`/api/organizations/${orgId}/dashboards`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: dashboardName, description: 'High-level velocity and workload distribution' }),
  });
  assert(createDashRes.ok && createDashRes.data?.id, `Create Custom Dashboard [${dashboardName}]`, `${createDashRes.duration}ms`, createDashRes.data);
  const dashId = createDashRes.data?.id;

  if (dashId) {
    const addWidgetRes = await request(`/api/organizations/${orgId}/dashboards/${dashId}/widgets`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        widgetType: 'issue-count',
        savedFilterId: filterId,
        configJson: { metric: 'total' },
        position: 0,
      }),
    });
    assert(addWidgetRes.ok, 'Add Analytics Widget to Dashboard', `${addWidgetRes.duration}ms`, addWidgetRes.data);
  }

  // ─── FLOW 8: Security Isolation, RBAC & Audit Trail ────────────────────────
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`▶ FLOW 8: Enterprise Security Isolation, RBAC & Audit Trail`);
  console.log(`------------------------------------------------------------------------`);

  const auditRes = await request(`/api/organizations/${orgId}/audit?limit=10`, { headers: authHeaders });
  assert(auditRes.ok, 'Query Compliance Audit Trail Logs', `${auditRes.duration}ms`);

  // Cross-tenant boundary test (non-existent or unauthorized org)
  const fakeOrgId = '00000000-0000-0000-0000-000000000000';
  const forbiddenRes = await request(`/api/organizations/${fakeOrgId}/members`, { headers: authHeaders });
  assert(forbiddenRes.status === 403 || forbiddenRes.status === 404, 'Enforce Multi-Tenant Isolation (403/404 Forbidden on Unauthorized Org)', `Status: ${forbiddenRes.status}`);

  // Platform Admin Global Users Directory
  const adminUsersRes = await request('/api/admin/users?page=1&limit=20', { headers: authHeaders });
  assert(adminUsersRes.ok && Array.isArray(adminUsersRes.data?.items), 'Platform Admin: Search & List Global Users Directory', `Found ${adminUsersRes.data?.total || adminUsersRes.data?.items?.length} users, ${adminUsersRes.duration}ms`);

  // Platform Admin Global Organizations Directory
  const adminOrgsRes = await request('/api/admin/organizations?page=1&limit=20', { headers: authHeaders });
  assert(adminOrgsRes.ok && Array.isArray(adminOrgsRes.data?.items), 'Platform Admin: List Global Tenants & Organizations', `Found ${adminOrgsRes.data?.total || adminOrgsRes.data?.items?.length} tenants, ${adminOrgsRes.duration}ms`);

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log(`\n========================================================================`);
  console.log(`🏁 INTEGRATION TEST RESULTS SUMMARY`);
  console.log(`Total Assertions : ${totalTests}`);
  console.log(`Passed           : ${passedTests}`);
  console.log(`Failed           : ${failedTests}`);
  console.log(`Success Rate     : ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log(`========================================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllFlows().catch(err => {
  console.error('Fatal unhandled error in test suite:', err);
  process.exit(1);
});
