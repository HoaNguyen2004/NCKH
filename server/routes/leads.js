/* server/routes/leads.js */
const express = require('express');
const Lead = require('../models/Lead');

const router = express.Router();

// GET /api/leads - Lấy tất cả khách hàng
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find();
    return res.json({ success: true, leads });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/leads/:id - Lấy chi tiết khách hàng
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    return res.json({ success: true, lead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/leads - Thêm khách hàng mới
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, location, interest, type, budget, status, priority, source, notes } = req.body;

    if (!name || !phone || !email || !type) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      location: location || '',
      interest: interest || '',
      type,
      budget: budget || '',
      status: status || 'new',
      priority: priority || 'medium',
      source: source || '',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm khách hàng thành công',
      lead
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// PUT /api/leads/:id - Cập nhật khách hàng
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!lead) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    
    return res.json({ success: true, message: 'Cập nhật thành công', lead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// DELETE /api/leads/:id - Xóa khách hàng
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    
    return res.json({ success: true, message: 'Xóa khách hàng thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
