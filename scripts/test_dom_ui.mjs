import { ChromeRunner } from './chrome_runner.mjs';

async function test() {
  const runner = new ChromeRunner(9222, 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_dom_test');
  await runner.start();
  await runner.navigate('https://task-manager-pqt2.vercel.app');

  // 1. Clear session to test Auth view
  await runner.evaluate(`
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  `);
  await new Promise(r => setTimeout(r, 2000));

  // Click Register tab
  await runner.evaluate(`
    const regTab = document.querySelector('#tab-register') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Register'));
    if (regTab) regTab.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await runner.captureScreenshot('test_auth_register_tab.png');

  // Fill Register inputs
  await runner.evaluate(`
    const email = document.querySelector('input[type="email"]');
    const name = document.querySelector('input[placeholder*="name" i]') || document.querySelector('input[name="fullName"]');
    const pass = document.querySelector('input[type="password"]');
    if (email) email.value = 'tester.alpha@taskmanager.dev';
    if (name) name.value = 'Le Van Alpha';
    if (pass) pass.value = 'Password@123456';
  `);
  await new Promise(r => setTimeout(r, 500));
  await runner.captureScreenshot('test_auth_register_filled.png');

  await runner.close();
  console.log('✅ Auth DOM test completed successfully!');
}

test().catch(console.error);
