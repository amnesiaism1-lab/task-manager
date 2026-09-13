import { DbHelper } from './db_helper.mjs';
import * as bcrypt from 'bcryptjs';

async function deleteIssueAggregate(db, issueId) {
  await db.query(`DELETE FROM issue_custom_field_values WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM issue_links WHERE issue_id = $1 OR linked_issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM issue_labels WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM comments WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM work_logs WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM board_issue_positions WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM issue_state_history WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM issue_sprint_history WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM attachments WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM issue_watchers WHERE issue_id = $1`, [issueId]);
  await db.query(`DELETE FROM issues WHERE id = $1`, [issueId]);
}

async function deleteProjectAggregate(db, projectId) {
  // 1. Xóa toàn bộ issues và các bảng con
  const pIssues = await db.query(`SELECT id FROM issues WHERE project_id = $1`, [projectId]);
  for (const iss of pIssues.rows) {
    await deleteIssueAggregate(db, iss.id);
  }

  // 2. Xóa sprints và sprint histories
  await db.query(`DELETE FROM issue_sprint_history WHERE sprint_id IN (SELECT id FROM sprints WHERE project_id = $1)`, [projectId]);
  await db.query(`UPDATE issues SET sprint_id = NULL WHERE project_id = $1`, [projectId]);
  await db.query(`DELETE FROM sprints WHERE project_id = $1`, [projectId]);

  // 3. Xóa boards và columns
  const boards = await db.query(`SELECT id FROM boards WHERE project_id = $1`, [projectId]);
  for (const b of boards.rows) {
    const cols = await db.query(`SELECT id FROM board_columns WHERE board_id = $1`, [b.id]);
    for (const c of cols.rows) {
      await db.query(`DELETE FROM board_column_states WHERE board_column_id = $1`, [c.id]);
    }
    await db.query(`DELETE FROM board_columns WHERE board_id = $1`, [b.id]);
  }
  await db.query(`DELETE FROM boards WHERE project_id = $1`, [projectId]);

  // 4. Xóa components & versions
  await db.query(`DELETE FROM project_components WHERE project_id = $1`, [projectId]);
  await db.query(`DELETE FROM project_versions WHERE project_id = $1`, [projectId]);

  // 5. Gỡ bỏ liên kết permission_scheme_id trên project
  await db.query(`UPDATE projects SET permission_scheme_id = NULL WHERE id = $1`, [projectId]);

  // 6. Xóa permission_schemes và entries
  const schemes = await db.query(`SELECT id FROM permission_schemes WHERE project_id = $1`, [projectId]);
  for (const sc of schemes.rows) {
    await db.query(`DELETE FROM permission_scheme_entries WHERE scheme_id = $1`, [sc.id]);
    await db.query(`DELETE FROM permission_schemes WHERE id = $1`, [sc.id]);
  }

  // 7. Xóa project_group_roles, project_member_roles và project_members
  await db.query(`DELETE FROM project_group_roles WHERE project_role_id IN (SELECT id FROM project_roles WHERE project_id = $1)`, [projectId]);
  const projMems = await db.query(`SELECT id FROM project_members WHERE project_id = $1`, [projectId]);
  for (const pm of projMems.rows) {
    await db.query(`DELETE FROM project_member_roles WHERE project_member_id = $1`, [pm.id]);
    await db.query(`DELETE FROM project_members WHERE id = $1`, [pm.id]);
  }

  // 8. Xóa project_roles
  await db.query(`DELETE FROM project_roles WHERE project_id = $1`, [projectId]);

  // 9. Xóa custom_field_contexts
  await db.query(`DELETE FROM custom_field_contexts WHERE project_id = $1`, [projectId]);

  // 10. Xóa project
  await db.query(`DELETE FROM projects WHERE id = $1`, [projectId]);
}

