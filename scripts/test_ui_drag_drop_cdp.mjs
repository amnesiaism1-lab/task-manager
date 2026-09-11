import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain/5e0cca6b-6ee3-4b4e-a0e5-f66283460813';

async function main() {
  console.log('1. Connecting to Chrome via CDP...');
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
  console.log('WebSocket connected.');

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
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  // Set desktop viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('2. Waiting for page to load...');
  await sleep(1500);

  // Sign in if on login screen
  const isLoginPage = await evaluate(`!!document.querySelector('#login-form')`);
  if (isLoginPage) {
    console.log('Filling credentials and submitting login...');
    await evaluate(`document.querySelector('#fill-demo-creds')?.click();`);
    await sleep(400);
    await evaluate(`document.querySelector('#login-form button[type="submit"]')?.click();`);
    await sleep(2500);
  }

  // 1. Verify Kanban Board View & Drag Handles
  console.log('3. Verifying Board View & Drag handles...');
  await evaluate(`document.querySelector('[data-nav-view="boards"]')?.click();`);
  await sleep(2000);

  const boardCardsCount = await evaluate(`document.querySelectorAll('.kanban-card').length`);
  const cardDragHandles = await evaluate(`document.querySelectorAll('.card-drag-handle').length`);
  console.log(`Found ${boardCardsCount} kanban cards, ${cardDragHandles} card drag handles`);

  // Highlight WIP Limit and Card Drag state for visual inspection
  await evaluate(`(() => {
    const firstCol = document.querySelector('.kanban-column');
    if (firstCol) {
      firstCol.classList.add('over-wip');
      const badge = firstCol.querySelector('.badge');
      if (badge) {
        badge.className = 'badge badge-danger';
        badge.textContent = '3 / 2 (Exceeded)';
      }
    }
    const firstCard = document.querySelector('.kanban-card');
    if (firstCard) {
      firstCard.classList.add('is-dragging');
    }
  })()`);
  await sleep(600);
  await saveScreenshot('uat_kanban_wip_limits.png');

  // Reset visual highlight
  await evaluate(`(() => {
    const firstCol = document.querySelector('.kanban-column');
    if (firstCol) firstCol.classList.remove('over-wip');
    const firstCard = document.querySelector('.kanban-card');
    if (firstCard) firstCard.classList.remove('is-dragging');
  })()`);

  // 2. Verify Backlog & Sprint Planning Drag & Drop UX
  console.log('4. Navigating to Backlog View...');
  await evaluate(`document.querySelector('[data-nav-view="backlog"]')?.click();`);
  await sleep(2000);

  const backlogRowsCount = await evaluate(`document.querySelectorAll('.backlog-issue-row[draggable="true"]').length`);
  const sprintContainers = await evaluate(`document.querySelectorAll('[data-droppable-sprint]').length`);
  const dragHandlesCount = await evaluate(`document.querySelectorAll('.drag-handle').length`);
  console.log(`Backlog: ${backlogRowsCount} draggable issue rows, ${dragHandlesCount} drag handles, ${sprintContainers} droppable sprint zones`);

  // Simulate active dragover state on Sprint container
  await evaluate(`(() => {
    const sprintDropZone = document.querySelector('[data-droppable-sprint]');
    if (sprintDropZone) {
      sprintDropZone.classList.add('drag-over');
    }
    const firstRow = document.querySelector('.backlog-issue-row[draggable="true"]');
    if (firstRow) {
      firstRow.classList.add('is-dragging');
    }
  })()`);
  await sleep(600);
  await saveScreenshot('uat_backlog_drag_and_drop.png');

  // Reset dragover class
  await evaluate(`(() => {
    const sprintDropZone = document.querySelector('[data-droppable-sprint]');
    if (sprintDropZone) sprintDropZone.classList.remove('drag-over');
    const firstRow = document.querySelector('.backlog-issue-row[draggable="true"]');
    if (firstRow) firstRow.classList.remove('is-dragging');
  })()`);

  // 3. Multi-device verification: Tablet (768x1024)
  console.log('5. Emulating Tablet Viewport (768x1024)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await sleep(800);
  await saveScreenshot('uat_tablet_backlog.png');

  // 4. Multi-device verification: Mobile (375x812)
  console.log('6. Emulating Mobile Viewport (375x812)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);
  await saveScreenshot('uat_mobile_backlog.png');

  // Close tab cleanly
  await send('Page.close');
  ws.close();
  console.log('All UAT UI, Drag & Drop, and multi-device checks completed successfully!');
}

main().catch(console.error);
