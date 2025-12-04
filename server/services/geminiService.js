/**
 * Gemini AI Service
 * Sử dụng Gemini để phân tích bài viết: loại (mua/bán), đoán giá, độ tin cậy
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// API Key và Model
const GEMINI_API_KEY = 'AIzaSyDqBP2vta8DPYKckfZgKUIwz4WO6yvNhNk';
const MODEL_NAME = 'gemini-2.0-flash-lite';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Phân tích một bài viết với Gemini
 * @param {string} content - Nội dung bài viết
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Object} - { type, estimatedPrice, confidence, category }
 */
async function analyzePost(content, keyword = '') {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Phân tích bài đăng mua bán sau và trả về JSON:

BÀI ĐĂNG:
"${content.substring(0, 500)}"

TỪ KHÓA: ${keyword || 'không có'}

Yêu cầu phân tích:
1. type: "Buying" nếu người đăng MUỐN MUA, "Selling" nếu người đăng MUỐN BÁN, "Unknown" nếu không rõ
2. estimatedPrice: số tiền ước tính (VNĐ), 0 nếu không xác định được
3. confidence: độ tin cậy 0-100 (dựa trên: có giá rõ ràng, mô tả chi tiết, có hình ảnh, không spam)
4. category: danh mục sản phẩm (Điện thoại, Laptop, Xe máy, Ô tô, Đồ điện tử, Thời trang, Bất động sản, Khác)

CHỈ trả về JSON, không giải thích:
{"type":"...", "estimatedPrice":..., "confidence":..., "category":"..."}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        type: parsed.type || 'Unknown',
        estimatedPrice: parseInt(parsed.estimatedPrice) || 0,
        confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 50)),
        category: parsed.category || 'Khác'
      };
    }
    
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Gemini analyze error:', error.message);
    // Fallback: phân tích đơn giản bằng keyword
    return fallbackAnalysis(content);
  }
}

/**
 * Phân tích hàng loạt bài viết
 * @param {Array} posts - Mảng bài viết [{content, keyword}, ...]
 * @returns {Array} - Mảng kết quả phân tích
 */
async function analyzePosts(posts) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Giới hạn 20 bài mỗi lần để tránh quá tải
    const postsToAnalyze = posts.slice(0, 20);
    
    const postList = postsToAnalyze.map((p, i) => 
      `[${i}] "${(p.content || p.fullText || '').substring(0, 200)}..."`
    ).join('\n');

    const prompt = `Phân tích các bài đăng mua bán sau và trả về JSON array:

DANH SÁCH BÀI ĐĂNG:
${postList}

Với mỗi bài, xác định:
1. type: "Buying" (muốn mua) hoặc "Selling" (muốn bán) hoặc "Unknown"
2. estimatedPrice: giá ước tính VNĐ (số nguyên, 0 nếu không rõ)
3. confidence: độ tin cậy 0-100
4. category: danh mục (Điện thoại, Laptop, Xe máy, Ô tô, Đồ điện tử, Thời trang, Bất động sản, Khác)

CHỈ trả về JSON array theo thứ tự, không giải thích:
[{"type":"...", "estimatedPrice":..., "confidence":..., "category":"..."}, ...]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON array từ response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map kết quả về đúng số lượng posts
      return posts.map((post, i) => {
        if (i < parsed.length) {
          return {
            type: parsed[i].type || 'Unknown',
            estimatedPrice: parseInt(parsed[i].estimatedPrice) || 0,
            confidence: Math.min(100, Math.max(0, parseInt(parsed[i].confidence) || 50)),
            category: parsed[i].category || 'Khác'
          };
        }
        return fallbackAnalysis(post.content || post.fullText || '');
      });
    }
    
    throw new Error('Invalid JSON array response');
  } catch (error) {
    console.error('Gemini batch analyze error:', error.message);
    // Fallback cho tất cả
    return posts.map(p => fallbackAnalysis(p.content || p.fullText || ''));
  }
}

/**
 * Phân tích fallback khi Gemini lỗi
 */
function fallbackAnalysis(content) {
  const text = (content || '').toLowerCase();
  
  let type = 'Unknown';
  if (text.includes('cần mua') || text.includes('muốn mua') || text.includes('tìm mua') || 
      text.includes('ai bán') || text.includes('hỏi mua') || text.includes('mua lại')) {
    type = 'Buying';
  } else if (text.includes('cần bán') || text.includes('bán gấp') || text.includes('thanh lý') ||
             text.includes('bán lại') || text.includes('pass lại') || text.includes('giá')) {
    type = 'Selling';
  }
  
  // Đoán giá từ text
  let estimatedPrice = 0;
  const pricePatterns = [
    /(\d+)\s*(tr|triệu)/gi,
    /(\d+)\s*(k|nghìn)/gi,
    /(\d+)\s*(đ|vnd|vnđ)/gi,
    /giá\s*:?\s*(\d+)/gi
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const numMatch = match[0].match(/\d+/);
      if (numMatch) {
        let num = parseInt(numMatch[0]);
        if (match[0].includes('tr') || match[0].includes('triệu')) {
          num *= 1000000;
        } else if (match[0].includes('k') || match[0].includes('nghìn')) {
          num *= 1000;
        }
        estimatedPrice = num;
        break;
      }
    }
  }
  
  // Đoán category
  let category = 'Khác';
  if (text.includes('iphone') || text.includes('samsung') || text.includes('điện thoại') || text.includes('phone')) {
    category = 'Điện thoại';
  } else if (text.includes('laptop') || text.includes('macbook') || text.includes('máy tính')) {
    category = 'Laptop';
  } else if (text.includes('xe máy') || text.includes('honda') || text.includes('yamaha')) {
    category = 'Xe máy';
  } else if (text.includes('ô tô') || text.includes('xe hơi') || text.includes('toyota')) {
    category = 'Ô tô';
  }
  
  return {
    type,
    estimatedPrice,
    confidence: type !== 'Unknown' ? 60 : 30,
    category
  };
}

/**
 * Lọc bài viết spam/không liên quan
 */
async function filterRelevantPosts(posts, keywords) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const postList = posts.slice(0, 30).map((p, i) => 
      `[${i}] "${(p.fullText || p.content || '').substring(0, 150)}..."`
    ).join('\n');

    const prompt = `Lọc các bài đăng mua bán liên quan đến từ khóa.

TỪ KHÓA: ${keywords.join(', ')}

DANH SÁCH:
${postList}

Trả về JSON array chứa INDEX của các bài THỰC SỰ mua bán liên quan (bỏ spam, quảng cáo, không liên quan):
{"matchedIndices": [0, 1, 3, ...]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.matchedIndices)) {
        return parsed.matchedIndices
          .filter(idx => idx >= 0 && idx < posts.length)
          .map(idx => posts[idx]);
      }
    }
    
    return posts; // Trả về tất cả nếu lỗi
  } catch (error) {
    console.error('Gemini filter error:', error.message);
    return posts;
  }
}

module.exports = {
  analyzePost,
  analyzePosts,
  filterRelevantPosts,
  fallbackAnalysis
};

