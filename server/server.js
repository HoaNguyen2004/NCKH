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

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
