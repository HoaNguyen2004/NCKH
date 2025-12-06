/**
 * Gemini AI Service
 * Sử dụng Gemini để phân tích bài viết: loại (mua/bán), đoán giá, độ tin cậy
 * Hỗ trợ tách nhiều sản phẩm từ 1 bài đăng
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// API Key và Model - Nên dùng env variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'Yourkey';
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

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

/**
 * PHÂN TÍCH NÂNG CAO: Tách nhiều sản phẩm từ 1 bài đăng
 * Mỗi bài đăng có thể chứa nhiều mặt hàng khác nhau
 * @param {Object} post - Bài đăng { fullText, title, author, url, location, ... }
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Object} - { originalPost, products: [...], buyerInfo, sellerInfo }
 */
async function analyzePostAdvanced(post, keyword = '') {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const content = post.fullText || post.content || post.title || '';

    const prompt = `Phân tích bài đăng mua bán sau và TÁCH RIÊNG từng sản phẩm nếu có nhiều mặt hàng.

BÀI ĐĂNG:
"${content.substring(0, 1500)}"

NGƯỜI ĐĂNG: ${post.author || 'Không rõ'}
ĐỊA ĐIỂM: ${post.location || 'Không rõ'}
TỪ KHÓA TÌM KIẾM: ${keyword || 'không có'}

YÊU CẦU PHÂN TÍCH:
1. Xác định đây là bài MUỐN MUA hay MUỐN BÁN
2. TÁCH RIÊNG từng sản phẩm nếu bài có nhiều mặt hàng (ví dụ: "Bán iPhone 12 và Macbook Air" -> 2 sản phẩm)
3. Với mỗi sản phẩm, trích xuất: tên, giá, tình trạng, mô tả
4. Nếu là bài MUA -> trích xuất thông tin người mua (khách hàng tiềm năng)
5. Nếu là bài BÁN -> trích xuất thông tin người bán

CHỈ trả về JSON theo format sau, không giải thích:
{
  "postType": "Buying" hoặc "Selling" hoặc "Unknown",
  "confidence": 0-100,
  "products": [
    {
      "name": "Tên sản phẩm",
      "category": "Danh mục (Điện thoại/Laptop/Xe máy/Ô tô/Đồ điện tử/Thời trang/Bất động sản/Khác)",
      "price": số tiền VNĐ (0 nếu không rõ),
      "priceText": "giá gốc trong bài (nếu có)",
      "condition": "Mới/Đã sử dụng/Không rõ",
      "description": "Mô tả ngắn về sản phẩm",
      "brand": "Thương hiệu (nếu có)"
    }
  ],
  "buyerInfo": {
    "name": "Tên người mua (nếu là bài mua)",
    "budget": "Ngân sách dự kiến",
    "urgency": "high/medium/low",
    "requirements": "Yêu cầu cụ thể"
  },
  "sellerInfo": {
    "name": "Tên người bán (nếu là bài bán)",
    "negotiable": true/false,
    "warranty": "Thông tin bảo hành (nếu có)"
  },
  "contactInfo": {
    "phone": "Số điện thoại (nếu có trong bài)",
    "zalo": "Zalo (nếu có)",
    "messenger": "Link messenger (nếu có)"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        postType: parsed.postType || 'Unknown',
        confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence) || 50)),
        products: Array.isArray(parsed.products) ? parsed.products.map(p => ({
          name: p.name || 'Sản phẩm không xác định',
          category: p.category || 'Khác',
          price: parseInt(p.price) || 0,
          priceText: p.priceText || '',
          condition: p.condition || 'Không rõ',
          description: p.description || '',
          brand: p.brand || ''
        })) : [],
        buyerInfo: parsed.buyerInfo || null,
        sellerInfo: parsed.sellerInfo || null,
        contactInfo: parsed.contactInfo || null
      };
    }
    
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Gemini advanced analyze error:', error.message);
    // Fallback
    return fallbackAdvancedAnalysis(post, keyword);
  }
}

/**
 * Phân tích nâng cao hàng loạt
 * @param {Array} posts - Mảng bài viết
 * @returns {Array} - Mảng kết quả phân tích nâng cao
 */
async function analyzePostsAdvanced(posts) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Giới hạn 10 bài mỗi lần để tránh quá tải và đảm bảo chất lượng
    const postsToAnalyze = posts.slice(0, 10);
    
    const postList = postsToAnalyze.map((p, i) => 
      `[${i}] Người đăng: ${p.author || 'Unknown'}\nNội dung: "${(p.fullText || p.content || '').substring(0, 400)}..."\nĐịa điểm: ${p.location || 'Không rõ'}`
    ).join('\n\n---\n\n');

    const prompt = `Phân tích các bài đăng mua bán sau. Với mỗi bài, TÁCH RIÊNG từng sản phẩm nếu có nhiều mặt hàng.

DANH SÁCH BÀI ĐĂNG:
${postList}

Với mỗi bài, xác định:
1. postType: "Buying" (muốn mua) hoặc "Selling" (muốn bán) hoặc "Unknown"
2. confidence: độ tin cậy 0-100
3. products: mảng các sản phẩm được tách ra, mỗi sản phẩm gồm { name, category, price, condition, description }
4. buyerInfo: nếu là bài mua { name, budget, urgency, requirements }
5. contactInfo: { phone, zalo } nếu có trong bài

CHỈ trả về JSON array theo thứ tự bài đăng, không giải thích:
[
  {
    "postType": "...",
    "confidence": ...,
    "products": [{ "name": "...", "category": "...", "price": ..., "condition": "...", "description": "..." }],
    "buyerInfo": { "name": "...", "budget": "...", "urgency": "...", "requirements": "..." } hoặc null,
    "contactInfo": { "phone": "...", "zalo": "..." } hoặc null
  },
  ...
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON array từ response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map kết quả về đúng số lượng posts
      return posts.map((post, i) => {
        if (i < parsed.length && parsed[i]) {
          const analysis = parsed[i];
          return {
            postType: analysis.postType || 'Unknown',
            confidence: Math.min(100, Math.max(0, parseInt(analysis.confidence) || 50)),
            products: Array.isArray(analysis.products) ? analysis.products.map(p => ({
              name: p.name || 'Sản phẩm không xác định',
              category: p.category || 'Khác',
              price: parseInt(p.price) || 0,
              priceText: p.priceText || '',
              condition: p.condition || 'Không rõ',
              description: p.description || '',
              brand: p.brand || ''
            })) : [],
            buyerInfo: analysis.buyerInfo || null,
            sellerInfo: analysis.sellerInfo || null,
            contactInfo: analysis.contactInfo || null
          };
        }
        return fallbackAdvancedAnalysis(post, '');
      });
    }
    
    throw new Error('Invalid JSON array response');
  } catch (error) {
    console.error('Gemini batch advanced analyze error:', error.message);
    // Fallback cho tất cả
    return posts.map(p => fallbackAdvancedAnalysis(p, ''));
  }
}

