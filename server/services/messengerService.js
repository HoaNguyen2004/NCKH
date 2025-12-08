/* server/services/messengerService.js */
/**
 * Facebook Messenger Service
 * Xử lý gửi tin nhắn qua Facebook Messenger API
 */

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';

// Log token status khi service load (không log token thật)
if (!PAGE_ACCESS_TOKEN) {
  console.warn('⚠️ FACEBOOK_PAGE_ACCESS_TOKEN không được tìm thấy trong .env file!');
} else {
  console.log('✅ FACEBOOK_PAGE_ACCESS_TOKEN đã được load, độ dài:', PAGE_ACCESS_TOKEN.length, 'ký tự');
  // Kiểm tra format cơ bản (token thường bắt đầu bằng EAAB... hoặc EAA...)
  if (!PAGE_ACCESS_TOKEN.startsWith('EA')) {
    console.warn('⚠️ Token có vẻ không đúng format (thường bắt đầu bằng EAAB hoặc EAA...)');
  }
}

/**
 * Gửi tin nhắn text qua Facebook Messenger
 * @param {string} recipientId - Facebook PSID của người nhận
 * @param {string} messageText - Nội dung tin nhắn
 * @returns {Promise<Object>} Response từ Facebook API
 */
async function sendTextMessage(recipientId, messageText) {
  if (!PAGE_ACCESS_TOKEN) {
    throw new Error('Facebook Page Access Token chưa được cấu hình. Vui lòng kiểm tra file .env và set FACEBOOK_PAGE_ACCESS_TOKEN');
  }

  if (PAGE_ACCESS_TOKEN.length < 50) {
    throw new Error('Facebook Page Access Token có vẻ không hợp lệ (quá ngắn). Vui lòng kiểm tra lại token trong .env');
  }

  if (!recipientId || !messageText) {
    throw new Error('Thiếu recipientId hoặc messageText');
  }

  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };

  console.log('📤 Facebook API Request:', {
    url: url.replace(PAGE_ACCESS_TOKEN, 'TOKEN_HIDDEN'),
    recipientId,
    messageLength: messageText.length
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('📤 Facebook API Response Status:', response.status);
    console.log('📤 Facebook API Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Facebook API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        fullResponse: data
      });

      // Log chi tiết lỗi
      if (data.error) {
        console.error('❌ Facebook Error Details:', {
          message: data.error.message,
          type: data.error.type,
          code: data.error.code,
          error_subcode: data.error.error_subcode,
          fbtrace_id: data.error.fbtrace_id
        });
      }

      throw new Error(data.error?.message || `Lỗi khi gửi tin nhắn qua Facebook: ${response.status}`);
    }

    console.log('✅ Facebook message sent successfully:', {
      message_id: data.message_id,
      recipient_id: data.recipient_id
    });
    return data;
  } catch (err) {
    console.error('❌ Error sending Facebook message:', {
      message: err.message,
      stack: err.stack,
      recipientId,
      messageText: messageText.substring(0, 50)
    });
    throw err;
  }
}

/**
 * Gửi tin nhắn với attachment (hình ảnh, file)
 * @param {string} recipientId - Facebook PSID
 * @param {string} attachmentUrl - URL của file cần gửi
 * @param {string} attachmentType - 'image', 'file', 'video'
 * @returns {Promise<Object>} Response từ Facebook API
 */
async function sendAttachment(recipientId, attachmentUrl, attachmentType = 'file') {
  if (!PAGE_ACCESS_TOKEN) {
    throw new Error('Facebook Page Access Token chưa được cấu hình');
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: attachmentType,
              payload: {
                url: attachmentUrl,
                is_reusable: true
              }
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Facebook API Error:', data);
      throw new Error(data.error?.message || 'Lỗi khi gửi attachment qua Facebook');
    }

    console.log('✅ Facebook attachment sent:', data);
    return data;
  } catch (err) {
    console.error('❌ Error sending Facebook attachment:', err);
    throw err;
  }
}

/**
 * Lấy thông tin user từ Facebook PSID
 * @param {string} psid - Facebook Page-Scoped ID
 * @returns {Promise<Object>} User info
 */
