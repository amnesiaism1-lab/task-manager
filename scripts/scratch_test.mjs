import { TestContext } from './tests/test_context.mjs';

async function main() {
  const ctx = new TestContext();
  await ctx.init();

  const orgId = ctx.activeOrgId;
  const projectId = ctx.activeProjectId;
  const issue = await ctx.db.queryOne('SELECT id FROM issues WHERE project_id = $1 LIMIT 1', [projectId]);

  console.log('\n--- 1. Testing Attachment Upload ---');
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const fileBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const payloadHeader = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`);
  const payloadFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
  const multipartBody = Buffer.concat([payloadHeader, fileBuffer, payloadFooter]);
  const attRes = await ctx.authApi(`/organizations/${orgId}/issues/${issue.id}/attachments`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body: multipartBody,
  });
  console.log('Attachment upload:', attRes.status, attRes.data);

  console.log('\n--- 2. Testing Search ---');
  const srchRes = await ctx.authApi(`/organizations/${orgId}/issues/search?query=test&projectId=${projectId}`);
  console.log('Search:', srchRes.status, srchRes.data);

  console.log('\n--- 3. Testing Saved Filter ---');
  const fltRes = await ctx.authApi(`/organizations/${orgId}/filters`, {
    method: 'POST',
    body: JSON.stringify({ name: `Test Filter ${Date.now()}`, queryText: 'priority = "High"' }),
  });
  console.log('Filter:', fltRes.status, fltRes.data);

  console.log('\n--- 4. Testing Dashboard ---');
  const dshRes = await ctx.authApi(`/organizations/${orgId}/dashboards`, {
    method: 'POST',
    body: JSON.stringify({ name: `Test Dashboard ${Date.now()}` }),
  });
  console.log('Dashboard:', dshRes.status, dshRes.data);

  console.log('\n--- 5. Testing Automation Rule ---');
  const autRes = await ctx.authApi(`/organizations/${orgId}/automation-rules`, {
    method: 'POST',
    body: JSON.stringify({
      name: `Rule ${Date.now()}`,
      components: [
        { componentType: 'trigger', componentKey: 'issue_transitioned', position: 0 },
        { componentType: 'action', componentKey: 'send_notification', position: 1 },
      ],
    }),
  });
  console.log('Automation:', autRes.status, autRes.data);

  console.log('\n--- 6. Testing Sprint Creation & Assign ---');
  const scrumBoard = await ctx.db.queryOne('SELECT id FROM boards WHERE project_id = $1 AND board_type = $2 LIMIT 1', [projectId, 'scrum']);
  console.log('Scrum board:', scrumBoard?.id);
  const sprRes = await ctx.authApi(`/organizations/${orgId}/projects/${projectId}/boards/${scrumBoard.id}/sprints`, {
    method: 'POST',
    body: JSON.stringify({ name: `Sprint Test ${Date.now()}` }),
  });
  console.log('Sprint creation:', sprRes.status, sprRes.data);
  if (sprRes.data?.id) {
    const assignRes = await ctx.authApi(`/organizations/${orgId}/projects/${projectId}/sprints/${sprRes.data.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ issueId: issue.id }),
    });
    console.log('Sprint assign:', assignRes.status, assignRes.data);
  }

  await ctx.close();
}

main().catch(console.error);
