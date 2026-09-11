import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain/5e0cca6b-6ee3-4b4e-a0e5-f66283460813';
const TARGET_ORG_ID = '4f5c2583-0f0e-4371-93b2-d095dc885c62'; // Acme Cloud Platform
const TARGET_PROJECT_ID = 'd1747c09-ea85-49f9-9467-538069636cdb'; // Cloud Platform & Infrastructure (13 issues)

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('1. Creating new browser target on http://localhost:5173/ ...');
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
  console.log('Connected to CDP.');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      console.warn('Eval warning/error:', expression.slice(0, 80), res.exceptionDetails?.exception?.description || res.exceptionDetails);
    }
    return res.result?.value;
  }

  async function saveScreenshot(filename) {
    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shotRes.data, 'base64');
    const fullPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`✓ Saved screenshot: ${filename}`);
  }

  // Set initial desktop 1440x900
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await sleep(1500);

  // Check if login needed
  const isLoginPage = await evaluate(`!!document.querySelector('#login-form')`);
  if (isLoginPage) {
    console.log('Logging in as admin...');
    await evaluate(`
      document.querySelector('#fill-demo-creds')?.click();
    `);
    await sleep(300);
    await evaluate(`
      document.querySelector('#login-form button[type="submit"]')?.click();
    `);
    await sleep(2500);
  }

  // Select Acme Cloud Platform & Project CLOUD
  console.log('Switching to Acme Cloud Platform & CLOUD project...');
  await evaluate(`
    // Switch org and project via select or store
    const orgSelect = document.querySelector('#org-switcher');
    if (orgSelect) {
      orgSelect.value = '${TARGET_ORG_ID}';
      orgSelect.dispatchEvent(new Event('change'));
    }
  `);
  await sleep(2000);

  await evaluate(`
    const prjSelect = document.querySelector('#project-filter');
    if (prjSelect) {
      prjSelect.value = '${TARGET_PROJECT_ID}';
      prjSelect.dispatchEvent(new Event('change'));
    }
  `);
  await sleep(2000);

  // 1. Kanban Board View
  console.log('Navigating to Boards view...');
  await evaluate(`document.querySelector('[data-nav-view="boards"]')?.click();`);
  await sleep(2000);
  await saveScreenshot('uat_boards_kanban.png');

  // 2. Backlog Planning View
  console.log('Navigating to Backlog view...');
  await evaluate(`document.querySelector('[data-nav-view="backlog"]')?.click();`);
  await sleep(2000);
  await saveScreenshot('uat_backlog_planning.png');

  // 3. Issue Detail Modal
  console.log('Opening Issue Detail modal...');
  await evaluate(`
    const issueCard = document.querySelector('.board-card, .backlog-issue-card, [data-open-issue]');
    if (issueCard) {
      issueCard.click();
    }
  `);
  await sleep(1500);
  await saveScreenshot('uat_issue_detail_view.png');

  // Close modal
  await evaluate(`document.querySelector('.modal-close-btn')?.click();`);
  await sleep(500);

  // 4. Dashboards View
  console.log('Navigating to Dashboards view...');
  await evaluate(`document.querySelector('[data-nav-view="dashboards"]')?.click();`);
  await sleep(1500);
  await saveScreenshot('uat_dashboard_metrics.png');

  // 5. Admin View
  console.log('Navigating to Admin view...');
  await evaluate(`document.querySelector('[data-nav-view="admin"]')?.click();`);
  await sleep(1500);
  await saveScreenshot('uat_admin_overview.png');

  // 6. Mobile Workboard View
  console.log('Emulating Mobile 375x812 iPhone View...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await evaluate(`document.querySelector('[data-nav-view="work"]')?.click();`);
  await sleep(1500);
  await saveScreenshot('uat_mobile_workboard.png');

  console.log('All UAT visual evidence captured successfully!');
  ws.close();

  // Close the target
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
}

main().catch(console.error);
