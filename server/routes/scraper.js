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
  filterRelevantPosts,
  fallbackAnalysis
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
 * Lưu kết quả vào Posts và Leads
 * @param {Array} items - Các bài viết đã phân tích
 * @param {Object} io - Socket.IO instance (optional)
 * @param {Object} scrapedByInfo - Thông tin người quét { userId, email }
 */
async function saveResultsToDatabase(items, io = null, scrapedByInfo = null) {
  const results = {
    postsAdded: 0,
    leadsAdded: 0,
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

  for (const item of items) {
    try {
      const url = item.url?.split('?')[0];
      const contentHash = createContentHash(item.fullText || item.title);

      // Kiểm tra trùng lặp
      if ((url && existingUrls.has(url)) || (contentHash && existingHashes.has(contentHash))) {
        results.duplicates++;
        continue;
      }

      // Tạo bài viết mới
      const post = new Post({
        title: item.title || (item.fullText?.substring(0, 80) + '...'),
        fullContent: item.fullText || item.title,
        type: item.type || 'Unknown',
        category: item.category || item.keyword || 'Khác',
        platform: 'Facebook',
        sourceType: item.sourceType || 'group_post',
        url: item.url,
        image: item.image,
        price: item.estimatedPrice || 0,
        priceText: item.price,
        author: item.author || 'Unknown',
        authorId: item.uid,
        location: item.location || 'Việt Nam',
        keyword: item.keyword,
        confidence: item.confidence || 50,
        contentHash,
        // Lưu thông tin người quét
        scrapedBy: scrapedByInfo?.userId || null,
        scrapedByEmail: scrapedByInfo?.email || null
      });

      await post.save();
      results.postsAdded++;
      results.newPosts.push(post);

      // Thêm vào Set để tránh trùng trong cùng batch
      if (url) existingUrls.add(url);
      if (contentHash) existingHashes.add(contentHash);

      // Nếu là bài MUA -> tạo Lead (khách hàng tiềm năng)
      if (item.type === 'Buying') {
        try {
          const lead = new Lead({
            name: item.author || 'Khách hàng từ Facebook',
            phone: '', // Không có số điện thoại
            email: '', // Không có email
            location: item.location || 'Việt Nam',
            interest: item.category || item.keyword || 'Sản phẩm',
            type: 'buyer',
            budget: item.estimatedPrice ? `${item.estimatedPrice.toLocaleString()}đ` : '',
            status: 'new',
            priority: item.confidence >= 70 ? 'high' : item.confidence >= 50 ? 'medium' : 'low',
            source: 'Facebook Scraper',
            notes: `Bài viết: ${item.fullText?.substring(0, 200)}...\n\nLink: ${item.url}`,
            postUrl: item.url,
            postId: post._id
          });

          await lead.save();
          results.leadsAdded++;
          results.newLeads.push(lead);
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
        image: postObj.image
      };
    });

    io.to('posts').emit('posts:new', { count: results.newPosts.length, posts: postsData });
    io.emit('posts:new', { count: results.newPosts.length, posts: postsData });
    console.log(`📡 Emitted ${results.newPosts.length} new posts via socket`);
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
      if (items.length > 0) {
        try {
          // Lọc bài spam trước
          const filteredItems = await filterRelevantPosts(items, keywords);
          console.log(`🔍 Filtered: ${filteredItems.length}/${items.length} relevant posts`);

          // Phân tích loại mua/bán, giá, độ tin cậy
          const analyses = await analyzePosts(filteredItems);
          
          analyzedItems = filteredItems.map((item, i) => ({
            ...item,
            type: analyses[i]?.type || 'Unknown',
            estimatedPrice: analyses[i]?.estimatedPrice || 0,
            confidence: analyses[i]?.confidence || 50,
            category: analyses[i]?.category || item.keyword || 'Khác'
          }));
          
          console.log(`✅ Analyzed ${analyzedItems.length} posts with Gemini`);
        } catch (geminiErr) {
          console.error('Gemini analysis error:', geminiErr.message);
          // Fallback
          analyzedItems = items.map(item => {
            const analysis = fallbackAnalysis(item.fullText || item.title);
            return { ...item, ...analysis };
          });
        }
      }

      // Tự động lưu vào database (kèm thông tin người quét)
      const saveResults = await saveResultsToDatabase(analyzedItems, io, scrapedByInfo);
      console.log(`💾 Saved: ${saveResults.postsAdded} posts, ${saveResults.leadsAdded} leads`);

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
          duplicates: saveResults.duplicates
        }
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
      if (items.length > 0) {
        try {
          // Phân tích loại mua/bán, giá, độ tin cậy
          const analyses = await analyzePosts(items);
          
          analyzedItems = items.map((item, i) => ({
            ...item,
            type: analyses[i]?.type || 'Unknown',
            estimatedPrice: analyses[i]?.estimatedPrice || 0,
            confidence: analyses[i]?.confidence || 50,
            category: analyses[i]?.category || 'Khác'
          }));
          
          console.log(`✅ Analyzed ${analyzedItems.length} feed posts with Gemini`);
        } catch (geminiErr) {
          console.error('Gemini analysis error:', geminiErr.message);
          // Fallback
          analyzedItems = items.map(item => {
            const analysis = fallbackAnalysis(item.fullText || item.title);
            return { ...item, ...analysis };
          });
        }
      }

      // Tự động lưu vào database (kèm thông tin người quét)
      const saveResults = await saveResultsToDatabase(analyzedItems, io, scrapedByInfo);
      console.log(`💾 Saved: ${saveResults.postsAdded} posts, ${saveResults.leadsAdded} leads`);

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
          duplicates: saveResults.duplicates
        }
      });

    } catch (e) {
      console.error('Feed scrape error:', e);
      return res.json({ ok: false, error: e.message });
    }
  });

  return router;
};
