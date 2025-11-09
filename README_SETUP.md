# Hướng dẫn thiết lập MongoDB và Backend

## Yêu cầu
- Node.js (v14 trở lên)
- MongoDB (Local hoặc MongoDB Atlas)
- npm hoặc yarn

## Cài đặt Backend

1. **Cài đặt dependencies cho backend:**
```bash
cd server
npm install
```

2. **Cấu hình MongoDB:**
   - Tạo file `.env` trong thư mục `server`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/aifilter
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=5000
   ```
   
   - Hoặc sử dụng MongoDB Atlas (Cloud):
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aifilter?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=5000
   ```

3. **Khởi động MongoDB:**
   - Nếu dùng MongoDB local, đảm bảo MongoDB đang chạy:
   ```bash
   # Windows
   mongod
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

4. **Chạy backend server:**
```bash
cd server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## Cài đặt Frontend

1. **Cài đặt dependencies (nếu chưa có):**
```bash
npm install
```

2. **Cấu hình API URL:**
   - Tạo file `.env` trong thư mục gốc:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Chạy frontend:**
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác)

## Sử dụng

1. **Đăng ký tài khoản mới:**
   - Truy cập trang đăng ký
   - Điền đầy đủ thông tin
   - Nhấn "Tạo tài khoản"
   - Tài khoản sẽ được lưu vào MongoDB

2. **Đăng nhập:**
   - Sử dụng email và mật khẩu đã đăng ký
   - Hoặc sử dụng tài khoản demo (cần tạo trước trong database)

## API Endpoints

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify` - Xác thực token (cần Authorization header)

## Cấu trúc Database

Collection: `users`
- `fullName`: String (required)
- `email`: String (required, unique)
- `phone`: String (required)
- `company`: String (optional)
- `location`: String (optional)
- `role`: String (required, enum: smb, sales, manager, student, admin)
- `password`: String (required, hashed)
- `createdAt`: Date
- `updatedAt`: Date

## Lưu ý

- Mật khẩu được hash bằng bcrypt trước khi lưu vào database
- JWT token được lưu trong localStorage sau khi đăng nhập/đăng ký thành công
- Token có thời hạn 7 ngày
- Đổi JWT_SECRET trong production để bảo mật

