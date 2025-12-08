/* server/routes/messages.js */
const express = require('express');
const Message = require('../models/Message');
const Lead = require('../models/Lead');
const messengerService = require('../services/messengerService');

// Export a function that accepts io (Socket.IO) so we can emit events when messages are created
module.exports = function (io) {
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

  // ================= PUBLIC ENDPOINTS (KHÁCH HÀNG) =================

  // GET /api/messages/public/:leadId - Lấy tin nhắn cho khách hàng (public)
  router.get('/public/:leadId', async (req, res) => {
    try {
      const { leadId } = req.params;
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy khách hàng' });
      }

      const messages = await Message.find({ leadId }).sort({ createdAt: 1 });
      return res.json({ success: true, messages, leadName: lead.name });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // POST /api/messages/public - Khách hàng gửi tin nhắn (public, không cần auth)
  router.post('/public', upload.single('file'), async (req, res) => {
    try {
      const { leadId, text } = req.body;
      console.log(
        '📥 POST /api/messages/public - leadId:',
        leadId,
        'text:',
        text?.substring(0, 50)
      );

      if (!leadId || leadId === 'undefined' || leadId === 'null') {
        console.error('❌ Missing or invalid leadId');
        return res.status(400).json({
          success: false,
          message: 'Thiếu leadId hoặc leadId không hợp lệ',
        });
      }

      // Verify lead exists
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy khách hàng' });
      }

      const attachment = req.file
        ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
          }
        : null;

      const messageData = {
        leadId,
        sender: 'customer', // Tự động set là customer
        text: text || '',
        attachment: attachment || undefined,
        read: false,
      };

      const message = await Message.create(messageData);

      // Update lastContact của lead
      await Lead.findByIdAndUpdate(leadId, { lastContact: new Date() });

      // Emit socket event to the room for this leadId
      try {
        if (io && leadId) {
          io.to(String(leadId)).emit('message', message);
        }
      } catch (emitErr) {
        console.error('Socket emit error:', emitErr);
      }

      return res
        .status(201)
        .json({ success: true, message: 'Tin nhắn đã gửi', data: message });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // ================= INTERNAL ENDPOINTS (CRM / AGENT) =================

  // GET /api/messages/:leadId - get messages for a lead
  router.get('/:leadId', async (req, res) => {
    try {
      const { leadId } = req.params;

      // Ensure lead exists (optional)
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy khách hàng' });
      }

      const messages = await Message.find({ leadId }).sort({ createdAt: 1 });
      return res.json({ success: true, messages });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // POST /api/messages - send a message (supports optional file upload)
  router.post('/', upload.single('file'), async (req, res) => {
    try {
      const { leadId, sender, text } = req.body;
      if (!leadId || !sender) {
        return res
          .status(400)
          .json({ success: false, message: 'Thiếu thông tin bắt buộc' });
      }

      // Optional: verify lead exists
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy khách hàng' });
      }

      const attachment = req.file
        ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
          }
        : null;

      const messageData = {
        leadId,
        sender,
        text: text || '',
        attachment: attachment || undefined,
        read: false,
        platform: lead.platform || '',
        platformMessageId: '', // Sẽ được cập nhật sau khi gửi qua platform
      };

      const message = await Message.create(messageData);

      // Nếu là tin nhắn từ nhân viên (sender = 'me') và lead có platform = facebook
      // → Gửi qua Facebook Messenger
      console.log('🔍 Checking if should send via Facebook:', {
        sender,
        hasPlatformUserId: !!lead.platformUserId,
        platform: lead.platform,
        platformUserId: lead.platformUserId,
        shouldSend:
          sender === 'me' &&
          lead.platformUserId &&
          lead.platform === 'facebook',
      });

      if (
        sender === 'me' &&
        lead.platformUserId &&
        lead.platform === 'facebook'
      ) {
        try {
          console.log(
            '📤 Sending message via Facebook Messenger to:',
            lead.platformUserId,
            'Text:',
            text?.substring(0, 50)
          );

          // Gửi text message
          if (text && text.trim()) {
            const fbResponse = await messengerService.sendTextMessage(
              lead.platformUserId,
              text
            );
            console.log('📤 Facebook API Response:', fbResponse);

            if (fbResponse.message_id) {
              message.platformMessageId = fbResponse.message_id;
              await message.save();
              console.log(
                '✅ Facebook message sent successfully, message_id:',
                fbResponse.message_id
              );
            } else {
              console.warn(
                '⚠️ Facebook API did not return message_id:',
                fbResponse
              );
            }
          } else {
            console.log('ℹ️ No text to send, skipping text message');
          }

          // Gửi attachment nếu có
          if (attachment && attachment.url) {
            const fullUrl = `${req.protocol}://${req.get('host')}${
              attachment.url
            }`;
            const attachmentType = attachment.mimetype?.startsWith('image/')
              ? 'image'
              : 'file';
            console.log('📤 Sending attachment via Facebook:', {
              fullUrl,
              attachmentType,
            });
            await messengerService.sendAttachment(
              lead.platformUserId,
              fullUrl,
              attachmentType
            );
            console.log('✅ Facebook attachment sent successfully');
          }
        } catch (platformErr) {
          console.error('❌ Error sending via Facebook Messenger:', platformErr);
          console.error('❌ Error details:', {
            message: platformErr.message,
            stack: platformErr.stack,
            response: platformErr.response?.data || platformErr.response,
          });
          // Không throw error, vì message đã được lưu vào DB
        }
      } else {
        console.log('ℹ️ Not sending via Facebook because:', {
          isMe: sender === 'me',
          hasPlatformUserId: !!lead.platformUserId,
          isFacebook: lead.platform === 'facebook',
          actualPlatform: lead.platform,
        });
      }

      // Emit socket event to the room for this leadId
      try {
        if (io && leadId) {
          io.to(String(leadId)).emit('message', message);
        }
      } catch (emitErr) {
        console.error('Socket emit error:', emitErr);
      }

      return res
        .status(201)
        .json({ success: true, message: 'Tin nhắn đã gửi', data: message });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // PUT /api/messages/edit/:messageId - edit a message
  router.put('/edit/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      const { text } = req.body;

      console.log('📝 PUT /api/messages/edit/:messageId - Request:', {
        messageId,
        text: text?.substring(0, 50),
      });

      if (!messageId) {
        console.error('❌ Missing messageId');
        return res
          .status(400)
          .json({ success: false, message: 'Missing messageId' });
      }

      if (!text || !text.trim()) {
        console.error('❌ Empty text');
        return res.status(400).json({
          success: false,
          message: 'Tin nhắn không được để trống',
        });
      }

      const message = await Message.findById(messageId);
      if (!message) {
        console.error('❌ Message not found:', messageId);
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy tin nhắn' });
      }

      console.log('📝 Found message:', {
        id: message._id,
        sender: message.sender,
        currentText: message.text?.substring(0, 30),
      });

      // Only allow editing messages sent by agent (sender === 'me')
      if (message.sender !== 'me') {
        console.error(
          '❌ Not allowed to edit - sender is not "me":',
          message.sender
        );
        return res.status(403).json({
          success: false,
          message: 'Chỉ có thể chỉnh sửa tin nhắn của bạn',
        });
      }

      // Update message
      message.text = text.trim();
      await message.save();
      console.log('✅ Message updated successfully');

      // Emit socket event to notify clients
      try {
        if (io && message.leadId) {
          io.to(String(message.leadId)).emit('message:edited', {
            messageId: message._id,
            message,
          });
          console.log('📡 Emitted message:edited event');
        }
      } catch (emitErr) {
        console.error('Socket emit error:', emitErr);
      }

      return res.json({
        success: true,
        message: 'Tin nhắn đã được chỉnh sửa',
        data: message,
      });
    } catch (err) {
      console.error('❌ Error in PUT /api/messages/edit/:messageId:', err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // PUT /api/messages/:leadId/read - mark messages for a lead as read (messages from customer)
  router.put('/:leadId/read', async (req, res) => {
    try {
      const { leadId } = req.params;
      if (!leadId) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing leadId' });
      }

      const result = await Message.updateMany(
        { leadId, sender: 'customer', read: false },
        { $set: { read: true } }
      );

      // notify room that messages were read (send list of ids updated)
      try {
        const updated = await Message.find({
          leadId,
          sender: 'customer',
          read: true,
        }).select('_id');
        const ids = updated.map((u) => String(u._id));
        if (io) io.to(String(leadId)).emit('read', { leadId, messageIds: ids });
      } catch (emitErr) {
        console.error('Emit read error', emitErr);
      }

      return res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  // DELETE /api/messages/:messageId - delete a message
  router.delete('/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing messageId' });
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy tin nhắn' });
      }

      // Only allow deleting messages sent by agent (sender === 'me')
      if (message.sender !== 'me') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ có thể xóa tin nhắn của bạn',
        });
      }

      const leadId = message.leadId;

      // Delete message
      await Message.findByIdAndDelete(messageId);

      // Emit socket event to notify clients
      try {
        if (io && leadId) {
          io.to(String(leadId)).emit('message:deleted', {
            messageId,
            leadId,
          });
        }
      } catch (emitErr) {
        console.error('Socket emit error:', emitErr);
      }

      return res.json({
        success: true,
        message: 'Tin nhắn đã được xóa',
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: 'Lỗi máy chủ' });
    }
  });

  return router;
};
