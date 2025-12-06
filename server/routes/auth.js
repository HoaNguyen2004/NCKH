/* server/routes/auth.js */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Role = require('../models/Role');
const VerificationCode = require('../models/VerificationCode');
const { requireAuth } = require('../middleware/auth');

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

// GET /api/auth/check-email - Kiểm tra email đã tồn tại chưa (realtime validation)
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email' });
    }
    
    const existed = await User.findOne({ email: email.toLowerCase().trim() });
    return res.json({ 
      success: true, 
      exists: !!existed,
      message: existed ? 'Email này đã được đăng ký' : 'Email có thể sử dụng'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/auth/check-phone - Kiểm tra số điện thoại đã tồn tại chưa
router.get('/check-phone', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Thiếu số điện thoại' });
    }
    
    // Chuẩn hóa số điện thoại (bỏ khoảng trắng, dấu gạch ngang)
    const normalizedPhone = phone.replace(/[\s\-\.]/g, '').trim();
    if (!normalizedPhone) {
      return res.json({ success: true, exists: false });
    }
    
    const existed = await User.findOne({ phone: normalizedPhone });
    return res.json({ 
      success: true, 
      exists: !!existed,
      message: existed ? 'Số điện thoại này đã được đăng ký' : 'Số điện thoại có thể sử dụng'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/auth/register
// Yêu cầu mã OTP đã được gửi tới email thông qua /register-send-otp
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      location,
      role,
      password,
      confirmPassword,
      otp,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Vui lòng nhập đủ thông tin bắt buộc' });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }
    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: 'Vui lòng nhập mã xác nhận đã gửi về email' });
    }

    // Chuẩn hóa email
    const normalizedEmail = email.toLowerCase().trim();

    // Kiểm tra email đã tồn tại chưa
    const emailExisted = await User.findOne({ email: normalizedEmail });
    if (emailExisted) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.',
      });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa (nếu có nhập)
    if (phone) {
      const normalizedPhoneCheck = phone.replace(/[\s\-\.]/g, '').trim();
      if (normalizedPhoneCheck) {
        const phoneExisted = await User.findOne({ phone: normalizedPhoneCheck });
        if (phoneExisted) {
          return res.status(409).json({
            success: false,
            message: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số khác.',
          });
        }
      }
    }

    // Kiểm tra mã OTP đăng ký
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const codeDoc = await VerificationCode.findOne({
      email: normalizedEmail,
      purpose: 'register',
      expiresAt: { $gt: new Date() },
    });

    if (!codeDoc || codeDoc.codeHash !== otpHash) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận không đúng hoặc đã hết hạn. Vui lòng gửi lại mã.',
      });
    }

    // Xóa mã sau khi sử dụng
    await VerificationCode.deleteOne({ _id: codeDoc._id });

    // Xác định roleKey (admin, manager, sales, user, ...)
    const roleKey = role || 'user';
    const roleDoc = await Role.findOne({ key: roleKey });

    // Chuẩn hóa số điện thoại trước khi lưu
    const normalizedPhone = phone ? phone.replace(/[\s\-\.]/g, '').trim() : '';

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      company,
      location,
      role: roleKey,
      roleRef: roleDoc ? roleDoc._id : undefined,
      // Nếu muốn, có thể gán luôn permissions mặc định từ Role
      permissions: roleDoc ? roleDoc.permissions : [],
      password,
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
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// Gửi mã OTP để xác nhận email khi đăng ký
// POST /api/auth/register-send-otp
router.post('/register-send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Không cho gửi OTP nếu email đã tồn tại
    const emailExisted = await User.findOne({ email: normalizedEmail });
    if (emailExisted) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.',
      });
    }

    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Lưu/ghi đè mã OTP cho email này (purpose: register)
    await VerificationCode.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'register' },
      { codeHash: otpHash, purpose: 'register', expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = createTransporter();
    const mailOptions = {
      to: normalizedEmail,
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com',
      subject: 'Mã xác nhận đăng ký tài khoản',
      text:
        `Mã xác nhận đăng ký tài khoản của bạn là: ${otp}\n\n` +
        `Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.`,
    };

    if (transporter) {
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Error sending register OTP email', err);
          return res
            .status(500)
            .json({ success: false, message: 'Không thể gửi email mã xác nhận đăng ký' });
        }
        return res.json({
          success: true,
          message: 'Mã xác nhận đăng ký đã được gửi. Vui lòng kiểm tra hộp thư.',
        });
      });
    } else {
      console.warn('SMTP not configured. Register OTP code (dev only):', otp);
      return res.json({
        success: true,
        message:
          'Mã xác nhận đăng ký đã được tạo (SMTP chưa cấu hình, xem log server để lấy mã trong môi trường dev).',
      });
    }
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
router.get('/me', requireAuth, async (req, res) => {
  // requireAuth đã gắn req.user
  return res.json({ success: true, user: req.user });
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
    if (!token || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

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

// =======================
//  QUÊN MẬT KHẨU BẰNG OTP
// =======================

// POST /api/auth/forgot-otp
// Gửi mã OTP 6 chữ số về email. Nếu email không tồn tại vẫn trả về success (tránh lộ thông tin).
router.post('/forgot-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Để tránh lộ thông tin tài khoản tồn tại hay không, luôn trả về success
    if (!user) {
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, mã xác nhận đã được gửi.'
      });
    }

    // Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP để lưu trong DB (tránh lưu plain-text)
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordToken = otpHash;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút
    await user.save();

    const transporter = createTransporter();
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM || (process.env.SMTP_USER || 'no-reply@example.com'),
      subject: 'Mã xác nhận đặt lại mật khẩu',
      text:
        `Mã xác nhận đặt lại mật khẩu của bạn là: ${otp}\n\n` +
        `Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`
    };

    if (transporter) {
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Error sending OTP email', err);
          return res
            .status(500)
            .json({ success: false, message: 'Không thể gửi email mã xác nhận' });
        }
        return res.json({
          success: true,
          message: 'Nếu email tồn tại, mã xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.'
        });
      });
    } else {
      // Không cấu hình SMTP: chỉ log OTP ở server để dev debug, KHÔNG trả mã về cho client
      console.warn('SMTP not configured. OTP code (dev only):', otp);
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, mã xác nhận đã được tạo (SMTP chưa cấu hình, xem log server).'
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/auth/reset-with-otp
// Body: { email, otp, password, confirmPassword }
// Nếu OTP đúng và còn hạn -> cho phép đổi mật khẩu
router.post('/reset-with-otp', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user || !user.resetPasswordToken) {
      return res
        .status(400)
        .json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
    }

    // So sánh OTP (hash)
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== user.resetPasswordToken) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng' });
    }

    // OTP hợp lệ -> cập nhật mật khẩu mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Có thể đăng nhập luôn sau khi đổi mật khẩu
    const authToken = signToken(user._id.toString());

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
      token: authToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
