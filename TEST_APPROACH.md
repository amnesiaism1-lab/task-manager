# CHIẾN LƯỢC & PHƯƠNG PHÁP TIẾP CẬN KIỂM THỬ — TEST APPROACH & STRATEGY
## Dự án: Task Manager (Jira-Style Enterprise Multi-Tenant Platform)
### Tiêu chuẩn tham chiếu: ISTQB® CTAL-TA v4.0 / CTAL-TTA v4.0 / CTAL-TAE v2.0 / CTAL-AT v2.0 & ISO/IEC/IEEE 29119-3

---

## BẢNG KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL)

| Thuộc tính | Giá trị |
|---|---|
| **Mã tài liệu** | `TM-TAS-2026-V2.0-ULTRA` |
| **Phiên bản** | `2.0 — Comprehensive Test Approach & Automation Strategy` |
| **Ngày ban hành** | `2026-09-12` |
| **Tác giả / Vị trí** | Test Architect / Lead Automation Engineer (Chứng chỉ ISTQB® CTAL-TAE / CTAL-TTA) |
| **Người phê duyệt** | QA Lead, Lead Software Engineer, Product Owner |
| **Trạng thái** | Phê duyệt chính thức để áp dụng toàn dự án (Approved Baseline) |
| **Tài liệu căn cứ** | [`TEST_BASIS.md`](TEST_BASIS.md), [`MASTER_TEST_PLAN.md`](MASTER_TEST_PLAN.md), [`SRS_TASK_MANAGER.md`](SRS_TASK_MANAGER.md), [`TASK_MANAGER_ERD.puml`](TASK_MANAGER_ERD.puml) |

### Lịch sử sửa đổi (Revision History)
| Phiên bản | Ngày | Tác giả | Nội dung sửa đổi |
|---|---|---|---|
| `0.1` | 2026-09-11 | Test Architect | Khởi thảo phương pháp tiếp cận Agile Testing & Test Automation |
| `0.9` | 2026-09-12 | QA Lead | Tích hợp 4 Góc phần tư Agile (Q1-Q4), Kỹ thuật thiết kế ca kiểm thử ISTQB |
| `1.0` | 2026-09-12 | Test Architect | Hoàn thiện kiến trúc TAA, kịch bản Concurrency/Performance và Ma trận RTM |
| `2.0` | 2026-09-12 | Test Architect | **Mở rộng chuyên sâu**: Bổ sung Decision Tables 3 & 4 (Issue Security & Screen Scheme), Cây chuyển đổi FSM, Ma trận All-Pairs Combinatorial, Mocking Harness, Deterministic Concurrency Harness, và OWASP ASVS L2 Checklist. |

---

## 1. TỔNG QUAN PHƯƠNG PHÁP TIẾP CẬN (TESTING PHILOSOPHY & PRINCIPLES)

Chiến lược kiểm thử của dự án **Task Manager** được xây dựng trên 5 nguyên lý cốt lõi của công nghệ kiểm thử hiện đại:
1. **Toàn Đội Ngũ Cùng Chịu Trách Nhiệm Chất Lượng (Whole-Team Approach):** Developer, QA, PO và DevOps cùng cộng tác từ giai đoạn đặc tả User Story Grooming đến khâu phát hành Production.
2. **Dịch Chuyển Sang Trái (Shift-Left Testing):** Kiểm thử tĩnh (Static Review) đặc tả SRS và ERD từ sớm; kiểm tra chất lượng mã nguồn tự động qua `oxlint` và `tsc --noEmit` trước khi merge code.
3. **Kiểm Thử Dựa Trên Rủi Ro (Risk-Based Testing - RBT):** Phân bổ ngân sách thời gian và độ sâu kiểm thử dựa trên đánh giá rủi ro (ưu tiên hàng đầu cho Cô lập Multi-tenant, Concurrency Race Conditions và FSM Engine).
4. **Tự Động Hóa Kiểm Thử Thực Dụng (Pragmatic Test Automation):** Xây dựng tháp kiểm thử kim tự tháp (70% Unit, 20% Integration/API, 10% E2E UI), ưu tiên API ổn định, tốc độ cao.
5. **Tính Lặp Lại Xác Định Của Kiểm Thử Đồng Thời (Deterministic Concurrency Testing):** Thiết lập cơ chế khóa đồng bộ (Barrier Synchronization) để kích hoạt các kịch bản Race Condition một cách có thể tái lặp 100%.

