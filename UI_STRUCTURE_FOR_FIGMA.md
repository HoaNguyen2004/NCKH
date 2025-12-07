# 📐 Cấu Trúc Giao Diện - AI Market Filter

> Tài liệu mô tả chi tiết cấu trúc giao diện để sử dụng với AI Figma rework.

---

## 🎨 Tổng Quan Hệ Thống

### Thông tin chung
- **Tên dự án**: AI Market Filter
- **Mục đích**: Hệ thống lọc và quản lý bài đăng mua bán từ mạng xã hội sử dụng AI
- **Framework**: React + TypeScript + Tailwind CSS
- **UI Library**: shadcn/ui components
- **Responsive**: Desktop-first, hỗ trợ tablet

### Color Palette
```
Primary Blue: #3B82F6 (blue-500)
Primary Green: #22C55E (green-500)  
Primary Orange: #F97316 (orange-500)
Primary Purple: #8B5CF6 (purple-500)
Primary Pink: #EC4899 (pink-500)

Background: #F9FAFB (gray-50)
Card Background: #FFFFFF
Border: #E5E7EB (gray-200)
Text Primary: #111827 (gray-900)
Text Secondary: #6B7280 (gray-500)
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: font-bold
- **Body**: font-normal
- **Sizes**: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)

---

## 📱 Layout Chính

### 1. App Layout
```
┌─────────────────────────────────────────────────────────────┐
│                        App Container                         │
│ ┌───────────┬─────────────────────────────────────────────┐ │
│ │           │                                             │ │
│ │  Sidebar  │              Main Content                   │ │
│ │  (256px)  │              (flex-1)                       │ │
│ │           │                                             │ │
│ │           │  ┌─────────────────────────────────────┐   │ │
│ │           │  │           Header                     │   │ │
│ │           │  ├─────────────────────────────────────┤   │ │
│ │           │  │                                     │   │ │
│ │           │  │           Page Content              │   │ │
│ │           │  │           (overflow-auto)           │   │ │
│ │           │  │                                     │   │ │
│ │           │  └─────────────────────────────────────┘   │ │
│ └───────────┴─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧭 Sidebar Component

### Cấu trúc
```
┌─────────────────────────┐
│ Logo + Brand Name       │  h-16, border-b
├─────────────────────────┤
│                         │
│ Navigation Menu         │  flex-1, overflow-auto
│ ├─ Dashboard            │
│ ├─ Users (Admin only)   │
│ ├─ Posts                │
│ ├─ Scraper              │
│ ├─ Saved Posts          │  ← NEW
│ ├─ Products             │
│ ├─ Leads                │
│ ├─ Conversations        │
│ ├─ Reports              │
│ ├─ AI Settings          │
│ └─ Data Sources         │
│                         │
├─────────────────────────┤
│ User Profile Section    │  border-t
│ ├─ Avatar               │
│ ├─ Name                 │
│ ├─ Role Badge           │
│ └─ Logout Button        │
└─────────────────────────┘
```

### Menu Item States
- **Normal**: bg-transparent, text-gray-600
- **Hover**: bg-gray-100, text-gray-900
- **Active**: bg-blue-50, text-blue-700, border-l-4 border-blue-700

### Role-based Menu
- **Admin**: Full menu
- **Manager**: Dashboard, Posts, Products, Leads, Reports
- **Sales**: Dashboard, Posts, Leads, Conversations

---

## 📊 Dashboard Pages

### Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Trang quản trị" + Subtitle                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Total   │ Active  │ API     │ System  │  Stats Cards     │
│ │ Users   │ Sessions│ Calls   │ Uptime  │  (4 columns)     │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬───────────────────────┐          │
│ │                       │                       │          │
│ │   System Health       │   Recent Activities   │          │
│ │   (Progress bars)     │   (List with icons)   │          │
│ │                       │                       │          │
│ └───────────────────────┴───────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ Quick Actions: [Manage Users] [Backup] [Logs] [Analytics]  │
└─────────────────────────────────────────────────────────────┘
```

### Manager Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header + Date Range Selector                                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Revenue │ Leads   │ Conv.   │ Team    │  Stats Cards     │
│ │         │         │ Rate    │ Members │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬───────────────────────┐          │
│ │   Team Performance    │   Product Trends      │          │
│ │   (Bar Chart)         │   (Line Chart)        │          │
│ └───────────────────────┴───────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ Quick Actions: [Manage Team] [View Leads] [Reports] [Goals]│
└─────────────────────────────────────────────────────────────┘
```

