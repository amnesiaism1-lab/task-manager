# ĐẶC TẢ CƠ SỞ KIỂM THỬ — TEST BASIS SPECIFICATION
## Dự án: Task Manager (Jira-Style Enterprise Multi-Tenant Platform)
### Tiêu chuẩn tham chiếu: ISO/IEC/IEEE 29119-3:2013 (Clause 7.2) & ISTQB® CTFL v4.0.1 / CTAL-TA v4.0 / CTAL-TTA v4.0 / ISO/IEC 25010

---

## BẢNG KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Thuộc tính | Giá trị |
|---|---|
| **Mã tài liệu** | `TM-TBS-2026-V2.0-ULTRA` |
| **Phiên bản** | `2.0 — Final Comprehensive Test Basis Baseline` |
| **Ngày ban hành** | `2026-09-12` |
| **Tác giả / Vị trí** | QA Lead / Test Architect (Chứng chỉ ISTQB® CTAL-TA, CTAL-TTA, ISO 29119 Lead Assessor) |
| **Trạng thái** | Phê duyệt chính thức làm cơ sở kiểm thử toàn diện (Approved Test Basis SSOT) |
| **Nguồn yêu cầu gốc** | `SRS_TASK_MANAGER.md` (v1.7 - 80 Tính năng), `TASK_MANAGER_ERD.puml` (90 Thực thể, 48 Invariants C-01..C-48) |
| **Phạm vi mô hình dữ liệu** | 90 Thực thể: 58 API Core + 32 Extension Schemes, Governance & Automation |
| **Phạm vi chức năng** | 80 Chức năng nghiệp vụ Jira-style, Phân quyền 3 tầng, FSM Engine, Outbox Async, Webhooks, PAT |

### Lịch sử thay đổi (Revision History)
| Phiên bản | Ngày | Tác giả | Mô tả nội dung thay đổi |
|---|---|---|---|
| `0.1` | 2026-09-11 | QA Team | Khởi thảo Test Basis sơ bộ dựa trên SRS v1.5 |
| `0.9` | 2026-09-12 | QA Lead | Tích hợp 90 Thực thể ERD, Invariants C-01 đến C-36, 65 Tính năng SRS |
| `1.0` | 2026-09-12 | Test Architect | Hoàn thiện cấu trúc chuẩn ISO/IEC/IEEE 29119-3, gán định danh duy nhất |
| `2.0` | 2026-09-12 | Test Architect | **Đại tu toàn diện**: Bổ sung đủ 80 Requirements (`TB-REQ-01..80`), 20 Business Rules (`TB-BR-01..20`), toàn bộ 48 Invariants (`TB-ERD-C01..C48`), và Ma trận FSM $N \times N$. |

---

## 1. TỔNG QUAN & KHUNG TIÊU CHUẨN THAM CHIẾU (STANDARDS FRAMEWORK)

### 1.1. Định nghĩa Test Basis theo chuẩn ISTQB® & ISO/IEC/IEEE 29119
Theo định nghĩa chuẩn **ISTQB® Glossary of Testing Terms v4.0** và tiêu chuẩn **ISO/IEC/IEEE 29119-1/2/3**:
> **Test Basis (Cơ sở kiểm thử):** *"Tất cả các tài liệu hoặc nguồn thông tin mà từ đó các yêu cầu của một hệ thống, thành phần hoặc thuộc tính chất lượng có thể được suy ra để làm căn cứ cho việc thiết kế và thực thi kiểm thử."*

Tài liệu này đóng vai trò là **Nguồn Sự Thật Duy Nhất (Single Source of Truth - SSOT)** cho các hoạt động:
1. **Phân tích Kiểm thử (Test Analysis):** Xác định các đối tượng cần kiểm thử (Test Items) và phân rã thành các Điều kiện kiểm thử (Test Conditions).
2. **Thiết kế Kiểm thử (Test Design):** Áp dụng các kỹ thuật thiết kế ca kiểm thử (Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transitions, Use Cases, Combinatorial Testing).
3. **Đảm bảo Khả năng Truy vết Hai Chiều (Bidirectional Traceability):** Từ Requirements $\leftrightarrow$ Test Basis $\leftrightarrow$ Test Conditions $\leftrightarrow$ Test Cases $\leftrightarrow$ Automated Scripts $\leftrightarrow$ Defects.

### 1.2. Khung Tiêu chuẩn Chất lượng ISO/IEC 25010:2011
Tất cả các cơ sở kiểm thử phi chức năng trong tài liệu này được phân loại nghiêm ngặt theo 8 đặc tính chất lượng của **ISO/IEC 25010**:
1. **Functional Suitability:** Độ phủ đầy đủ, tính chính xác và tính thích hợp nghiệp vụ.
2. **Performance Efficiency:** Thời gian phản hồi ($P95 < 150\text{ms}$ read, $< 300\text{ms}$ write), thông lượng ($500\text{ rps}$), sử dụng tài nguyên.
3. **Compatibility:** Khả năng cùng tồn tại đa trình duyệt, chuẩn hóa API RESTful.
4. **Usability:** Thao tác kéo thả Lexorank mượt mà, bảo vệ chống lỗi người dùng, giao diện Jira Dark/Light mode.
5. **Reliability:** Tính toàn vẹn giao dịch ACID, cơ chế Transactional Outbox At-Least-Once Delivery, phục hồi sau sự cố.
6. **Security:** Phân quyền 3 tầng, bảo vệ cấp Issue Security Level, chống OWASP Top 10, chống SSRF trên Webhooks, chống IDOR.
7. **Maintainability:** Tính mô-đun hóa, kiến trúc sạch, khả năng kiểm thử tự động $\ge 90\%$.
8. **Portability:** Triển khai độc lập qua Docker Compose, môi trường đám mây và serverless.

---

## 2. HỆ THỐNG MÃ ĐỊNH DANH TRUY VẾT (TRACEABILITY TAXONOMY)

| Mã Tiền tố | Lĩnh vực Cơ sở Kiểm thử | Nguồn tham chiếu gốc |
|---|---|---|
| `TB-REQ-xxx` | Yêu cầu Chức năng Toàn diện (Functional Requirements - 80 Yêu cầu) | SRS §3.4, §4 (Catalog 80 Tính năng) |
| `TB-BR-xxx` | Quy tắc Nghiệp vụ & Ràng buộc Miền (Business Rules - 20 Quy tắc) | SRS §4 (Business Rules), ERD Invariants |
| `TB-ERD-xxx` | Ràng buộc Thực thể & Toàn vẹn Dữ liệu CSDL (48 Invariants C-01..C-48) | `TASK_MANAGER_ERD.puml` (90 Thực thể, Invariants `C-01`..`C-48`) |
| `TB-FSM-xxx` | Máy trạng thái Hữu hạn & Động cơ Workflow (Workflow FSM Engine) | SRS §3.2, §3.3, §4.4, ERD Package "Workflow (FSM)" |
| `TB-SEC-xxx` | Phân quyền 3 Tầng, Xác thực, Issue Security & Token Scopes | SRS §2.4, §4.1, §4.3, §4.10, ERD Security Policies |
| `TB-API-xxx` | Giao diện Lập trình REST & Hợp đồng Lỗi (REST Contracts & Error Codes) | OpenAPI Spec, `backend/src/common/constants/error-codes.ts` |
| `TB-NFR-xxx` | Yêu cầu Phi Chức năng theo ISO 25010 (Non-Functional Requirements) | SRS §6 (NFR-SEC, NFR-PERF, NFR-REL, NFR-CONC, NFR-USAB) |

