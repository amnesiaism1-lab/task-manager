import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export class ChromeRunner {
  constructor(port = 9222, userDataDir = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_qa_evidence_runner') {
    this.port = port;
    this.userDataDir = userDataDir;
    this.proc = null;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.targetId = null;
  }

  async start() {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    this.proc = spawn(chromePath, [
      `--remote-debugging-port=${this.port}`,
      '--headless=new',
      '--disable-gpu',
      `--user-data-dir=${this.userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1440,900',
      'about:blank'
    ]);

    // Wait for CDP port
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 250));
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (res.ok) break;
      } catch {}
    }

    const newTargetRes = await fetch(`http://127.0.0.1:${this.port}/json/new?about:blank`, { method: 'PUT' });
    const target = await newTargetRes.json();
    this.targetId = target.id;

    this.ws = new WebSocket(target.webSocketDebuggerUrl);
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise((resolve) => (this.ws.onopen = resolve));
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url, waitMs = 2500) {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      console.error('Eval error:', expression, res.exceptionDetails);
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const shotRes = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shotRes.data, 'base64');
    const fullPath = path.resolve('docs/evidence_tc', filename);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    console.log(`  📸 [SCREENSHOT] ${filename} (${buffer.length} bytes)`);
    return filename;
  }

  async close() {
    try {
      if (this.targetId) {
        await fetch(`http://127.0.0.1:${this.port}/json/close/${this.targetId}`);
      }
      if (this.ws) this.ws.close();
      if (this.proc) this.proc.kill();
    } catch {}
  }
}
