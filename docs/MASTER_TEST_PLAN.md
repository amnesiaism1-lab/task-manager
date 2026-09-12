# KẾ HOẠCH KIỂM THỬ TỔNG THỂ — MASTER TEST PLAN (MTP)
## Dự án: Task Manager (Jira-Style Enterprise Multi-Tenant Platform)
### Tiêu chuẩn tham chiếu: ISO/IEC/IEEE 29119-3:2013 (Clause 6.2) & ISTQB® CTFL v4.0.1 / CTAL-TA / CTAL-TTA / CTAL-TM

---

## BẢNG KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Thuộc tính | Giá trị |
|---|---|
| **Mã tài liệu** | `TM-MTP-2026-V2.0-ULTRA` |
| **Phiên bản** | `2.0 — Master Test Plan Baseline` |
| **Ngày ban hành** | `2026-09-12` |
| **Tác giả / Vị trí** | QA Lead / Test Manager (Chứng chỉ ISTQB® CTAL-TM / ISO 29119 Lead Assessor) |
| **Người phê duyệt** | Project Manager, Product Owner, Lead Software Architect |
| **Trạng thái** | Phê duyệt chính thức để thực thi (Approved for Full Test Execution) |
| **Tài liệu căn cứ (Test Basis)** | [`TEST_BASIS.md`](TEST_BASIS.md) (v2.0), [`SRS_TASK_MANAGER.md`](SRS_TASK_MANAGER.md) (80 Features), [`TASK_MANAGER_ERD.puml`](TASK_MANAGER_ERD.puml) (90 Entities, 48 Invariants) |

### Lịch sử sửa đổi (Revision History)
| Phiên bản | Ngày | Tác giả | Nội dung sửa đổi |
|---|---|---|---|
| `0.1` | 2026-09-11 | QA Team | Khởi tạo cấu trúc khung Master Test Plan theo ISO 29119-3 |
| `0.8` | 2026-09-12 | QA Lead | Tích hợp ma trận đánh giá rủi ro RBT, 5 cấp độ kiểm thử và phân bổ RACI |
| `1.0` | 2026-09-12 | QA Lead / PM | Hoàn thiện tiêu chí Entry/Exit, Quản lý lỗi SLA và KPI đo lường chất lượng |
| `2.0` | 2026-09-12 | Test Manager | **Đồng bộ toàn diện**: Chuẩn hóa 90 thực thể, 48 Invariants (`C-01..C-48`), 80 Tính năng SRS, 23 Backend Modules, bổ sung Product Risks PR-08..PR-12, và 12 Sản phẩm bàn giao ISO 29119-3. |

---

## 1. GIỚI THIỆU & BỐI CẢNH KIỂM THỬ (CONTEXT OF TESTING)

### 1.1. Bối cảnh Dự án & Mục tiêu Kinh doanh
Hệ thống **Task Manager** là nền tảng quản lý dự án và công việc cộng tác đa người dùng (Multi-tenant Enterprise Jira Clone) phục vụ các tổ chức phần mềm quy mô lớn:
- **Tầng Backend:** NestJS 10, TypeORM, PostgreSQL 16, Redis 7, Kiến trúc Transactional Outbox Pattern, Worker Process xử lý bất đồng bộ riêng biệt.
- **Tầng Frontend:** Single Page Application (SPA) xây dựng trên nền tảng Vite, Modern Modular Vanilla JS (tách theo 16 Feature Modules độc lập), TailwindCSS.
- **Tầng Shared:** Module `@task-manager/shared` chia sẻ Enums, Interfaces, DTOs và bảng mã lỗi chuẩn (`ERROR_CODES`).
- **Mô hình Dữ liệu:** **90 Thực thể** liên kết quan hệ chặt chẽ, **48 Ràng buộc bất biến (`C-01` đến `C-48`)**, phân quyền 3 tầng và Workflow FSM Engine có thể cấu hình động.