---

## 3. CƠ SỞ KIỂM THỬ YÊU CẦU CHỨC NĂNG (TB-REQ: FUNCTIONAL REQUIREMENTS 01..80)

### 3.1. Nhóm 1: Danh tính Toàn cầu, Xác thực & Quản lý Phiên (Identity, Auth & Sessions)
- **`TB-REQ-01` (Đăng ký Người dùng Toàn cục):** Hệ thống cho phép Guest đăng ký tài khoản qua Email + Mật khẩu + Tên hiển thị. Trạng thái khởi tạo `status=active` hoặc `pending_verification`. Mật khẩu băm bằng Argon2id hoặc Bcrypt, không lưu plain text.
- **`TB-REQ-02` (Xác thực & Cấp phát Phiên Đăng nhập):** Hỗ trợ đăng nhập Email/Password, trả về Access Token (JWT 15m) và Refresh Token dài hạn. Tạo bản ghi `auth_sessions` lưu `refresh_token_hash`, `ip_address`, `user_agent`, `expires_at`.
- **`TB-REQ-03` (Làm mới Phiên - Token Rotation):** Sử dụng Refresh Token để cấp mới Access Token và Refresh Token mới (RTR). Phát hiện và vô hiệu hóa ngay lập tức toàn bộ session khi token cũ bị sử dụng lại (Replay Attack).
- **`TB-REQ-04` (Đăng xuất & Thu hồi Phiên Từ xa):** Người dùng có thể đăng xuất khỏi thiết bị hiện tại hoặc đăng xuất từ xa khỏi các phiên khác (`auth_sessions.status=revoked`).
- **`TB-REQ-05` (Xác minh Email):** Cấp token dùng một lần `email_verification_tokens` gửi qua email. Khi xác minh cập nhật `users.email_verified_at` và vô hiệu hóa token.
- **`TB-REQ-06` (Khôi phục & Đặt lại Mật khẩu):** Luồng quên mật khẩu sinh `password_reset_tokens`. Đặt lại thành công bắt buộc thu hồi toàn bộ các phiên `auth_sessions` đang hoạt động của user.
- **`TB-REQ-07` (Quản lý Hồ sơ Cá nhân & Avatar):** Cập nhật Full Name, Avatar URL. Không cho phép đổi Email trực tiếp nếu không qua quy trình xác minh bảo mật.

### 3.2. Nhóm 2: Tổ chức, Thành viên & Phân quyền Cấp Tenant (Organization & RBAC)
- **`TB-REQ-08` (Khởi tạo Tổ chức):** User tạo Organization (`organizations`), tự động trở thành Owner/Admin đầu tiên trong `organization_members` với quyền quản trị tối cao (`MANAGE_ORG`).
- **`TB-REQ-09` (Vòng đời Lời mời Thành viên):** Admin gửi lời mời qua email (`organization_invitations`). Hỗ trợ các trạng thái `pending`, `accepted`, `revoked`, `expired`.
- **`TB-REQ-10` (Chấp nhận / Từ chối Lời mời vào Org):** Người nhận chấp nhận lời mời để trở thành `organization_members` với `status=active`. Tự động liên kết vai trò `org_roles` được chỉ định.
- **`TB-REQ-11` (Quản trị Danh sách Thành viên & Trạng thái):** Org Admin có quyền xem danh sách, đình chỉ (`suspended`), tái kích hoạt (`active`), hoặc xóa thành viên khỏi tổ chức.
- **`TB-REQ-12` (Quản trị Vai trò & Quyền Hạn Tổ chức):** Quản lý `org_roles`, gán quyền qua `org_role_permission_entries`, gán role cho member qua `org_member_roles`.
- **`TB-REQ-13` (Cơ cấu Phòng ban Phân cấp):** Thiết lập cấu trúc phòng ban (`departments`) phân cấp qua `parent_department_id`. Bắt buộc chạy thuật toán Cycle Detection chặn chu trình lặp.
- **`TB-REQ-14` (Quản trị Nhóm Người dùng):** Thiết lập các nhóm làm việc (`groups`), thêm/bớt thành viên qua `group_members` để phục vụ phân quyền gộp tại Project.
- **`TB-REQ-15` (Bảo vệ Rời Tổ chức):** Member có thể tự rời Org nhưng hệ thống ngăn chặn nếu đó là Org Admin duy nhất còn lại (`TB-BR-12`).

### 3.3. Nhóm 3: Dự án, Cấu hình Scheme & Không gian Làm việc (Workspace & Projects)
- **`TB-REQ-16` (Khởi tạo Dự án):** Org Admin hoặc Member có quyền `CREATE_PROJECT` tạo dự án mới với `key` (2-10 ký tự in hoa, unique trong Org), tên, visibility (`private`, `org`, `public`).
- **`TB-REQ-17` (Bộ đếm Khóa Issue Tự động):** Duy trì `next_issue_number` (bắt đầu từ 1). Tăng nguyên tử khi tạo Issue để cấp mã `<PROJECT_KEY>-<NUMBER>`.
- **`TB-REQ-18` (Gán Vai trò Dự án Trực tiếp & Kế thừa):** Quản lý `project_members`. Gán role dự án trực tiếp (`project_member_roles`) hoặc kế thừa qua nhóm (`project_group_roles`).
- **`TB-REQ-19` (Sơ đồ Phân quyền Dự án):** `permission_schemes` và `permission_scheme_entries` liên kết quyền hạn (vd: `BROWSE_PROJECT`, `CREATE_ISSUE`, `TRANSITION_ISSUE`) với `project_roles`.
- **`TB-REQ-20` (Cấu phần Dự án):** Quản lý `project_components` với trưởng nhóm cấu phần (`lead_member_id` phải là active project member).
- **`TB-REQ-21` (Phiên bản Phát hành Dự án):** Quản lý `project_versions` với các trạng thái `unreleased`, `released`, `archived` và ngày phát hành.
- **`TB-REQ-22` (Lưu trữ & Khôi phục Dự án):** Project Admin có thể archive dự án. Khi đã archive, toàn bộ Issue chuyển sang chế độ Read-only.