---

## 2. MÔ HÌNH 4 GÓC PHẦN TƯ KIỂM THỬ AGILE (AGILE TESTING QUADRANTS)

```
                                  HƯỚNG NGHIỆP VỤ (Business-Facing)
                                                 ^
                                                 |
                   GÓC PHẦN TƯ Q2                |                GÓC PHẦN TƯ Q3
              (Functional / Acceptance)          |          (Exploratory & Usability)
                                                 |
        - Functional Automated API Tests         |  - Exploratory Testing (SBTM Charters)
        - Story Acceptance Tests (BDD/Gherkin)   |  - Persona-Based Testing (8 Personas)
        - Workflow & Business Rules Tests        |  - User Journey Alpha/Beta Testing
        - End-to-End User Flow Tests             |  - UI/UX & Responsive Evaluation
                                                 |
  HỖ TRỢ ĐỘI NGŨ --------------------------------+--------------------------------> ĐÁNH GIÁ SẢN PHẨM
  (Supporting Team)                              |                                  (Critique Product)
                   GÓC PHẦN TƯ Q1                |                GÓC PHẦN TƯ Q4
               (Unit & Component)                |           (Non-Functional & Quality)
                                                 |
        - Unit Tests (Vitest/Jest)               |  - Security Penetration (OWASP Top 10)
        - Component Integration Tests (CIT)      |  - IDOR & Cross-Tenant Data Audit
        - Static Analysis (oxlint, tsc)          |  - Concurrency Stress Testing (k6)
        - DB Schema Constraints Verification     |  - Performance & Latency Benchmark
                                                 |  - SSRF & Webhook Security Scan
                                                 v
                                 HƯỚNG CÔNG NGHỆ (Technology-Facing)
```

### 2.1. Góc Phần Tư Q1: Hướng Công Nghệ — Hỗ Trợ Đội Ngũ (Technology-Facing, Supporting the Team)
- TDD cho các thuật toán lõi: Lexorank positioning, Cycle Detector, Date & Remaining Estimate calculations, Permission Evaluator.
- Unit Tests cho Custom Pipes, Interceptors, Filters, DTO Validators của NestJS.
- Kiểm tra static typing (`tsc --noEmit`) và quy tắc code style (`oxlint`) đạt 0 error, 0 warning.

### 2.2. Góc Phần Tư Q2: Hướng Nghiệp Vụ — Hỗ Trợ Đội Ngũ (Business-Facing, Supporting the Team)
- Automated Integration Tests sử dụng Supertest kiểm tra trọn vẹn vòng đời các đối tượng (CRUD Projects, Issues, Sprints, Workflows).
- Kiểm thử FSM Engine (Transitions, Guards: `requires_fields` và `json_logic`, Deny-overrides-allow).
- Kiểm thử các ràng buộc nghiệp vụ (Single Active Sprint `TB-BR-02`, Resolution consistency, No Self-links).

### 2.3. Góc Phần Tư Q3: Hướng Nghiệp Vụ — Đánh Giá Sản Phẩm (Business-Facing, Critique the Product)
- Session-Based Test Management (SBTM) với các khung thời gian Timeboxing 45-60 phút.
- Phân vai người dùng toàn diện (8 Personas: Org Owner, Project Lead, Scrum Master, Developer, QA Tester, PO, Restricted Viewer, System Admin).
- Đánh giá khả năng đáp ứng giao diện (Responsiveness) và tính tiện dụng của thao tác kéo thả trên Board.

### 2.4. Góc Phần Tư Q4: Hướng Công Nghệ — Đánh Giá Sản Phẩm (Technology-Facing, Critique the Product)
- Automated Security Testing: IDOR scan trên toàn bộ 22 Controllers, Token replay, brute-force rate limit, SSRF Webhook scan.
- Concurrency Testing: Kích hoạt đồng thời 50 requests vào cùng một Issue để kiểm tra Optimistic Locking `409 Conflict`.
- Performance Load Testing: Sử dụng k6 đo đạc thời gian phản hồi (Response time) và khả năng mở rộng ở mức 500-1000 rps.

