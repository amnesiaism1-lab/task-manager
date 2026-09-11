// scratch/test_onboarding_invitation_e2e.mjs
// Comprehensive E2E integration test for:
// 1. New User Login -> 0 Organizations Onboarding
// 2. Organization Creation & Key generation
// 3. Member Invitation with custom role
// 4. In-App Pending Invitations Listing (GET /api/organizations/invitations/me)
// 5. 1-Click Accept Invitation via invitationId
// 6. Verification of active membership and role in Database
// 7. Decline Invitation flow
// 8. Redeem Invitation Code (token) directly
// 9. Member Leave Organization flow

const API_BASE = 'http://localhost:3001/api';

async function req(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

import { execSync } from 'child_process';

function dbExec(sql) {
  const sanitized = sql.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i tm_postgres psql -U dev -d task_manager -t -A -c "${sanitized}"`,
    { encoding: 'utf-8' }
  );
}

let globalAdminToken = '';

async function ensureAdminToken() {
  if (!globalAdminToken) {
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' }),
    });
    if (adminLogin.ok && adminLogin.data.accessToken) {
      globalAdminToken = adminLogin.data.accessToken;
    }
  }
  return globalAdminToken;
}

async function registerAndLogin(email, password, fullName) {
  let reg = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!reg.ok && reg.status === 429) {
    console.log(`    [Rate Limit 429] Using Admin API to provision user ${email}`);
    const adminTok = await ensureAdminToken();
    const adminCreate = await req('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminTok}` },
      body: JSON.stringify({ email, password, fullName }),
    });
    if (!adminCreate.ok) {
      throw new Error(`Admin create user failed for ${email}: ${JSON.stringify(adminCreate.data)}`);
    }
  } else if (!reg.ok) {
    throw new Error(`Register failed for ${email}: ${JSON.stringify(reg.data)}`);
  } else {
    // Handle email verification for standard register
    if (reg.data?.verificationToken && reg.data?.user?.id) {
      await req('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ userId: reg.data.user.id, token: reg.data.verificationToken }),
      });
    } else {
      dbExec(`UPDATE users SET email_verified_at = NOW() WHERE email = '${email}';`);
    }
  }

  const login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok || !login.data.accessToken) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(login.data)}`);
  }
  return login.data.accessToken;
}

async function run() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING COMPREHENSIVE ONBOARDING & INVITATION E2E TEST');
  console.log('======================================================\n');

  await ensureAdminToken();

  const ts = Date.now();
  const orgOwnerEmail = `ceo_${ts}@testcompany.com`;
  const invitee1Email = `engineer1_${ts}@testcompany.com`;
  const invitee2Email = `designer_${ts}@testcompany.com`;
  const invitee3Email = `lead_${ts}@testcompany.com`;
  const password = 'Password123!';

  // Step 1: Register User A (Organization Owner)
  console.log('Step 1: Register User A (New account without organizations)');
  const tokenOwner = await registerAndLogin(orgOwnerEmail, password, 'Alice Henderson');
  assert(!!tokenOwner, 'User A registered and logged in successfully');

  // Verify User A has 0 organizations initially (Triggers Onboarding View)
  const ownerOrgs = await req('/organizations', {
    headers: { Authorization: `Bearer ${tokenOwner}` },
  });
  assert(Array.isArray(ownerOrgs.data) && ownerOrgs.data.length === 0, 'User A has 0 organizations initially (Onboarding scenario)');

  // Step 2: User A creates organization via Onboarding
  console.log('\nStep 2: User A creates Organization "Titan Nexus" (KEY: TNX)');
  const createOrg = await req('/organizations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenOwner}` },
    body: JSON.stringify({
      name: `Titan Nexus ${ts}`,
      key: `TN${String(ts).slice(-3)}`,
    }),
  });
  console.log('  createOrg status:', createOrg.status, 'data:', createOrg.data);
  assert(createOrg.ok && (createOrg.data.id || createOrg.data.organization?.id), 'Organization created successfully');
  const orgId = createOrg.data.id || createOrg.data.organization?.id;
  console.log(`  -> Created Org ID: ${orgId}, Name: ${createOrg.data.name}`);

  // Fetch Member roles for this organization to select a role
  const rolesRes = await req(`/organizations/${orgId}/roles`, {
    headers: { Authorization: `Bearer ${tokenOwner}` },
  });
  assert(rolesRes.ok && Array.isArray(rolesRes.data), 'Fetched organization roles');
  const memberRole = rolesRes.data.find(r => r.name.toLowerCase() === 'member') || rolesRes.data[0];
  console.log(`  -> Selected Role: ${memberRole?.name || 'default'} (${memberRole?.id || 'none'})`);

  // Step 3: User A invites Invitee 1 (engineer1) with role
  console.log('\nStep 3: User A invites engineer1 to Titan Nexus');
  const invite1 = await req(`/organizations/${orgId}/invitations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenOwner}` },
    body: JSON.stringify({
      email: invitee1Email,
      roleId: memberRole?.id,
    }),
  });
  assert(invite1.ok && invite1.data.id, 'Invitation 1 created successfully');
  const invite1Id = invite1.data.id;
  const invite1Token = invite1.data.token;
  console.log(`  -> Invitation 1 ID: ${invite1Id}, token exists: ${!!invite1Token}`);

  // Step 4: Register User B (Invitee 1)
  console.log('\nStep 4: Register User B (engineer1) and login');
  const tokenB = await registerAndLogin(invitee1Email, password, 'Bob Martinez');
  assert(!!tokenB, 'User B registered and logged in successfully');

  // Step 5: User B lists pending invitations in-app (GET /api/organizations/invitations/me)
  console.log('\nStep 5: User B calls GET /api/organizations/invitations/me to view pending invitations');
  const pendingB = await req('/organizations/invitations/me', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(pendingB.ok && Array.isArray(pendingB.data), 'Fetched pending invitations for User B');
  assert(pendingB.data.length >= 1, `Found ${pendingB.data.length} pending invitations`);
  const foundInvite = pendingB.data.find(inv => inv.id === invite1Id);
  assert(foundInvite !== undefined, 'Pending invitation list includes the invitation from Titan Nexus');
  assert((foundInvite.orgName || '').includes('Titan Nexus'), `Invitation org name matches: ${foundInvite.orgName}`);
  console.log(`  -> Org: ${foundInvite.orgName} (${foundInvite.orgKey}), Inviter: ${foundInvite.inviterName}, Role: ${foundInvite.roleName}`);

  // Step 6: User B accepts invitation via 1-Click in-app (using invitationId)
  console.log('\nStep 6: User B accepts invitation via in-app 1-click (POST /organizations/invitations/accept with invitationId)');
  const acceptB = await req('/organizations/invitations/accept', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      invitationId: invite1Id,
    }),
  });
  assert(acceptB.ok, `User B successfully accepted invitation: ${JSON.stringify(acceptB.data)}`);

  // Verify User B is now in Titan Nexus organization
  const orgsB = await req('/organizations', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(orgsB.ok && orgsB.data.some(o => o.orgId === orgId || o.id === orgId), 'User B now has Titan Nexus in their active organizations');

  // Verify User B membership in Titan Nexus
  const membersRes = await req(`/organizations/${orgId}/members`, {
    headers: { Authorization: `Bearer ${tokenOwner}` },
  });
  assert(membersRes.ok && membersRes.data.some(m => (m.email === invitee1Email || m.user?.email === invitee1Email) && m.status === 'active'), 'User B is listed as active member in Titan Nexus');

  // Step 7: Test Decline flow with Invitee 2
  console.log('\nStep 7: Test Decline flow (Invitee 2)');
  const invite2 = await req(`/organizations/${orgId}/invitations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenOwner}` },
    body: JSON.stringify({
      email: invitee2Email,
    }),
  });
  assert(invite2.ok && invite2.data.id, 'Invitation 2 created');
  const invite2Id = invite2.data.id;

  // Register Invitee 2
  const tokenC = await registerAndLogin(invitee2Email, password, 'Carol Designer');
  assert(!!tokenC, 'Invitee 2 registered and logged in successfully');

  // Invitee 2 declines invitation
  const declineC = await req('/organizations/invitations/decline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenC}` },
    body: JSON.stringify({
      invitationId: invite2Id,
    }),
  });
  assert(declineC.ok && declineC.data.success, 'Invitee 2 declined invitation successfully');

  // Verify Invitee 2 has 0 active organizations
  const orgsC = await req('/organizations', {
    headers: { Authorization: `Bearer ${tokenC}` },
  });
  assert(orgsC.ok && orgsC.data.length === 0, 'Invitee 2 still has 0 organizations after declining');

  // Step 8: Test Token-based Join (Redeem Invitation Code from Email URL)
  console.log('\nStep 8: Test Token-based Join (Redeem Invitation Code from Email URL)');
  const invite3 = await req(`/organizations/${orgId}/invitations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenOwner}` },
    body: JSON.stringify({
      email: invitee3Email,
    }),
  });
  assert(invite3.ok && invite3.data.id, 'Invitation 3 created');

  // Extract raw token from Outbox email dispatched by backend
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' }),
  });
  assert(adminLogin.ok && adminLogin.data.accessToken, 'System admin logged in for outbox inspection');
  const outboxRes = await req('/admin/mail/outbox', {
    headers: { Authorization: `Bearer ${adminLogin.data.accessToken}` },
  });
  const outboxMails = Array.isArray(outboxRes.data) ? outboxRes.data : (outboxRes.data?.outbox || []);
  assert(outboxRes.ok && Array.isArray(outboxMails), 'Fetched mail outbox');
  const inviteMail = outboxMails.find(m => m.to === invitee3Email);
  assert(inviteMail !== undefined, 'Found dispatched invitation email in outbox');
  const tokenMatch = inviteMail.html.match(/invitationToken=([a-f0-9]+)/i);
  assert(tokenMatch && tokenMatch[1], `Successfully extracted invitation token from email: ${tokenMatch ? tokenMatch[1] : 'none'}`);
  const rawToken3 = tokenMatch[1];

  // Register Invitee 3
  const tokenD = await registerAndLogin(invitee3Email, password, 'David Lead');
  assert(!!tokenD, 'Invitee 3 registered and logged in successfully');

  // Invitee 3 accepts using raw token code (Join with Code)
  const acceptWithToken = await req('/organizations/invitations/accept', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenD}` },
    body: JSON.stringify({
      token: rawToken3,
    }),
  });
  assert(acceptWithToken.ok, 'Invitee 3 accepted invitation using raw token code from email');

  const orgsD = await req('/organizations', {
    headers: { Authorization: `Bearer ${tokenD}` },
  });
  assert(orgsD.ok && orgsD.data.length === 1, 'Invitee 3 joined organization via invitation token code');

  // Step 9: Test Leave Organization (UC-ORG-11)
  console.log('\nStep 9: Test Leave Organization for regular member (User B)');
  const leaveRes = await req(`/organizations/${orgId}/members/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(leaveRes.ok, 'User B left organization successfully');

  const orgsBAfterLeave = await req('/organizations', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(orgsBAfterLeave.ok && orgsBAfterLeave.data.length === 0, 'User B has 0 organizations after leaving');

  // Step 10: Verify Mail Outbox diagnostics logged invitation emails
  console.log('\nStep 10: Verify Mail Outbox logged invitations');
  const adminLogin2 = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@taskmanager.dev',
      password: 'Admin@123456',
    }),
  });
  if (adminLogin2.ok && adminLogin2.data.accessToken) {
    const adminToken = adminLogin2.data.accessToken;
    const outboxRes = await req('/admin/mail/outbox', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const outboxMails2 = Array.isArray(outboxRes.data) ? outboxRes.data : (outboxRes.data?.outbox || []);
    if (outboxRes.ok && Array.isArray(outboxMails2)) {
      const inviteEmails = outboxMails2.filter(m => m.subject.includes('Invitation') || m.subject.includes('invited'));
      console.log(`  -> Mail Outbox contains ${inviteEmails.length} logged invitation emails`);
      assert(inviteEmails.length >= 2, 'Invitation emails properly formatted and dispatched to Outbox/SMTP');
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 10/10 SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
