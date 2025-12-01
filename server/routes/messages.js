/* server/routes/messages.js */
const express = require('express');
const Message = require('../models/Message');
const Lead = require('../models/Lead');

// Export a function that accepts io (Socket.IO) so we can emit events when messages are created
module.exports = function(io) {
  const router = express.Router();

  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  // ensure uploads dir
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
      cb(null, unique + '-' + safeName);
    }
  });

  const upload = multer({ storage });

  // GET /api/messages/:leadId - get messages for a lead
  router.get('/:leadId', async (req, res) => {
    try {
      const { leadId } = req.params;
      // Ensure lead exists (optional)
      const lead = await Lead.findById(leadId);
      if (!lead) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });

      const messages = await Message.find({ leadId }).sort({ createdAt: 1 });
      return res.json({ success: true, messages });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // POST /api/messages - send a message (supports optional file upload)
  router.post('/', upload.single('file'), async (req, res) => {
    try {
      const { leadId, sender, text } = req.body;
      if (!leadId || !sender) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
      }

      // Optional: verify lead exists
      const lead = await Lead.findById(leadId);
      if (!lead) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });

      const attachment = req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      } : null;

      const messageData = {
        leadId,
        sender,
        text: text || '',
        attachment: attachment || undefined,
        read: false
      };

      const message = await Message.create(messageData);

      // Emit socket event to the room for this leadId so clients in that room receive the new message
      try {
        if (io && leadId) {
          io.to(String(leadId)).emit('message', message);
        }
      } catch (emitErr) {
        console.error('Socket emit error:', emitErr);
      }

      return res.status(201).json({ success: true, message: 'Tin nhắn đã gửi', data: message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // PUT /api/messages/:leadId/read - mark messages for a lead as read (messages from customer)
  router.put('/:leadId/read', async (req, res) => {
    try {
      const { leadId } = req.params;
      if (!leadId) return res.status(400).json({ success: false, message: 'Missing leadId' });

      const result = await Message.updateMany({ leadId, sender: 'customer', read: false }, { $set: { read: true } });

      // notify room that messages were read (send list of ids updated)
      try {
        const updated = await Message.find({ leadId, sender: 'customer', read: true }).select('_id');
        const ids = updated.map(u => String(u._id));
        if (io) io.to(String(leadId)).emit('read', { leadId, messageIds: ids });
      } catch (emitErr) {
        console.error('Emit read error', emitErr);
      }

      return res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  return router;
};