---

## 3. QUY TRÌNH SHIFT-LEFT & KIỂM THỬ LIÊN TỤC (SHIFT-LEFT & CONTINUOUS TESTING)

```
 [User Story] ---> [Static Analysis] ---> [Pre-Commit Hook] ---> [Pull Request CI] ---> [Continuous Test Stage]
 (3 Amigos Review) (oxlint / tsc)         (Lint-Staged)          (Unit + API Tests)     (Docker E2E + Security)
```

1. **Giai đoạn Rà soát Đặc tả (3 Amigos: PO - Dev - QA):** QA tham gia review User Story và Acceptance Criteria ngay từ giai đoạn Grooming; xác định các trường hợp biên (Edge cases) và Invariants trước khi viết code.
2. **Giai đoạn Pre-Commit & Linter Gate:** Thiết lập git hook tự động chạy `oxlint` và `tsc --noEmit`. Chặn hoàn toàn việc commit mã nguồn nếu có lỗi biên dịch hoặc cảnh báo vi phạm chuẩn.
3. **Giai đoạn Tích Hợp Liên Tục (CI Pipeline):** Mỗi khi tạo Pull Request, hệ thống CI tự động khởi chạy môi trường Test Database độc lập, chạy toàn bộ bộ kiểm thử Unit & Integration Tests. PR chỉ được phép merge khi $100\%$ ca kiểm thử đều Passed.

---

## 4. CÁC KỸ THUẬT THIẾT KẾ CA KIỂM THỬ CHUẨN ISTQB (TEST DESIGN TECHNIQUES)

### 4.1. Nhóm Kỹ thuật Hộp Đen (Black-Box Techniques)

#### 4.1.1. Phân Vùng Tương Đương (EP) & Phân Tích Giá Trị Biên (BVA)

| Trường Dữ liệu / Tham số | Lớp Tương Đương Hợp Lệ (Valid EP) | Lớp Tương Đương Không Hợp Lệ (Invalid EP) | Giá trị Biên Cần Kiểm Thử (Boundary Values) |
|---|---|---|---|
| **Project Key** | Chuỗi chữ cái viết hoa dài từ 2 đến 10 ký tự (`[A-Z]{2,10}`) | Chứa số, ký tự đặc biệt, chữ thường, rỗng, $>10$ ký tự | $1\text{ char}$ (Invalid), $2\text{ chars}$ (Min Valid), $10\text{ chars}$ (Max Valid), $11\text{ chars}$ (Invalid) |
| **WIP Limit (Cột Board)** | Số nguyên dương từ 1 đến 100 | Số âm, số 0, số thập phân, chuỗi chữ, $>100$ | $0$ (Invalid), $1$ (Min Valid), $100$ (Max Valid), $101$ (Invalid) |
| **Dung lượng File Đính kèm** | File có kích thước từ $1\text{ Byte}$ đến $25\text{ MB}$ | File $0\text{ Byte}$, File $> 25\text{ MB}$ | $0\text{ B}$ (Invalid), $1\text{ B}$ (Valid), $25\text{ MB}$ (Valid), $25\text{ MB} + 1\text{ B}$ (Invalid) |
| **Story Points** | Số thực dương $\ge 0$ (vd: $0.5, 1, 2, 3, 5, 8, 13, 20$) | Số âm ($-1$), ký tự chữ cái | $-0.1$ (Invalid), $0$ (Valid), $0.5$ (Valid), $100$ (Valid) |
| **Pagination Limit** | Số nguyên từ 1 đến 100 | Số $\le 0$, số $> 100$ | $0$ (Invalid), $1$ (Valid), $100$ (Valid), $101$ (Invalid) |
| **Mật khẩu Đăng ký** | 8 đến 72 ký tự, đủ hoa, thường, số, ký tự đặc biệt | Dưới 8 ký tự, trên 72 ký tự, thiếu 1 trong 4 nhóm ký tự | 7 ký tự (Invalid), 8 ký tự (Valid), 72 ký tự (Valid), 73 ký tự (Invalid) |

#### 4.1.2. Kiểm Thử Bảng Quyết Định (Decision Table Testing)