/**
 * Fallback phân tích nâng cao khi Gemini lỗi
 */
function fallbackAdvancedAnalysis(post, keyword) {
  const content = post.fullText || post.content || post.title || '';
  const basicAnalysis = fallbackAnalysis(content);
  
  // Tách sản phẩm đơn giản bằng regex
  const products = [];
  
  // Tìm các mẫu giá trong bài
  const pricePatterns = [
    /(\d+)\s*(tr|triệu)/gi,
    /(\d+)\s*(k|nghìn)/gi,
    /giá\s*:?\s*(\d+)/gi
  ];
  
  // Tạo 1 sản phẩm mặc định từ bài viết
  products.push({
    name: keyword || basicAnalysis.category || 'Sản phẩm',
    category: basicAnalysis.category,
    price: basicAnalysis.estimatedPrice,
    priceText: '',
    condition: 'Không rõ',
    description: content.substring(0, 200),
    brand: ''
  });
  
  return {
    postType: basicAnalysis.type,
    confidence: basicAnalysis.confidence,
    products,
    buyerInfo: basicAnalysis.type === 'Buying' ? {
      name: post.author || 'Khách hàng',
      budget: basicAnalysis.estimatedPrice ? `${basicAnalysis.estimatedPrice.toLocaleString()}đ` : '',
      urgency: 'medium',
      requirements: ''
    } : null,
    sellerInfo: basicAnalysis.type === 'Selling' ? {
      name: post.author || 'Người bán',
      negotiable: true,
      warranty: ''
    } : null,
    contactInfo: extractContactInfo(content)
  };
}

/**
 * Trích xuất thông tin liên hệ từ nội dung
 */
function extractContactInfo(content) {
  const info = { phone: '', zalo: '', messenger: '' };
  
  // Tìm số điện thoại (10-11 số)
  const phoneMatch = content.match(/(?:0|\+84|84)[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}/);
  if (phoneMatch) {
    info.phone = phoneMatch[0].replace(/[\s.-]/g, '');
  }
  
  // Tìm Zalo
  const zaloMatch = content.match(/zalo[\s:]*(?:0|\+84|84)?[\s.-]?\d{9,11}/i);
  if (zaloMatch) {
    const nums = zaloMatch[0].match(/\d+/g);
    if (nums) info.zalo = nums.join('');
  }
  
  return info;
}

module.exports = {
  analyzePost,
  analyzePosts,
  analyzePostAdvanced,
  analyzePostsAdvanced,
  filterRelevantPosts,
  fallbackAnalysis,
  fallbackAdvancedAnalysis,
  extractContactInfo
};

