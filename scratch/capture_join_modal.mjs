import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain/5e0cca6b-6ee3-4b4e-a0e5-f66283460813';

async function run() {
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
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      const { resolve, reject } = pending.get(d.id);
      pending.delete(d.id);
      if (d.error) reject(d.error); else resolve(d.result);
    }
  };
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger openJoinOrgModal from Header
  await send('Runtime.evaluate', {
    expression: `
      const orgSwitcher = document.getElementById('org-switcher');
      if (orgSwitcher) {
        orgSwitcher.value = '__join__';
        orgSwitcher.dispatchEvent(new Event('change', { bubbles: true }));
      }
    `,
  });
  await new Promise(r => setTimeout(r, 1000));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'uat_join_with_code_modal.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved uat_join_with_code_modal.png');
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
}
run();