async function getUserInfo(psid) {
  if (!PAGE_ACCESS_TOKEN) {
    throw new Error('Facebook Page Access Token chưa được cấu hình');
  }

  // Thử nhiều fields để lấy profile picture
  // profile_pic: URL trực tiếp
  // picture: Object với data.url
  const fields = 'first_name,last_name,profile_pic,picture';
  const url = `https://graph.facebook.com/v18.0/${psid}?fields=${fields}&access_token=${PAGE_ACCESS_TOKEN}`;

  console.log('📥 Fetching user info from Facebook:', {
    psid,
    url: url.replace(PAGE_ACCESS_TOKEN, 'TOKEN_HIDDEN'),
    fields
  });

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('📥 Facebook User Info API Response:', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
      data: JSON.stringify(data, null, 2)
    });

    if (!response.ok) {
      console.error('❌ Facebook API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        fullResponse: data
      });

      if (data.error) {
        console.error('❌ Facebook Error Details:', {
          message: data.error.message,
          type: data.error.type,
          code: data.error.code,
          error_subcode: data.error.error_subcode,
          fbtrace_id: data.error.fbtrace_id
        });

        // Nếu lỗi về permissions, thử nhiều cách khác nhau
        if (data.error.code === 200 || data.error.type === 'OAuthException' || data.error.code === 10) {
          console.log('⚠️ Permission error detected, trying alternative methods...');

          // Thử 1: Chỉ lấy first_name và last_name
          try {
            console.log('🔄 Attempt 1: Trying with first_name,last_name only...');
            const basicUrl = `https://graph.facebook.com/v18.0/${psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`;
            const basicResponse = await fetch(basicUrl);
            const basicData = await basicResponse.json();

            if (basicResponse.ok && (basicData.first_name || basicData.last_name)) {
              console.log('✅ Got basic info (name only) without profile picture');
              return {
                first_name: basicData.first_name || '',
                last_name: basicData.last_name || '',
                profile_pic: '' // Không có quyền lấy ảnh
              };
            }
          } catch (basicErr) {
            console.error('❌ Basic fields request also failed:', basicErr.message);
          }

          // Thử 2: Thử với field 'name' (có thể có quyền khác)
          try {
            console.log('🔄 Attempt 2: Trying with name field...');
            const nameUrl = `https://graph.facebook.com/v18.0/${psid}?fields=name&access_token=${PAGE_ACCESS_TOKEN}`;
            const nameResponse = await fetch(nameUrl);
            const nameData = await nameResponse.json();

            if (nameResponse.ok && nameData.name) {
              const nameParts = nameData.name.split(' ');
              console.log('✅ Got name field, splitting into first/last');
              return {
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || '',
                profile_pic: ''
              };
            }
          } catch (nameErr) {
            console.error('❌ Name field request also failed:', nameErr.message);
          }

          // Nếu tất cả đều thất bại, throw error với thông báo rõ ràng
          throw new Error(`Không thể lấy thông tin user từ Facebook. Lỗi: ${data.error.message}. Có thể cần request permissions trong Facebook App Review.`);
        }
      }

      throw new Error(data.error?.message || `Lỗi khi lấy thông tin user: ${response.status}`);
    }

    // Xử lý profile picture từ nhiều nguồn
    let profilePicUrl = '';

    // Thử lấy từ profile_pic trước
    if (data.profile_pic) {
      profilePicUrl = data.profile_pic;
      console.log('✅ Got profile_pic URL');
    }
    // Nếu không có, thử lấy từ picture.data.url
    else if (data.picture && data.picture.data && data.picture.data.url) {
      profilePicUrl = data.picture.data.url;
      console.log('✅ Got picture.data.url');
    }
    // Nếu không có, thử lấy từ picture.url
    else if (data.picture && data.picture.url) {
      profilePicUrl = data.picture.url;
      console.log('✅ Got picture.url');
    }
    else {
      console.warn('⚠️ No profile picture found in response');
    }

    // Log chi tiết thông tin nhận được
    console.log('✅ User info received:', {
      first_name: data.first_name || 'N/A',
      last_name: data.last_name || 'N/A',
      profile_pic: profilePicUrl ? 'URL present' : 'No URL',
      profile_pic_length: profilePicUrl.length,
      profile_pic_preview: profilePicUrl ? profilePicUrl.substring(0, 80) + '...' : 'Empty',
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'N/A',
      raw_profile_pic: data.profile_pic ? 'present' : 'missing',
      raw_picture: data.picture ? 'present' : 'missing'
    });

    // Trả về với profile_pic đã được xử lý
    return {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      profile_pic: profilePicUrl
    };
  } catch (err) {
    console.error('❌ Error getting user info:', {
      message: err.message,
      stack: err.stack,
      psid
    });
    throw err;
  }
}

module.exports = {
  sendTextMessage,
  sendAttachment,
  getUserInfo
};
