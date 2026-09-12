import { ChromeRunner } from './chrome_runner.mjs';

const BASE_URL = 'https://task-manager-pqt2.vercel.app';
const API_URL = `${BASE_URL}/api`;

async function main() {
  const runner = new ChromeRunner(9223, 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_test_render');
  await runner.start();

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Get Admin tokens
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const refreshToken = loginData.refreshToken;

  const bRes = await fetch(`${API_URL}/workspace/bootstrap`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const bData = await bRes.json();
  const orgId = bData.activeOrgId || bData.organizations?.[0]?.id;
  const projectId = bData.activeProjectId || bData.projects?.[0]?.id;

  await runner.navigate(BASE_URL);
  await runner.evaluate(`(() => {
    localStorage.setItem('tm_token', '${token}');
    localStorage.setItem('tm_refresh', '${refreshToken}');
    localStorage.setItem('tm_org', '${orgId}');
    localStorage.setItem('tm_project', '${projectId}');
    window.location.reload();
  })()`);
  await wait(3000);

  // Test 1: openModal
  const resModal = await runner.evaluate(`(() => {
    if (window.__TM?.openModal) {
      window.__TM.openModal({
        title: 'TEST MODAL CONFIRMATION',
        subtitle: 'SYSTEM AUTOMATION ENGINE',
        contentHtml: '<div style="padding: 10px; color: #38bdf8;">TEST CONTENT VERIFIED</div>',
        size: 'medium'
      });
      return { ok: true, html: document.querySelector('#tm-modal-overlay')?.outerHTML?.substring(0, 100) };
    }
    return { ok: false };
  })()`);
  console.log('Modal test:', resModal);

  // Test 2: showToast
  const resToast = await runner.evaluate(`(() => {
    if (window.__TM?.showToast) {
      window.__TM.showToast('Test Toast Notification System Success', 'success');
      return { ok: true, html: document.querySelector('#tm-toast-container')?.outerHTML?.substring(0, 100) };
    }
    return { ok: false };
  })()`);
  console.log('Toast test:', resToast);

  // Test 3: admin tab switch
  const resTab = await runner.evaluate(`(() => {
    if (window.__TM?.store) {
      window.__TM.store.setState({ view: 'admin', adminTab: 'workflows' });
      return { ok: true, activeTab: document.querySelector('.admin-tab-btn.active')?.textContent?.trim() };
    }
    return { ok: false };
  })()`);
  console.log('Admin tab test:', resTab);

  await runner.close();
}

main().catch(console.error);
