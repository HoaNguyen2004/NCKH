/* server/routes/auth.js */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Create nodemailer transporter from env vars if available
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: (process.env.SMTP_SECURE === 'true'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
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

// POST /api/auth/forgot
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const frontendBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${frontendBase.replace(/\/$/, '')}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = createTransporter();
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM || (process.env.SMTP_USER || 'no-reply@example.com'),
      subject: 'Reset your password',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n` +
        `${resetUrl}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.`
    };

    if (transporter) {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending reset email', err);
          return res.status(500).json({ success: false, message: 'Không thể gửi email reset' });
        }
        return res.json({ success: true, message: 'Reset email sent' });
      });
    } else {
      // No SMTP configured - for dev: log the URL and return it in response
      console.warn('SMTP not configured. Reset URL:', resetUrl);
      return res.json({ success: true, message: 'Reset URL generated (no SMTP configured)', resetUrl });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/auth/reset
router.post('/reset', async (req, res) => {
  try {
    const { token, email, password, confirmPassword } = req.body;
    if (!token || !email || !password || !confirmPassword) return res.status(400).json({ success: false, message: 'Thiếu tham số' });
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });

    const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionally sign a token and return it so user is logged in after reset
    const authToken = signToken(user._id.toString());
    return res.json({ success: true, message: 'Mật khẩu đã được đặt lại', token: authToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
