# Korean Vocab App

Ung dung web 3-tier don gian de hoc tu vung tieng Han co ban.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Container: Docker, Docker Compose

## Cau Truc Project

```text
korean-vocab-app/
+-- frontend/
+-- backend/
+-- database/
+-- docs/
+-- docker-compose.yml
```

## Chuc Nang MVP

- Hien thi danh sach tu vung tieng Han.
- Them tu vung moi.
- Xoa tu vung.
- Quiz trac nghiem 4 dap an.
- Quiz lay cac dap an trong cung chu de voi cau hoi.
- API health check cho Docker/Kubernetes.
- Frontend hien thi environment va app version.

## Chay Bang Docker Compose

Day la cach chay khuyen nghi hien tai. Ban can cai Docker Desktop truoc.

Tu thu muc root cua project:

```powershell
docker compose up --build
```

Hoac chay nen:

```powershell
docker compose up --build -d
```

Sau khi chay xong:

```text
Frontend: http://localhost:8080
Backend:  http://localhost:3000
Health:   http://localhost:3000/api/health
```

Docker Compose se tao 3 service:

```text
frontend -> backend -> postgres
```

Chi tiet:

- `postgres`: PostgreSQL 16, tao database `korean_vocab`.
- `backend`: Express API, ket noi database bang host `postgres`.
- `frontend`: React/Vite build static, serve bang Nginx o port `80` trong container.

File `database/init.sql` duoc mount vao PostgreSQL va chay tu dong khi volume database duoc tao lan dau.

## Lenh Docker Compose Huu Ich

Xem container dang chay:

```powershell
docker compose ps
```

Xem logs:

```powershell
docker compose logs -f
```

Dung app:

```powershell
docker compose down
```

Dung app va xoa ca database volume de seed lai tu dau:

```powershell
docker compose down -v
```

Build lai rieng tung service:

```powershell
docker compose build backend
docker compose build frontend
```

## Chay Tung Docker Image Rieng Le

Build backend:

```powershell
docker build -t korean-vocab-backend:local ./backend
```

Build frontend:

```powershell
docker build -t korean-vocab-frontend:local ./frontend
```

Neu chay backend container rieng le va PostgreSQL dang nam tren may host, dung:

```powershell
docker run --name korean-vocab-backend --rm -p 3000:3000 --env-file backend/.env -e DB_HOST=host.docker.internal korean-vocab-backend:local
```

Chay frontend:

```powershell
docker run --name korean-vocab-frontend --rm -p 8080:80 korean-vocab-frontend:local
```

## Chay Local Khong Dung Docker

Neu muon chay truc tiep tren may ca nhan, xem huong dan chi tiet:

```text
docs/local-manual-setup.md
```

Tom tat yeu cau:

- Node.js LTS
- PostgreSQL
- Database `korean_vocab`
- Da chay file `database/init.sql`

Backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

## Bien Moi Truong

Backend:

```env
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=korean_vocab
DB_USER=postgres
DB_PASSWORD=postgres
APP_ENV=docker
APP_VERSION=v1.0.0
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Luu y: voi Vite, bien `VITE_API_BASE_URL` duoc dua vao ung dung trong luc build frontend image.

## API

- `GET /api/health`
- `GET /api/config`
- `GET /api/vocabularies`
- `POST /api/vocabularies`
- `DELETE /api/vocabularies/:id`
- `GET /api/quiz`

## Database

Ung dung dung bang `vocabularies`.

Cot chinh:

- `id`
- `korean`
- `romanization`
- `vietnamese_meaning`
- `category`
- `example_sentence`
- `created_at`

Seed data nam tai:

```text
database/init.sql
```

File nay tao bang `vocabularies` va seed 50 tu vung tieng Han co ban.

## Lo Trinh Lab Tiep Theo

Da hoan thanh:

- App local.
- Dockerfile cho backend.
- Dockerfile cho frontend.
- Docker Compose cho frontend, backend, PostgreSQL.

Nen lam tiep:

1. Kubernetes manifests.
2. ConfigMap/Secret.
3. PersistentVolumeClaim cho PostgreSQL.
4. Helm chart.
5. ArgoCD GitOps deployment.