### 3.4. Nhóm 4: Bảng Điều phối Agile & Vòng đời Sprint (Boards & Sprints)
- **`TB-REQ-23` (Quản lý Bảng Kanban & Scrum):** Tạo bảng (`boards`) kiểu Kanban hoặc Scrum thuộc dự án, liên kết các cột `board_columns`.
- **`TB-REQ-24` (Cấu hình Cột & Giới hạn WIP):** Cấu hình vị trí cột (`position`), giới hạn số lượng công việc đang xử lý (`wip_limit`). Cảnh báo trực quan khi số Issue vượt quá WIP limit.
- **`TB-REQ-25` (Ánh xạ Cột Bảng và Trạng thái Workflow):** Bảng `board_column_states` cho phép map một hoặc nhiều `workflow_states` vào một cột trên bảng.
- **`TB-REQ-26` (Xếp hạng Issue bằng Thuật toán Lexorank):** Duy trì `board_issue_positions` lưu thứ tự `rank` cục bộ của Issue trên từng Board. Hỗ trợ kéo thả không xung đột giữa các board.
- **`TB-REQ-27` (Lập kế hoạch & Khởi tạo Sprint):** Tạo Sprint trong Scrum Board với tên, mục tiêu (`goal`), thời hạn. Trạng thái khởi tạo là `planned`.
- **`TB-REQ-28` (Kích hoạt Sprint Duy nhất):** Bắt đầu một Sprint (`state=active`). Mỗi Scrum Board chỉ được phép có duy nhất **01 Active Sprint** tại một thời điểm (`TB-BR-02`).
- **`TB-REQ-29` (Đóng Sprint & Di chuyển Issue Dở dang):** Đóng Sprint (`state=closed`). Di chuyển các Issue chưa hoàn thành về Backlog hoặc sang Sprint tiếp theo.
- **`TB-REQ-30` (Báo cáo Tiến độ Sprint):** Ghi nhận lịch sử `issue_sprint_history` để tính toán biểu đồ Burndown Chart và Velocity Report.

### 3.5. Nhóm 5: Quản lý Issue, Máy trạng thái & Chuyển dịch Nghiệp vụ (Issue & Workflow Engine)
- **`TB-REQ-31` (Tạo mới Issue):** Tạo Issue thuộc dự án với summary, description, priority, assignee, reporter, estimates, component, version. Trạng thái lấy từ `workflow_states.is_initial=true`.
- **`TB-REQ-32` (Cấu hình Workflow Toàn cục & Phiên bản):** Thiết lập `workflows` (versioned, active flag), các trạng thái `workflow_states` (todo, in_progress, done), và các bước chuyển `workflow_transitions`.
- **`TB-REQ-33` (Sơ đồ Gán Workflow Dự án):** `workflow_schemes` liên kết với dự án, map từng `issue_type` tới workflow qua `workflow_scheme_mappings`.
- **`TB-REQ-34` (Quy tắc Chặn Chuyển trạng thái - Transition Guards):** Hỗ trợ `transition_guards` (dsl, json_logic, requires_fields) đánh giá điều kiện trước khi cho phép transition.
- **`TB-REQ-35` (Ma trận Phân quyền Transition - Deny Overrides Allow):** `scheme_transition_permissions` quy định quyền transition theo role. Rule Deny luôn ghi đè Rule Allow (`TB-BR-06`).
- **`TB-REQ-36` (Thực thi Chuyển trạng thái Nguyên tử):** Cập nhật `state_id`, kiểm tra Optimistic Lock (`version`), ghi nhận `issue_state_history`, `activity_logs`, và sinh sự kiện `outbox_events` trong một Database Transaction duy nhất.
- **`TB-REQ-37` (Xử lý Terminal State & Resolution):** Khi vào terminal state bắt buộc cập nhật `resolution_id` và `resolved_at=now`. Khi Reopen bắt buộc xóa rỗng cả hai (`TB-BR-04`, `TB-BR-05`).

### 3.6. Nhóm 6: Cộng tác, Lịch sử, Bình luận & Tệp đính kèm (Collaboration & History)
- **`TB-REQ-38` (Bình luận Đa cấp):** Thêm, sửa, xóa bình luận `comments` với quan hệ cha - con `parent_comment_id`. Chặn vòng lặp phân cấp.
- **`TB-REQ-39` (Tải lên & Quản lý Tệp đính kèm):** Upload tệp đính kèm `attachments` gắn với Issue hoặc Comment. Giới hạn dung lượng tối đa 25MB và kiểm tra MIME type.
- **`TB-REQ-40` (Ghi nhận Nhật ký Thời gian - Work Logs):** Ghi nhật ký thời gian `work_logs` (thời gian làm, ngày bắt đầu, ghi chú). Tự động cập nhật `remaining_estimate_seconds` và `time_spent_seconds`.
- **`TB-REQ-41` (Liên kết Công việc - Issue Links):** Thiết lập quan hệ giữa các Issue qua `issue_links` và `issue_link_types` (Blocks, Relates). Chấm dứt triệt để self-link (`TB-BR-09`).
- **`TB-REQ-42` (Nhãn Công việc - Labels):** Gán/gỡ nhãn `issue_labels` để phân loại và tìm kiếm nhanh.
- **`TB-REQ-43` (Theo dõi Công việc - Watchers):** Thành viên đăng ký theo dõi `issue_watchers` để nhận thông báo real-time khi có cập nhật.
- **`TB-REQ-44` (Nhật ký Hoạt động & Kiểm toán):** Tự động ghi nhận mọi biến động dữ liệu vào `activity_logs` kèm actor, timestamp, payload cũ/mới và idempotency key.

### 3.7. Nhóm 7: Trường Tùy biến Động (Custom Fields)
- **`TB-REQ-45` (Quản trị Trường Tùy biến):** Tạo `custom_fields` với các kiểu dữ liệu (`text`, `number`, `date`, `select`, `user`, `json`).
- **`TB-REQ-46` (Ngữ cảnh Trường Tùy biến):** Định nghĩa `custom_field_contexts` áp dụng trường cho Project và Issue Type cụ thể.
- **`TB-REQ-47` (Lưu trữ Giá trị Trường Tùy biến):** Lưu trữ giá trị `issue_custom_field_values` dưới dạng `value_json` chuẩn hóa theo `field_type`.

### 3.8. Nhóm 8: Bảo mật Cấp Issue (Issue Security Schemes)
- **`TB-REQ-48` (Sơ đồ Bảo mật Issue):** Thiết lập `issue_security_schemes` và các mức độ `issue_security_levels` (Public, Internal, Confidential).
- **`TB-REQ-49` (Cấp quyền Bảo mật Issue):** `issue_security_grants` quy định ai được xem issue (theo Member, Group, Project Role, Reporter, Assignee).
- **`TB-REQ-50` (Thực thi Bộ lọc An toàn Issue):** Mọi truy vấn đọc issue bắt buộc kiểm tra: User có `BROWSE_PROJECT` ĐỒNG THỜI thỏa mãn Security Grant của Issue (`TB-BR-16`).

