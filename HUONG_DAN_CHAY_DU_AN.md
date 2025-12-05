# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN TỪ ĐẦU

## 📋 YÊU CẦU HỆ THỐNG

### 1. Cài đặt phần mềm cần thiết:
- ✅ **Node.js** (version 18 trở lên)
- ✅ **MongoDB** (đang chạy trên localhost:27017)
- ✅ **Git** (nếu cần clone)

---

## 🎯 CÁC BƯỚC CHẠY DỰ ÁN

### **BƯỚC 1: Kiểm tra MongoDB**

MongoDB phải đang chạy. Kiểm tra bằng cách:
```bash
# Mở Command Prompt hoặc PowerShell
mongod --version
```

Nếu chưa cài, tải tại: https://www.mongodb.com/try/download/community

**Khởi động MongoDB:**
```bash
# Windows: Mở Services và start MongoDB service
# Hoặc chạy:
mongod
```

---

### **BƯỚC 2: Cài đặt Dependencies (Lần đầu tiên)**

Mở **3 cửa sổ Terminal/PowerShell** riêng biệt:

#### **Terminal 1 - Frontend:**
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH"
npm install
```

#### **Terminal 2 - Backend Server:**
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\server"
npm install
```

#### **Terminal 3 - Scraper (clon chromium):**
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\clon chromium\clon chromium"
npm install
```

---

### **BƯỚC 3: Chạy Backend Server (Port 5000)**

Trong **Terminal 2** (Backend):
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\server"
npm run dev
```

**Kết quả mong đợi (dùng MongoDB Atlas - identity_db):**
```
✅ Connected to MongoDB: mongodb+srv://quyet:dKsuuAc3ODjC1wVc@cluster0.9mytcrv.mongodb.net/identity_db
🚀 Server + Socket.IO running on http://localhost:5000
```

⚠️ **Nếu lỗi:** Kiểm tra MongoDB có đang chạy không!

---

### **BƯỚC 4: Chạy Scraper Server (Port 3001)**

Trong **Terminal 3** (Scraper):
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\clon chromium\clon chromium"
npm run dev
```

**Kết quả mong đợi:**
```
Running at http://localhost:3001
```

---

### **BƯỚC 5: Chạy Frontend (Port 3000)**

Trong **Terminal 1** (Frontend):
```bash
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH"
npm run dev
```

**Kết quả mong đợi:**
```
VITE v6.3.5  ready

➜  Local:   http://localhost:3000/
```

---

## ✅ KIỂM TRA CÁC SERVICES

Sau khi chạy cả 3 services, bạn sẽ có:

| Service | URL | Port | Trạng thái |
|---------|-----|------|------------|
| **Frontend** | http://localhost:3000 | 3000 | ✅ |
| **Backend API + Socket** | http://localhost:5000 | 5000 | ✅ |
| **Scraper** | http://localhost:3001 | 3001 | ✅ |

---

## 🎮 CÁCH SỬ DỤNG

### **1. Truy cập ứng dụng:**
- Mở trình duyệt: `http://localhost:3000`
- Đăng nhập bằng tài khoản demo:
  - **Admin:** `admin@example.com` / `password`
  - **Manager:** `manager@example.com` / `password`
  - **Sales:** `sales@example.com` / `password`
  
  Hoặc click nút **"Admin"**, **"Manager"**, **"Sales"** trên trang login

### **2. Sử dụng tính năng Quét dữ liệu:**

#### **Từ SalesDashboard:**
1. Sau khi đăng nhập, bạn sẽ ở trang **Sales Dashboard**
2. Click nút **"🕵️ Quét dữ liệu"** (màu tím-xanh ở header)
3. Hoặc click nút **"Quét dữ liệu"** trong phần Quick Actions

#### **Từ trang Bài đăng (PostsManagement):**
1. Click **"Bài đăng"** trong sidebar
2. Click nút **"🕵️ Quét dữ liệu mới"**

### **3. Quét dữ liệu trên trang Scraper:**

Khi click "Quét dữ liệu", tab mới sẽ mở đến `http://localhost:3001`:

1. **Bước 1: Đăng nhập Facebook**
   - Nhập email Facebook
   - Click **"🔐 Đăng nhập & Lưu Cookie (30s)"**
   - Đăng nhập Facebook trong Chrome mở ra (30 giây)

2. **Bước 2: Chọn chế độ quét**
   
   **🔍 Search Mode:**
   - Nhập URL Group/Marketplace
   - Nhập từ khóa (mỗi dòng 1 từ khóa)
   - Click **"🚀 Bước 2: Quét theo Search"**
   
   **📰 Feed Mode:**
   - Nhập URL Feed (hoặc click quick links)
   - Nhập từ khóa lọc
   - Chọn số lần cuộn
   - Click **"📰 Bước 2: Cào Feed + Lọc từ khóa"**

3. **Bước 3: Gửi dữ liệu về**
   - Sau khi quét xong, click **"🚀 Gửi dữ liệu về trang Bài đăng"**
   - Dữ liệu sẽ tự động:
     - Lưu vào MongoDB
     - Phát qua WebSocket
     - Hiển thị trên trang "Bài đăng"

---

## 🔧 XỬ LÝ LỖI

### **Lỗi: "Cannot find module"**
```bash
# Chạy lại npm install trong thư mục tương ứng
npm install
```

### **Lỗi: "Port already in use"**
```bash
# Tìm process đang dùng port và kill
# Windows PowerShell:
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Sau đó kill process:
taskkill /PID <PID_NUMBER> /F
```

### **Lỗi: "MongoDB connection error"**
- Kiểm tra MongoDB đang chạy:
  ```bash
  # Kiểm tra service MongoDB
  # Windows: Services → MongoDB
  ```
- Hoặc khởi động MongoDB:
  ```bash
  mongod
  ```

### **Lỗi: "This site can't be reached"**
- Kiểm tra server có đang chạy không
- Kiểm tra đúng URL và port:
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:5000`
  - Scraper: `http://localhost:3001`

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Cần chạy cả 3 services cùng lúc:**
   - ✅ Frontend (port 3000)
   - ✅ Backend (port 5000)  
   - ✅ Scraper (port 3001)

2. **Thứ tự khởi động:**
   - Backend trước (cần MongoDB)
   - Sau đó Frontend và Scraper (không phụ thuộc)

3. **MongoDB phải chạy trước Backend**

4. **Nếu đóng terminal, services sẽ dừng** - Cần mở lại

---

## 🎯 QUICK START (Tóm tắt nhanh)

```bash
# Terminal 1: Frontend
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH"
npm install  # Chỉ lần đầu
npm run dev

# Terminal 2: Backend  
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\server"
npm install  # Chỉ lần đầu
npm run dev

# Terminal 3: Scraper
cd "D:\nghiencuukhoahoc\NCKH(1)\NCKH\clon chromium\clon chromium"
npm install  # Chỉ lần đầu
npm run dev
```

Sau đó mở: **http://localhost:3000**

---

## 🆘 CẦN TRỢ GIÚP?

Nếu vẫn gặp lỗi, kiểm tra:
1. ✅ MongoDB đang chạy
2. ✅ Cả 3 services đang chạy (3 terminals)
3. ✅ Không có port conflict
4. ✅ Đã cài đặt đầy đủ dependencies

Xem logs trong console để biết lỗi cụ thể!