### Sales Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Trang bán hàng"                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ My      │ Active  │ Calls   │ Conv.   │  Stats Cards     │
│ │ Leads   │ Chats   │ Made    │ Rate    │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬───────────────────────┐          │
│ │   Urgent Leads        │   Recent Chats        │          │
│ │   (Priority List)     │   (Chat Preview)      │          │
│ └───────────────────────┴───────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ Quick Actions: [Make Call] [Send Message] [Add Lead]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Posts Management Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Quản lý bài đăng" + Real-time Status + Refresh     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐        │
│ │ Total   │ Buying  │ Selling │ Facebook│ Today   │ Stats  │
│ │ Posts   │         │         │         │         │        │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘        │
├─────────────────────────────────────────────────────────────┤
│ Card: Danh sách bài đăng                                    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Header: Title + Filter Dropdowns + Search               ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Table:                                                  ││
│ │ ┌────────┬─────┬───────┬────────┬──────┬─────┬────────┐││
│ │ │Content │Type │Category│Platform│Author│Price│Actions│││
│ │ ├────────┼─────┼───────┼────────┼──────┼─────┼────────┤││
│ │ │ ...    │Badge│Badge  │Badge   │Text  │Price│Buttons│││
│ │ └────────┴─────┴───────┴────────┴──────┴─────┴────────┘││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Pagination: [< Trước] [1/5] [Sau >]                     ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Pagination Component
```
┌─────────────────────────────────────────────────────────────┐
│ Hiển thị 1-15 trong tổng số 150 bài    [<Trước] 1/10 [Sau>]│
└─────────────────────────────────────────────────────────────┘
```

### Table Row Actions
- Add to Leads (green icon)
- View Original (eye icon)
- Archive (archive icon)
- Delete (red trash icon)

---

## 🔍 Scraper Page

### Layout với 3 Mode
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Quét dữ liệu" + Server Status + Refresh            │
├─────────────────────────────────────────────────────────────┤
│ [Offline Warning Banner - nếu server offline]               │
├─────────────────────────────────────────────────────────────┤
│ [Status Message Banner - success/error/loading]             │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬───────────────────────┐          │
│ │  Step 1: Login        │  Mode Selection       │          │
│ │  ┌─────────────────┐  │  ┌─────┬─────┬─────┐  │          │
│ │  │ Email Input     │  │  │Search│Feed │Batch│  │          │
│ │  │ [Login Button]  │  │  └─────┴─────┴─────┘  │          │
│ │  └─────────────────┘  │                       │          │
│ └───────────────────────┴───────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ [Mode-specific Content - full width]                        │
│                                                             │
│ Search Mode:                                                │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Group Link Input                                        ││
│ │ Keywords Textarea                                       ││
│ │ [🔍 Quét Search Button]                                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Feed Mode:                                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Feed Link Input + Quick Buttons                         ││
│ │ Scroll Count Slider (5-30)                              ││
│ │ [🚀 Quét Feed Button]                                   ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Batch Mode (NEW):                                           │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Tabs: [Nhập thủ công] [Từ Excel] [Từ Database]          ││
│ │ ┌─────────────────────────────────────────────────────┐ ││
│ │ │ Tab Content varies by selection                     │ ││
│ │ └─────────────────────────────────────────────────────┘ ││
│ │ [🚀 Bắt đầu quét Batch Button]                          ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Results Card (nếu có kết quả)                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Header: Kết quả + Count + Badges (Mua/Bán)              ││
│ │ ┌─────────────────────────────────────────────────────┐ ││
│ │ │ Result Item 1: Image + Badges + Content + Price     │ ││
│ │ │ Result Item 2: ...                                  │ ││
│ │ └─────────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Batch Import - Tab Content

