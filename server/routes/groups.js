/* server/routes/groups.js */
const express = require('express');
const Group = require('../models/Group');

const router = express.Router();

// GET /api/groups - Lấy danh sách nhóm
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { url: regex }, { location: regex }];
    }

    const groups = await Group.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, groups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/groups - Thêm nhóm mới thủ công
router.post('/', async (req, res) => {
  try {
    const { name, url, location, keywords } = req.body;

    if (!name || !url) {
      return res
        .status(400)
        .json({ success: false, message: 'Thiếu tên nhóm hoặc URL' });
    }

    const existing = await Group.findOne({ url: url.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Nhóm này đã tồn tại trong hệ thống' });
    }

    const group = await Group.create({
      name: name.trim(),
      url: url.trim(),
      location: location || '',
      keywords:
        Array.isArray(keywords) && keywords.length
          ? keywords
          : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm nhóm thành công',
      group,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// DELETE /api/groups/:id - Xóa nhóm
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy nhóm' });
    }

    return res.json({ success: true, message: 'Xóa nhóm thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;


