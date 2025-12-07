# Scripts

## cleanup-sales-posts.js

Script để xóa tất cả bài đăng của sales users, chỉ giữ lại bài đăng của admin.

### Cách sử dụng:

**Cách 1: Chạy script trực tiếp**
```bash
cd server
node scripts/cleanup-sales-posts.js
```

**Cách 2: Gọi API endpoint**
```bash
# Sử dụng curl
curl -X DELETE http://localhost:5000/api/posts/cleanup/sales

# Hoặc sử dụng Postman/Thunder Client
# Method: DELETE
# URL: http://localhost:5000/api/posts/cleanup/sales
```

### Script sẽ:
1. Tìm tất cả user có role = 'sales'
2. Xóa tất cả bài đăng có `scrapedBy` hoặc `scrapedByEmail` thuộc về sales users
3. Giữ lại bài đăng của admin hoặc không có `scrapedBy`/`scrapedByEmail`

### Kết quả:
- Hiển thị số lượng sales users tìm thấy
- Hiển thị số lượng bài đăng đã xóa
- Hiển thị số lượng bài đăng còn lại