#### Tab: Nhập thủ công
```
┌─────────────────────────────────────────────────────────────┐
│ Label: Danh sách links cần quét                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 1. [Input: https://facebook.com/...        ] [X]        ││
│ │ 2. [Input: https://facebook.com/...        ] [X]        ││
│ │ 3. [Input: https://facebook.com/...        ] [X]        ││
│ └─────────────────────────────────────────────────────────┘│
│ [+ Thêm link mới] (dashed border button)                    │
└─────────────────────────────────────────────────────────────┘
```

#### Tab: Từ Excel
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐│
│ │                 Upload Zone (dashed border)              ││
│ │                                                         ││
│ │              [Upload Icon]                              ││
│ │         Kéo thả file Excel vào đây hoặc                 ││
│ │              [Chọn file Excel]                          ││
│ │                                                         ││
│ │   [Selected File Preview - nếu đã chọn file]            ││
│ │                                                         ││
│ │   Hỗ trợ: .xlsx, .xls, .csv                            ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### Tab: Từ Database
```
┌─────────────────────────────────────────────────────────────┐
│ Connection String:                                          │
│ [Input: mongodb://localhost:27017/mydb                    ] │
│ Hỗ trợ: MongoDB, MySQL, PostgreSQL                         │
│                                                             │
│ Query lấy danh sách links:                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SELECT url FROM links WHERE active = 1                  ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│ [Test kết nối]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Saved Posts Page (NEW)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Bài đăng đã lưu (Lọc tay)"                         │
│ Actions: [Xuất Excel] [Nhập dữ liệu] [+ Thêm bài đăng]      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐        │
│ │ Total   │ Starred │ Buying  │ Selling │Completed│ Stats  │
│ │ Saved   │         │         │         │         │        │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘        │
├─────────────────────────────────────────────────────────────┤
│ Filters Card:                                               │
│ [Search Input] [Type ▼] [Status ▼] [Platform ▼] [Delete(n)]│
├─────────────────────────────────────────────────────────────┤
│ Table Card:                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [☐] [★] Content │Type│Category│Platform│Author│Status│⋮││
│ │ ─────────────────────────────────────────────────────── ││
│ │ [☐] [★] Post 1  │Mua │Phone   │Facebook│User A│New   │⋮││
│ │ [☐] [☆] Post 2  │Bán │Laptop  │Zalo    │User B│Done  │⋮││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Pagination: Showing 1-15 of 50    [<] 1/4 [>]           ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Status Badges
- **Mới (new)**: bg-blue-100 text-blue-700
- **Đang xử lý (processing)**: bg-yellow-100 text-yellow-700
- **Đã liên hệ (contacted)**: bg-purple-100 text-purple-700
- **Hoàn thành (completed)**: bg-green-100 text-green-700
- **Lưu trữ (archived)**: bg-gray-100 text-gray-700

### Row Actions Dropdown
```
┌─────────────────────────┐
│ 👁 Xem chi tiết         │
│ ✏️ Chỉnh sửa            │
│ 🔗 Xem bài gốc          │
├─────────────────────────┤
│ ⏱ Đánh dấu đang xử lý   │
│ 👤 Đánh dấu đã liên hệ  │
│ ✓ Đánh dấu hoàn thành   │
├─────────────────────────┤
│ 🗑 Xóa                   │
└─────────────────────────┘
```

### Add Post Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ [X]                          Thêm bài đăng thủ công         │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Nội dung bài đăng *                                         │
│ ┌─────────────────────────────────────────────────────────┐│
│ │                                                         ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Tác giả             │ Nền tảng            │              │
│ │ [Input           ]  │ [Dropdown ▼      ]  │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                             │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Loại bài đăng       │ Danh mục            │              │
│ │ [Dropdown ▼      ]  │ [Input           ]  │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                             │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Giá (VNĐ)           │ Link bài gốc        │              │
│ │ [Input           ]  │ [Input           ]  │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                             │
│ Tags (phân cách bằng dấu phẩy)                              │
│ [Input: iphone, urgent, hot                              ]  │
│                                                             │
│ Ghi chú                                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                              [Hủy]  [+ Thêm bài đăng]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Management Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Quản lý người dùng" + [+ Thêm người dùng]          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐                            │
│ │ Total   │ Active  │ New     │  Stats Cards (3 columns)   │
│ │ Users   │ Users   │ Month   │                            │
│ └─────────┴─────────┴─────────┘                            │
├─────────────────────────────────────────────────────────────┤
│ Table Card:                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Avatar │ Name/Email │ Role │ Status │ Last Active │ Act ││
│ │ ─────────────────────────────────────────────────────── ││
│ │ [Img]  │ User Name  │Badge │ Badge  │ Date        │ ... ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Products Management Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Quản lý sản phẩm" + [+ Thêm sản phẩm theo dõi]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Total   │ High    │ Buying  │ Selling │  Stats Cards     │
│ │Products │ Demand  │ Posts   │ Posts   │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ Search + Filters                                            │
├─────────────────────────────────────────────────────────────┤
│ Product Cards Grid (3 columns):                             │
│ ┌─────────────────┬─────────────────┬─────────────────┐    │
│ │ Product Card 1  │ Product Card 2  │ Product Card 3  │    │
│ │ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │    │
│ │ │ Image       │ │ │ Image       │ │ │ Image       │ │    │
│ │ ├─────────────┤ │ ├─────────────┤ │ ├─────────────┤ │    │
│ │ │ Name        │ │ │ Name        │ │ │ Name        │ │    │
│ │ │ Category    │ │ │ Category    │ │ │ Category    │ │    │
│ │ │ Price Range │ │ │ Price Range │ │ │ Price Range │ │    │
│ │ │ Demand/Trend│ │ │ Demand/Trend│ │ │ Demand/Trend│ │    │
│ │ │ [Edit][Del] │ │ │ [Edit][Del] │ │ │ [Edit][Del] │ │    │
│ │ └─────────────┘ │ └─────────────┘ │ └─────────────┘ │    │
│ └─────────────────┴─────────────────┴─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Leads Management Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Quản lý khách hàng tiềm năng" + [+ Thêm KH]        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Total   │ High    │ Contacted│Converted│  Stats Cards    │
│ │ Leads   │ Priority│         │         │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ Search + Filters                                            │
├─────────────────────────────────────────────────────────────┤
│ Table:                                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │Priority│Lead│Contact│Interest│Type│Budget│Status│Actions││
│ │ 🔴     │Name│Phone  │Product │Mua │10tr  │New   │ ...   ││
│ │ 🟡     │Name│Zalo   │Product │Bán │5tr   │Done  │ ...   ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Priority Indicators
- 🔴 Cao (high): red
- 🟡 Trung bình (medium): yellow  
- 🟢 Thấp (low): green

---

## 💬 Conversations Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Cuộc trò chuyện"                                   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Total   │ Unread  │ Avg     │ Satis-  │  Stats Cards     │
│ │ Chats   │         │ Response│ faction │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────────────────────────┐  │
│ │                 │                                     │  │
│ │  Chat List      │         Chat Window                 │  │
│ │  (1/3 width)    │         (2/3 width)                 │  │
│ │                 │                                     │  │
│ │ ┌─────────────┐ │  ┌─────────────────────────────┐   │  │
│ │ │ Chat Item 1 │ │  │ Header: Name + Status       │   │  │
│ │ │ Avatar+Name │ │  ├─────────────────────────────┤   │  │
│ │ │ Preview     │ │  │                             │   │  │
│ │ │ Time + Badge│ │  │   Messages Area             │   │  │
│ │ ├─────────────┤ │  │   (scroll)                  │   │  │
│ │ │ Chat Item 2 │ │  │                             │   │  │
│ │ └─────────────┘ │  ├─────────────────────────────┤   │  │
│ │                 │  │ [Input         ] [Send]     │   │  │
│ │                 │  └─────────────────────────────┘   │  │
│ └─────────────────┴─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Reports Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Báo cáo và phân tích"                              │
│ Actions: [Date Range Picker] [Export ▼]                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┬─────────┐                  │
│ │ Total   │ Buying  │ Selling │ Avg     │  Stats Cards     │
│ │ Posts   │ Posts   │ Posts   │ Conf.   │                  │
│ └─────────┴─────────┴─────────┴─────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬───────────────────────┐          │
│ │  Category Distribution│  Location Distribution│          │
│ │  (Pie/Bar Chart)      │  (Map/Bar Chart)      │          │
│ └───────────────────────┴───────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐          │
│ │           Price Trend Chart (Line)            │          │
│ └───────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Settings Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Cài đặt hệ thống AI"                               │
├─────────────────────────────────────────────────────────────┤
│ AI Models Grid (2x2):                                       │
│ ┌───────────────────────┬───────────────────────┐          │
│ │  NLP Model Card       │  OCR Model Card       │          │
│ │  ├─ Status: Active    │  ├─ Status: Active    │          │
│ │  ├─ Accuracy: 95%     │  ├─ Accuracy: 92%     │          │
│ │  ├─ Performance Bar   │  ├─ Performance Bar   │          │
│ │  └─ [Configure]       │  └─ [Configure]       │          │
│ ├───────────────────────┼───────────────────────┤          │
│ │  Spam Detector Card   │  Price Extractor Card │          │
│ │  ├─ Status: Active    │  ├─ Status: Active    │          │
│ │  ├─ Accuracy: 98%     │  ├─ Accuracy: 88%     │          │
│ │  ├─ Performance Bar   │  ├─ Performance Bar   │          │
│ │  └─ [Retrain]         │  └─ [Configure]       │          │
│ └───────────────────────┴───────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Data Sources Page

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Kết nối nguồn dữ liệu" + [+ Thêm nguồn mới]        │
├─────────────────────────────────────────────────────────────┤
│ Sources Cards Grid:                                         │
│ ┌───────────────────────┬───────────────────────┐          │
│ │  Facebook             │  Instagram            │          │
│ │  ├─ Status: Connected │  ├─ Status: Disconn.  │          │
│ │  ├─ Posts: 1,234      │  ├─ Posts: 0          │          │
│ │  ├─ Last Sync: 2h ago │  ├─ Last Sync: Never  │          │
│ │  └─ [Sync] [Disconnect│  └─ [Connect]         │          │
│ └───────────────────────┴───────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Auth Pages

### Login Page
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │      Logo           │                  │
│                    │   AI Market Filter  │                  │
│                    │                     │                  │
│                    │   Email             │                  │
│                    │   [Input         ]  │                  │
│                    │                     │                  │
│                    │   Password          │                  │
│                    │   [Input         ]  │                  │
│                    │                     │                  │
│                    │   [☐] Remember me   │                  │
│                    │                     │                  │
│                    │   [  Đăng nhập  ]   │                  │
│                    │                     │                  │
│                    │   Forgot password?  │                  │
│                    │   Don't have account│                  │
│                    └─────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Register Page
```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────────┐                  │
│                    │      Logo           │                  │
│                    │                     │                  │
│                    │   Full Name         │                  │
│                    │   [Input         ]  │                  │
│                    │                     │                  │
│                    │   Email             │                  │
│                    │   [Input         ]  │                  │
│                    │                     │                  │
│                    │   Password          │                  │
│                    │   [Input         ]  │                  │
│                    │                     │                  │
│                    │   Confirm Password  │                  │
│                    │   [Input         ]  │                  │
│                    │                     │                  │
│                    │   Role              │                  │
│                    │   [Dropdown ▼    ]  │                  │
│                    │                     │                  │
│                    │   [  Đăng ký    ]   │                  │
│                    │                     │                  │
│                    │   Already have acc? │                  │
│                    └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Common Components

