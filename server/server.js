/* server/server.js */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

// ✅ Kết nối MongoDB
const startServer = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/identity_db';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB:', uri);

    // ✅ Auth routes
    app.use('/api/auth', require('./routes/auth'));

    // ✅ Resource routes
    app.use('/api/users', require('./routes/users'));
    app.use('/api/products', require('./routes/products'));
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

    // ✅ Posts route với Socket.IO để emit events real-time (phải mount trước socket handlers)
    app.use('/api/posts', require('./routes/posts')(io));

    // Mount messages route with io so it can emit events
    app.use('/api/messages', require('./routes/messages')(io));

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
