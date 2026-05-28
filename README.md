# Korean Vocab App

Ứng dụng web 3-tier đơn giản để học từ vựng tiếng Hàn cơ bản cho người Việt Nam.

Stack:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

Mục tiêu hiện tại: chạy local trước khi đóng gói Docker, Kubernetes, Helm và ArgoCD.

## Cấu Trúc

```text
korean-vocab-app/
+-- frontend/
+-- backend/
+-- database/
+-- docs/
```

## Chức Năng MVP

- Hiển thị danh sách từ vựng tiếng Hàn.
- Thêm từ vựng mới.
- Xóa từ vựng.
- Quiz trắc nghiệm 4 đáp án.
- API health check cho Kubernetes sau này.
- Frontend hiển thị environment và app version.

## Database

Ứng dụng chỉ dùng 1 bảng: `vocabularies`.

Các cột:

- `id`
- `korean`
- `romanization`
- `vietnamese_meaning`
- `category`
- `example_sentence`
- `created_at`

File seed database:

```text
database/init.sql
```

File này tạo bảng `vocabularies` và seed 50 từ vựng tiếng Hàn cơ bản.

## Chạy Local Nhanh

Yêu cầu máy đã có:

- Node.js LTS
- PostgreSQL
- Database `korean_vocab` đã được tạo và đã chạy `database/init.sql`

Nếu chưa biết cài Node.js/PostgreSQL hoặc chưa biết tạo database, xem hướng dẫn chi tiết tại:

```text
docs/local-manual-setup.md
```

### 1. Backend

Windows PowerShell:

```powershell
cd D:\DevOps\Fsoft\3_Docker\lab\korean-vocab-app\backend
Copy-Item .env.example .env
npm install
npm run dev
```

Linux/macOS:

```bash
cd korean-vocab-app/backend
cp .env.example .env
npm install
npm run dev
```

Backend chạy tại:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

### 2. Frontend

Mở terminal khác.

Windows PowerShell:

```powershell
cd D:\DevOps\Fsoft\3_Docker\lab\korean-vocab-app\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Linux/macOS:

```bash
cd korean-vocab-app/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## Biến Môi Trường

Backend đọc config từ `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=korean_vocab
DB_USER=postgres
DB_PASSWORD=postgres
APP_ENV=local
APP_VERSION=v1.0.0
```

Frontend đọc config từ `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## API

- `GET /api/health`
- `GET /api/config`
- `GET /api/vocabularies`
- `POST /api/vocabularies`
- `DELETE /api/vocabularies/:id`
- `GET /api/quiz`

## Lộ Trình Lab Tiếp Theo

Repo này hiện chưa có Dockerfile, docker-compose, Kubernetes manifest, Helm chart hoặc ArgoCD config.

Sau khi app chạy local ổn, có thể làm tiếp theo thứ tự:

1. Dockerfile cho backend.
2. Dockerfile cho frontend.
3. docker-compose để chạy frontend, backend, PostgreSQL.
4. Kubernetes manifests.
5. Helm chart.
6. ArgoCD GitOps deployment.

Khi đã có Docker hoặc docker-compose, phần cài PostgreSQL thủ công trong `docs/local-manual-setup.md` sẽ không còn là luồng chạy chính nữa.