### Stats Card
```
┌─────────────────────────────┐
│ Title (text-sm, gray)       │
│ Value (text-3xl, bold)      │
│ [Optional: +12% indicator]  │
└─────────────────────────────┘
Gradient backgrounds: from-{color}-50 to-{color}-50
Border: border-{color}-200
```

### Badge Variants
```
Type Badges:
- Buying: bg-green-100 text-green-700
- Selling: bg-orange-100 text-orange-700
- Other: bg-gray-100 text-gray-700

Status Badges:
- Active/Online: bg-green-100 text-green-700
- Inactive/Offline: bg-gray-100 text-gray-500
- Warning: bg-yellow-100 text-yellow-700
- Error: bg-red-100 text-red-700

Platform Badges:
- Facebook: bg-blue-50 text-blue-700 border-blue-200
- Zalo: bg-blue-50 text-blue-700
- Instagram: bg-pink-50 text-pink-700
```

### Button Variants
```
Primary: bg-blue-600 hover:bg-blue-700 text-white
Success: bg-green-600 hover:bg-green-700 text-white
Danger: bg-red-600 hover:bg-red-700 text-white
Outline: border border-gray-300 hover:bg-gray-50
Ghost: hover:bg-gray-100
```

### Dialog/Modal
```
┌─────────────────────────────────────────────────────────────┐
│ [X]                              Title                      │
│ ─────────────────────────────────────────────────────────── │
│ Description (optional, text-sm, gray)                       │
│                                                             │
│ Content Area                                                │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                              [Cancel]  [Primary Action]     │
└─────────────────────────────────────────────────────────────┘
Max-width: sm:max-w-[600px]
Background: white
Border-radius: rounded-lg
Shadow: shadow-lg
```