async function cleanDatabase() {
  console.log('====================================================');
  console.log('🧹 BẮT ĐẦU DỌN DẸP DỮ LIỆU RÁC TRÊN DATABASE (SUPABASE)');
  console.log('====================================================\n');

  const db = new DbHelper();
  await db.connect();

  try {
    // 1. Lấy danh sách ID các user cần giữ lại
    const keepEmails = ['admin@taskmanager.dev', 'developer@taskmanager.dev', 'amnemesas1@gmail.com'];
    console.log('1. Bảo lưu các tài khoản chuẩn:', keepEmails);

    // Xóa tất cả các user test tester.alpha_* và user rác khác
    const junkUsersRes = await db.query(
      `SELECT id, email FROM users WHERE email NOT IN ($1, $2, $3)`,
      keepEmails
    );
    const junkUserIds = junkUsersRes.rows.map(r => r.id);
    console.log(`Tìm thấy ${junkUserIds.length} user test/rác cần xóa:`, junkUsersRes.rows.map(r => r.email));

    // 2. Lấy danh sách Tổ chức (Organizations) cần giữ lại
    const keepOrgKeys = ['ACME', 'landautien'];
    console.log('\n2. Bảo lưu các Tổ chức chính:', keepOrgKeys);

    const junkOrgsRes = await db.query(
      `SELECT id, key, name FROM organizations WHERE key NOT IN ($1, $2)`,
      keepOrgKeys
    );
    const junkOrgIds = junkOrgsRes.rows.map(r => r.id);
    console.log(`Tìm thấy ${junkOrgIds.length} tổ chức test rác cần xóa:`, junkOrgsRes.rows.map(r => r.key));

    // Khôi phục tên chuẩn cho ACME
    await db.query(`UPDATE organizations SET name = 'Acme Cloud Platform', status = 'active' WHERE key = 'ACME'`);
    console.log('✓ Đã khôi phục tên chuẩn cho Organization: ACME -> Acme Cloud Platform');

    // 3. Xóa các Projects rác trong ACME (chỉ giữ lại project 'CLOUD')
    const keepProjectKeys = ['CLOUD'];
    const junkProjectsRes = await db.query(
      `SELECT p.id, p.key, p.name FROM projects p 
       JOIN organizations o ON p.org_id = o.id 
       WHERE o.key = 'ACME' AND p.key NOT IN ($1)`,
      keepProjectKeys
    );
    const junkProjectIds = junkProjectsRes.rows.map(r => r.id);
    console.log(`\n3. Tìm thấy ${junkProjectIds.length} projects test rác trong ACME:`, junkProjectsRes.rows.map(r => r.key));

    // 4. Tìm ID của project CLOUD và dọn dẹp các issue rác
    const cloudProj = await db.queryOne(`SELECT p.id FROM projects p JOIN organizations o ON p.org_id = o.id WHERE o.key = 'ACME' AND p.key = 'CLOUD'`);
    if (cloudProj) {
      await db.query(`UPDATE projects SET name = 'Cloud Platform & Infrastructure', next_issue_number = 8 WHERE id = $1`, [cloudProj.id]);
      console.log('✓ Đã khôi phục tên chuẩn cho Project CLOUD: Cloud Platform & Infrastructure (next_issue_number = 8)');

      // Xóa tất cả các issues rác trong CLOUD có key không thuộc CLOUD-1 -> CLOUD-7
      const keepIssueKeys = ['CLOUD-1', 'CLOUD-2', 'CLOUD-3', 'CLOUD-4', 'CLOUD-5', 'CLOUD-6', 'CLOUD-7'];
      const junkIssuesRes = await db.query(
        `SELECT id, key FROM issues WHERE project_id = $1 AND key NOT IN ($2, $3, $4, $5, $6, $7, $8)`,
        [cloudProj.id, ...keepIssueKeys]
      );
      console.log(`Tìm thấy ${junkIssuesRes.rows.length} issues rác trong CLOUD cần dọn dẹp`);
      for (const row of junkIssuesRes.rows) {
        await deleteIssueAggregate(db, row.id);
      }
      console.log('✓ Đã dọn dẹp xong issues rác trong CLOUD');

      // Xóa các sprints thừa trong CLOUD (chỉ giữ lại Sprint 1 và Sprint 2)
      const junkSprints = await db.query(
        `SELECT id, name FROM sprints WHERE project_id = $1 AND name NOT IN ('Sprint 1 — Core Foundation', 'Sprint 2 — Performance & Scale')`,
        [cloudProj.id]
      );
      console.log(`Tìm thấy ${junkSprints.rows.length} sprint thừa trong CLOUD cần xóa`);
      for (const s of junkSprints.rows) {
        await db.query(`DELETE FROM issue_sprint_history WHERE sprint_id = $1`, [s.id]);
        await db.query(`UPDATE issues SET sprint_id = NULL WHERE sprint_id = $1`, [s.id]);
        await db.query(`DELETE FROM sprints WHERE id = $1`, [s.id]);
      }
      console.log('✓ Đã dọn dẹp xong sprints thừa trong CLOUD');
    }

    // 5. Xóa toàn bộ các Project rác trong ACME
    console.log('\n5. Đang tiến hành xóa các project rác và dữ liệu phụ thuộc...');
    for (const pId of junkProjectIds) {
      await deleteProjectAggregate(db, pId);
    }
    console.log('✓ Đã xóa xong toàn bộ project rác');

    // 6. Xóa các Tổ chức rác
    console.log('\n6. Đang tiến hành xóa các tổ chức test rác...');
    for (const oId of junkOrgIds) {
      const orgProjs = await db.query(`SELECT id FROM projects WHERE org_id = $1`, [oId]);
      for (const pr of orgProjs.rows) {
        await deleteProjectAggregate(db, pr.id);
      }

      await db.query(`DELETE FROM organization_invitations WHERE org_id = $1`, [oId]);
      await db.query(`DELETE FROM department_members WHERE department_id IN (SELECT id FROM departments WHERE org_id = $1)`, [oId]);
      await db.query(`DELETE FROM departments WHERE org_id = $1`, [oId]);

      const groups = await db.query(`SELECT id FROM groups WHERE org_id = $1`, [oId]);
      for (const g of groups.rows) {
        await db.query(`DELETE FROM project_group_roles WHERE group_id = $1`, [g.id]);
        await db.query(`DELETE FROM group_members WHERE group_id = $1`, [g.id]);
        await db.query(`DELETE FROM groups WHERE id = $1`, [g.id]);
      }

      const orgMems = await db.query(`SELECT id FROM organization_members WHERE org_id = $1`, [oId]);
      for (const om of orgMems.rows) {
        await db.query(`DELETE FROM org_member_roles WHERE org_member_id = $1`, [om.id]);
        await db.query(`DELETE FROM organization_members WHERE id = $1`, [om.id]);
      }

      const roles = await db.query(`SELECT id FROM org_roles WHERE org_id = $1`, [oId]);
      for (const r of roles.rows) {
        await db.query(`DELETE FROM org_role_permission_entries WHERE role_id = $1`, [r.id]);
        await db.query(`DELETE FROM org_roles WHERE id = $1`, [r.id]);
      }

      // Xóa custom fields của org rác
      const cfs = await db.query(`SELECT id FROM custom_fields WHERE org_id = $1`, [oId]);
      for (const cf of cfs.rows) {
        await db.query(`DELETE FROM custom_field_options WHERE custom_field_id = $1`, [cf.id]);
        await db.query(`DELETE FROM custom_field_contexts WHERE custom_field_id = $1`, [cf.id]);
        await db.query(`DELETE FROM custom_fields WHERE id = $1`, [cf.id]);
      }

      // Xóa workflows của org rác
      const wfs = await db.query(`SELECT id FROM workflows WHERE org_id = $1`, [oId]);
      for (const w of wfs.rows) {
        const trans = await db.query(`SELECT id FROM workflow_transitions WHERE workflow_id = $1`, [w.id]);
        for (const tr of trans.rows) {
          await db.query(`DELETE FROM workflow_transition_guards WHERE transition_id = $1`, [tr.id]);
        }
        await db.query(`DELETE FROM workflow_transitions WHERE workflow_id = $1`, [w.id]);
        const states = await db.query(`SELECT id FROM workflow_states WHERE workflow_id = $1`, [w.id]);
        for (const st of states.rows) {
          await db.query(`DELETE FROM board_column_states WHERE workflow_state_id = $1`, [st.id]);
        }
        await db.query(`DELETE FROM workflow_states WHERE workflow_id = $1`, [w.id]);
        await db.query(`DELETE FROM workflows WHERE id = $1`, [w.id]);
      }

      await db.query(`DELETE FROM labels WHERE org_id = $1`, [oId]);
      await db.query(`DELETE FROM issue_types WHERE org_id = $1`, [oId]);
      await db.query(`DELETE FROM issue_link_types WHERE org_id = $1`, [oId]);

      await db.query(`DELETE FROM webhook_deliveries WHERE subscription_id IN (SELECT id FROM webhook_subscriptions WHERE org_id = $1)`, [oId]);
      await db.query(`DELETE FROM webhook_subscriptions WHERE org_id = $1`, [oId]);

      const autoRules = await db.query(`SELECT id FROM automation_rules WHERE org_id = $1`, [oId]);
      for (const ar of autoRules.rows) {
        await db.query(`DELETE FROM automation_executions WHERE rule_id = $1`, [ar.id]);
        await db.query(`DELETE FROM automation_components WHERE rule_id = $1`, [ar.id]);
      }
      await db.query(`DELETE FROM automation_rules WHERE org_id = $1`, [oId]);

      const filts = await db.query(`SELECT id FROM saved_filters WHERE org_id = $1`, [oId]);
      for (const f of filts.rows) {
        await db.query(`DELETE FROM filter_shares WHERE filter_id = $1`, [f.id]);
        await db.query(`DELETE FROM filter_subscriptions WHERE filter_id = $1`, [f.id]);
      }
      await db.query(`DELETE FROM saved_filters WHERE org_id = $1`, [oId]);

      const dshs = await db.query(`SELECT id FROM dashboards WHERE org_id = $1`, [oId]);
      for (const d of dshs.rows) {
        await db.query(`DELETE FROM dashboard_widgets WHERE dashboard_id = $1`, [d.id]);
        await db.query(`DELETE FROM dashboard_shares WHERE dashboard_id = $1`, [d.id]);
      }
      await db.query(`DELETE FROM dashboards WHERE org_id = $1`, [oId]);

      await db.query(`DELETE FROM activity_logs WHERE org_id = $1`, [oId]);
      await db.query(`DELETE FROM outbox_events WHERE org_id = $1`, [oId]);
      await db.query(`DELETE FROM organizations WHERE id = $1`, [oId]);
    }
    console.log('✓ Đã xóa xong toàn bộ tổ chức test rác');

    // 7. Xóa các Users test rác
    console.log('\n7. Đang tiến hành xóa các user test rác...');
    for (const uId of junkUserIds) {
      await db.query(`DELETE FROM auth_sessions WHERE user_id = $1`, [uId]);
      await db.query(`DELETE FROM auth_audit_logs WHERE user_id = $1`, [uId]);
      await db.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [uId]);
      await db.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [uId]);

      // Các bảng liên kết qua member_id / org_member_id
      const userMems = await db.query(`SELECT id FROM organization_members WHERE user_id = $1`, [uId]);
      for (const m of userMems.rows) {
        await db.query(`DELETE FROM notifications WHERE recipient_member_id = $1`, [m.id]);
        await db.query(`DELETE FROM notification_preferences WHERE member_id = $1`, [m.id]);
        await db.query(`DELETE FROM api_tokens WHERE member_id = $1`, [m.id]);
        await db.query(`DELETE FROM department_members WHERE org_member_id = $1`, [m.id]);
        await db.query(`DELETE FROM org_member_roles WHERE org_member_id = $1`, [m.id]);
        await db.query(`DELETE FROM group_members WHERE org_member_id = $1`, [m.id]);
        await db.query(`DELETE FROM organization_members WHERE id = $1`, [m.id]);
      }

      await db.query(`DELETE FROM users WHERE id = $1`, [uId]);
    }
    console.log('✓ Đã xóa xong toàn bộ user test rác');

    // 8. Dọn dẹp logs và outbox cũ
    await db.query(`DELETE FROM activity_logs`);
    await db.query(`DELETE FROM outbox_events`);
    console.log('✓ Đã dọn dẹp toàn bộ activity_logs và outbox_events');

    // 8b. Khôi phục nội dung chuẩn cho các Issues CLOUD-1 -> CLOUD-7
    const pristineIssues = [
      { key: 'CLOUD-1', summary: 'Setup PostgreSQL schema migrations & seed pipelines', description: 'Establish idempotent baseline migrations for all 70 entities.' },
      { key: 'CLOUD-2', summary: 'Design JWT authentication & session revocation policy', description: 'Implement token signing, cookie storage and anti-enumeration checks.' },
      { key: 'CLOUD-3', summary: 'Build dynamic Kanban board with column WIP limits', description: 'Create an interactive board with column reordering and visual warnings.' },
      { key: 'CLOUD-4', summary: 'Implement work logs and time tracking calculation', description: 'Support time logs with remaining estimate automatic subtraction.' },
      { key: 'CLOUD-5', summary: 'Fix race condition during concurrent state transitions', description: 'Version stale conflict 409 should safely rollback and notify user.' },
      { key: 'CLOUD-6', summary: 'Advanced query language AST compiler with security levels', description: 'Ensure user cannot query hidden fields or cross-tenant records.' },
      { key: 'CLOUD-7', summary: 'Automated webhook delivery with HMAC SHA256 signing', description: 'Dispatch outbox events with exponential backoff retries.' },
    ];
    for (const iss of pristineIssues) {
      await db.query(`UPDATE issues SET summary = $1, description = $2 WHERE key = $3`, [iss.summary, iss.description, iss.key]);
    }
    console.log('✓ Đã khôi phục tiêu đề & mô tả nguyên bản chuyên nghiệp cho CLOUD-1 -> CLOUD-7');

    // 9. Đặt lại mật khẩu chuẩn và quyền hệ thống
    const adminHash = await bcrypt.hash('Admin@123456', 10);
    const devHash = await bcrypt.hash('Dev@123456', 10);

    await db.query(
      `UPDATE users SET password_hash = $1, is_system_admin = true, status = 'active', full_name = 'System Administrator' WHERE email = 'admin@taskmanager.dev'`,
      [adminHash]
    );
    await db.query(
      `UPDATE users SET password_hash = $1, is_system_admin = false, status = 'active', full_name = 'Alex Nguyen' WHERE email = 'developer@taskmanager.dev'`,
      [devHash]
    );
    console.log('✓ Đã kiểm tra và thiết lập tài khoản chuẩn:');
    console.log('  - Admin: admin@taskmanager.dev / Admin@123456 (System Admin)');
    console.log('  - Developer: developer@taskmanager.dev / Dev@123456 (Standard User)');
    console.log('  - User: amnemesas1@gmail.com (Bảo lưu nguyên vẹn)');

    // 10. Tổng kết số lượng sau khi dọn dẹp
    console.log('\n====================================================');
    console.log('📊 THỐNG KÊ SAU KHI DỌN DẸP SẠCH TRÊN DATABASE:');
    console.log('====================================================');
    const finalTables = ['users', 'organizations', 'organization_members', 'projects', 'issues', 'sprints', 'activity_logs', 'outbox_events'];
    for (const t of finalTables) {
      const res = await db.query(`SELECT count(*) FROM ${t}`);
      console.log(`- ${t}: ${res.rows[0].count}`);
    }

    const finalUsers = await db.query(`SELECT id, email, full_name, is_system_admin, status FROM users`);
    console.log('\nDanh sách tài khoản hiện có trong hệ thống:');
    console.table(finalUsers.rows);

    const finalOrgs = await db.query(`SELECT id, key, name FROM organizations`);
    console.log('\nDanh sách tổ chức hiện có trong hệ thống:');
    console.table(finalOrgs.rows);

    const finalProjects = await db.query(`SELECT p.id, p.key, p.name, o.key as org_key FROM projects p JOIN organizations o ON p.org_id = o.id`);
    console.log('\nDanh sách dự án hiện có trong hệ thống:');
    console.table(finalProjects.rows);

    const finalIssues = await db.query(`SELECT key, summary, priority FROM issues ORDER BY key ASC`);
    console.log('\nDanh sách issues chuẩn trong dự án CLOUD:');
    console.table(finalIssues.rows);

    console.log('\n✨ DỌN DẸP HOÀN TẤT THÀNH CÔNG 100%! HỆ THỐNG TRỞ VỀ TRẠNG THÁI GỐC CHUẨN SẠCH.');

  } catch (err) {
    console.error('❌ Lỗi trong quá trình dọn dẹp:', err);
    throw err;
  } finally {
    await db.close();
  }
}

cleanDatabase().catch(console.error);