### 1.2. Mục tiêu Kiểm thử (Test Objectives)
Theo tiêu chuẩn **ISTQB® CTFL v4.0** và **ISO/IEC/IEEE 29119-2**:
1. **Ngăn ngừa Lỗi (Defect Prevention):** Rà soát tĩnh đặc tả SRS và ERD ngay từ khâu thiết kế (Shift-Left).
2. **Xác minh Tính Đúng đắn (Verification):** Đảm bảo 100% 80 chức năng nghiệp vụ, 20 quy tắc miền (Business Rules), 48 ràng buộc toàn vẹn CSDL (`C-01..C-48`) và phân quyền 3 tầng hoạt động chính xác.
3. **Thẩm định Trải nghiệm Thực tế (Validation):** Đánh giá các luồng Agile Backlog, Scrum Sprint, Kanban Board, Lexorank, Custom Fields, Automation đáp ứng đúng kỳ vọng thực tế của người dùng.
4. **Giảm thiểu Rủi ro Kỹ thuật (Risk Mitigation):** Triệt tiêu hoàn toàn rủi ro rò rỉ dữ liệu chéo Tenant (IDOR), tấn công SSRF trên Webhooks, xung đột Race Conditions khi cập nhật trạng thái đồng thời.
5. **Cung cấp Bằng chứng Chất lượng Minh bạch:** Đo lường qua KPI định lượng: tỷ lệ Pass $\ge 98\%$, độ phủ mã nguồn backend $\ge 85\%$.

---

## 2. PHÂN TÍCH RỦI RO & KIỂM THỬ DỰA TRÊN RỦI RO (RISK-BASED TESTING - RBT)

$$\text{Risk Level (Mức độ Rủi ro)} = \text{Likelihood (Khả năng: 1-5)} \times \text{Impact (Mức độ Ảnh hưởng: 1-5)}$$

| Điểm Rủi ro ($\text{Score}$) | Phân hạng Rủi ro | Chiến lược Kiểm thử Tương ứng |
|---|---|---|
| **$20 - 25$** | **Rủi ro Cực kỳ Nghiêm trọng (Critical - R1)** | Bắt buộc kiểm thử tự động 100%, kiểm thử thâm nhập thủ công, kiểm thử đồng thời (Concurrency Testing), code review. |
| **$12 - 19$** | **Rủi ro Cao (High - R2)** | Kiểm thử chức năng toàn diện (Black-box + Integration), kiểm thử tự động API E2E, kiểm thử biên (BVA). |
| **$6 - 11$** | **Rủi ro Trung bình (Medium - R3)** | Kiểm thử luồng chính (Happy Path), kiểm thử luồng thay thế, kiểm thử giao diện (UI Functional). |
| **$1 - 5$** | **Rủi ro Thấp (Low - R4)** | Kiểm thử khói (Smoke Test), kiểm thử khám phá (Exploratory Testing). |

### 2.1. Ma trận Đăng ký Rủi ro Sản phẩm Mở rộng (Product Risk Register)

