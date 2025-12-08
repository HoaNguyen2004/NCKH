/* server/routes/webhooks.js */
const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Message = require('../models/Message');
const messengerService = require('../services/messengerService');

// Facebook Webhook Verify Token (nên lưu trong .env)
const FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'my_verify_token_123';

/**
 * GET /api/webhooks/messenger
 * Facebook webhook verification
 */
router.get('/messenger', (req, res) => {
  // Log toàn bộ request để debug
  console.log('🔍 Facebook webhook verification - Full request info:', {
    url: req.url,
    originalUrl: req.originalUrl,
    query: req.query,
    queryString: req.url.split('?')[1],
    headers: req.headers
  });

  // Try multiple ways to get query parameters
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // If not found in req.query, try parsing from URL manually
  if (!mode || !token) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    mode = mode || url.searchParams.get('hub.mode');
    token = token || url.searchParams.get('hub.verify_token');
    challenge = challenge || url.searchParams.get('hub.challenge');
  }

  // If still not found, try parsing query string manually
  if (!mode || !token) {
    const queryString = req.url.split('?')[1];
    if (queryString) {
      const params = new URLSearchParams(queryString);
      mode = mode || params.get('hub.mode');
      token = token || params.get('hub.verify_token');
      challenge = challenge || params.get('hub.challenge');
    }
  }

  console.log('🔍 Extracted values:', { mode, token, challenge: challenge ? 'present' : 'missing' });
  console.log('🔍 Expected token:', FACEBOOK_VERIFY_TOKEN);

  if (mode === 'subscribe' && token === FACEBOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed:', {
      modeMatch: mode === 'subscribe',
      tokenMatch: token === FACEBOOK_VERIFY_TOKEN,
      mode,
      token,
      expectedToken: FACEBOOK_VERIFY_TOKEN
    });
    res.sendStatus(403);
  }
});

/**
 * POST /api/webhooks/messenger
 * Nhận tin nhắn từ Facebook Messenger
 */
