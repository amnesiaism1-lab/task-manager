import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain/5e0cca6b-6ee3-4b4e-a0e5-f66283460813';

async function main() {
  console.log('1. Connecting to Chrome CDP...');
  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/', { method: 'PUT' });
  const target = await newTargetRes.json();
  console.log('Target created:', target.id);

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
    if (res.exceptionDetails) {
      console.error('Eval error:', expression, res.exceptionDetails);
    }
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // 1. Reset state to login
  await evaluate(`
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  `);
  await sleep(1500);

  // Capture Login Page with Google Button
  await saveScreenshot('uat_login_with_google_btn.png');

  // 2. Click Google Auth Button
  console.log('2. Clicking Google Auth Button...');
  await evaluate(`document.querySelector('#google-auth-btn')?.click()`);
  await sleep(800);
  await saveScreenshot('uat_google_auth_modal.png');

  // 3. Click Google Account tile (Alex Google)
  console.log('3. Selecting Google demo account tile...');
  await evaluate(`document.querySelector('.google-account-tile')?.click()`);
  await sleep(1800);
  await saveScreenshot('uat_google_auth_logged_in.png');

  // 4. Log out and log in as System Admin
  console.log('4. Logging in as System Admin...');
  await evaluate(`
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  `);
  await sleep(1500);

  await evaluate(`
    document.querySelector('#login-email').value = 'admin@taskmanager.dev';
    document.querySelector('#login-password').value = 'Admin@123456';
    document.querySelector('#login-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  `);
  await sleep(2200);

  // 5. Navigate to Administration -> Platform Admin tab
  console.log('5. Navigating to Platform Administration...');
  await evaluate(`
    document.querySelector('[data-nav-view="admin"]')?.click();
  `);
  await sleep(1500);

  await evaluate(`
    document.querySelector('[data-admin-tab="system"]')?.click();
  `);
  await sleep(1800);
  await saveScreenshot('uat_admin_user_crud_table.png');

  // 6. Click "+ Add User" button
  console.log('6. Opening Add User modal...');
  await evaluate(`
    document.querySelector('#btn-admin-add-user')?.click();
  `);
  await sleep(1000);
  await saveScreenshot('uat_admin_create_user_modal.png');

  // Fill in new user form and submit
  console.log('6b. Submitting Add User form...');
  await evaluate(`
    document.querySelector('#new-user-email').value = 'eva.martinez@company.com';
    document.querySelector('#new-user-name').value = 'Eva Martinez';
    document.querySelector('#new-user-password').value = 'SecurePass@123';
    document.querySelector('#form-create-admin-user').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  `);
  await sleep(2200);
  await saveScreenshot('uat_admin_user_created_success.png');

  // 7. Test Diagnostic Mail Dispatch
  console.log('7. Testing Mail Gateway Diagnostics...');
  await evaluate(`
    document.querySelector('#test-mail-recipient').value = 'dev.lead@taskmanager.dev';
    document.querySelector('#test-mail-subject').value = 'Automated Verification of SMTP Gateway';
    document.querySelector('#form-send-test-mail').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  `);
  await sleep(2200);

  await saveScreenshot('uat_admin_mail_diagnostics_outbox.png');

  console.log('✨ Browser UI Verification completed successfully!');
  await send('Target.closeTarget', { targetId: target.id });
  ws.close();
}

main().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