### 3.9. Nhóm 9: Tìm kiếm, Bộ lọc & Bảng Điều khiển (Search, Filters & Dashboards)
- **`TB-REQ-51` (Tìm kiếm Văn bản & Lọc Đa Tiêu chí):** Tìm kiếm full-text, lọc kết hợp Project, Type, Status, Assignee, Priority, Label, Sprint, Date Range.
- **`TB-REQ-52` (Lưu & Quản lý Bộ lọc):** Lưu truy vấn `saved_filters`. Hỗ trợ chia sẻ `filter_shares` cho Org, Project, Group hoặc Member cụ thể.
- **`TB-REQ-53` (Bảng Điều khiển & Tiện ích):** Tạo `dashboards` chứa các tiện ích trực quan `dashboard_widgets` (Pie chart trạng thái, Assigned to Me, Burndown widget).
- **`TB-REQ-54` (Bố cục Tọa độ Widget):** Lưu trữ vị trí và kích thước widget (`position_x`, `position_y`, `width`, `height`, `config_json`).
- **`TB-REQ-55` (Chia sẻ Dashboard):** `dashboard_shares` quy định quyền xem/sửa Dashboard cho Project, Group hoặc Member trong Org.

### 3.10. Nhóm 10: Tự động hóa, Thông báo & Tích hợp (Automation, Notifications & Integrations)
- **`TB-REQ-56` (Quy tắc Tự động hóa):** Thiết lập `automation_rules` với Trigger, Condition, Branch và Action.
- **`TB-REQ-57` (Cây Cấu phần Tự động hóa):** `automation_rule_components` lưu trữ cây quy tắc phi chu trình có đúng 1 trigger gốc (`TB-BR-15`).
- **`TB-REQ-58` (Thực thi Tự động hóa Bất đồng bộ):** Worker quét sự kiện Outbox để chạy rule, lưu nhật ký thực thi `automation_executions` (`status`, `duration_ms`, `error_message`).
- **`TB-REQ-59` (Chính sách Thông báo):** `notification_schemes` và `notification_scheme_entries` định nghĩa sự kiện gửi thông báo cho ai.
- **`TB-REQ-60` (Trung tâm Thông báo Trong Ứng dụng):** Bản ghi `notifications` hiển thị chuông thông báo, hỗ trợ đánh dấu đã đọc (`read_at`).
- **`TB-REQ-61` (Tùy chọn Nhận Thông báo Cá nhân):** `notification_preferences` cho phép bật/tắt nhận email hoặc in-app cho từng loại sự kiện.
- **`TB-REQ-62` (Mã Truy cập Cá nhân - PAT):** Người dùng sinh mã `api_tokens` (băm token hash) có thời hạn và phạm vi quyền (`scopes`) để gọi API từ script ngoài.
- **`TB-REQ-63` (Webhook Tích hợp Ngoài & Chống SSRF):** Đăng ký `webhook_subscriptions` gửi HTTP POST payload có chữ ký HMAC-SHA256 (`secret_hash`), chặn gọi tới dải IP private/metadata (`TB-BR-13`).
- **`TB-REQ-64` (Phát Webhook Bất đồng bộ & Retry):** `webhook_deliveries` lưu vết gửi tin và thực hiện retry lũy thừa (Exponential Backoff) khi gặp lỗi mạng.
- **`TB-REQ-65` (Đăng ký Báo cáo Định kỳ qua Filter):** `filter_subscriptions` cho phép gửi email kết quả tìm kiếm theo biểu thức cron định kỳ.

### 3.11. Nhóm 11: Schemes Cấu hình Jira Nâng cao & Phân giải Màn hình (Phase 2 Schemes)
- **`TB-REQ-66` (Màn hình & Trường Màn hình - Screens & Screen Fields):** Định nghĩa `screens` và danh sách trường `screen_fields` hiển thị theo thứ tự `position`.
- **`TB-REQ-67` (Sơ đồ Màn hình Thao tác - Screen Schemes):** `screen_schemes` liên kết với `screen_scheme_operations` xác định màn hình cụ thể cho từng thao tác Create, View, Edit.
- **`TB-REQ-68` (Sơ đồ Màn hình theo Kiểu Công việc):** `issue_type_screen_schemes` và `issue_type_screen_scheme_entries` ánh xạ từng IssueType sang ScreenScheme tương ứng.
- **`TB-REQ-69` (Sơ đồ Cấu hình Trường - Field Schemes):** `field_schemes` và `field_scheme_entries` cấu hình thuộc tính bắt buộc (`is_required`) và ẩn (`is_hidden`) cho từng trường theo IssueType.
- **`TB-REQ-70` (Sơ đồ Mức độ Ưu tiên - Priority Schemes):** `priority_schemes` và `priority_scheme_entries` quy định tập hợp các mức ưu tiên áp dụng cho từng dự án.
- **`TB-REQ-71` (Sơ đồ Kiểu Công việc - Issue Type Schemes):** `issue_type_schemes` và `issue_type_scheme_entries` quy định tập hợp các loại issue khả dụng cho dự án.

### 3.12. Nhóm 12: Cây Phân cấp Issue & Quản trị Nền tảng Toàn cầu (Hierarchy & System Admin)
- **`TB-REQ-72` (Cấu hình Cây Phân cấp Issue - Issue Hierarchy Levels):** Thiết lập `issue_hierarchy_levels` quy định thứ bậc công việc (`level_rank`: Epic = 1, Standard = 0, Subtask = -1).
- **`TB-REQ-73` (Ánh xạ Phân cấp Kiểu Issue):** `issue_type_hierarchy_mappings` map IssueType vào thứ bậc. Parent issue bắt buộc phải thuộc level cao hơn đúng 1 bậc (`TB-BR-17`).
- **`TB-REQ-74` (Quản trị Người dùng Toàn cầu - System Admin):** System Admin xem danh bạ toàn bộ `users`, khóa/mở khóa tài khoản, cưỡng chế thu hồi tất cả session.
- **`TB-REQ-75` (Quản trị Tổ chức & Gói Cước Toàn cầu):** System Admin quản lý danh bạ `organizations`, nâng/hạ gói cước (`plan`: `free`, `standard`, `enterprise`) và trạng thái tenant.
- **`TB-REQ-76` (Hàng đợi Tác vụ Nền - Background Jobs):** Quản lý `background_jobs` (migration, export, reconciliation) với cơ chế khóa phân tán lease (`lease_owner`, `lease_expires_at`).
- **`TB-REQ-77` (Đối soát & Dọn dẹp Toàn vẹn Dữ liệu - Reconciliation):** Tác vụ nền tự động dọn dẹp các token hết hạn, session đã thu hồi và đối soát tính nhất quán Outbox.
- **`TB-REQ-78` (Lịch sử Thay đổi Phiên bản Sprint - Sprint History):** Bảng `issue_sprint_history` lưu vết chi tiết thời điểm issue được thêm hoặc gỡ khỏi Sprint.
- **`TB-REQ-79` (Khởi tạo Không gian Làm việc Toàn diện - Workspace Bootstrap):** Endpoint `/api/workspace/bootstrap` tổng hợp toàn bộ context (User, Org, Projects, Permissions, Unread Notifications) trong 1 request.
- **`TB-REQ-80` (Giám sát Sức khỏe Hệ thống - Health & Readiness Check):** Endpoint `/api/health` kiểm tra trạng thái kết nối PostgreSQL, Redis, Mail Service và Disk Storage.

---

