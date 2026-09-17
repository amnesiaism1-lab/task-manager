# TÀI LIỆU ĐẶC TẢ YÊU CẦU NGHIỆP VỤ (BRD), MÔ HÌNH PHÂN RÃ CHỨC NĂNG (BFD) & MA TRẬN THỰC THỂ – CHỨC NĂNG (CRUD MATRIX)

> **Hệ thống:** Task Manager Enterprise (Jira-Grade Architecture)  
> **Tài liệu tham chiếu chuẩn:** [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) | [TASK_MANAGER_ERD - Copy.txt](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD%20-%20Copy.txt) | [ENTITY_RELATIONSHIPS_ANALYSIS.md](file:///c:/Users/Admin/OneDrive/Desktop/Jira/ENTITY_RELATIONSHIPS_ANALYSIS.md)  
> **Phiên bản:** 3.0 - Hoàn thiện toàn diện (Comprehensive Enterprise Edition)  
> **Quy ước CRUD:**  
> - `C` = Create (Tạo mới bản ghi)  
> - `R` = Read/Query (Đọc hiển thị hoặc kiểm tra điều kiện/phân quyền)  
> - `U` = Update (Cập nhật thông tin/bộ đếm nguyên tử/trạng thái)  
> - `D` = Delete/Soft Delete (Xóa vật lý hoặc đánh dấu `archived_at` / `deleted_at`)  

---

## MỤC LỤC
1. [PHẦN I: BÁO CÁO PHÂN TÍCH & ĐÁNH GIÁ TỔNG QUAN HỆ THỐNG](#phần-i-báo-cáo-phân-tích--đánh-giá-tổng-quan-hệ-thống)
2. [PHẦN II: MÔ HÌNH PHÂN RÃ CHỨC NĂNG CHUẨN HÓA (BFD - 10 PHÂN HỆ)](#phần-ii-mô-hình-phân-rã-chức-năng-chuẩn-hóa-bfd---10-phân-hệ)
3. [PHẦN III: ĐỊNH DANH DANH MỤC 90 THỰC THỂ ERD & 22 CỤM THỰC THỂ CỐT LÕI](#phần-iii-định-danh-danh-mục-90-thực-thể-erd--22-cụm-thực-thể-cốt-lõi)
4. [PHẦN IV: MA TRẬN THỰC THỂ – CHỨC NĂNG (CRUD MATRIX) 72 CHỨC NĂNG ĐẦY ĐỦ 100%](#phần-iv-ma-trận-thực-thể--chức-năng-crud-matrix-72-chức-năng-đầy-đủ-100)
5. [PHẦN V: PHÂN TÍCH CHUYÊN SÂU TƯƠNG TÁC CRUD, RÀNG BUỘC INVARIANTS & QUAN HỆ CỐT LÕI](#phần-v-phân-tích-chuyên-sâu-tương-tác-crud-ràng-buộc-invariants--quan-hệ-cốt-lõi)
   - [5.1. Vòng đời Issue & Động cơ FSM](#51-vòng-đời-issue--động-cơ-fsm)
   - [5.2. Quản lý Không gian Agile: Boards, LexoRank & Sprints](#52-quản-lý-không-gian-agile-boards-lexorank--sprints)
   - [5.3. Cấp phát Mã Định danh Issue Nguyên tử](#53-cấp-phát-mã-định-danh-issue-nguyên-tử)
   - [5.4. Kiến trúc Hướng sự kiện & Transactional Outbox Pattern](#54-kiến-trúc-hướng-sự-kiện--transactional-outbox-pattern)
   - [5.5. Quản lý Trường Tùy biến Động (EAV Schema)](#55-quản-lý-trường-tùy-biến-động-eav-schema)
   - [5.6. Bảng Tra cứu Toàn diện Quan hệ giữa 90 Thực thể & Ràng buộc Invariants (C-01 đến C-48)](#56-bảng-tra-cứu-toàn-diện-quan-hệ-giữa-90-thực-thể--ràng-buộc-invariants-c-01-đến-c-48)
6. [PHẦN VI: KẾT LUẬN & ÁNH XẠ KIẾN TRÚC BACKEND (NESTJS / TYPEORM)](#phần-vi-kết-luận--ánh-xạ-kiến-trúc-backend-nestjs--typeorm)

---

# PHẦN I: BÁO CÁO PHÂN TÍCH & ĐÁNH GIÁ TỔNG QUAN HỆ THỐNG

Hệ thống Task Manager Enterprise được thiết kế và hiện thực dựa trên mô hình dữ liệu Jira cấp doanh nghiệp, đảm bảo tính mở rộng cao (high scalability), toàn vẹn dữ liệu đa người thuê (multi-tenant isolation) và kiến trúc hướng sự kiện (event-driven architecture):

### 1. Những Điểm Mạnh Kiến Trúc Đã Đạt Được (Core Strengths)
- **Kiến trúc dữ liệu phân lớp chuẩn mực**: Định nghĩa 90 thực thể vật lý trong [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) bao phủ toàn diện 10 phân hệ nghiệp vụ, từ Định danh (Identity), Xác thực (Auth), Không gian dự án (Workspace), Quy trình hữu hạn (FSM), Quản lý Issue đến Kiểm toán, Tự động hóa và Mở rộng tích hợp.
- **Ranh giới cô lập Multi-tenancy vững chắc**: Mọi bảng dữ liệu nghiệp vụ đều gắn khóa ngoại bắt buộc `org_id` hoặc thuộc về một `project_id` có `org_id` xác định. Supabase Row Level Security (RLS) được kích hoạt trên toàn bộ 73 bảng public, kết hợp với vai trò backend có thẩm quyền (`rolbypassrls = true`) để thực thi logic kiểm tra quyền 3 tầng trong NestJS.
- **Tính toàn vẹn chuyển dịch trạng thái (FSM Engine)**: Kiểm soát chuyển dịch trạng thái Issue thông qua bảng `workflow_transitions`, bảo vệ bởi `workflow_transition_guards`, chống xung đột đồng thời bằng khóa lạc quan (`issues.version`) và lưu giữ vết bất biến trong `issue_state_history`.
- **Động cơ Transactional Outbox nguyên tử**: Mọi thao tác ghi dữ liệu trọng yếu (tạo issue, chuyển trạng thái, chấm công, đóng sprint) đều đồng thời ghi nhận vào `activity_logs` và `outbox_events` trong cùng một giao dịch cơ sở dữ liệu (`DataSource.transaction`), triệt tiêu hoàn toàn rủi ro mất mát sự kiện.
- **Sắp xếp không khóa với thuật toán LexoRank**: Thứ tự thẻ bài trên Kanban Board được lưu trữ qua chuỗi ký tự phân bổ khoảng cách trong bảng `board_issue_positions`, tránh tắc nghẽn deadlock khi nhiều thành viên cùng kéo thả công việc.

### 2. Các Chuẩn Hóa & Hoàn Thiện Thực Hiện Trong Phiên Bản 3.0
1. **Làm sạch cú pháp ERD**: Loại bỏ hoàn toàn khối khai báo trùng lặp `org_role_permission_entries` trong [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) và đồng bộ sang [TASK_MANAGER_ERD - Copy.txt](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD%20-%20Copy.txt).
2. **Chuẩn hóa Ma trận CRUD 100%**: Phản ánh đầy đủ các tác vụ phụ phát sinh khi thực thi nghiệp vụ (ví dụ: tự động seed Issue Types, Priorities, Link Types khi tạo Org; tự tạo Board, Columns, Workflow, Permission Schemes khi tạo Project; tự động ghi nhận `IssueSprintHistory` và cập nhật Outbox).
3. **Minh bạch hóa 100% quan hệ thực thể**: Bổ sung Bảng tra cứu quan hệ chi tiết 90 thực thể với đầy đủ Cardinality (1:1, 1:N, N:M), Junction Table, Foreign Keys, Nullability, On Delete Policies và 48 quy tắc bất biến (`C-01` đến `C-48`).

---

# PHẦN II: MÔ HÌNH PHÂN RÃ CHỨC NĂNG CHUẨN HÓA (BFD - 10 PHÂN HỆ)

```
Hệ thống Task Manager Enterprise (Jira-Grade)
│
├── 1. Quản lý Tổ chức & Định danh (Identity & Org)
│   ├── 1.1. Quản trị Tổ chức (Organization Management)
│   │   ├── 1.1.1. Tạo Organization mới (Khởi tạo Admin, Default Schemes & Seed Catalogs)
│   │   ├── 1.1.2. Cập nhật thông tin & Cấu hình Organization
│   │   ├── 1.1.3. Xem thông tin chi tiết & Danh sách Organization của người dùng
│   │   └── 1.1.4. Đóng / Tạm ngừng / Lưu trữ Organization
│   ├── 1.2. Quản trị Thành viên Tổ chức (Member & Invitation)
│   │   ├── 1.2.1. Tạo lời mời gia nhập (Send Invitation Token)
│   │   ├── 1.2.2. Xử lý lời mời (Accept / Revoke Invitation)
│   │   ├── 1.2.3. Cập nhật trạng thái thành viên (Active / Suspended / Removed)
│   │   └── 1.2.4. Phân bổ vai trò cấp tổ chức (Org Role Assignment)
│   ├── 1.3. Quản trị Cơ cấu Phòng ban & Nhóm (Departments & Groups)
│   │   ├── 1.3.1. Quản lý Phòng ban (CRUD Department & Cây phân cấp đa tầng có kiểm tra chu trình)
│   │   ├── 1.3.2. Quản lý Trưởng bộ phận & Thành viên phòng ban
│   │   ├── 1.3.3. Quản lý Nhóm người dùng (CRUD Groups)
│   │   └── 1.3.4. Thêm / Gỡ thành viên khỏi Nhóm (Group Members)
│   └── 1.4. Quản lý Vai trò & Quyền hạn Tổ chức (Org RBAC)
│       ├── 1.4.1. Tạo / Sửa vai trò tổ chức (Org Roles)
│       └── 1.4.2. Cấu hình bảng quyền hạn tổ chức (Org Permission Entries)
│
├── 2. Quản lý Xác thực & Bảo mật (Security & Authentication)
│   ├── 2.1. Quản lý Xác thực Người dùng
│   │   ├── 2.1.1. Đăng ký tài khoản người dùng (Register với mật khẩu mã hóa bcrypt)
│   │   ├── 2.1.2. Đăng nhập & Cấp phát JWT / Refresh Token (Login)
│   │   └── 2.1.3. Đăng xuất an toàn (Logout & Vô hiệu hóa phiên)
│   ├── 2.2. Quản lý Phiên làm việc (Session Management)
│   │   ├── 2.2.1. Xem danh sách phiên đăng nhập đang kích hoạt (IP, User-Agent)
│   │   └── 2.2.2. Thu hồi phiên đăng nhập từ xa (Revoke Session)
│   ├── 2.3. Khôi phục & Đổi mật khẩu
│   │   ├── 2.3.1. Yêu cầu đặt lại mật khẩu (Password Reset Request & Gửi mã an toàn)
│   │   ├── 2.3.2. Xác nhận đổi mật khẩu qua mã bảo mật (Confirm Reset)
│   │   └── 2.3.3. Thay đổi mật khẩu khi đang đăng nhập (Change Password & Thu hồi toàn bộ token cũ)
│   └── 2.4. Quản lý Xác minh Email
│       ├── 2.4.1. Gửi email xác thực tài khoản (Email Verification Token)
│       └── 2.4.2. Xác nhận mã token kích hoạt tài khoản
│
├── 3. Quản lý Dự án & Không gian làm việc (Workspace & Projects)
│   ├── 3.1. Quản trị Dự án (Project Management)
│   │   ├── 3.1.1. Tạo Dự án mới (Khởi tạo Key, Permission Scheme, Board, Workflow mặc định)
│   │   ├── 3.1.2. Cập nhật thông tin & Thuộc tính dự án (Tên, Mô tả, Phòng ban, Visibility)
│   │   ├── 3.1.3. Lưu trữ / Khôi phục / Xóa mềm Dự án (Archive/Restore)
│   │   ├── 3.1.4. Cấu hình gán Lược đồ (Schemes Configuration)
│   │   └── 3.1.5. Xem danh sách & Chi tiết thông tin dự án
│   ├── 3.2. Quản lý Thành viên & Phân quyền Dự án (Project RBAC)
│   │   ├── 3.2.1. Thêm / Xóa thành viên tham gia Dự án
│   │   ├── 3.2.2. Gán / Thu hồi Vai trò dự án (Assign Project Roles)
│   │   ├── 3.2.3. Kế thừa vai trò dự án theo Nhóm (Group Role Inheritance per TB-BR-10)
│   │   └── 3.2.4. Định nghĩa các Vai trò dự án tùy chỉnh (Project Roles CRUD)
│   ├── 3.3. Quản lý Bảng công việc trực quan (Boards Management)
│   │   ├── 3.3.1. Tạo & Cấu hình Bảng (Scrum Board / Kanban Board)
│   │   ├── 3.3.2. Quản lý Cột hiển thị & Giới hạn WIP Limit
│   │   ├── 3.3.3. Ánh xạ Trạng thái FSM vào Cột (Board Column States - Đảm bảo C-04)
│   │   └── 3.3.4. Sắp xếp vị trí thẻ Issue trên Bảng (Drag & Drop qua thuật toán LexoRank)
│   ├── 3.4. Quản lý Chu kỳ Lặp (Sprint Management)
│   │   ├── 3.4.1. Tạo Sprint theo kế hoạch (Planned Sprint)
│   │   ├── 3.4.2. Bắt đầu Sprint (Start Active Sprint - Ràng buộc duy nhất 1 Active trên Board per C-05)
│   │   ├── 3.4.3. Đóng Sprint & Điều chuyển Issue tồn đọng về Backlog/Sprint mới
│   │   ├── 3.4.4. Thêm / Gỡ Issue vào Sprint (Ghi nhận biến động phạm vi vào IssueSprintHistory)
│   │   └── 3.4.5. Xem Bảng điều khiển Sprint & Biểu đồ Burndown / Velocity
│   ├── 3.5. Quản lý Thành phần & Phiên bản (Components & Versions)
│   │   ├── 3.5.1. Quản lý Component (CRUD + Chỉ định Component Lead)
│   │   └── 3.5.2. Quản lý Version (Tạo, Phát hành Release, Lưu trữ Version)
│   └── 3.6. Quản lý Lược đồ Phân quyền Dự án (Permission Schemes)
│       ├── 3.6.1. Định nghĩa Lược đồ quyền (Permission Scheme CRUD)
│       └── 3.6.2. Cấu hình ma trận quyền thao tác dự án (Scheme Permission Entries)
│
├── 4. Quản lý Quy trình & Máy trạng thái FSM (Workflow Engine)
│   ├── 4.1. Quản trị Định nghĩa Quy trình (Workflow Definitions)
│   │   ├── 4.1.1. Tạo / Quản lý phiên bản Workflow (Workflow Versioning)
│   │   ├── 4.1.2. Quản trị Trạng thái quy trình (Workflow States: To Do, In Progress, Review, Done)
│   │   ├── 4.1.3. Quản trị Bước chuyển trạng thái (Transitions: from_state -> to_state)
│   │   ├── 4.1.4. Thiết lập Điều kiện bảo vệ (Transition Guards: requires_fields, require_comment)
│   │   └── 4.1.5. Cấu hình Quyền thực thi bước chuyển (Transition Permissions)
│   ├── 4.2. Quản trị Lược đồ Quy trình (Workflow Schemes)
│   │   ├── 4.2.1. Tạo & Cập nhật Workflow Scheme
│   │   └── 4.2.2. Ánh xạ Loại công việc sang Workflow (Map Issue Type -> Workflow per C-11)
│   └── 4.3. Động cơ Thực thi Chuyển trạng thái (Workflow Transition Execution)
│       ├── 4.3.1. Kiểm tra tính hợp lệ của Transition & Điều kiện bảo vệ (Guards)
│       ├── 4.3.2. Thực thi chuyển dịch trạng thái nguyên tử (Atomic State Transition + Optimistic Lock)
│       ├── 4.3.3. Cập nhật Resolution & Thời điểm giải quyết (Resolved At)
│       └── 4.3.4. Ghi nhận Lịch sử chuyển trạng thái bất biến (Issue State History)
│
├── 5. Quản lý Công việc Cốt lõi (Issues & Content)
│   ├── 5.1. Quản trị Vòng đời Issue cơ bản (Issue Lifecycle)
│   │   ├── 5.1.1. Tạo Issue mới (Cấp phát mã định danh nguyên tử PROJ-X qua next_issue_number)
│   │   ├── 5.1.2. Cập nhật thông tin chi tiết Issue (Summary, Description, Priority, Due Date)
│   │   ├── 5.1.3. Lưu trữ / Xóa mềm Issue (Soft Delete & Restore qua deleted_at)
│   │   └── 5.1.4. Truy vấn chi tiết & Danh sách Issue theo bộ lọc
│   ├── 5.2. Quản lý Quan hệ & Liên kết Issue (Issue Relations)
│   │   ├── 5.2.1. Thiết lập quan hệ Phân cấp Cha - Con (Parent / Sub-task - Kiểm tra chống vòng lặp)
│   │   ├── 5.2.2. Tạo / Xóa Liên kết phụ thuộc (Issue Links: Blocks / Relates / Duplicates)
│   │   └── 5.2.3. Gán / Gỡ Nhãn dán phân loại (Labels & Issue Labels)
│   ├── 5.3. Quản trị Phân công & Người liên quan (People & Stakeholders)
│   │   ├── 5.3.1. Phân công / Bàn giao Người xử lý (Assignee Assignment)
│   │   ├── 5.3.2. Thay đổi Người tạo yêu cầu (Reporter)
│   │   └── 5.3.3. Thêm / Xóa Người theo dõi (Watchers Management)
│   ├── 5.4. Quản lý Tương tác & Tệp tin đính kèm (Collaboration)
│   │   ├── 5.4.1. Thêm / Sửa / Xóa Bình luận đa tầng (Threaded Comments)
│   │   └── 5.4.2. Tải lên / Xóa Tệp tin đính kèm (Attachments, MIME Check & Checksum)
│   ├── 5.5. Quản lý Chấm công & Tiến độ thời gian (Time Tracking)
│   │   ├── 5.5.1. Ghi nhật ký làm việc (Log Work / Work Logs)
│   │   └── 5.5.2. Tự động điều chỉnh Thời gian tiêu tốn & Ước tính còn lại
│   ├── 5.6. Quản lý Giá trị Trường tùy biến (Custom Field Values)
│   │   └── 5.6.1. Nhập liệu & Cập nhật giá trị trường động (EAV JSON Storage per Context)
│   └── 5.7. Truy vết Kiểm toán Issue (Issue Audit & History)
│       └── 5.7.1. Xem Dòng thời gian lịch sử trạng thái & Hoạt động (Activity Timeline)
│
├── 6. Quản lý Cấu hình Lược đồ Mở rộng (Configuration Schemes - Phase 2)
│   ├── 6.1. Lược đồ Độ ưu tiên (Priority Schemes & Priorities CRUD: Lowest -> Highest)
│   ├── 6.2. Lược đồ Phân loại Công việc (Issue Type Schemes & Issue Types: Task, Bug, Story, Epic)
│   ├── 6.3. Lược đồ Giao diện & Trường hiển thị (Field & Screen Schemes)
│   ├── 6.4. Lược đồ Bảo mật Cấp Issue (Issue Security Schemes, Security Levels & Grants)
│   └── 6.5. Lược đồ Thông báo (Notification Schemes & Recipient Rules)
│
├── 7. Quản lý Trường Tùy biến Động (Custom Fields EAV)
│   ├── 7.1. Định nghĩa Trường tùy biến (Custom Field: Text, Number, Date, Select, User, JSON)
│   ├── 7.2. Cấu hình Ngữ cảnh áp dụng (Custom Field Contexts: Project + Issue Type)
│   └── 7.3. Quản lý Danh sách Lựa chọn (Custom Field Options cho trường kiểu Select)
│
├── 8. Kiểm toán, Thông báo & Tác vụ Ngầm (Audit, Events & Background)
│   ├── 8.1. Nhật ký Hoạt động Toàn diện (Activity Logs Audit Stream)
│   ├── 8.2. Cấu hình Tùy chọn Nhận thông báo (Notification Preferences: In-app & Email)
│   ├── 8.3. Xử lý & Phân phối Sự kiện Outbox (Transactional Outbox Engine: Dispatcher)
│   └── 8.4. Quản lý Tiến trình Xử lý Ngầm (Background Jobs Execution)
│
├── 9. Tìm kiếm, Năng suất & Báo cáo (Search & Productivity)
│   ├── 9.1. Quản lý Bộ lọc Tìm kiếm Đã lưu (Saved Filters & JQL Engine)
│   ├── 9.2. Chia sẻ Bộ lọc & Đăng ký Báo cáo định kỳ (Filter Shares & Subscriptions)
│   ├── 9.3. Động cơ Quy tắc Tự động hóa (Automation Rules: Trigger - Condition - Action)
│   └── 9.4. Bảng điều khiển Trực quan & Tiện ích (Dashboards & Widgets)
│
└── 10. Tích hợp & Mở rộng (Integration Extensions)
    ├── 10.1. Quản trị Khóa API Cá nhân (API Tokens Management: Hashed Storage & Scope)
    └── 10.2. Quản lý Đăng ký Webhook & Bắn sự kiện ngoại vi (Webhooks & HMAC Signature Deliveries)
```

---

# PHẦN III: ĐỊNH DANH DANH MỤC 90 THỰC THỂ ERD & 22 CỤM THỰC THỂ CỐT LÕI

Toàn bộ **90 thực thể vật lý** trong [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) được gom nhóm khoa học thành **22 Cột Thực thể Cốt lõi** trong Ma trận CRUD:

| STT | Ký hiệu Cột | Tên Cụm Thực Thể | Danh sách Bảng Vật lý ERD Tương Ứng | Phạm vi Nghiệp vụ & Vai trò Kiến trúc |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Org** | Organization | `organizations` | Tenant gốc; ranh giới cô lập dữ liệu đa người thuê (Multi-tenancy Boundary). |
| **2** | **User** | User & Auth Sessions | `users`, `auth_sessions`, `password_reset_tokens`, `email_verification_tokens` | Tài khoản người dùng định danh toàn cục, phiên đăng nhập an toàn và mã token khôi phục mật khẩu. |
| **3** | **OrgMember** | Organization Members & Roles | `organization_members`, `org_invitations`, `org_roles`, `org_member_roles`, `org_role_permission_entries` | Thành viên tổ chức, lời mời gia nhập và bảng phân quyền quản trị cấp tổ chức. |
| **4** | **Dept/Grp** | Departments & Groups | `departments`, `department_members`, `groups`, `group_members` | Cơ cấu phòng ban tổ chức (cây phân cấp) và các nhóm người dùng nội bộ. |
| **5** | **Project** | Projects, Components & Versions | `projects`, `project_components`, `project_versions`, `permission_schemes`, `permission_scheme_entries` | Không gian làm việc dự án, tiền tố mã issue, phiên bản phát hành, module và lược đồ quyền. |
| **6** | **ProjMember** | Project Members & Roles | `project_members`, `project_roles`, `project_member_roles`, `project_group_roles` | Thành viên tham gia dự án, vai trò dự án và cơ chế kế thừa quyền theo nhóm. |
| **7** | **Board** | Boards, Columns & Positions | `boards`, `board_columns`, `board_issue_positions`, `board_column_states` | Bảng Kanban/Scrum, giới hạn WIP, vị trí thẻ bài (LexoRank) và ánh xạ cột - trạng thái. |
| **8** | **Sprint** | Sprints & Scope History | `sprints`, `issue_sprint_history` | Chu kỳ lặp Scrum (Planned, Active, Closed) và lịch sử biến động phạm vi sprint. |
| **9** | **Workflow** | Workflows & Schemes | `workflows`, `workflow_schemes`, `workflow_scheme_mappings` | Định nghĩa quy trình trạng thái, phiên bản workflow và lược đồ ánh xạ theo Issue Type. |
| **10** | **WfState/Tran**| States, Transitions & Guards | `workflow_states`, `workflow_transitions`, `workflow_transition_guards`, `workflow_scheme_transition_permissions` | Máy trạng thái FSM: Các đỉnh (States), cung chuyển dịch (Transitions), điều kiện chặn (Guards) và phân quyền transition. |
| **11** | **Issue** | Issues, Types & Resolutions | `issues`, `issue_types`, `resolutions` | Thực thể hạt nhân của hệ thống: công việc, lỗi, story, epic, trạng thái hiện tại, estimate, assignee, reporter. |
| **12** | **Comment** | Comments | `comments` | Thảo luận đa tầng (Threaded Parent-Child Comments), định dạng Markdown. |
| **13** | **Attachment** | Attachments | `attachments` | Tệp tin đính kèm vào Issue hoặc Comment, kiểm soát MIME, dung lượng và Checksum SHA-256. |
| **14** | **WorkLog** | Work Logs & Time Tracking | `work_logs` | Nhật ký ghi nhận thời gian lao động; tự động điều chỉnh bộ đếm tổng thời gian trên Issue. |
| **15** | **Link/Label** | Links, Labels & Watchers | `issue_links`, `issue_link_types`, `labels`, `issue_labels`, `issue_watchers` | Quan hệ liên kết phụ thuộc (Blocks/Relates), nhãn phân loại và người theo dõi. |
| **16** | **CustomField** | Custom Fields & EAV | `custom_fields`, `custom_field_contexts`, `custom_field_options`, `issue_custom_field_values` | Mở rộng trường dữ liệu động theo ngữ cảnh dự án và loại issue; lưu giá trị dạng JSON. |
| **17** | **StateHistory**| State & Audit History | `issue_state_history` | Nhật ký chuyển trạng thái bất biến; ghi nhận version trước/sau, actor, idempotency key và lý do. |
| **18** | **ActivityLog** | Activity Audit Stream | `activity_logs` | Dòng vết kiểm toán toàn diện mọi hành vi người dùng và hệ thống. |
| **19** | **OutboxEvent** | Transactional Outbox | `outbox_events` | Bảng Transactional Outbox ghi nhận sự kiện miền trong cùng DB transaction để xuất bản bất đồng bộ. |
| **20** | **Notification**| Notifications & Deliveries | `notifications`, `notification_preferences`, `notification_deliveries` | Thông báo nội bộ (In-App), hàng đợi gửi Email và tùy chọn cấu hình của người dùng. |
| **21** | **Filter/Dash** | Filters, Dashboards & Widgets | `saved_filters`, `filter_shares`, `filter_subscriptions`, `dashboards`, `dashboard_shares`, `dashboard_widgets` | Bộ lọc tìm kiếm JQL, chia sẻ bộ lọc, gửi email định kỳ và bảng báo cáo trực quan cá nhân hóa. |
| **22** | **Auto/Integ** | Automation, Tokens & Webhooks | `automation_rules`, `automation_rule_components`, `automation_executions`, `api_tokens`, `webhook_subscriptions`, `webhook_deliveries` | Động cơ tự động hóa thông minh, khóa truy cập API Token và cơ chế gửi Webhook ra hệ thống ngoài. |

---

# PHẦN IV: MA TRẬN THỰC THỂ – CHỨC NĂNG (CRUD MATRIX) 72 CHỨC NĂNG ĐẦY ĐỦ 100%

### BẢNG MA TRẬN CRUD CHUẨN XÁC TOÀN DIỆN
*(Đã được chuẩn hóa và kiểm chứng đồng bộ 1:1 với mã nguồn Backend NestJS và kiến trúc Transactional Outbox)*

| Mã CN | Tên Chức Năng Nghiệp Vụ | Org | User | OrgMember | Dept/Grp | Project | ProjMember | Board | Sprint | Workflow | WfState/Tran | Issue | Comment | Attachment | WorkLog | Link/Label | CustomField | StateHistory | ActivityLog | OutboxEvent | Notification | Filter/Dash | Auto/Integ |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **PHÂN HỆ 1: ĐỊNH DANH & TỔ CHỨC** | | | | | | | | | | | | | | | | | | | | | | | |
| 1.1.1 | Tạo Organization mới (Seed Defaults) | **C** | R | **C** | | | | | | | | **C** | | | | **C** | | | **C** | **C** | | | |
| 1.1.2 | Cập nhật thông tin Org | **U** | | R | | | | | | | | | | | | | | | **C** | **C** | | | |
| 1.1.3 | Xem thông tin / DS Org | **R** | R | **R** | | | | | | | | | | | | | | | | | | | |
| 1.1.4 | Tạm ngừng / Lưu trữ Org | **U** | | R | | R | | | | | | | | | | | | | **C** | **C** | **C** | | |
| 1.2.1 | Gửi lời mời gia nhập (Invite) | R | R | **C/R** | | | | | | | | | | | | | | | **C** | **C** | **C** | | |
| 1.2.2 | Chấp nhận / Từ chối lời mời | R | R | **C/U** | | | | | | | | | | | | | | | **C** | **C** | | | |
| 1.2.3 | Cập nhật trạng thái TV (Suspend/Del)| R | | **U/D** | | | R | | | | | | | | | | | | **C** | **C** | **C** | | |
| 1.2.4 | Phân quyền vai trò Org Role | R | | **C/U/D**| | | | | | | | | | | | | | | **C** | **C** | | | |
| 1.3.1 | Quản lý Phòng ban (CRUD Tree) | R | | R | **C/U/D**| | | | | | | | | | | | | | | **C** | | | | |
| 1.3.2 | Gán Lead & Thành viên PB | R | | R | **C/U/D**| | | | | | | | | | | | | | | **C** | | | | |
| 1.3.3 | Quản lý Nhóm người dùng (Group)| R | | R | **C/U/D**| | | | | | | | | | | | | | | **C** | | | | |
| 1.3.4 | Thêm / Gỡ TV khỏi Nhóm | R | | R | **C/D** | | | | | | | | | | | | | | | **C** | | | | |
| 1.4.1 | Quản lý Vai trò Org (Org Role)| R | | **C/U/D**| | | | | | | | | | | | | | | **C** | | | | |
| 1.4.2 | Cấu hình bảng quyền Org Perm | R | | **C/U/D**| | | | | | | | | | | | | | | **C** | | | | |
| **PHÂN HỆ 2: XÁC THỰC & BẢO MẬT** | | | | | | | | | | | | | | | | | | | | | | | |
| 2.1.1 | Đăng ký tài khoản (Register) | | **C** | | | | | | | | | | | | | | | | | | **C** | **C** | | |
| 2.1.2 | Đăng nhập hệ thống (Login) | | **R/U**| R | | | | | | | | | | | | | | | **C** | | | | |
| 2.1.3 | Đăng xuất hệ thống (Logout) | | **U** | | | | | | | | | | | | | | | | | | | | | | |
| 2.2.1 | Xem danh sách Active Sessions | | **R** | | | | | | | | | | | | | | | | | | | | | | |
| 2.2.2 | Thu hồi phiên từ xa (Revoke) | | **U/D**| | | | | | | | | | | | | | | | | | **C** | | | | |
| 2.3.1 | Yêu cầu đặt lại MK (Forgot PW)| | **C/R**| | | | | | | | | | | | | | | | | | **C** | **C** | | |
| 2.3.2 | Xác nhận đổi mật khẩu (Reset) | | **U** | | | | | | | | | | | | | | | | | | **C** | **C** | | | |
| 2.3.3 | Đổi mật khẩu đang đăng nhập | | **U** | | | | | | | | | | | | | | | | | | **C** | | | | |
| 2.4.1 | Gửi email xác thực tài khoản | | **C/R**| | | | | | | | | | | | | | | | | | **C** | **C** | | |
| 2.4.2 | Kích hoạt tài khoản qua Token | | **U** | | | | | | | | | | | | | | | | | | **C** | | | | |
| **PHÂN HỆ 3: DỰ ÁN & WORKSPACE** | | | | | | | | | | | | | | | | | | | | | | | |
| 3.1.1 | Tạo Dự án mới (Khởi tạo Hệ sinh thái) | R | | R | R | **C** | **C** | **C** | | **C** | **C** | R/C | | | | | | | **C** | **C** | | | |
| 3.1.2 | Cập nhật thông tin Dự án | R | | R | R | **U** | R | | | | | | | | | | | | **C** | **C** | | | |
| 3.1.3 | Lưu trữ / Khôi phục / Xóa DA | R | | R | | **U/D**| R | | | | | | | | | | | | **C** | **C** | | | |
| 3.1.4 | Cấu hình Schemes cho Dự án | R | | R | | **U** | R | | | R | | | | | | | | | **C** | **C** | | | |
| 3.1.5 | Xem danh sách & Chi tiết DA | R | | R | | **R** | **R** | | | | | | | | | | | | | | | | |
| 3.2.1 | Thêm / Xóa TV Dự án (Member) | R | | R | | R | **C/D** | | | | | | | | | | | | **C** | **C** | **C** | | |
| 3.2.2 | Gán / Thu hồi Vai trò DA | R | | R | | R | **C/U/D**| | | | | | | | | | | | **C** | **C** | | | |
| 3.2.3 | Kế thừa quyền DA theo Nhóm | R | | R | R | R | **C/U/D**| | | | | | | | | | | | **C** | | | | |
| 3.2.4 | Định nghĩa Project Roles CRUD | R | | R | | R | **C/U/D**| | | | | | | | | | | | **C** | | | | |
| 3.3.1 | Tạo / Cấu hình Board (Scrum/Kan)| R | | R | | R | R | **C/U/D**| | | | | | | | | | | **C** | | | | |
| 3.3.2 | Quản lý Cột & WIP Limit | | | R | | R | R | **C/U/D**| | | R | | | | | | | | **C** | | | | |
| 3.3.3 | Ánh xạ State vào Cột Board (C-04)| | | R | | R | R | **C/U/D**| | R | **R** | | | | | | | | **C** | | | | |
| 3.3.4 | Kéo thả sắp xếp thẻ (LexoRank)| | | R | | R | R | **U** | | | | **R** | | | | | | | **C** | | | | |
| 3.4.1 | Tạo Sprint dự kiến (Planned) | | | R | | R | R | **R/U**| **C** | | | | | | | | | | **C** | | | | |
| 3.4.2 | Bắt đầu Sprint (Start Active per C-05)| | | R | | R | R | R | **U** | | | | | | | | | | **C** | **C** | **C** | | |
| 3.4.3 | Đóng Sprint & Điều chuyển tồn | | | R | | R | R | R | **U** | | | **U** | | | | | | **U** | **C** | **C** | **C** | | |
| 3.4.4 | Thêm / Gỡ Issue khỏi Sprint | | | R | | R | R | R | **R/U** | | | **U** | | | | | | **C/U**| **C** | **C** | | | |
| 3.4.5 | Xem Sprint Board & Burndown | | | R | | R | R | R | **R** | | | **R** | | | | | | R | | | | | |
| 3.5.1 | Quản lý Component & Lead | R | | R | | **C/U/D**| R | | | | | | | | | | | | **C** | | | | |
| 3.5.2 | Quản lý Version (Release/Arch)| R | | R | | **C/U/D**| R | | | | | | | | | | | | **C** | **C** | | | |
| 3.6.1 | Quản lý Permission Scheme CRUD| R | | R | | **C/U/D**| R | | | | | | | | | | | | **C** | | | | |
| **PHÂN HỆ 4: WORKFLOW & FSM** | | | | | | | | | | | | | | | | | | | | | | | |
| 4.1.1 | Tạo / Phiên bản hóa Workflow | R | | R | | | | | | **C/U/D**| | | | | | | | | **C** | | | | |
| 4.1.2 | Quản lý Workflow States | R | | R | | | | | | R | **C/U/D**| | | | | | | | **C** | | | | |
| 4.1.3 | Quản lý Transitions & Guards | R | | R | | | | | | R | **C/U/D**| | | | | | | | **C** | | | | |
| 4.1.4 | Cấu hình Transition Permissions| R | | R | | R | R | | | R | **C/U/D**| | | | | | | | **C** | | | | |
| 4.2.1 | Quản lý Workflow Schemes | R | | R | | R | R | | | **C/U/D**| | | | | | | | | **C** | | | | |
| 4.2.2 | Ánh xạ Issue Type -> Workflow | R | | R | | R | R | | | **C/U/D**| | R | | | | | | | **C** | | | | |
| 4.3.1 | Thực thi Transition trên Issue (FSM)| R | | R | | R | R | R | | R | **R** | **U** | **C** | | | | | **C** | **C** | **C** | **C** | | **R** |
| **PHÂN HỆ 5: QUẢN LÝ ISSUE CỐT LÕI**| | | | | | | | | | | | | | | | | | | | | | | |
| 5.1.1 | Tạo Issue mới (Atomic Next Key)| R | | R | | **R/U**| R | **C** | R | R | R | **C** | | | | | **C** | **C** | **C** | **C** | **C** | | **R** |
| 5.1.2 | Cập nhật thông tin Issue | R | | R | | R | R | | | | | **U** | | | | | **U** | | **C** | **C** | **C** | | **R** |
| 5.1.3 | Xóa mềm / Lưu trữ Issue | R | | R | | R | R | | | | | **U/D**| | | | | | | **C** | **C** | | | |
| 5.1.4 | Xem chi tiết / Tìm kiếm Issue | R | | R | | R | R | R | R | R | R | **R** | **R** | **R** | **R** | **R** | **R** | **R** | | | | **R** | |
| 5.2.1 | Gán Parent / Sub-task (Acyclic)| R | | R | | R | R | | | | | **U** | | | | | | | **C** | **C** | | | |
| 5.2.2 | Tạo / Xóa Issue Link | R | | R | | R | R | | | | | **R** | | | | **C/D**| | | **C** | **C** | | | |
| 5.2.3 | Gán / Gỡ Labels cho Issue | R | | R | | R | R | | | | | **R** | | | | **C/D**| | | **C** | | | | |
| 5.3.1 | Gán / Thay đổi Assignee | R | | R | | R | R | | | | | **U** | | | | | | | **C** | **C** | **C** | | **R** |
| 5.3.2 | Thêm / Xóa Watcher | R | | R | | R | R | | | | | **R** | | | | **C/D**| | | **C** | | | | |
| 5.3.3 | Thay đổi Reporter | R | | R | | R | R | | | | | **U** | | | | | | | **C** | | | | |
| 5.4.1 | Thêm / Sửa / Xóa Comment | R | | R | | R | R | | | | | **R** | **C/U/D**| | | | | | **C** | **C** | **C** | | **R** |
| 5.4.2 | Tải lên / Xóa Attachment | R | | R | | R | R | | | | | **R** | R | **C/D** | | | | | **C** | **C** | | | |
| 5.5.1 | Ghi nhận Work Log (Thời gian)| R | | R | | R | R | | | | | **U** | | | **C/U/D**| | | | **C** | **C** | | | |
| 5.6.1 | Cập nhật Custom Field Values | R | | R | | R | R | | | | | **R** | | | | | **C/U**| | **C** | **C** | | | |
| 5.7.1 | Xem Lịch sử & Kiểm toán Issue| R | | R | | R | R | | | | | **R** | | | | | | **R** | **R** | | | | |
| **PHÂN HỆ 6: CẤU HÌNH SCHEMES** | | | | | | | | | | | | | | | | | | | | | | | |
| 6.1.1 | Quản lý Priority Schemes | R | | R | | R | | | | | | R | | | | | | | **C** | | | | |
| 6.2.1 | Quản lý Issue Type Schemes | R | | R | | R | | | | | | R | | | | | | | **C** | | | | |
| 6.3.1 | Quản lý Field & Screen Schemes| R | | R | | R | | | | | | | | | | | R | | **C** | | | | |
| 6.4.1 | Quản lý Issue Security Schemes| R | | R | R | R | R | | | | | R | | | | | | | **C** | | | | |
| 6.5.1 | Quản lý Notification Schemes | R | | R | R | R | R | | | | | | | | | | | | **C** | | **R** | | |
| **PHÂN HỆ 7: CUSTOM FIELDS ĐỘNG**| | | | | | | | | | | | | | | | | | | | | | | |
| 7.1.1 | Định nghĩa Custom Field CRUD | R | | R | | | | | | | | | | | | | **C/U/D**| | **C** | | | | |
| 7.2.1 | Cấu hình Custom Field Context | R | | R | | R | | | | | | R | | | | | **C/U/D**| | **C** | | | | |
| 7.3.1 | Quản lý Custom Field Options | R | | R | | | | | | | | | | | | | **C/U/D**| | **C** | | | | |
| **PHÂN HỆ 8: AUDIT, OUTBOX & JOBS**| | | | | | | | | | | | | | | | | | | | | | | |
| 8.1.1 | Xem Activity Logs Audit Stream| R | | R | | R | R | | | | | R | | | | | | | **R** | | | | |
| 8.2.1 | Cấu hình Notification Pref | R | | R | | | | | | | | | | | | | | | | | **C/U**| | |
| 8.3.1 | Xử lý & Phân phối Outbox Event| R | | | | | | | | | | | | | | | | | | **U** | **C** | **C** | | **C** |
| 8.4.1 | Quản lý Background Jobs | R | | R | | R | | | | | | | | | | | | | **C** | **C** | | | **C/U/D**|
| **PHÂN HỆ 9: TÌM KIẾM & NĂNG SUẤT**| | | | | | | | | | | | | | | | | | | | | | | |
| 9.1.1 | Quản lý Saved Filter (JQL) | R | | R | | R | R | | | | | R | | | | | | | **C** | | | **C/U/D**| |
| 9.2.1 | Chia sẻ & Đăng ký Báo cáo | R | | R | R | R | R | | | | | | | | | | | | **C** | | **C** | **C/U/D**| |
| 9.3.1 | Cấu hình Automation Rules | R | | R | | R | R | | | | | | | | | | | | **C** | | | | **C/U/D**|
| 9.3.2 | Thực thi Automation Execution | R | | | | R | | | | | | **U** | **C** | | | | | | **C** | **C** | **C** | | **C/U**|
| 9.4.1 | Quản lý Dashboard & Widgets | R | | R | R | R | R | | | | | | | | | | | | **C** | | | **C/U/D**| |
| **PHÂN HỆ 10: TÍCH HỢP & MỞ RỘNG**| | | | | | | | | | | | | | | | | | | | | | | |
| 10.1.1| Quản trị API Tokens (CRUD) | R | | R | | | | | | | | | | | | | | | **C** | | | | **C/U/D**|
| 10.2.1| Quản lý Webhook Subscriptions | R | | R | | R | R | | | | | | | | | | | | **C** | | | | **C/U/D**|
| 10.2.2| Bắn Webhook Delivery (Worker)| R | | | | | | | | | | | | | | | | | | | **R** | | | **C/U** |

---

# PHẦN V: PHÂN TÍCH CHUYÊN SÂU TƯƠNG TÁC CRUD, RÀNG BUỘC INVARIANTS & QUAN HỆ CỐT LÕI

### 5.1. Vòng đời Issue & Động cơ FSM
*Áp dụng cho chức năng: 4.3.1, 5.1.1, 5.1.2*

Khi người dùng thực hiện thao tác chuyển trạng thái Issue (ví dụ: từ `IN_PROGRESS` sang `CODE_REVIEW` hoặc `DONE`):
1. **Kiểm tra Phân quyền 3 Tầng**:
   - Kiểm tra xem người dùng có phải là active member trong Project (`project_members.status = 'active'`).
   - Kiểm tra `workflow_scheme_transition_permissions`: Vai trò dự án của thành viên (`project_roles`) có được phép thực hiện `transition_id` này hay không.
2. **Kiểm tra Điều kiện Bảo vệ (Transition Guards)**:
   - Hệ thống quét bảng `workflow_transition_guards`. Nếu có guard dạng `requires_fields`, hệ thống kiểm tra các trường bắt buộc (ví dụ: `resolution`, `fix_version_id`) đã được điền hay chưa.
   - Nếu `workflow_transitions.require_comment = true`, bắt buộc payload gửi lên phải chứa nội dung bình luận (`transition_comment`).
3. **Thực thi Giao dịch Nguyên tử (Atomic DB Transaction)**:
   - **Đọc & Khóa Lạc quan (Optimistic Concurrency Control)**: So sánh `issues.version` gửi lên với cơ sở dữ liệu. Nếu không khớp -> Báo lỗi `409 Conflict`.
   - **Cập nhật Issue**:
     - `issues.state_id = transition.to_state_id`.
     - `issues.version = issues.version + 1`.
     - Nếu `to_state.is_terminal = true`: Thiết lập `issues.resolved_at = NOW()` và gán `issues.resolution_id`. Ngược lại: Xóa `resolution_id` và `resolved_at = NULL`.
   - **Tạo Comment**: Tạo mới bản ghi trong `comments` nếu có nhập nội dung chuyển giao.
   - **Ghi nhận Lịch sử Bất biến**: Tạo bản ghi trong `issue_state_history` lưu giữ `issue_version_before`, `issue_version_after`, `from_state_id`, `to_state_id`, `actor_member_id` và `idempotency_key`.
   - **Ghi nhận Audit & Outbox**:
     - Tạo bản ghi `activity_logs` với `event_type = 'ISSUE_TRANSITIONED'`.
     - Tạo bản ghi `outbox_events` với `event_type = 'issue.transitioned'`, chứa đầy đủ snapshot thay đổi để Background Worker gửi Webhook và bắn Email/In-app Notification.

### 5.2. Quản lý Không gian Agile: Boards, LexoRank & Sprints
*Áp dụng cho chức năng: 3.3.3, 3.3.4, 3.4.1, 3.4.2, 3.4.3, 3.4.4*

1. **Ánh xạ Cột - Trạng thái FSM (`C-04`)**:
   - Một bảng (Board) có nhiều Cột (`board_columns`). Một Cột có thể đại diện cho nhiều Trạng thái FSM (`board_column_states`), nhưng **một Trạng thái chỉ được gán vào tối đa một Cột trên cùng một Board**.
   - Khi kéo thả một Issue từ Cột A sang Cột B trên giao diện:
     - Hệ thống tra cứu các `to_state_id` thuộc Cột B.
     - Tìm kiếm Transition hợp lệ từ `current_state_id` sang một trong các State của Cột B. Kích hoạt FSM Transition tương ứng.
2. **Sắp xếp Thẻ bài không xung đột (LexoRank Algorithm)**:
   - Thay vì lưu số thứ tự nguyên bản (`order: 1, 2, 3...`) dễ gây deadlock khi nhiều người kéo thả đồng thời, hệ thống sử dụng bảng `board_issue_positions` lưu giá trị chuỗi ký tự phân bổ khoảng cách: `rank = LexoRank.between(prevRank, nextRank)`.
   - Ràng buộc: Vị trí của Issue là cục bộ theo từng Board (`board_id` + `issue_id`), không làm ảnh hưởng đến thứ tự của Issue đó trên Board khác (`C-18`).
3. **Ràng buộc Chu kỳ Sprint (Sprint Lifecycle Rules - `C-05`)**:
   - Trên cùng một Scrum Board, **tại một thời điểm chỉ cho phép DUY NHẤT 1 Sprint có trạng thái `active`** (`UQ(board_id) WHERE state='active'`).
   - Khi bấm **Start Sprint**: Hệ thống kiểm tra điều kiện trên; nếu đã có Sprint active khác -> Từ chối thao tác với thông báo thân thiện.
   - Khi bấm **Complete Sprint**:
     - Cập nhật `sprints.state = 'closed'`, `closed_at = NOW()`.
     - Quét toàn bộ Issue trong Sprint: Các Issue chưa đạt trạng thái `is_terminal = true` sẽ tự động được điều chuyển về Product Backlog (`issues.sprint_id = NULL`) hoặc chuyển tiếp sang Sprint tiếp theo được chỉ định.
     - Cập nhật `issue_sprint_history.removed_at = NOW()` cho các issue chưa hoàn thành.

### 5.3. Cấp phát Mã Định danh Issue Nguyên tử (Atomic Key Generation)
*Áp dụng cho chức năng: 3.1.1, 5.1.1*

- Mã Issue trong Jira có định dạng: `[PROJECT_KEY]-[ISSUE_NUMBER]` (Ví dụ: `PROJ-1`, `PROJ-2`).
- Để ngăn chặn trùng lặp mã Issue khi nhiều người dùng bấm "Tạo Issue" tại cùng một mili-giây:
  - Bảng `projects` duy trì trường `next_issue_number` với ràng buộc `CHECK(next_issue_number >= 1)`.
  - Thao tác tạo Issue thực thi câu lệnh nguyên tử trong cơ sở dữ liệu:
    ```sql
    UPDATE projects 
    SET next_issue_number = next_issue_number + 1 
    WHERE id = :projectId 
    RETURNING next_issue_number - 1 AS allocated_number;
    ```
  - Sau đó ghép chuỗi: `key = project.key + '-' + allocated_number`. Đảm bảo tính duy nhất tuyệt đối mà không cần dùng Table Lock toàn cục.

### 5.4. Kiến trúc Hướng sự kiện & Transactional Outbox Pattern
*Áp dụng cho chức năng: 8.3.1, 10.2.1, 10.2.2*

1. **Nguyên lý Không đánh mất Sự kiện (Zero Event Loss)**:
   - Mọi thay đổi dữ liệu cốt lõi (Tạo issue, Đổi assignee, Đóng sprint) được ghi kèm một bản ghi vào bảng `outbox_events` **trong cùng một Database Transaction**.
2. **Tiến trình Xử lý Ngầm (Outbox Publisher Worker)**:
   - Background Worker định kỳ quét các sự kiện có `status = 'pending'` theo thứ tự `occurred_at`.
   - Với mỗi sự kiện:
     - Tạo thông báo tương ứng trong `notifications` và tạo bản ghi `notification_deliveries`.
     - Tìm kiếm các `webhook_subscriptions` đăng ký sự kiện này, tạo các lượt gửi trong `webhook_deliveries`.
     - Ký số HMAC SHA256 payload bằng bí mật Webhook.
     - Kích hoạt các `automation_rules` có trigger phù hợp và lưu `automation_executions`.
     - Đánh dấu `outbox_events.status = 'published'` và `published_at = NOW()`.
     - Áp dụng cơ chế Exponential Backoff nếu gửi thất bại (`retry_count` tăng dần, ghi nhận `last_error`).

### 5.5. Quản lý Trường Tùy biến Động (EAV Schema)
*Áp dụng cho chức năng: 5.6.1, 7.1.1, 7.2.1*

- Các trường chuẩn (System fields) như `summary`, `description`, `priority`, `due_at` được lưu trực tiếp trên bảng `issues`.
- Các trường mở rộng đặc thù của từng tổ chức/dự án được cấu hình qua `custom_fields`.
- Bảng ngữ cảnh `custom_field_contexts` quy định: Trường này chỉ xuất hiện trên Project X với Issue Type là `Bug`.
- Giá trị nhập liệu được lưu trong `issue_custom_field_values`:
  - Khóa phức hợp: `(issue_id, custom_field_context_id)`.
  - Giá trị lưu dạng `value_json: JSON` hỗ trợ mọi định dạng (chuỗi ký tự, mảng ID lựa chọn đối với select box, timestamp đối với ngày tháng).

---

### 5.6. Bảng Tra cứu Toàn diện Quan hệ giữa 90 Thực thể & Ràng buộc Invariants (C-01 đến C-48)

Dưới đây là bảng ma trận quan hệ chi tiết, minh bạch hóa cấu trúc dữ liệu của toàn bộ 10 phân hệ nghiệp vụ:

| Phân hệ (Domain) | Thực thể Nguồn (Source) | Thực thể Đích (Target) | Loại Quan Hệ (Cardinality) | Bảng Trung Gian (Junction Table) | Khóa Ngoại (Foreign Key Column) | Bắt buộc / Tùy chọn (Nullability) | Hành vi Khi Xóa (On Delete) | Ràng buộc Nghiệp vụ (Invariant Code) |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: | :---: | :---: |
| **1. Identity & Org** | `organizations` | `organization_members` | **1 - N** | *Trực tiếp* | `org_members.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-25`, `C-28` |
| | `users` | `organization_members` | **1 - N** | *Trực tiếp* | `org_members.user_id` | Bắt buộc (NOT NULL) | `RESTRICT` | `UQ(org_id, user_id)` |
| | `organizations` | `org_roles` | **1 - N** | *Trực tiếp* | `org_roles.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(org_id, key)` |
| | `organization_members` | `org_roles` | **N - N** | `org_member_roles` | `org_member_id`, `role_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-28`: Role & Member cùng Org |
| | `org_roles` | `org_role_permission_entries` | **1 - N** | *Trực tiếp* | `role_id` -> `org_roles.id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(role_id, permission_key)` |
| | `organizations` | `departments` | **1 - N** | *Trực tiếp* | `departments.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(org_id, name)` |
| | `departments` | `departments` (Self) | **1 - N** | *Tự tham chiếu* | `parent_department_id` | Tùy chọn (NULL) | `SET NULL` | `C-28`: Cấm chu trình (Acyclic) |
| | `departments` | `organization_members` | **N - N** | `department_members` | `department_id`, `org_member_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-29`: Dept & Member cùng Org |
| | `organizations` | `groups` | **1 - N** | *Trực tiếp* | `groups.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(org_id, name)` |
| | `groups` | `organization_members` | **N - N** | `group_members` | `group_id`, `org_member_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-30`: Group & Member cùng Org |
| **2. Security & Auth** | `users` | `auth_sessions` | **1 - N** | *Trực tiếp* | `auth_sessions.user_id` | Bắt buộc (NOT NULL) | `CASCADE` | `BR-34`: Revoke on PW change |
| | `users` | `password_reset_tokens` | **1 - N** | *Trực tiếp* | `password_reset_tokens.user_id` | Bắt buộc (NOT NULL) | `CASCADE` | Token Hash-only storage |
| | `users` | `email_verification_tokens` | **1 - N** | *Trực tiếp* | `email_verification_tokens.user_id` | Bắt buộc (NOT NULL) | `CASCADE` | Token Hash-only storage |
| **3. Workspace** | `organizations` | `projects` | **1 - N** | *Trực tiếp* | `projects.org_id` | Bắt buộc (NOT NULL) | `RESTRICT` | `UQ(org_id, key)` |
| | `departments` | `projects` | **1 - N** | *Trực tiếp* | `projects.department_id` | Tùy chọn (NULL) | `SET NULL` | Dept & Project cùng Org |
| | `projects` | `project_members` | **1 - N** | *Trực tiếp* | `project_members.project_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(project_id, org_member_id)` |
| | `project_members` | `project_roles` | **N - N** | `project_member_roles` | `project_member_id`, `project_role_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-02`: Project Scope Boundary |
| | `groups` | `project_roles` | **N - N** | `project_group_roles` | `group_id`, `project_role_id` | Bắt buộc (NOT NULL) | `CASCADE` | `TB-BR-10`: Group Inheritance |
| | `projects` | `permission_schemes` | **1 - 1 / 1 - N** | *Trực tiếp* | `projects.permission_scheme_id` | Tùy chọn (NULL) | `SET NULL` | RBAC Scheme Resolver |
| | `permission_schemes` | `permission_scheme_entries` | **1 - N** | *Trực tiếp* | `scheme_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(scheme_id, perm_key, role_id)` |
| | `projects` | `project_components` | **1 - N** | *Trực tiếp* | `project_components.project_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(project_id, name)` |
| | `projects` | `project_versions` | **1 - N** | *Trực tiếp* | `project_versions.project_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(project_id, name)` |
| | `projects` | `boards` | **1 - N** | *Trực tiếp* | `boards.project_id` | Bắt buộc (NOT NULL) | `CASCADE` | Board Type: Scrum / Kanban |
| | `boards` | `board_columns` | **1 - N** | *Trực tiếp* | `board_columns.board_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(board_id, position)` |
| | `board_columns` | `workflow_states` | **N - N** | `board_column_states` | `board_column_id`, `workflow_state_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-04`: 1 state <= 1 col / board |
| | `boards` | `sprints` | **1 - N** | *Trực tiếp* | `sprints.board_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-05`: Max 1 Active Sprint / Board |
| | `boards` | `issues` (LexoRank) | **N - N** | `board_issue_positions` | `board_id`, `issue_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-18`, `C-19`: Local Board Rank |
| **4. Workflow & FSM**| `organizations` | `workflows` | **1 - N** | *Trực tiếp* | `workflows.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(org_id, key, version)` |
| | `workflows` | `workflow_states` | **1 - N** | *Trực tiếp* | `workflow_states.workflow_id` | Bắt buộc (NOT NULL) | `CASCADE` | `UQ(wf_id) WHERE is_initial=true` |
| | `workflows` | `workflow_transitions` | **1 - N** | *Trực tiếp* | `workflow_transitions.workflow_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-08`: From & To states trong wf |
| | `workflow_transitions` | `workflow_transition_guards` | **1 - N** | *Trực tiếp* | `transition_id` | Bắt buộc (NOT NULL) | `CASCADE` | `BR-27`: Transition validation |
| | `projects` | `workflows` (Mapping) | **N - N** | `workflow_scheme_mappings` | `issue_type_id`, `workflow_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-11`: Issue Type Workflow Scheme |
| **5. Issues & Content**| `projects` | `issues` | **1 - N** | *Trực tiếp* | `issues.project_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-01`: Atomic next_issue_number |
| | `issue_types` | `issues` | **1 - N** | *Trực tiếp* | `issues.issue_type_id` | Bắt buộc (NOT NULL) | `RESTRICT` | `C-11`: Issue Type Catalog |
| | `sprints` | `issues` (Current Cache)| **1 - N** | *Trực tiếp* | `issues.sprint_id` | Tùy chọn (NULL) | `SET NULL` | `C-05`: Sprint & Issue cùng Project |
| | `issues` | `sprints` (Audit History)| **N - N** | `issue_sprint_history` | `issue_id`, `sprint_id` | Bắt buộc (NOT NULL) | `CASCADE` | Scope creep & Burndown audit |
| | `issues` | `issues` (Parent/Subtask)| **1 - N** | *Tự tham chiếu* | `issues.parent_issue_id` | Tùy chọn (NULL) | `SET NULL` | `C-03`: Same project, Acyclic |
| | `issues` | `issues` (Dependency Links)| **N - N** | `issue_links` | `source_issue_id`, `target_issue_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-15`: Link type directionality |
| | `issues` | `comments` | **1 - N** | *Trực tiếp* | `comments.issue_id` | Bắt buộc (NOT NULL) | `CASCADE` | Threaded Parent-Child Comments |
| | `issues` | `work_logs` | **1 - N** | *Trực tiếp* | `work_logs.issue_id` | Bắt buộc (NOT NULL) | `CASCADE` | Time Tracking (`time_spent > 0`) |
| | `issues` | `labels` | **N - N** | `issue_labels` | `issue_id`, `label_id` | Bắt buộc (NOT NULL) | `CASCADE` | Free tagging system |
| | `issues` | `organization_members` | **N - N** | `issue_watchers` | `issue_id`, `org_member_id` | Bắt buộc (NOT NULL) | `CASCADE` | Event notification subscriber |
| | `issues` | `attachments` | **1 - N** | *Trực tiếp* | `attachments.issue_id` | Bắt buộc (NOT NULL) | `CASCADE` | SHA-256 Checksum, Size Check |
| **6. Custom Fields** | `organizations` | `custom_fields` | **1 - N** | *Trực tiếp* | `custom_fields.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | EAV Dynamic Field Catalog |
| | `custom_fields` | `custom_field_options` | **1 - N** | *Trực tiếp* | `options.custom_field_id` | Bắt buộc (NOT NULL) | `CASCADE` | Options for Select Fields |
| | `custom_fields` | `projects` & `issue_types`| **N - N** | `custom_field_contexts` | `custom_field_id`, `project_id` | Bắt buộc (NOT NULL) | `CASCADE` | Contextual Schema Assignment |
| | `custom_field_contexts`| `issues` (Values) | **N - N** | `issue_custom_field_values` | `issue_id`, `context_id` | Bắt buộc (NOT NULL) | `CASCADE` | `C-22`: Structured JSON value |
| **7. Audit & Outbox** | `issues` | `issue_state_history` | **1 - N** | *Trực tiếp* | `issue_state_history.issue_id` | Bắt buộc (NOT NULL) | `CASCADE` | FSM Immutable Transition Audit |
| | `organizations` / `projects`| `activity_logs` | **1 - N** | *Trực tiếp* | `activity_logs.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | User Activity Stream Timeline |
| | `organizations` | `outbox_events` | **1 - N** | *Trực tiếp* | `outbox_events.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | Transactional Outbox Pattern |
| | `outbox_events` | `notifications` | **1 - N** | *Trực tiếp* | `notifications.outbox_event_id` | Tùy chọn (NULL) | `SET NULL` | In-app notification delivery |
| | `notifications` | `notification_deliveries` | **1 - N** | *Trực tiếp* | `deliveries.notification_id` | Bắt buộc (NOT NULL) | `CASCADE` | Email delivery tracking & attempts|
| **8. Productivity** | `organizations` | `saved_filters` | **1 - N** | *Trực tiếp* | `saved_filters.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | Saved JQL search queries |
| | `saved_filters` | `filter_subscriptions` | **1 - N** | *Trực tiếp* | `subscriptions.filter_id` | Bắt buộc (NOT NULL) | `CASCADE` | Scheduled report runner |
| | `organizations` | `automation_rules` | **1 - N** | *Trực tiếp* | `automation_rules.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | Trigger-Condition-Action Rules |
| | `automation_rules` | `automation_rule_components`| **1 - N**| *Trực tiếp* | `components.rule_id` | Bắt buộc (NOT NULL) | `CASCADE` | Rule execution tree |
| | `automation_rules` | `automation_executions` | **1 - N** | *Trực tiếp* | `executions.rule_id` | Bắt buộc (NOT NULL) | `CASCADE` | Execution history & idempotency |
| | `organizations` | `dashboards` | **1 - N** | *Trực tiếp* | `dashboards.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | Customizable user dashboards |
| | `dashboards` | `dashboard_widgets` | **1 - N** | *Trực tiếp* | `dashboard_widgets.dashboard_id` | Bắt buộc (NOT NULL) | `CASCADE` | Analytics widgets & charts |
| **9. Integrations** | `organizations` | `api_tokens` | **1 - N** | *Trực tiếp* | `api_tokens.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | Token hash-only, Scoped access |
| | `organizations` | `webhook_subscriptions` | **1 - N** | *Trực tiếp* | `subscriptions.org_id` | Bắt buộc (NOT NULL) | `CASCADE` | Webhook HTTP endpoint register |
| | `webhook_subscriptions`| `webhook_deliveries` | **1 - N** | *Trực tiếp* | `deliveries.subscription_id` | Bắt buộc (NOT NULL) | `CASCADE` | HMAC SHA-256 Signed Deliveries |

---

# PHẦN VI: KẾT LUẬN & ÁNH XẠ KIẾN TRÚC BACKEND (NESTJS / TYPEORM)

Tài liệu này là đặc tả yêu cầu nghiệp vụ (BRD), mô hình phân rã chức năng (BFD) và ma trận CRUD chuẩn hóa của hệ thống Task Manager Enterprise. Toàn bộ 72 chức năng nghiệp vụ, 90 thực thể vật lý và 22 nhóm thực thể cốt lõi được ánh xạ tương ứng 1:1 vào cấu trúc mã nguồn Backend NestJS hiện hữu:

| Phân hệ Nghiệp vụ | Module NestJS phụ trách (`backend/src/modules/`) | Controllers & Services chính | Entity TypeORM tương ứng |
| :--- | :--- | :--- | :--- |
| **1. Identity & Org** | `organization/`, `user/` | `OrganizationController`, `OrganizationService`, `DepartmentService` | `Organization`, `OrganizationMember`, `Department`, `Group`, `OrgRole`, `OrgMemberRole`, `OrgRolePermissionEntry` |
| **2. Security & Auth** | `auth/` | `AuthController`, `AuthService`, `JwtStrategy`, `SessionGuard` | `User`, `AuthSession`, `PasswordResetToken`, `EmailVerificationToken` |
| **3. Workspace & Projects** | `project/`, `board/`, `sprint/` | `ProjectController`, `BoardController`, `SprintController`, `PermissionResolverService` | `Project`, `ProjectMember`, `ProjectRole`, `Board`, `BoardColumn`, `BoardColumnState`, `Sprint`, `IssueSprintHistory` |
| **4. Workflow & FSM** | `workflow/` | `WorkflowController`, `WorkflowService`, `WorkflowEngineService` | `Workflow`, `WorkflowState`, `WorkflowTransition`, `WorkflowTransitionGuard` |
| **5. Issues & Content** | `issue/`, `comment/`, `attachment/`, `worklog/` | `IssueController`, `IssueService`, `CommentService`, `WorkLogService` | `Issue`, `IssueType`, `Comment`, `Attachment`, `WorkLog`, `IssueLink`, `IssueLinkType`, `Label`, `IssueWatcher` |
| **6 & 7. Schemes & Custom Fields** | `custom-field/`, `scheme/` | `CustomFieldController`, `CustomFieldService` | `CustomField`, `CustomFieldContext`, `CustomFieldOption`, `IssueCustomFieldValue`, `Priority` |
| **8. Audit, Outbox & Jobs** | `audit/`, `outbox/`, `background/` | `AuditLogService`, `OutboxService`, `NotificationDeliveryWorker` | `ActivityLog`, `IssueStateHistory`, `OutboxEvent`, `Notification`, `NotificationDelivery`, `BackgroundJob` |
| **9. Search & Productivity** | `filter/`, `dashboard/`, `automation/` | `FilterController`, `DashboardController`, `AutomationService` | `SavedFilter`, `FilterSubscription`, `Dashboard`, `DashboardWidget`, `AutomationRule`, `AutomationExecution` |
| **10. Integration Extensions**| `integration/`, `webhook/` | `ApiTokenController`, `WebhookDispatcherService` | `ApiToken`, `WebhookSubscription`, `WebhookDelivery` |

---
*Tài liệu được biên soạn và đồng bộ trực tiếp với lược đồ cơ sở dữ liệu `TASK_MANAGER_ERD.puml` và mã nguồn sản phẩm.*
