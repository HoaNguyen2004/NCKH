/* server/routes/sales-logs.js */
const express = require('express');
const SalesLog = require('../models/SalesLog');
const Lead = require('../models/Lead');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/sales-logs
 * Lấy tất cả nhật ký sales (có phân quyền theo role)
 * Query params: status (pending, approved, rejected), leadId, createdBy
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, leadId, createdBy } = req.query;
    const userRole = req.user.role;
    const userId = req.user._id;
    
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (leadId) {
      filter.leadId = leadId;
    }
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    
    // Sales chỉ thấy nhật ký của mình
    if (userRole === 'sales') {
      filter.createdBy = userId;
    }
    // Admin và manager thấy tất cả

    const logs = await SalesLog.find(filter)
      .sort({ createdAt: -1 })
      .populate('leadId', 'name phone email')
      .populate('createdBy', 'email name')
      .populate('reviewedBy', 'email name');

    // Format response
    const formattedLogs = logs.map(log => ({
      _id: log._id,
      leadId: log.leadId?._id || log.leadId,
      leadName: log.leadName || log.leadId?.name || 'Unknown',
      caretaker: log.caretaker,
      editTime: log.editTime,
      customerRequest: log.customerRequest,
      conclusion: log.conclusion,
      status: log.status,
      adminResponse: log.adminResponse,
      createdBy: log.createdBy?._id || log.createdBy,
      createdAt: log.createdAt,
      reviewedBy: log.reviewedBy,
      reviewedAt: log.reviewedAt,
    }));

    return res.json({ success: true, logs: formattedLogs });
  } catch (err) {
    console.error('Error fetching sales logs:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * GET /api/sales-logs/:id
 * Lấy chi tiết 1 nhật ký sales
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const log = await SalesLog.findById(req.params.id)
      .populate('leadId', 'name phone email')
      .populate('createdBy', 'email name')
      .populate('reviewedBy', 'email name');

    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy nhật ký' });
    }

    // Sales chỉ xem được nhật ký của mình
    if (req.user.role === 'sales' && log.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    return res.json({ success: true, log });
  } catch (err) {
    console.error('Error fetching sales log:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * PUT /api/sales-logs/:id/review
 * Duyệt hoặc từ chối nhật ký sales (chỉ admin/manager)
 */
router.put('/:id/review', requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const log = await SalesLog.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminResponse: adminResponse || '',
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
      { new: true }
    )
      .populate('leadId', 'name')
      .populate('reviewedBy', 'email name');

    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy nhật ký' });
    }

    return res.json({
      success: true,
      message: status === 'approved' ? 'Đã duyệt thành công' : 'Đã từ chối',
      log,
    });
  } catch (err) {
    console.error('Error reviewing sales log:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

/**
 * DELETE /api/sales-logs/:id
 * Xóa nhật ký sales (chỉ admin)
 */
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const log = await SalesLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy nhật ký' });
    }

    return res.json({
      success: true,
      message: 'Xóa nhật ký thành công',
    });
  } catch (err) {
    console.error('Error deleting sales log:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;

