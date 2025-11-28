/* server/routes/reports.js */
const express = require('express');
const Report = require('../models/Report');

const router = express.Router();

// GET /api/reports - Lấy tất cả báo cáo
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().populate('exportedBy', 'fullName email');
    return res.json({ success: true, reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/:id - Lấy chi tiết báo cáo
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('exportedBy', 'fullName email');
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    return res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/reports - Tạo báo cáo mới
router.post('/', async (req, res) => {
  try {
    const { title, type, dateRange, data, exportedBy } = req.body;

    if (!title || !type || !dateRange) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const report = await Report.create({
      title,
      type,
      dateRange,
      data: data || {},
      exportedBy: exportedBy || null
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo báo cáo thành công',
      report
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// DELETE /api/reports/:id - Xóa báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    
    return res.json({ success: true, message: 'Xóa báo cáo thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
