/* server/routes/posts.js */
const express = require('express');
const Post = require('../models/Post');

// Factory function nhận io để emit events
module.exports = function(io) {
  const router = express.Router();

  // Hàm tạo hash từ content
  const createContentHash = (content) => {
    if (!content) return '';
    return content.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 100);
  };

  // ==========================================
  // GET /api/posts - Lấy danh sách bài viết
  // ==========================================
  router.get('/', async (req, res) => {
    try {
      console.log('📥 GET /api/posts request received');
      const { 
        type, 
        platform, 
        status, 
        keyword,
        limit = 200, 
        skip = 0,
        sort = '-createdAt'
      } = req.query;

      const filter = {};
      if (type && type !== 'all') filter.type = type;
      if (platform && platform !== 'all') filter.platform = platform;
      if (status && status !== 'all') filter.status = status;
      if (keyword) filter.keyword = { $regex: keyword, $options: 'i' };

      console.log('🔍 Filter:', filter);

      const posts = await Post.find(filter)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean(); // Use lean() for better performance

      const total = await Post.countDocuments(filter);

      console.log(`✅ Found ${posts.length} posts (total: ${total})`);

      res.json({
        success: true,
        posts,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      });
    } catch (err) {
      console.error('❌ Get posts error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // GET /api/posts/stats - Thống kê bài viết
  // ==========================================
  router.get('/stats', async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [total, buying, selling, facebook, todayCount] = await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ type: 'Buying' }),
        Post.countDocuments({ type: 'Selling' }),
        Post.countDocuments({ platform: 'Facebook' }),
        Post.countDocuments({ createdAt: { $gte: today } })
      ]);

      console.log(`📊 Stats: Total=${total}, Buying=${buying}, Selling=${selling}, Facebook=${facebook}, Today=${todayCount}`);

      res.json({
        success: true,
        stats: {
          total,
          buying,
          selling,
          facebook,
          today: todayCount
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // GET /api/posts/test - Test endpoint để kiểm tra
  // ==========================================
  router.get('/test', async (req, res) => {
    try {
      const total = await Post.countDocuments();
      const recent = await Post.find().sort('-createdAt').limit(5).lean();
      
      res.json({
        success: true,
        message: 'Posts API is working',
        totalPosts: total,
        recentPosts: recent
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // POST /api/posts - Thêm bài viết mới (từ scraper)
  // ==========================================
  router.post('/', async (req, res) => {
    try {
      console.log('📥 Received POST /api/posts request');
      const { items } = req.body;
      console.log(`📦 Received ${items?.length || 0} items`);

      if (!items || !Array.isArray(items) || items.length === 0) {
        console.warn('⚠️ No items in request');
        return res.status(400).json({ 
          success: false, 
          message: 'Cần có mảng items chứa bài viết' 
        });
      }

      const results = {
        added: 0,
        duplicates: 0,
        errors: 0,
        newPosts: []
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

          // Parse giá
          let price = 0;
          if (item.price) {
            const priceMatch = item.price.replace(/[^\d]/g, '');
            price = parseInt(priceMatch) || 0;
          }

          // Xác định loại bài viết
          let type = 'Unknown';
          const content = (item.fullText || item.title || '').toLowerCase();
          if (content.includes('cần mua') || content.includes('muốn mua') || content.includes('tìm mua') || content.includes('ai bán')) {
            type = 'Buying';
          } else if (content.includes('cần bán') || content.includes('bán gấp') || content.includes('thanh lý') || item.type === 'marketplace') {
            type = 'Selling';
          }

          // Tạo bài viết mới
          const post = new Post({
            title: item.title || (item.fullText?.substring(0, 80) + '...'),
            fullContent: item.fullText || item.title,
            type,
            category: item.keyword || 'Khác',
            platform: 'Facebook',
            sourceType: item.type || 'other',
            url: item.url,
            image: item.image,
            price,
            priceText: item.price,
            author: item.author || 'Unknown',
            authorId: item.uid,
            location: item.location || 'Việt Nam',
            keyword: item.keyword,
            confidence: Math.floor(Math.random() * 20) + 80,
            contentHash
          });

          await post.save();
          results.added++;
          results.newPosts.push(post);

          // Thêm vào Set để tránh trùng trong cùng batch
          if (url) existingUrls.add(url);
          if (contentHash) existingHashes.add(contentHash);

        } catch (err) {
          if (err.code === 11000) { // Duplicate key error
            results.duplicates++;
          } else {
            results.errors++;
            console.error('Save post error:', err.message);
          }
        }
      }

      // 🔥 EMIT SOCKET EVENT - Thông báo có bài viết mới
      if (results.newPosts.length > 0) {
        // Convert Mongoose documents to plain objects
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

        const socketData = {
          count: results.newPosts.length,
          posts: postsData
        };
        
        console.log(`📡 Emitting ${results.newPosts.length} new posts:`, socketData);
        
        // Emit đến room 'posts' và cả broadcast để đảm bảo
        io.to('posts').emit('posts:new', socketData);
        io.emit('posts:new', socketData); // Broadcast to all as backup
        console.log(`✅ Socket emitted to room 'posts' and all clients`);
      } else {
        console.log(`⚠️ No new posts to emit (${results.duplicates} duplicates, ${results.errors} errors)`);
      }

      res.json({
        success: true,
        message: `Đã thêm ${results.added} bài, bỏ qua ${results.duplicates} bài trùng`,
        ...results
      });

    } catch (err) {
      console.error('Add posts error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // PUT /api/posts/:id - Cập nhật bài viết
  // ==========================================
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const post = await Post.findByIdAndUpdate(id, updates, { new: true });

      if (!post) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
      }

      // Emit socket event
      io.emit('posts:updated', { post });

      res.json({ success: true, post });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // DELETE /api/posts/:id - Xóa bài viết
  // ==========================================
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findByIdAndDelete(id);

      if (!post) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
      }

      // Emit socket event
      io.emit('posts:deleted', { id });

      res.json({ success: true, message: 'Đã xóa bài viết' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // DELETE /api/posts - Xóa tất cả bài viết
  // ==========================================
  router.delete('/', async (req, res) => {
    try {
      const result = await Post.deleteMany({});
      
      io.emit('posts:cleared');

      res.json({ 
        success: true, 
        message: `Đã xóa ${result.deletedCount} bài viết` 
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};

