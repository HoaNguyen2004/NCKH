/**
 * Scraper Routes
 * API endpoints cho việc thu thập dữ liệu từ Facebook
 * Tích hợp Gemini AI để phân tích loại mua/bán, giá, độ tin cậy
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import services
const { 
  initLoginAndSaveCookies, 
  scrapeWithSearch, 
  scrapeFeedByKeywords,
  getCookiePath 
} = require('../services/scraperService');

const {
  analyzePosts,
  analyzePostsAdvanced,
  filterRelevantPosts,
  fallbackAnalysis,
  extractContactInfo
} = require('../services/geminiService');

// Import models
const Post = require('../models/Post');
const Lead = require('../models/Lead');

// Data directory để lưu kết quả
const DATA_DIR = path.join(__dirname, '..', 'scraper-data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Hàm tạo hash từ content
const createContentHash = (content) => {
  if (!content) return '';
  return content.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 100);
};

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, status: 'online', timestamp: new Date().toISOString() });
});

// Đăng nhập Facebook và lưu cookie
router.post('/init-login', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ ok: false, error: 'Thiếu email' });
  }
  
  try {
    await initLoginAndSaveCookies(email);
    return res.json({ ok: true, message: 'OK. Đã lưu cookie thành công!' });
  } catch (e) {
    console.error('Login error:', e);
    return res.json({ ok: false, error: e.message });
  }
});

// Kiểm tra cookie đã tồn tại chưa
router.post('/check-cookie', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ ok: false, error: 'Thiếu email' });
  }
  
  try {
    const cookiePath = getCookiePath(email);
    const exists = fs.existsSync(cookiePath);
    return res.json({ ok: true, hasCookie: exists });
  } catch (e) {
    return res.json({ ok: false, error: e.message });
  }
});

/**
 * Lưu kết quả vào Posts và Leads (PHIÊN BẢN NÂNG CAO)
 * Hỗ trợ tách nhiều sản phẩm từ 1 bài đăng
 * @param {Array} items - Các bài viết đã phân tích
 * @param {Array} advancedAnalyses - Kết quả phân tích nâng cao từ Gemini (optional)
 * @param {Object} io - Socket.IO instance (optional)
 * @param {Object} scrapedByInfo - Thông tin người quét { userId, email }
 */
