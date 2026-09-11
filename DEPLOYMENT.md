# Cẩm nang Triển khai Hệ thống Task Manager Pro (Production Deployment Guide)

Tài liệu này cung cấp hướng dẫn toàn diện từ A đến Z để đóng gói, triển khai và vận hành hệ thống **Task Manager Pro** (Jira Alternative) trên môi trường Production (VPS, Cloud Server, On-premise Docker Swarm / Kubernetes).

---

## 1. Kiến trúc Triển khai Container (5-Tier Architecture)

```
                       [ HTTPS / Port 80, 443 ]
                                  │
                                  ▼
               ┌─────────────────────────────────────┐
               │    tm_prod_frontend (Nginx Alpine)  │
               │   • Single Page Application (SPA)   │
               │   • Gzip Compression                │
               │   • Static Asset Caching            │
               └──────────────────┬──────────────────┘
                                  │ /api/ (Reverse Proxy)
                                  ▼
               ┌─────────────────────────────────────┐
               │     tm_prod_backend (NestJS API)    │
               │   • Port: 3001 (Node 20 Alpine)     │
               │   • Swagger UI: /api/docs           │
               │   • 22 Feature Modules & Auth       │
               └─────────┬───────────────────┬───────┘
                         │                   │
         ┌───────────────┘                   └──────────────┐
         ▼                                                  ▼
┌──────────────────┐                              ┌──────────────────┐
│ tm_prod_postgres │                              │  tm_prod_worker  │
│  (PostgreSQL 16) │                              │ (Outbox/Jobs/WF) │
│ • 90 Tables      │◄─────────────────────────────┤ • RUN_WORKERS=t  │
│ • PgData Volume  │                              │ • Pessimistic LK │
└──────────────────┘                              └─────────┬────────┘
         ▲                                                  │
         │                                                  ▼
┌──────────────────┐                              ┌──────────────────┐
│   tm_prod_redis  │                              │ SMTP Mail Server │
│ (Redis 7 Cache)  │                              │ (Outbox Gateway) │
└──────────────────┘                              └──────────────────┘
```

---

## 2. Yêu cầu Hệ thống Tối thiểu (System Requirements)

- **Hệ điều hành:** Ubuntu 22.04 LTS, Debian 12, CentOS 9 Stream, hoặc Windows Server 2022.
- **Phần cứng:**
  - CPU: Tối thiểu 2 vCPU (Khuyến nghị 4 vCPU).
  - RAM: Tối thiểu 4 GB RAM (Khuyến nghị 8 GB RAM).
  - Ổ cứng: 20 GB SSD khả dụng (có persistent storage cho PostgreSQL & Attachments).
- **Phần mềm:** Docker Engine 24.0+ và Docker Compose v2.20+.

---

## 3. Quy trình Triển khai Chuẩn (Step-by-Step)

### Bước 1: Sao chép Mã nguồn & Chuẩn bị File Môi trường
```bash
# Clone mã nguồn
git clone <repository_url> task-manager
cd task-manager

# Tạo file môi trường production
cp .env.production.example .env.production
```

### Bước 2: Cấu hình Mật mã & Biến Môi trường
Mở file `.env.production` và điền các giá trị bảo mật:
```bash
# Sinh khóa ngẫu nhiên cho JWT Secrets
openssl rand -base64 48
```
Cập nhật các biến quan trọng:
- `DATABASE_PASSWORD`: Mật khẩu mạnh cho CSDL PostgreSQL.
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: Khóa ký token JWT.
- `FRONTEND_URL`: Tên miền chính thức của ứng dụng (ví dụ: `https://jira.yourcompany.com`).
- `SMTP_*`: Cấu hình máy chủ gửi thư thực tế (SendGrid, SES, Mailgun, hoặc Gmail SMTP).

### Bước 3: Đóng gói & Khởi động Toàn bộ Hệ thống (One-Command Launch)
```bash
# Build images và khởi động ngầm toàn bộ 5 container
docker compose -f docker-compose.prod.yml up -d --build
```

### Bước 4: Kiểm tra Trạng thái Container & Sức khỏe Dịch vụ
```bash
# Kiểm tra danh sách container đang chạy
docker compose -f docker-compose.prod.yml ps

# Kiểm tra logs của Backend API
docker compose -f docker-compose.prod.yml logs -f backend

# Kiểm tra logs của Background Worker
docker compose -f docker-compose.prod.yml logs -f worker
```

Kết quả mong đợi:
- `tm_prod_postgres`: Up (healthy)
- `tm_prod_redis`: Up (healthy)
- `tm_prod_backend`: Up (healthy)
- `tm_prod_worker`: Up
- `tm_prod_frontend`: Up (healthy)

### Bước 5: Khởi tạo Dữ liệu Mẫu (Data Seeding - Tùy chọn)
Nếu bạn muốn nạp dữ liệu ban đầu gồm tài khoản Quản trị viên hệ thống, quy trình mẫu và dự án demo:
```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```
Tài khoản Quản trị mặc định sau khi seed:
- **Email:** `admin@taskmanager.dev`
- **Mật khẩu:** `Admin@123456`

---

## 4. Bảo mật & Sao lưu Dữ liệu (Backup & Security Checklist)

### 4.1. Sao lưu CSDL PostgreSQL định kỳ (Daily Backup Cron)
Tạo script sao lưu tự động `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/task_manager"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker exec -t tm_prod_postgres pg_dump -U dev task_manager | gzip > "$BACKUP_DIR/tm_backup_$DATE.sql.gz"
# Xóa bản sao lưu cũ hơn 30 ngày
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

### 4.2. Khôi phục Dữ liệu (Restore)
```bash
gunzip -c /var/backups/task_manager/tm_backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i tm_prod_postgres psql -U dev -d task_manager
```

### 4.3. Cấu hình SSL / HTTPS (Let's Encrypt / Cloudflare)
Khuyến nghị đặt một reverse proxy như Cloudflare, Traefik hoặc Nginx Proxy Manager phía trước port 80 của `tm_prod_frontend` để tự động cấp phát và gia hạn chứng chỉ SSL HTTPS miễn phí.

---

## 5. Danh mục Cổng & Đường dẫn Truy cập (Endpoints Matrix)

| Thành phần | Cổng mặc định | Đường dẫn URL | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `80`, `3000` | `http://localhost/` | Giao diện Single Page Application Task Manager Pro |
| **Backend REST API** | `3001` | `http://localhost:3001/api` | API Endpoint phục vụ xác thực, dự án, issue, board |
| **Tài liệu Swagger** | `3001` | `http://localhost:3001/api/docs` | Swagger / OpenAPI Explorer tương tác trực tiếp |
| **API Healthcheck** | `3001` | `http://localhost:3001/api/health`| Healthcheck tự động cho container orchestration |
| **PostgreSQL DB** | `5432` | `localhost:5432` | CSDL quan hệ chính (90 bảng theo ERD) |
| **Redis Store** | `6379` | `localhost:6379` | Bộ nhớ đệm và phân tán locks |
