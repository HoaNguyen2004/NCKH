/* 
 * Script để xóa bài đăng của sales users, chỉ giữ lại của admin
 * Chạy: node server/scripts/cleanup-sales-posts.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables nếu có
dotenv.config({ path: path.join(__dirname, '../.env') });

const Post = require('../models/Post');
const User = require('../models/User');

// Kết nối MongoDB (sử dụng cùng connection string như server.js)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quyet:dKsuuAc3ODjC1wVc@cluster0.9mytcrv.mongodb.net/identity_db';

async function cleanupSalesPosts() {
  try {
    console.log('🔌 Đang kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm tất cả user có role = 'sales'
    const salesUsers = await User.find({ role: 'sales' }).select('_id email fullName');
    console.log(`\n🔍 Tìm thấy ${salesUsers.length} sales users:`);
    salesUsers.forEach(u => {
      console.log(`   - ${u.fullName} (${u.email}) - ID: ${u._id}`);
    });

    if (salesUsers.length === 0) {
      console.log('\n✅ Không có sales user nào để xóa bài đăng');
      await mongoose.disconnect();
      return;
    }

    // Lấy danh sách ID và email của sales users
    const salesUserIds = salesUsers.map(u => u._id);
    const salesUserEmails = salesUsers.map(u => u.email.toLowerCase());

    // Đếm số bài đăng của sales trước khi xóa
    const salesPostsCount = await Post.countDocuments({
      $or: [
        { scrapedBy: { $in: salesUserIds } },
        { scrapedByEmail: { $in: salesUserEmails } }
      ]
    });

    console.log(`\n📊 Tìm thấy ${salesPostsCount} bài đăng của sales users`);

    if (salesPostsCount === 0) {
      console.log('\n✅ Không có bài đăng nào của sales để xóa');
      await mongoose.disconnect();
      return;
    }

    // Xóa tất cả bài đăng có scrapedBy hoặc scrapedByEmail thuộc về sales
    const deleteResult = await Post.deleteMany({
      $or: [
        { scrapedBy: { $in: salesUserIds } },
        { scrapedByEmail: { $in: salesUserEmails } }
      ]
    });

    // Đếm số bài đăng còn lại
    const remainingCount = await Post.countDocuments({});

    console.log(`\n✅ Đã xóa ${deleteResult.deletedCount} bài đăng của sales`);
    console.log(`📊 Còn lại ${remainingCount} bài đăng (của admin hoặc không có scrapedBy)`);

    await mongoose.disconnect();
    console.log('\n✅ Hoàn thành!');
  } catch (err) {
    console.error('❌ Lỗi:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Chạy script
cleanupSalesPosts();