##### Bảng Quyết Định 1: Đánh Giá Quyền Chuyển Trạng Thái (Transition Permission: Deny Overrides Allow)
| Điều kiện (Conditions) | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|---|:---:|:---:|:---:|:---:|
| User có Role khớp với Rule `ALLOW` | **Y** | **Y** | **N** | **N** |
| User có Role khớp với Rule `DENY` | **N** | **Y** | **N** | **Y** |
| Transition Guard đánh giá (Passed) | **Y** | **Y** | **Y** | **Y** |
| **Hành động Kết quả (Actions):** | | | | |
| Cho phép thực hiện Chuyển trạng thái | **TRUE (200 OK)** | **FALSE (403 Forbidden)** | **FALSE (403 Forbidden)** | **FALSE (403 Forbidden)** |

##### Bảng Quyết Định 2: Điều Kiện Khởi Động Sprint (Start Sprint Logic)
| Điều kiện (Conditions) | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|---|:---:|:---:|:---:|:---:|
| User có quyền `MANAGE_SPRINTS` | **Y** | **Y** | **N** | **Y** |
| Board là loại Scrum (`board_type = 'scrum'`) | **Y** | **Y** | **Y** | **N (Kanban)** |
| Board hiện chưa có Active Sprint nào (`active_sprints = 0`) | **Y** | **N (Đã có 1 Active)** | **Y** | **Y** |
| Sprint ở trạng thái `planned` | **Y** | **Y** | **Y** | **Y** |
| **Hành động Kết quả (Actions):** | | | | |
| Chuyển trạng thái Sprint sang `active` | **THÀNH CÔNG (200)** | **LỖI (409 Conflict)** | **LỖI (403 Forbidden)** | **LỖI (422 Unprocessable)** |

##### Bảng Quyết Định 3: Đánh Giá Quyền Truy Cập Issue Bảo Mật (Issue Security Grants Evaluation)
| Điều kiện (Conditions) | Rule 1 | Rule 2 | Rule 3 | Rule 4 | Rule 5 |
|---|:---:|:---:|:---:|:---:|:---:|
| User có quyền `BROWSE_PROJECT` | **Y** | **Y** | **Y** | **N** | **Y** |
| Issue có gán `security_level_id` | **N (Public)** | **Y** | **Y** | **Y/N** | **Y** |
| User thỏa mãn Security Grant (Role/Group/Assignee/Reporter) | **—** | **Y** | **N** | **Y** | **N** |
| **Hành động Kết quả (Actions):** | | | | | |
| Cho phép xem Issue & thông tin liên quan | **CHO PHÉP (200)** | **CHO PHÉP (200)** | **CHẶN (404/403)** | **CHẶN (403)** | **CHẶN (404/403)** |

##### Bảng Quyết Định 4: Phân Giải Màn Hình Thao Tác (Screen Scheme Operation Resolution)
| Điều kiện (Conditions) | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|---|:---:|:---:|:---:|:---:|
| Thao tác yêu cầu (Operation) | **Create** | **Edit** | **View** | **Custom** |
| Sơ đồ có cấu hình riêng cho Operation này | **Y** | **N** | **Y** | **N** |
| **Hành động Kết quả (Actions):** | | | | |
| Màn hình được chọn để render | **Screen riêng Create** | **Default Screen** | **Screen riêng View** | **Default Screen** |

#### 4.1.3. Kiểm Thử Chuyển Đổi Trạng Thái (State Transition Testing)
Áp dụng cho Máy trạng thái Issue Workflow FSM:

```
                    [S1: ToDo] (Initial)
                        |
               [START]  |
                        v
                 [S2: In Progress]
                   /           \
   [REQUEST_REVIEW] /             \ [CLOSE]
                   v               v
           [S3: In Review]    [S5: Closed] (Terminal)
              /         \          ^
   [APPROVE] /           \ [REJECT]| [CLOSE]
            v             v        |
      [S4: Done] --------> [S2: In Progress]
      (Terminal)  [REOPEN]
```

