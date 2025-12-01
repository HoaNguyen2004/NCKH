/* server/routes/users.js */
const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users - Lấy tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/users/:id - Lấy chi tiết người dùng
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/users - Thêm người dùng mới
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, company, location, role, password, permissions } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
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
      password,
      permissions: permissions || []
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm người dùng thành công',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        location: user.location,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// PUT /api/users/:id - Cập nhật người dùng
router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, company, location, role, permissions } = req.body;
    const update = { fullName, phone, company, location, role };
    if (permissions) update.permissions = permissions;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    return res.json({ success: true, message: 'Cập nhật thành công', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// DELETE /api/users/:id - Xóa người dùng
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    
    return res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
