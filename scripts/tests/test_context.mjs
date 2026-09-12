import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { DbHelper } from '../db_helper.mjs';
import { ChromeRunner } from '../chrome_runner.mjs';

export const BASE_URL = process.env.BASE_URL || 'https://task-manager-pqt2.vercel.app';
export const API_URL = `${BASE_URL}/api`;

export class TestContext {
  constructor() {
    this.db = new DbHelper();
    this.chrome = new ChromeRunner(9222, 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_qa_evidence_master');
    this.results = new Map();
    this.adminToken = '';
    this.adminRefreshToken = '';
    this.adminUser = null;
    this.activeOrgId = '';
    this.activeProjectId = '';
    this.baseUrl = BASE_URL;
  }

  async init() {
    console.log('\n======================================================');
    console.log('⚡ Initializing Master Test Context for Live Production');
    console.log(`Target: ${BASE_URL}`);
    console.log('======================================================\n');

    await this.db.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    await this.chrome.start();
    console.log('✅ Chrome CDP runner started (1440x900)');

    // Authenticate Admin
    const loginRes = await this.api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' })
    });
    if (loginRes.ok && loginRes.data?.accessToken) {
      this.adminToken = loginRes.data.accessToken;
      this.adminRefreshToken = loginRes.data.refreshToken;
      this.adminUser = loginRes.data.user;
      console.log(`✅ Admin authenticated: ${this.adminUser.email} (${this.adminUser.fullName})`);
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
    }

    // Authenticate Developer
    const devLoginRes = await this.api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'developer@taskmanager.dev', password: 'Dev@123456' })
    });
    if (devLoginRes.ok && devLoginRes.data?.accessToken) {
      this.devToken = devLoginRes.data.accessToken;
      this.devUser = devLoginRes.data.user;
      console.log(`✅ Developer authenticated: ${this.devUser.email} (${this.devUser.fullName})`);
    }

    // Bootstrap workspace to get active Org & Project
    const bootstrapRes = await this.authApi('/workspace/bootstrap');
    if (bootstrapRes.ok && bootstrapRes.data?.user) {
      this.activeOrgId = bootstrapRes.data.activeOrgId || bootstrapRes.data.organizations?.[0]?.id || '';
      this.activeProjectId = bootstrapRes.data.activeProjectId || bootstrapRes.data.projects?.[0]?.id || '';
      console.log(`✅ Workspace bootstrapped: Org = ${this.activeOrgId}, Project = ${this.activeProjectId}`);
    }

    // Set token in Chrome and navigate
    await this.chrome.navigate(BASE_URL);
    await this.chrome.evaluate(`
      localStorage.setItem('tm_token', '${this.adminToken}');
      localStorage.setItem('tm_refresh', '${this.adminRefreshToken}');
      localStorage.setItem('tm_org', '${this.activeOrgId}');
      localStorage.setItem('tm_project', '${this.activeProjectId}');
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 4000));
    console.log('✅ Chrome authenticated session synchronized.\\n');
  }

  async api(path, options = {}) {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const start = performance.now();
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      }
      const res = await fetch(url, {
        ...options,
        headers,
      });
      const duration = Math.round(performance.now() - start);
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      return { status: res.status, ok: res.ok, data, duration, headers: res.headers };
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      return { status: 0, ok: false, error: err.message, duration };
    }
  }

  async authApi(path, options = {}) {
    return this.api(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.adminToken}`,
        ...options.headers,
      }
    });
  }

  async devAuthApi(path, options = {}) {
    return this.api(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.devToken}`,
        ...options.headers,
      }
    });
  }

  record(tcId, details) {
    this.results.set(tcId, {
      id: tcId,
      ...details,
    });
    const mark = details.status === 'PASS' ? '✓ \x1b[32m[PASS]\x1b[0m' : '✗ \x1b[31m[FAIL]\x1b[0m';
    console.log(`  ${mark} \x1b[1m${tcId}\x1b[0m: ${details.title} (${details.duration || 0}ms)`);
  }

  async capture(tcId, actionName) {
    const filename = `${tcId}_${actionName}.png`;
    await this.chrome.captureScreenshot(filename);
    return filename;
  }

  async close() {
    await this.chrome.close();
    await this.db.close();
    console.log('\nTest context closed.');
  }
}
