/* server/routes/reports.js */
const express = require('express');
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Message = require('../models/Message');
const SalesLog = require('../models/SalesLog');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/sales/dashboard - Lấy thống kê cho sales dashboard
router.get('/sales/dashboard', requireAuth, requireRole(['sales']), async (req, res) => {
  try {
    const userId = req.user?.id; // Giả sử middleware auth đã set req.user
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Thống kê leads của sales này
    const [myLeads, activeChats, urgentLeads, todayTasks] = await Promise.all([
      Lead.countDocuments({ assignedTo: userId }),
      Message.countDocuments({ 
        leadId: { $in: await Lead.find({ assignedTo: userId }).distinct('_id') },
        read: false,
        sender: 'customer'
      }),
      Lead.find({ 
        assignedTo: userId, 
        priority: 'high',
        status: { $in: ['new', 'contacted'] }
      }).limit(5).populate('interestedProducts'),
      SalesLog.find({ createdBy: userId, createdAt: { $gte: today } }).limit(5)
    ]);

    // Recent chats - lấy messages gần đây
    const recentMessages = await Message.find({
      leadId: { $in: await Lead.find({ assignedTo: userId }).distinct('_id') }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('leadId', 'name');

    const recentChats = recentMessages.reduce((acc, msg) => {
      const leadName = msg.leadId?.name || 'Unknown';
      const existing = acc.find(chat => chat.name === leadName);
      if (!existing) {
        acc.push({
          name: leadName,
          message: msg.text?.substring(0, 30) + '...',
          time: formatTimeAgo(msg.createdAt),
          unread: msg.read ? 0 : 1,
          online: true // Tạm thời
        });
      } else {
        if (!msg.read) existing.unread++;
      }
      return acc;
    }, []).slice(0, 3);

    // Conversion rate
    const totalAssignedLeads = await Lead.countDocuments({ assignedTo: userId });
    const convertedLeads = await Lead.countDocuments({ 
      assignedTo: userId, 
      status: 'converted' 
    });
    const conversionRate = totalAssignedLeads > 0 ? (convertedLeads / totalAssignedLeads * 100) : 0;

    // Calls made today - tạm thời hardcoded
    const callsMade = 28;

    const dashboardData = {
      salesMetrics: [
        {
          label: 'My Leads',
          value: myLeads.toString(),
          change: '+8 today',
          icon: 'Target',
          color: 'blue'
        },
        {
          label: 'Active Chats',
          value: activeChats.toString(),
          change: '3 unread',
          icon: 'MessageSquare',
          color: 'green'
        },
        {
          label: 'Calls Made',
          value: callsMade.toString(),
          change: 'Today',
          icon: 'Phone',
          color: 'purple'
        },
        {
          label: 'Conversion Rate',
          value: `${conversionRate.toFixed(1)}%`,
          change: '+5%',
          icon: 'TrendingUp',
          color: 'pink'
        }
      ],
      urgentLeads: urgentLeads.map(lead => ({
        name: lead.name,
        product: lead.interestedProducts?.[0]?.name || 'Unknown',
        budget: lead.budget || 'Unknown',
        priority: lead.priority,
        lastContact: lead.lastContact ? formatTimeAgo(lead.lastContact) : 'Never',
        status: lead.status,
        phone: lead.phone
      })),
      recentChats,
      todayTasks: todayTasks.map(task => ({
        task: task.customerRequest?.substring(0, 50) + '...' || 'Task',
        time: task.editTime ? new Date(task.editTime).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'Unknown',
        status: task.status
      }))
    };

    return res.json({ success: true, data: dashboardData });
  } catch (err) {
    console.error('Sales dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê sales dashboard' });
  }
});

// GET /api/reports/admin/dashboard - Lấy thống kê cho admin dashboard
router.get('/admin/dashboard', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Thống kê users
    const [totalUsers, activeUsers, newUsersToday, newUsersMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: lastMonth } })
    ]);

    // Thống kê posts
    const [totalPosts, postsToday, postsMonth] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ createdAt: { $gte: today } }),
      Post.countDocuments({ createdAt: { $gte: lastMonth } })
    ]);

    // Thống kê leads
    const [totalLeads, leadsToday, leadsMonth] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ createdAt: { $gte: lastMonth } })
    ]);

    // API calls - tạm thời hardcoded vì không có log
    const apiCalls = 12400;
    const apiCallsChange = '+18%';

    // System uptime - tạm thời hardcoded
    const systemUptime = '99.9%';
    const uptimeChange = '+0.1%';

    // Recent activities - lấy từ posts và leads gần đây
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'fullName');

    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'fullName');

    const recentActivities = [
      ...recentPosts.map(post => ({
        user: post.createdBy?.fullName || 'Unknown',
        action: `Created post: ${post.title?.substring(0, 30)}...`,
        time: formatTimeAgo(post.createdAt),
        type: 'success'
      })),
      ...recentLeads.map(lead => ({
        user: lead.createdBy?.fullName || 'Unknown',
        action: `Created lead: ${lead.name}`,
        time: formatTimeAgo(lead.createdAt),
        type: 'info'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    const dashboardData = {
      systemStats: [
        {
          label: 'Total Users',
          value: totalUsers.toString(),
          change: `+${newUsersToday} today`,
          icon: 'Users',
          color: 'blue'
        },
        {
          label: 'Active Sessions',
          value: activeUsers.toString(),
          change: '+5%',
          icon: 'Activity',
          color: 'green'
        },
        {
          label: 'API Calls',
          value: apiCalls.toString(),
          change: apiCallsChange,
          icon: 'Database',
          color: 'purple'
        },
        {
          label: 'System Uptime',
          value: systemUptime,
          change: uptimeChange,
          icon: 'TrendingUp',
          color: 'pink'
        }
      ],
      systemHealth: [
        { component: 'AI Model Server', status: 'healthy', uptime: '99.99%', response: '45ms' },
        { component: 'Database', status: 'healthy', uptime: '99.95%', response: '12ms' },
        { component: 'API Gateway', status: 'healthy', uptime: '99.98%', response: '8ms' },
        { component: 'Cache Server', status: 'warning', uptime: '98.50%', response: '125ms' }
      ],
      recentActivities
    };

    return res.json({ success: true, data: dashboardData });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê admin dashboard' });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

// GET /api/reports/dashboard - Lấy thống kê cho dashboard
router.get('/dashboard', requireAuth, requireRole(['manager']), async (req, res) => {
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