router.post('/messenger', async (req, res) => {
  try {
    const body = req.body;
    console.log('📥 POST /api/webhooks/messenger - Body object:', body.object);

    // Facebook gửi challenge để verify
    if (body.object === 'page') {
      console.log('📥 Processing page entry, count:', body.entry?.length || 0);

      // Process each entry sequentially to avoid race conditions
      for (const pageEntry of body.entry) {
        try {
          if (!pageEntry.messaging || pageEntry.messaging.length === 0) {
            console.log('⚠️ No messaging events in entry');
            continue;
          }

          const webhookEvent = pageEntry.messaging[0];
          const senderId = webhookEvent?.sender?.id;
          const recipientId = webhookEvent?.recipient?.id;

          console.log('📥 Received Facebook webhook:', {
            senderId,
            recipientId,
            hasMessage: !!webhookEvent.message,
            hasPostback: !!webhookEvent.postback
          });

          // Xử lý tin nhắn text
          if (webhookEvent.message) {
            console.log('💬 Processing message event...');
            try {
              await handleIncomingMessage(senderId, webhookEvent.message);
              console.log('✅ Successfully processed message');
            } catch (messageError) {
              console.error('❌ Error in handleIncomingMessage:', messageError);
              // Continue processing other entries even if one fails
            }
          }

          // Xử lý postback (khi user click button)
          if (webhookEvent.postback) {
            console.log('📥 Postback received:', webhookEvent.postback);
            // Có thể xử lý postback ở đây nếu cần
          }
        } catch (entryError) {
          console.error('❌ Error processing entry:', entryError);
          // Continue with other entries
        }
      }

      // Phải trả về 200 ngay để Facebook biết đã nhận được
      res.status(200).send('EVENT_RECEIVED');
    } else {
      console.log('⚠️ Body object is not "page":', body.object);
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('❌ Error processing Facebook webhook:', err);
    console.error('❌ Error stack:', err.stack);
    // Still return 200 to Facebook to avoid retries
    res.status(200).send('EVENT_RECEIVED');
  }
});

/**
 * Xử lý tin nhắn đến từ Facebook
 */
async function handleIncomingMessage(senderId, message) {
  try {
    const messageText = message.text || '';
    const messageId = message.mid || '';
    const attachments = message.attachments || [];

    console.log('💬 Processing incoming message:', {
      senderId,
      messageText: messageText.substring(0, 50),
      messageId,
      hasAttachments: attachments.length > 0
    });

    // Tìm hoặc tạo Lead dựa trên platformUserId
    let lead = await Lead.findOne({ platformUserId: senderId, platform: 'facebook' });

    if (!lead) {
      // Lấy thông tin user từ Facebook
      try {
        console.log('🔄 Fetching user info for new lead, senderId:', senderId);
        const userInfo = await messengerService.getUserInfo(senderId);

        const firstName = userInfo.first_name || '';
        const lastName = userInfo.last_name || '';
        const userName = `${firstName} ${lastName}`.trim() || 'Khách hàng Facebook';
        const profilePic = userInfo.profile_pic || '';

        console.log('📋 Parsed user info:', {
          firstName,
          lastName,
          userName,
          profilePicLength: profilePic.length,
          profilePicPreview: profilePic ? profilePic.substring(0, 50) + '...' : 'Empty'
        });

        // Tạo Lead mới
        lead = await Lead.create({
          name: userName,
          platformUserId: senderId,
          platform: 'facebook',
          source: 'Facebook Messenger',
          status: 'new',
          priority: 'medium',
          type: 'buyer',
          lastContact: new Date(),
          profilePicture: profilePic
        });

        // Verify saved data
        const savedLead = await Lead.findById(lead._id);
        console.log('✅ Created new Lead:', {
          leadId: lead._id,
          facebookUserId: senderId,
          savedName: savedLead.name,
          savedProfilePicture: savedLead.profilePicture ? savedLead.profilePicture.substring(0, 50) + '...' : 'Empty',
          hasProfilePicture: !!savedLead.profilePicture,
          profilePictureLength: savedLead.profilePicture ? savedLead.profilePicture.length : 0
        });
      } catch (userInfoError) {
        console.error('❌ Error getting user info, creating lead with default name:', {
          error: userInfoError.message,
          stack: userInfoError.stack,
          senderId
        });
        lead = await Lead.create({
          name: 'Khách hàng Facebook',
          platformUserId: senderId,
          platform: 'facebook',
          source: 'Facebook Messenger',
          status: 'new',
          priority: 'medium',
          type: 'buyer',
          lastContact: new Date()
        });
      }
    } else {
      // Cập nhật lastContact và cập nhật tên/ảnh nếu chưa có hoặc cần cập nhật
      const updateData = { lastContact: new Date() };
      let needsUserInfo = false;

      // Kiểm tra xem có cần lấy lại thông tin user không
      if (!lead.profilePicture || !lead.name || lead.name === 'Khách hàng Facebook') {
        needsUserInfo = true;
      }

      // Lấy lại thông tin user từ Facebook nếu cần
      if (needsUserInfo) {
        try {
          console.log('🔄 Fetching user info for existing lead, senderId:', senderId, 'Current lead:', {
            name: lead.name,
            hasProfilePicture: !!lead.profilePicture
          });

          const userInfo = await messengerService.getUserInfo(senderId);
          const firstName = userInfo.first_name || '';
          const lastName = userInfo.last_name || '';
          const userName = `${firstName} ${lastName}`.trim() || 'Khách hàng Facebook';
          const profilePic = userInfo.profile_pic || '';

          console.log('📋 Parsed user info for update:', {
            firstName,
            lastName,
            userName,
            profilePicLength: profilePic.length,
            profilePicPreview: profilePic ? profilePic.substring(0, 50) + '...' : 'Empty',
            hasProfilePic: !!profilePic
          });

          // Cập nhật tên nếu chưa có hoặc vẫn là default
          if (!lead.name || lead.name === 'Khách hàng Facebook' || lead.name.trim() === '') {
            if (userName && userName !== 'Khách hàng Facebook') {
              updateData.name = userName;
              console.log('📝 Will update name to:', userName);
            }
          }

          // Cập nhật profile picture nếu chưa có
          if (!lead.profilePicture && profilePic) {
            updateData.profilePicture = profilePic;
            console.log('📝 Will update profilePicture, length:', profilePic.length);
          } else if (!lead.profilePicture && !profilePic) {
            console.warn('⚠️ No profile picture available from Facebook API. User may have restricted profile picture access.');
          } else if (lead.profilePicture && !profilePic) {
            console.log('ℹ️ Lead already has profile picture, keeping existing one');
          }

          console.log('✅ Updated Lead info:', {
            leadId: lead._id,
            name: updateData.name || lead.name,
            hasProfilePicture: !!updateData.profilePicture || !!lead.profilePicture,
            profilePictureLength: updateData.profilePicture ? updateData.profilePicture.length : (lead.profilePicture ? lead.profilePicture.length : 0),
            willUpdateName: !!updateData.name,
            willUpdatePicture: !!updateData.profilePicture
          });
        } catch (err) {
          console.error('❌ Error getting user info for existing lead:', {
            error: err.message,
            stack: err.stack,
            senderId,
            errorType: err.constructor.name
          });

          // Nếu lỗi là về permissions, log rõ ràng hơn
          if (err.message && err.message.includes('permissions')) {
            console.error('⚠️ PERMISSION ISSUE: App cần request permissions từ Facebook để lấy tên và ảnh khách hàng.');
            console.error('📋 Hướng dẫn: Vào Facebook Developers → App Review → Request permissions: pages_read_user_profile');
          }

          // Ignore error, just update lastContact (không throw để không block việc xử lý tin nhắn)
        }
      }

      // Cập nhật Lead
      await Lead.findByIdAndUpdate(lead._id, updateData);

      // Refresh lead từ DB để có thông tin mới nhất
      lead = await Lead.findById(lead._id);
    }

    // Xử lý attachment nếu có
    let attachment = null;
    if (attachments.length > 0) {
      const firstAttachment = attachments[0];
      attachment = {
        filename: firstAttachment.title || 'attachment',
        originalname: firstAttachment.title || 'attachment',
        mimetype: firstAttachment.type || 'unknown',
        url: firstAttachment.payload?.url || ''
      };
    }

    console.log('📝 Preparing to save message:', {
      leadId: lead._id,
      leadName: lead.name,
      messageText: messageText.substring(0, 50),
      hasAttachment: !!attachment
    });

    // Lưu message vào database
    const messageData = {
      leadId: lead._id,
      sender: 'customer',
      text: messageText,
      platformMessageId: messageId,
      platform: 'facebook',
      attachment: attachment || undefined,
      read: false
    };

    console.log('💾 Attempting to save message to database...');
    let savedMessage;
    try {
      savedMessage = await Message.create(messageData);
      console.log('✅ Saved message:', savedMessage._id, 'Text:', messageText.substring(0, 50));
    } catch (saveError) {
      console.error('❌ Error saving message to database:', saveError);
      console.error('❌ Message data:', messageData);
      throw saveError;
    }

    // Emit Socket.IO event để frontend nhận real-time
    // Note: io sẽ được inject từ server.js
    console.log('🔌 Checking Socket.IO availability:', {
      hasIo: !!global.io,
      hasLeadId: !!lead._id,
      leadId: lead._id,
      savedMessageId: savedMessage?._id
    });

    if (global.io && lead._id) {
      const leadIdString = String(lead._id);
      console.log('📡 Attempting to emit Socket.IO events for lead:', leadIdString);

      try {
        // Emit to the specific lead room (for clients that have joined this lead's room)
        global.io.to(leadIdString).emit('message', savedMessage);
        console.log('✅ Emitted "message" event to room:', leadIdString);

        // Also emit a 'new-lead-message' event to all clients so they can refresh conversation list
        // This is important for new leads that clients haven't joined yet
        // Refresh lead từ DB để có thông tin mới nhất (tên, ảnh) trước khi emit
        const refreshedLead = await Lead.findById(lead._id);
        global.io.emit('new-lead-message', {
          leadId: leadIdString,
          leadName: refreshedLead?.name || lead.name,
          leadProfilePicture: refreshedLead?.profilePicture || lead.profilePicture || '',
          message: savedMessage
        });
        console.log('✅ Broadcasted "new-lead-message" event to all clients', {
          leadId: leadIdString,
          leadName: refreshedLead?.name || lead.name,
          hasProfilePicture: !!refreshedLead?.profilePicture
        });

        console.log('📡 Successfully emitted Socket.IO events for lead:', leadIdString, 'Message ID:', savedMessage._id);
      } catch (emitError) {
        console.error('❌ Error emitting Socket.IO events:', emitError);
      }
    } else {
      console.error('❌ Cannot emit Socket.IO event:', {
        hasIo: !!global.io,
        hasLeadId: !!lead._id,
        leadId: lead._id,
        savedMessageId: savedMessage?._id
      });
    }

    return savedMessage;
  } catch (err) {
    console.error('❌ Error handling incoming message:', err);
    throw err;
  }
}

/**
 * GET /api/webhooks/test-user-info/:psid
 * Test endpoint để kiểm tra việc lấy thông tin user từ Facebook
 * (Chỉ dùng để debug, không dùng trong production)
 */
router.get('/test-user-info/:psid', async (req, res) => {
  try {
    const { psid } = req.params;
    console.log('🧪 Testing getUserInfo for PSID:', psid);

    const userInfo = await messengerService.getUserInfo(psid);

    return res.json({
      success: true,
      userInfo,
      message: 'Thông tin user đã được lấy thành công'
    });
  } catch (err) {
    console.error('❌ Test getUserInfo failed:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
