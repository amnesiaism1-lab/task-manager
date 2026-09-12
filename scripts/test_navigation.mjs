import { ChromeRunner } from './chrome_runner.mjs';

async function testNavigation() {
  const runner = new ChromeRunner(9222, 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_qa_nav_test');
  await runner.start();
  console.log('Chrome runner started.');

  await runner.navigate('https://task-manager-pqt2.vercel.app/');
  console.log('Navigated to live app.');

  // Login using evaluate
  const loginRes = await runner.evaluate(`
    (async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' })
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('tm_token', data.accessToken);
        localStorage.setItem('tm_refresh', data.refreshToken);
        window.location.reload();
        return { success: true, email: data.user.email };
      }
      return { success: false, data };
    })()
  `);
  console.log('Login result:', loginRes);

  // Wait for reload and UI load
  await new Promise(r => setTimeout(r, 4000));

  // Take screenshot of Work view
  await runner.captureScreenshot('preview_work_view.png');

  // Switch to Boards view
  await runner.evaluate(`window.dispatchEvent(new CustomEvent('change-view', { detail: { view: 'boards' } }))`);
  await new Promise(r => setTimeout(r, 2000));
  await runner.captureScreenshot('preview_boards_view.png');

  // Switch to Backlog view
  await runner.evaluate(`window.dispatchEvent(new CustomEvent('change-view', { detail: { view: 'backlog' } }))`);
  await new Promise(r => setTimeout(r, 2000));
  await runner.captureScreenshot('preview_backlog_view.png');

  // Switch to Admin view
  await runner.evaluate(`window.dispatchEvent(new CustomEvent('change-view', { detail: { view: 'admin' } }))`);
  await new Promise(r => setTimeout(r, 2000));
  await runner.captureScreenshot('preview_admin_view.png');

  await runner.close();
  console.log('Completed test navigation.');
}

testNavigation().catch(console.error);