async function saveResultsToDatabase(items, advancedAnalyses = null, io = null, scrapedByInfo = null) {
  const results = {
    postsAdded: 0,
    leadsAdded: 0,
    productsExtracted: 0,
    duplicates: 0,
    errors: 0,
    newPosts: [],
    newLeads: []
  };

  // Lấy tất cả URL và hash đã có
  const existingUrls = new Set();
  const existingHashes = new Set();

  const existingPosts = await Post.find({}, 'url contentHash');
  existingPosts.forEach(p => {
    if (p.url) existingUrls.add(p.url.split('?')[0]);
    if (p.contentHash) existingHashes.add(p.contentHash);
  });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const advAnalysis = advancedAnalyses ? advancedAnalyses[i] : null;
    
    try {
      const url = item.url?.split('?')[0];
      const contentHash = createContentHash(item.fullText || item.title);

      // Kiểm tra trùng lặp
      if ((url && existingUrls.has(url)) || (contentHash && existingHashes.has(contentHash))) {
        results.duplicates++;
        continue;
      }

      // Xác định type và confidence từ phân tích nâng cao hoặc cơ bản
      const postType = advAnalysis?.postType || item.type || 'Unknown';
      const confidence = advAnalysis?.confidence || item.confidence || 50;
      
      // Lấy sản phẩm được tách (nếu có)
      const extractedProducts = advAnalysis?.products || [];
      const productCount = extractedProducts.length;
      
      // Lấy category từ sản phẩm đầu tiên hoặc từ item
      const mainCategory = extractedProducts[0]?.category || item.category || item.keyword || 'Khác';
      
      // Lấy giá từ sản phẩm đầu tiên hoặc từ item
      const mainPrice = extractedProducts[0]?.price || item.estimatedPrice || 0;

      // Tạo bài viết mới với thông tin nâng cao
      const post = new Post({
        title: item.title || (item.fullText?.substring(0, 80) + '...'),
        fullContent: item.fullText || item.title,
        type: postType,
        category: mainCategory,
        platform: 'Facebook',
        sourceType: item.sourceType || 'group_post',
        url: item.url,
        image: item.image,
        price: mainPrice,
        priceText: item.price,
        author: item.author || 'Unknown',
        authorId: item.uid,
        location: item.location || 'Việt Nam',
        keyword: item.keyword,
        confidence: confidence,
        contentHash,
        // Thông tin sản phẩm được tách
        extractedProducts: extractedProducts,
        productCount: productCount,
        // Thông tin người mua/bán
        buyerInfo: advAnalysis?.buyerInfo || null,
        sellerInfo: advAnalysis?.sellerInfo || null,
        contactInfo: advAnalysis?.contactInfo || extractContactInfo(item.fullText || ''),
        // Đánh dấu đã phân tích AI
        aiAnalyzed: !!advAnalysis,
        aiAnalyzedAt: advAnalysis ? new Date() : null,
        // Lưu thông tin người quét
        scrapedBy: scrapedByInfo?.userId || null,
        scrapedByEmail: scrapedByInfo?.email || null
      });

      await post.save();
      results.postsAdded++;
      results.productsExtracted += productCount;
      results.newPosts.push(post);

      // Thêm vào Set để tránh trùng trong cùng batch
      if (url) existingUrls.add(url);
      if (contentHash) existingHashes.add(contentHash);

      // Nếu là bài MUA -> tạo Lead (khách hàng tiềm năng) CHI TIẾT HƠN
      if (postType === 'Buying') {
        try {
          const buyerInfo = advAnalysis?.buyerInfo || {};
          const contactInfo = advAnalysis?.contactInfo || {};
          
          // Tạo danh sách sản phẩm quan tâm từ các sản phẩm được tách
          const interestProducts = extractedProducts.map(p => p.name).join(', ') || mainCategory;
          
          // Tạo mảng sản phẩm quan tâm chi tiết
          const interestedProductsList = extractedProducts.map(p => ({
            name: p.name,
            category: p.category,
            budget: p.price || 0,
            condition: p.condition
          }));
          
          // Tính ngân sách từ các sản phẩm
          const totalBudget = extractedProducts.reduce((sum, p) => sum + (p.price || 0), 0) || mainPrice;
          
          const lead = new Lead({
            name: buyerInfo.name || item.author || 'Khách hàng từ Facebook',
            phone: contactInfo.phone || '',
            email: '',
            zalo: contactInfo.zalo || '',
            messenger: contactInfo.messenger || '',
            location: item.location || 'Việt Nam',
            interest: interestProducts,
            interestedProducts: interestedProductsList,
            type: 'buyer',
            budget: totalBudget ? `${totalBudget.toLocaleString()}đ` : buyerInfo.budget || '',
            budgetNumber: totalBudget,
            status: 'new',
            priority: (buyerInfo.urgency === 'high' || confidence >= 70) ? 'high' : 
                     (buyerInfo.urgency === 'medium' || confidence >= 50) ? 'medium' : 'low',
            urgency: buyerInfo.urgency || 'medium',
            requirements: buyerInfo.requirements || '',
            source: 'Facebook Scraper',
            notes: `📝 Yêu cầu: ${buyerInfo.requirements || 'Không rõ'}\n\n` +
                   `📦 Sản phẩm quan tâm (${productCount} SP): ${interestProducts}\n\n` +
                   `📱 Liên hệ: ${contactInfo.phone || 'Không có'} | Zalo: ${contactInfo.zalo || 'Không có'}\n\n` +
                   `📄 Nội dung gốc:\n${item.fullText?.substring(0, 300)}...\n\n` +
                   `🔗 Link: ${item.url}`,
            postUrl: item.url,
            postId: post._id,
            createdBy: scrapedByInfo?.userId || null,
            createdByEmail: scrapedByInfo?.email || ''
          });

          await lead.save();
          results.leadsAdded++;
          results.newLeads.push(lead);
          
          console.log(`👤 Created lead for buyer: ${lead.name} - Interest: ${interestProducts} (${productCount} products)`);
        } catch (leadErr) {
          console.error('Save lead error:', leadErr.message);
        }
      }

    } catch (err) {
      if (err.code === 11000) {
        results.duplicates++;
      } else {
        results.errors++;
        console.error('Save post error:', err.message);
      }
    }
  }

  // Emit socket event nếu có io
  if (io && results.newPosts.length > 0) {
    const postsData = results.newPosts.map(post => {
      const postObj = post.toObject ? post.toObject() : post;
      return {
        _id: postObj._id,
        id: postObj._id,
        title: postObj.title,
        fullContent: postObj.fullContent,
        type: postObj.type,
        platform: postObj.platform,
        confidence: postObj.confidence,
        createdAt: postObj.createdAt,
        author: postObj.author,
        price: postObj.price,
        location: postObj.location,
        category: postObj.category,
        status: postObj.status,
        url: postObj.url,
        image: postObj.image,
        // Thêm thông tin mới
        productCount: postObj.productCount,
        extractedProducts: postObj.extractedProducts,
        buyerInfo: postObj.buyerInfo,
        contactInfo: postObj.contactInfo
      };
    });

    io.to('posts').emit('posts:new', { count: results.newPosts.length, posts: postsData });
    io.emit('posts:new', { count: results.newPosts.length, posts: postsData });
    console.log(`📡 Emitted ${results.newPosts.length} new posts via socket (${results.productsExtracted} products extracted)`);
  }

  return results;
}