- **Tiêu chuẩn Độ phủ:**
  - **0-Switch Coverage (State Coverage):** Duyệt qua 100% tất cả 5 trạng thái đơn lẻ ($S_1, S_2, S_3, S_4, S_5$).
  - **1-Switch Coverage (Transition Pair Coverage):** Kiểm tra tất cả các cặp bước chuyển hợp lệ liên tiếp (vd: $S_1 \rightarrow S_2 \rightarrow S_3$, $S_2 \rightarrow S_3 \rightarrow S_4$, $S_3 \rightarrow S_4 \rightarrow S_2$).
  - **Round-Trip Coverage:** Kiểm tra các chu trình khép kín: $S_2 \rightarrow S_3 \rightarrow S_2$ (Review Reject) và $S_2 \rightarrow S_3 \rightarrow S_4 \rightarrow S_2$ (Reopen).
  - **Invalid Transition Coverage:** Thử nghiệm tất cả các bước chuyển bị cấm (như $S_1 \rightarrow S_4$, $S_1 \rightarrow S_5$) để xác minh mã lỗi `422/403`.

#### 4.1.4. Kiểm Thử Tổ Hợp Đa Tiêu Chí (Pairwise / Combinatorial Testing)
Áp dụng cho công cụ Tìm kiếm Nâng cao (Search Engine) với 8 yếu tố đầu vào:
- Yếu tố 1 (Project): `{All, Project-A, Project-B}`
- Yếu tố 2 (Issue Type): `{Bug, Story, Task, Epic}`
- Yếu tố 3 (Status): `{ToDo, InProgress, Done}`
- Yếu tố 4 (Priority): `{Highest, High, Medium, Low}`
- Yếu tố 5 (Assignee): `{Unassigned, CurrentUser, SpecificUser}`
- Yếu tố 6 (Resolution): `{Unresolved, Fixed, WontDo}`
- Yếu tố 7 (Label): `{None, Frontend, Backend}`
- Yếu tố 8 (Date Range): `{AllTime, Past7Days, Past30Days}`

Sử dụng thuật toán All-Pairs để rút gọn từ $3 \times 4 \times 3 \times 4 \times 3 \times 3 \times 3 \times 3 = 11,664$ tổ hợp xuống còn **32 ca kiểm thử tổ hợp tối ưu**, đảm bảo mọi cặp giá trị $(X, Y)$ đều được kiểm tra ít nhất 1 lần.

---

### 4.2. Nhóm Kỹ thuật Hộp Trắng (White-Box Techniques - CTAL-TTA)
- **Statement & Branch/Decision Coverage:** Đo lường độ phủ mã nguồn backend trên các dịch vụ lõi (`WorkflowEngineService`, `PermissionGuard`, `SprintService`, `CycleDetectorUtil`, `CorrelationIdInterceptor`). Chỉ tiêu: $\ge 85\%$ Branch Coverage.
- **Modified Condition/Decision Coverage (MC/DC):** Áp dụng cho các biểu thức logic phức tạp trong Transition Guards (JSONLogic) và đánh giá RBAC 3 tầng để đảm bảo mỗi điều kiện con độc lập quyết định kết quả chung.

---

### 4.3. Nhóm Kỹ thuật Dựa trên Kinh nghiệm (Experience-Based Techniques)

#### 4.3.1. Danh Mục Phỏng Đoán Lỗi (Error Guessing Checklist)
1. **Xung đột Concurrency:** Sửa cùng 1 Issue từ 2 tab trình duyệt; kéo thả 2 card vào cùng 1 khoảng rank Lexorank.
2. **Xóa Dữ liệu Quan hệ Phức tạp:** Xóa một Project Role đang được gán trong Permission Scheme hoặc đang gán cho Member.
3. **Mã Độc XSS trong Markdown/HTML:** Chèn payload `<script>`, `onerror` trong Issue Description, Comments, Project Name.
4. **Tham Chiếu Khóa Ngoại Rác (Orphan Records):** Xóa Project kiểm tra cascade/restrict các Issue, Board, Sprint tương ứng.
5. **SSRF trên Webhook:** Đăng ký webhook trỏ vào IP loopback hoặc AWS metadata `169.254.169.254`.

#### 4.3.2. Kiểm Thử Khám Phá Có Định Hướng (Session-Based Test Management - SBTM)
- Khung thời gian: Timebox 60 phút cho mỗi Charter.
- Ví dụ Charter: *"Khám phá tính năng gán Issue vào Sprint với vai trò Scrum Master khi Sprint đã đầy Story Points nhằm phát hiện lỗi tính toán Velocity và hiển thị cảnh báo."*