## 4. CƠ SỞ KIỂM THỬ QUY TẮC NGHIỆP VỤ & RÀNG BUỘC MIỀN (TB-BR: BUSINESS RULES 01..20)

| Mã TB-BR | Tên Quy tắc Nghiệp vụ (Business Rule) | Mô tả Ràng buộc & Cơ chế Kiểm tra | Hành vi Kỳ vọng khi Vi phạm |
|---|---|---|---|
| **`TB-BR-01`** | **Cô lập Dữ liệu Đa Tổ chức (Multi-Tenant Isolation)** | Một User ở Organization A tuyệt đối không thể truy cập, xem hoặc chỉnh sửa bất kỳ tài nguyên nào thuộc Organization B (Project, Issue, Member, Workflow). | Chặn ở Database Query & Tenant Guard. Trả về `403 Forbidden` hoặc `404 Not Found`. |
| **`TB-BR-02`** | **Active Sprint Duy nhất trên Board (Single Active Sprint)** | Trên mỗi Scrum Board, tại một thời điểm chỉ có tối đa **01 Sprint** ở trạng thái `state = active`. | Ràng buộc Unique Index `UQ(board_id) WHERE state='active'`. Trả về `409 Conflict` (`SPRINT_ALREADY_ACTIVE`). |
| **`TB-BR-03`** | **Ràng buộc Tính Toàn vẹn Của Sprint và Board** | Sprint phải tham chiếu tới Board kiểu Scrum (`board_type = 'scrum'`) và Board đó phải thuộc cùng Project với Sprint. | Service validation từ chối tạo/sửa sprint. Trả về `422 Unprocessable Entity` hoặc `409 Conflict`. |
| **`TB-BR-04`** | **Đồng bộ Resolution khi vào Terminal State** | Khi Issue chuyển sang bất kỳ trạng thái nào có `is_terminal = true`, trường `resolution_id` và `resolved_at` bắt buộc phải có giá trị. | Validation chặn transition nếu thiếu resolution. Tự động gán `resolved_at = NOW()`. |
| **`TB-BR-05`** | **Xóa Resolution khi Reopen về Non-Terminal State** | Khi Issue chuyển từ trạng thái Terminal về Non-Terminal (`is_terminal = false`), hệ thống tự động set `resolution_id = NULL` và `resolved_at = NULL`. | Service cập nhật nguyên tử trong transaction transition. Trả về `200 OK`. |
| **`TB-BR-06`** | **Phân quyền Transition: Deny Thắng Allow** | Trong `workflow_scheme_transition_permissions`, nếu user thuộc nhiều Role mà có ít nhất một Rule `DENY` thì quyền bị từ chối, kể cả khi có Rule `ALLOW`. | Engine đánh giá: $\text{Permission} = \bigvee \text{Allow} \wedge \neg (\bigvee \text{Deny})$. Trả về `403 Forbidden`. |
| **`TB-BR-07`** | **Kiểm soát Concurrency bằng Optimistic Locking** | Mọi thao tác cập nhật Issue, Transition, Rank bảng phải gửi kèm số `expectedVersion`. | Nếu `expectedVersion != db.version`, hủy transaction và trả về `409 Conflict`. |
| **`TB-BR-08`** | **Tính Bất khả Phân Của Outbox Event (Transactional Outbox)** | Bản ghi thay đổi nghiệp vụ và bản ghi `outbox_events` tương ứng bắt buộc được ghi trong cùng một Database Transaction. | Đảm bảo không bao giờ xảy ra mất sự kiện hoặc phát sinh sự kiện ma khi DB rollback. |
| **`TB-BR-09`** | **Chặn Tự Liên kết Công việc (No Self-Link)** | Bảng `issue_links` cấm tuyệt đối `source_issue_id = target_issue_id`. | Ràng buộc Check Constraint: `CHECK (source_issue_id <> target_issue_id)`. Trả về `409 Conflict`. |
| **`TB-BR-10`** | **Kế thừa Quyền Nhóm Dự án (Project Group Role)** | Thành viên chỉ được hưởng quyền của một Group trong Dự án nếu: (1) Thuộc Group đó trong Org, (2) Là thành viên Active của Project. | Permission Guard join kiểm tra 2 điều kiện. Nếu không thỏa mãn, trả về `403 Forbidden`. |
| **`TB-BR-11`** | **Bộ đếm Issue Key Nguyên tử (Atomic Key Generator)** | Số hiệu phát sinh lấy từ `projects.next_issue_number`, tăng lên 1 nguyên tử (`UPDATE ... RETURNING ...`). | Đảm bảo không bao giờ trùng lặp Issue Key dưới tải đồng thời cao. Trả về `201 Created`. |
| **`TB-BR-12`** | **Bảo vệ Chủ Sở hữu Tổ chức (Org Owner Protection)** | Organization phải luôn có ít nhất một thành viên giữ quyền `MANAGE_ORG`. Không cho phép Admin duy nhất tự rời Org hoặc tự hạ quyền của chính mình. | Service đếm số lượng Admin active trước khi cho phép Leave/Remove Role. Trả về `422 Unprocessable Entity`. |
| **`TB-BR-13`** | **An toàn Webhook Chống SSRF (SSRF Protection)** | URL Webhook phải được phân giải DNS và chặn triệt để các dải IP Loopback (`127.0.0.0/8`), Private IP (`10.0.0.0/8`, `192.168.0.0/16`), và Cloud Metadata (`169.254.169.254`). | Worker kiểm tra IP trước khi gửi request. Trả về lỗi `SSRF_DETECTED` và hủy delivery. |
| **`TB-BR-14`** | **Thứ tự Phân giải Màn hình & Trường (Screen Resolution)** | Thứ tự phân giải: `issue_type_screen_schemes` $\rightarrow$ `screen_schemes` $\rightarrow$ `screen_scheme_operations` (Create / View / Edit) $\rightarrow$ `field_schemes`. | Server-side validation kiểm tra các trường bắt buộc (`is_required`) và chặn trường ẩn (`is_hidden`). |
| **`TB-BR-15`** | **Cây Automation Rule Phi Chu trình (Acyclic Rule Tree)** | Cây `automation_rule_components` bắt buộc có đúng 1 root trigger, các node con là branch/condition/action, không được tạo chu trình lặp. | Parser kiểm tra acyclic graph khi lưu rule. Trả về `422 Unprocessable Entity`. |
| **`TB-BR-16`** | **Kiểm tra Quyền xem Issue Bảo mật (Issue Security Level)** | Để đọc Issue, người dùng phải có quyền `BROWSE_PROJECT` ĐỒNG THỜI thỏa mãn ít nhất một `issue_security_grants` của Issue đó. | Query filter tự động inject điều kiện bảo mật. Trả về `404 Not Found` để tránh lộ thông tin. |
| **`TB-BR-17`** | **Phân cấp Issue Đúng 1 Bậc (Single-Step Parent Hierarchy)** | Parent issue bắt buộc phải có `level_rank` lớn hơn Subtask đúng 1 bậc (Epic $\rightarrow$ Standard $\rightarrow$ Subtask) và cùng thuộc 1 dự án. | Validation chặn gán parent sai bậc hoặc tạo chu trình lặp. Trả về `422 Unprocessable Entity`. |
| **`TB-BR-18`** | **Trạng thái Thuộc Duy nhất 1 Cột trên Board** | Trong cùng một Board, một `workflow_state_id` chỉ được phép ánh xạ vào tối đa **01 cột** (`board_columns`). | Ràng buộc Unique Constraint trên `board_column_states`. Trả về `409 Conflict`. |
| **`TB-BR-19`** | **Thu hồi Phiên Tức thì khi Đổi Mật khẩu hoặc Bị Khóa** | Khi đổi mật khẩu thành công hoặc tài khoản bị Admin chuyển sang `suspended`, 100% active sessions phải chuyển sang `revoked`. | Cập nhật nguyên tử bảng `auth_sessions`. Các request tiếp theo bằng token cũ bị `401 Unauthorized`. |
| **`TB-BR-20`** | **Khóa Phân tán Nhiệm vụ Nền (Distributed Job Leases)** | Mỗi background job chỉ được 1 worker sở hữu thông qua `lease_owner` và `lease_expires_at`. Worker phải gửi heartbeat gia hạn lease. | Nếu lease hết hạn mà job chưa xong, worker khác có quyền thu hồi và tiếp tục xử lý. |