// Helper: Lấy thông tin user từ token
async function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select('_id email role');
    return user;
  } catch (err) {
    console.log('⚠️ Could not identify scraper user:', err.message);
    return null;
  }
}

// Factory function để nhận io
module.exports = function(io) {
  
  // Quét theo Search Mode
  router.post('/scrape-filter', async (req, res) => {
    const { email, url, keywordsText } = req.body;

    if (!email || !url || !keywordsText) {
      return res.json({ ok: false, error: 'Thiếu thông tin.' });
    }

    try {
      // Lấy thông tin người quét từ token
      const scrapedByUser = await getUserFromToken(req);
      const scrapedByInfo = scrapedByUser 
        ? { userId: scrapedByUser._id, email: scrapedByUser.email }
        : null;
      
      if (scrapedByInfo) {
        console.log(`👤 Scraping by user: ${scrapedByInfo.email}`);
      }
      
      const keywords = keywordsText.split(/\r?\n|,/).map(x => x.trim()).filter(x => x);
      if (!keywords.length) {
        return res.json({ ok: false, error: 'Nhập ít nhất 1 từ khóa' });
      }

      let items;
      try {
        items = await scrapeWithSearch(email, url, keywords);
      } catch (err) {
        if (err.message === 'NO_COOKIE') {
          return res.json({ ok: false, error: 'Chưa có cookie login!' });
        }
        if (err.message === 'COOKIE_INVALID') {
          return res.json({ ok: false, error: 'Cookie hết hạn, cần login lại!' });
        }
        throw err;
      }

      console.log(`📦 Scraped ${items.length} items, analyzing with Gemini...`);

      // Phân tích với Gemini
      let analyzedItems = items;
      let advancedAnalyses = null;
      
      if (items.length > 0) {
        try {
          // Lọc bài spam trước
          const filteredItems = await filterRelevantPosts(items, keywords);
          console.log(`🔍 Filtered: ${filteredItems.length}/${items.length} relevant posts`);

          // PHÂN TÍCH NÂNG CAO: Tách nhiều sản phẩm từ mỗi bài
          console.log(`🤖 Running advanced analysis (extracting products)...`);
          advancedAnalyses = await analyzePostsAdvanced(filteredItems);
          
          // Map kết quả vào items
          analyzedItems = filteredItems.map((item, i) => {
            const adv = advancedAnalyses[i];
            return {
              ...item,
              type: adv?.postType || 'Unknown',
              estimatedPrice: adv?.products?.[0]?.price || 0,
              confidence: adv?.confidence || 50,
              category: adv?.products?.[0]?.category || item.keyword || 'Khác'
            };
          });
          
          const totalProducts = advancedAnalyses.reduce((sum, a) => sum + (a?.products?.length || 0), 0);
          console.log(`✅ Analyzed ${analyzedItems.length} posts, extracted ${totalProducts} products`);
        } catch (geminiErr) {
          console.error('Gemini analysis error:', geminiErr.message);
          // Fallback
          analyzedItems = items.map(item => {
            const analysis = fallbackAnalysis(item.fullText || item.title);
            return { ...item, ...analysis };
          });
          advancedAnalyses = null;
        }
      }

      // Tự động lưu vào database (kèm thông tin người quét và phân tích nâng cao)
      const saveResults = await saveResultsToDatabase(analyzedItems, advancedAnalyses, io, scrapedByInfo);
      console.log(`💾 Saved: ${saveResults.postsAdded} posts, ${saveResults.leadsAdded} leads, ${saveResults.productsExtracted} products`);

      // Lưu file backup
      const fileName = `search_data_${Date.now()}.json`;
      const filePath = path.join(DATA_DIR, fileName);
      fs.writeFileSync(filePath, JSON.stringify({ 
        keywords, url, 
        total: items.length, 
        analyzed: analyzedItems.length,
        saved: saveResults,
        scrapedBy: scrapedByInfo?.email || 'unknown'
      }, null, 2));

      return res.json({
        ok: true,
        file: fileName,
        matched: analyzedItems,
        count: analyzedItems.length,
        totalItems: items.length,
        saved: {
          posts: saveResults.postsAdded,
          leads: saveResults.leadsAdded,
          products: saveResults.productsExtracted,
          duplicates: saveResults.duplicates
        },
        // Thêm thông tin phân tích chi tiết
        analysis: advancedAnalyses ? {
          totalProducts: advancedAnalyses.reduce((sum, a) => sum + (a?.products?.length || 0), 0),
          buyingPosts: advancedAnalyses.filter(a => a?.postType === 'Buying').length,
          sellingPosts: advancedAnalyses.filter(a => a?.postType === 'Selling').length
        } : null
      });

    } catch (e) {
      console.error('Scrape error:', e);
      return res.json({ ok: false, error: e.message });
    }
  });

  // Quét theo Feed Mode - không cần từ khóa, cào tất cả và AI phân loại
  router.post('/scrape-feed', async (req, res) => {
    const { email, feedUrl, scrollCount } = req.body;

    if (!email || !feedUrl) {
      return res.json({ ok: false, error: 'Thiếu thông tin (email hoặc feedUrl).' });
    }

    try {
      // Lấy thông tin người quét từ token
      const scrapedByUser = await getUserFromToken(req);
      const scrapedByInfo = scrapedByUser 
        ? { userId: scrapedByUser._id, email: scrapedByUser.email }
        : null;
      
      if (scrapedByInfo) {
        console.log(`👤 Feed scraping by user: ${scrapedByInfo.email}`);
      }
      
      let items;
      try {
        // Cào tất cả bài viết từ feed, không lọc từ khóa
        items = await scrapeFeedByKeywords(
          email, 
          feedUrl, 
          [], // Không dùng từ khóa lọc
          scrollCount || 10
        );
      } catch (err) {
        if (err.message === 'NO_COOKIE') {
          return res.json({ ok: false, error: 'Chưa có cookie login!' });
        }
        if (err.message === 'COOKIE_INVALID') {
          return res.json({ ok: false, error: 'Cookie hết hạn, cần login lại!' });
        }
        console.error(err);
        return res.json({ ok: false, error: 'Lỗi Scraper: ' + err.message });
      }

      console.log(`📦 Scraped ${items.length} feed items, analyzing with Gemini...`);

      // Phân tích với Gemini
      let analyzedItems = items;
      let advancedAnalyses = null;
      
      if (items.length > 0) {
        try {
          // PHÂN TÍCH NÂNG CAO: Tách nhiều sản phẩm từ mỗi bài
          console.log(`🤖 Running advanced analysis (extracting products)...`);
          advancedAnalyses = await analyzePostsAdvanced(items);
          
          // Map kết quả vào items
          analyzedItems = items.map((item, i) => {
            const adv = advancedAnalyses[i];
            return {
              ...item,
              type: adv?.postType || 'Unknown',
              estimatedPrice: adv?.products?.[0]?.price || 0,
              confidence: adv?.confidence || 50,
              category: adv?.products?.[0]?.category || 'Khác'
            };
          });
          
          const totalProducts = advancedAnalyses.reduce((sum, a) => sum + (a?.products?.length || 0), 0);
          console.log(`✅ Analyzed ${analyzedItems.length} feed posts, extracted ${totalProducts} products`);
        } catch (geminiErr) {
          console.error('Gemini analysis error:', geminiErr.message);
          // Fallback
          analyzedItems = items.map(item => {
            const analysis = fallbackAnalysis(item.fullText || item.title);
            return { ...item, ...analysis };
          });
          advancedAnalyses = null;
        }
      }

      // Tự động lưu vào database (kèm thông tin người quét và phân tích nâng cao)
      const saveResults = await saveResultsToDatabase(analyzedItems, advancedAnalyses, io, scrapedByInfo);
      console.log(`💾 Saved: ${saveResults.postsAdded} posts, ${saveResults.leadsAdded} leads, ${saveResults.productsExtracted} products`);

      // Lưu file backup
      const fileName = `feed_data_${Date.now()}.json`;
      const filePath = path.join(DATA_DIR, fileName);
      fs.writeFileSync(filePath, JSON.stringify({ 
        feedUrl, 
        total: items.length,
        analyzed: analyzedItems.length,
        saved: saveResults,
        scrapedBy: scrapedByInfo?.email || 'unknown'
      }, null, 2));

      return res.json({
        ok: true,
        file: fileName,
        matched: analyzedItems,
        count: analyzedItems.length,
        totalScraped: items.length,
        saved: {
          posts: saveResults.postsAdded,
          leads: saveResults.leadsAdded,
          products: saveResults.productsExtracted,
          duplicates: saveResults.duplicates
        },
        // Thêm thông tin phân tích chi tiết
        analysis: advancedAnalyses ? {
          totalProducts: advancedAnalyses.reduce((sum, a) => sum + (a?.products?.length || 0), 0),
          buyingPosts: advancedAnalyses.filter(a => a?.postType === 'Buying').length,
          sellingPosts: advancedAnalyses.filter(a => a?.postType === 'Selling').length
        } : null
      });

    } catch (e) {
      console.error('Feed scrape error:', e);
      return res.json({ ok: false, error: e.message });
    }
  });

  return router;
};