---

## 5. KIẾN TRÚC TỰ ĐỘNG HÓA KIỂM THỬ (TEST AUTOMATION ARCHITECTURE - TAA)

### 5.1. Mô hình Tháp Tự Động Hóa (Automation Pyramid)
```
                               / \
                              /   \
                             / E2E \       10% UI Tests (Playwright / User Journeys)
                            /  UI   \
                           /---------\
                          /   API &   \     20% Integration & API Tests (Supertest / Fast REST)
                         / Integration \
                        /---------------\
                       /      Unit       \   70% Unit Tests (Vitest / Business Logic / Guards)
                      /      Tests        \
                     +---------------------+
```

### 5.2. Khung Giả Lập Dịch Vụ Ngoại Vi (External Services Mocking Harness)
Nhằm đảm bảo bộ kiểm thử chạy nhanh, độc lập và ổn định trong môi trường CI/CD:
1. **Mock SMTP Server (Email Delivery):** Tích hợp MailHog / Nodemailer Mock để kiểm tra nội dung email verification, reset password và org invitations mà không cần gửi mail thật ra Internet.
2. **Mock Object Storage Provider (S3 / Blob):** Tích hợp MinIO / Local Directory Storage để kiểm tra upload/download attachment, kiểm tra checksum SHA-256 và chặn file độc hại.
3. **Mock Webhook Receiver:** Xây dựng Mock HTTP Server ghi nhận payload Webhook, xác thực chữ ký HMAC-SHA256 trong header `X-Hub-Signature-256` và giả lập mã lỗi mạng (HTTP 500, 503) để test cơ chế retry.

### 5.3. Khung Kiểm Thử Đồng Thời Xác Định (Deterministic Concurrency Testing Harness)
Để kiểm thử các lỗi Race Condition một cách chắc chắn và có thể tái lặp:
- Sử dụng kỹ thuật **Barrier Synchronization**: Khởi tạo mảng Promise đồng thời, giữ các request tại điểm chặn (latch) và phóng thích cùng 1 microsecond bằng `Promise.all`:
```typescript
// Deterministic Race Condition Trigger
const results = await Promise.all(
  Array.from({ length: 50 }).map((_, i) =>
    apiClient.patch(`/issues/${issueId}`, { summary: `Update ${i}`, expectedVersion: 1 })
  )
);
const successCount = results.filter(r => r.status === 200).length;
const conflictCount = results.filter(r => r.status === 409).length;
expect(successCount).toBe(1);
expect(conflictCount).toBe(49);
```

### 5.4. Chiến Lược Cô Lập Dữ Liệu Kiểm Thử (Test Isolation & Idempotency)
1. **Dynamic Tenant Factory:** Mỗi Test Suite tự động sinh một Organization độc lập (`org-test-${randomUUID}`). Dữ liệu test hoàn toàn cô lập, cho phép chạy song song (Parallel Execution) không xung đột.
2. **Database Clean-Up:** Sử dụng Transaction Rollback sau mỗi test case hoặc dọn dẹp sạch bằng `afterAll` hook.

---

## 6. CHIẾN LƯỢC KIỂM THỬ CHUYÊN BIỆT (SPECIALIZED TEST STRATEGIES)

### 6.1. Chiến Lược Kiểm Thử Bảo Mật (OWASP ASVS Level 2 Checklist)
- **V1: Architecture & Threat Modeling:** Xác minh nguyên tắc phòng thủ theo chiều sâu (Defense-in-Depth), cô lập hoàn toàn giữa các tenant.
- **V2: Authentication:** Bắt buộc mật khẩu Argon2id, JWT token ngắn hạn (15m), Refresh Token Rotation (RTR), chống Brute Force rate limiting.
- **V3: Session Management:** Cơ chế thu hồi phiên tức thì từ xa (`auth_sessions.status=revoked`), kiểm tra header cookie `SameSite=Strict, Secure, HttpOnly`.
- **V4: Access Control:** Chống lỗ hổng IDOR trên 100% endpoints; kiểm tra ma trận 3-Tier RBAC; kiểm tra Issue Security Scheme grant; rule Deny ghi đè Allow.
- **V5: Malicious Input Handling:** Chống Stored XSS trong Markdown, SQL Injection trong Search query, chống SSRF trên Webhook URLs.
- **V6: Cryptography:** Kiểm tra chữ ký HMAC-SHA256 trên Webhooks; bảo vệ không lưu plain text token/mật khẩu trong database hoặc log.

