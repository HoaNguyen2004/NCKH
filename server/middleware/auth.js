/* server/middleware/auth.js */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Middleware yêu cầu đăng nhập (JWT)
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Thiếu token' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId)
      .select('-password')
      .populate('roleRef'); // có thể dùng thêm thông tin Role nếu cần

    if (!user) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
}

// Middleware yêu cầu user có một trong các role nhất định
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};


