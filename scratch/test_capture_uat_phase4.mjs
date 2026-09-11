import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain/5e0cca6b-6ee3-4b4e-a0e5-f66283460813';
const API_BASE = 'http://localhost:3001/api';

async function api(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  return res.json().catch(() => null);
}

async function main() {
  console.log('🚀 1. Setting up test data for Phase 4 visual verification...');
  const ts = Date.now();
  const password = 'Password123!';
  const orgAdminEmail = `founder_${ts}@quantum.io`;
  const inviteeEmail = `kenji_${ts}@quantum.io`;

  // 1. Log in as System Admin to provision users
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' }),
  });
  const systemAdminToken = adminLogin.accessToken;
  console.log('  -> System Admin logged in:', !!systemAdminToken);

  // 2. Create Org Founder & Invitee accounts
  await api('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${systemAdminToken}` },
    body: JSON.stringify({ email: orgAdminEmail, password, fullName: 'Elena Rostova' }),
  });
  await api('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${systemAdminToken}` },
    body: JSON.stringify({ email: inviteeEmail, password, fullName: 'Kenji Sato' }),
  });
  console.log('  -> Created Founder & Invitee accounts');

  // 3. Founder logs in and creates Organization
  const founderLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: orgAdminEmail, password }),
  });
  const founderToken = founderLogin.accessToken;

  const orgRes = await api('/organizations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${founderToken}` },
    body: JSON.stringify({ name: 'Quantum Innovations Labs', key: `QL${String(ts).slice(-3)}` }),
  });
  const orgId = orgRes.id || orgRes.organization?.id;
  console.log('  -> Created Organization:', orgId);

  // 4. Fetch roles and invite newhire
  const roles = await api(`/organizations/${orgId}/roles`, {
    headers: { Authorization: `Bearer ${founderToken}` },
  });
  const memberRole = roles.find(r => r.key === 'member') || roles[0];

  const inviteRes = await api(`/organizations/${orgId}/invitations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${founderToken}` },
    body: JSON.stringify({ email: inviteeEmail, roleId: memberRole?.id }),
  });
  console.log('  -> Created invitation for invitee:', inviteRes.id);

  // 5. Invitee logs in via API
  const inviteeLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: inviteeEmail, password }),
  });
  const inviteeToken = inviteeLogin.accessToken;
  console.log('  -> Invitee logged in via API:', !!inviteeToken);

  // 6. Connect to CDP
  console.log('🚀 2. Connecting to Chrome DevTools Protocol...');
  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/', { method: 'PUT' });
  const target = await newTargetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) console.error('Eval error:', expression, res.exceptionDetails);
    return res.result?.value;
  }

  async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function saveScreenshot(filename) {
    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shotRes.data, 'base64');
    const fullPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`📸 Saved screenshot: ${filename}`);
  }

  // Set desktop viewport 1440x900
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await sleep(1000);

  // Set token directly in localStorage for Kenji Sato and reload to trigger Onboarding View
  console.log('🚀 3. Setting session for Kenji Sato (0 orgs) & reloading...');
  await evaluate(`
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('tm_token', '${inviteeToken}');
    localStorage.removeItem('tm_org');
    window.location.reload();
  `);
  await sleep(3000);

  // Verify Onboarding View rendered
  const isOnboarding = await evaluate(`!!document.getElementById('onboarding-view')`);
  console.log('  -> Onboarding view rendered:', isOnboarding);

  // Screenshot 1: Onboarding View for new user with 0 orgs & pending invitation
  await saveScreenshot('uat_onboarding_view_0_orgs.png');

  // Step B: Open Join with Code modal from Onboarding Card 3
  console.log('🚀 4. Opening Join with Code modal...');
  await evaluate(`
    const joinBtn = document.getElementById('btn-onboarding-join-code');
    if (joinBtn) joinBtn.click();
  `);
  await sleep(1000);
  await saveScreenshot('uat_join_with_code_modal.png');

  // Close modal
  await evaluate(`
    const closeBtn = document.getElementById('btn-cancel-join-code') || document.querySelector('.modal-close') || document.querySelector('.modal-backdrop');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(600);

  // Step C: Accept Invitation in Onboarding View (1-Click)
  console.log('🚀 5. Accepting invitation 1-click in Onboarding View...');
  await evaluate(`
    const acceptBtn = document.querySelector('.btn-accept-onboarding-invite');
    if (acceptBtn) acceptBtn.click();
  `);
  await sleep(3500);

  // Screenshot 2: Workboard after successfully joining organization
  await saveScreenshot('uat_workboard_after_joining_org.png');

  // Step D: Open User Profile Modal to verify Account settings and pending invites section
  console.log('🚀 6. Opening User Profile Modal...');
  await evaluate(`
    const userBtn = document.getElementById('header-user-btn');
    if (userBtn) userBtn.click();
  `);
  await sleep(1200);
  await saveScreenshot('uat_user_profile_pending_invitations.png');

  // Close modal
  await evaluate(`
    const modalClose = document.getElementById('btn-close-profile-modal') || document.querySelector('.modal-close') || document.querySelector('.modal-backdrop');
    if (modalClose) modalClose.click();
  `);
  await sleep(600);

  // Step E: Switch session to Founder (Org Admin) to view Admin Members tab with Role selector
  console.log('🚀 7. Switching session to Founder (Org Admin)...');
  await evaluate(`
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('tm_token', '${founderToken}');
    localStorage.setItem('tm_org', '${orgId}');
    window.location.reload();
  `);
  await sleep(3000);

  // Navigate to Admin Console via sidebar
  await evaluate(`
    const adminNav = document.querySelector('[data-nav-view="admin"]');
    if (adminNav) adminNav.click();
  `);
  await sleep(1800);

  // Switch to Members & Invites tab in Admin
  await evaluate(`
    const membersTab = document.querySelector('[data-admin-tab="members"]');
    if (membersTab) membersTab.click();
  `);
  await sleep(1500);

  // Fill in sample email and select role in the form for visual demonstration
  await evaluate(`
    const emailInput = document.getElementById('invite-email-input');
    if (emailInput) emailInput.value = 'developer@quantum.io';
  `);
  await sleep(500);

  // Screenshot 3: Admin Invite Member form with Role dropdown & Email
  await saveScreenshot('uat_admin_invite_member_modal_roles.png');

  // Close browser target
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  console.log('\n🎉 ALL 5 CDP SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('CDP test failed:', err);
  process.exit(1);
});
