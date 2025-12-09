/* server/server.js */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Role = require('./models/Role');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ✅ FIX FAILED TO FETCH — mở CORS full + xử lý preflight
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors());

// Cho phép parse JSON
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Test health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Seed một số role mặc định nếu chưa có
async function seedDefaultRoles() {
  const defaultRoles = [
    {
      key: 'admin',
      name: 'Administrator',
      description: 'Toàn quyền quản trị hệ thống',
      permissions: ['users.read', 'users.write', 'reports.read', 'settings.write']
    },
    {
      key: 'manager',
      name: 'Manager',
      description: 'Quản lý kinh doanh và đội nhóm',
      permissions: ['users.read', 'reports.read', 'leads.read', 'leads.write']
    },
    {
      key: 'smb',
      name: 'SMB Owner',
      description: 'Chủ cửa hàng nhỏ (quyền như Manager)',
      permissions: ['users.read', 'reports.read', 'leads.read', 'leads.write']
    },
    {
      key: 'sales',
      name: 'Sales',
      description: 'Nhân viên kinh doanh',
      permissions: ['leads.read', 'leads.write']
    },
    {
      key: 'student',
      name: 'IT Student',
      description: 'Sinh viên IT (quyền như Sales)',
      permissions: ['leads.read', 'leads.write']
    },
    {
      key: 'user',
      name: 'User',
      description: 'Người dùng thông thường',
      permissions: []
    }
  ];

  for (const r of defaultRoles) {
    await Role.updateOne(
      { key: r.key },
      { $setOnInsert: r },
      { upsert: true }
    );
  }

  console.log('✅ Default roles ensured in MongoDB');
}

// Seed các tài khoản demo (admin, manager, sales) để dùng cho đăng nhập demo
async function seedDemoUsers() {
  const demoUsers = [
    {
      fullName: 'Demo Admin',
      email: 'admin@demo.com',
      password: 'admin123',
      roleKey: 'admin'
    },
    {
      fullName: 'Demo Manager',
      email: 'manager@demo.com',
      password: 'manager123',
      roleKey: 'manager'
    },
    {
      fullName: 'Demo Sales',
      email: 'sales@demo.com',
      password: 'sales123',
      roleKey: 'sales'
    }
  ];

  for (const demo of demoUsers) {
    const existed = await User.findOne({ email: demo.email });
    if (existed) continue;

    const roleDoc = await Role.findOne({ key: demo.roleKey });

    await User.create({
      fullName: demo.fullName,
      email: demo.email,
      phone: '',
      company: '',
      location: '',
      role: demo.roleKey,
      roleRef: roleDoc ? roleDoc._id : undefined,
      permissions: roleDoc ? roleDoc.permissions : [],
      password: demo.password
    });
  }

  console.log('✅ Demo users ensured in MongoDB');
}

// ✅ Kết nối MongoDB
const startServer = async () => {
  try {
    // Ưu tiên lấy từ biến môi trường, nếu không có sẽ dùng cụm MongoDB Atlas identity_db bạn cung cấp
    const uri =
      process.env.MONGODB_URI ||
      'mongodb+srv://quyet:dKsuuAc3ODjC1wVc@cluster0.9mytcrv.mongodb.net/identity_db';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB:', uri);

    // Đảm bảo có các role mặc định và tài khoản demo
    await seedDefaultRoles();
    await seedDemoUsers();

    // ✅ Auth routes
    app.use('/api/auth', require('./routes/auth'));

    // ✅ Resource routes
    app.use('/api/users', require('./routes/users'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/groups', require('./routes/groups'));   // 👈 từ file thứ 2
    app.use('/api/leads', require('./routes/leads'));
    app.use('/api/reports', require('./routes/reports'));

    // Create HTTP server and attach Socket.IO for real-time
    const http = require('http');
    const { Server } = require('socket.io');
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: true,
        credentials: true
      }
    });

    // ✅ Scraper routes (tích hợp từ clon chromium) - cần io để emit events
    app.use('/api/scraper', require('./routes/scraper')(io));

    // ✅ Posts route với Socket.IO để emit events real-time
    app.use('/api/posts', require('./routes/posts')(io));

    // Mount messages route with io so it can emit events
    app.use('/api/messages', require('./routes/messages')(io));

    // 👇 Mount webhooks route (Facebook Messenger, Zalo, etc.) từ file thứ 1
    // Make io available globally for webhook handlers
    global.io = io;
    app.use('/api/webhooks', require('./routes/webhooks'));

    // Socket handlers - chỉ định nghĩa 1 lần
    io.on('connection', (socket) => {
      console.log('📱 Client connected:', socket.id);

      // Generic join/leave rooms
      socket.on('join', (room) => {
        try {
          if (room) socket.join(room);
        } catch (e) {
          console.error('Socket join error', e);
        }
      });

      socket.on('leave', (room) => {
        try {
          if (room) socket.leave(room);
        } catch (e) {
          console.error('Socket leave error', e);
        }
      });

      // Posts subscription
      socket.on('posts:subscribe', () => {
        socket.join('posts');
        console.log(`📡 Client ${socket.id} subscribed to posts room`);
      });

      socket.on('posts:unsubscribe', () => {
        socket.leave('posts');
        console.log(`📡 Client ${socket.id} unsubscribed from posts room`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`📱 Client ${socket.id} disconnected:`, reason);
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