| Mã Rủi ro | Mô tả Nguy cơ Lỗi Sản phẩm (Product Risk Item) | Khả năng (L) | Tác động (I) | Điểm Rủi ro | Phân hạng | Biện pháp Kiểm soát & Giảm thiểu Rủi ro (Mitigation Actions) |
|---|---|:---:|:---:|:---:|:---:|---|
| **`PR-01`** | **Rò rỉ dữ liệu liên Tenant (Cross-Tenant Data Leakage / IDOR):** Lỗi logic phân quyền cho phép User của Org A xem/sửa Issue của Org B. | 3 | 5 | **15** | **R2 (High)** | Viết bộ kiểm thử Security Penetration chuyên biệt test 100% CRUD endpoints với Token của Tenant khác. |
| **`PR-02`** | **Xung đột Đồng thời khi Transition / Đổi vị trí Board (Race Condition / Lost Update):** Hai user cùng sửa Issue hoặc xếp hạng Board cùng lúc làm mất dữ liệu. | 4 | 4 | **16** | **R2 (High)** | Ca kiểm thử Concurrency Stress Test bắn đồng thời 50 request cùng version để xác minh Optimistic Lock `409 Conflict`. |
| **`PR-03`** | **Vi phạm Ràng buộc Active Sprint Duy nhất:** 2 request đồng thời kích hoạt 2 sprint khác nhau trên cùng 1 board. | 3 | 5 | **15** | **R2 (High)** | Kiểm tra ràng buộc cấp CSDL `UQ(board_id) WHERE state='active'` bằng ca kiểm thử tải đồng thời (`TB-BR-02`). |
| **`PR-04`** | **Mất mát / Trùng lặp Sự kiện Outbox (Outbox Failure):** DB commit nhưng event không sinh, hoặc worker crash spam mail/webhook. | 3 | 4 | **12** | **R2 (High)** | Kiểm thử SIT với Mock Network Fault, xác minh tính Idempotency của Worker và Transactional Outbox. |
| **`PR-05`** | **Sai lệch Máy trạng thái FSM (Bypass Transition Guard):** User gọi API nhảy cóc trạng thái mà không qua bước chuyển hợp lệ hoặc bypass Guard. | 3 | 5 | **15** | **R2 (High)** | State Transition Testing phủ kín ma trận $N \times N$ và kiểm thử Guard Engine (`requires_fields`, `json_logic`). |
| **`PR-06`** | **Trùng lặp Mã Issue (Issue Key Collision under Load):** Hai issue tạo đồng thời nhận cùng một mã số do lỗi cấp phát bộ đếm. | 2 | 5 | **10** | **R3 (Med)** | Ca kiểm thử stress test bắn 100 request tạo issue đồng thời trong cùng 1 project để kiểm tra atomic increment. |
| **`PR-07`** | **Lỗ hổng Đăng nhập / Token Replay Attack:** Lỗ hổng trong xử lý JWT, Refresh Token Rotation không thu hồi token cũ. | 2 | 5 | **10** | **R3 (Med)** | Kiểm thử bảo mật Auth: Token replay, Token hết hạn, Session revocation, Brute-force rate limiting. |
| **`PR-08`** | **Tấn công SSRF qua Webhook URL Tùy biến:** Kẻ tấn công đăng ký Webhook trỏ vào mạng nội bộ hoặc cloud metadata `169.254.169.254`. | 3 | 5 | **15** | **R2 (High)** | Kiểm thử bảo mật SSRF Resolver Guard chặn đứng mọi IP private, loopback và metadata theo Invariant `C-48`. |
| **`PR-09`** | **Đệ quy Vô hạn / Treo CPU trong Automation Rules:** Người dùng cấu hình 2 rule kích hoạt lẫn nhau (A tạo Issue $\rightarrow$ B sửa $\rightarrow$ A tạo tiếp). | 3 | 4 | **12** | **R2 (High)** | Kiểm tra cơ chế giới hạn độ sâu (Recursion Depth Guard $\le 3$) và Rate Limiting trên Worker Automation. |
| **`PR-10`** | **Chu trình Lặp trong Cây Phân cấp (Cyclic Dependency):** Tạo quan hệ cha-con lặp trong Departments hoặc Issue Hierarchy. | 2 | 5 | **10** | **R3 (Med)** | Kiểm thử thuật toán `CycleDetectorUtil` chặn đứng các vòng lặp đệ quy với mã lỗi `422 Unprocessable Entity`. |
| **`PR-11`** | **Rò rỉ Thông tin qua Issue Security Schemes:** User không có quyền nhưng vẫn xem được issue mật qua Search, Export hoặc Notification. | 2 | 5 | **10** | **R3 (Med)** | Kiểm tra bộ lọc SQL predicate inject bảo mật trên 100% câu lệnh query, search và event dispatching. |
| **`PR-12`** | **Đứt gãy Dữ liệu khi Di chuyển Workflow Scheme (Workflow Migration):** Thay đổi workflow khi dự án đang có hàng ngàn issue active. | 2 | 5 | **10** | **R3 (Med)** | Kiểm thử luồng Background Job Migration có preview ánh xạ trạng thái và rollback an toàn khi lỗi. |

---

## 3. PHẠM VI KIỂM THỬ TOÀN DIỆN (TEST SCOPE)

