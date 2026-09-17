import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log('Connected to Supabase PostgreSQL...');

  const acmeOrgId = 'd2bca00a-b0df-43d6-a2c0-4f9d0d0c3bf6';
  const cloudProjId = 'b70c5c43-2d3d-40a5-a741-da48b459fca2';
  const orgMemberRoleId = '83bfce04-1ac7-4a34-aead-f0366e03626b'; // 'member' in Acme
  const projMemberRoleId = '8872a15e-0a62-4b80-9342-e3a128f5d62c'; // 'member' in CLOUD

  // 1. Fetch all users
  const usersRes = await c.query('SELECT id, email, full_name FROM users');
  console.log(`Found ${usersRes.rows.length} users in database:`);

  for (const u of usersRes.rows) {
    // Check or insert organization membership
    let memRes = await c.query('SELECT id FROM organization_members WHERE org_id = $1 AND user_id = $2', [acmeOrgId, u.id]);
    let orgMemberId;
    if (memRes.rows.length === 0) {
      const ins = await c.query(
        "INSERT INTO organization_members (org_id, user_id, status, joined_at, created_at, updated_at) VALUES ($1, $2, 'active', NOW(), NOW(), NOW()) RETURNING id",
        [acmeOrgId, u.id]
      );
      orgMemberId = ins.rows[0].id;
      console.log(`+ Enrolled ${u.email} into Acme Cloud Platform (org_member_id: ${orgMemberId})`);
    } else {
      orgMemberId = memRes.rows[0].id;
      await c.query("UPDATE organization_members SET status = 'active' WHERE id = $1", [orgMemberId]);
    }

    // Ensure org_member_roles
    await c.query(
      'INSERT INTO org_member_roles (org_member_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [orgMemberId, orgMemberRoleId]
    );

    // Check or insert project membership
    let pmRes = await c.query('SELECT id FROM project_members WHERE project_id = $1 AND org_member_id = $2', [cloudProjId, orgMemberId]);
    let projMemberId;
    if (pmRes.rows.length === 0) {
      const insPm = await c.query(
        "INSERT INTO project_members (project_id, org_member_id, status, joined_at, created_at) VALUES ($1, $2, 'active', NOW(), NOW()) RETURNING id",
        [cloudProjId, orgMemberId]
      );
      projMemberId = insPm.rows[0].id;
      console.log(`+ Enrolled ${u.email} into Project CLOUD (project_member_id: ${projMemberId})`);
    } else {
      projMemberId = pmRes.rows[0].id;
      await c.query("UPDATE project_members SET status = 'active' WHERE id = $1", [projMemberId]);
    }

    // Ensure project_member_roles
    await c.query(
      'INSERT INTO project_member_roles (project_member_id, project_role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [projMemberId, projMemberRoleId]
    );
  }

  // 2. Activate Sprint 2 so the Board and Backlog show an active sprint
  await c.query(
    "UPDATE sprints SET state = 'active', start_at = COALESCE(start_at, NOW()) WHERE id = 'cb28e1bc-a08e-4302-8bf8-2b11b00186d7'"
  );
  console.log('Activated Sprint 2 in Project CLOUD');

  // 3. Extend all active auth sessions expires_at to 365 days
  await c.query("UPDATE auth_sessions SET expires_at = NOW() + INTERVAL '365 days' WHERE status = 'active'");
  console.log('Extended all active auth sessions to 365 days');

  // 4. Verify results
  const sprints = await c.query('SELECT id, name, state FROM sprints WHERE project_id = $1', [cloudProjId]);
  console.log('Sprints in CLOUD:', sprints.rows);

  const issues = await c.query('SELECT id, key, summary, sprint_id FROM issues WHERE project_id = $1 AND deleted_at IS NULL', [cloudProjId]);
  console.log(`Project CLOUD has ${issues.rows.length} active issues:`, issues.rows.map(i => ({ key: i.key, sprintId: i.sprint_id, summary: i.summary })));

  await c.end();
  console.log('Sync complete!');
}

run().catch(console.error);
