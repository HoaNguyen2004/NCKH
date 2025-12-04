# ✅ CHECKLIST - Kiểm tra trước khi chạy

## Bước 1: Kiểm tra MongoDB
- [ ] MongoDB đang chạy (Services → MongoDB)
- [ ] Hoặc chạy: `mongod` trong terminal

## Bước 2: Kiểm tra 3 Services

### Service 1: Backend (Port 5000)
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\server"
npm run dev
```
- [ ] Hiển thị: `✅ Connected to MongoDB`
- [ ] Hiển thị: `🚀 Server running on http://localhost:5000`

### Service 2: Scraper (Port 3001)
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\clon chromium\clon chromium"
npm run dev
```
- [ ] Hiển thị: `Running at http://localhost:3001`

### Service 3: Frontend (Port 3000)
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH"
npm run dev
```
- [ ] Hiển thị: `➜ Local: http://localhost:3000/`

## Bước 3: Kiểm tra trên trình duyệt

- [ ] Frontend: http://localhost:3000 → **Có hiển thị trang login**
- [ ] Backend: http://localhost:5000/api/health → **Có hiển thị {"ok":true}**
- [ ] Scraper: http://localhost:3001 → **Có hiển thị trang Facebook Scraper**

## Bước 4: Test tính năng

- [ ] Đăng nhập thành công
- [ ] Click "Quét dữ liệu" → Tab mới mở http://localhost:3001
- [ ] Trang scraper hiển thị bình thường
- [ ] Có thể gửi dữ liệu về và thấy bài viết trên trang "Bài đăng"

---

## 🔧 Nếu có lỗi:

1. **Lỗi: "Cannot find module"**
   → Chạy `npm install` trong thư mục tương ứng

2. **Lỗi: "Port already in use"**
   → Đóng ứng dụng đang dùng port đó

3. **Lỗi: "MongoDB connection error"**
   → Khởi động MongoDB service

4. **Lỗi: "This site can't be reached"**
   → Kiểm tra service có đang chạy không

---

## 🚀 Cách nhanh nhất:

**Double-click file:** `start-all.bat`

Sau đó đợi 15 giây và mở: http://localhost:3000