### Table Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header Row (bg-gray-50, font-semibold)                      │
├─────────────────────────────────────────────────────────────┤
│ Data Row (hover:bg-gray-50, border-b)                       │
│ Data Row                                                    │
│ Data Row                                                    │
└─────────────────────────────────────────────────────────────┘
```

### Pagination
```
┌─────────────────────────────────────────────────────────────┐
│ Hiển thị 1-15 trong tổng số 150    [<Trước] [1/10] [Sau>]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

```
sm: 640px   - Mobile landscape
md: 768px   - Tablet portrait
lg: 1024px  - Tablet landscape / Small desktop
xl: 1280px  - Desktop
2xl: 1536px - Large desktop
```

### Mobile Adaptations
- Sidebar: Collapsible drawer
- Tables: Horizontal scroll
- Grid: Single column
- Cards: Full width

---

## 🎯 Key Interactions

### Hover States
- Cards: shadow-md transition
- Buttons: Background color change
- Table rows: bg-gray-50
- Links: text-blue-600 underline

### Loading States
- Spinner: animate-spin
- Skeleton: animate-pulse bg-gray-200
- Button: Disabled + Loader icon

### Empty States
- Icon (gray-300)
- Title (gray-400)
- Description (gray-400, text-sm)
- Action button (optional)

---

## 📝 Notes for Figma Implementation

1. **Component Library**: Tạo library với tất cả base components (Button, Input, Badge, Card, etc.)

2. **Auto Layout**: Sử dụng auto layout cho tất cả containers

3. **Variables**: Tạo color variables và text styles theo design system

4. **Variants**: Tạo component variants cho các states (default, hover, active, disabled)

5. **Responsive**: Tạo frames cho Desktop (1440px) và Tablet (768px)

6. **Icons**: Sử dụng Lucide icons hoặc tương đương

7. **Spacing**: Sử dụng 4px grid system (4, 8, 12, 16, 24, 32, 48, 64)

8. **Border Radius**: 
   - Small: 4px (rounded)
   - Medium: 8px (rounded-lg)
   - Large: 12px (rounded-xl)
   - Full: 9999px (rounded-full)

---

*Tài liệu này được tạo tự động từ codebase. Cập nhật lần cuối: 2024*