---

## 5. CƠ SỞ KIỂM THỬ THỰC THỂ CSDL & RÀNG BUỘC TOÀN VẸN (TB-ERD: TOÀN BỘ 48 INVARIANTS C-01..C-48)

Bao phủ toàn bộ **90 Thực thể** từ `TASK_MANAGER_ERD.puml` và danh mục đầy đủ **48 Invariants (`C-01` đến `C-48`)**:

| Mã Invariant | Thực thể CSDL liên quan | Nội dung Ràng buộc Bất biến (Schema Invariant) | Kiểm tra Ràng buộc (Verification Check) |
|---|---|---|---|
| **`TB-ERD-C01`** | `projects`, `schemes` | Các scheme thuộc sở hữu dự án (Permission, Workflow schemes) phải có `project_id` trùng khớp với Project. | `FK(project_id) = projects.id` |
| **`TB-ERD-C02`** | `project_group_roles`, `groups` | Nhóm gán quyền vào project phải thuộc cùng Organization với Project (`group.org_id = project.org_id`). | Cross-table Join Validation trong Project Role Service |
| **`TB-ERD-C03`** | `scheme_transition_permissions` | Transition được cấu hình quyền phải thuộc về một Workflow được ánh xạ trong `workflow_schemes`. | Cross-table Check với `workflow_scheme_mappings` |
| **`TB-ERD-C04`** | `board_column_states` | Một trạng thái Workflow chỉ được xuất hiện trong tối đa một cột của cùng một Board. | Unique Check: `UQ(board_id, workflow_state_id)` |
| **`TB-ERD-C05`** | `issues`, `sprints` | Issue và Sprint gán cho Issue phải thuộc về cùng một Project (`issue.project_id = sprint.project_id`). | Validation trong API Move/Assign Issue to Sprint |
| **`TB-ERD-C06`** | `issue_links` | Không được liên kết chính mình (`issue_id <> linked_issue_id`); cả hai Issue và LinkType phải cùng Org. | `CHECK (issue_id <> linked_issue_id)` & Tenant Check |
| **`TB-ERD-C07`** | `issue_links` | Đối với các loại liên kết đối xứng (Symmetric), cặp Issue ID phải được lưu theo thứ tự chuẩn tắc (Canonical Order: `min(id), max(id)`). | Service sorting trước khi insert/update |
| **`TB-ERD-C08`** | `attachments`, `comments` | Nếu attachment đính kèm vào comment, thì `comment.issue_id = attachment.issue_id` và cùng Org. | Cross-table Check trước khi lưu attachment |
| **`TB-ERD-C09`** | `custom_field_contexts` | Custom field, Project và IssueType trong ngữ cảnh phải thuộc về cùng một Organization. | Foreign Key & Tenant Validation |
| **`TB-ERD-C10`** | `issue_state_history` | Các trạng thái `from_state`, `to_state` và `transition` phải thuộc cùng `issue.workflow_id`; transition comment thuộc cùng Issue. | Foreign Key & Consistency Validation |
| **`TB-ERD-C11`** | `issue_state_history`, `transitions` | Trường `transition_comment_id` bắt buộc phải có giá trị khi `workflow_transitions.require_comment = true`. | Validation Guard trong Transition Engine |
| **`TB-ERD-C12`** | `workflow_scheme_mappings` | Workflows và Projects trong cùng scheme mapping phải thuộc cùng `org_id`. | Validation trước khi lưu Workflow Scheme Mapping |
| **`TB-ERD-C13`** | `issues` | `issues.org_id = projects.org_id` (Denormalize Tenant ID để tối ưu hóa truy vấn và cô lập dữ liệu). | Trigger / Service Auto-assignment |
| **`TB-ERD-C14`** | `comments` | `comments.org_id = issues.org_id` (Denormalize Tenant ID); parent comment cùng Issue và không chu trình. | Cycle Detection & Tenant Match |
| **`TB-ERD-C15`** | `issue_links` | `issue_links.org_id = issues.org_id` (Denormalize Tenant ID). | Tenant Consistency Check |
| **`TB-ERD-C16`** | `workflow_transitions` | `from_state_id` và `to_state_id` phải cùng thuộc về một `workflow_id`. | Composite FK: `(workflow_id, state_id) -> workflow_states` |
| **`TB-ERD-C17`** | `permission_scheme_entries` | `project_role_id` phải thuộc cùng Project với `permission_schemes.project_id`. | Composite FK / Cross-table Check |
| **`TB-ERD-C18`** | `board_issue_positions` | Issue được xếp hạng trên bảng phải thuộc cùng Project với Board (`issue.project_id = board.project_id`). | Validation trong API Rank Update |
| **`TB-ERD-C19`** | `board_issue_positions` | Trạng thái hiện tại của Issue phải được map vào một cột hợp lệ trên Board đó (`board_column_states`). | Validation trước khi hiển thị hoặc kéo thả thẻ |
| **`TB-ERD-C20`** | `work_logs` | Tác giả WorkLog phải là thành viên Active của Project hoặc là Org Admin được ủy quyền. | Membership Check trong WorkLog Service |
| **`TB-ERD-C21`** | `issue_custom_field_values` | Project và IssueType của Issue phải khớp chính xác với `custom_field_contexts`. | Consistency Validation trước khi insert giá trị |
| **`TB-ERD-C22`** | `issue_custom_field_values` | Dữ liệu `value_json` phải tuân thủ đúng định dạng của `field_type`; trường Select phải dùng option hợp lệ. | JSON Schema Validator & Option Lookup Check |
| **`TB-ERD-C23`** | `activity_logs` | Tác nhân Member phải thuộc cùng Org; trường `actor_member_id` là NULL khi tác nhân là System. | Integrity Validation trong Audit Logger |
| **`TB-ERD-C24`** | `notifications` | Người nhận (`recipient_member_id`) và sự kiện Outbox phải thuộc cùng `notification.org_id`. | Consistency Check trong Notification Worker |
| **`TB-ERD-C25`** | `organization_invitations` | Người mời (`invited_by_member_id`) và Role được gán (`org_role_id`) phải thuộc cùng `org_id`. | Foreign Key & Domain Service Check |
| **`TB-ERD-C26`** | `notification_preferences` | Thành viên cấu hình tùy chọn thông báo phải thuộc về `org_id` tương ứng. | Foreign Key & Org Scope Check |
| **`TB-ERD-C27`** | `background_jobs` | Thành viên yêu cầu tác vụ nền phải thuộc `org_id`; `requested_by_member_id` là NULL cho system jobs. | Tenant Validation trong Job Dispatcher |
| **`TB-ERD-C28`** | `org_member_roles` | Thành viên, vai trò và người cấp quyền (`granted_by`) phải thuộc cùng một Organization. | Validation trong RBAC Service |
| **`TB-ERD-C29`** | `department_members` | Phòng ban và thành viên phải thuộc cùng một Organization. | Cross-table Check trong Department Service |
| **`TB-ERD-C30`** | `group_members` | Nhóm, thành viên và người thêm phải thuộc cùng một Organization. | Cross-table Check trong Group Service |
| **`TB-ERD-C31`** | `project_member_roles` | Thành viên dự án và vai trò dự án phải thuộc cùng một Project; người cấp quyền có thẩm quyền. | Cross-table Check trong Project Member Service |
| **`TB-ERD-C32`** | `issue_sprint_history` | Tác nhân thêm/gỡ issue khỏi sprint phải thuộc cùng Org với Issue và có quyền quản lý Sprint. | Permission Check trong Sprint Service |
| **`TB-ERD-C33`** | `issue_watchers` | Người theo dõi phải thuộc cùng Org của Issue và có quyền `BROWSE_PROJECT`. | Permission Check trong Watcher Service |
| **`TB-ERD-C34`** | `project_components` | Component Lead phải là thành viên Active của Project hoặc là Org Admin. | Validation Service khi gán Lead |
| **`TB-ERD-C35`** | `projects`, `schemes` | Các scheme phạm vi Org (Issue Type, Priority, Field schemes) phải thuộc cùng `project.org_id`. | Cross-table Check khi gán Schemes cho Project |
| **`TB-ERD-C36`** | `priority_schemes`, `priorities` | Scheme, default priority và các priority trong entry phải thuộc cùng một Organization. | Consistency Check trong Priority Scheme Service |
| **`TB-ERD-C37`** | `issue_type_schemes` | Scheme, default issue type và các issue types trong entry phải thuộc cùng một Organization. | Consistency Check trong Issue Type Scheme Service |
| **`TB-ERD-C38`** | `field_scheme_entries` | IssueType và CustomField cùng Org với scheme; `is_required` và `is_hidden` không được đồng thời bằng `true`. | Validation Rule: `NOT (is_required = true AND is_hidden = true)` |
| **`TB-ERD-C39`** | `screen_fields` | CustomField thuộc Org của screen; `field_key` phải nằm trong danh mục registry trường hệ thống cho phép. | Allowlist Registry Check trong Screen Service |
| **`TB-ERD-C40`** | `screen_scheme_operations` | Screen gán cho thao tác Create/View/Edit phải thuộc cùng Org với ScreenScheme; `UQ(scheme_id, operation)`. | Unique Check & Tenant Match |
| **`TB-ERD-C41`** | `issue_type_screen_scheme_entries`| IssueType và ScreenScheme phải cùng thuộc Org của MappingScheme. | Consistency Check trong Screen Scheme Service |
| **`TB-ERD-C42`** | `issue_security_grants` | Đối tượng được cấp quyền (Member, Group, ProjectRole) phải thuộc cùng Org với SecurityScheme. | Single-target Check & Org Match |
| **`TB-ERD-C43`** | `notification_scheme_entries` | Target nhận thông báo phải thuộc cùng Org với NotificationScheme. | Consistency Check trong Notification Scheme Service |
| **`TB-ERD-C44`** | `filter_shares` | Saved Filter chỉ được share cho Project, Group, Member thuộc cùng Organization với Filter. | Single-target Check & Org Match |
| **`TB-ERD-C45`** | `issue_type_hierarchy_mappings` | IssueType và HierarchyLevel cùng Org; parent issue bắt buộc phải thuộc level cao hơn đúng 1 bậc và không chu trình. | Hierarchy Tree Validation Service |
| **`TB-ERD-C46`** | `automation_rule_components` | Rule Component Tree bắt buộc có đúng 1 root trigger; là cây phi chu trình; config hợp lệ theo versioned schema. | Acyclic Graph Parser & Schema Validation |
| **`TB-ERD-C47`** | `dashboards`, `dashboard_widgets`| Widget và SavedFilter nguồn phải truy cập được trong Org của Dashboard; không lưu bí mật trong config. | Access Scope Check & Secret Sanitization |
| **`TB-ERD-C48`** | `webhook_deliveries` | URL Webhook phải an toàn chống SSRF (chặn IP private/metadata); payload có ký số HMAC-SHA256; không lộ secret. | SSRF Resolver Guard & HMAC Signing Engine |

