# Hướng dẫn nhanh - Kết nối MongoDB

## Bước 1: Cài đặt Backend Dependencies

```bash
cd server
npm install
```

## Bước 2: Cấu hình MongoDB

Tạo file `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/aifilter
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

**Lưu ý:** 
- Nếu dùng MongoDB Atlas (Cloud), thay `MONGODB_URI` bằng connection string từ Atlas
- Đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên mạnh trong production

## Bước 3: Khởi động MongoDB

### Nếu dùng MongoDB Local:
```bash
# Windows
mongod

# Linux/Mac  
sudo systemctl start mongod
```

### Nếu dùng MongoDB Atlas:
- Đảm bảo đã tạo cluster và có connection string
- Không cần cài đặt MongoDB local

## Bước 4: Chạy Backend Server

```bash
cd server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## Bước 5: Cấu hình Frontend (Tùy chọn)

Tạo file `.env` trong thư mục gốc (nếu backend chạy ở port khác):

```env
VITE_API_URL=http://localhost:5000/api
```

## Bước 6: Chạy Frontend

```bash
npm run dev
```

## Kiểm tra

1. Mở trình duyệt: `http://localhost:5173` (hoặc port mà Vite sử dụng)
2. Thử đăng ký tài khoản mới
3. Kiểm tra MongoDB để xác nhận user đã được lưu:
   ```bash
   # Nếu dùng MongoDB local
   mongosh
   use aifilter
   db.users.find()
   ```

## Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB đang chạy (local) hoặc connection string đúng (Atlas)
- Kiểm tra firewall/network settings

### Lỗi CORS
- Đảm bảo backend đã cài đặt `cors` package
- Kiểm tra `VITE_API_URL` trong frontend

### Lỗi "Cannot find module"
- Chạy `npm install` lại trong cả frontend và backend
- Xóa `node_modules` và `package-lock.json`, sau đó `npm install` lại

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập  
- `GET /api/auth/verify` - Xác thực token

## Cấu trúc Database

Collection: `users`
- `fullName`: String
- `email`: String (unique)
- `phone`: String
- `company`: String (optional)
- `location`: String (optional)
- `role`: String (smb, sales, manager, student, admin)
- `password`: String (hashed với bcrypt)
- `createdAt`: Date
- `updatedAt`: Date

