/* server/routes/reports.js */
const express = require('express');
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const Lead = require('../models/Lead');

const router = express.Router();

// GET /api/reports/dashboard - Lấy thống kê cho dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { range = 'month' } = req.query;

    // Tính khoảng thời gian
    const now = new Date();
    let startDate;

    switch (range) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Thống kê bài đăng
    const [totalPosts, buyingPosts, sellingPosts, facebookPosts, todayPosts] = await Promise.all([
      Post.countDocuments({ createdAt: { $gte: startDate } }),
      Post.countDocuments({ type: 'Buying', createdAt: { $gte: startDate } }),
      Post.countDocuments({ type: 'Selling', createdAt: { $gte: startDate } }),
      Post.countDocuments({ platform: 'Facebook', createdAt: { $gte: startDate } }),
      Post.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } })
    ]);

    // Thống kê leads
    const totalLeads = await Lead.countDocuments({ createdAt: { $gte: startDate } });
    const convertedLeads = await Lead.countDocuments({
      status: 'converted',
      createdAt: { $gte: startDate }
    });
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100) : 0;

    // Thống kê team
    const totalUsers = await User.countDocuments();
    const salesUsers = await User.countDocuments({ role: 'sales' });

    // Tính doanh thu (từ posts đã bán - tạm thời tính từ giá của posts selling)
    const soldPosts = await Post.find({
      type: 'Selling',
      createdAt: { $gte: startDate }
    }).select('price');

    const totalRevenue = soldPosts.reduce((sum, post) => sum + (post.price || 0), 0);

    // Tính doanh thu tháng trước để so sánh
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthPosts = await Post.find({
      type: 'Selling',
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
    }).select('price');

    const lastMonthRevenue = lastMonthPosts.reduce((sum, post) => sum + (post.price || 0), 0);
    const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

    // Thống kê sản phẩm phổ biến
    const productStats = await Post.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalValue: { $sum: '$price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = productStats.map(item => ({
      product: item._id || 'Khác',
      posts: item.count,
      avgPrice: Math.round(item.avgPrice || 0),
      totalValue: item.totalValue || 0
    }));

    // Thống kê team performance
    const teamStats = await User.aggregate([
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'assignedTo',
          as: 'assignedLeads'
        }
      },
      {
        $project: {
          fullName: 1,
          role: 1,
          assignedLeadsCount: { $size: '$assignedLeads' },
          convertedLeadsCount: {
            $size: {
              $filter: {
                input: '$assignedLeads',
                cond: { $eq: ['$$this.status', 'converted'] }
              }
            }
          }
        }
      },
      { $match: { role: 'sales' } },
      { $sort: { assignedLeadsCount: -1 } },
      { $limit: 4 }
    ]);

    const teamPerformance = teamStats.map(user => ({
      name: user.fullName,
      role: 'Sales Staff',
      leads: user.assignedLeadsCount,
      converted: user.convertedLeadsCount,
      revenue: '0', // Tạm thời để 0, có thể tính từ leads converted
      performance: user.convertedLeadsCount > 10 ? 'excellent' :
                   user.convertedLeadsCount > 5 ? 'good' : 'average'
    }));

    const dashboardStats = {
      businessMetrics: [
        {
          label: 'Doanh thu',
          value: `₫${(totalRevenue / 1000000).toFixed(1)}M`,
          change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
          icon: 'DollarSign',
          color: 'green'
        },
        {
          label: 'Tổng leads',
          value: totalLeads.toString(),
          change: '+15%', // Có thể tính so với tháng trước
          icon: 'Target',
          color: 'blue'
        },
        {
          label: 'Tỷ lệ chuyển đổi',
          value: `${conversionRate.toFixed(1)}%`,
          change: '+5%', // Có thể tính so với tháng trước
          icon: 'TrendingUp',
          color: 'purple'
        },
        {
          label: 'Thành viên team',
          value: salesUsers.toString(),
          change: '+2',
          icon: 'Users',
          color: 'pink'
        }
      ],
      productTrends: topProducts.map(product => ({
        product: product.product,
        demand: product.posts > 50 ? 'high' : product.posts > 20 ? 'medium' : 'low',
        posts: product.posts,
        avgPrice: `₫${(product.avgPrice / 1000000).toFixed(1)}M`,
        trend: 'stable' // Có thể tính trend dựa trên dữ liệu thời gian
      })),
      teamPerformance,
      summary: {
        totalPosts,
        buyingPosts,
        sellingPosts,
        facebookPosts,
        todayPosts,
        totalLeads,
        conversionRate,
        totalRevenue,
        revenueChange
      }
    };

    return res.json({ success: true, data: dashboardStats });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê dashboard' });
  }
});

// GET /api/reports - Lấy tất cả báo cáo
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().populate('exportedBy', 'fullName email');
    return res.json({ success: true, reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/reports/:id - Lấy chi tiết báo cáo
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('exportedBy', 'fullName email');
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    return res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/reports - Tạo báo cáo mới
router.post('/', async (req, res) => {
  try {
    const { title, type, dateRange, data, exportedBy } = req.body;

    if (!title || !type || !dateRange) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const report = await Report.create({
      title,
      type,
      dateRange,
      data: data || {},
      exportedBy: exportedBy || null
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo báo cáo thành công',
      report
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// DELETE /api/reports/:id - Xóa báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    
    return res.json({ success: true, message: 'Xóa báo cáo thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