---

## 6. CƠ SỞ KIỂM THỬ MÁY TRẠNG THÁI FSM & MA TRẬN CHUYỂN ĐỔI (TB-FSM)

### 6.1. Ma trận Chuyển đổi Trạng thái Tổng quát $N \times N$ (Workflow FSM State Transition Matrix)

Dưới đây là ma trận kiểm thử chuyển đổi trạng thái cho quy trình chuẩn Agile Workflow:

| Trạng thái Hiện tại ($\downarrow$) \ Sự kiện ($\rightarrow$) | `[START]` | `[REQUEST_REVIEW]` | `[APPROVE]` | `[REJECT]` | `[CLOSE]` | `[REOPEN]` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **$S_1$: To Do** (Initial State) | **HỢP LỆ $\rightarrow S_2$** | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) |
| **$S_2$: In Progress** | BẤT HỢP LỆ (`422`) | **HỢP LỆ $\rightarrow S_3$** | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) |
| **$S_3$: In Review** | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | **HỢP LỆ $\rightarrow S_4$** | **HỢP LỆ $\rightarrow S_2$** | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) |
| **$S_4$: Done** (Terminal State) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | **HỢP LỆ $\rightarrow S_5$** | **HỢP LỆ $\rightarrow S_2$** |
| **$S_5$: Closed** (Terminal State) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | BẤT HỢP LỆ (`422`) | **HỢP LỆ $\rightarrow S_1$** |

