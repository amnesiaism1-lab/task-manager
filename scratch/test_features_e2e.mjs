// scratch/test_features_e2e.mjs
import assert from 'node:assert';

const API = 'http://localhost:3001/api';

async function req(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || `HTTP ${res.status}`;
    const err = new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function run() {
  console.log('🚀 Starting E2E Verification for Mail, Google Auth & Admin User CRUD...\n');

  // 1. Authenticate as pre-seeded System Admin
  console.log('--- Step 1: Login as System Admin ---');
  const adminAuth = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@taskmanager.dev', password: 'Admin@123456' }),
  });
  assert(adminAuth.accessToken, 'Admin access token must be returned');
  assert(adminAuth.user.isSystemAdmin, 'Admin user must have isSystemAdmin = true');
  console.log('✅ Logged in as System Admin:', adminAuth.user.email);
  const adminHeaders = { Authorization: `Bearer ${adminAuth.accessToken}` };

  // 2. Test Google OAuth registration & sign-in
  console.log('\n--- Step 2: Google OAuth Registration & Sign-In ---');
  const testGoogleEmail = `google.user.${Date.now()}@example.com`;
  const googleReg = await req('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      demoEmail: testGoogleEmail,
      demoName: 'Google Agility Tester',
    }),
  });
  assert(googleReg.accessToken, 'Google registration must return accessToken');
  assert(googleReg.user.email === testGoogleEmail, 'Email must match registered Google email');
  assert(googleReg.user.emailVerifiedAt, 'Google registered user must be auto-verified');
  console.log('✅ Google New Registration succeeded for:', googleReg.user.email);

  // Google sign-in for existing account
  const googleLogin = await req('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      demoEmail: testGoogleEmail,
      demoName: 'Google Agility Tester Updated',
    }),
  });
  assert(googleLogin.user.id === googleReg.user.id, 'Same user ID must be returned on subsequent Google login');
  console.log('✅ Subsequent Google Sign-In succeeded for existing account');

  // 3. Test Admin Mail Diagnostics & Outbox
  console.log('\n--- Step 3: Admin Mail Gateway & Outbox ---');
  const testMailRes = await req('/admin/mail/test', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      to: 'diagnostic.target@taskmanager.dev',
      subject: 'Automated E2E Verification Test',
    }),
  });
  assert(testMailRes.success, 'Test email dispatch must report success');
  console.log('✅ Diagnostic test email dispatched successfully:', testMailRes.message);

  const outbox = await req('/admin/mail/outbox', { headers: adminHeaders });
  assert(Array.isArray(outbox), 'Outbox must return an array');
  assert(outbox.length > 0, 'Outbox must contain recent emails');
  console.log(`✅ Mail outbox retrieved successfully (${outbox.length} entries)`);
  console.log('   Latest outbox entry:', { to: outbox[0].to, category: outbox[0].category, subject: outbox[0].subject });

  // 4. Test Admin User CRUD
  console.log('\n--- Step 4: Admin User CRUD Operations ---');
  const newAccountEmail = `crud.user.${Date.now()}@taskmanager.dev`;
  
  // 4a. Create User via Admin
  const createdUser = await req('/admin/users', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      email: newAccountEmail,
      fullName: 'CRUD Test Subject',
      status: 'active',
      isSystemAdmin: false,
      sendVerificationEmail: true,
    }),
  });
  assert(createdUser.id, 'Created user must have an ID');
  assert(createdUser.email === newAccountEmail, 'Created user email must match');
  console.log('✅ Admin successfully created user:', createdUser.email, 'Temp pass generated:', !!createdUser.temporaryPassword);

  // 4b. Update User via Admin
  const updatedUser = await req(`/admin/users/${createdUser.id}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: 'CRUD Test Subject (Updated Name)',
      status: 'suspended',
      isSystemAdmin: true,
    }),
  });
  assert(updatedUser.fullName === 'CRUD Test Subject (Updated Name)', 'Full name should be updated');
  assert(updatedUser.status === 'suspended', 'Status should be updated to suspended');
  assert(updatedUser.isSystemAdmin === true, 'Role should be updated to system admin');
  console.log('✅ Admin successfully updated user details, status to suspended, and granted admin');

  // 4c. Delete User via Admin
  const deleteRes = await req(`/admin/users/${createdUser.id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert(deleteRes.success, 'Delete operation must report success');
  console.log('✅ Admin successfully deleted user account:', deleteRes.message);

  // 4d. Security Guard: Prevent Admin Self-Deletion
  try {
    await req(`/admin/users/${adminAuth.user.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert.fail('Should have blocked self-deletion');
  } catch (err) {
    assert(err.status === 409, 'Self-deletion must return 409 Conflict');
    console.log('✅ Security guard verified: Admin self-deletion prevented with 409 Conflict');
  }

  // 5. Verify Standard Auth Mail Flows (Verification & Reset)
  console.log('\n--- Step 5: Standard Auth Email Notifications ---');
  const regEmail = `verify.subject.${Date.now()}@taskmanager.dev`;
  const regUser = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: regEmail,
      password: 'Password@123',
      fullName: 'Verify Subject',
    }),
  });
  assert(regUser.user.id, 'Register user must succeed');
  console.log('✅ User registered with verification email triggered');

  const forgotRes = await req('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: regEmail }),
  });
  assert(forgotRes.accepted, 'Forgot password request must be accepted');
  console.log('✅ Password reset email request accepted');

  const freshOutbox = await req('/admin/mail/outbox', { headers: adminHeaders });
  const hasVerify = freshOutbox.some(m => m.to === regEmail && m.category === 'verification');
  const hasReset = freshOutbox.some(m => m.to === regEmail && m.category === 'password_reset');
  assert(hasVerify, 'Outbox must have captured the verification email');
  assert(hasReset, 'Outbox must have captured the password reset email');
  console.log('✅ Verified both verification email and password reset email delivered to outbox buffer');

  console.log('\n🎉 ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY! 💯');
}

run().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