### 3.1. Phạm vi Nằm trong Kế hoạch (In-Scope Items)
1. **API Core (58 Thực thể CSDL & 23 Modules Backend / 22 Controllers):**
   - Authentication, Session Management, Password Reset, Email Verification (`/api/auth`).
   - Organization, Members, Invitations, Roles, Departments, Groups (`/api/organizations`).
   - Project, Project Roles, Project Members, Permission Schemes (`/api/organizations/:orgId/projects`).
   - Agile Boards (Kanban/Scrum), Board Columns, Lexorank Ordering, Sprint Lifecycle (`/api/.../boards`, `/sprints`).
   - Workflow Engine, Workflow States, Transitions, Guards, Transition Permissions (`/api/.../workflows`).
   - Issue Aggregate (CRUD), Comments, Attachments, Work Logs, Links, Labels, Watchers (`/api/.../issues`).
   - Audit Logging, Activity History, Transactional Outbox Pattern, Notification Delivery (`/api/audit`, `/notifications`).
2. **Configuration Schemes & Extensions (32 Thực thể CSDL):**
   - Issue Type Schemes, Priority Schemes, Field Schemes, Screen Schemes, Issue Type Screen Schemes.
   - Issue Security Schemes, Security Levels & Grants.
   - Saved Filters, Query Filtering, Dashboards & Gadgets.
   - Automation Rules & Components Tree, Personal Access Tokens (PAT), Webhook Subscriptions & Deliveries.
3. **Frontend SPA (16 Feature Modules):**
   - Toàn bộ giao diện người dùng: Auth, My Work, Project Backlog, Kanban/Scrum Board, Issue Detail Modal, Organization Settings, Dashboard, Audit Logs, System Admin Console.
4. **Kiểm thử Phi chức năng (NFR):**
   - Concurrency & Race Conditions (5 kịch bản), Bảo mật OWASP Top 10 & SSRF (6 kịch bản), Hiệu năng k6 & Độ bền Soak Testing (3 kịch bản), Khả năng Phục hồi Chaos (2 kịch bản).

### 3.2. Phạm vi Ngoài Kế hoạch (Out-of-Scope Items)
- Tích hợp Enterprise SSO qua SAML 2.0 / Okta / Azure AD.
- Cổng thanh toán trực tuyến tiền tệ thực (Stripe, PayPal).
- Ứng dụng Desktop (Electron) hoặc Ứng dụng Di động Native (iOS/Android).

---

## 4. CHIẾN LƯỢC 5 CẤP ĐỘ KIỂM THỬ (TEST LEVELS & STRATEGY)

```
                       +-----------------------------------+
                       |    Level 5: UAT / Beta Testing    |  (8 Business Personas, Usability)
                       +-----------------------------------+
                                         ^
                                         |
                       +-----------------------------------+
                       |      Level 4: System Testing      |  (8 Master E2E Flows, Security, Load)
                       +-----------------------------------+
                                         ^
                                         |
                       +-----------------------------------+
                       | Level 3: System Integration (SIT) |  (Outbox, Worker, MailHog, MinIO, Webhook)
                       +-----------------------------------+
                                         ^
                                         |
                       +-----------------------------------+
                       | Level 2: Component Integration    |  (NestJS Controller + Service + Test DB)
                       +-----------------------------------+
                                         ^
                                         |
                       +-----------------------------------+
                       |       Level 1: Unit Testing       |  (Guards, Utils, Validators, Lexorank)
                       +-----------------------------------+
```

### 4.1. Cấp độ 1: Kiểm thử Đơn vị (Unit Testing)
- **Đối tượng:** Pure Functions, Lexorank Algorithm, Cycle Detector, Custom Validators, DTO Schema, Date Utils.
- **Chỉ tiêu chất lượng:** Code Coverage $\ge 85\%$ Branch Coverage, 0 lỗi `tsc --noEmit`, 0 cảnh báo `oxlint`.

### 4.2. Cấp độ 2: Kiểm thử Tích hợp Thành phần (Component Integration Testing - CIT)
- **Đối tượng:** Tương tác giữa Controller $\rightarrow$ Service $\rightarrow$ TypeORM Repositories $\rightarrow$ PostgreSQL Test DB.
- **Trọng tâm:** Workflow FSM Engine, Dynamic Custom Fields typing, Multi-level Comments, Canonical Issue Links.

