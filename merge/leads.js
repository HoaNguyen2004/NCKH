/* server/routes/leads.js */
const express = require('express');
const Lead = require('../models/Lead');
const Message = require('../models/Message');

const router = express.Router();

/**
 * GET /api/leads
 * Lấy tất cả khách hàng + kèm số tin nhắn chưa đọc (unreadCount) từ phía customer
 */
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find();

    // Tính số tin nhắn chưa đọc cho mỗi lead
    const leadsWithUnread = await Promise.all(
      leads.map(async (lead) => {
        const unreadCount = await Message.countDocuments({
          leadId: lead._id,
          sender: 'customer',
          read: false,
        });

        return {
          ...lead.toObject(),
          unreadCount,
        };
      })
    );

    return res.json({ success: true, leads: leadsWithUnread });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * GET /api/leads/:id
 * Lấy chi tiết 1 khách hàng
 */
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    return res.json({ success: true, lead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * POST /api/leads
 * Thêm khách hàng mới
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      location,
      interest,
      type,
      budget,
      status,
      priority,
      source,
      notes,
    } = req.body;

    // Log để debug
    console.log('📥 POST /api/leads - Received data:', {
      name: name ? `"${name}"` : 'empty',
      phone: phone ? `"${phone}"` : 'empty',
      email: email ? `"${email}"` : 'empty',
      location: location ? `"${location}"` : 'empty',
      interest: interest ? `"${interest}"` : 'empty',
      type: type || 'empty',
      priority: priority || 'empty',
      source: source || 'empty',
    });

    // Chỉ kiểm tra các trường bắt buộc: name, interest, type, priority, source
    // Trim để loại bỏ khoảng trắng thừa
    const trimmedName = (name || '').trim();
    const trimmedInterest = (interest || '').trim();

    console.log('🔍 Validation check:', {
      trimmedName: trimmedName ? `"${trimmedName}"` : 'empty',
      trimmedInterest: trimmedInterest ? `"${trimmedInterest}"` : 'empty',
      type: type || 'empty',
      priority: priority || 'empty',
      source: source || 'empty',
    });

    if (!trimmedName || !trimmedInterest || !type || !priority || !source) {
      const missingFields = [];
      if (!trimmedName) missingFields.push('Tên khách hàng');
      if (!trimmedInterest) missingFields.push('Sản phẩm quan tâm');
      if (!type) missingFields.push('Loại');
      if (!priority) missingFields.push('Ưu tiên');
      if (!source) missingFields.push('Nguồn');

      console.log('❌ Validation failed - Missing fields:', missingFields);

      return res
        .status(400)
        .json({
          success: false,
          message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`
        });
    }

    console.log('✅ Validation passed, creating lead...');

    const lead = await Lead.create({
      name: trimmedName,
      phone: phone || '',
      email: email || '',
      location: location || '',
      interest: trimmedInterest,
      type,
      budget: budget || '',
      status: status || 'new',
      priority: priority || 'medium',
      source: source || '',
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm khách hàng thành công',
      lead,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * PUT /api/leads/:id
 * Cập nhật khách hàng
 */
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khách hàng' });
    }

    return res.json({
      success: true,
      message: 'Cập nhật thành công',
      lead,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * DELETE /api/leads/:id
 * Xóa khách hàng
 */
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khách hàng' });
    }

    return res.json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