### 6.2. Các Mã Kiểm thử FSM Bắt buộc
- **`TB-FSM-01` (Trạng thái Khởi tạo Duy nhất):** Trong một Workflow, bắt buộc có duy nhất 01 trạng thái có `is_initial = true` (`UQ(workflow_id) WHERE is_initial = true`).
- **`TB-FSM-02` (Tính Đạt được của Trạng thái - State Reachability):** Mọi trạng thái trong Workflow phải có ít nhất một đường chuyển dịch xuất phát từ Initial State; không được có trạng thái cô lập (Unreachable State).
- **`TB-FSM-03` (Thực thi Guard Types):**
  - `requires_fields`: Bắt buộc các trường trong `config_json` không được rỗng trên Issue trước khi transition.
  - `json_logic`: Đánh giá biểu thức điều kiện logic phức tạp (vd: Story Points $> 0$, thời gian làm $> 0$).
- **`TB-FSM-04` (Bắt buộc Bình luận khi Transition):** Nếu `workflow_transitions.require_comment = true`, payload thiếu `comment` bị từ chối với mã lỗi `422 Unprocessable Entity` (`TB-ERD-C11`).

---

## 7. CƠ SỞ KIỂM THỬ BẢO MẬT & PHÂN QUYỀN 3 TẦNG (TB-SEC)

- **`TB-SEC-01` (Xác thực JWT & Bảo vệ Khóa Bí mật):** Chữ ký JWT hợp lệ, hạn dùng `exp` 15 phút, thuật toán HS256/RS256. Token giả mạo hoặc hết hạn bị từ chối với mã `401 Unauthorized`.
- **`TB-SEC-02` (Ngăn ngừa Lỗ hổng IDOR):** Mọi API nhận ID (`projectId`, `issueId`, `sprintId`, `commentId`) đều kiểm tra Tenant và Project Ownership trước khi trả về dữ liệu.
- **`TB-SEC-03` (Bảo vệ Mật khẩu & Token Hash):** Toàn bộ mật khẩu, refresh token, reset token, invite token, PAT đều lưu hash trong DB (Argon2id/Bcrypt hoặc SHA-256).
- **`TB-SEC-04` (Chống Brute Force & Rate Limiting):** Áp dụng Throttler trên `/auth/login`, `/auth/forgot-password`, tối đa 5 requests sai / phút / IP.
- **`TB-SEC-05` (Bảo vệ Tiêu đề HTTP Helmet):** Bắt buộc có các Security Headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- **`TB-SEC-06` (Chống SSRF trên Webhook):** Bộ lọc URL chặn đứng mọi yêu cầu gửi tới loopback, private networks, hoặc cloud metadata (`TB-BR-13`, `TB-ERD-C48`).
- **`TB-SEC-07` (Phân quyền PAT Granular Scopes):** Personal Access Token chỉ được phép thực hiện các thao tác nằm trong phạm vi `scopes_json` đã cấp.

---

## 8. CƠ SỞ KIỂM THỬ GIAO DIỆN API & MÃ LỖI (TB-API)

| Mã Lỗi Chuẩn (`ERROR_CODES`) | HTTP Status | Ý nghĩa Nghiệp vụ & Điều kiện Phát sinh |
|---|:---:|---|
| `UNAUTHORIZED` | `401` | Token không hợp lệ, thiếu token hoặc phiên đăng nhập đã hết hạn |
| `FORBIDDEN` | `403` | Người dùng không đủ quyền thực hiện hành động (RBAC / Issue Security) |
| `NOT_FOUND` | `404` | Tài nguyên không tồn tại hoặc thuộc tổ chức khác (bảo vệ chống lộ IDOR) |
| `CONFLICT` | `409` | Xung đột dữ liệu hoặc xung đột phiên bản Optimistic Lock (`expectedVersion`) |
| `VALIDATION_ERROR` | `422` / `400` | Dữ liệu đầu vào không thỏa mãn DTO validation schema |
| `SPRINT_ALREADY_ACTIVE` | `409` | Cố tình kích hoạt sprint khi board đã có một Active Sprint |
| `TRANSITION_NOT_ALLOWED` | `403` / `422` | Transition bị chặn bởi Transition Guard hoặc Permission Deny |
| `ORGANIZATION_SUSPENDED` | `403` | Tổ chức đang bị tạm dừng hoạt động, từ chối mọi thao tác ghi |
| `TENANT_ACCESS_DENIED` | `403` | Người dùng cố tình truy cập tài nguyên của Organization khác |
| `SSRF_DETECTED` | `422` / `400` | URL Webhook trỏ tới địa chỉ IP private hoặc metadata bị cấm |
| `CYCLIC_DEPENDENCY_DETECTED`| `422` | Phát hiện chu trình lặp trong phân cấp phòng ban hoặc issue |
| `CANNOT_LEAVE_AS_SOLE_ADMIN`| `422` | Admin duy nhất của tổ chức cố tình tự rời khỏi tổ chức |

---

## 9. CƠ SỞ KIỂM THỬ PHI CHỨC NĂNG (TB-NFR: ISO/IEC 25010)

| Mã TB-NFR | Đặc tính ISO 25010 | Tiêu chí Định lượng & Yêu cầu Kỹ thuật |
|---|---|---|
| **`TB-NFR-01`** | **Performance (Response Time)** | - 95% truy vấn đọc API (Read/Query) có thời gian phản hồi $< 150\text{ms}$.<br>- 95% thao tác ghi nghiệp vụ (Write/Transition) có thời gian phản hồi $< 300\text{ms}$.<br>- SPA First Contentful Paint (FCP) $< 1.2\text{s}$. |
| **`TB-NFR-02`** | **Performance (Throughput)** | Hệ thống chịu tải tối thiểu $500\text{ req/sec}$ đồng thời với tỷ lệ lỗi $\text{Error Rate} < 0.1\%$. |
| **`TB-NFR-03`** | **Reliability (Outbox Guarantee)** | Sự kiện `outbox_events` được Worker phát đi theo nguyên tắc **At-Least-Once Delivery** kèm exponential backoff. |
| **`TB-NFR-04`** | **Reliability (Concurrency Integrity)**| 100% các thao tác cập nhật đồng thời vào cùng một Issue hoặc Sprint phải duy trì tính toàn vẹn (không Lost Update). |
| **`TB-NFR-05`** | **Security (Vulnerability Protection)** | Đạt chuẩn an toàn OWASP Top 10: 0 lỗi SQL Injection, 0 lỗi XSS, 0 lỗi CSRF, 0 lỗi SSRF, 0 lỗi BOLA. |
| **`TB-NFR-06`** | **Usability & Responsiveness** | Giao diện tương thích hoàn hảo trên các độ phân giải màn hình từ 1280x720 đến 4K; hỗ trợ Dark/Light mode chuẩn Jira. |

---

## 10. PHÊ DUYỆT & XÁC NHẬN (APPROVAL & SIGN-OFF)

| Vai trò | Đại diện Ký duyệt | Trạng thái / Chữ ký | Ngày phê duyệt |
|---|---|---|---|
| **Test Architect / QA Lead** | Senior Test Architect | **APPROVED** | `2026-09-12` |
| **Platform Product Owner** | Platform Director | **APPROVED** | `2026-09-12` |
| **Lead Software Engineer** | Backend Tech Lead | **APPROVED** | `2026-09-12` |