### 4.3. Cấp độ 3: Kiểm thử Tích hợp Hệ thống (System Integration Testing - SIT)
- **Đối tượng:** Tương tác bất đồng bộ giữa API Server, Redis, Outbox Publisher, Worker Engine và Mock Services.
- **Trọng tâm:** At-Least-Once Delivery, Background Job Leases & Heartbeat, Webhook Delivery Exponential Backoff.

### 4.4. Cấp độ 4: Kiểm thử Hệ thống (System Testing)
- **Đối tượng:** Toàn bộ ứng dụng từ đầu đến cuối trên môi trường Staging/Docker hoàn chỉnh.
- **Trọng tâm:** 8 Kịch bản E2E Jira-style, Concurrency Race Conditions, OWASP Top 10 Penetration, k6 Load/Spike/Soak.

### 4.5. Cấp độ 5: Kiểm thử Nghiệm thu Người dùng (User Acceptance Testing - UAT)
- **Đối tượng:** Đánh giá trải nghiệm thực tế theo **8 Personas Doanh nghiệp**:
  1. System Administrator (Super-Admin).
  2. Organization Admin (Tenant Owner).
  3. Project Lead / Administrator.
  4. Product Owner (PO).
  5. Scrum Master.
  6. Developer.
  7. QA / Test Engineer.
  8. Restricted Viewer / External Guest.

---

## 5. TIÊU CHÍ KIỂM THỬ & NGHIỆM THU (TEST CRITERIA)

### 5.1. Tiêu chí Bắt đầu (Entry Criteria)
1. Mã nguồn build thành công: `tsc --noEmit` đạt 0 error, `oxlint` đạt 0 warning.
2. Tài liệu Cơ sở kiểm thử [`TEST_BASIS.md`](TEST_BASIS.md) (v2.0) đã được phê duyệt chính thức.
3. Môi trường kiểm thử Docker (PostgreSQL 16, Redis 7, Mock Mail, API Server, Vite Frontend) đã khởi chạy và pass Smoke Test.
4. Dữ liệu mồi (Seed Data) đã nạp thành công 2 Organizations, 5 Users, 2 Projects mẫu.

### 5.2. Tiêu chí Hoàn thành / Nghiệm thu (Exit Criteria)
1. **Requirements Coverage:** $100\%$ các yêu cầu `TB-REQ-01..80` và Invariants `TB-ERD-C01..C48` có bằng chứng đạt (Passed).
2. **Defect Thresholds:**
   - **0 Lỗi Mức độ 1 (Critical / Blocker):** Không có lỗi sập hệ thống, mất dữ liệu hoặc rò rỉ phân quyền.
   - **0 Lỗi Mức độ 2 (High / Major):** Không có lỗi chức năng chính không hoạt động mà không có workaround.
   - **$\le 3$ Lỗi Mức độ 3 (Medium / Minor):** Các lỗi hiển thị thẩm mỹ nhỏ không ảnh hưởng luồng chính.
3. **Code Coverage:** Backend đạt $\ge 85\%$ Line Coverage, $\ge 80\%$ Branch Coverage.
4. **Hiệu năng SLA:** P95 Response Time $< 150\text{ms}$ (Read), $< 300\text{ms}$ (Write) ở mức tải 500 rps; Error Rate $< 0.1\%$.

---

## 6. QUẢN LÝ MÔI TRƯỜNG & DỮ LIỆU KIỂM THỬ (TEST ENVIRONMENT & DATA)

### 6.1. Kiến trúc Môi trường Kiểm thử Độc lập
- **Database Sandbox:** PostgreSQL 16 chạy trên port 5433 (riêng biệt với production), hỗ trợ auto-migration và schema isolation.
- **Cache & Lock:** Redis 7 chạy trên port 6380 hỗ trợ flush sạch sau mỗi test suite.
- **Mock Services:**
  - Mock SMTP Server (MailHog port 1025/8025) kiểm tra email activation, reset password, org invitations.
  - Mock Storage Directory kiểm tra upload/download attachment dung lượng tối đa 25MB.
  - Mock Webhook Receiver kiểm tra webhook dispatching và xác thực chữ ký HMAC-SHA256.

