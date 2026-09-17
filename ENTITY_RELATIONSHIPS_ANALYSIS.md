# PHÂN TÍCH TOÀN DIỆN THỰC THỂ, MỐI QUAN HỆ & ÁNH XẠ CHỨC NĂNG HỆ THỐNG
> **Tài liệu tham chiếu chuẩn:** [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) | [TASK_MANAGER_ERD - Copy.txt](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD%20-%20Copy.txt) | [BRD_BFD_CRUD_MATRIX.md](file:///c:/Users/Admin/OneDrive/Desktop/Jira/BRD_BFD_CRUD_MATRIX.md)  
> **Dự án:** Task Manager (Jira Enterprise Architecture Clone)  
> **Kiến trúc:** Multi-tenant, 3-Tier RBAC, Finite State Machine (FSM), Agile (Scrum/Kanban), Optimistic Concurrency Control & Event-Driven Transactional Outbox.

---

## 1. TỔNG QUAN KIẾN TRÚC DỮ LIỆU & CÁC PHÂN HỆ THỰC THỂ

Sơ đồ ERD trong [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) được thiết kế theo chuẩn doanh nghiệp (Atlassian Jira enterprise-grade data model) với 90 thực thể vật lý được phân tách thành 10 phân hệ nghiệp vụ độc lập nhưng kết nối chặt chẽ:

1. **Identity & Multi-Tenancy**: Quản lý ranh giới dữ liệu giữa các tổ chức (`organizations`), người dùng hệ thống (`users`), thành viên trong tổ chức (`organization_members`), phòng ban (`departments`), và nhóm làm việc (`groups`).
2. **Workspace & Projects**: Quản lý dự án (`projects`), phân quyền 3 tầng (`project_roles`, `permission_schemes`), phân loại thành phần (`project_components`) và phiên bản phát hành (`project_versions`).
3. **Agile Execution (Boards & Sprints)**: Quản lý bảng trực quan (`boards`), các cột trạng thái (`board_columns`), cơ chế sắp xếp mượt mà không va chạm (`board_issue_positions` với thuật toán LexoRank), và chu kỳ lặp Scrum (`sprints`).
4. **Workflow Engine (Finite State Machine - FSM)**: Quản lý luồng công việc linh hoạt (`workflows`), các trạng thái (`workflow_states`), các bước chuyển dịch (`workflow_transitions`), điều kiện bảo vệ chuyển dịch (`workflow_transition_guards`), và lược đồ gán quy trình (`workflow_schemes`).
5. **Issues & Core Content**: Quản lý đối tượng trung tâm của hệ thống (`issues`), loại công việc (`issue_types`), độ ưu tiên (`priorities`), giải pháp (`resolutions`), bình luận phân cấp (`comments`), nhật ký chấm công (`work_logs`), nhãn dán (`labels`), người theo dõi (`issue_watchers`), tệp đính kèm (`attachments`), và liên kết phụ thuộc (`issue_links`).
6. **Dynamic Schema (Custom Fields)**: Cho phép mở rộng trường dữ liệu động theo từng dự án và loại issue (`custom_fields`, `custom_field_contexts`, `custom_field_options`, `issue_custom_field_values`) theo mô hình EAV (Entity-Attribute-Value) an toàn.
7. **Audit Trail & Event-Driven Architecture**: Đảm bảo truy vết kiểm toán và nhất quán cuối cùng (`activity_logs`, `issue_state_history`, `issue_sprint_history`, `outbox_events`, `notifications`, `webhook_subscriptions`).

---

## 2. BẢNG PHÂN TÍCH CHI TIẾT CÁC MỐI QUAN HỆ CỐT LÕI (RELATIONSHIP BREAKDOWN)

### PHÂN HỆ 1: ĐỊNH DANH & ĐA TỔ CHỨC (IDENTITY & MULTI-TENANCY)

```
 [users] ──(1:N)──< [org_members] >──(N:1)── [organizations]
                           │ (1:N)
                           ▼
                  [org_member_roles] >──(N:1)── [org_roles] ──(1:N)──< [org_role_permission_entries]
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`organizations` — `organization_members`** | **1 - N** (Một - Nhiều) | `org_members.org_id` -> `organizations.id` | Một tổ chức (tenant) có thể có nhiều thành viên tham gia. Ranh giới dữ liệu tuyệt đối (Tenant Isolation). | Chức năng chuyển đổi tổ chức (Organization Switcher), mời thành viên (Invite Member), quản lý danh sách người dùng trong công ty. |
| **`users` — `organization_members`** | **1 - N** (Một - Nhiều) | `org_members.user_id` -> `users.id`<br>`UQ(org_id, user_id)` | Một tài khoản người dùng duy nhất (`users`) có thể là thành viên của nhiều tổ chức độc lập. | Đăng nhập một lần (SSO / Single Identity) nhưng sở hữu profile, quyền hạn và trạng thái độc lập trên từng workspace công ty. |
| **`organizations` — `org_roles`** | **1 - N** (Một - Nhiều) | `org_roles.org_id` -> `organizations.id`<br>`UQ(org_id, key)` | Mỗi tổ chức tự định nghĩa hệ thống vai trò nội bộ của mình (Org Admin, Member, Billing Manager, Viewer). | Chức năng cài đặt vai trò tổ chức (Organization Role Management), quản trị quyền hạn cấp cao. |
| **`organization_members` — `org_roles` qua `org_member_roles`** | **N - N** (Nhiều - Nhiều) | `org_member_id` & `role_id`<br>`granted_by_member_id` | Một thành viên có thể được cấp nhiều vai trò tổ chức; một vai trò có thể gán cho nhiều thành viên. Lưu rõ người cấp và ngày cấp (`granted_at`). | Phân quyền cấp tổ chức (`OrgMembershipGuard`, `hasOrgPermissions`), kiểm soát ai được tạo dự án, quản lý người dùng. |
| **`org_roles` — `org_role_permission_entries`** | **1 - N** (Một - Nhiều) | `role_id` -> `org_roles.id`<br>`UQ(role_id, permission_key)` | Một vai trò tổ chức bao gồm một tập hợp các quyền hạt nhân (`MANAGE_ORG`, `CREATE_PROJECT`, `MANAGE_MEMBERS`). | Quyền hạn granular, kiểm tra quyền nhanh bằng Cache Set (`orgPermCache`). |
| **`departments` — `department_members` — `organization_members`** | **N - N** (Nhiều - Nhiều) | `department_id` & `org_member_id` | Cơ cấu phòng ban (Phòng Kỹ thuật, Phòng Marketing, Ban Giám đốc). Một thành viên có thể kiêm nhiệm nhiều phòng ban. | Bộ lọc dự án theo phòng ban (Department Filter), chỉ định Lead Member đại diện phòng ban. |
| **`departments` — `departments` (Self-reference)** | **1 - N** (Tự tham chiếu) | `parent_department_id` -> `departments.id` | Cấu trúc cây phân cấp phòng ban công ty (Tổng công ty -> Khối -> Phòng -> Ban). | Hỗ trợ thuật toán kiểm tra vòng lặp (`cycle-detector.util.ts`), hiển thị sơ đồ tổ chức. |

---

### PHÂN HỆ 2: DỰ ÁN & PHÂN QUYỀN 3 TẦNG (WORKSPACE & PROJECT RBAC)

```
 [organizations] ──(1:N)──< [projects] ──(1:N)──< [project_members] >──(N:1)── [organization_members]
                               │                             │ (1:N)
                               │ (1:N)                       ▼
                               ▼                    [project_member_roles] >──(N:1)── [project_roles]
                      [permission_schemes] ──(1:N)──< [permission_scheme_entries] ───────┘
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`organizations` — `projects`** | **1 - N** (Một - Nhiều) | `projects.org_id` -> `organizations.id`<br>`UQ(org_id, key)` | Một tổ chức sở hữu nhiều dự án. Khóa dự án (`key`, ví dụ: `PRJ`, `FRONT`) là duy nhất trong cùng một tổ chức. | Modal tạo dự án (`CreateProjectModal`), danh sách dự án tại Sidebar, mã định danh tiền tố Issue (`PRJ-1`, `PRJ-2`). |
| **`projects` — `project_members` — `organization_members`** | **N - N** (Nhiều - Nhiều) | `project_id` & `org_member_id`<br>`UQ(project_id, org_member_id)` | Một thành viên tổ chức chỉ nhìn thấy và làm việc trên các dự án mà họ được thêm vào (`status: 'active'`). | Bảo mật dự án riêng tư (Private Projects), giới hạn danh sách người được phân công task (Assignee Dropdown). |
| **`project_members` — `project_roles` qua `project_member_roles`** | **N - N** (Nhiều - Nhiều) | `project_member_id` & `project_role_id`<br>`granted_by_member_id` | Trong một dự án, người dùng có thể là "Project Admin", người khác là "Developer" hoặc "QA/Tester". | Đánh giá ma trận phân quyền 3 tầng trong `ProjectPermissionGuard`: Cùng một người nhưng có quyền khác nhau giữa Dự án A và Dự án B. |
| **`groups` — `project_roles` qua `project_group_roles`** | **N - N** (Nhiều - Nhiều) | `group_id` & `project_role_id`<br>`granted_by_member_id` | Thừa kế quyền theo nhóm (Group Role Inheritance per SRS TB-BR-10). Gán cả nhóm "Backend Devs" vào vai trò "Developer" của dự án. | Giảm thiểu thao tác quản trị viên khi công ty có hàng trăm nhân sự gia nhập dự án. |
| **`projects` — `permission_schemes`** | **1 - 1** hoặc **1 - N** (Scheme Template) | `projects.permission_scheme_id` -> `permission_schemes.id` | Tách biệt logic phân quyền thành Lược đồ quyền (Permission Scheme) có thể gán cho dự án. | Cài đặt quyền hạn dự án: Ai được `CREATE_ISSUE`, `EDIT_ISSUE`, `TRANSITION_ISSUE`, `MANAGE_SPRINTS`. |
| **`permission_schemes` — `permission_scheme_entries`** | **1 - N** (Một - Nhiều) | `scheme_id` -> `permission_schemes.id`<br>`UQ(scheme_id, permission_key, project_role_id)` | Chi tiết từng dòng quy định: Quyền X được trao cho Vai trò dự án Y. | Động cơ kiểm tra quyền động trong `PermissionResolverService.hasProjectPermissions`. |

---

### PHÂN HỆ 3: AGILE EXECUTION (BOARDS, COLUMNS & SPRINTS)

```
 [projects] ──(1:N)──< [boards] ──(1:N)──< [board_columns] ──(N:N)──< [workflow_states]
                         │
                         ├────(1:N)──< [sprints] ──(1:N)──< [issues] (current_sprint)
                         │                 │
                         │                 └────(1:N)──< [issue_sprint_history] (audit)
                         │
                         └────(1:N)──< [board_issue_positions] >──(N:1)── [issues] (lexorank)
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`projects` — `boards`** | **1 - N** (Một - Nhiều) | `boards.project_id` -> `projects.id`<br>`board_type: 'kanban' \| 'scrum'` | Một dự án có thể có nhiều bảng công việc (Bảng Scrum cho team Dev, bảng Kanban cho team Vận hành bảo trì). | Màn hình `BoardView`, dropdown chọn bảng chuyển đổi qua lại giữa Kanban và Scrum. |
| **`boards` — `board_columns`** | **1 - N** (Một - Nhiều) | `board_columns.board_id` -> `boards.id`<br>`UQ(board_id, position)` | Một bảng gồm nhiều cột hiển thị tuần tự theo vị trí (`position: 0, 1, 2...`). Hỗ trợ giới hạn WIP (`wip_limit`). | Các cột trên màn hình Board: "To Do", "In Progress", "In Review", "Done". Kiểm soát cảnh báo quá tải công việc (WIP Limit). |
| **`board_columns` — `workflow_states` qua `board_column_states`** | **N - N** (Nhiều - Nhiều) | `board_column_id` & `workflow_state_id`<br>`C-04`: 1 state chỉ thuộc tối đa 1 column trên cùng 1 board | Cực kỳ quan trọng: Cho phép **ghép nhiều trạng thái vào 1 cột** (ví dụ: cột "In Progress" đại diện cho cả 2 trạng thái FSM: "In Coding" và "Code Review"). | Tách bạch giữa **Giao diện trực quan (UI Board)** và **Quy trình trạng thái chuẩn (Workflow FSM)**. Kéo thả card sang cột tương đương kích hoạt transition phù hợp. |
| **`boards` — `sprints`** | **1 - N** (Một - Nhiều) | `sprints.board_id` -> `boards.id`<br>`UQ(board_id) WHERE state = 'active'` | Sprints được tạo và gắn liền với Scrum Board. Ràng buộc đặc biệt: **Trên mỗi bảng chỉ được phép có DUY NHẤT 1 sprint đang Active**. | Màn hình `BacklogView` & `CreateSprintModal`. Khi bấm "Start Sprint", hệ thống chặn lỗi nếu bảng đã có sprint active khác (`uq_active_sprint_per_board`). |
| **`sprints` — `issues` (Current Sprint Cache)** | **1 - N** (Một - Nhiều) | `issues.sprint_id` -> `sprints.id`<br>`sprint_id` có thể `NULL` | Tại một thời điểm, một Issue chỉ thuộc về một Sprint cụ thể (hoặc `NULL` nếu nằm ở Product Backlog). | Phân bổ task cho Sprint, tính toán Story Points theo sprint (`totalPoints = calculateTotalPoints(sprintIssues)`). |
| **`issues` — `sprints` qua `issue_sprint_history`** | **N - N** (Nhiều - Nhiều có lịch sử) | `issue_id` & `sprint_id`<br>`added_by_member_id`<br>`removed_at`, `removed_by_member_id` | Một Issue có thể trải qua nhiều Sprint khác nhau (bị chuyển sprint hoặc trôi sprint qua nhiều kỳ). | Theo dõi độ biến động phạm vi Sprint (Sprint Scope Creep), báo cáo Sprint Burndown Chart và Sprint Velocity. |
| **`boards` — `issues` qua `board_issue_positions`** | **N - N** (Nhiều - Nhiều với Rank) | `board_id` & `issue_id`<br>`rank: VARCHAR (LexoRank)` | Thứ tự sắp xếp của một Issue chỉ có giá trị trên một bảng cụ thể, không ảnh hưởng sang bảng khác (Local Board Ranking). | Chức năng **Drag-and-Drop** thẻ bài trên Kanban Board. Sử dụng thuật toán LexoRank (`LexoRank.between`) tránh race condition khi nhiều người kéo thả đồng thời. |

---

### PHÂN HỆ 4: QUY TRÌNH & MÁY CHUYỂN TRẠNG THÁI HỮU HẠN (WORKFLOW & FSM)

```
 [workflows] ──(1:N)──< [workflow_states]
      │                        │ (from_state_id)
      │ (1:N)                  ▼
      └────────(1:N)──< [workflow_transitions] ──(1:N)──< [transition_guards]
                               │ (to_state_id)
                               ▼
                        [workflow_states]
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`workflows` — `workflow_states`** | **1 - N** (Một - Nhiều) | `workflow_states.workflow_id` -> `workflows.id`<br>`UQ(workflow_id) WHERE is_initial = true` | Một quy trình gồm nhiều trạng thái (To Do, Doing, Testing, Done). Có duy nhất 1 trạng thái khởi đầu (`is_initial`) và các trạng thái kết thúc (`is_terminal`). | Tự động gán trạng thái ban đầu cho Issue khi vừa tạo mới (`createIssue` gán `isInitial: true`), đánh dấu hoàn thành (`resolved_at`). |
| **`workflows` — `workflow_transitions`** | **1 - N** (Một - Nhiều) | `workflow_transitions.workflow_id` -> `workflows.id` | Các bước chuyển đổi được cấp phép (Transitions) trong vòng đời công việc. Ngăn chặn việc nhảy cóc trạng thái tùy tiện. | Các nút bấm hành động chuyển trạng thái trên giao diện: "Start Progress", "Request Review", "Resolve Issue". |
| **`workflow_transitions` — `workflow_states` (From / To)** | **N - 1** và **N - 1** | `from_state_id` -> `workflow_states.id`<br>`to_state_id` -> `workflow_states.id` | Xác định cạnh có hướng trong đồ thị FSM: Từ đỉnh A (`from`) chỉ được chuyển sang đỉnh B (`to`). | Động cơ kiểm tra hợp lệ bước chuyển (`issue.service.ts: listTransitions` và `transition`). Trả về danh sách trạng thái hợp lệ mà issue được phép chuyển tới. |
| **`workflow_transitions` — `workflow_transition_guards`** | **1 - N** (Một - Nhiều) | `transition_id` -> `workflow_transitions.id`<br>`guard_type: 'requires_fields' \| 'dsl'` | Bộ quy tắc kiểm duyệt (Guards / Validators): Chỉ cho phép transition khi thỏa mãn điều kiện (phải nhập Resolution, phải có Assignee, phải có Comment). | Chức năng Transition Guard (SRS BR-27): Chặn không cho Complete task nếu chưa điền đầy đủ thông tin nghiệm thu. |
| **`projects` — `workflow_schemes` — `workflows`** | **N - N** qua Mapping | `workflow_scheme_mappings` liên kết `issue_type_id` với `workflow_id` | Một dự án có thể áp dụng các quy trình khác nhau cho các loại công việc khác nhau: `Bug` đi theo quy trình sửa lỗi khẩn cấp, `Task` đi theo quy trình tiêu chuẩn. | Tính năng linh hoạt cao cấp của Jira: Bug Workflow khác biệt hoàn toàn với Story Workflow. |

---

### PHÂN HỆ 5: ĐỐI TƯỢNG TRUNG TÂM — VÒNG ĐỜI ISSUE & PHÂN CẤP (ISSUE LIFECYCLE & HIERARCHY)

```
                            [projects]
                                │ (1:N)
 [issue_types] ──(1:N)──<       ▼       >──(N:1)── [priorities]
 [resolutions] ──(1:N)──<    [issues]   >──(N:1)── [workflow_states]
 [sprints]     ──(1:N)──<       │       >──(N:1)── [project_components]
                                │ (1:N self-ref: parent_issue_id)
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
  [comments]               [work_logs]             [issue_links]
  (1:N self-ref)        (time tracking)         (source 1:N & target 1:N)
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`projects` — `issues`** | **1 - N** (Một - Nhiều) | `issues.project_id` -> `projects.id`<br>`UQ(project_id, key)` | Một dự án chứa hàng nghìn Issues. Mã số issue (`key`, ví dụ `CLOUD-101`) được sinh tuần tự nguyên tử (`next_issue_number` + pessimistic write lock). | Danh sách Issue, tìm kiếm lọc Issue theo dự án, điều hướng chi tiết URL `/projects/:key/issues/:number`. |
| **`issue_types` — `issues`** | **1 - N** (Một - Nhiều) | `issues.issue_type_id` -> `issue_types.id` | Mỗi Issue phải có một kiểu phân loại cụ thể: Task, Bug, Story, Epic. | Biểu tượng icon tương ứng trên UI (Bug màu đỏ, Story màu xanh lá, Epic màu tím), quy định trường dữ liệu và quy trình FSM áp dụng. |
| **`priorities` — `issues`** | **1 - N** (Một - Nhiều) | `issues.priority_id` -> `priorities.id` (hoặc enum cache) | Mức độ ưu tiên của công việc: Lowest, Low, Medium, High, Highest. | Sắp xếp độ ưu tiên, hiển thị mũi tên chevron màu sắc tại danh sách backlog và board card. |
| **`organization_members` — `issues` (Reporter & Assignee)** | **1 - N** (Một - Nhiều) | `reporter_member_id` -> `org_members.id`<br>`assignee_member_id` -> `org_members.id` (nullable) | Người tạo yêu cầu (`reporter`) chịu trách nhiệm xác nhận nghiệm thu; Người được phân công (`assignee`) chịu trách nhiệm thực thi. | Avatar hiển thị trên task card, bộ lọc "Assigned to me", "Reported by me", phân bổ trách nhiệm rõ ràng. |
| **`issues` — `issues` (Self-reference / Hierarchy)** | **1 - N** (Tự tham chiếu) | `parent_issue_id` -> `issues.id`<br>Cấm tham chiếu chính mình & cấm tạo chu trình | Quan hệ cha - con (Parent - Subtask hoặc Epic - Story). Issue con không thể là cha của chính nó. | Khối Subtasks trong `IssueDetailModal`, thanh tiến độ hoàn thành của các task con, phân rã công việc WBS. |
| **`issues` — `issue_links` — `issues`** | **N - N** (Nhiều - Nhiều có hướng/vô hướng) | `issue_id` (source) & `linked_issue_id` (target)<br>`link_type_id` (`blocks`, `duplicates`, `relates_to`) | Mối quan hệ tương quan giữa 2 issues bất kỳ (ví dụ: Issue A "blocks" Issue B; Issue C "duplicates" Issue D). | Phần "Linked Issues" trong Issue Detail: Cho phép link các task phụ thuộc, cảnh báo không thể đóng task nếu đang bị block. |
| **`issues` — `comments`** | **1 - N** (Một - Nhiều) | `comments.issue_id` -> `issues.id` | Khách hàng và kỹ sư trao đổi thảo luận trực tiếp dưới từng task. | Tab thảo luận `comments`, hỗ trợ định dạng markdown, hiển thị avatar người gửi và thời gian gửi. |
| **`comments` — `comments` (Self-reference)** | **1 - N** (Tự tham chiếu) | `parent_comment_id` -> `comments.id` | Bình luận lồng nhau theo dạng phân cấp (Threaded replies). | Trả lời trực tiếp vào một bình luận cụ thể để giữ ngữ cảnh mạch lạc. |
| **`issues` — `work_logs`** | **1 - N** (Một - Nhiều) | `work_logs.issue_id` -> `issues.id`<br>`CHECK(time_spent_seconds > 0)` | Ghi nhận nhật ký làm việc (Log Work). Một issue có nhiều lần chấm công bởi nhiều thành viên. | Tab "Work Log" & tiến độ "Time Tracking": Cho biết dự toán ban đầu (`originalEstimate`), thời gian đã dùng (`timeSpent`), và thời gian còn lại (`remainingEstimate`). |
| **`issues` — `labels` qua `issue_labels`** | **N - N** (Nhiều - Nhiều) | `issue_id` & `label_id`<br>`added_by_member_id` | Gắn nhãn phân loại tự do (Tags): Frontend, Backend, UI/UX, Hotfix. | Thẻ màu Badge hiển thị trên card, click vào nhãn để lọc tất cả các issue có cùng nhãn. |
| **`issues` — `issue_watchers` — `organization_members`** | **N - N** (Nhiều - Nhiều) | `issue_id` & `org_member_id` | Danh sách những người quan tâm theo dõi công việc này (Watchers). | Nút "Watch / Unwatch". Khi issue có cập nhật mới (đổi trạng thái, comment mới), toàn bộ Watchers sẽ nhận được thông báo. |
| **`issues` — `attachments`** | **1 - N** (Một - Nhiều) | `attachments.issue_id` -> `issues.id` | Đính kèm ảnh chụp màn hình lỗi, file thiết kế, log hệ thống. | Tải lên file ảnh/video, hiển thị hình thu nhỏ preview và tải file về máy. |

---

### PHÂN HỆ 6: TRƯỜNG DỮ LIỆU ĐỘNG (CUSTOM FIELDS — EAV PATTERN)

```
 [custom_fields] ──(1:N)──< [custom_field_options]
       │
       └──(1:N)──< [custom_field_contexts] >──(N:1)── [projects]
                         │                 >──(N:1)── [issue_types]
                         │ (1:N)
                         ▼
             [issue_custom_field_values] >──(N:1)── [issues]
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`custom_fields` — `custom_field_options`** | **1 - N** (Một - Nhiều) | `custom_field_options.custom_field_id` -> `custom_fields.id` | Dành cho các trường động kiểu lựa chọn (`select`, `multi-select`). Danh sách các giá trị lựa chọn khả dụng. | Dropdown động trong form tạo/sửa issue (ví dụ: trường "Môi trường lỗi" có các option: Dev, Staging, Production). |
| **`custom_fields` — `projects` & `issue_types` qua `custom_field_contexts`** | **N - N** (Nhiều - Nhiều ngữ cảnh) | `custom_field_id`, `project_id`, `issue_type_id`<br>`UQ(custom_field_id, project_id, issue_type_id)` | Cấu hình ngữ cảnh (Contextual Schema): Trường "Trình duyệt bị lỗi" chỉ hiển thị khi `issue_type` là `Bug` và nằm trong `Project Web`, không hiển thị cho `Story` hay `Project Backend`. | Hiển thị trường động thông minh theo đúng ngữ cảnh được chọn trên modal tạo/sửa issue (`CreateIssueModal`). |
| **`custom_field_contexts` — `issues` qua `issue_custom_field_values`** | **N - N** (Lưu trữ giá trị động) | `issue_id` & `custom_field_context_id`<br>`value_json: JSON` | Lưu trữ giá trị thực tế của từng trường động trên từng issue cụ thể theo dạng JSON có cấu trúc. | Hàm `setValue` trong `CustomFieldService` và các ô input động trong `IssueDetailModal`. |

---

### PHÂN HỆ 7: KIỂM TOÁN, SỰ KIỆN & THÔNG BÁO (AUDIT, CONCURRENCY & OUTBOX)

```
 [issues] ──(1:N)──< [issue_state_history] (FSM Audit)
 [projects] ──(1:N)──< [activity_logs] (Timeline Stream)
 [organizations] ──(1:N)──< [outbox_events] ──(1:N)──< [notifications]
```

| Mối quan hệ | Loại quan hệ (Cardinality) | Khóa ngoại & Ràng buộc | Ý nghĩa thiết kế (Rationale) | Ánh xạ chức năng đã xây dựng |
| :--- | :---: | :--- | :--- | :--- |
| **`issues` — `issue_state_history`** | **1 - N** (Một - Nhiều) | `issue_id` -> `issues.id`<br>`from_state_id`, `to_state_id`<br>`versionBefore`, `versionAfter` | Lưu lại toàn bộ lịch sử chuyển dịch trạng thái FSM: ai chuyển, chuyển từ đâu sang đâu, tại thời điểm nào, ghi chú kèm theo. | Tab "History" trong Issue Detail Modal, phân tích thời gian task nằm ở từng trạng thái (Lead Time / Cycle Time). |
| **`projects` / `issues` — `activity_logs`** | **1 - N** (Một - Nhiều) | `projectId`, `issueId`, `actorMemberId`<br>`payloadJson: JSON` | Dòng sự kiện hoạt động (Audit Trail / Activity Stream) ghi nhận mọi hành vi: tạo issue, sửa tóm tắt, đổi người làm, gán sprint. | Tab "Activity Stream" trên bảng điều khiển dự án, đảm bảo tính minh bạch và truy cứu trách nhiệm khi có sự cố. |
| **`organizations` — `outbox_events`** | **1 - N** (Một - Nhiều) | `orgId`, `aggregateType`, `aggregateId`<br>`idempotencyKey: UQ` | Mẫu thiết kế **Transactional Outbox Pattern**: Đảm bảo việc lưu dữ liệu vào DB và việc phát sinh sự kiện diễn ra trong cùng 1 Database Transaction nguyên tử (ACID). | Nền tảng gửi email thông báo ngầm, kích hoạt Automation Rules và bắn Webhooks đến bên thứ ba (Slack, Discord, GitHub). |
| **`outbox_events` — `notifications`** | **1 - N** (Một - Nhiều) | `outbox_event_id` -> `outbox_events.id`<br>`recipient_member_id` | Một sự kiện nghiệp vụ (ví dụ: tạo issue mới) sinh ra thông báo tương ứng cho các thành viên liên quan. | Chuông thông báo trên thanh Header (Notification Bell), đánh dấu đã đọc / chưa đọc. |

---

## 3. TỔNG HỢP VÀ ĐÁNH GIÁ CÁC MẪU QUAN HỆ (CARDINALITY EVALUATION)

### 1. Mối quan hệ Một - Một (1 - 1):
- **Ví dụ điển hình**: `projects` — `permission_schemes` (qua `projects.permission_scheme_id` trỏ đến scheme riêng của dự án).
- **Đánh giá & Ý nghĩa**: Dùng khi một thực thể chỉ gắn kết duy nhất với một thực thể khác nhằm mục đích phân tách ranh giới dữ liệu sạch sẽ hoặc cấu hình mở rộng không làm phình to bảng chính.

### 2. Mối quan hệ Một - Nhiều (1 - N):
- **Ví dụ điển hình**:
  - `organizations` — `projects`: Một tổ chức có nhiều dự án.
  - `projects` — `issues`: Một dự án chứa nhiều issues.
  - `boards` — `sprints`: Một Scrum board lên kế hoạch cho nhiều sprints.
  - `issues` — `comments` / `work_logs`: Một issue có nhiều bình luận và nhật ký chấm công.
- **Đánh giá & Ý nghĩa**: Đây là xương sống của toàn bộ hệ thống cơ sở dữ liệu quan hệ (RDBMS). Đảm bảo tính toàn vẹn tham chiếu thông qua khóa ngoại (`FOREIGN KEY`) và cascade delete có kiểm soát (soft delete thông qua `deleted_at`).

### 3. Mối quan hệ Nhiều - Nhiều (N - N):
- **Tại sao toàn bộ quan hệ N - N đều dùng Bảng Trung Gian (Junction Table with Metadata)?**
  Trong kiến trúc này, **không có bất kỳ bảng N-N nào là bảng nối rỗng (chỉ có 2 FK)**. Mọi bảng trung gian đều chứa các thuộc tính nghiệp vụ cốt lõi:
  - `organization_members`: Lưu `status`, `joined_at`, `invited_by_member_id`.
  - `project_member_roles`: Lưu `granted_at`, `granted_by_member_id`.
  - `board_issue_positions`: Lưu `rank` (LexoRank string) cho thuật toán kéo thả.
  - `board_column_states`: Ánh xạ đa hình giữa Cột giao diện và Trạng thái FSM.
  - `issue_sprint_history`: Lưu `added_at`, `removed_at`, `added_by`, `removed_by` để theo dõi vòng đời di chuyển task.
  - `issue_custom_field_values`: Lưu `value_json` và ngữ cảnh cấu hình.
- **Đánh giá & Ý nghĩa**: Biến các quan hệ N-N thành các thực thể độc lập có khả năng truy vết kiểm toán cao, kiểm soát chặt chẽ tính bảo mật và phục vụ tối ưu cho việc truy vấn báo cáo phân tích.

---

## 4. MA TRẬN ÁNH XẠ GIỮA THỰC THỂ ERD VÀ CÁC CHỨC NĂNG HỆ THỐNG ĐÃ XÂY DỰNG

| Tên chức năng trên giao diện | Các thực thể ERD chịu trách nhiệm | Logic nghiệp vụ & Mối liên kết thực tế đã lập trình |
| :--- | :--- | :--- |
| **Đăng ký, Đăng nhập & Xác thực** | `users`, `auth_sessions`, `password_reset_tokens` | Khởi tạo tài khoản băm mật khẩu bcrypt, tạo phiên đăng nhập JWT (Access + Refresh token), lưu lịch sử IP và thiết bị. |
| **Quản trị Tổ chức & Phân quyền công ty** | `organizations`, `org_members`, `org_roles`, `org_member_roles`, `org_role_permission_entries` | Phân quyền `OrgMembershipGuard`. Khi tạo tổ chức, tự động seed vai trò `org-admin` và các quyền tối cao; kiểm soát việc mời thành viên vào workspace. |
| **Khởi tạo & Cài đặt Dự án** | `projects`, `project_roles`, `project_members`, `permission_schemes`, `permission_scheme_entries` | `ProjectService.create`: Tạo dự án, tự động gán người tạo làm Project Admin, khởi tạo Permission Scheme mặc định, tạo board Kanban/Scrum và sinh Workflow ban đầu. |
| **Kế hoạch Backlog & Quản trị Sprint** | `sprints`, `issues`, `issue_sprint_history`, `boards` | `SprintService`: Tạo Sprint ở trạng thái planned, Start Sprint (đảm bảo chỉ 1 active sprint/board), Close Sprint (tự động đẩy các task chưa xong về Product Backlog qua `issue_sprint_history`). |
| **Bảng công việc trực quan (Kanban/Scrum Board)** | `boards`, `board_columns`, `board_column_states`, `board_issue_positions`, `issues` | `BoardService.getBoardIssues`: Lấy danh sách cột, gom nhóm issues theo trạng thái tương ứng của cột, sắp xếp thứ tự thẻ bài bằng LexoRank khi người dùng kéo thả. |
| **Tạo mới công việc (Create Issue)** | `issues`, `issue_types`, `priorities`, `workflow_states`, `project_components`, `project_versions` | `ProjectService.createIssue`: Khóa bi quan (`pessimistic_write`) tăng mã số nguyên tử (`KEY-123`), tự động gắn trạng thái ban đầu của workflow, định vị vị trí LexoRank trên board. |
| **Chi tiết công việc & Tương tác (Issue Detail)** | `issues`, `comments`, `work_logs`, `issue_links`, `issue_watchers`, `attachments`, `custom_fields` | `IssueController` & `IssueDetailModal`: Đọc và cập nhật tức thời tiêu đề, mô tả, người thực hiện; ghi log work và tính toán remaining time; thảo luận và đính kèm tệp tin. |
| **Quy trình chuyển đổi trạng thái FSM** | `workflows`, `workflow_states`, `workflow_transitions`, `workflow_transition_guards`, `issue_state_history` | `IssueService.transition`: Kiểm tra phiên bản chống ghi đè đồng thời (`version`), kiểm tra điều kiện bảo vệ (bắt buộc nhập comment hoặc điền trường dữ liệu), ghi nhận vết lịch sử `issue_state_history`. |
| **Dòng thời gian hoạt động & Thông báo** | `activity_logs`, `outbox_events`, `notifications` | Mọi thao tác thay đổi dữ liệu đều ghi nhận vào `activity_logs` và bắn `outbox_events` để đảm bảo hệ thống có thể mở rộng xử lý bất đồng bộ. |

---

## 5. KẾT LUẬN

Sơ đồ [TASK_MANAGER_ERD.puml](file:///c:/Users/Admin/OneDrive/Desktop/Jira/TASK_MANAGER_ERD.puml) không chỉ là một bản vẽ quan hệ cơ sở dữ liệu đơn thuần, mà là **bản thiết kế kiến trúc hoàn chỉnh** phản ánh chính xác 100% logic vận hành của hệ thống:
1. **Tính cô lập dữ liệu và bảo mật**: Đảm bảo ranh giới Multi-tenancy vững chắc và mô hình phân quyền 3 tầng linh hoạt.
2. **Tính toàn vẹn và bất biến**: Sử dụng các bảng trung gian có đầy đủ metadata kiểm toán, ghi nhận toàn bộ lịch sử biến động của sprint và trạng thái FSM.
3. **Hiệu năng và khả năng mở rộng**: Tối ưu hóa thứ tự sắp xếp bằng LexoRank, giải quyết bài toán concurrency bằng khóa lạc quan (`version`), và đảm bảo giao tiếp bất đồng bộ qua Transactional Outbox Pattern.