### 6.2. Chiến Lược Kiểm Thử Chịu Lỗi & Tự Phục Hồi (Chaos & Resilience Strategy)
- **Database Failover Simulation:** Ngắt kết nối PostgreSQL đột ngột trong lúc đang commit transition issue $\rightarrow$ Xác minh giao dịch rollback toàn vẹn, không để lại dữ liệu dở dang (ACID).
- **Redis Crash Simulation:** Giả lập Redis cache tạm ngưng $\rightarrow$ API tự động chuyển sang đọc trực tiếp từ PostgreSQL và ghi log cảnh báo; khi Redis hoạt động lại, hệ thống tự động tái lập kết nối.
- **Outbox Worker Resilience:** Giả lập Worker Process bị kill đột ngột khi đang xử lý event $\rightarrow$ Worker mới khởi động sẽ phát hiện event ở trạng thái `pending` và tiếp tục xử lý (At-Least-Once Delivery).

---

## 7. MA TRẬN TRUY VẾT YÊU CẦU & KIỂM THỬ (REQUIREMENTS TRACEABILITY MATRIX - RTM)

$$\text{SRS Feature ID} \longleftrightarrow \text{Test Basis ID} \longleftrightarrow \text{Test Case ID} \longleftrightarrow \text{Automation Script} \longleftrightarrow \text{Defect Tracking}$$

| SRS Requirement | Test Basis ID | Test Condition | Test Case ID | Test Type & Kỹ thuật | File Kịch bản Tự động |
|---|---|---|---|---|---|
| `REQ-AUTH-02` | `TB-REQ-02` | Đăng nhập hợp lệ và cấp phiên JWT | `TC-AUTH-004` | Component / Use Case | `backend/test/auth.e2e-spec.ts` |
| `REQ-AUTH-03` | `TB-REQ-03` | Refresh Token Rotation và phát hiện Replay | `TC-AUTH-006` | Security / State Transition | `backend/test/auth.e2e-spec.ts` |
| `REQ-PROJ-01` | `TB-REQ-16` | Tạo dự án và cấp bộ đếm issue key | `TC-PRJ-001` | System / Use Case | `backend/test/project.e2e-spec.ts` |
| `REQ-SPRINT-03` | `TB-BR-02` | Chặn kích hoạt 2 active sprint trên 1 board | `TC-SPR-004` | Concurrency / Decision Table | `backend/test/sprint.e2e-spec.ts` |
| `REQ-ISSUE-06` | `TB-REQ-36` | Thực thi Transition và kiểm tra Optimistic Lock | `TC-ISS-004` | System / State Transition | `backend/test/issue-fsm.e2e-spec.ts` |
| `REQ-CONC-01` | `TB-BR-07` | Đua lệnh cập nhật issue version cũ nhận 409 | `TC-CONC-001` | Concurrency / Stress | `scripts/uat_comprehensive_suite.mjs` |
| `REQ-SEC-01` | `TB-SEC-02` | Chặn truy cập chéo dữ liệu giữa các Tenant | `TC-SEC-PEN-001`| Security / IDOR Penetration | `scripts/uat_comprehensive_suite.mjs` |
| `REQ-WEBHOOK-01`| `TB-BR-13` | Chặn URL Webhook trỏ tới IP private / SSRF | `TC-SEC-SSRF-001`| Security / SSRF Guard | `scripts/uat_comprehensive_suite.mjs` |

---

## 8. PHÊ DUYỆT CHIẾN LƯỢC (FORMAL APPROVAL)

| Chức danh | Đại diện Ký duyệt | Trạng thái / Chữ ký | Ngày phê duyệt |
|---|---|---|---|
| **Test Architect / QA Lead** | Senior Test Architect | **APPROVED** | `2026-09-12` |
| **Lead Software Engineer** | Backend Tech Lead | **APPROVED** | `2026-09-12` |
| **Product Owner / Project Manager** | Platform Director | **APPROVED** | `2026-09-12` |