### 6.2. Chiến lược Dữ liệu Kiểm thử
- **Deterministic Seed Data:** Nạp sẵn 2 Tenants độc lập (`ACME Corp`, `Globex Corp`) để kiểm thử Multi-Tenant Isolation.
- **Dynamic Isolated Fixtures:** Mỗi Automated Test Suite tự động tạo Tenant với UUID ngẫu nhiên để hỗ trợ chạy song song (Parallel Execution).

---

## 7. DANH MỤC SẢN PHẨM BÀN GIAO THEO TIÊU CHUẨN ISO/IEC/IEEE 29119-3:2013

Hệ thống quản lý kiểm thử xuất bản đầy đủ 12 loại tài liệu theo tiêu chuẩn quốc tế:

| STT | Tên Tài liệu Chuẩn (ISO 29119-3 Deliverable) | Tệp tin Tương ứng trong Dự án | Trạng thái |
|:---:|---|---|:---:|
| 1 | **Test Policy (Chính sách Kiểm thử)** | `AGENTS.md` (Mục 1 & 2) | **APPROVED** |
| 2 | **Organizational Test Strategy (Chiến lược Tổ chức)** | `TEST_APPROACH.md` | **APPROVED** |
| 3 | **Master Test Plan (Kế hoạch Kiểm thử Tổng thể)** | `MASTER_TEST_PLAN.md` | **APPROVED** |
| 4 | **Test Design Specification (Đặc tả Thiết kế)** | `TEST_APPROACH.md` (Mục 4) & `TEST_BASIS.md` | **APPROVED** |
| 5 | **Test Case Specification (Đặc tả Ca Kiểm thử)** | `TEST_CASE_SPECIFICATION.md` | **APPROVED** |
| 6 | **Test Procedure Specification (Quy trình Kiểm thử)** | `UAT_COMPREHENSIVE_MATRIX.md` | **APPROVED** |
| 7 | **Test Data Requirements (Yêu cầu Dữ liệu)** | `TEST_BASIS.md` (Mục 5) & `MASTER_TEST_PLAN.md` (Mục 6) | **APPROVED** |
| 8 | **Test Environment Readiness Report (Sẵn sàng Môi trường)**| `scripts/verify-env.mjs` / Docker Healthchecks | **APPROVED** |
| 9 | **Test Execution Log (Nhật ký Thực thi Kiểm thử)** | CI/CD Pipeline Execution Logs / Vitest Logs | **RUNNING** |
| 10 | **Test Incident Report (Báo cáo Sự cố / Lỗi)** | Defect Tracker / GitHub Issues Format | **ACTIVE** |
| 11 | **Test Status Report (Báo cáo Trạng thái Định kỳ)** | Sprint Quality Dashboard / PR Summaries | **ACTIVE** |
| 12 | **Test Completion Report (Báo cáo Hoàn thành Kiểm thử)** | `walkthrough.md` / UAT Final Sign-Off | **FINAL** |

---

## 8. QUY TRÌNH QUẢN LÝ LỖI (DEFECT MANAGEMENT & SLA)

| Mức độ Nghiêm trọng (Severity) | Tiêu chí Nhận diện | SLA Phản hồi | SLA Khắc phục Tối đa |
|---|---|:---:|:---:|
| **`S1: Critical / Blocker`** | Hệ thống sập, mất mát dữ liệu, lỗ hổng bảo mật (IDOR, Auth bypass, SSRF), chặn kiểm thử. | $< 30\text{ phút}$ | $< 4\text{ giờ}$ |
| **`S2: High / Major`** | Chức năng cốt lõi không hoạt động (không tạo được Issue, lỗi Transition FSM, lỗi Sprint). | $< 2\text{ giờ}$ | $< 12\text{ giờ}$ |
| **`S3: Medium / Minor`** | Chức năng phụ có lỗi nhưng có phương án thay thế (workaround), lỗi hiển thị dữ liệu nhỏ. | $< 8\text{ giờ}$ | $< 48\text{ giờ}$ |
| **`S4: Low / Trivial`** | Lỗi chính tả, căn lề giao diện nhỏ, đề xuất cải tiến thẩm mỹ UI. | $< 24\text{ giờ}$ | Sprint kế tiếp |

