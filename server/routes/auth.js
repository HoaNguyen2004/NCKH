/* server/routes/auth.js */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, company, location, role, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin bắt buộc' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    const existed = await User.findOne({ email });
    if (existed) {
      return res.status(409).json({ success: false, message: 'Email đã tồn tại' });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      company,
      location,
      role: role || 'user',
      password
    });

    const token = signToken(user._id.toString());
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        location: user.location,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu sai' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu sai' });

    const token = signToken(user._id.toString());
    return res.json({ success: true, message: 'Đăng nhập thành công', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Thiếu token' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
});

module.exports = router;
