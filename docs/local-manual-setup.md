# Local Manual Setup

Tài liệu này dành cho trường hợp bạn muốn chạy app trực tiếp trên máy cá nhân, chưa dùng Docker.

Sau này khi có Docker hoặc docker-compose, bạn sẽ không cần tự cài PostgreSQL thủ công theo cách này nữa.

## Cần Cài Gì Trước

Bạn cần cài 2 thứ:

1. **Node.js LTS**
2. **PostgreSQL**

Khuyến nghị:

- Node.js: bản LTS, ví dụ Node.js 20 hoặc 22.
- PostgreSQL: bản 15, 16 hoặc 17 đều được.

## Cài Node.js

### Windows

1. Vào trang tải Node.js:

```text
https://nodejs.org/
```

2. Tải bản **LTS**.
3. Cài đặt bình thường, cứ để mặc định.
4. Mở PowerShell mới và kiểm tra:

```powershell
node -v
npm -v
```

Nếu thấy version, ví dụ `v20.x.x` hoặc `v22.x.x`, là được.

### Linux Ubuntu

```bash
sudo apt update
sudo apt install -y nodejs npm
node -v
npm -v
```

## Cài PostgreSQL

PostgreSQL là database server. App backend sẽ kết nối tới PostgreSQL để đọc/ghi bảng `vocabularies`.

### Windows

1. Vào trang tải PostgreSQL:

```text
https://www.postgresql.org/download/windows/
```

2. Tải installer từ EDB.
3. Khi cài, chọn các thành phần mặc định:

- PostgreSQL Server
- pgAdmin 4
- Command Line Tools

4. Khi installer hỏi password cho user `postgres`, hãy đặt mật khẩu dễ nhớ cho lab, ví dụ:

```text
postgres
```

5. Port để mặc định:

```text
5432
```

6. Cài xong, mở PowerShell mới và kiểm tra:

```powershell
psql --version
```

Nếu PowerShell báo không tìm thấy `psql`, bạn vẫn có thể dùng pgAdmin. Hoặc thêm thư mục `bin` của PostgreSQL vào PATH, ví dụ:

```text
C:\Program Files\PostgreSQL\16\bin
```

Số `16` có thể khác tùy phiên bản bạn cài.

### Linux Ubuntu

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
```

Nếu status là `active (running)` thì PostgreSQL đã chạy.

## Tạo Database

Bạn chỉ cần tạo database tên:

```text
korean_vocab
```

Có 2 cách: dùng pgAdmin cho người mới, hoặc dùng terminal.

## Cách 1: Tạo Database Bằng pgAdmin Trên Windows

1. Mở **pgAdmin 4**.
2. Bên trái, mở `Servers`.
3. Nhập password của user `postgres`.
4. Chuột phải vào `Databases`.
5. Chọn `Create` -> `Database`.
6. Nhập tên database:

```text
korean_vocab
```

7. Bấm `Save`.

## Chạy File init.sql Bằng pgAdmin

Sau khi tạo database:

1. Click vào database `korean_vocab`.
2. Chọn menu `Tools` -> `Query Tool`.
3. Mở file:

```text
korean-vocab-app/database/init.sql
```

4. Copy toàn bộ nội dung file `init.sql`.
5. Dán vào Query Tool.
6. Bấm nút chạy hình tia sét hoặc nhấn `F5`.

Kiểm tra dữ liệu:

```sql
SELECT * FROM vocabularies;
```

Nếu thấy khoảng 50 dòng từ vựng tiếng Hàn, database đã sẵn sàng.

## Cách 2: Tạo Database Bằng Terminal

### Windows PowerShell

Nếu `psql` đã chạy được trong PowerShell:

```powershell
createdb -U postgres korean_vocab
```

Sau đó chạy file SQL:

```powershell
cd D:\DevOps\Fsoft\3_Docker\lab\korean-vocab-app
psql -U postgres -d korean_vocab -f database/init.sql
```

Khi được hỏi password, nhập password bạn đặt lúc cài PostgreSQL.

Kiểm tra:

```powershell
psql -U postgres -d korean_vocab -c "SELECT COUNT(*) FROM vocabularies;"
```

Kết quả nên là:

```text
50
```

### Linux Ubuntu

Từ thư mục project:

```bash
cd korean-vocab-app
sudo -u postgres createdb korean_vocab
sudo -u postgres psql -d korean_vocab -f database/init.sql
sudo -u postgres psql -d korean_vocab -c "SELECT COUNT(*) FROM vocabularies;"
```

Kết quả nên là:

```text
50
```

## Chạy Backend

### Windows PowerShell

Từ thư mục project:

```powershell
cd D:\DevOps\Fsoft\3_Docker\lab\korean-vocab-app\backend
Copy-Item .env.example .env
npm install
npm run dev
```

### Linux/macOS

```bash
cd korean-vocab-app/backend
cp .env.example .env
npm install
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

Kiểm tra backend:

```text
http://localhost:3000/api/health
```

Nếu mở trên trình duyệt thấy JSON có `"status":"ok"` và `"database":"connected"` là backend đã kết nối database thành công.

## Chạy Frontend

Mở thêm một terminal mới. Đừng tắt terminal backend.

### Windows PowerShell

```powershell
cd D:\DevOps\Fsoft\3_Docker\lab\korean-vocab-app\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

### Linux/macOS

```bash
cd korean-vocab-app/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## Lỗi Thường Gặp

### Backend báo database disconnected

Kiểm tra PostgreSQL đã chạy chưa.

Windows:

- Mở app **Services**.
- Tìm service tên kiểu `postgresql-x64-16`.
- Đảm bảo service đang `Running`.

Linux:

```bash
sudo systemctl status postgresql
```

### Backend báo password authentication failed

Mở file:

```text
backend/.env
```

Sửa dòng:

```env
DB_PASSWORD=postgres
```

thành đúng password PostgreSQL của bạn.

### Frontend không tải được danh sách từ vựng

Kiểm tra backend đã chạy chưa:

```text
http://localhost:3000/api/health
```

Nếu backend chưa chạy, frontend sẽ không lấy được dữ liệu.