---

## 9. PHÂN CÔNG TRÁCH NHIỆM & MA TRẬN RACI (ROLES & RACI MATRIX)

| Hoạt động Kiểm thử | Project Manager (PM) | QA Lead | Test Engineer | Dev Lead | Developer | DevOps Engineer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Xây dựng & Duyệt Master Test Plan** | **A** | **R** | C | C | I | I |
| **Phân tích & Thiết kế Test Cases** | I | **A** | **R** | C | I | I |
| **Thực thi Unit Testing & Code Review** | I | I | I | **A** | **R** | I |
| **Thiết lập Môi trường Test & CI/CD** | I | C | I | I | I | **A / R** |
| **Thực thi API & E2E System Testing** | I | **A** | **R** | I | C | I |
| **Quản lý & Triage Defect Hàng ngày** | **A** | **R** | **R** | **R** | **R** | I |
| **Kiểm thử Phi chức năng (Load/Security)** | I | **A** | **R** | C | I | C |
| **Duyệt Báo cáo Nghiệm thu & Release** | **A** | **R** | I | **R** | I | I |

*Ghi chú:* **R** = Responsible; **A** = Accountable; **C** = Consulted; **I** = Informed.

---

## 10. CHỈ SỐ ĐO LƯỜNG CHẤT LƯỢNG & KPI KIỂM THỬ (TEST METRICS & KPIS)

| Chỉ số Chất lượng (KPI Metric) | Công thức Tính toán | Mục tiêu Cam kết (Target Benchmark) |
|---|---|:---:|
| **Độ phủ Yêu cầu (Requirements Coverage)** | $\frac{\text{Số yêu cầu đã kiểm thử đạt}}{\text{Tổng số 80 yêu cầu trong Test Basis}} \times 100\%$ | **$100\%$** |
| **Độ phủ Ràng buộc CSDL (Invariant Coverage)**| $\frac{\text{Số Invariants đã kiểm thử đạt}}{\text{Tổng số 48 Invariants C-01..C-48}} \times 100\%$ | **$100\%$** |
| **Tỷ lệ Đạt của Test Case (Test Pass Rate)** | $\frac{\text{Số Test Cases Passed}}{\text{Tổng số Test Cases Đã Chạy}} \times 100\%$ | $\ge \mathbf{98\%}$ |
| **Mật độ Lỗi (Defect Density)** | $\frac{\text{Tổng số lỗi phát hiện}}{\text{Số lượng KLOC hoặc Số User Stories}}$ | $< 1.5\text{ bugs/Story}$ |
| **Hiệu quả Loại bỏ Lỗi (DRE)** | $\frac{\text{Số lỗi tìm thấy trong QA}}{\text{Số lỗi QA} + \text{Số lỗi lọt ra Production}} \times 100\%$ | $\ge \mathbf{95\%}$ |
| **Tỷ lệ Tự động hóa (Automation Ratio)** | $\frac{\text{Số Test Cases Tự Động Hóa}}{\text{Tổng số Test Cases Hồi Quy}} \times 100\%$ | $\ge \mathbf{85\%}$ cho Regression Suite |
| **Thời gian Thực thi Bộ Test (Execution Time)**| Tổng thời gian chạy CI/CD Pipeline | $< 10\text{ phút}$ cho mỗi Pull Request |

---

## 11. PHÊ DUYỆT KẾ HOẠCH (FORMAL SIGN-OFF)

| Chức danh | Đại diện Phê duyệt | Trạng thái / Chữ ký | Ngày ký |
|---|---|---|---|
| **QA Lead / Test Architect** | Senior QA Specialist | **APPROVED** | `2026-09-12` |
| **Lead Software Engineer** | Backend Tech Lead | **APPROVED** | `2026-09-12` |
| **Product Owner / Project Manager** | Platform Director | **APPROVED** | `2026-09-12` |
